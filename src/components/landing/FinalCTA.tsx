import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";

export function FinalCTA() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className="py-24 px-4 gradient-hero relative overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto text-center max-w-3xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight"
        >
          Comece a gerenciar de forma mais inteligente
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white/80 text-lg max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Junte-se a centenas de imobiliárias e corretores que já usam o ImobiSmart para vender e alugar mais.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/auth">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 text-base px-8 py-6 shadow-xl hover:scale-105 transition-transform"
            >
              Comece Grátis Agora
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="gap-2 text-base px-8 py-6 border-white/30 text-white hover:bg-white/10"
            onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Gostaria de agendar uma demonstração do ImobiSmart.', '_blank')}
          >
            <Calendar className="h-5 w-5" />
            Agendar Demonstração
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
}
