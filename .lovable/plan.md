

# Migracao de Planos e Pagamentos: Cakto para Stripe

## Visao Geral

Migrar completamente o sistema de assinaturas da Cakto para o Stripe, reestruturando os planos com pricing baseado em uso (imoveis excedentes) e cobranca recorrente automatica.

## Novos Planos

| Plano | Preco | Limite | Extra/imovel | Stripe Price ID |
|-------|-------|--------|-------------|-----------------|
| Free (starter) | R$ 0 | 2 | -- | Sem subscription |
| Starter | R$ 49/mes | 15 | R$ 3,50 | Criado via Stripe tool |
| Pro (Popular) | R$ 79/mes | 30 | R$ 3,00 | Criado via Stripe tool |
| Plus | R$ 129/mes | 60 | R$ 2,50 | Criado via Stripe tool |
| Enterprise | Sob consulta | Ilimitado | R$ 2,00 (base contratual) | Manual/custom |

**Nota importante sobre o enum:** O enum `subscription_plan` atual tem `starter, pro, enterprise, plus`. Precisaremos renomear `starter` para `free` e adicionar o novo `starter` (R$49), ou manter `starter` como Free e usar um novo valor. A abordagem mais segura e adicionar `free` ao enum e migrar os registros existentes de `starter` para `free`.

## Fases de Implementacao

### Fase 1: Habilitar Stripe e Configurar Produtos

1. Habilitar integracao Stripe via ferramenta nativa do Lovable
2. Criar produtos e precos no Stripe:
   - **ImobiSmart Starter** - R$ 49/mes (subscription) + R$ 3,50/imovel (metered)
   - **ImobiSmart Pro** - R$ 79/mes (subscription) + R$ 3,00/imovel (metered)
   - **ImobiSmart Plus** - R$ 129/mes (subscription) + R$ 2,50/imovel (metered)
3. Configurar Stripe Webhooks automaticamente

### Fase 2: Atualizar Banco de Dados

**Migration SQL:**
- Adicionar `free` ao enum `subscription_plan`
- Migrar todos os registros `starter` para `free`
- Adicionar novo valor `starter` ao enum (agora representa R$49)
- Adicionar colunas a tabela `subscriptions`:
  - `stripe_customer_id` (text, nullable)
  - `stripe_subscription_id` (text, nullable)
  - `extra_properties_count` (integer, default 0)
  - `extra_properties_amount` (numeric, default 0)
- Adicionar colunas a tabela `plans`:
  - `extra_property_price` (numeric, nullable) -- preco por imovel extra
  - `stripe_price_id` (text, nullable)
  - `stripe_metered_price_id` (text, nullable)
- Atualizar dados da tabela `plans` com os novos valores e precos
- Atualizar o trigger de criacao de perfil para usar `free` em vez de `starter`

### Fase 3: Edge Functions - Backend Stripe

1. **`stripe-webhook`** (nova) - Processar eventos do Stripe:
   - `checkout.session.completed` - Ativar assinatura
   - `invoice.paid` - Confirmar pagamento
   - `invoice.payment_failed` - Marcar como inadimplente
   - `customer.subscription.deleted` - Cancelar/downgrade para Free
   - `customer.subscription.updated` - Atualizar plano

2. **`create-stripe-checkout`** (nova) - Criar sessao de checkout:
   - Recebe `planId` do frontend
   - Cria ou busca Stripe Customer pelo email
   - Cria Checkout Session com o price correto
   - Retorna URL do checkout

3. **`create-stripe-portal`** (nova) - Portal de gerenciamento:
   - Cria sessao do Customer Portal do Stripe
   - Permite trocar cartao, ver faturas, cancelar

4. **`report-usage`** (nova) - Reportar imoveis excedentes:
   - Executada periodicamente (ou via cron/scheduled)
   - Conta imoveis ativos por usuario
   - Se excede limite do plano, reporta usage ao Stripe via metered billing
   - Stripe inclui automaticamente na proxima fatura

5. **Remover/deprecar:**
   - `cakto-webhook` (manter temporariamente para transicao)
   - `cancel-cakto-subscription` (substituido pelo Stripe Portal)

### Fase 4: Frontend - Atualizacoes de UI

1. **`src/hooks/useUserData.ts`**
   - Atualizar tipos para incluir `free` no SubscriptionPlan
   - Adicionar flags: `isFree`, atualizar `isStarter` (agora R$49)
   - Adicionar campos de excedentes ao retorno

2. **`src/hooks/usePlans.ts`**
   - Adicionar campo `extra_property_price` ao tipo Plan
   - Funcao para calcular custo de excedentes

