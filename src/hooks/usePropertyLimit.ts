import { useUserData } from '@/hooks/useUserData';
import { useProperties } from '@/hooks/useProperties';
import { usePlans } from '@/hooks/usePlans';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function usePropertyLimit() {
  const { plan, isLoading: userDataLoading } = useUserData();
  const { user } = useAuth();
  const { activeProperties } = useProperties();
  const { getPlanLimit } = usePlans();

  // Always try to fetch enterprise limits — the RPC returns empty if not enterprise
  const { data: enterpriseLimits } = useQuery({
    queryKey: ['enterprise-custom-limit', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_enterprise_limits', {
        _user_id: user!.id,
      });
      if (error || !data || data.length === 0) return null;
      return data[0];
    },
    enabled: !!user?.id && !userDataLoading,
    staleTime: 60 * 1000,
  });

  // If enterprise limits exist, use them regardless of plan state
  const limit = enterpriseLimits?.property_limit != null
    ? enterpriseLimits.property_limit
    : getPlanLimit(plan);

  const activeCount = activeProperties.length;
  const canAddProperty = activeCount < limit;
  const remainingSlots = Math.max(0, limit - activeCount);
  const isAtLimit = activeCount >= limit;

  return {
    plan,
    limit,
    activeCount,
    canAddProperty,
    remainingSlots,
    isAtLimit,
    isUnlimited: limit === Infinity,
  };
}
