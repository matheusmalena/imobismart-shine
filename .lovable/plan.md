

## Plano: Gerenciamento de contas Enterprise no painel admin

### Contexto
Hoje o plano Enterprise tem um `property_limit` fixo na tabela `plans`, mas cada cliente Enterprise pode ter um limite personalizado. O admin precisa de um local para gerenciar isso.

### Solução

#### 1. Migração: adicionar `property_limit` à tabela `enterprise_checkout_links`
Adicionar coluna `property_limit INTEGER NOT NULL DEFAULT 100` à tabela `enterprise_checkout_links`. Esse valor será o limite personalizado de imóveis para cada cliente Enterprise.

#### 2. `src/pages/admin/EnterpriseLinks.tsx` — Adicionar gestão de limite e status do proprietário
- Adicionar coluna **"Limite Imóveis"** na tabela mostrando o `property_limit` de cada link
- Adicionar coluna **"Proprietário"** mostrando se o email do cliente já está cadastrado e é dono de uma organização (query em `organizations.owner_id` cruzando com `profiles.email`)
- No formulário de criação/edição, adicionar campo **"Limite de Imóveis"** (input numérico)
- Mostrar badge "Proprietário" ou "Sem conta" para indicar status do cliente

#### 3. `src/hooks/usePropertyLimit.ts` — Usar limite personalizado para Enterprise
Quando o plano for `enterprise`, buscar o limite customizado da tabela `enterprise_checkout_links` usando o email do usuário, em vez de usar o limite fixo da tabela `plans`.

Fluxo:
1. Se `plan !== 'enterprise'` → usa `getPlanLimit(plan)` como hoje
2. Se `plan === 'enterprise'` → busca `enterprise_checkout_links` pelo email do usuário → usa `property_limit` do link → fallback para o limite do plano `plans`

#### 4. `cakto-webhook` — Salvar `property_limit` na ativação
Quando o webhook ativa um plano enterprise, ler o `property_limit` do `enterprise_checkout_links` correspondente e salvar na tabela `subscriptions` (nova coluna `custom_property_limit`) para acesso rápido sem joins.

**Alternativa mais simples (preferida):** Em vez de adicionar coluna em `subscriptions`, o `usePropertyLimit` faz a query diretamente em `enterprise_checkout_links` pelo email — já está disponível no perfil do usuário.

### Arquivos

| Arquivo | Mudança |
|---|---|
| Migração SQL | Adicionar `property_limit` em `enterprise_checkout_links` |
| `src/pages/admin/EnterpriseLinks.tsx` | Campo de limite no form, coluna na tabela, mostrar proprietário |
| `src/hooks/usePropertyLimit.ts` | Buscar limite custom para Enterprise via `enterprise_checkout_links` |

