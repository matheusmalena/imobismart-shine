import { useUserData } from '@/hooks/useUserData';
import { useProperties } from '@/hooks/useProperties';
import { usePlans } from '@/hooks/usePlans';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePropertyLimit() {
  const { plan, profile } = useUserData();
  const { activeProperties } = useProperties();
  const { getPlanLimit } = usePlans();

  // For enterprise users, fetch custom limit from enterprise_checkout_links
  const { data: customLimit } = useQuery({
    queryKey: ['enterprise-custom-limit', profile?.email],
    queryFn: async () => {
      if (!profile?.email) return null;
      const { data } = await supabase
        .from('enterprise_checkout_links')
        .select('property_limit')
        .eq('client_email', profile.email)
        .eq('is_active', true)
        .maybeSingle();
      return data?.property_limit ?? null;
    },
    enabled: plan === 'enterprise' && !!profile?.email,
    staleTime: 60 * 1000,
  });

  const limit = plan === 'enterprise' && customLimit !== null && customLimit !== undefined
    ? customLimit
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
