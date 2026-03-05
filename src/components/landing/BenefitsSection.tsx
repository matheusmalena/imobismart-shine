import { motion } from "framer-motion";
import { DollarSign, FolderOpen, Bell, MessageCircle, TrendingUp, ArrowUpRight, FileText, CheckCircle2, AlertTriangle, Send } from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "Controle financeiro completo",
    description:
      "Acompanhe receita, custos, ROI e lucro líquido de cada imóvel. Saiba exatamente quanto cada propriedade rende e tome decisões baseadas em dados reais.",
    mockup: "financial",
  },
  {
    icon: FolderOpen,
    title: "Documentos sempre organizados",
    description:
      "Upload e categorização automática de matrículas, IPTU, contratos e laudos. Acesse qualquer documento em segundos, organizado por imóvel.",
    mockup: "documents",
  },
  {
    icon: Bell,
    title: "Contratos sob controle",
    description:
      "Alertas automáticos de vencimento de contrato. Nunca mais perca um prazo importante ou esqueça de renovar uma locação.",
    mockup: "contracts",
  },
  {
    icon: MessageCircle,
    title: "Comunicação automatizada",
    description:
      "Envie lembretes de aluguel via WhatsApp automaticamente. Configure templates personalizados e reduza a inadimplência dos seus inquilinos.",
    mockup: "whatsapp",
  },
];

function FinancialMockup() {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border/50 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Apt. Centro - Financeiro</span>
        <TrendingUp className="h-4 w-4 text-success" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Receita", value: "R$ 3.200", color: "text-success" },
          { label: "Custos", value: "R$ 850", color: "text-destructive" },
          { label: "ROI", value: "8.2%", color: "text-primary" },
          { label: "Lucro", value: "R$ 2.350", color: "text-success" },
        ].map((item) => (
          <div key={item.label} className="bg-muted/30 rounded-lg p-3 border border-border/30">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ArrowUpRight className="h-3 w-3 text-success" />
        <span>+12% vs mês anterior</span>
      </div>
    </div>
  );
}

function DocumentsMockup() {
  const docs = [
    { name: "Matrícula_Apt203.pdf", cat: "Matrícula", size: "2.4 MB" },
    { name: "IPTU_2024.pdf", cat: "IPTU", size: "1.1 MB" },
    { name: "Contrato_Locação.pdf", cat: "Contrato", size: "3.8 MB" },
  ];
  return (
    <div className="bg-card rounded-2xl p-5 border border-border/50 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Documentos — Apt. Vila Mariana</span>
        <FolderOpen className="h-4 w-4 text-primary" />
      </div>
      <div className="space-y-2">
        {docs.map((doc) => (
          <div key={doc.name} className="flex items-center gap-3 bg-muted/30 rounded-lg p-3 border border-border/30">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{doc.name}</p>
              <p className="text-[10px] text-muted-foreground">{doc.cat} · {doc.size}</p>
            </div>
            <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ContractsMockup() {
  const contracts = [
    { tenant: "Carlos Silva", end: "15/03/2025", status: "alert", days: "10 dias" },
    { tenant: "Ana Souza", end: "01/08/2025", status: "ok", days: "149 dias" },
    { tenant: "Roberto Lima", end: "22/02/2025", status: "danger", days: "Vencido" },
  ];
  return (
    <div className="bg-card rounded-2xl p-5 border border-border/50 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Alertas de Contratos</span>
        <Bell className="h-4 w-4 text-warning" />
      </div>
      <div className="space-y-2">
        {contracts.map((c) => (
          <div key={c.tenant} className="flex items-center gap-3 bg-muted/30 rounded-lg p-3 border border-border/30">
            <AlertTriangle className={`h-4 w-4 shrink-0 ${c.status === "danger" ? "text-destructive" : c.status === "alert" ? "text-warning" : "text-success"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">{c.tenant}</p>
              <p className="text-[10px] text-muted-foreground">Vencimento: {c.end}</p>
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${c.status === "danger" ? "bg-destructive/10 text-destructive" : c.status === "alert" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
              {c.days}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WhatsAppMockup() {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border/50 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">WhatsApp — Lembretes</span>
        <MessageCircle className="h-4 w-4 text-success" />
      </div>
      <div className="bg-muted/30 rounded-lg p-3 border border-border/30 space-y-2">
        <div className="flex items-start gap-2">
          <div className="p-1.5 rounded-full bg-success/10 mt-0.5">
            <Send className="h-3 w-3 text-success" />
          </div>
          <div className="bg-success/5 rounded-lg rounded-tl-none p-3 flex-1 border border-success/10">
            <p className="text-xs text-foreground">Olá Carlos! Seu aluguel de R$ 2.800 vence em <strong>3 dias</strong> (dia 10/03). 🏠</p>
            <p className="text-[10px] text-muted-foreground mt-1">Enviado · 07/03 às 09:00</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">3 lembretes agendados</span>
        <span className="text-success font-medium">✓ Automático</span>
      </div>
    </div>
  );
}

const mockupComponents: Record<string, () => JSX.Element> = {
  financial: FinancialMockup,
  documents: DocumentsMockup,
  contracts: ContractsMockup,
  whatsapp: WhatsAppMockup,
};

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
            const MockupComponent = mockupComponents[benefit.mockup];
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              >
                <div className={isReversed ? "lg:order-2" : ""}>
                  <div className="p-4 rounded-2xl bg-primary/10 w-fit mb-6">
                    <benefit.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">{benefit.description}</p>
                </div>
                <div className={isReversed ? "lg:order-1" : ""}>
                  <MockupComponent />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
