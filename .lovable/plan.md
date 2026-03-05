

# Corrigir Exclusao de Usuarios no Admin + Limpeza do Sistema

## Problema Atual

O `DeleteUserDialog` tenta excluir dados usando o client Supabase com RLS. O problema:
- A policy de DELETE na tabela `profiles` so permite o proprio usuario deletar seu perfil (`auth.uid() = user_id`), entao o admin nao consegue
- Nao deleta dados vinculados (imoveis, inquilinos, documentos, contratos, galeria, mensagens, etc.)
- Nao remove o usuario do `auth.users`

## Solucao

### 1. Criar Edge Function `delete-user-admin`

Nova edge function com `service_role` que faz a exclusao completa em cascata:
1. Deleta storage files (property-photos, property-documents, avatars)
2. Deleta dados vinculados em ordem: `whatsapp_messages`, `whatsapp_scheduled`, `whatsapp_settings`, `property_gallery`, `documents`, `lease_contracts`, `tenants`, `properties`, `ai_chat_messages`, `email_verifications`, `organization_members`, `organization_invitations`, `payment_history`, `subscription_addons`, `subscriptions`, `user_roles`, `profiles`
3. Remove o usuario de `auth.users` via admin API
4. Valida que o caller e admin antes de executar

**Arquivo:** `supabase/functions/delete-user-admin/index.ts`

### 2. Atualizar `DeleteUserDialog`

Trocar a logica de delecao direta por chamada a edge function `delete-user-admin`.

**Arquivo:** `src/components/admin/DeleteUserDialog.tsx`

### 3. Registrar no config.toml

```toml
[functions.delete-user-admin]
verify_jwt = false
```

### 4. Limpeza de usuarios

Usar a ferramenta de dados para deletar todos os usuarios exceto `matheus@yup.group` das tabelas relevantes, e chamar a edge function para remover de `auth.users`.

---

## Arquivos a Criar/Modificar

| Arquivo | Acao |
|---------|------|
| `supabase/functions/delete-user-admin/index.ts` | Criar edge function de exclusao completa |
| `src/components/admin/DeleteUserDialog.tsx` | Usar edge function em vez de delecao direta |
| `supabase/config.toml` | Registrar nova function |

