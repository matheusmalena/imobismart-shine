import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PaymentHistoryEntry {
  id: string;
  user_id: string;
  event: string;
  plan: string | null;
  status: string;
  amount: number;
  transaction_id: string | null;
  payer_email: string | null;
  created_at: string;
}

export function usePaymentHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['payment-history', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_history' as any)
        .select('id, user_id, event, plan, status, amount, transaction_id, payer_email, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as unknown as PaymentHistoryEntry[];
    },
    enabled: !!user,
  });
}
