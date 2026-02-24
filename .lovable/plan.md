

# Sistema de Billing: Planos Base + Add-ons de Imoveis

## Contexto Atual

O projeto ja possui:
- Tabela `plans` com Free (2), Starter (15), Pro (30), Plus (60), Enterprise (ilimitado) -- tudo configurado com checkout URLs da Cakto
- Tabela `subscriptions` com campos para Cakto (`external_subscription_id`, `payer_email`, `payment_method`)
- Tabela `subscription_addons` (criada mas nao utilizada no codigo) com `addon_name`, `addon_properties`, `addon_price`, `status`, `kirvano_product_id`
- Edge Function `cakto-webhook` que processa pagamentos e ativa planos pelo nome do produto
- Edge Function `cancel-cakto-subscription` que cancela e arquiva imoveis excedentes
- Hook `usePropertyLimit` que calcula limites apenas pelo plano base (sem somar addons)
- Pagina `/subscription` que mostra apenas plano e status (sem addons)

O que falta: integrar os add-ons no webhook, no calculo de limites e na UI do cliente.

---

## Alteracoes Planejadas

### 1. Atualizar o webhook `cakto-webhook` para processar add-ons

O webhook ja identifica planos pelo nome do produto. Sera adicionada logica para detectar pacotes de imoveis:

```text
Nome do produto contem "pacote +10" ou "+10" --> addon de 10 imoveis
Nome do produto contem "pacote +25" ou "+25" --> addon de 25 imoveis
Nome do produto contem "pacote +50" ou "+50" --> addon de 50 imoveis
```

Quando for `purchase_approved`:
- Inserir registro na tabela `subscription_addons` com `status: 'active'`

Quando for `subscription_cancelled` / `purchase_refunded`:
- Atualizar o addon correspondente para `status: 'cancelled'`

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/cakto-webhook/index.ts` | Adicionar deteccao e CRUD de add-ons |

### 2. Atualizar `usePropertyLimit` para somar add-ons ativos

O hook atual calcula `limit = getPlanLimit(plan)`. Sera alterado para:

```text
limit = limite_do_plano + soma(addon_properties onde status = 'active')
```

Isso requer uma nova query para buscar os addons ativos do usuario.

| Arquivo | Alteracao |
|---------|-----------|
| `src/hooks/usePropertyLimit.ts` | Adicionar query de addons e somar ao limite |

### 3. Atualizar `useUserData` para incluir addons

Adicionar a query de `subscription_addons` no Promise.all para disponibilizar os dados de addons em todo o app sem requisicoes extras.

| Arquivo | Alteracao |
|---------|-----------|
| `src/hooks/useUserData.ts` | Adicionar busca de addons ativos e expor no retorno |

### 4. Atualizar a pagina `/subscription` para exibir addons

Adicionar uma secao mostrando:
- Plano base e imoveis incluidos
- Pacotes ativos (nome, quantidade, preco)
- Limite total (plano + addons)
- Status da assinatura

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/Subscription.tsx` | Nova secao de add-ons e limite total |

### 5. Atualizar `cancel-cakto-subscription` para cancelar addons junto

Quando o usuario cancela, alem de reverter para free, cancelar todos os addons ativos e recalcular o limite para arquivar imoveis excedentes.

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/cancel-cakto-subscription/index.ts` | Cancelar addons ativos ao cancelar subscription |

---

## Detalhes Tecnicos

### Tabela `subscription_addons` (ja existe)

```text
id, user_id, addon_name, addon_properties, addon_price, status, kirvano_product_id, kirvano_subscription_id, created_at, updated_at
```

Sera usada como esta. Os campos `kirvano_*` serao preenchidos com IDs da Cakto (reutilizando os campos existentes).

### Fluxo do Webhook (atualizado)

```text
Webhook recebe evento
  |
  v
Identifica tipo: plano base OU add-on?
  |
  +--> Plano base (nome contem starter/pro/plus/enterprise)
  |      --> Atualiza tabela subscriptions (fluxo existente)
  |
  +--> Add-on (nome contem "+10", "+25", "+50")
         --> purchase_approved: INSERT em subscription_addons
         --> cancelled/refunded: UPDATE status = 'cancelled'
```

### Calculo de Limite Total

```text
limite_total = plans.property_limit + SUM(subscription_addons.addon_properties WHERE status = 'active')
```

Se `plans.property_limit = -1` (Enterprise), o limite e infinito independente dos addons.

### Arquivos Modificados (Resumo)

| Arquivo | Tipo |
|---------|------|
| `supabase/functions/cakto-webhook/index.ts` | Editar |
| `supabase/functions/cancel-cakto-subscription/index.ts` | Editar |
| `src/hooks/useUserData.ts` | Editar |
| `src/hooks/usePropertyLimit.ts` | Editar |
| `src/pages/Subscription.tsx` | Editar |

Nenhuma migracao de banco necessaria -- a tabela `subscription_addons` e as RLS policies ja existem.

