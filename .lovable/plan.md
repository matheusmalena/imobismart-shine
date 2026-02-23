

# Finalizar Fluxo de Upgrade/Downgrade Funcional

## Problema Atual

O `create-stripe-checkout` sempre cria uma **nova** assinatura. Para usuarios que ja possuem um plano pago e querem trocar (upgrade ou downgrade), o sistema precisa **atualizar** a assinatura existente no Stripe em vez de criar outra.

Alem disso, o botao "Fazer Downgrade" para o plano Free esta desabilitado. O usuario precisa de um caminho claro para cancelar/downgrade.

---

## Solucao

### 1. Criar Edge Function `change-plan` (novo arquivo)

**Arquivo:** `supabase/functions/change-plan/index.ts`

Logica:
1. Receber `planId` do frontend
2. Buscar a subscription do usuario no banco (com `stripe_subscription_id`)
3. Se o usuario **nao tem** subscription ativa no Stripe -> redirecionar para `create-stripe-checkout` (novo assinante)
4. Se o usuario **ja tem** subscription ativa:
   - Se o novo plano e `free` -> cancelar a subscription no Stripe (`stripe.subscriptions.cancel()`) e o webhook cuida do downgrade
   - Se o novo plano e pago -> usar `stripe.subscriptions.update()` para trocar o price_id, com `proration_behavior: 'create_prorations'` (cobra proporcional)
5. Retornar o resultado ao frontend

### 2. Atualizar `src/pages/Plans.tsx`

Modificar `handleSelectPlan`:
- Se o usuario ja tem um plano pago (`subscription?.stripe_subscription_id` existe):
  - Chamar a nova edge function `change-plan` em vez de `create-stripe-checkout`
  - Para downgrade para Free: mostrar confirmacao antes de cancelar
  - Para upgrade/downgrade entre planos pagos: chamar `change-plan` que faz a troca instantanea
- Se o usuario nao tem subscription (plano Free sem Stripe): continuar usando `create-stripe-checkout`
- Habilitar o botao do plano Free para permitir downgrade (com dialog de confirmacao)

### 3. Adicionar Dialog de Confirmacao de Downgrade

Criar um dialog simples que aparece quando o usuario clica em "Fazer Downgrade" para o Free:
- Aviso: "Ao cancelar, voce mantem acesso ate o fim do periodo pago. Depois, sua conta volta para o plano Free com limite de 2 imoveis."
- Botoes: "Cancelar" / "Confirmar Downgrade"

### 4. Atualizar `useSubscription` hook

Adicionar campo `stripe_subscription_id` ao tipo `Subscription` para que o frontend saiba se o usuario ja tem uma subscription ativa no Stripe.

---

## Fluxo Resultante

```text
Usuario clica em plano
        |
        v
  Tem subscription Stripe?
   /              \
 NAO              SIM
  |                |
  v                v
create-stripe    Qual plano?
-checkout        /        \
(novo)        Free      Pago
               |          |
               v          v
          Dialog de    change-plan
          confirmar    (update sub)
               |          |
               v          v
          cancel sub   Troca
          via Stripe   instantanea
```

---

## Detalhes Tecnicos

### Edge Function `change-plan`

| Campo | Descricao |
|-------|-----------|
| Input | `{ planId: string }` |
| Auth | Bearer token do usuario |
| Acoes | Busca subscription no DB, busca `stripe_price_id` do novo plano, atualiza no Stripe |
| Output | `{ success: true, action: 'updated' | 'cancelled' }` |

### Alteracoes no `stripe-webhook`

O webhook ja trata `customer.subscription.updated` e `customer.subscription.deleted`, entao upgrades/downgrades e cancelamentos serao sincronizados automaticamente no banco.

### Proration (cobranca proporcional)

Ao fazer upgrade de Starter (R$49) para Pro (R$79) no meio do mes, o Stripe calcula automaticamente:
- Credito pelo tempo restante do Starter
- Cobranca proporcional do Pro
- Diferenca cobrada na proxima fatura

### Arquivos modificados/criados

| Arquivo | Tipo |
|---------|------|
| `supabase/functions/change-plan/index.ts` | Novo |
| `src/pages/Plans.tsx` | Modificado - logica de handleSelectPlan |
| `src/hooks/useSubscription.ts` | Modificado - adicionar stripe_subscription_id |

