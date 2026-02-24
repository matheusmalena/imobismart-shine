import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionAddon {
  id: string;
  user_id: string;
  addon_name: string;
  addon_properties: number;
  addon_price: number;
  kirvano_product_id: string | null;
  kirvano_subscription_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useSubscriptionAddons() {
  const { user } = useAuth();

  const { data: addons = [], isLoading, refetch } = useQuery({
    queryKey: ['subscription-addons', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('subscription_addons' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching addons:', error);
        return [];
      }
      return (data || []) as unknown as SubscriptionAddon[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const totalAddonProperties = addons.reduce(
    (sum, addon) => sum + addon.addon_properties,
    0
  );

  return {
    addons,
    totalAddonProperties,
    isLoading,
    refetch,
  };
}
