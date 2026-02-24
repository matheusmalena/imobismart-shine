import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles, Loader2 } from "lucide-react";
import { usePlans } from "@/hooks/usePlans";

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

const ADDONS = [
  { name: 'Pacote +10 imóveis', properties: 10, price: 29 },
  { name: 'Pacote +25 imóveis', properties: 25, price: 59 },
  { name: 'Pacote +50 imóveis', properties: 50, price: 99 },
];

export function PricingSection() {
  const { activePlans, isLoading } = usePlans();

  const getCtaText = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'Começar Grátis';
      case 'enterprise':
        return 'Falar com Vendas';
      default:
        return 'Assinar Agora';
    }
  };

  const getCtaLink = (planId: string) => {
    return planId === 'enterprise' ? '/contato' : '/auth';
  };

  return (
    <section className="py-24 px-4 bg-muted/30" id="pricing">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Planos Flexíveis
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Escolha o plano ideal para sua carteira de imóveis
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comece grátis e evolua conforme seu portfólio cresce. Sem surpresas.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1400px] mx-auto"
            >
              {activePlans.map((plan) => (
                <motion.div
                  key={plan.id}
                  variants={itemVariants}
                  className={`relative flex flex-col bg-card rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    plan.is_highlighted
                      ? "border-primary shadow-lg shadow-primary/15 ring-2 ring-primary/20 lg:scale-105 z-10"
                      : "border-border/50 shadow-card hover:border-primary/30"
                  }`}
                >
                  {plan.is_highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg">
                        <Crown className="h-3.5 w-3.5" />
                        Mais Popular
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-6 pt-2">
                    <h3 className="text-lg font-bold text-card-foreground mb-2">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground mb-4 min-h-[32px]">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl md:text-4xl font-bold text-foreground">
                        {plan.price_label.includes('consulta') ? plan.price_label : `R$ ${plan.price}`}
                      </span>
                      {!plan.price_label.includes('consulta') && (
                        <span className="text-sm text-muted-foreground">/mês</span>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6 flex-grow">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="p-0.5 rounded-full bg-primary/10 mt-0.5 shrink-0">
                          <Check className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={getCtaLink(plan.id)} className="block mt-auto">
                    <Button
                      className={`w-full ${plan.is_highlighted ? "shadow-lg" : ""}`}
                      variant={plan.is_highlighted ? "default" : "outline"}
                      size="lg"
                    >
                      {getCtaText(plan.id)}
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Add-ons Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mt-20 mb-10"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Precisa de mais imóveis?
              </h3>
              <p className="text-muted-foreground text-base max-w-xl mx-auto">
                Adicione pacotes extras ao seu plano e expanda seu limite de imóveis.
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
            >
              {ADDONS.map((addon) => (
                <motion.div
                  key={addon.properties}
                  variants={itemVariants}
                  className="flex flex-col bg-card rounded-2xl p-6 border border-border/50 shadow-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-primary/30"
                >
                  <div className="text-center mb-4">
                    <h4 className="text-base font-bold text-card-foreground mb-1">{addon.name}</h4>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-2xl font-bold text-foreground">R$ {addon.price}</span>
                      <span className="text-sm text-muted-foreground">/mês</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center mb-4">
                    Adicione +{addon.properties} imóveis ao limite do seu plano atual
                  </p>
                  <Link to="/auth" className="block mt-auto">
                    <Button variant="outline" size="sm" className="w-full">
                      Adicionar Pacote
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
