

# Correcao Completa do Sistema de Planos e Pagamentos

## Problemas Identificados

### 1. Confusao entre "free" e "starter"
O banco de dados possui os enums `free` e `starter` como planos distintos:
- **free**: 2 imoveis, R$0 (plano gratuito real)
- **starter**: 15 imoveis, R$49 (plano pago)

Porem o codigo trata `starter` como se fosse o plano gratuito em varios lugares:
- `useUserData.ts`: `const plan = subscription?.plan || 'starter'` (deveria ser `'free'`)
- `cancel-cakto-subscription`: reverte para `starter` em vez de `free`
- `Subscription.tsx`: `canCancel = currentPlan !== 'starter'` (deveria ser `!== 'free'`)
- `Plans.tsx`: trata `starter` como downgrade sem pagamento
- Labels mapeiam `starter` como "Gratuito" quando na verdade custa R$49

### 2. Checkout links incompletos
O `handleSelectPlan` em `Plans.tsx` so redireciona para Cakto nos planos `pro` e `plus`. O plano `starter` (R$49) tambem tem `checkout_url` configurado mas nao e tratado.

### 3. Enterprise sem fluxo de vinculacao
Nao ha como o admin vincular um cliente Enterprise a um produto especifico da Cakto. O `EditSubscriptionDialog` permite trocar plano/status manualmente mas nao tem campo para `checkout_url` customizado ou `external_subscription_id`.

### 4. Downgrade para Free nao arquiva imoveis
Quando um usuario faz downgrade para o plano Free (2 imoveis), os imoveis excedentes deveriam ser arquivados automaticamente.

---

## Plano de Implementacao

### Etapa 1: Corrigir mapeamento de planos no codigo

**Arquivos:** `useUserData.ts`, `useSubscription.ts`, `Subscription.tsx`, `Plans.tsx`, `PlanComparison.tsx`, `admin/ClientDetails.tsx`, `admin/Clients.tsx`, `EditSubscriptionDialog.tsx`, `PaymentHistory.tsx`

Alteracoes:
- Default de plano passa de `'starter'` para `'free'`
- Labels atualizados: `free` = "Gratuito", `starter` = "Starter"
- `canCancel` verifica `!== 'free'` em vez de `!== 'starter'`
- `isPaid` inclui `starter` como plano pago
- `PLAN_OPTIONS` no admin inclui `free`

### Etapa 2: Corrigir checkout em Plans.tsx

O `handleSelectPlan` sera refatorado:
- **Free (downgrade)**: executa o fluxo de downgrade com arquivamento
- **Starter / Pro / Plus**: redireciona para `checkout_url` da tabela `plans`
- **Enterprise**: abre WhatsApp (manter comportamento atual)

### Etapa 3: Criar Edge Function `downgrade-to-free`

Nova Edge Function que:
1. Valida autenticacao do usuario
2. Atualiza subscription para `plan: 'free'`, `status: 'active'`
3. Busca imoveis ativos do usuario, ordenados por `created_at DESC`
4. Arquiva todos os imoveis alem do limite (2), mantendo os 2 mais recentes
5. Retorna quantos imoveis foram arquivados

### Etapa 4: Corrigir `cancel-cakto-subscription`

Alterar o plano de fallback de `starter` para `free` e tambem arquivar imoveis excedentes (reutilizando a mesma logica).

### Etapa 5: Corrigir `cakto-webhook`

Alterar o plano de fallback de `starter` para `free` quando ocorre cancelamento/reembolso.

### Etapa 6: Melhorar EditSubscriptionDialog para Enterprise

Adicionar campo opcional `external_subscription_id` (ID do produto Cakto) e `checkout_url` customizado para o admin poder vincular um cliente Enterprise a um produto especifico. Tambem adicionar campo de `payer_email` para rastreabilidade.

### Etapa 7: Adicionar confirmacao de downgrade na UI

Em `Plans.tsx`, quando o usuario clicar em "Fazer Downgrade" para Free:
- Mostrar `AlertDialog` explicando que imoveis excedentes serao arquivados
- Informar quantos imoveis serao mantidos vs arquivados
- Ao confirmar, chamar a Edge Function `downgrade-to-free`

---

## Detalhes Tecnicos

### Nova Edge Function: `downgrade-to-free`

```text
POST /downgrade-to-free
Authorization: Bearer <user_token>

Response:
{
  "success": true,
  "archived_count": 5,
  "kept_count": 2,
  "message": "Downgrade realizado. 5 imoveis foram arquivados."
}
```

Logica SQL para arquivar excedentes:
- Buscar imoveis com `is_archived = false` do usuario
- Ordenar por `created_at DESC`
- Manter os 2 primeiros, arquivar o restante

### Tabela de mapeamento corrigida

| Plano ID | Nome na UI | Preco | Limite | Checkout |
|----------|-----------|-------|--------|----------|
| free | Gratuito | R$ 0 | 2 | -- |
| starter | Starter | R$ 49 | 15 | Cakto link |
| pro | Pro | R$ 79 | 30 | Cakto link |
| plus | Plus | R$ 129 | 60 | Cakto link |
| enterprise | Enterprise | Sob consulta | Ilimitado | Admin vincula |

### Arquivos criados/modificados

| Arquivo | Tipo |
|---------|------|
| `supabase/functions/downgrade-to-free/index.ts` | **Novo** |
| `supabase/functions/cancel-cakto-subscription/index.ts` | Corrigir plan para `free` |
| `supabase/functions/cakto-webhook/index.ts` | Corrigir plan fallback para `free` |
| `src/hooks/useUserData.ts` | Default `free`, flags corrigidas |
| `src/hooks/useSubscription.ts` | Labels e logica |
| `src/pages/Plans.tsx` | Checkout para starter, downgrade flow |
| `src/pages/Subscription.tsx` | Labels, canCancel, isPaid |
| `src/components/settings/PlanComparison.tsx` | Labels corrigidos |
| `src/components/admin/EditSubscriptionDialog.tsx` | Campos Enterprise |
| `src/pages/admin/Clients.tsx` | Label free |
| `src/pages/admin/ClientDetails.tsx` | Label free |
| `src/components/subscription/PaymentHistory.tsx` | Default free |
| `src/components/landing/PricingSection.tsx` | CTA link corrigido |

