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
  Crown,
  Check,
  Sparkles,
  FileText,
  HelpCircle,
  ArrowLeft,
  Loader2,
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
    answer: 'Sim! Você pode fazer upgrade ou downgrade do seu plano quando quiser. As alterações são aplicadas imediatamente e o valor é calculado proporcionalmente.',
  },
  {
    question: 'Como funciona o período de teste?',
    answer: 'Novos usuários podem experimentar o plano Pro gratuitamente por 7 dias. Não é necessário cartão de crédito para começar.',
  },
  {
    question: 'Quais formas de pagamento são aceitas?',
    answer: 'Aceitamos cartão de crédito, débito, Pix e boleto bancário. Os pagamentos são processados de forma segura.',
  },
  {
    question: 'O que acontece se eu cancelar meu plano?',
    answer: 'Ao cancelar, você mantém acesso aos recursos até o fim do período pago. Depois, sua conta volta para o plano Gratuito com limite de imóveis reduzido.',
  },
  {
    question: 'Existe desconto para pagamento anual?',
    answer: 'Sim! Ao optar pelo pagamento anual, você economiza até 20% em comparação ao pagamento mensal.',
  },
];

export default function Plans() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { subscription, isLoading: subscriptionLoading, refetch: refetchSubscription } = useSubscription();
  const { activePlans, isLoading: plansLoading } = usePlans();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const currentPlan = subscription?.plan || 'starter';
  const isLoading = authLoading || subscriptionLoading || plansLoading;

  // Handle return from Mercado Pago checkout
  useEffect(() => {
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');
    
    if (status === 'success' && plan) {
      toast.success('Pagamento em processamento! Seu plano será ativado em breve.', {
        description: 'Você receberá uma confirmação quando o pagamento for aprovado.',
        duration: 6000,
      });
      // Refresh subscription data
      refetchSubscription();
      // Clear URL params
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
    const order = ['starter', 'pro', 'plus', 'enterprise'];
    return order.indexOf(planId);
  };

  const getCtaText = (planId: string, isCurrentPlan: boolean, isUpgrade: boolean, isDowngrade: boolean) => {
    if (isCurrentPlan) return 'Plano Atual';
    if (planId === 'enterprise') return 'Falar com Vendas';
    if (isUpgrade) return 'Fazer Upgrade';
    if (isDowngrade) return 'Fazer Downgrade';
    return 'Selecionar';
  };

  const handleSelectPlan = async (planId: string) => {
    // Enterprise - WhatsApp contact
    if (planId === 'enterprise') {
      window.open('https://wa.me/5511999999999?text=Olá! Tenho interesse no plano Enterprise do ImobiSmart.', '_blank');
      return;
    }

    // Starter - no payment needed (downgrade)
    if (planId === 'starter') {
      toast.info('Para fazer downgrade para o plano Gratuito, entre em contato com nosso suporte.');
      return;
    }

    // Pro or Plus - redirect to Mercado Pago checkout
    if (planId === 'pro' || planId === 'plus') {
      setLoadingPlan(planId);
      
      try {
        const { data, error } = await supabase.functions.invoke('create-mp-subscription', {
          body: { 
            planId,
            backUrl: window.location.origin,
          },
        });

        if (error) {
          throw new Error(error.message || 'Erro ao processar pagamento');
        }

        if (data?.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          throw new Error('URL de checkout não recebida');
        }
      } catch (error) {
        console.error('Checkout error:', error);
        toast.error('Erro ao iniciar pagamento', {
          description: error instanceof Error ? error.message : 'Tente novamente em alguns instantes.',
        });
        setLoadingPlan(null);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

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
          className="max-w-4xl mx-auto"
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
                      <th className="text-center py-3 px-2">Pro</th>
                      <th className="text-center py-3 px-2">Plus</th>
                      <th className="text-center py-3 px-2">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-3 px-2">Limite de imóveis</td>
                      <td className="text-center py-3 px-2">3</td>
                      <td className="text-center py-3 px-2">15</td>
                      <td className="text-center py-3 px-2">50</td>
                      <td className="text-center py-3 px-2">Ilimitado</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2">Dashboard básico</td>
                      <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2">Gestão de inquilinos</td>
                      <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2">Exportação CSV/Excel/JSON</td>
                      <td className="text-center py-3 px-2 text-muted-foreground">—</td>
                      <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2">Análise avançada</td>
                      <td className="text-center py-3 px-2 text-muted-foreground">—</td>
                      <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2">Relatórios PDF</td>
                      <td className="text-center py-3 px-2 text-muted-foreground">—</td>
                      <td className="text-center py-3 px-2 text-muted-foreground">—</td>
                      <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2">Recomendações IA</td>
                      <td className="text-center py-3 px-2 text-muted-foreground">—</td>
                      <td className="text-center py-3 px-2 text-muted-foreground">—</td>
                      <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                      <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2">Gestão de equipe</td>
                      <td className="text-center py-3 px-2 text-muted-foreground">—</td>
                      <td className="text-center py-3 px-2 text-muted-foreground">—</td>
                      <td className="text-center py-3 px-2 text-muted-foreground">—</td>
                      <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2">Suporte prioritário</td>
                      <td className="text-center py-3 px-2 text-muted-foreground">—</td>
                      <td className="text-center py-3 px-2 text-muted-foreground">—</td>
                      <td className="text-center py-3 px-2 text-muted-foreground">—</td>
                      <td className="text-center py-3 px-2"><Check className="h-4 w-4 text-primary mx-auto" /></td>
                    </tr>
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
    </DashboardLayout>
  );
}
