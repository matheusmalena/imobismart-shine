import { useOrganization } from '@/hooks/useOrganization';

/**
 * Hook centralizado de permissões baseadas no role do usuário na organização.
 * 
 * Matriz de permissões:
 * - owner/admin: acesso total (criar, editar, deletar, gerenciar equipe)
 * - operator: somente visualização (não pode criar, editar, deletar ou gerenciar)
 * - Usuários sem organização: acesso total (conta individual)
 */
export function useOrgPermissions() {
  const { organization, userRole } = useOrganization();

  const isInOrg = !!organization;
  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin';
  const isOperator = userRole === 'operator';

  return {
    /** User belongs to an organization */
    isInOrg,
    /** Organization ID (if any) */
    organizationId: organization?.id || null,
    /** User's role in the organization */
    userRole,

    // ── Permissões gerais ──
    /** Can create new records (owner/admin only, or non-org users) */
    canCreate: !isInOrg || isOwnerOrAdmin,
    /** Can edit existing records (owner/admin only, or non-org users) */
    canEdit: !isInOrg || isOwnerOrAdmin,
    /** Can delete records (owner/admin only, or non-org users) */
    canDelete: !isInOrg || isOwnerOrAdmin,
    /** Can manage team (invite, remove members) */
    canManageTeam: !isInOrg || isOwnerOrAdmin,

    // ── Permissões granulares por entidade ──
    /** Can create/edit/delete properties */
    canManageProperties: !isInOrg || isOwnerOrAdmin,
    /** Can create/edit/delete tenants */
    canManageTenants: !isInOrg || isOwnerOrAdmin,
    /** Can create/edit/delete contracts */
    canManageContracts: !isInOrg || isOwnerOrAdmin,
    /** Can upload/delete documents */
    canManageDocuments: !isInOrg || isOwnerOrAdmin,
    /** Can configure/send WhatsApp */
    canManageWhatsApp: !isInOrg || isOwnerOrAdmin,

    // ── Visualização (sempre permitido) ──
    /** Can view records (everyone) */
    canView: true,

    /** Is operator (read-only) */
    isOperator,
  };
}
