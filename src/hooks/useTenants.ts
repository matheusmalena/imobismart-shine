import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tenant, TenantFormData } from '@/types/tenant';
import { toast } from 'sonner';

export function useTenants() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['tenants', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      return data as Tenant[];
    },
    enabled: !!user?.id,
  });

  const createTenant = useMutation({
    mutationFn: async (data: TenantFormData) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Normaliza CPF/Email antes de salvar (apenas números no CPF, lowercase no email)
      const normalizedCpf = data.cpf ? data.cpf.replace(/\D/g, '') || null : null;
      const normalizedEmail = data.email ? data.email.trim().toLowerCase() || null : null;

      const { data: newTenant, error } = await supabase
        .from('tenants')
        .insert({
          user_id: user.id,
          name: data.name.trim(),
          email: normalizedEmail,
          phone: data.phone || null,
          cpf: normalizedCpf,
          rg: data.rg || null,
          address: data.address || null,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return newTenant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Inquilino cadastrado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao criar inquilino:', error);
      
      // Detecta erro de duplicidade (índice único) e mostra mensagem amigável
      const errorMessage = error?.message || '';
      if (errorMessage.includes('tenants_user_cpf_uniq')) {
        toast.error('Já existe um inquilino cadastrado com este CPF.');
      } else if (errorMessage.includes('tenants_user_email_uniq')) {
        toast.error('Já existe um inquilino cadastrado com este email.');
      } else {
        toast.error('Erro ao cadastrar inquilino');
      }
    },
  });

  const updateTenant = useMutation({
    mutationFn: async ({ id, ...data }: TenantFormData & { id: string }) => {
      // Normaliza CPF/Email antes de salvar (apenas números no CPF, lowercase no email)
      const normalizedCpf = data.cpf ? data.cpf.replace(/\D/g, '') || null : null;
      const normalizedEmail = data.email ? data.email.trim().toLowerCase() || null : null;

      const { data: updatedTenant, error } = await supabase
        .from('tenants')
        .update({
          name: data.name.trim(),
          email: normalizedEmail,
          phone: data.phone || null,
          cpf: normalizedCpf,
          rg: data.rg || null,
          address: data.address || null,
          notes: data.notes || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedTenant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Inquilino atualizado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar inquilino:', error);
      
      // Detecta erro de duplicidade (índice único) e mostra mensagem amigável
      const errorMessage = error?.message || '';
      if (errorMessage.includes('tenants_user_cpf_uniq')) {
        toast.error('Já existe um inquilino cadastrado com este CPF.');
      } else if (errorMessage.includes('tenants_user_email_uniq')) {
        toast.error('Já existe um inquilino cadastrado com este email.');
      } else {
        toast.error('Erro ao atualizar inquilino');
      }
    },
  });

  const deleteTenant = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Inquilino removido com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao remover inquilino:', error);
      toast.error('Erro ao remover inquilino. Verifique se não há contratos vinculados.');
    },
  });

  return {
    tenants,
    isLoading,
    createTenant,
    updateTenant,
    deleteTenant,
  };
}
