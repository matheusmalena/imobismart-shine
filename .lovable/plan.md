

# Migrar Sistema de Pagamento: Cakto → Kirvano (com Add-ons de Imoveis)

## Resumo

Substituir toda a integracao com Cakto por Kirvano, mantendo os 5 planos existentes e adicionando suporte a **pacotes extras de imoveis** (add-ons recorrentes). O limite total do usuario passa a ser: limite do plano + soma dos pacotes ativos.

---

## Estrutura de Planos e Add-ons

```text
PLANOS (assinatura recorrente Kirvano):
┌──────────────┬──────────┬────────┐
│ Plano        │ Preco    │ Limite │
├──────────────┼──────────┼────────┤
│ Free         │ R$ 0     │ 2      │
│ Starter      │ R$ 49/m  │ 15     │
│ Pro          │ R$ 79/m  │ 30     │
│ Plus         │ R$ 129/m │ 60     │
│ Enterprise   │ Consulta │ -1     │
└──────────────┴──────────┴────────┘

ADD-ONS (produtos extras recorrentes na Kirvano):
┌──────────────────────┬──────────┬────────────┐
│ Pacote               │ Preco    │ Imoveis    │
├──────────────────────┼──────────┼────────────┤
│ Pacote +10 imoveis   │ R$ 29/m  │ +10        │
│ Pacote +25 imoveis   │ R$ 59/m  │ +25        │
│ Pacote +50 imoveis   │ R$ 99/m  │ +50        │
└──────────────────────┴──────────┴────────────┘

Limite total = limite_plano + SUM(addon_properties)
```

---

## 1. Banco de Dados

### 1a. Nova tabela: `subscription_addons`

Armazena os pacotes extras ativos de cada usuario.

```sql
CREATE TABLE public.subscription_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  addon_name TEXT NOT NULL,          -- ex: "Pacote +10 imóveis"
  addon_properties INTEGER NOT NULL, -- 10, 25, ou 50
  addon_price NUMERIC NOT NULL DEFAULT 0,
  kirvano_product_id TEXT,           -- ID do produto na Kirvano
  kirvano_subscription_id TEXT,      -- ID da assinatura do addon
  status TEXT NOT NULL DEFAULT 'active',  -- active, cancelled
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: usuario ve seus proprios addons, admin ve todos
ALTER TABLE public.subscription_addons ENABLE ROW LEVEL SECURITY;
-- + policies para SELECT (user_id = auth.uid()), admin full access
```

### 1b. Alterar tabela `subscriptions`

Adicionar colunas para Kirvano (substituindo Cakto):

```sql
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS kirvano_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS kirvano_customer_id TEXT;
```

O campo `payment_method` existente sera atualizado de `'cakto'` para `'kirvano'`.

### 1c. Atualizar tabela `plans`

Atualizar `checkout_url` de cada plano para apontar para os links da Kirvano (feito via admin ou migration).

---

## 2. Edge Function: `kirvano-webhook`

Nova Edge Function substituindo `cakto-webhook`. Recebe eventos POST da Kirvano.

**Logica principal:**

1. Validar secret via header (`x-webhook-secret` ou `Authorization`) usando `KIRVANO_WEBHOOK_SECRET`
2. Extrair email do comprador, evento, e nome/ID do produto
3. Identificar se e um **plano** ou **add-on** pelo nome do produto:
   - Se contem "starter/pro/plus/enterprise" → atualizar `subscriptions.plan`
   - Se contem "pacote" ou "+10/+25/+50" → inserir/atualizar em `subscription_addons`
4. Eventos tratados:
   - `purchase_approved` / `payment_confirmed` / `subscription_active` → ativar plano ou addon
   - `subscription_cancelled` / `refund` / `chargeback` → cancelar plano (downgrade p/ free) ou desativar addon
5. Fallback enterprise via `enterprise_checkout_links` (manter logica existente)

**Secret necessario:** `KIRVANO_WEBHOOK_SECRET` (novo, a ser configurado)

---

## 3. Atualizar `usePropertyLimit` (calculo de limite)

