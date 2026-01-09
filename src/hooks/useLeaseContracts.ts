import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LeaseContract, LeaseContractFormData } from '@/types/tenant';
import { toast } from 'sonner';
import { differenceInDays } from 'date-fns';

export function useLeaseContracts(propertyId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['lease-contracts', user?.id, propertyId],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('lease_contracts')
        .select(`
          *,
          tenant:tenants(id, name, email, phone, cpf),
          property:properties(id, name, photo_url)
        `)
        .eq('user_id', user.id)
        .order('end_date', { ascending: true });

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as LeaseContract[];
    },
    enabled: !!user?.id,
  });

  const createContract = useMutation({
    mutationFn: async (data: LeaseContractFormData) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { data: newContract, error } = await supabase
        .from('lease_contracts')
        .insert({
          user_id: user.id,
          property_id: data.property_id,
          tenant_id: data.tenant_id,
          start_date: data.start_date,
          end_date: data.end_date,
          monthly_rent: data.monthly_rent,
          deposit_amount: data.deposit_amount || null,
          payment_due_day: data.payment_due_day || 5,
          status: data.status || 'active',
          notes: data.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return newContract;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lease-contracts'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Contrato criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar contrato:', error);
      toast.error('Erro ao criar contrato');
    },
  });

  const updateContract = useMutation({
    mutationFn: async ({ id, ...data }: LeaseContractFormData & { id: string }) => {
      const { data: updatedContract, error } = await supabase
        .from('lease_contracts')
        .update({
          property_id: data.property_id,
          tenant_id: data.tenant_id,
          start_date: data.start_date,
          end_date: data.end_date,
          monthly_rent: data.monthly_rent,
          deposit_amount: data.deposit_amount || null,
          payment_due_day: data.payment_due_day || 5,
          status: data.status || 'active',
          notes: data.notes || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedContract;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lease-contracts'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Contrato atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar contrato:', error);
      toast.error('Erro ao atualizar contrato');
    },
  });

  const deleteContract = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lease_contracts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lease-contracts'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Contrato removido com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao remover contrato:', error);
      toast.error('Erro ao remover contrato');
    },
  });

  // Computed values for alerts
  const expiringContracts = contracts.filter(contract => {
    if (contract.status !== 'active') return false;
    const daysUntilExpiry = differenceInDays(new Date(contract.end_date), new Date());
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  });

  const expiredContracts = contracts.filter(contract => {
    if (contract.status === 'expired' || contract.status === 'terminated') return false;
    const daysUntilExpiry = differenceInDays(new Date(contract.end_date), new Date());
    return daysUntilExpiry < 0;
  });

  return {
    contracts,
    isLoading,
    createContract,
    updateContract,
    deleteContract,
    expiringContracts,
    expiredContracts,
  };
}
