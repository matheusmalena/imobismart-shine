import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Ban, CheckCircle } from 'lucide-react';

interface BlockUserDialogProps {
  userId: string;
  userName: string | null;
  isBlocked: boolean;
}

export function BlockUserDialog({ userId, userName, isBlocked }: BlockUserDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const newStatus = isBlocked ? 'active' : 'inactive';
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: newStatus })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
      toast.success(isBlocked ? 'Usuário desbloqueado com sucesso!' : 'Usuário bloqueado com sucesso!');
      setOpen(false);
    },
    onError: () => {
      toast.error('Erro ao alterar status do usuário');
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={isBlocked ? "text-success hover:text-success" : "text-warning hover:text-warning"}
          title={isBlocked ? "Desbloquear usuário" : "Bloquear usuário"}
        >
          {isBlocked ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isBlocked ? 'Desbloquear Usuário' : 'Bloquear Usuário'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isBlocked 
              ? `Tem certeza que deseja desbloquear "${userName || 'este usuário'}"? O acesso será restaurado.`
              : `Tem certeza que deseja bloquear "${userName || 'este usuário'}"? O usuário não conseguirá acessar a plataforma.`
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => mutation.mutate()}
            className={isBlocked ? "bg-success hover:bg-success/90" : "bg-warning hover:bg-warning/90"}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Processando...' : (isBlocked ? 'Desbloquear' : 'Bloquear')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
