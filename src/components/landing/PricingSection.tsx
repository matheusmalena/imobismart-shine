import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles, Building2, TrendingUp, Briefcase, Building } from "lucide-react";

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

interface PlanFeature {
  text: string;
  subItems?: string[];
}

interface Plan {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  priceNote?: string;
  description: string;
  features: PlanFeature[];
  ctaText: string;
  ctaVariant: "default" | "outline" | "secondary";
  isHighlighted?: boolean;
  icon: React.ReactNode;
}

const plans: Plan[] = [
  {
    id: "starter",
    name: "Gratuito",
    subtitle: "Starter",
    price: "R$ 0",
    priceNote: "/mês",
    description: "Perfeito para começar",
    icon: <Building2 className="h-5 w-5" />,
    features: [
      { text: "Até 2 imóveis cadastrados" },
      { text: "Dashboard básico" },
      { text: "Cadastro completo de imóveis", subItems: ["Endereço, tipo, valor, aluguel, despesas, status"] },
      { text: "Upload de documentos: até 100MB" },
      { text: "Inteligência Artificial (básica)", subItems: ["Limite: 10 perguntas/mês"] },
      { text: "Suporte por email (até 48h)" },
    ],
    ctaText: "Começar Grátis",
    ctaVariant: "outline",
  },
  {
    id: "pro",
    name: "Pro",
    subtitle: "Mais Popular",
    price: "R$ 49",
    priceNote: "/mês",
    description: "Para investidores sérios",
    icon: <TrendingUp className="h-5 w-5" />,
    isHighlighted: true,
    features: [
      { text: "Até 25 imóveis cadastrados" },
      { text: "Dashboard avançado" },
      { text: "Upload ilimitado de documentos", subItems: ["Máx. 20MB por arquivo"] },
      { text: "Relatórios automáticos", subItems: ["Rentabilidade por imóvel", "Lucro mensal estimado", "Vacância e prejuízo", "Despesas por imóvel"] },
      { text: "Análise de mercado (básica)" },
      { text: "Exportação em PDF" },
      { text: "Suporte prioritário (até 24h)" },
      { text: "IA completa: 200 perguntas/mês" },
    ],
    ctaText: "Assinar Agora",
    ctaVariant: "default",
  },
  {
    id: "plus",
    name: "Plus",
    subtitle: "Avançado",
    price: "R$ 149",
    priceNote: "/mês",
    description: "Para grandes portfólios",
    icon: <Briefcase className="h-5 w-5" />,
    features: [
      { text: "Até 50 imóveis cadastrados" },
      { text: "Todos os recursos do Pro" },
      { text: "Relatórios personalizados", subItems: ["Filtros avançados"] },
      { text: "Exportação de dados", subItems: ["Excel (XLSX)", "CSV"] },
      { text: "Visão financeira completa", subItems: ["Receitas x despesas por mês", "Histórico por imóvel"] },
      { text: "Suporte prioritário 24/7" },
      { text: "IA avançada: 500 perguntas/mês" },
      { text: "Resumo mensal + recomendações IA" },
    ],
    ctaText: "Assinar Agora",
    ctaVariant: "outline",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    subtitle: "Corporativo",
    price: "Personalizado",
    description: "Para empresas e administradoras",
    icon: <Building className="h-5 w-5" />,
    features: [
      { text: "Número de imóveis: personalizado" },
      { text: "Tudo do Plus incluído" },
      { text: "Multiusuários e permissões", subItems: ["Admin / Financeiro / Operador"] },
      { text: "Relatórios avançados e customizados" },
      { text: "Auditoria e logs de alterações" },
      { text: "Integrações disponíveis", subItems: ["API / ERP / Contabilidade"] },
      { text: "Atendimento com SLA dedicado" },
      { text: "IA personalizada (fair use)" },
    ],
    ctaText: "Falar com Vendas",
    ctaVariant: "secondary",
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
            Comece grátis e evolua conforme seu portfólio cresce. Sem surpresas, sem taxas escondidas.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto items-stretch"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={itemVariants}
              className={`relative flex flex-col bg-card rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                plan.isHighlighted
                  ? "border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/30 lg:scale-[1.03] z-10"
                  : "border-border/50 shadow-card hover:border-primary/30"
              }`}
            >
              {/* Highlighted Badge */}
              {plan.isHighlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/30">
                    <Crown className="h-3.5 w-3.5" />
                    Mais Popular
                  </span>
                </div>
              )}

              {/* Header */}
              <div className={`p-6 pb-4 ${plan.isHighlighted ? "pt-8" : ""}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-2 rounded-lg ${plan.isHighlighted ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-card-foreground">{plan.name}</h3>
                    <span className="text-xs text-muted-foreground">{plan.subtitle}</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                
                <div className="flex items-baseline gap-1">
                  <span className={`font-bold text-foreground ${plan.price === "Personalizado" ? "text-2xl" : "text-3xl md:text-4xl"}`}>
                    {plan.price}
                  </span>
                  {plan.priceNote && (
                    <span className="text-sm text-muted-foreground">{plan.priceNote}</span>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="mx-6 border-t border-border/50" />

              {/* Features */}
              <div className="p-6 pt-4 flex-grow">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">O que está incluso:</p>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>
                      <div className="flex items-start gap-2.5">
                        <div className={`p-0.5 rounded-full shrink-0 mt-0.5 ${plan.isHighlighted ? "bg-primary/20" : "bg-primary/10"}`}>
                          <Check className={`h-3.5 w-3.5 ${plan.isHighlighted ? "text-primary" : "text-primary"}`} />
                        </div>
                        <span className="text-sm text-card-foreground leading-tight font-medium">{feature.text}</span>
                      </div>
                      {feature.subItems && (
                        <ul className="ml-7 mt-1.5 space-y-1">
                          {feature.subItems.map((subItem, subIdx) => (
                            <li key={subIdx} className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                              {subItem}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <div className="p-6 pt-0 mt-auto">
                <Link to={plan.id === "enterprise" ? "/contato" : "/auth"} className="block">
                  <Button
                    className={`w-full font-semibold ${plan.isHighlighted ? "shadow-lg shadow-primary/30" : ""}`}
                    variant={plan.ctaVariant}
                    size="lg"
                  >
                    {plan.ctaText}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          Todos os planos incluem atualizações gratuitas e garantia de 7 dias.
        </motion.p>
      </div>
    </section>
  );
}
