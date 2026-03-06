

## Plano: Sincronizar limites Enterprise automaticamente na plataforma

### Problema
Quando o admin ajusta `property_limit` ou `max_members` em `/admin/enterprise-links`, esses valores **não são propagados** para o restante da plataforma:
- `useOrganization` lê `max_members` da tabela `organizations` (sempre 3, hardcoded na criação)
- `usePropertyLimit` já lê de `enterprise_checkout_links` (funciona)
- Não existe sincronização entre as tabelas

### Solução

#### 1. `src/hooks/useOrganization.ts` — Buscar `max_members` dinâmico do enterprise link
Adicionar uma query que busca o `max_members` customizado de `enterprise_checkout_links` pelo email do owner da organização (similar ao que `usePropertyLimit` já faz). Sobrescrever o `organization.max_members` com esse valor quando disponível.

Fluxo:
- Buscar o email do owner via `profiles` usando `organization.owner_id`
- Consultar `enterprise_checkout_links` pelo email do owner
- Se encontrar, usar `max_members` do link enterprise em vez do valor da tabela `organizations`

#### 2. `src/pages/admin/EnterpriseLinks.tsx` — Propagar alterações para a tabela `organizations`
No `saveMutation`, após salvar o link enterprise, verificar se o `client_email` corresponde a um owner de organização e atualizar `organizations.max_members` automaticamente. Isso garante sincronização imediata.

Fluxo no save:
1. Salvar link em `enterprise_checkout_links`
2. Buscar `profiles` pelo `client_email` → obter `user_id`
3. Buscar `organizations` onde `owner_id = user_id`
4. Se encontrar, atualizar `organizations.max_members` com o novo valor

#### 3. Edge function ou DB function para sincronização
Criar uma database function `sync_enterprise_limits` que, dado um email, atualiza a `organizations.max_members` correspondente. Isso é mais seguro pois o admin não tem permissão direta de UPDATE na tabela `organizations` via RLS.

### Arquivos

| Arquivo | Mudança |
|---|---|
| Migração SQL | Criar function `sync_enterprise_org_limits(client_email, max_members)` |
| `src/hooks/useOrganization.ts` | Buscar `max_members` dinâmico do enterprise link pelo email do owner |
| `src/pages/admin/EnterpriseLinks.tsx` | Chamar sync após salvar para propagar `max_members` à organização |

