import { Link } from "react-router-dom";
import { usePlans } from "@/hooks/usePlans";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Crown } from "lucide-react";

export function PricingSection() {
  const { activePlans, isLoading } = usePlans();

  if (isLoading) {
    return (
      <section className="py-20 px-4" id="pricing">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Planos que cabem no seu bolso</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comece grátis e evolua conforme seu portfólio cresce. Sem surpresas.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Sort plans by sort_order and get CTA text based on price
  const getCtaText = (price: number, index: number) => {
    if (price === 0) return "Começar Grátis";
    if (index === activePlans.length - 1) return "Assinar Plus";
    return "Assinar Pro";
  };

  return (
    <section className="py-20 px-4" id="pricing">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Planos que cabem no seu bolso</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comece grátis e evolua conforme seu portfólio cresce. Sem surpresas.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {activePlans.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative bg-card rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg ${
                plan.is_highlighted ? "border-primary shadow-lg shadow-primary/10 scale-105" : "border-border/50 shadow-card"
              }`}
            >
              {plan.is_highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    <Crown className="h-3 w-3" />
                    Mais Popular
                  </span>
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-card-foreground mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price_label.split('/')[0]}</span>
                  <span className="text-muted-foreground">/{plan.price_label.split('/')[1] || 'mês'}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/auth" className="block">
                <Button className="w-full" variant={plan.is_highlighted ? "default" : "outline"}>
                  {getCtaText(plan.price, index)}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
