

# Configurar STRIPE_WEBHOOK_SECRET e Executar Tarefas Pendentes

## Passo 1: Adicionar o Secret
Solicitar a entrada do `STRIPE_WEBHOOK_SECRET` (a chave que comeca com `whsec_...`) usando a ferramenta de adicao de secrets.

## Passo 2: Corrigir cakto-webhook e cancel-cakto-subscription
Alterar o downgrade de `starter` para `free` nos dois arquivos:
- `supabase/functions/cakto-webhook/index.ts` (linhas 77 e 120)
- `supabase/functions/cancel-cakto-subscription/index.ts` (linha 36)

## Passo 3: Atualizar Enterprise Links
Em `src/pages/admin/EnterpriseLinks.tsx`, trocar referencias "Cakto" por "Stripe" nos labels e placeholders.

## Passo 4: Criar Edge Function report-usage
Nova funcao para contar imoveis excedentes e reportar ao Stripe como usage record (metered billing).

## Passo 5: Verificar PricingSection
Garantir que a landing page esta alinhada com os novos planos e usa Stripe Checkout.

## Detalhes Tecnicos

### Arquivos modificados
| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/cakto-webhook/index.ts` | `starter` -> `free` |
| `supabase/functions/cancel-cakto-subscription/index.ts` | `starter` -> `free` |
| `src/pages/admin/EnterpriseLinks.tsx` | Labels Cakto -> Stripe |
| `supabase/functions/report-usage/index.ts` | Novo - metered billing |
| `src/components/landing/PricingSection.tsx` | Verificacao/ajustes |

