import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, X, Crown, Sparkles, Loader2 } from "lucide-react";
import { usePlans } from "@/hooks/usePlans";

// Feature comparison categories matching the Jetimob-style layout
const featureCategories = [
  {
    category: "Geral",
    features: [
      { name: "Limite de imóveis", values: ["2", "10", "25", "50", "Personalizado"] },
      { name: "Dashboard com métricas", values: [true, true, true, true, true] },
      { name: "Aplicativo responsivo (mobile)", values: [true, true, true, true, true] },
    ],
  },
  {
    category: "Gestão",
    features: [
      { name: "Cadastro de imóveis com fotos", values: [true, true, true, true, true] },
      { name: "Gestão de inquilinos", values: [true, true, true, true, true] },
      { name: "Contratos de locação", values: [true, true, true, true, true] },
      { name: "Galeria de fotos por imóvel", values: [true, true, true, true, true] },
      { name: "Alertas de vencimento", values: [false, true, true, true, true] },
      { name: "Controle financeiro por imóvel", values: [false, true, true, true, true] },
    ],
  },
  {
    category: "Ferramentas",
    features: [
      { name: "Upload de documentos", values: [true, true, true, true, true] },
      { name: "Exportação CSV / Excel / JSON", values: [false, false, true, true, true] },
      { name: "Relatórios em PDF", values: [false, false, false, true, true] },
      { name: "Ranking de performance", values: [false, false, true, true, true] },
      { name: "Copiloto IA (recomendações)", values: [false, false, false, true, true] },
    ],
  },
  {
    category: "Integrações",
    features: [
      { name: "WhatsApp Business (lembretes)", values: [false, false, true, true, true] },
    ],
  },
  {
    category: "Suporte",
    features: [
      { name: "Suporte por e-mail", values: [true, true, true, true, true] },
      { name: "Suporte prioritário", values: [false, false, false, false, true] },
      { name: "Gestão de equipe", values: [false, false, false, false, true] },
    ],
  },
];

const planNames = ["Free", "Starter", "Pro", "Plus", "Enterprise"];

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-sm font-semibold text-foreground">{value}</span>;
  }
  return value ? (
    <Check className="h-4 w-4 text-primary mx-auto" />
  ) : (
    <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
  );
}

export function PricingSection() {
  const { activePlans, isLoading } = usePlans();

  const getCtaText = (planId: string) => {
    switch (planId) {
      case "free":
        return "Começar Grátis";
      case "enterprise":
        return "Falar com Vendas";
      default:
        return "Assinar Agora";
    }
  };

  const getCtaLink = (planId: string) => {
    return planId === "enterprise" ? "/contato" : "/auth";
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
            {/* Plan Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 max-w-[1500px] mx-auto mb-16"
            >
              {activePlans.map((plan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
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
                        {plan.price_label.includes("consulta") ? plan.price_label : `R$ ${plan.price}`}
                      </span>
                      {!plan.price_label.includes("consulta") && (
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

            {/* Feature Comparison Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-[1200px] mx-auto"
            >
              <h3 className="text-2xl font-bold text-foreground text-center mb-8">
                Comparativo completo de recursos
              </h3>
              <div className="bg-card rounded-2xl border border-border/50 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left py-4 px-4 font-semibold text-foreground w-[240px]">Recurso</th>
                        {planNames.map((name) => (
                          <th key={name} className="text-center py-4 px-3 font-semibold text-foreground min-w-[100px]">
                            {name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {featureCategories.map((cat) => (
                        <>
                          <tr key={`cat-${cat.category}`} className="bg-muted/50">
                            <td colSpan={6} className="py-3 px-4 font-bold text-foreground text-xs uppercase tracking-wider">
                              {cat.category}
                            </td>
                          </tr>
                          {cat.features.map((feature) => (
                            <tr key={feature.name} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                              <td className="py-3 px-4 text-muted-foreground">{feature.name}</td>
                              {feature.values.map((val, idx) => (
                                <td key={idx} className="text-center py-3 px-3">
                                  <FeatureValue value={val} />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                * O plano Enterprise possui limites personalizados. Entre em contato para mais detalhes.
              </p>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
