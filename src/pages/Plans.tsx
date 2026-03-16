import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserData } from '@/hooks/useUserData';
import { useProperties } from '@/hooks/useProperties';
import { usePlans } from '@/hooks/usePlans';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/PageTransition';
import { LockedPagePlaceholder } from '@/components/common/LockedPagePlaceholder';
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
  Sparkles,
  FileText,
  HelpCircle,
  ArrowLeft,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const FAQ_ITEMS = [
  {
    question: 'Posso trocar de plano a qualquer momento?',
    answer: 'Sim! Você pode fazer upgrade ou downgrade do seu plano quando quiser. As alterações são aplicadas imediatamente.',
  },
  {
    question: 'Cada plano tem um limite fixo de imóveis?',
    answer: 'Sim. Cada plano possui um limite fixo: Free (2), Starter (10), Pro (25), Plus (50). Não há cobrança por excedente. Se precisar de mais de 50 imóveis, entre em contato para o plano Enterprise.',
  },
  {
    question: 'Quais formas de pagamento são aceitas?',
    answer: 'Aceitamos cartão de crédito, débito, Pix e boleto bancário. Os pagamentos são processados de forma segura pela Cakto.',
  },
  {
    question: 'O que acontece se eu cancelar meu plano?',
    answer: 'Ao cancelar, você mantém acesso aos recursos até o fim do período pago. Depois, sua conta volta para o plano Gratuito com limite de 2 imóveis. Os imóveis excedentes serão arquivados automaticamente.',
  },
  {
    question: 'Como funciona o plano Enterprise?',
    answer: 'O plano Enterprise é para quem precisa de mais de 50 imóveis. O limite é personalizado e a contratação é feita via atendimento direto. Entre em contato pelo WhatsApp.',
  },
];

