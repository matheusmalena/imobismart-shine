

# Migrar de Stripe para Asaas

## Resumo

Substituir toda a integracao com Stripe pela plataforma Asaas, que e brasileira e ja suporta PIX, Boleto e Cartao de Credito nativamente -- sem necessidade de aprovacao pendente de metodos de pagamento.

---

## O que muda para o usuario

- O checkout passa a ser feito via **Asaas Checkout** (link gerado pela API), com opcoes de **PIX, Boleto e Cartao**
- O portal de gerenciamento de pagamento (Stripe Billing Portal) sera substituido por uma pagina interna que exibe status da assinatura
- Webhooks do Asaas substituem os do Stripe para sincronizar pagamentos

---

## Arquitetura da Migracao

### Edge Functions a criar/reescrever

| Funcao | Acao |
|--------|------|
| `create-asaas-checkout` (nova) | Cria customer no Asaas + cria subscription com checkout link |
| `asaas-webhook` (nova) | Recebe eventos `PAYMENT_RECEIVED`, `PAYMENT_CREATED`, `SUBSCRIPTION_DELETED`, etc. |
| `change-plan` (reescrever) | Atualiza subscription no Asaas via `PUT /v3/subscriptions/{id}` ou cancela |
| `check-subscription` (reescrever) | Consulta subscription no Asaas via API em vez do Stripe |

### Edge Functions a remover

| Funcao | Motivo |
|--------|--------|
| `create-stripe-checkout` | Substituida por `create-asaas-checkout` |
| `create-stripe-portal` | Asaas nao tem portal de billing; gerenciamento sera interno |
| `stripe-webhook` | Substituida por `asaas-webhook` |

### Edge Functions que permanecem iguais

- `report-usage` -- sera adaptada para registrar excedentes no Asaas (ou apenas no banco, pois Asaas nao tem metered billing nativo)
- `cakto-webhook`, `cancel-cakto-subscription` -- mantidos como legado

---

## Detalhes Tecnicos

### 1. Secret necessario

- `ASAAS_API_KEY`: chave de API do Asaas (obtida em Integracoes > Chaves API no painel Asaas)
- Ambiente: `https://api.asaas.com` (producao) ou `https://api-sandbox.asaas.com` (sandbox)

### 2. Banco de dados

Migrar colunas na tabela `subscriptions`:
- Renomear `stripe_customer_id` -> manter e adicionar `asaas_customer_id` (text)
- Renomear `stripe_subscription_id` -> manter e adicionar `asaas_subscription_id` (text)

Migrar colunas na tabela `plans`:
- `stripe_price_id` -> manter e adicionar `asaas_value` (ja existe como `price`)
- `stripe_metered_price_id` -> nao necessario (Asaas nao tem metered billing nativo; excedentes serao cobrados via cobranca avulsa)

### 3. `create-asaas-checkout` (nova Edge Function)

```text
POST /v3/customers  (criar customer com email/cpf)
POST /v3/subscriptions  (criar subscription mensal)
  - customer: asaas_customer_id
  - billingType: "UNDEFINED" (permite PIX, Boleto, Cartao)
  - value: plan.price
  - cycle: "MONTHLY"
  - nextDueDate: hoje
  - externalReference: user_id + plan_id
Retorna: first payment link ou checkout URL
```

### 4. `asaas-webhook` (nova Edge Function)

Eventos tratados:
- `PAYMENT_RECEIVED` / `PAYMENT_CONFIRMED`: ativa subscription no banco
- `PAYMENT_OVERDUE`: marca como inativa
- `SUBSCRIPTION_DELETED` / `SUBSCRIPTION_INACTIVATED`: downgrade para free
- `SUBSCRIPTION_UPDATED`: atualiza plano

Seguranca: validar via `asaas-access-token` header ou webhook token

### 5. `change-plan` (reescrever)

- Para upgrade/downgrade entre planos pagos: `PUT /v3/subscriptions/{id}` com novo `value`
- Para downgrade para free: `DELETE /v3/subscriptions/{id}` (remove subscription no Asaas)
- Se nao tem subscription: redirecionar para `create-asaas-checkout`

### 6. Frontend

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/Plans.tsx` | Trocar invocacao de `create-stripe-checkout` por `create-asaas-checkout`; trocar `change-plan` para nova versao |
| `src/pages/Subscription.tsx` | Remover botao "Gerenciar Pagamento" (portal Stripe); substituir por info interna |
| `src/hooks/useSubscription.ts` | Trocar `stripe_subscription_id` por `asaas_subscription_id` na interface |
| `src/hooks/useUserData.ts` | Idem |
| `src/components/subscription/PaymentHistory.tsx` | Remover referencia a "painel da Cakto" |
| `supabase/config.toml` | Adicionar `asaas-webhook` com `verify_jwt = false` |

### 7. Excedentes de imoveis

Como o Asaas nao tem "metered billing" nativo, a estrategia sera:
- O `report-usage` calcula excedentes como ja faz
- Em vez de reportar ao Stripe, cria uma **cobranca avulsa** no Asaas (`POST /v3/payments`) com o valor dos imoveis extras
- Ou: simplesmente registra no banco e soma na proxima fatura da subscription (manual)

### 8. Limpeza

- Remover imports de `Stripe` de todas as Edge Functions migradas
- O secret `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` podem ser mantidos por seguranca mas nao serao mais usados
- Deletar as Edge Functions `create-stripe-checkout`, `create-stripe-portal`, `stripe-webhook` apos confirmar que tudo funciona

