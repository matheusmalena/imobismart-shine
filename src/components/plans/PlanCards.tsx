import { motion, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Crown, Check, Loader2 } from 'lucide-react';

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  price_label: string;
  features: unknown;
  is_highlighted: boolean;
  extra_property_price?: number | null;
}

interface PlanCardsProps {
  activePlans: Plan[];
  currentPlan: string;
  loadingPlan: string | null;
  onSelectPlan: (planId: string) => void;
  getPlanIndex: (planId: string) => number;
  containerVariants: Variants;
}

export default function PlanCards({
  activePlans,
  currentPlan,
  loadingPlan,
  onSelectPlan,
  getPlanIndex,
  containerVariants,
}: PlanCardsProps) {
  const currentPlanIndex = getPlanIndex(currentPlan);

  const getCtaText = (planId: string, isCurrentPlan: boolean, isUpgrade: boolean, isDowngrade: boolean) => {
    if (isCurrentPlan) return 'Plano Atual';
    if (planId === 'enterprise') return 'Falar com Vendas';
    if (isUpgrade) return 'Fazer Upgrade';
    if (isDowngrade) return 'Fazer Downgrade';
    return 'Selecionar';
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 max-w-[1500px] mx-auto"
    >
      {activePlans.map((plan) => {
        const isCurrentPlan = plan.id === currentPlan;
        const planIndex = getPlanIndex(plan.id);
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
              disabled={isCurrentPlan || loadingPlan === plan.id}
              onClick={() => !isCurrentPlan && onSelectPlan(plan.id)}
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
  );
}
