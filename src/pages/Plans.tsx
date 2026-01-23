import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { usePlans } from '@/hooks/usePlans';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Building2,
  BarChart3,
  FileText,
  Users,
  Zap,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

const PLAN_ICONS: Record<string, React.ReactNode> = {
  starter: <Building2 className="h-6 w-6" />,
  pro: <BarChart3 className="h-6 w-6" />,
  plus: <Sparkles className="h-6 w-6" />,
  enterprise: <Users className="h-6 w-6" />,
};

const PLAN_COLORS: Record<string, string> = {
  starter: 'text-muted-foreground',
  pro: 'text-primary',
  plus: 'text-purple-500',
  enterprise: 'text-amber-500',
};

export default function Plans() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { subscription, isLoading: subscriptionLoading } = useSubscription();
  const { activePlans, isLoading: plansLoading } = usePlans();

  const currentPlan = subscription?.plan || 'starter';
  const isLoading = authLoading || subscriptionLoading || plansLoading;

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[400px]" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getPlanIndex = (planId: string): number => {
    const order = ['starter', 'pro', 'plus', 'enterprise'];
    return order.indexOf(planId);
  };

  const handleSelectPlan = (planId: string) => {
    // In a real app, this would trigger a payment flow
    console.log('Selected plan:', planId);
    // For now, just show that it's not implemented
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Crown className="h-4 w-4" />
            Escolha seu Plano
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Desbloqueie todo o potencial do ImobiSmart
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Compare os planos e escolha o melhor para gerenciar sua carteira de imóveis
          </p>
        </motion.div>

        {/* Plans Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
        >
          {activePlans.map((plan, index) => {
            const isCurrentPlan = plan.id === currentPlan;
            const isPopular = plan.is_highlighted;
            const planIndex = getPlanIndex(plan.id);
            const currentPlanIndex = getPlanIndex(currentPlan);
            const isUpgrade = planIndex > currentPlanIndex;
            const isDowngrade = planIndex < currentPlanIndex;
            const features = Array.isArray(plan.features) ? plan.features : [];

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card 
                  className={cn(
                    "relative h-full flex flex-col transition-all duration-300",
                    isCurrentPlan && "ring-2 ring-primary shadow-lg",
                    isPopular && !isCurrentPlan && "ring-2 ring-primary/50",
                    "hover:shadow-xl hover:-translate-y-1"
                  )}
                >
                  {/* Badges */}
                  <div className="absolute -top-3 left-0 right-0 flex justify-center gap-2">
                    {isCurrentPlan && (
                      <Badge className="bg-primary text-primary-foreground shadow-md">
                        Plano Atual
                      </Badge>
                    )}
                    {isPopular && !isCurrentPlan && (
                      <Badge variant="secondary" className="shadow-md">
                        <Zap className="h-3 w-3 mr-1" />
                        Mais Popular
                      </Badge>
                    )}
                  </div>

                  <CardHeader className="text-center pb-4 pt-8">
                    <div className={cn(
                      "mx-auto p-3 rounded-full bg-muted mb-3",
                      PLAN_COLORS[plan.id]
                    )}>
                      {PLAN_ICONS[plan.id] || <Building2 className="h-6 w-6" />}
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="min-h-[40px]">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    {/* Price */}
                    <div className="text-center mb-6">
                      {plan.price > 0 ? (
                        <>
                          <span className="text-4xl font-bold">
                            R$ {plan.price}
                          </span>
                          <span className="text-muted-foreground">/mês</span>
                        </>
                      ) : (
                        <span className="text-4xl font-bold">Grátis</span>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {plan.property_limit === 999 
                          ? 'Imóveis ilimitados' 
                          : `Até ${plan.property_limit} imóveis`}
                      </p>
                    </div>

                    {/* Features */}
                    <div className="flex-1 space-y-3 mb-6">
                      {features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            {String(feature)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <div className="mt-auto">
                      {isCurrentPlan ? (
                        <Button disabled className="w-full" variant="secondary">
                          <Check className="mr-2 h-4 w-4" />
                          Plano Atual
                        </Button>
                      ) : plan.id === 'enterprise' ? (
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => window.open('mailto:contato@imobismart.com.br', '_blank')}
                        >
                          Falar com Vendas
                        </Button>
                      ) : isUpgrade ? (
                        <Button 
                          className="w-full gap-2" 
                          onClick={() => handleSelectPlan(plan.id)}
                        >
                          <Crown className="h-4 w-4" />
                          Fazer Upgrade
                        </Button>
                      ) : isDowngrade ? (
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => handleSelectPlan(plan.id)}
                        >
                          Fazer Downgrade
                        </Button>
                      ) : (
                        <Button 
                          className="w-full" 
                          onClick={() => handleSelectPlan(plan.id)}
                        >
                          Selecionar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
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
