import { motion } from "framer-motion";
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Carlos Mendes',
    role: 'Investidor Imobiliário',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    content: 'O ImobiSmart transformou minha gestão. Antes eu usava planilhas confusas, agora tenho tudo organizado e ainda recebo insights sobre performance.',
    rating: 5,
  },
  {
    name: 'Ana Paula Rodrigues',
    role: 'Proprietária de Imóveis',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    content: 'Com apenas 3 apartamentos, achei que não precisava de um sistema. Estava errada! O controle de documentos e custos me ajuda muito.',
    rating: 5,
  },
  {
    name: 'Roberto Silva',
    role: 'Diretor de Imobiliária',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    content: 'Nossa imobiliária gerencia mais de 100 imóveis. O ImobiSmart nos deu agilidade e profissionalismo no atendimento aos proprietários.',
    rating: 5,
  },
  {
    name: 'Mariana Costa',
    role: 'Investidora Iniciante',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    content: 'O plano gratuito me permitiu experimentar antes de decidir. Depois de ver o valor, migrei pro Pro sem pensar duas vezes.',
    rating: 5,
  },
];

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

export function TestimonialsSection() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Milhares de investidores e proprietários já transformaram sua gestão imobiliária.
          </p>
        </motion.div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-card rounded-2xl p-6 border border-border/50 shadow-card flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <Quote className="h-8 w-8 text-primary/30 mb-4" />
              <p className="text-sm text-muted-foreground flex-1 mb-6">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-2 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                />
                <div>
                  <p className="font-semibold text-card-foreground text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
