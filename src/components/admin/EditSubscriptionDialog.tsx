import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditSubscriptionDialogProps {
  client: {
    user_id: string;
    full_name: string | null;
    email: string | null;
    plan: string;
    subscription_status: 'active' | 'inactive' | 'cancelled' | 'trial';
  };
}

const PLAN_OPTIONS = [
  { value: 'starter', label: 'Gratuito' },
  { value: 'pro', label: 'Pro' },
  { value: 'plus', label: 'Plus' },
  { value: 'enterprise', label: 'Enterprise' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'trial', label: 'Trial' },
];

export function EditSubscriptionDialog({ client }: EditSubscriptionDialogProps) {
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState(client.plan);
  const [status, setStatus] = useState(client.subscription_status);
  const queryClient = useQueryClient();

  const updateSubscription = useMutation({
    mutationFn: async () => {
      // Cast plan to the expected type (database enum includes 'plus' now)
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          plan: plan as any, 
          status 
        })
        .eq('user_id', client.user_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
      toast.success('Assinatura atualizada com sucesso');
      setOpen(false);
    },
    onError: (error) => {
      console.error('Error updating subscription:', error);
      toast.error('Erro ao atualizar assinatura');
    },
  });

  const handleOpen = () => {
    setPlan(client.plan);
    setStatus(client.subscription_status);
    setOpen(true);
  };

  return (
    <>
      <Button variant="ghost" size="icon" onClick={handleOpen}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Assinatura</DialogTitle>
            <DialogDescription>
              Alterar plano e status de {client.full_name || client.email || 'cliente'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Plano</Label>
              <Select value={plan} onValueChange={(v) => setPlan(v as typeof plan)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAN_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => updateSubscription.mutate()}
              disabled={updateSubscription.isPending}
            >
              {updateSubscription.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
