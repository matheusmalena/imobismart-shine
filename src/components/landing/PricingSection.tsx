import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles } from "lucide-react";

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

interface Plan {
  id: string;
  name: string;
  price: string;
  priceNote?: string;
  description: string;
  features: string[];
  ctaText: string;
  isHighlighted?: boolean;
}

const plans: Plan[] = [
  {
    id: "starter",
    name: "Gratuito",
    price: "R$ 0",
    priceNote: "/mês",
    description: "Ideal para quem está começando",
    features: [
      "Gerencie até 2 imóveis",
      "Painel com visão geral",
      "Armazene seus documentos",
      "Assistente com IA básica",
      "Suporte por email",
    ],
    ctaText: "Começar Grátis",
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 49",
    priceNote: "/mês",
    description: "Para quem leva investimento a sério",
    isHighlighted: true,
    features: [
      "Gerencie até 25 imóveis",
      "Relatórios de rentabilidade",
      "Documentos ilimitados",
      "Exporte relatórios em PDF",
      "Assistente com IA completa",
      "Suporte prioritário",
    ],
    ctaText: "Assinar Agora",
  },
  {
    id: "plus",
    name: "Plus",
    price: "R$ 149",
    priceNote: "/mês",
    description: "Para carteiras maiores",
    features: [
      "Gerencie até 50 imóveis",
      "Tudo do Pro incluído",
      "Relatórios personalizados",
      "Exporte para Excel e CSV",
      "IA com recomendações mensais",
      "Suporte 24/7",
    ],
    ctaText: "Assinar Agora",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Sob consulta",
    description: "Para empresas e imobiliárias",
    features: [
      "Imóveis ilimitados",
      "Múltiplos usuários",
      "Integrações personalizadas",
      "Relatórios sob medida",
      "Gerente de conta dedicado",
    ],
    ctaText: "Falar com Vendas",
  },
];

export function PricingSection() {
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

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1400px] mx-auto"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={itemVariants}
              className={`relative flex flex-col bg-card rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                plan.isHighlighted
                  ? "border-primary shadow-lg shadow-primary/15 ring-2 ring-primary/20 lg:scale-105 z-10"
                  : "border-border/50 shadow-card hover:border-primary/30"
              }`}
            >
              {plan.isHighlighted && (
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
                  <span className="text-3xl md:text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.priceNote && (
                    <span className="text-sm text-muted-foreground">{plan.priceNote}</span>
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
              <Link to={plan.id === "enterprise" ? "/contato" : "/auth"} className="block mt-auto">
                <Button
                  className={`w-full ${plan.isHighlighted ? "shadow-lg" : ""}`}
                  variant={plan.isHighlighted ? "default" : "outline"}
                  size="lg"
                >
                  {plan.ctaText}
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
