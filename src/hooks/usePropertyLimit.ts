import { useUserData } from '@/hooks/useUserData';
import { useProperties } from '@/hooks/useProperties';
import { usePlans } from '@/hooks/usePlans';

export function usePropertyLimit() {
  const { plan } = useUserData();
  const { activeProperties } = useProperties();
  const { getPlanLimit } = usePlans();
  
  const limit = getPlanLimit(plan);
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
