

# Atualizar Sistema de Billing para Modelo Fixo sem Add-ons

## Estado Atual

Os planos no banco de dados ja estao com os precos e limites **quase corretos**:

| Plano | Preco Atual | Limite Atual | Preco Novo | Limite Novo |
|-------|-------------|--------------|------------|-------------|
| Free | R$0 | 2 | R$0 | **2** (ok) |
| Starter | R$49 | **15** | R$49 | **10** |
| Pro | R$79 | **30** | R$79 | **25** |
| Plus | R$129 | **60** | R$129 | **50** |
| Enterprise | Sob consulta | Ilimitado | Sob consulta | Ilimitado (ok) |

A tabela `subscription_addons` existe no banco mas **nao e usada no codigo** (nenhuma referencia encontrada). Portanto, o sistema ja opera sem add-ons na pratica.

## Alteracoes Necessarias

### 1. Atualizar limites no banco de dados (Migration SQL)

Atualizar os `property_limit` dos planos Starter (15 → 10), Pro (30 → 25) e Plus (60 → 50) diretamente na tabela `plans`.

### 2. Atualizar pagina de Assinatura (`src/pages/Subscription.tsx`)

Adicionar secao de uso de imoveis mostrando:
- Plano atual e status (ja existe)
- Imoveis incluidos no plano (limite do plano)
- Quantidade utilizada (imoveis ativos)
- Barra de progresso visual

Isso requer importar `useProperties` e `usePlans` para buscar o limite e a contagem.

### 3. Atualizar FAQ na pagina de Planos (`src/pages/Plans.tsx`)

- Remover referencia a "periodo de teste de 7 dias" (FAQ item 2)
- Remover referencia a "desconto anual de 20%" (FAQ item 5)
- Ajustar texto para refletir modelo fixo sem add-ons

### 4. Nenhuma alteracao no webhook ou edge functions

O webhook `cakto-webhook` ja identifica o plano pelo nome do produto e atualiza a subscription. O `downgrade-to-free` ja arquiva imoveis excedentes. O `cancel-cakto-subscription` ja reverte para free. Tudo funciona com o modelo fixo.

## Detalhes Tecnicos

### Migration SQL
```sql
UPDATE plans SET property_limit = 10 WHERE id = 'starter';
UPDATE plans SET property_limit = 25 WHERE id = 'pro';
UPDATE plans SET property_limit = 50 WHERE id = 'plus';
```

### Arquivos Modificados

| Arquivo | Alteracao |
|---------|-----------|
| Migration SQL | Ajustar limites: Starter=10, Pro=25, Plus=50 |
| `src/pages/Subscription.tsx` | Adicionar secao de uso de imoveis com barra de progresso, limite e quantidade utilizada |
| `src/pages/Plans.tsx` | Atualizar FAQ para remover mencoes a trial e desconto anual |

### Nenhuma alteracao necessaria em:
- `usePropertyLimit.ts` — ja le o limite da tabela `plans` dinamicamente
- `usePlans.ts` — ja busca da tabela `plans`
- `cakto-webhook` — ja funciona com modelo fixo
- `downgrade-to-free` — ja usa `FREE_PLAN_LIMIT = 2`
- `useSubscription.ts` / `useUserData.ts` — sem mudancas

