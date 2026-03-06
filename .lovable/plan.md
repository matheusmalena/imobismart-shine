

## Plano: Campo de membros no Enterprise Links + Permissões refinadas por role

### 1. Migração: adicionar `max_members` à tabela `enterprise_checkout_links`

Adicionar coluna `max_members INTEGER NOT NULL DEFAULT 3` para que o admin defina o limite de membros da equipe de cada cliente Enterprise.

### 2. `src/pages/admin/EnterpriseLinks.tsx` — Campo "Limite de Membros"

- Adicionar `max_members` ao `EnterpriseLink` interface e `LinkFormData`
- Adicionar coluna "Membros" na tabela ao lado de "Limite Imóveis"
- Adicionar campo input numérico no formulário de criação/edição
- Salvar/atualizar o valor no save mutation

### 3. `src/hooks/useOrganization.ts` — Usar `max_members` customizado do Enterprise

Quando a organização for criada ou quando o hook carregar, buscar o `max_members` do `enterprise_checkout_links` pelo email do owner para aplicar o limite correto (em vez do default 3). Isso será feito via query adicional no hook, similar ao que `usePropertyLimit` já faz.

### 4. `src/hooks/useOrgPermissions.ts` — Refinar permissões do Operador

Expandir o hook com permissões granulares e profissionais:

```typescript
return {
  // ... existentes
  canCreate, canDelete, canEdit, canManageTeam,
  // Novas permissões granulares
  canEditTenant: true,           // todos editam
  canViewTenant: true,           // todos visualizam
  canCreateTenant: !isInOrg || isOwnerOrAdmin,
  canDeleteTenant: !isInOrg || isOwnerOrAdmin,
  canEditProperty: !isInOrg || isOwnerOrAdmin, // operador não edita imóvel
  canViewProperty: true,
};
```

Operador: pode **visualizar** inquilinos, imóveis, documentos e contratos, mas **não pode editar, criar ou deletar nada**. Admin/Owner: acesso total.

### 5. Páginas afetadas — Aplicar permissões do Operador

| Página | Operador | Admin/Owner |
|---|---|---|
| Inquilinos (`Tenants.tsx`) | Visualiza lista, sem botão criar/editar/deletar | Acesso total |
| Imóveis (`Properties.tsx`) | Visualiza lista, sem editar/criar/deletar | Acesso total |
| Documentos (`Documents.tsx`) | Visualiza, sem upload/deletar | Acesso total |
| Contratos (dentro de Tenants) | Visualiza, sem criar/editar/deletar | Acesso total |
| Equipe (`Team.tsx`) | Visualiza membros, sem convidar/remover | Gerenciamento completo |
| Dashboard | Visualiza métricas (sem restrição) | Acesso total |
| WhatsApp | Visualiza mensagens, sem configurar/enviar | Acesso total |

### 6. Componentes a ajustar

- `TenantCard.tsx` — esconder botões editar/deletar para operador
- `PropertyCard.tsx` — esconder editar/deletar para operador  
- `Documents.tsx` — esconder upload/deletar para operador
- `ContractsList.tsx` — esconder criar/editar contrato para operador
- `TeamManagement.tsx` — operador vê membros sem ações

### Arquivos

| Arquivo | Mudança |
|---|---|
| Migração SQL | Adicionar `max_members` em `enterprise_checkout_links` |
| `src/pages/admin/EnterpriseLinks.tsx` | Campo de limite de membros no form e tabela |
| `src/hooks/useOrgPermissions.ts` | Permissões granulares: operador = somente leitura |
| `src/pages/Tenants.tsx` | Aplicar `canCreate`, `canEdit`, `canDelete` granulares |
| `src/components/tenants/TenantCard.tsx` | Esconder editar/deletar para operador |
| `src/pages/Properties.tsx` | Esconder criar/editar/deletar para operador |
| `src/components/properties/PropertyCard.tsx` | Esconder ações para operador |
| `src/pages/Documents.tsx` | Esconder upload/deletar para operador |
| `src/components/tenants/ContractsList.tsx` | Esconder ações de contrato para operador |
| `src/hooks/useOrganization.ts` | Buscar `max_members` custom do enterprise link |

