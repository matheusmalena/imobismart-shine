import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

export interface ClientData {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  role: 'admin' | 'user';
  plan: string;
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'trial';
  properties_count: number;
}

export function useAdminClients() {
  const { isAdmin } = useUserRole();

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['admin-clients'],
    queryFn: async () => {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Fetch subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('*');

      if (subsError) throw subsError;

      // Fetch property counts per user
      const { data: propertyCounts, error: propError } = await supabase
        .from('properties')
        .select('user_id');

      if (propError) throw propError;

      // Count properties per user
      const propertyCountMap = propertyCounts?.reduce((acc, p) => {
        acc[p.user_id] = (acc[p.user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Combine data
      const clientsData: ClientData[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        const userSub = subscriptions?.find(s => s.user_id === profile.user_id);

        return {
          id: profile.id,
          user_id: profile.user_id,
          email: profile.email,
          full_name: profile.full_name,
          created_at: profile.created_at,
          role: (userRole?.role as 'admin' | 'user') || 'user',
          plan: userSub?.plan || 'free',
          subscription_status: (userSub?.status as 'active' | 'inactive' | 'cancelled' | 'trial') || 'trial',
          properties_count: propertyCountMap[profile.user_id] || 0,
        };
      });

      return clientsData;
    },
    enabled: isAdmin,
  });

  return {
    clients,
    isLoading,
    error,
  };
}
