import { useUserData } from '@/hooks/useUserData';
import { useProperties } from '@/hooks/useProperties';
import { usePlans } from '@/hooks/usePlans';

export function usePropertyLimit() {
  const { plan } = useUserData();
  const { activeProperties } = useProperties();
  const { getPlanLimit, getPlanById } = usePlans();
  
  const limit = getPlanLimit(plan);
  const activeCount = activeProperties.length;
  const excessCount = Math.max(0, activeCount - limit);
  const canAddProperty = true; // Never block — charge extra instead
  const remainingSlots = Math.max(0, limit - activeCount);
  const isAtLimit = activeCount >= limit;
  
  // Calculate estimated extra cost
  const planData = getPlanById(plan);
  const extraPrice = (planData as any)?.extra_property_price || 0;
  const estimatedExtraCost = excessCount * extraPrice;
  
  return {
    plan,
    limit,
    activeCount,
    canAddProperty,
    remainingSlots,
    isAtLimit,
    isUnlimited: limit === Infinity,
    excessCount,
    extraPrice,
    estimatedExtraCost,
  };
}
