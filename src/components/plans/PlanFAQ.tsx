import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const FAQ_ITEMS = [
  { question: 'Posso trocar de plano a qualquer momento?', answer: 'Sim! Você pode fazer upgrade ou downgrade do seu plano quando quiser. As alterações são aplicadas imediatamente.' },
  { question: 'O que acontece se eu ultrapassar o limite de imóveis?', answer: 'Você não é bloqueado! Imóveis adicionais são cobrados automaticamente na sua fatura mensal pelo valor indicado no seu plano.' },
  { question: 'Quais formas de pagamento são aceitas?', answer: 'Aceitamos cartão de crédito e débito. Os pagamentos são processados de forma segura via Stripe.' },
  { question: 'O que acontece se eu cancelar meu plano?', answer: 'Ao cancelar, você mantém acesso até o fim do período pago. Depois, sua conta volta para o plano Free com limite de 2 imóveis.' },
  { question: 'Existe desconto para pagamento anual?', answer: 'Em breve! Estamos preparando planos anuais com até 20% de desconto.' },
];

export default function PlanFAQ() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Perguntas Frequentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </motion.div>
  );
}
