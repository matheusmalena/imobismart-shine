

## Plano: Corrigir sincronização de limites Enterprise na plataforma

### Problema identificado

Existem dois problemas concretos:

1. **`useOrganization.ts` (linha 112)**: Consulta `enterprise_checkout_links` **diretamente** via Supabase client. A tabela tem RLS que **só permite acesso a admins** (`has_role(auth.uid(), 'admin')`). Quando um usuário Enterprise normal acessa, a query retorna `null` silenciosamente — `max_members` nunca é sobrescrito.

2. **`usePropertyLimit.ts`**: Usa o RPC `get_enterprise_limits` (SECURITY DEFINER) — este funciona corretamente, mas pode falhar se o `plan` do `useUserData` ainda não resolveu para `'enterprise'` (race condition com `enabled`).

### Solução

#### 1. `src/hooks/useOrganization.ts` — Usar RPC em vez de query direta

Substituir a query direta à tabela `enterprise_checkout_links` (linhas 97-123) pelo RPC `get_enterprise_limits` que já existe e ignora RLS. Isso garante que Enterprise users normais (não-admin) recebam os limites corretos.

```typescript
// Antes: query direta (bloqueada por RLS)
const { data: link } = await supabase
  .from('enterprise_checkout_links')
  .select('max_members')
  .eq('client_email', ownerProfile.email)
  ...

// Depois: usar o RPC existente
const { data } = await supabase.rpc('get_enterprise_limits', {
  _user_id: orgRaw.owner_id,
});
return data?.[0]?.max_members ?? null;
```

#### 2. `src/hooks/usePropertyLimit.ts` — Remover dependência do `plan` para habilitar query

Atualmente a query só roda quando `plan === 'enterprise'`. Se o `useUserData` ainda não carregou, o limite nunca é buscado. Mudar para verificar se o usuário tem uma organização OU plan enterprise, usando uma abordagem mais resiliente.

### Arquivos

| Arquivo | Mudança |
|---|---|
| `src/hooks/useOrganization.ts` | Usar RPC `get_enterprise_limits` em vez de query direta |
| `src/hooks/usePropertyLimit.ts` | Tornar query mais resiliente, não depender apenas de `plan` |

