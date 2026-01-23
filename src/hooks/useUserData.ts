import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'user';
export type SubscriptionPlan = 'starter' | 'pro' | 'enterprise' | 'plus';
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

interface UserData {
  profile: Profile | null;
  subscription: Subscription | null;
  role: AppRole | null;
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
      if (!user) return { profile: null, subscription: null, role: null };

      // Executar todas as queries em paralelo para máxima eficiência
      const [profileResult, subscriptionResult, roleResult] = await Promise.all([
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
          .rpc('get_user_role', { _user_id: user.id })
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

      return {
        profile: profileResult.data as Profile | null,
        subscription: subscriptionResult.data as Subscription | null,
        role: (roleResult.data as AppRole) || null,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos - dados de usuário não mudam frequentemente
    gcTime: 10 * 60 * 1000, // 10 minutos de cache
  });

  const profile = data?.profile ?? null;
  const subscription = data?.subscription ?? null;
  const role = data?.role ?? null;
  const isAdmin = role === 'admin';
  const plan = subscription?.plan || 'starter';
  // Flags granulares para cada nível de plano
  const isStarter = plan === 'starter';
  const isPro = plan === 'pro' || plan === 'plus' || plan === 'enterprise'; // Pro ou superior
  const isPlus = plan === 'plus' || plan === 'enterprise'; // Plus ou superior
  const isEnterprise = plan === 'enterprise'; // Apenas Enterprise (exclusivo)

  return {
    profile,
    subscription,
    role,
    isAdmin,
    plan,
    isStarter,
    isPro,
    isPlus,
    isEnterprise,
    isLoading,
    error,
  };
}
