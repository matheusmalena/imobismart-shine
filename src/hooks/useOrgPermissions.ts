import { useOrganization } from '@/hooks/useOrganization';

/**
 * Hook centralizado de permissões baseadas no role do usuário na organização.
 * - owner/admin: acesso total (criar, editar, deletar, gerenciar equipe)
 * - operator: apenas visualização e edição básica
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
    /** Can create new records (owner/admin only, or non-org users) */
    canCreate: !isInOrg || isOwnerOrAdmin,
    /** Can edit existing records (everyone) */
    canEdit: true,
    /** Can delete records (owner/admin only, or non-org users) */
    canDelete: !isInOrg || isOwnerOrAdmin,
    /** Can manage team (invite, remove members) */
    canManageTeam: !isInOrg || isOwnerOrAdmin,
    /** Is operator (read + basic edit only) */
    isOperator,
  };
}