export default function Plans() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { subscription, isLoading: subscriptionLoading, refetch: refetchSubscription } = useSubscription();
  const { plan: currentUserPlan } = useUserData();
  const { activeProperties } = useProperties();
  const { activePlans, isLoading: plansLoading } = usePlans();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);
  const [isDowngrading, setIsDowngrading] = useState(false);
  const queryClient = useQueryClient();

  // Force refresh subscription data when user returns to tab (e.g. after Cakto checkout)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries({ queryKey: ['user-data'] });
        refetchSubscription();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [queryClient, refetchSubscription]);

  const { organization, userRole: orgRole } = useOrganization();
  const isOrgMemberNotOwner = !!organization && orgRole !== 'owner';

  const currentPlan = currentUserPlan;
  const isLoading = authLoading || subscriptionLoading || plansLoading;

  const activeCount = activeProperties.length;
  const freeLimit = 2;
  const excessCount = Math.max(0, activeCount - freeLimit);

  // Handle return from checkout
  useEffect(() => {
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');
    
    if (status === 'success' && plan) {
      toast.success('Pagamento em processamento! Seu plano será ativado em breve.', {
        description: 'Você receberá uma confirmação quando o pagamento for aprovado.',
        duration: 6000,
      });
      refetchSubscription();
      navigate('/plans', { replace: true });
    }
  }, [searchParams, navigate, refetchSubscription]);

  // Block non-owner org members
  if (isOrgMemberNotOwner) {
    return (
      <DashboardLayout>
        <LockedPagePlaceholder
          icon={<Crown className="h-8 w-8 text-muted-foreground" />}
          title="Acesso Restrito"
          description="Apenas o proprietário da conta pode gerenciar planos e assinatura. Entre em contato com o administrador da sua organização."
          requiredPlan="enterprise"
          buttonLabel="Voltar ao Dashboard"
        />
      </DashboardLayout>
    );
  }


  if (authLoading || subscriptionLoading || plansLoading) {
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

  const getPlanIndex = (planId: string): number => {
    const order = ['free', 'starter', 'pro', 'plus', 'enterprise'];
    return order.indexOf(planId);
  };

  const getCtaText = (planId: string, isCurrentPlan: boolean, isUpgrade: boolean, isDowngrade: boolean) => {
    if (isCurrentPlan) return 'Plano Atual';
    if (planId === 'enterprise') return 'Falar com Vendas';
    if (isUpgrade) return 'Fazer Upgrade';
    if (isDowngrade) return 'Fazer Downgrade';
    return 'Selecionar';
  };

  const handleDowngradeToFree = async () => {
    setIsDowngrading(true);
    try {
      const { data, error } = await supabase.functions.invoke('downgrade-to-free');

      if (error) {
        throw new Error(error.message || 'Erro ao fazer downgrade');
      }

      const result = data as { success: boolean; archived_count: number; kept_count: number; message: string };

      toast.success('Downgrade realizado!', {
        description: result.message,
        duration: 6000,
      });

      refetchSubscription();
      setShowDowngradeDialog(false);
    } catch (error) {
      console.error('Downgrade error:', error);
      toast.error('Erro ao fazer downgrade', {
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
    } finally {
      setIsDowngrading(false);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    // Enterprise - WhatsApp contact
    if (planId === 'enterprise') {
      window.open('https://wa.me/5513997069979?text=Olá! Tenho interesse no plano Enterprise do ImobiSmart.', '_blank');
      return;
    }

    // Free - downgrade with archiving
    if (planId === 'free') {
      setShowDowngradeDialog(true);
      return;
    }

    // Starter / Pro / Plus - redirect to Cakto checkout URL from plans table
    setLoadingPlan(planId);
    
    try {
      const plan = activePlans.find(p => p.id === planId);
      const checkoutUrl = (plan as any)?.checkout_url;

      if (!checkoutUrl) {
        throw new Error('Link de checkout não configurado para este plano. Entre em contato com o suporte.');
      }

      // Append redirect URL and user email so webhook can match the correct account
      const separator = checkoutUrl.includes('?') ? '&' : '?';
      const userEmail = user?.email || '';
      const redirectUrl = `${checkoutUrl}${separator}redirect_url=${encodeURIComponent(window.location.origin + '/payment-success')}&src_email=${encodeURIComponent(userEmail)}`;
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Erro ao iniciar pagamento', {
        description: error instanceof Error ? error.message : 'Tente novamente em alguns instantes.',
      });
      setLoadingPlan(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button variant="outline" onClick={() => navigate('/subscription')} className="gap-2">
            <Crown className="h-4 w-4" />
            Minha Assinatura
          </Button>
        </div>

        {/* Header - Same style as landing page */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Planos Flexíveis
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Escolha o plano ideal para sua carteira de imóveis
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comece grátis e evolua conforme seu portfólio cresce. Sem surpresas.
          </p>
        </motion.div>

        {/* Plans Grid - Same style as landing page */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-[1500px] mx-auto"
        >
          {activePlans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan;
            const planIndex = getPlanIndex(plan.id);
            const currentPlanIndex = getPlanIndex(currentPlan);
            const isUpgrade = planIndex > currentPlanIndex;
            const isDowngrade = planIndex < currentPlanIndex;
            const features = Array.isArray(plan.features) ? plan.features : [];

            return (
              <motion.div
                key={plan.id}
                variants={itemVariants}
                className={`relative flex flex-col bg-card rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isCurrentPlan
                    ? "border-primary shadow-lg shadow-primary/15 ring-2 ring-primary/20 lg:scale-105 z-10"
                    : plan.is_highlighted && !isCurrentPlan
                    ? "border-primary/50 shadow-lg shadow-primary/10 ring-1 ring-primary/30"
                    : "border-border/50 shadow-card hover:border-primary/30"
                }`}
              >
                {/* Badges */}
                {isCurrentPlan ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg">
                      <Check className="h-3.5 w-3.5" />
                      Plano Atual
                    </span>
                  </div>
                ) : plan.is_highlighted ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg">
                      <Crown className="h-3.5 w-3.5" />
                      Mais Popular
                    </span>
                  </div>
                ) : null}

                {/* Plan Content */}
                <div className="text-center mb-6 pt-2">
                  <h3 className="text-lg font-bold text-card-foreground mb-2">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4 min-h-[32px]">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl md:text-4xl font-bold text-foreground">
                      {plan.price_label.includes('consulta') ? plan.price_label : `R$ ${plan.price}`}
                    </span>
                    {!plan.price_label.includes('consulta') && plan.price > 0 && (
                      <span className="text-sm text-muted-foreground">/mês</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6 flex-grow">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="p-0.5 rounded-full bg-primary/10 mt-0.5 shrink-0">
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground leading-tight">{String(feature)}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={`w-full mt-auto ${isCurrentPlan || plan.is_highlighted ? "shadow-lg" : ""}`}
                  variant={isCurrentPlan ? "secondary" : (plan.is_highlighted || isUpgrade) ? "default" : "outline"}
                  size="lg"
                  disabled={isCurrentPlan || loadingPlan === plan.id}
                  onClick={() => !isCurrentPlan && handleSelectPlan(plan.id)}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : isCurrentPlan ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : isUpgrade && !isCurrentPlan ? (
                    <Crown className="mr-2 h-4 w-4" />
                  ) : null}
                  {loadingPlan === plan.id ? 'Processando...' : getCtaText(plan.id, isCurrentPlan, isUpgrade, isDowngrade)}
                </Button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Feature Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-[1500px] mx-auto"
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Comparativo de Recursos
              </CardTitle>
              <CardDescription>
                Veja todos os recursos disponíveis em cada plano
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                 <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Recurso</th>
                      <th className="text-center py-3 px-2">Gratuito</th>
                      <th className="text-center py-3 px-2">Starter</th>
                      <th className="text-center py-3 px-2">Pro</th>
                      <th className="text-center py-3 px-2">Plus</th>
                      <th className="text-center py-3 px-2">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(() => {
                      const getPlanLimit = (planId: string) => {
                        const plan = activePlans.find(p => p.id === planId);
                        if (!plan) return '—';
                        return plan.property_limit === -1 ? 'Ilimitado' : plan.property_limit;
                      };
                      return (
                        <>
                          <tr className="transition-colors hover:bg-muted/50">
                            <td className="py-3 px-2">Limite de imóveis</td>
                            <td className="text-center py-3 px-2">{getPlanLimit('free')}</td>
                            <td className="text-center py-3 px-2">{getPlanLimit('starter')}</td>
                            <td className="text-center py-3 px-2">{getPlanLimit('pro')}</td>
                            <td className="text-center py-3 px-2">{getPlanLimit('plus')}</td>
                            <td className="text-center py-3 px-2">{getPlanLimit('enterprise')}</td>
                          </tr>
                          <tr className="transition-colors hover:bg-muted/50">
                            <td className="py-3 px-2">Dashboard básico</td>
                            <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                            <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                            <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                            <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                            <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                          </tr>
                          <tr className="transition-colors hover:bg-muted/50">
                            <td className="py-3 px-2">Gestão de inquilinos</td>
                            <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                            <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                            <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                            <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                            <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                          </tr>
                          <tr className="transition-colors hover:bg-muted/50">
                            <td className="py-3 px-2">Exportação CSV/Excel/JSON</td>
                            <td className="text-center py-3 px-2"><X className="h-4 w-4 text-destructive mx-auto" /></td>
                            <td className="text-center py-3 px-2"><X className="h-4 w-4 text-destructive mx-auto" /></td>
                            <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                            <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                            <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                          </tr>
                          <tr className="transition-colors hover:bg-muted/50">
                            <td className="py-3 px-2">Análise avançada</td>
                            <td className="text-center py-3 px-2"><X className="h-4 w-4 text-destructive mx-auto" /></td>
                            <td className="text-center py-3 px-2"><X className="h-4 w-4 text-destructive mx-auto" /></td>
                            <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                            <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                            <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                          </tr>
                          <tr className="transition-colors hover:bg-muted/50">
                            <td className="py-3 px-2">Relatórios PDF</td>
                            <td className="text-center py-3 px-2"><X className="h-4 w-4 text-destructive mx-auto" /></td>
                            <td className="text-center py-3 px-2"><X className="h-4 w-4 text-destructive mx-auto" /></td>
                            <td className="text-center py-3 px-2"><X className="h-4 w-4 text-destructive mx-auto" /></td>
                            <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                            <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                          </tr>
                          <tr className="transition-colors hover:bg-muted/50">
                            <td className="py-3 px-2">Recomendações IA</td>
                            <td className="text-center py-3 px-2"><X className="h-4 w-4 text-destructive mx-auto" /></td>
                            <td className="text-center py-3 px-2"><X className="h-4 w-4 text-destructive mx-auto" /></td>
                            <td className="text-center py-3 px-2"><X className="h-4 w-4 text-destructive mx-auto" /></td>
                            <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                            <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                          </tr>
                          <tr className="transition-colors hover:bg-muted/50">
                            <td className="py-3 px-2">Gestão de equipe</td>
                            <td className="text-center py-3 px-2"><X className="h-4 w-4 text-destructive mx-auto" /></td>
                            <td className="text-center py-3 px-2"><X className="h-4 w-4 text-destructive mx-auto" /></td>
                            <td className="text-center py-3 px-2"><X className="h-4 w-4 text-destructive mx-auto" /></td>
                            <td className="text-center py-3 px-2"><X className="h-4 w-4 text-destructive mx-auto" /></td>
                            <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                          </tr>
                          <tr className="transition-colors hover:bg-muted/50">
                            <td className="py-3 px-2">Suporte prioritário</td>
                            <td className="text-center py-3 px-2"><X className="h-4 w-4 text-destructive mx-auto" /></td>
                            <td className="text-center py-3 px-2"><X className="h-4 w-4 text-destructive mx-auto" /></td>
                            <td className="text-center py-3 px-2"><X className="h-4 w-4 text-destructive mx-auto" /></td>
                            <td className="text-center py-3 px-2"><X className="h-4 w-4 text-destructive mx-auto" /></td>
                            <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                          </tr>
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="max-w-[1500px] mx-auto"
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                Perguntas Frequentes
              </CardTitle>
              <CardDescription>
                Tire suas dúvidas sobre os planos e pagamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {FAQ_ITEMS.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Downgrade to Free Confirmation Dialog */}
      <AlertDialog open={showDowngradeDialog} onOpenChange={setShowDowngradeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Confirmar Downgrade para Gratuito
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Ao fazer downgrade para o plano Gratuito, seu limite de imóveis será reduzido para <strong>{freeLimit} imóveis</strong>.
              </p>
              {excessCount > 0 ? (
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-warning-foreground">
                  <p className="font-medium">
                    ⚠️ Você possui {activeCount} imóveis ativos. {excessCount} {excessCount === 1 ? 'imóvel será arquivado' : 'imóveis serão arquivados'} automaticamente.
                  </p>
                  <p className="text-sm mt-1 text-muted-foreground">
                    Os {freeLimit} imóveis mais recentes serão mantidos. Você pode desarquivar os demais fazendo upgrade novamente.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Você possui {activeCount} {activeCount === 1 ? 'imóvel ativo' : 'imóveis ativos'}, dentro do limite. Nenhum imóvel será arquivado.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDowngrading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDowngradeToFree}
              disabled={isDowngrading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDowngrading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar Downgrade'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}
