import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  price_label: string;
  property_limit: number;
  features: string[];
  is_highlighted: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PlanInput {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  price_label: string;
  property_limit: number;
  features: string[];
  is_highlighted?: boolean;
  is_active?: boolean;
  sort_order?: number;
}

export function usePlans() {
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching plans:', error);
        throw error;
      }

      return data as Plan[];
    },
  });

  const activePlans = plans.filter(p => p.is_active);

  const updatePlan = useMutation({
    mutationFn: async (plan: Partial<PlanInput> & { id: string }) => {
      const { id, ...updateData } = plan;
      
      const { error } = await supabase
        .from('plans')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plano atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Error updating plan:', error);
      toast.error('Erro ao atualizar plano');
    },
  });

  const createPlan = useMutation({
    mutationFn: async (plan: PlanInput) => {
      const { error } = await supabase
        .from('plans')
        .insert(plan);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plano criado com sucesso');
    },
    onError: (error) => {
      console.error('Error creating plan:', error);
      toast.error('Erro ao criar plano');
    },
  });

  const deletePlan = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plano removido com sucesso');
    },
    onError: (error) => {
      console.error('Error deleting plan:', error);
      toast.error('Erro ao remover plano');
    },
  });

  const getPlanById = (planId: string) => {
    return plans.find(p => p.id === planId);
  };

  const getPlanLimit = (planId: string) => {
    const plan = getPlanById(planId);
    if (!plan) return 2; // Default fallback
    return plan.property_limit === -1 ? Infinity : plan.property_limit;
  };

  return {
    plans,
    activePlans,
    isLoading,
    updatePlan,
    createPlan,
    deletePlan,
    getPlanById,
    getPlanLimit,
  };
}
