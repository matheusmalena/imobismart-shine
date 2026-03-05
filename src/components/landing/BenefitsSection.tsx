import { motion } from "framer-motion";
import { DollarSign, FolderOpen, Bell, MessageCircle } from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "Controle financeiro completo",
    description:
      "Acompanhe receita, custos, ROI e lucro líquido de cada imóvel. Saiba exatamente quanto cada propriedade rende e tome decisões baseadas em dados reais.",
  },
  {
    icon: FolderOpen,
    title: "Documentos sempre organizados",
    description:
      "Upload e categorização automática de matrículas, IPTU, contratos e laudos. Acesse qualquer documento em segundos, organizado por imóvel.",
  },
  {
    icon: Bell,
    title: "Contratos sob controle",
    description:
      "Alertas automáticos de vencimento de contrato. Nunca mais perca um prazo importante ou esqueça de renovar uma locação.",
  },
  {
    icon: MessageCircle,
    title: "Comunicação automatizada",
    description:
      "Envie lembretes de aluguel via WhatsApp automaticamente. Configure templates personalizados e reduza a inadimplência dos seus inquilinos.",
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
            Resultados reais para quem gerencia imóveis com seriedade.
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
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`}
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
