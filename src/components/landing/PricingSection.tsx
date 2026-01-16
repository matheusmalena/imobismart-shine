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
    description: "Perfeito para começar",
    features: [
      "Até 2 imóveis cadastrados",
      "Dashboard básico",
      "Cadastro completo de imóveis",
      "Upload de documentos: até 100MB",
      "IA básica: 10 perguntas/mês",
      "Suporte por email (até 48h)",
    ],
    ctaText: "Começar Grátis",
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 49",
    priceNote: "/mês",
    description: "Para investidores sérios",
    isHighlighted: true,
    features: [
      "Até 25 imóveis cadastrados",
      "Dashboard avançado",
      "Upload ilimitado (máx. 20MB/arquivo)",
      "Relatórios: rentabilidade e lucro",
      "Análise de vacância e despesas",
      "Análise de mercado básica",
      "Exportação em PDF",
      "Suporte prioritário (até 24h)",
      "IA completa: 200 perguntas/mês",
    ],
    ctaText: "Assinar Agora",
  },
  {
    id: "plus",
    name: "Plus",
    price: "R$ 149",
    priceNote: "/mês",
    description: "Para grandes portfólios",
    features: [
      "Até 50 imóveis cadastrados",
      "Todos os recursos do Pro",
      "Relatórios personalizados",
      "Exportação Excel e CSV",
      "Visão financeira completa",
      "Histórico por imóvel",
      "Suporte prioritário 24/7",
      "IA avançada: 500 perguntas/mês",
      "Resumo mensal + recomendações IA",
    ],
    ctaText: "Assinar Agora",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Personalizado",
    description: "Para empresas e administradoras",
    features: [
      "Imóveis: quantidade personalizada",
      "Tudo do Plus incluído",
      "Multiusuários e permissões",
      "Relatórios customizados",
      "Auditoria e logs",
      "Integrações (API/ERP)",
      "Atendimento com SLA dedicado",
      "IA personalizada (fair use)",
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto"
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