3. **`src/hooks/usePropertyLimit.ts`**
   - Remover bloqueio hard -- permitir adicionar alem do limite
   - Calcular `excessCount` e `estimatedExtraCost`
   - Retornar esses valores para exibicao no painel

4. **`src/pages/Plans.tsx`**
   - Atualizar grid para 5 planos (Free, Starter, Pro, Plus, Enterprise)
   - Exibir "Imoveis adicionais a partir de R$ X/mes" em cada card
   - Destacar Pro como "Mais Popular"
   - Botoes redirecionam para Stripe Checkout (em vez de Cakto)
   - Atualizar tabela comparativa

5. **`src/components/landing/PricingSection.tsx`**
   - Mesmas atualizacoes dos cards de preco
   - Exibir preco de imovel extra

6. **`src/pages/Subscription.tsx`**
   - Substituir referencia "Cakto" por "Stripe"
   - Adicionar botao "Gerenciar Pagamento" que abre Stripe Portal
   - Exibir secao de excedentes: limite, usados, extras, custo estimado
   - Cancelamento via Stripe Portal (nao mais via edge function propria)

7. **`src/components/dashboard/`** (novo componente)
   - Card no dashboard mostrando: "15/15 imoveis (3 extras - ~R$10,50/mes)"
   - Banner informativo quando ha excedentes

8. **`src/components/properties/PropertyLimitBanner.tsx`**
   - Atualizar de "bloqueio" para "aviso informativo"
   - Mostrar custo extra estimado em vez de impedir criacao

9. **`src/components/settings/PlanComparison.tsx`**
   - Atualizar para refletir novos planos

### Fase 5: Calculo de Excedentes

Logica centralizada em um hook `usePropertyUsage`:

```text
+-------------------+
| Conta imoveis     |
| ativos do usuario |
+--------+----------+
         |
         v
+-------------------+
| Compara com       |
| limite do plano   |
+--------+----------+
         |
    excedentes?
    /         \
  Nao         Sim
   |           |
   v           v
  OK     Calcula:
         excess = ativos - limite
         custo = excess * preco_extra
         Exibe no painel
         Reporta ao Stripe
```

### Fase 6: Migracao de Usuarios Existentes

- Usuarios no plano `starter` (agora `free`) continuam sem cobranca
- Usuarios `pro` e `plus` (pagos via Cakto):
  - Criar Stripe Customer com mesmo email
  - Criar subscription no Stripe
  - Atualizar `stripe_customer_id` e `stripe_subscription_id` no banco
  - Cancelar na Cakto manualmente
- Comunicar usuarios sobre a mudanca via email

## Arquivos Modificados

| Arquivo | Acao |
|---------|------|
| `src/hooks/useUserData.ts` | Atualizar tipos e flags |
| `src/hooks/usePlans.ts` | Adicionar campos de extra pricing |
| `src/hooks/usePropertyLimit.ts` | Remover bloqueio, calcular excedentes |
| `src/hooks/useSubscription.ts` | Apontar para Stripe |
| `src/pages/Plans.tsx` | Redesign com 5 planos + Stripe checkout |
| `src/pages/Subscription.tsx` | Stripe Portal + secao excedentes |
| `src/components/landing/PricingSection.tsx` | Novos cards de preco |
| `src/components/settings/PlanComparison.tsx` | Atualizar comparativo |
| `src/components/properties/PropertyLimitBanner.tsx` | Aviso em vez de bloqueio |
| `src/components/common/UpgradeOverlay.tsx` | Ajustar tiers |

## Novos Arquivos

| Arquivo | Descricao |
|---------|-----------|
| `supabase/functions/stripe-webhook/index.ts` | Webhook do Stripe |
| `supabase/functions/create-stripe-checkout/index.ts` | Criar sessao de checkout |
| `supabase/functions/create-stripe-portal/index.ts` | Portal de gerenciamento |
| `supabase/functions/report-usage/index.ts` | Reportar excedentes ao Stripe |
| `src/hooks/usePropertyUsage.ts` | Hook de calculo de excedentes |

## Secrets Necessarios

- `STRIPE_SECRET_KEY` - Chave secreta do Stripe (coletada ao habilitar integracao)
- `STRIPE_WEBHOOK_SECRET` - Secret do webhook (configurado automaticamente)

## Riscos e Mitigacoes

- **Dupla cobranca durante transicao**: Manter Cakto webhook ativo ate migrar todos os usuarios
- **Enum rename (starter -> free)**: Migration cuidadosa com update em cascata em todas as tabelas e funcoes que referenciam `starter`
- **Metered billing timing**: O report-usage precisa rodar antes do fechamento da fatura do Stripe (configurar via pg_cron ou Stripe billing anchor)

