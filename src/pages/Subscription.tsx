import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserData } from '@/hooks/useUserData';
import { usePropertyLimit } from '@/hooks/usePropertyLimit';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PaymentHistory } from '@/components/subscription/PaymentHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
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
import {
  
  CreditCard,
  Calendar,
  Crown,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Clock,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const PLAN_NAMES: Record<string, string> = {
  free: 'Gratuito',
  starter: 'Starter',
  pro: 'Pro',
  plus: 'Plus',
  enterprise: 'Enterprise',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: 'Ativa', color: 'bg-green-500/10 text-green-600 border-green-200', icon: <CheckCircle className="h-4 w-4" /> },
  trial: { label: 'Período de Teste', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: <Clock className="h-4 w-4" /> },
  inactive: { label: 'Inativa', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200', icon: <AlertTriangle className="h-4 w-4" /> },
  cancelled: { label: 'Cancelada', color: 'bg-red-500/10 text-red-600 border-red-200', icon: <XCircle className="h-4 w-4" /> },
};

export default function Subscription() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { subscription, isLoading: subscriptionLoading, refetch } = useSubscription();
  const { profile } = useUserData();
  const { limit, activeCount, isUnlimited } = usePropertyLimit();
  const [isCancelling, setIsCancelling] = useState(false);

  const isLoading = authLoading || subscriptionLoading;

  // Redirect if not authenticated
  if (!authLoading && !user) {
    navigate('/auth');
    return null;
  }

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('cancel-cakto-subscription');

      if (error) {
        throw new Error(error.message || 'Erro ao cancelar assinatura');
      }

      toast.success('Assinatura cancelada com sucesso', {
        description: 'Você foi revertido para o plano Gratuito.',
      });
      
      refetch();
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Erro ao cancelar assinatura', {
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <DashboardLayout>
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      ) : (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 pb-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Minha Assinatura</h1>
            <p className="text-muted-foreground mt-1">Gerencie seu plano e pagamentos</p>
          </div>
          <Button onClick={() => navigate('/plans')} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Ver Planos
          </Button>
        </motion.div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Property Usage Card */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Uso de Imóveis</CardTitle>
                  <CardDescription>Consumo do seu plano atual</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plano</span>
                  <span className="text-lg font-bold text-foreground">
                    {PLAN_NAMES[currentPlan] || currentPlan}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Imóveis ativos</span>
                    <span className="font-semibold text-foreground">
                      {activeCount} / {isUnlimited ? '∞' : limit}
                    </span>
                  </div>
                  {!isUnlimited && (
                    <Progress
                      value={Math.min((activeCount / limit) * 100, 100)}
                      className="h-3"
                    />
                  )}
                  <p className="text-xs text-muted-foreground">
                    {isUnlimited
                      ? 'Seu plano possui imóveis ilimitados.'
                      : activeCount >= limit
                        ? 'Você atingiu o limite do seu plano. Faça upgrade para adicionar mais imóveis.'
                        : `Você ainda pode adicionar ${limit - activeCount} ${limit - activeCount === 1 ? 'imóvel' : 'imóveis'}.`
                    }
                  </p>
                </div>

                {!isUnlimited && activeCount >= limit && (
                  <Button onClick={() => navigate('/plans')} className="w-full gap-2" size="sm">
                    <Sparkles className="h-4 w-4" />
                    Fazer Upgrade
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Current Plan Card */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Plano Atual</CardTitle>
                  <CardDescription>Detalhes da sua assinatura atual</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Plan Name */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plano</span>
                  <span className="text-2xl font-bold text-foreground">
                    {PLAN_NAMES[currentPlan] || currentPlan}
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className={`gap-1.5 ${statusConfig.color}`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Start Date */}
                {subscription?.started_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Início</span>
                    <span className="text-foreground">
                      {format(new Date(subscription.started_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                )}

                {/* Expiration */}
                {subscription?.expires_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Próxima cobrança</span>
                    <span className="text-foreground">
                      {format(new Date(subscription.expires_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t space-y-3">
                  {canCancel && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full gap-2" disabled={isCancelling}>
                          {isCancelling ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          Cancelar Assinatura
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancelar Assinatura?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ao cancelar, você perderá acesso aos recursos do plano {PLAN_NAMES[currentPlan]} e será revertido para o plano Gratuito. Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Manter Assinatura</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleCancelSubscription}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Confirmar Cancelamento
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {currentStatus === 'cancelled' && (
                    <Button onClick={() => navigate('/plans')} className="w-full gap-2">
                      <Sparkles className="h-4 w-4" />
                      Reativar Assinatura
                    </Button>
                  )}

                  {currentPlan === 'free' && currentStatus !== 'cancelled' && (
                    <Button onClick={() => navigate('/plans')} className="w-full gap-2">
                      <Crown className="h-4 w-4" />
                      Fazer Upgrade
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Info Card */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Pagamento</CardTitle>
                  <CardDescription>Informações de pagamento e cobrança</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {isPaid ? (
                  <>
                    {/* Payment Method */}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Método</span>
                      <Badge variant="outline" className="gap-1.5">
                        <CreditCard className="h-3.5 w-3.5" />
                        Cakto
                      </Badge>
                    </div>

                    {/* Payer Email */}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="text-foreground text-sm">
                        {profile?.email || user?.email || '—'}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground text-center">
                        Para gerenciar detalhes do pagamento, acesse o painel da Cakto.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="p-4 rounded-lg bg-muted mb-4">
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-foreground mb-2">Nenhum pagamento ativo</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Você está no plano Gratuito. Faça upgrade para desbloquear recursos premium.
                    </p>
                    <Button onClick={() => navigate('/plans')} size="sm" className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      Ver Planos
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Payment History */}
        <motion.div variants={itemVariants}>
          <PaymentHistory />
        </motion.div>

        {/* Info Banner */}
        <motion.div variants={itemVariants}>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-start gap-4 py-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-1">Sobre renovações</h4>
                <p className="text-sm text-muted-foreground">
                  Sua assinatura é renovada automaticamente a cada mês. Você pode cancelar a qualquer momento e manterá acesso até o fim do período pago.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      )}
    </DashboardLayout>
  );
}
