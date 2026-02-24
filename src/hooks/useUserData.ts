import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'user';
export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'enterprise' | 'plus';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'trial';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  mobile_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  started_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionAddon {
  id: string;
  user_id: string;
  addon_name: string;
  addon_properties: number;
  addon_price: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UserData {
  profile: Profile | null;
  subscription: Subscription | null;
  role: AppRole | null;
  addons: SubscriptionAddon[];
}

/**
 * Hook centralizado para dados do usuário
 * Combina profile, subscription e role em uma única query para reduzir requisições
 */
export function useUserData() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-data', user?.id],
    queryFn: async (): Promise<UserData> => {
      if (!user) return { profile: null, subscription: null, role: null, addons: [] };

      // Executar todas as queries em paralelo para máxima eficiência
      const [profileResult, subscriptionResult, roleResult, addonsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .rpc('get_user_role', { _user_id: user.id }),
        supabase
          .from('subscription_addons')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active'),
      ]);

      // Log errors but don't throw - return null for failed queries
      if (profileResult.error) {
        console.error('Error fetching profile:', profileResult.error);
      }
      if (subscriptionResult.error && subscriptionResult.error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subscriptionResult.error);
      }
      if (roleResult.error) {
        console.error('Error fetching role:', roleResult.error);
      }

      let subscription = subscriptionResult.data as Subscription | null;

      // Check if user is org member (not owner) and inherit owner's plan
      const { data: ownerPlan } = await supabase
        .rpc('get_org_owner_plan' as any, { _user_id: user.id });

      if (ownerPlan && Array.isArray(ownerPlan) && ownerPlan.length > 0) {
        const op = ownerPlan[0];
        subscription = {
          ...(subscription || { id: '', user_id: user.id, started_at: '', expires_at: null, created_at: '', updated_at: '' }),
          plan: op.plan as Subscription['plan'],
          status: op.status as Subscription['status'],
        };
      }

      return {
        profile: profileResult.data as Profile | null,
        subscription,
        role: (roleResult.data as AppRole) || null,
        addons: (addonsResult.data as SubscriptionAddon[]) || [],
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const profile = data?.profile ?? null;
  const subscription = data?.subscription ?? null;
  const role = data?.role ?? null;
  const addons = data?.addons ?? [];
  const isAdmin = role === 'admin';
  const plan = subscription?.plan || 'free';
  const isFree = plan === 'free';
  const isStarter = plan === 'starter' || plan === 'pro' || plan === 'plus' || plan === 'enterprise';
  const isPro = plan === 'pro' || plan === 'plus' || plan === 'enterprise';
  const isPlus = plan === 'plus' || plan === 'enterprise';
  const isEnterprise = plan === 'enterprise';
  const totalAddonProperties = addons.reduce((sum, a) => sum + a.addon_properties, 0);

  return {
    profile,
    subscription,
    role,
    addons,
    totalAddonProperties,
    isAdmin,
    plan,
    isFree,
    isStarter,
    isPro,
    isPlus,
    isEnterprise,
    isLoading,
    error,
  };
}
