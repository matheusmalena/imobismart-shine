import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import { toast } from 'sonner';
import { useRateLimit, RATE_LIMITS } from '@/hooks/useRateLimit';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  mobile_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateData {
  full_name?: string;
  mobile_number?: string;
}

/**
 * Hook para gerenciar perfil do usuário
 * Usa useUserData para evitar requisições duplicadas
 */
export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { checkRateLimit } = useRateLimit();
  const { profile, isLoading } = useUserData();

  const updateProfile = useMutation({
    mutationFn: async (updateData: ProfileUpdateData) => {
      if (!user) throw new Error('User not authenticated');
      
      // Rate limit check
      const rateLimitResult = await checkRateLimit(RATE_LIMITS.UPDATE_PROFILE);
      if (!rateLimitResult.allowed) {
        throw new Error('Muitas requisições. Aguarde um momento.');
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-data', user?.id] });
      toast.success('Perfil atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    },
  });

  return {
    profile,
    isLoading,
    updateProfile,
  };
}
