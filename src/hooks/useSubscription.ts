import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import { toast } from 'sonner';

export type SubscriptionPlan = 'starter' | 'pro' | 'enterprise' | 'plus';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'trial';

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  started_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Hook para gerenciar subscription do usuário
 * Usa useUserData para evitar requisições duplicadas
 */
export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { subscription, isLoading } = useUserData();

  const cancelSubscription = useMutation({
    mutationFn: async () => {
      if (!user || !subscription) throw new Error('No subscription found');
      
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-data', user?.id] });
      toast.success('Assinatura cancelada com sucesso');
    },
    onError: (error) => {
      console.error('Error cancelling subscription:', error);
      toast.error('Erro ao cancelar assinatura');
    },
  });

  return {
    subscription,
    isLoading,
    cancelSubscription,
  };
}
