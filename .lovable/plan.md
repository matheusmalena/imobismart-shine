

# Proximos Passos da Migracao Stripe

## Resumo

Completar a integracao Stripe com 4 tarefas pendentes: configurar o webhook secret, atualizar a pagina Enterprise Links para Stripe, criar a edge function de report-usage, e limpar referencias a Cakto.

---

## Tarefa 1: Configurar STRIPE_WEBHOOK_SECRET

O secret `STRIPE_WEBHOOK_SECRET` ainda nao esta configurado no projeto. Ele e necessario para que o `stripe-webhook` valide as assinaturas dos eventos recebidos do Stripe.

**Acao:** Solicitar ao usuario que adicione o secret via ferramenta `add_secret`. O valor deve ser obtido no painel do Stripe ao configurar o endpoint de webhook:
`https://wwgmfrtiexjfhjoaifnr.supabase.co/functions/v1/stripe-webhook`

---

## Tarefa 2: Atualizar Enterprise Links para Stripe

A pagina `/admin/enterprise-links` ainda referencia "Cakto" nos labels e placeholders. Precisa ser atualizada para funcionar com Stripe Payment Links ou Stripe Checkout customizado.

**Alteracoes em `src/pages/admin/EnterpriseLinks.tsx`:**
- Alterar label "Link de Checkout (Cakto)" para "Link de Checkout (Stripe)"
- Alterar placeholder de `https://pay.cakto.com.br/...` para `https://checkout.stripe.com/...` ou URL de Payment Link do Stripe

---

## Tarefa 3: Corrigir cakto-webhook para usar `free` em vez de `starter`

O `cakto-webhook` ainda faz downgrade para `starter` (linha 120). Como `starter` agora e um plano pago (R$49), cancelamentos via Cakto devem fazer downgrade para `free`.

**Alteracoes em `supabase/functions/cakto-webhook/index.ts`:**
- Linha 77: mudar default de `"starter"` para `"free"` (ou manter logica de deteccao de plano)
- Linha 120: mudar `plan: "starter"` para `plan: "free"` no bloco de cancelamento

**Alteracoes em `supabase/functions/cancel-cakto-subscription/index.ts`:**
- Linha 36: mudar `plan: "starter"` para `plan: "free"`

---

## Tarefa 4: Criar Edge Function `report-usage` (metered billing)

Criar uma nova edge function que conta imoveis excedentes por usuario e reporta ao Stripe como usage record. Pode ser executada via pg_cron ou chamada manualmente.

**Novo arquivo: `supabase/functions/report-usage/index.ts`**

Logica:
1. Buscar todos os usuarios com plano pago (starter/pro/plus) e seus limites
2. Contar imoveis ativos de cada usuario
3. Calcular excedentes (ativos - limite)
4. Para cada usuario com excedentes, buscar o Stripe subscription e reportar usage via `stripe.subscriptionItems.createUsageRecord()`

**Prerequisito:** Criar metered prices no Stripe para cada plano (R$3,50, R$3,00, R$2,50 por imovel). Esses price IDs devem ser salvos na coluna `stripe_metered_price_id` da tabela `plans`.

**Nota:** Esta tarefa depende da criacao dos metered prices no Stripe, que pode ser feita via Stripe Dashboard. A edge function sera implementada com a logica pronta, aguardando apenas os price IDs.

---

## Tarefa 5: Atualizar PricingSection (landing page)

Verificar e garantir que `src/components/landing/PricingSection.tsx` esta alinhada com os novos planos e usa Stripe Checkout (nao Cakto) para usuarios ja logados.

---

## Detalhes Tecnicos

### Arquivos modificados
| Arquivo | Tipo de alteracao |
|---------|------------------|
| `src/pages/admin/EnterpriseLinks.tsx` | Atualizar labels Cakto -> Stripe |
| `supabase/functions/cakto-webhook/index.ts` | Corrigir downgrade para `free` |
| `supabase/functions/cancel-cakto-subscription/index.ts` | Corrigir downgrade para `free` |
| `supabase/functions/report-usage/index.ts` | **Novo** - metered billing |

### Secrets necessarios
| Secret | Status |
|--------|--------|
| `STRIPE_SECRET_KEY` | Configurado |
| `STRIPE_WEBHOOK_SECRET` | **Pendente** - precisa ser adicionado |

### Ordem de execucao
1. Adicionar `STRIPE_WEBHOOK_SECRET`
2. Corrigir referencias Cakto (`free` em vez de `starter`)
3. Atualizar Enterprise Links
4. Criar `report-usage` edge function
5. Verificar PricingSection

