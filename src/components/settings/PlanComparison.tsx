import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlans } from "@/hooks/usePlans";

interface PlanComparisonProps {
  currentPlan: string;
  onSelectPlan?: (planId: string) => void;
}

export function PlanComparison({ currentPlan, onSelectPlan }: PlanComparisonProps) {
  const { activePlans, isLoading } = usePlans();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-80 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  // Map enterprise to plus for UI comparison
  const normalizedCurrentPlan = currentPlan === 'enterprise' ? 'enterprise' : currentPlan;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {activePlans.map((plan) => {
        const isCurrentPlan = plan.id === normalizedCurrentPlan;
        const currentPlanOrder = activePlans.findIndex(p => p.id === normalizedCurrentPlan);
        const thisPlanOrder = activePlans.findIndex(p => p.id === plan.id);
        const isUpgrade = thisPlanOrder > currentPlanOrder;
        const isDowngrade = thisPlanOrder < currentPlanOrder;

        return (
          <Card
            key={plan.id}
            className={cn(
              "relative transition-all",
              plan.is_highlighted && "border-primary shadow-lg scale-[1.02]",
              isCurrentPlan && "ring-2 ring-primary",
            )}
          >
            {plan.is_highlighted && (
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
                <span className="text-3xl font-bold text-foreground">{plan.price_label}</span>
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
                <Button className="w-full" onClick={() => onSelectPlan?.(plan.id)}>
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
