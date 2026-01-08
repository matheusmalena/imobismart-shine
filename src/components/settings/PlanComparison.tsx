import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Plan {
  id: 'starter' | 'pro' | 'plus';
  name: string;
  description: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Gratuito',
    description: 'Perfeito para começar',
    price: 'R$ 0/mês',
    features: [
      'Até 2 imóveis cadastrados',
      'Dashboard básico',
      'Upload de documentos (100MB)',
      'Suporte por email',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Para investidores sérios',
    price: 'R$ 49/mês',
    highlighted: true,
    features: [
      'Até 25 imóveis cadastrados',
      'Dashboard avançado com IA',
      'Upload ilimitado de documentos',
      'Relatórios automáticos',
      'Análise preditiva de mercado',
      'Suporte prioritário',
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    description: 'Para grandes portfólios',
    price: 'R$ 99/mês',
    features: [
      'Imóveis ilimitados',
      'Todos os recursos Pro',
      'Relatórios personalizados',
      'Exportação de dados',
      'Suporte prioritário 24/7',
      'API de integração',
    ],
  },
];

interface PlanComparisonProps {
  currentPlan: 'starter' | 'pro' | 'plus';
  onSelectPlan?: (plan: 'starter' | 'pro' | 'plus') => void;
}

export function PlanComparison({ currentPlan, onSelectPlan }: PlanComparisonProps) {
  const planOrder = { starter: 0, pro: 1, plus: 2 };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {PLANS.map((plan) => {
        const isCurrentPlan = plan.id === currentPlan;
        const isUpgrade = planOrder[plan.id] > planOrder[currentPlan];
        const isDowngrade = planOrder[plan.id] < planOrder[currentPlan];

        return (
          <Card
            key={plan.id}
            className={cn(
              'relative transition-all',
              plan.highlighted && 'border-primary shadow-lg scale-[1.02]',
              isCurrentPlan && 'ring-2 ring-primary'
            )}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Mais Popular
                </Badge>
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <Button disabled className="w-full" variant="outline">
                  Plano Atual
                </Button>
              ) : isUpgrade ? (
                <Button
                  className="w-full"
                  onClick={() => onSelectPlan?.(plan.id)}
                >
                  Fazer Upgrade
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => onSelectPlan?.(plan.id)}
                >
                  Fazer Downgrade
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
