

# Melhorar Funcionamento de Equipe Enterprise

## Problema Atual

O banco de dados ja tem as colunas `organization_id` e politicas de seguranca configuradas nas tabelas de imoveis, inquilinos, contratos e documentos. Porem, o codigo frontend **sempre filtra apenas pelo usuario logado** (`user_id = user.id`), entao membros convidados nunca veem o portfolio do dono da conta.

## O que sera feito

### 1. Simplificar para 2 tipos de acesso

Remover os roles "financial" e manter apenas:

| Papel | Descricao |
|-------|-----------|
| **owner** | Dono da conta Enterprise (controle total) |
| **admin** | Acesso geral - pode ver, criar, editar e deletar tudo no portfolio |
| **operator** | Somente visualizacao e edicao basica de dados (nao pode deletar, nao pode gerenciar equipe) |

### 2. Fazer os hooks carregarem dados da organizacao

Atualizar os 4 hooks principais para que, quando o usuario pertencer a uma organizacao, ele veja os dados do portfolio inteiro (nao apenas os proprios):

- **useProperties** - Buscar imoveis do dono + da organizacao
- **useTenants** - Buscar inquilinos do portfolio
- **useDocuments** - Buscar documentos do portfolio
- **useLeaseContracts** - Buscar contratos do portfolio

### 3. Controlar permissoes no frontend

Criar um hook centralizado `useOrgPermissions` que expoe:
- `canDelete` - apenas owner e admin podem deletar
- `canManageTeam` - apenas owner e admin
- `canCreate` - owner, admin (operador nao cria novos registros, apenas edita existentes)
- `canEdit` - todos podem editar

### 4. Ajustar o registro de dados novos

Quando o owner/admin cria um imovel, inquilino, contrato ou documento, o `organization_id` precisa ser preenchido automaticamente para que os outros membros tambem vejam.

## Detalhes Tecnicos

### Banco de Dados (Migracao SQL)

1. **Atualizar RLS de tenants para SELECT** - atualmente a politica de SELECT de tenants usa `can_manage_org` (restritivo demais), precisa trocar para `is_org_member` para operadores tambem verem
2. **Criar funcao `get_user_org_id`** - funcao auxiliar que retorna o organization_id do usuario logado (para facilitar queries no frontend)
3. Nenhuma alteracao no enum `org_member_role` e necessaria pois os valores "financial" simplesmente deixarao de ser oferecidos na UI

### Frontend - Hooks Modificados

**useProperties.ts**: 
- Buscar pelo `organization_id` do usuario (via useOrganization) ao inves de apenas `user_id`
- Quando usuario tem organizacao: buscar `WHERE organization_id = X`
- Quando nao tem: manter filtro por `user_id` (comportamento atual)
- No `insert`, incluir `organization_id` automaticamente

**useTenants.ts**: Mesma logica acima

**useDocuments.ts**: Mesma logica acima

**useLeaseContracts.ts**: Mesma logica acima

**useOrganization.ts**: 
- Remover opcao "financial" das constantes ROLE_LABELS e ROLE_DESCRIPTIONS
- Ajustar `canManage` para considerar apenas owner/admin
- Adicionar flags de permissao baseadas no role

### Frontend - UI Modificada

**TeamManagement.tsx**:
- Remover opcao "Financeiro" do select de convite
- Remover opcao "Tornar Financeiro" do dropdown de membros
- Atualizar descricoes dos roles
- Operadores nao podem convidar ou gerenciar membros

**Componentes de CRUD** (PropertyCard, TenantCard, etc.):
- Esconder botoes de deletar para operadores
- Esconder botoes de criar para operadores

### Arquivos Afetados

| Arquivo | Tipo de Alteracao |
|---------|-------------------|
| `src/hooks/useProperties.ts` | Queries com organization_id + insert com org_id |
| `src/hooks/useTenants.ts` | Queries com organization_id + insert com org_id |
| `src/hooks/useDocuments.ts` | Queries com organization_id + insert com org_id |
| `src/hooks/useLeaseContracts.ts` | Queries com organization_id + insert com org_id |
| `src/hooks/useOrganization.ts` | Remover financial, adicionar flags de permissao |
| `src/components/team/TeamManagement.tsx` | Simplificar UI para 2 roles |
| `src/components/properties/PropertyCard.tsx` | Esconder delete para operator |
| `src/components/tenants/TenantCard.tsx` | Esconder delete para operator |
| Migracao SQL | Ajustar RLS de tenants SELECT |

