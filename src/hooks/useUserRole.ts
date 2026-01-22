import { useUserData } from '@/hooks/useUserData';

export type AppRole = 'admin' | 'user';

/**
 * Hook para verificar role do usuário
 * Usa useUserData para evitar requisições duplicadas
 */
export function useUserRole() {
  const { role, isAdmin, isLoading } = useUserData();

  return {
    role,
    isAdmin,
    isLoading,
  };
}
