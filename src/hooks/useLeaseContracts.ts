import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LeaseContract, LeaseContractFormData } from '@/types/tenant';
import { toast } from 'sonner';
import { differenceInDays } from 'date-fns';

async function uploadContractFile(
  userId: string,
  contractId: string,
  file: File
): Promise<string> {
  const timestamp = Date.now();
  const filePath = `${userId}/contracts/${contractId}/${timestamp}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from('property-documents')
    .upload(filePath, file, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (uploadError) {
    console.error('Error uploading contract file:', uploadError);
    throw new Error('Erro ao enviar o documento do contrato');
  }

  return filePath;
}

async function deleteContractFile(fileUrl: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('property-documents')
      .remove([fileUrl]);

    if (error) {
      console.error('Error deleting contract file:', error);
    }
  } catch (error) {
    console.error('Error deleting contract file:', error);
  }
}

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

      // First create the contract without the file URL
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

      // If there's a file to upload, upload it and update the contract
      if (data.contract_file) {
        try {
          const filePath = await uploadContractFile(
            user.id,
            newContract.id,
            data.contract_file
          );

          const { error: updateError } = await supabase
            .from('lease_contracts')
            .update({ contract_file_url: filePath })
            .eq('id', newContract.id);

          if (updateError) {
            // Try to delete the uploaded file
            await deleteContractFile(filePath);
            throw updateError;
          }

          return { ...newContract, contract_file_url: filePath };
        } catch (fileError) {
          console.error('Error uploading file:', fileError);
          toast.error('Contrato criado, mas houve erro ao anexar o documento');
          return newContract;
        }
      }

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
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Get the current contract to check for existing file
      const { data: currentContract } = await supabase
        .from('lease_contracts')
        .select('contract_file_url')
        .eq('id', id)
        .single();

      let newFileUrl = data.contract_file_url;

      // If there's a new file to upload
      if (data.contract_file) {
        try {
          const filePath = await uploadContractFile(user.id, id, data.contract_file);
          newFileUrl = filePath;

          // Delete the old file if it exists
          if (currentContract?.contract_file_url) {
            await deleteContractFile(currentContract.contract_file_url);
          }
        } catch (fileError) {
          console.error('Error uploading file:', fileError);
          toast.error('Erro ao anexar o documento');
          throw fileError;
        }
      } else if (data.contract_file_url === null && currentContract?.contract_file_url) {
        // File was removed
        await deleteContractFile(currentContract.contract_file_url);
        newFileUrl = null;
      }

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
          contract_file_url: newFileUrl,
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
      // Get the contract to check for file
      const { data: contract } = await supabase
        .from('lease_contracts')
        .select('contract_file_url')
        .eq('id', id)
        .single();

      // Delete the file if it exists
      if (contract?.contract_file_url) {
        await deleteContractFile(contract.contract_file_url);
      }

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

  const getSignedUrl = async (fileUrl: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from('property-documents')
        .createSignedUrl(fileUrl, 3600); // 1 hour

      if (error) {
        console.error('Error getting signed URL:', error);
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }
  };

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
    getSignedUrl,
    expiringContracts,
    expiredContracts,
  };
}
