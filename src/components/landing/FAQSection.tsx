import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "O ImobiSmart é realmente gratuito para começar?",
    answer: "Sim! Nosso plano Starter é completamente gratuito e permite gerenciar até 2 imóveis. Você pode usar todas as funcionalidades básicas sem nenhum custo e só faz upgrade quando precisar de mais recursos ou imóveis.",
  },
  {
    question: "Posso migrar de plano a qualquer momento?",
    answer: "Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. Se fizer upgrade, a diferença será cobrada proporcionalmente. Se fizer downgrade, o crédito será aplicado no próximo ciclo de faturamento.",
  },
  {
    question: "Meus dados estão seguros na plataforma?",
    answer: "Absolutamente. Utilizamos criptografia de ponta a ponta para todos os dados armazenados. Além disso, fazemos backups automáticos diários e oferecemos autenticação de dois fatores para proteger sua conta.",
  },
  {
    question: "Posso acessar de qualquer dispositivo?",
    answer: "Sim! O ImobiSmart é uma plataforma web responsiva, ou seja, funciona perfeitamente em computadores, tablets e smartphones. Basta ter acesso à internet para gerenciar seus imóveis de qualquer lugar.",
  },
  {
    question: "Como funciona o controle de documentos?",
    answer: "Você pode fazer upload de qualquer documento relacionado aos seus imóveis: matrículas, contratos, laudos, comprovantes de IPTU, etc. Todos ficam organizados por imóvel e categoria, facilitando a busca e o acesso.",
  },
  {
    question: "Posso cancelar minha assinatura quando quiser?",
    answer: "Com certeza. Não há fidelidade mínima. Você pode cancelar sua assinatura a qualquer momento e continuará tendo acesso até o final do período já pago. Seus dados ficam disponíveis para exportação.",
  },
  {
    question: "O sistema calcula o ROI automaticamente?",
    answer: "Sim! Ao cadastrar os dados financeiros do imóvel (valor de compra, receitas de aluguel, custos como IPTU, condomínio, etc.), o sistema calcula automaticamente o ROI, lucro líquido e outras métricas importantes.",
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export function FAQSection() {
  return (
    <section className="py-24 px-4" id="faq">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <HelpCircle className="h-4 w-4" />
            Perguntas Frequentes
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            FAQ
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Encontre respostas para as perguntas mais comuns sobre nossa plataforma.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-card border border-border/50 rounded-xl px-6 shadow-card data-[state=open]:shadow-lg data-[state=open]:border-primary/30 transition-all duration-300"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5 text-foreground font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
