import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'user';

export function useUserRole() {
  const { user } = useAuth();

  const { data: role, isLoading } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .rpc('get_user_role', { _user_id: user.id });

      if (error) {
        console.error('Error fetching role:', error);
        return null;
      }
      
      return data as AppRole | null;
    },
    enabled: !!user,
  });

  const isAdmin = role === 'admin';

  return {
    role,
    isAdmin,
    isLoading,
  };
}
