import { useUserData } from '@/hooks/useUserData';
import { useProperties } from '@/hooks/useProperties';
import { usePlans } from '@/hooks/usePlans';

export function usePropertyLimit() {
  const { plan, totalAddonProperties } = useUserData();
  const { activeProperties } = useProperties();
  const { getPlanLimit } = usePlans();
  
  const basePlanLimit = getPlanLimit(plan);
  const isUnlimited = basePlanLimit === Infinity;
  const limit = isUnlimited ? Infinity : basePlanLimit + totalAddonProperties;
  const activeCount = activeProperties.length;
  const canAddProperty = activeCount < limit;
  const remainingSlots = isUnlimited ? Infinity : Math.max(0, limit - activeCount);
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
    isUnlimited,
  };
}
