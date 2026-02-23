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
  X,
  FileText,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const FAQ_ITEMS = [
  { question: 'Posso trocar de plano a qualquer momento?', answer: 'Sim! Você pode fazer upgrade ou downgrade do seu plano quando quiser. As alterações são aplicadas imediatamente.' },
  { question: 'O que acontece se eu ultrapassar o limite de imóveis?', answer: 'Você não é bloqueado! Imóveis adicionais são cobrados automaticamente na sua fatura mensal pelo valor indicado no seu plano.' },
  { question: 'Quais formas de pagamento são aceitas?', answer: 'Aceitamos cartão de crédito e débito. Os pagamentos são processados de forma segura via Stripe.' },
  { question: 'O que acontece se eu cancelar meu plano?', answer: 'Ao cancelar, você mantém acesso até o fim do período pago. Depois, sua conta volta para o plano Free com limite de 2 imóveis.' },
  { question: 'Existe desconto para pagamento anual?', answer: 'Em breve! Estamos preparando planos anuais com até 20% de desconto.' },
];

const PLAN_ORDER = ['free', 'starter', 'pro', 'plus', 'enterprise'];

export default function Plans() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { subscription, isLoading: subscriptionLoading, refetch: refetchSubscription } = useSubscription();
  const { activePlans, isLoading: plansLoading } = usePlans();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const currentPlan = subscription?.plan || 'free';
  const isLoading = authLoading || subscriptionLoading || plansLoading;

  useEffect(() => {
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');
    if (status === 'success' && plan) {
      toast.success('Pagamento em processamento! Seu plano será ativado em breve.', {
        description: 'Você receberá uma confirmação quando o pagamento for aprovado.',
        duration: 6000,
      });
      // Check subscription status after a short delay
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

  const getCtaText = (planId: string, isCurrentPlan: boolean, isUpgrade: boolean, isDowngrade: boolean) => {
    if (isCurrentPlan) return 'Plano Atual';
    if (planId === 'enterprise') return 'Falar com Vendas';
    if (planId === 'free') return 'Plano Gratuito';
    if (isUpgrade) return 'Fazer Upgrade';
    if (isDowngrade) return 'Fazer Downgrade';
    return 'Selecionar';
  };

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'enterprise') {
      window.open('https://wa.me/5511999999999?text=Olá! Tenho interesse no plano Enterprise do ImobiSmart.', '_blank');
      return;
    }

    if (planId === 'free') {
      toast.info('Para fazer downgrade para o plano Free, acesse "Gerenciar Pagamento" na sua assinatura.');
      return;
    }

    // Stripe Checkout
    setLoadingPlan(planId);
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: { planId },
      });

      if (error) throw new Error(error.message);
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não retornada');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Erro ao iniciar pagamento', {
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
      setLoadingPlan(null);
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

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 max-w-[1500px] mx-auto"
        >
          {activePlans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan;
            const planIndex = getPlanIndex(plan.id);
            const currentPlanIndex = getPlanIndex(currentPlan);
            const isUpgrade = planIndex > currentPlanIndex;
            const isDowngrade = planIndex < currentPlanIndex;
            const features = Array.isArray(plan.features) ? plan.features : [];
            const extraPrice = (plan as any).extra_property_price;

            return (
              <motion.div
                key={plan.id}
                variants={itemVariants}
                className={`relative flex flex-col bg-card rounded-2xl p-5 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isCurrentPlan
                    ? "border-primary shadow-lg shadow-primary/15 ring-2 ring-primary/20 lg:scale-105 z-10"
                    : plan.is_highlighted && !isCurrentPlan
                    ? "border-primary/50 shadow-lg shadow-primary/10 ring-1 ring-primary/30"
                    : "border-border/50 shadow-card hover:border-primary/30"
                }`}
              >
                {isCurrentPlan ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg">
                      <Check className="h-3 w-3" />
                      Plano Atual
                    </span>
                  </div>
                ) : plan.is_highlighted ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg">
                      <Crown className="h-3 w-3" />
                      Mais Popular
                    </span>
                  </div>
                ) : null}

                <div className="text-center mb-5 pt-2">
                  <h3 className="text-lg font-bold text-card-foreground mb-1">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 min-h-[28px]">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-foreground">
                      {plan.price_label.includes('consulta') ? plan.price_label : plan.price === 0 ? 'Grátis' : `R$ ${plan.price}`}
                    </span>
                    {!plan.price_label.includes('consulta') && plan.price > 0 && (
                      <span className="text-sm text-muted-foreground">/mês</span>
                    )}
                  </div>
                  {extraPrice && extraPrice > 0 && plan.id !== 'enterprise' && (
                    <p className="text-xs text-primary mt-1.5 font-medium">
                      + R$ {Number(extraPrice).toFixed(2).replace('.', ',')}/imóvel extra
                    </p>
                  )}
                </div>

                <ul className="space-y-2.5 mb-5 flex-grow">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="p-0.5 rounded-full bg-primary/10 mt-0.5 shrink-0">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground leading-tight">{String(feature)}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full mt-auto ${isCurrentPlan || plan.is_highlighted ? "shadow-lg" : ""}`}
                  variant={isCurrentPlan ? "secondary" : (plan.is_highlighted || isUpgrade) ? "default" : "outline"}
                  size="sm"
                  disabled={isCurrentPlan || loadingPlan === plan.id || plan.id === 'free'}
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
          className="max-w-5xl mx-auto"
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Comparativo de Recursos
              </CardTitle>
              <CardDescription>Veja todos os recursos disponíveis em cada plano</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Recurso</th>
                      <th className="text-center py-3 px-2">Free</th>
                      <th className="text-center py-3 px-2">Starter</th>
                      <th className="text-center py-3 px-2">Pro</th>
                      <th className="text-center py-3 px-2">Plus</th>
                      <th className="text-center py-3 px-2">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(() => {
                      const getPlanLimit = (planId: string) => {
                        const p = activePlans.find(pl => pl.id === planId);
                        if (!p) return '—';
                        return p.property_limit === -1 ? 'Ilimitado' : p.property_limit;
                      };
                      const getExtraPrice = (planId: string) => {
                        const p = activePlans.find(pl => pl.id === planId);
                        const ep = (p as any)?.extra_property_price;
                        if (!ep || ep === 0) return '—';
                        return `R$ ${Number(ep).toFixed(2).replace('.', ',')}`;
                      };
                      const Chk = () => <Check className="h-4 w-4 text-primary mx-auto" />;
                      const Nope = () => <X className="h-4 w-4 text-destructive mx-auto" />;
                      return (
                        <>
                          <tr className="hover:bg-muted/50"><td className="py-3 px-2">Limite de imóveis</td><td className="text-center py-3 px-2">{getPlanLimit('free')}</td><td className="text-center py-3 px-2">{getPlanLimit('starter')}</td><td className="text-center py-3 px-2">{getPlanLimit('pro')}</td><td className="text-center py-3 px-2">{getPlanLimit('plus')}</td><td className="text-center py-3 px-2">{getPlanLimit('enterprise')}</td></tr>
                          <tr className="hover:bg-muted/50"><td className="py-3 px-2">Imóvel extra</td><td className="text-center py-3 px-2">—</td><td className="text-center py-3 px-2">{getExtraPrice('starter')}</td><td className="text-center py-3 px-2">{getExtraPrice('pro')}</td><td className="text-center py-3 px-2">{getExtraPrice('plus')}</td><td className="text-center py-3 px-2">{getExtraPrice('enterprise')}</td></tr>
                          <tr className="hover:bg-muted/50"><td className="py-3 px-2">Dashboard básico</td><td className="text-center py-3 px-2"><Chk /></td><td className="text-center py-3 px-2"><Chk /></td><td className="text-center py-3 px-2"><Chk /></td><td className="text-center py-3 px-2"><Chk /></td><td className="text-center py-3 px-2"><Chk /></td></tr>
                          <tr className="hover:bg-muted/50"><td className="py-3 px-2">Gestão de inquilinos</td><td className="text-center py-3 px-2"><Chk /></td><td className="text-center py-3 px-2"><Chk /></td><td className="text-center py-3 px-2"><Chk /></td><td className="text-center py-3 px-2"><Chk /></td><td className="text-center py-3 px-2"><Chk /></td></tr>
                          <tr className="hover:bg-muted/50"><td className="py-3 px-2">Exportação CSV/Excel</td><td className="text-center py-3 px-2"><Nope /></td><td className="text-center py-3 px-2"><Chk /></td><td className="text-center py-3 px-2"><Chk /></td><td className="text-center py-3 px-2"><Chk /></td><td className="text-center py-3 px-2"><Chk /></td></tr>
                          <tr className="hover:bg-muted/50"><td className="py-3 px-2">Análise avançada</td><td className="text-center py-3 px-2"><Nope /></td><td className="text-center py-3 px-2"><Nope /></td><td className="text-center py-3 px-2"><Chk /></td><td className="text-center py-3 px-2"><Chk /></td><td className="text-center py-3 px-2"><Chk /></td></tr>
                          <tr className="hover:bg-muted/50"><td className="py-3 px-2">Relatórios PDF</td><td className="text-center py-3 px-2"><Nope /></td><td className="text-center py-3 px-2"><Nope /></td><td className="text-center py-3 px-2"><Nope /></td><td className="text-center py-3 px-2"><Chk /></td><td className="text-center py-3 px-2"><Chk /></td></tr>
                          <tr className="hover:bg-muted/50"><td className="py-3 px-2">Recomendações IA</td><td className="text-center py-3 px-2"><Nope /></td><td className="text-center py-3 px-2"><Nope /></td><td className="text-center py-3 px-2"><Nope /></td><td className="text-center py-3 px-2"><Chk /></td><td className="text-center py-3 px-2"><Chk /></td></tr>
                          <tr className="hover:bg-muted/50"><td className="py-3 px-2">Gestão de equipe</td><td className="text-center py-3 px-2"><Nope /></td><td className="text-center py-3 px-2"><Nope /></td><td className="text-center py-3 px-2"><Nope /></td><td className="text-center py-3 px-2"><Nope /></td><td className="text-center py-3 px-2"><Chk /></td></tr>
                          <tr className="hover:bg-muted/50"><td className="py-3 px-2">Suporte prioritário</td><td className="text-center py-3 px-2"><Nope /></td><td className="text-center py-3 px-2"><Nope /></td><td className="text-center py-3 px-2"><Nope /></td><td className="text-center py-3 px-2"><Chk /></td><td className="text-center py-3 px-2"><Chk /></td></tr>
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
          className="max-w-3xl mx-auto"
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                Perguntas Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {FAQ_ITEMS.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
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