O hook passara a considerar addons ativos:

```text
limite_total = limite_do_plano + SUM(addons ativos)
```

Isso requer:
- Novo hook `useSubscriptionAddons` para buscar addons do usuario
- Alterar `usePropertyLimit` para somar addons

---

## 4. Atualizar `useUserData`

Adicionar campo `addons` ao retorno, buscando `subscription_addons` em paralelo com profile/subscription/role.

---

## 5. Atualizar UI

### 5a. Pagina `/plans` (Plans.tsx)

- Atualizar `checkout_url` dos planos para links Kirvano
- Abaixo dos cards de plano, adicionar secao **"Pacotes Extras de Imoveis"** com 3 cards dos add-ons
- Cada add-on tem botao que redireciona para o checkout do add-on na Kirvano
- Exibir quais add-ons o usuario ja tem ativos

### 5b. Pagina `/subscription` (Subscription.tsx)

- Trocar referencias "Cakto" → "Kirvano"
- Adicionar secao mostrando:
  - Plano base + imoveis incluidos
  - Pacotes add-on ativos (com opcao de cancelar)
  - **Limite total** (plano + addons)
  - Status da assinatura

### 5c. `PaymentHistory.tsx`

- Trocar "painel da Cakto" → "painel da Kirvano"

### 5d. Landing page `PricingSection.tsx`

- Adicionar secao de add-ons abaixo dos planos

---

## 6. Edge Functions a Atualizar/Remover

| Arquivo | Acao |
|---------|------|
| `supabase/functions/kirvano-webhook/index.ts` | **Criar** (novo webhook Kirvano) |
| `supabase/functions/cakto-webhook/index.ts` | **Remover** |
| `supabase/functions/cancel-cakto-subscription/index.ts` | **Substituir** por `cancel-kirvano-subscription` |
| `supabase/functions/downgrade-to-free/index.ts` | **Manter** (funciona independente do gateway) |

---

## 7. Secrets

| Secret | Descricao |
|--------|-----------|
| `KIRVANO_WEBHOOK_SECRET` | Token de seguranca para validar webhooks da Kirvano |

O `CAKTO_WEBHOOK_SECRET` pode ser removido apos a migracao.

---

## 8. Arquivos Afetados

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/kirvano-webhook/index.ts` | Criar |
| `supabase/functions/cancel-kirvano-subscription/index.ts` | Criar (substitui cancel-cakto) |
| `supabase/functions/cakto-webhook/index.ts` | Deletar |
| `supabase/functions/cancel-cakto-subscription/index.ts` | Deletar |
| `src/hooks/useUserData.ts` | Adicionar busca de addons |
| `src/hooks/usePropertyLimit.ts` | Somar addons ao limite |
| `src/hooks/useSubscription.ts` | Trocar refs Cakto → Kirvano |
| `src/hooks/useSubscriptionAddons.ts` | Criar (novo hook) |
| `src/pages/Plans.tsx` | Adicionar secao add-ons |
| `src/pages/Subscription.tsx` | Exibir addons + trocar refs |
| `src/components/subscription/PaymentHistory.tsx` | Trocar texto Cakto → Kirvano |
| `src/components/landing/PricingSection.tsx` | Adicionar add-ons |
| Migration SQL | Criar tabela + colunas |

---

## Detalhes Tecnicos

- A Kirvano envia webhooks como JSON POST, similar a Cakto. Eventos incluem: compra aprovada, assinatura ativada, assinatura cancelada, reembolso, chargeback
- O secret e enviado como header customizado (token/signature configuravel no painel Kirvano)
- O payload contem: dados do comprador (email), produto (nome, ID), transacao, e evento
- A identificacao plano vs addon sera feita pelo nome do produto (pattern matching) — mesmo approach usado com Cakto
- Add-ons sao tratados como produtos recorrentes independentes na Kirvano (nao como upsell no checkout do plano)
- A URL do webhook a configurar na Kirvano sera: `https://wwgmfrtiexjfhjoaifnr.supabase.co/functions/v1/kirvano-webhook`

