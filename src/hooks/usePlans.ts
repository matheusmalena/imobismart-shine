import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

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
  checkout_url: string | null;
  extra_property_price: number | null;
  stripe_price_id: string | null;
  stripe_metered_price_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanInput {
  id: string;
  name: string;
  description?: string;
  price: number;
  price_label: string;
  property_limit: number;
  features: string[];
  is_highlighted: boolean;
  is_active: boolean;
  sort_order: number;
  checkout_url?: string;
}

export interface PlanAuditLog {
  id: string;
  plan_id: string;
  action: 'create' | 'update' | 'delete';
  changed_by: string;
  changes: Record<string, unknown>;
  previous_values: Record<string, unknown> | null;
  created_at: string;
}

export function usePlans() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : [],
      })) as Plan[];
    },
  });

  const { data: auditLogs = [], isLoading: auditLoading, refetch: refetchAudit } = useQuery({
    queryKey: ['plan-audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plan_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []) as PlanAuditLog[];
    },
  });

  const logAudit = async (planId: string, action: 'create' | 'update' | 'delete', changes: Record<string, unknown>, previousValues?: Record<string, unknown>) => {
    if (!user) return;
    
    await supabase.from('plan_audit_logs').insert({
      plan_id: planId,
      action,
      changed_by: user.id,
      changes: changes as Json,
      previous_values: (previousValues || null) as Json,
    });
  };

  const updatePlan = useMutation({
    mutationFn: async (planData: Partial<PlanInput> & { id: string }) => {
      // Get current plan for audit
      const currentPlan = plans.find(p => p.id === planData.id);
      
      const { error } = await supabase
        .from('plans')
        .update({
          name: planData.name,
          description: planData.description,
          price: planData.price,
          price_label: planData.price_label,
          property_limit: planData.property_limit,
          features: planData.features,
          is_highlighted: planData.is_highlighted,
          is_active: planData.is_active,
          sort_order: planData.sort_order,
          checkout_url: (planData as any).checkout_url,
        })
        .eq('id', planData.id);

      if (error) throw error;

      // Log audit
      await logAudit(planData.id, 'update', planData, currentPlan as unknown as Record<string, unknown>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['plan-audit-logs'] });
      toast.success('Plano atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Error updating plan:', error);
      toast.error('Erro ao atualizar plano');
    },
  });

  const createPlan = useMutation({
    mutationFn: async (planData: PlanInput) => {
      const { error } = await supabase
        .from('plans')
        .insert({
          id: planData.id,
          name: planData.name,
          description: planData.description,
          price: planData.price,
          price_label: planData.price_label,
          property_limit: planData.property_limit,
          features: planData.features,
          is_highlighted: planData.is_highlighted,
          is_active: planData.is_active,
          sort_order: planData.sort_order,
          checkout_url: (planData as any).checkout_url,
        });

      if (error) throw error;

      // Log audit
      await logAudit(planData.id, 'create', planData as unknown as Record<string, unknown>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['plan-audit-logs'] });
      toast.success('Plano criado com sucesso');
    },
    onError: (error) => {
      console.error('Error creating plan:', error);
      toast.error('Erro ao criar plano');
    },
  });

  const deletePlan = useMutation({
    mutationFn: async (planId: string) => {
      // Get current plan for audit
      const currentPlan = plans.find(p => p.id === planId);
      
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      // Log audit
      await logAudit(planId, 'delete', { deleted: true }, currentPlan as unknown as Record<string, unknown>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['plan-audit-logs'] });
      toast.success('Plano removido com sucesso');
    },
    onError: (error) => {
      console.error('Error deleting plan:', error);
      toast.error('Erro ao remover plano');
    },
  });

  const reorderPlans = useMutation({
    mutationFn: async (orderedPlanIds: string[]) => {
      // Update each plan's sort_order based on new position
      const updates = orderedPlanIds.map((planId, index) => 
        supabase
          .from('plans')
          .update({ sort_order: index })
          .eq('id', planId)
      );

      const results = await Promise.all(updates);
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        throw new Error('Failed to update some plans');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Ordem dos planos atualizada');
    },
    onError: (error) => {
      console.error('Error reordering plans:', error);
      toast.error('Erro ao reordenar planos');
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

  const activePlans = plans.filter(p => p.is_active);

  return {
    plans,
    activePlans,
    isLoading,
    updatePlan,
    createPlan,
    deletePlan,
    reorderPlans,
    getPlanById,
    getPlanLimit,
    auditLogs,
    auditLoading,
    refetchAudit,
  };
}
