import { useSubscription } from '@/hooks/useSubscription';
import { useProperties } from '@/hooks/useProperties';
import { usePlans } from '@/hooks/usePlans';

export function usePropertyLimit() {
  const { subscription } = useSubscription();
  const { activeProperties } = useProperties();
  const { getPlanLimit, getPlanById } = usePlans();
  
  const plan = subscription?.plan || 'starter';
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
