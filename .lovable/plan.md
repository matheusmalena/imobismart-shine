

# Limpeza Completa da Base de Dados

## Resumo

Existem **17 usuarios** no sistema. Apenas **matheus@yup.group** (admin) sera mantido. Todos os outros usuarios e seus dados serao removidos.

### Dados a serem removidos

| Tabela | Registros para remover |
|--------|----------------------|
| properties | 151 |
| tenants | 14 |
| lease_contracts | 5 |
| documents | 2 |
| ai_chat_messages | 44 |
| whatsapp_settings | 1 |
| organizations | 5 |
| organization_members | 3 |
| profiles | 17 |
| subscriptions | ~17 |
| user_roles | ~17 |
| auth.users | 17 (via API) |

### Plano de Execucao

**Etapa 1: Criar Edge Function temporaria `cleanup-users`**

Uma funcao backend que usa privilegios administrativos para:
1. Listar todos os usuarios exceto matheus@yup.group
2. Para cada usuario, deletar em ordem:
   - whatsapp_scheduled, whatsapp_messages, whatsapp_settings
   - ai_chat_messages
   - property_gallery, documents, lease_contracts
   - tenants, properties
   - organization_invitations, organization_members, organizations
   - plan_audit_logs, rate_limits
   - subscriptions, user_roles, profiles
   - Arquivos nos buckets de storage (avatars, property-photos, property-documents)
   - Conta de autenticacao (auth.users via admin API)
3. Garantir que o usuario matheus@yup.group mantenha role `admin` e subscription `enterprise` com status `active`

**Etapa 2: Executar a funcao**

Chamar a funcao para limpar tudo.

**Etapa 3: Atualizar subscription do matheus**

Alterar o plano de `starter/trial` para `enterprise/active` para que voce tenha acesso completo durante os testes.

**Etapa 4: Remover a Edge Function**

Deletar a funcao `cleanup-users` apos a execucao, pois e de uso unico.

## Detalhes Tecnicos

A Edge Function usara `SUPABASE_SERVICE_ROLE_KEY` para ter permissao de deletar registros em todas as tabelas e remover usuarios da autenticacao via `supabase.auth.admin.deleteUser()`. 

A funcao protegera o usuario `3a2e17a7-e9ca-43dc-92c3-ff3bbd81acb1` (matheus@yup.group) de qualquer exclusao.

## Arquivos

| Arquivo | Acao |
|---------|------|
| `supabase/functions/cleanup-users/index.ts` | Criar (temporario) |

