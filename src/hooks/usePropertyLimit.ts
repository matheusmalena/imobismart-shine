import { useUserData } from '@/hooks/useUserData';
import { useProperties } from '@/hooks/useProperties';
import { usePlans } from '@/hooks/usePlans';
import { useSubscriptionAddons } from '@/hooks/useSubscriptionAddons';

export function usePropertyLimit() {
  const { plan } = useUserData();
  const { activeProperties } = useProperties();
  const { getPlanLimit } = usePlans();
  const { totalAddonProperties } = useSubscriptionAddons();
  
  const basePlanLimit = getPlanLimit(plan);
  const limit = basePlanLimit === Infinity ? Infinity : basePlanLimit + totalAddonProperties;
  const activeCount = activeProperties.length;
  const canAddProperty = activeCount < limit;
  const remainingSlots = Math.max(0, limit === Infinity ? Infinity : limit - activeCount);
  const isAtLimit = activeCount >= limit;
  
  return {
    plan,
    limit,
    basePlanLimit,
    addonProperties: totalAddonProperties,
    activeCount,
    canAddProperty,
    remainingSlots,
    isAtLimit,
    isUnlimited: limit === Infinity,
  };
}
