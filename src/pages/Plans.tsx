import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserData } from '@/hooks/useUserData';
import { useProperties } from '@/hooks/useProperties';
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

  // Redirect if not authenticated
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
      window.open('https://wa.me/5511999999999?text=Olá! Tenho interesse no plano Enterprise do ImobiSmart.', '_blank');
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

      window.location.href = checkoutUrl;
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1400px] mx-auto"
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
          className="max-w-[1200px] mx-auto"
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
                {(() => {
                  const getPlanLimit = (planId: string) => {
                    const plan = activePlans.find(p => p.id === planId);
                    if (!plan) return '—';
                    return plan.property_limit === -1 ? 'Ilimitado' : plan.property_limit;
                  };

                  const categories = [
                    {
                      name: 'Geral',
                      features: [
                        { name: 'Limite de imóveis', values: [getPlanLimit('free'), getPlanLimit('starter'), getPlanLimit('pro'), getPlanLimit('plus'), getPlanLimit('enterprise')] },
                        { name: 'Dashboard com métricas', values: [true, true, true, true, true] },
                        { name: 'Aplicativo responsivo', values: [true, true, true, true, true] },
                      ],
                    },
                    {
                      name: 'Gestão',
                      features: [
                        { name: 'Cadastro de imóveis com fotos', values: [true, true, true, true, true] },
                        { name: 'Gestão de inquilinos', values: [true, true, true, true, true] },
                        { name: 'Contratos de locação', values: [true, true, true, true, true] },
                        { name: 'Galeria de fotos por imóvel', values: [true, true, true, true, true] },
                        { name: 'Alertas de vencimento', values: [false, true, true, true, true] },
                        { name: 'Controle financeiro por imóvel', values: [false, true, true, true, true] },
                      ],
                    },
                    {
                      name: 'Ferramentas',
                      features: [
                        { name: 'Upload de documentos', values: [true, true, true, true, true] },
                        { name: 'Exportação CSV / Excel / JSON', values: [false, false, true, true, true] },
                        { name: 'Relatórios em PDF', values: [false, false, false, true, true] },
                        { name: 'Ranking de performance', values: [false, false, true, true, true] },
                        { name: 'Copiloto IA (recomendações)', values: [false, false, false, true, true] },
                      ],
                    },
                    {
                      name: 'Integrações',
                      features: [
                        { name: 'WhatsApp Business (lembretes)', values: [false, false, true, true, true] },
                      ],
                    },
                    {
                      name: 'Suporte',
                      features: [
                        { name: 'Suporte por e-mail', values: [true, true, true, true, true] },
                        { name: 'Suporte prioritário', values: [false, false, false, false, true] },
                        { name: 'Gestão de equipe', values: [false, false, false, false, true] },
                      ],
                    },
                  ];

                  const planHeaders = ['Gratuito', 'Starter', 'Pro', 'Plus', 'Enterprise'];

                  return (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 w-[220px]">Recurso</th>
                          {planHeaders.map((name) => (
                            <th key={name} className="text-center py-3 px-2 min-w-[90px]">{name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((cat) => (
                          <>
                            <tr key={`cat-${cat.name}`} className="bg-muted/50">
                              <td colSpan={6} className="py-2.5 px-2 font-bold text-foreground text-xs uppercase tracking-wider">
                                {cat.name}
                              </td>
                            </tr>
                            {cat.features.map((feature) => (
                              <tr key={feature.name} className="transition-colors hover:bg-muted/50 border-b border-border/30">
                                <td className="py-3 px-2 text-muted-foreground">{feature.name}</td>
                                {feature.values.map((val, idx) => (
                                  <td key={idx} className="text-center py-3 px-2">
                                    {typeof val === 'string' || typeof val === 'number' ? (
                                      <span className="text-sm font-semibold text-foreground">{val}</span>
                                    ) : val ? (
                                      <Check className="h-4 w-4 text-primary mx-auto" />
                                    ) : (
                                      <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                * O plano Enterprise possui limites personalizados. Entre em contato para mais detalhes.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="max-w-3xl mx-auto"
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
    </DashboardLayout>
  );
}
