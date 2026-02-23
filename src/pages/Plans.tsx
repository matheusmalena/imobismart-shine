import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { usePlans } from '@/hooks/usePlans';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Crown,
  Check,
  X,
  FileText,
  HelpCircle,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import PlanCards from '@/components/plans/PlanCards';
import PlanComparison from '@/components/plans/PlanComparisonTable';
import PlanFAQ from '@/components/plans/PlanFAQ';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const PLAN_ORDER = ['free', 'starter', 'pro', 'plus', 'enterprise'];

export default function Plans() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { subscription, isLoading: subscriptionLoading, refetch: refetchSubscription } = useSubscription();
  const { activePlans, isLoading: plansLoading } = usePlans();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [downgradeDialogOpen, setDowngradeDialogOpen] = useState(false);
  const [pendingDowngradePlan, setPendingDowngradePlan] = useState<string | null>(null);

  const currentPlan = subscription?.plan || 'free';
  const hasStripeSubscription = !!subscription?.stripe_subscription_id;
  const isLoading = authLoading || subscriptionLoading || plansLoading;

  useEffect(() => {
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');
    if (status === 'success' && plan) {
      toast.success('Pagamento em processamento! Seu plano será ativado em breve.', {
        description: 'Você receberá uma confirmação quando o pagamento for aprovado.',
        duration: 6000,
      });
      setTimeout(() => {
        supabase.functions.invoke('check-subscription').then(() => refetchSubscription());
      }, 3000);
      navigate('/plans', { replace: true });
    }
  }, [searchParams, navigate, refetchSubscription]);

  if (!authLoading && !user) {
    navigate('/auth');
    return null;
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <Skeleton className="h-32 max-w-xl mx-auto" />
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getPlanIndex = (planId: string): number => PLAN_ORDER.indexOf(planId);

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'enterprise') {
      window.open('https://wa.me/5511999999999?text=Olá! Tenho interesse no plano Enterprise do ImobiSmart.', '_blank');
      return;
    }

    const planIndex = getPlanIndex(planId);
    const currentPlanIndex = getPlanIndex(currentPlan);
    const isDowngrade = planIndex < currentPlanIndex;

    // Downgrade to free or any downgrade — show confirmation
    if (isDowngrade) {
      setPendingDowngradePlan(planId);
      setDowngradeDialogOpen(true);
      return;
    }

    // Upgrade or new subscription
    await executePlanChange(planId);
  };

  const executePlanChange = async (planId: string) => {
    setLoadingPlan(planId);
    try {
      if (hasStripeSubscription) {
        // User already has a Stripe subscription — use change-plan
        const { data, error } = await supabase.functions.invoke('change-plan', {
          body: { planId },
        });

        if (error) throw new Error(error.message);

        if (data?.action === 'checkout_required') {
          // Fallback: no Stripe sub found, redirect to checkout
          await redirectToCheckout(planId);
          return;
        }

        if (data?.action === 'cancelled') {
          toast.success('Plano alterado para Free', {
            description: 'Você mantém acesso aos recursos até o fim do período pago.',
          });
        } else if (data?.action === 'updated') {
          toast.success('Plano atualizado com sucesso!', {
            description: 'A cobrança proporcional será aplicada na próxima fatura.',
          });
        }

        refetchSubscription();
      } else {
        // No Stripe subscription — create checkout session
        await redirectToCheckout(planId);
      }
    } catch (error) {
      console.error('Plan change error:', error);
      toast.error('Erro ao alterar plano', {
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const redirectToCheckout = async (planId: string) => {
    const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
      body: { planId },
    });

    if (error) throw new Error(error.message);
    if (data?.url) {
      window.location.href = data.url;
    } else {
      throw new Error('URL de checkout não retornada');
    }
  };

  const handleConfirmDowngrade = async () => {
    setDowngradeDialogOpen(false);
    if (pendingDowngradePlan) {
      await executePlanChange(pendingDowngradePlan);
      setPendingDowngradePlan(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Planos</h1>
            <p className="text-muted-foreground mt-1">Escolha o plano ideal para sua carteira de imóveis</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/subscription')} className="gap-2">
            <Crown className="h-4 w-4" />
            Minha Assinatura
          </Button>
        </div>

        <PlanCards
          activePlans={activePlans}
          currentPlan={currentPlan}
          loadingPlan={loadingPlan}
          onSelectPlan={handleSelectPlan}
          getPlanIndex={getPlanIndex}
          containerVariants={containerVariants}
        />

        <PlanComparison activePlans={activePlans} />
        <PlanFAQ />

        {/* Downgrade Confirmation Dialog */}
        <AlertDialog open={downgradeDialogOpen} onOpenChange={setDowngradeDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Confirmar Downgrade
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                {pendingDowngradePlan === 'free' ? (
                  <>
                    <p>Ao cancelar sua assinatura, você mantém acesso aos recursos do plano atual até o fim do período já pago.</p>
                    <p>Depois disso, sua conta voltará para o <strong>plano Free</strong> com limite de <strong>2 imóveis</strong>.</p>
                    <p className="text-destructive font-medium">Imóveis excedentes não serão excluídos, mas ficarão inacessíveis até que você faça upgrade.</p>
                  </>
                ) : (
                  <>
                    <p>Você está fazendo downgrade do seu plano. O novo limite de imóveis será menor.</p>
                    <p>A cobrança proporcional será ajustada automaticamente na sua próxima fatura.</p>
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDowngrade}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {loadingPlan ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Confirmar Downgrade
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
