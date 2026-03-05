import { motion } from "framer-motion";
import { Clock, Target, RefreshCw, TrendingUp } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Economize horas por semana",
    description:
      "Automatize tarefas repetitivas como publicação de imóveis, envio de mensagens e geração de relatórios. Foque no que gera resultado.",
  },
  {
    icon: Target,
    title: "Centralize todos os seus leads",
    description:
      "Receba leads dos portais, site e WhatsApp em um único funil. Nunca mais perca uma oportunidade por falta de organização.",
  },
  {
    icon: RefreshCw,
    title: "Automatize seus anúncios",
    description:
      "Publique e atualize imóveis nos principais portais automaticamente. Mudou o status? Todos os portais são atualizados em tempo real.",
  },
  {
    icon: TrendingUp,
    title: "Aumente suas vendas e locações",
    description:
      "Com dados precisos, pipeline organizado e automações inteligentes, sua equipe fecha mais negócios em menos tempo.",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Por que escolher o ImobiSmart?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Resultados reais para imobiliárias e corretores que querem crescer.
          </p>
        </motion.div>

        <div className="space-y-20">
          {benefits.map((benefit, index) => {
            const isReversed = index % 2 === 1;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${isReversed ? "lg:direction-rtl" : ""}`}
              >
                <div className={isReversed ? "lg:order-2" : ""}>
                  <div className="p-4 rounded-2xl bg-primary/10 w-fit mb-6">
                    <benefit.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">{benefit.description}</p>
                </div>
                <div className={`${isReversed ? "lg:order-1" : ""}`}>
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 flex items-center justify-center min-h-[250px] border border-primary/10">
                    <benefit.icon className="h-24 w-24 text-primary/20" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
