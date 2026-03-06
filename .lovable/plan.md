

## Plano: Sincronizar limites de imóveis Enterprise na plataforma

### Problema raiz

Existem dois problemas que impedem a sincronização:

1. **RLS bloqueia acesso**: A tabela `enterprise_checkout_links` só permite leitura para usuários com `app_role = 'admin'`. Usuários Enterprise normais (owner ou convidados) não conseguem consultar seus próprios limites.

2. **Email errado para membros convidados**: `usePropertyLimit` busca pelo email do próprio usuário, mas para membros convidados o `client_email` na tabela é o do owner, não o do convidado.

### Solução

#### 1. Migração SQL — Criar função `get_enterprise_limits`

Criar uma função `SECURITY DEFINER` que recebe um `user_id` e retorna `property_limit` e `max_members` do enterprise link correspondente. A função resolve automaticamente se o usuário é owner ou membro convidado (busca o owner da org e depois o link enterprise pelo email do owner).

```sql
CREATE FUNCTION get_enterprise_limits(_user_id uuid)
RETURNS TABLE(property_limit integer, max_members integer)
-- Resolve: user → org membership → owner → profiles.email → enterprise_checkout_links
```

#### 2. `src/hooks/usePropertyLimit.ts` — Usar a nova função RPC

Substituir a query direta à tabela `enterprise_checkout_links` por uma chamada RPC `get_enterprise_limits`, que funciona para owners e membros convidados sem problemas de RLS.

#### 3. `src/pages/admin/EnterpriseLinks.tsx` — Invalidar queries de limites

No `saveMutation.onSuccess`, adicionar invalidação das queries `enterprise-custom-limit` e `enterprise-max-members` para que alterações reflitam imediatamente na plataforma.

### Arquivos

| Arquivo | Mudança |
|---|---|
| Migração SQL | Criar `get_enterprise_limits(_user_id)` security definer |
| `src/hooks/usePropertyLimit.ts` | Usar RPC em vez de query direta |
| `src/pages/admin/EnterpriseLinks.tsx` | Invalidar queries de limites no save |

