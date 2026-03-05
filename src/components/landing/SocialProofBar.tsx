import { motion } from "framer-motion";
import { Building2, Home, TrendingUp, Shield } from "lucide-react";

const stats = [
  { icon: Building2, value: "Imobiliárias", label: "e investidores ativos" },
  { icon: Home, value: "Milhares", label: "de imóveis gerenciados" },
  { icon: TrendingUp, value: "98%", label: "Satisfação dos clientes" },
  { icon: Shield, value: "99.9%", label: "Uptime garantido" },
];

export function SocialProofBar() {
  return (
    <section className="py-16 px-4 border-y border-border/50 bg-muted/20">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <stat.icon className="h-6 w-6 text-primary mx-auto mb-3" />
              <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
