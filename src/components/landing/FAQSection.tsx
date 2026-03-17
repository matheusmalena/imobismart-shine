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
    answer: "Sim! O plano Free permite gerenciar até 2 imóveis com acesso ao dashboard básico, gestão de inquilinos e upload de documentos — tudo sem custo. Quando seu portfólio crescer, basta fazer upgrade para um plano com mais capacidade.",
  },
  {
    question: "Posso migrar de plano a qualquer momento?",
    answer: "Sim. O upgrade pode ser feito diretamente pela página de Assinatura dentro do sistema. Para downgrade, basta entrar em contato com nosso suporte. Não há multa nem fidelidade — você só paga pelo plano ativo.",
  },
  {
    question: "Meus dados estão seguros na plataforma?",
    answer: "Sim. O ImobiSmart utiliza autenticação com verificação de e-mail e suporte a autenticação de dois fatores (2FA). Todos os dados são armazenados com criptografia e backups automáticos diários na nuvem.",
  },
  {
    question: "Posso acessar de qualquer dispositivo?",
    answer: "Sim! O ImobiSmart é uma plataforma web 100% responsiva. Funciona em computadores, tablets e smartphones — basta ter acesso à internet para gerenciar seus imóveis de qualquer lugar.",
  },
  {
    question: "Como funciona o controle de documentos?",
    answer: "Você pode fazer upload de documentos como matrículas, contratos, laudos e comprovantes de IPTU diretamente vinculados a cada imóvel. Tudo fica organizado por categoria na nuvem, com busca rápida e acesso seguro.",
  },
  {
    question: "Posso cancelar minha assinatura quando quiser?",
    answer: "Com certeza. Não há fidelidade mínima nem taxas de cancelamento. Você pode cancelar a qualquer momento e continuará com acesso até o final do período já pago.",
  },
  {
    question: "O sistema calcula o ROI automaticamente?",
    answer: "Sim. Ao cadastrar o valor do imóvel, receita de aluguel e custos (IPTU, condomínio, manutenção), o dashboard calcula automaticamente o ROI, lucro líquido mensal e outras métricas de performance do seu portfólio.",
  },
];

export function FAQSection() {
  return (
    <section className="py-24 px-4" id="faq">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
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
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
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
          ))}
        </Accordion>
      </div>
    </section>
  );
}
