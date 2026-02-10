import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type OrgMemberRole = 'owner' | 'admin' | 'financial' | 'operator';

export interface Organization {
  id: string;
  name: string;
  owner_id: string;
  max_members: number;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgMemberRole;
  invited_by: string | null;
  invited_at: string;
  accepted_at: string | null;
  status: 'pending' | 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

export interface OrganizationInvitation {
  id: string;
  organization_id: string;
  email: string;
  role: OrgMemberRole;
  invited_by: string;
  token: string;
  expires_at: string;
  created_at: string;
}

const ROLE_LABELS: Record<OrgMemberRole, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  financial: 'Financeiro', // kept for backward compat with existing data
  operator: 'Operador',
};

const ROLE_DESCRIPTIONS: Record<OrgMemberRole, string> = {
  owner: 'Controle total da organização e membros',
  admin: 'Acesso geral - pode ver, criar, editar, deletar e gerenciar equipe',
  financial: 'Acesso a relatórios e dados financeiros', // kept for backward compat
  operator: 'Visualização e edição básica de dados (não pode criar, deletar ou gerenciar equipe)',
};

export function useOrganization() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's organization
  const { data: organization, isLoading: orgLoading } = useQuery({
    queryKey: ['organization', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // First check if user is a member of any organization
      const { data: membership, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (memberError || !membership) return null;

      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', membership.organization_id)
        .single();

      if (orgError) {
        console.error('Error fetching organization:', orgError);
        return null;
      }

      return org as Organization;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
  });

  // Fetch user's role in organization
  const { data: userRole, isLoading: roleLoading } = useQuery({
    queryKey: ['org-role', user?.id, organization?.id],
    queryFn: async () => {
      if (!user?.id || !organization?.id) return null;

      const { data, error } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('organization_id', organization.id)
        .eq('status', 'active')
        .single();

      if (error) return null;
      return data.role as OrgMemberRole;
    },
    enabled: !!user?.id && !!organization?.id,
  });

  // Fetch organization members
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['org-members', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organization.id)
        .order('role');

      if (membersError) {
        console.error('Error fetching members:', membersError);
        return [];
      }

      // Fetch profiles separately
      const userIds = membersData.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, avatar_url')
        .in('user_id', userIds);

      return membersData.map(member => ({
        ...member,
        status: member.status as 'pending' | 'active' | 'inactive',
        profile: profiles?.find(p => p.user_id === member.user_id) || null
      })) as OrganizationMember[];
    },
    enabled: !!organization?.id,
  });

  // Fetch pending invitations (cleanup is handled by the database, not client)
  const { data: invitations = [], isLoading: invitationsLoading } = useQuery({
    queryKey: ['org-invitations', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];

      // Only fetch non-expired invitations - cleanup happens automatically via database trigger/cron
      const { data, error } = await supabase
        .from('organization_invitations')
        .select('*')
        .eq('organization_id', organization.id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invitations:', error);
        return [];
      }

      return data as OrganizationInvitation[];
    },
    enabled: !!organization?.id,
    staleTime: 2 * 60 * 1000, // 2 minutos de cache
  });

  // Create organization
  const createOrganization = useMutation({
    mutationFn: async (name: string) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name,
          owner_id: user.id,
          max_members: 3, // Default limit
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add owner as member
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: 'owner',
          status: 'active',
          accepted_at: new Date().toISOString(),
        });

      if (memberError) throw memberError;

      return org;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      toast.success('Equipe criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating organization:', error);
      toast.error('Erro ao criar equipe');
    },
  });

  // Invite member
  const inviteMember = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: OrgMemberRole }) => {
      if (!user?.id || !organization?.id) throw new Error('Organização não encontrada');

      // Check member limit
      const activeMembers = members.filter(m => m.status === 'active').length;
      const pendingInvites = invitations.length;
      
      if (activeMembers + pendingInvites >= organization.max_members) {
        throw new Error(`Limite de ${organization.max_members} membros atingido. Entre em contato para aumentar o limite.`);
      }

      const { data, error } = await supabase
        .from('organization_invitations')
        .insert({
          organization_id: organization.id,
          email,
          role,
          invited_by: user.id,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este email já foi convidado');
        }
        throw error;
      }

      // Send invitation email via edge function
      try {
        const { error: emailError } = await supabase.functions.invoke('send-team-invite', {
          body: { invitationId: data.id },
        });

        if (emailError) {
          console.error('Error sending invitation email:', emailError);
          // Don't throw - the invitation is created, just email failed
        }
      } catch (emailErr) {
        console.error('Failed to send invitation email:', emailErr);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-invitations'] });
      toast.success('Convite enviado com sucesso! Um email foi enviado para o novo membro.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao enviar convite');
    },
  });

  // Cancel invitation
  const cancelInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('organization_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-invitations'] });
      toast.success('Convite cancelado');
    },
    onError: () => {
      toast.error('Erro ao cancelar convite');
    },
  });

  // Resend invitation
  const resendInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      // Update expires_at to extend invitation validity
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 7);

      const { error: updateError } = await supabase
        .from('organization_invitations')
        .update({ expires_at: newExpiresAt.toISOString() })
        .eq('id', invitationId);

      if (updateError) throw updateError;

      // Resend email
      const { error: emailError } = await supabase.functions.invoke('send-team-invite', {
        body: { invitationId },
      });

      if (emailError) {
        console.error('Error resending invitation email:', emailError);
        throw new Error('Erro ao reenviar email');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-invitations'] });
      toast.success('Convite reenviado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao reenviar convite');
    },
  });

  // Update member role
  const updateMemberRole = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: OrgMemberRole }) => {
      const { error } = await supabase
        .from('organization_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-members'] });
      toast.success('Permissão atualizada');
    },
    onError: () => {
      toast.error('Erro ao atualizar permissão');
    },
  });

  // Remove member
  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-members'] });
      toast.success('Membro removido da equipe');
    },
    onError: () => {
      toast.error('Erro ao remover membro');
    },
  });

  // Update organization
  const updateOrganization = useMutation({
    mutationFn: async (updates: Partial<Organization>) => {
      if (!organization?.id) throw new Error('Organização não encontrada');

      const { error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', organization.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      toast.success('Equipe atualizada');
    },
    onError: () => {
      toast.error('Erro ao atualizar equipe');
    },
  });

  const canManage = userRole === 'owner' || userRole === 'admin';
  const isOwner = userRole === 'owner';

  return {
    organization,
    userRole,
    members,
    invitations,
    isLoading: orgLoading || roleLoading || membersLoading || invitationsLoading,
    canManage,
    isOwner,
    createOrganization,
    inviteMember,
    cancelInvitation,
    resendInvitation,
    updateMemberRole,
    removeMember,
    updateOrganization,
    ROLE_LABELS,
    ROLE_DESCRIPTIONS,
  };
}
