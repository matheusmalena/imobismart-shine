import { useSubscription } from '@/hooks/useSubscription';
import { useProperties } from '@/hooks/useProperties';

const PLAN_LIMITS = {
  starter: 2,
  pro: 25,
  enterprise: Infinity,
};

export function usePropertyLimit() {
  const { subscription } = useSubscription();
  const { properties, activeProperties } = useProperties();
  
  const plan = subscription?.plan || 'starter';
  const limit = PLAN_LIMITS[plan] || 2;
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
