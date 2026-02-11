

# Corrigir Exclusao de Usuario no Admin

## Problema

O `DeleteUserDialog` atual tenta deletar apenas `subscriptions`, `user_roles` e `profiles` usando o client-side SDK. Isso falha porque:

1. **Nao remove o usuario do sistema de autenticacao** - o usuario continua existindo em `auth.users`, e os triggers `handle_new_user` e `handle_new_user_role` recriam o profile e subscription automaticamente
2. **Nao remove dados vinculados** (properties, tenants, contracts, etc.) - restricoes de chave estrangeira podem bloquear a exclusao do profile
3. **Nao verifica erros** nas primeiras chamadas de delete - mostra "sucesso" mesmo quando falhou

## Solucao

Criar uma Edge Function `delete-user-admin` que usa `SUPABASE_SERVICE_ROLE_KEY` para:
1. Deletar todos os dados relacionados ao usuario em todas as tabelas (mesma logica do cleanup que ja fizemos)
2. Remover arquivos dos buckets de storage
3. Remover o usuario de `auth.users` via `supabase.auth.admin.deleteUser()`

Atualizar o `DeleteUserDialog` para chamar essa Edge Function em vez de fazer deletes diretos.

## Arquivos

| Arquivo | Acao |
|---------|------|
| `supabase/functions/delete-user-admin/index.ts` | Criar - Edge Function com service_role para exclusao completa |
| `supabase/config.toml` | Adicionar config da nova funcao com `verify_jwt = false` |
| `src/components/admin/DeleteUserDialog.tsx` | Atualizar para chamar a Edge Function em vez de deletes diretos |

## Detalhes Tecnicos

### Edge Function `delete-user-admin`
- Recebe `{ userId }` no body
- Valida que o chamador e admin (verifica JWT + role na tabela `user_roles`)
- Impede exclusao do proprio admin
- Deleta em cascata: `whatsapp_scheduled` > `whatsapp_messages` > `whatsapp_settings` > `ai_chat_messages` > `property_gallery` > `documents` > `lease_contracts` > `tenants` > `properties` > `organization_invitations` > `organization_members` > `organizations` (onde owner_id = userId) > `plan_audit_logs` > `rate_limits` > `enterprise_checkout_links` > `subscriptions` > `user_roles` > `profiles`
- Limpa arquivos nos buckets `avatars`, `property-photos`, `property-documents`
- Remove de `auth.users` via admin API
- Retorna resultado com contagem de registros removidos

### DeleteUserDialog
- Substitui os deletes diretos por uma chamada `fetch` a Edge Function
- Passa o token de autorizacao do usuario logado no header
- Trata erros retornados pela funcao

