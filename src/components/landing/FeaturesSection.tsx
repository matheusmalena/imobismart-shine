import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Building2,
  Globe,
  Link2,
  Megaphone,
  MessageSquare,
  BarChart3,
  Search,
  Smartphone,
  RefreshCw,
  Target,
  FileText,
  Zap,
  Check,
} from "lucide-react";

const categories = [
  {
    id: "crm",
    label: "CRM Imobiliário",
    icon: Users,
    title: "Pipeline de leads inteligente",
    description:
      "Gerencie seus leads do primeiro contato ao fechamento. Automações que trabalham por você, integrações com WhatsApp e histórico completo de interações.",
    features: [
      "Pipeline de leads com estágios personalizáveis",
      "Gestão de contatos centralizada",
      "Automações de follow-up",
      "Integração com WhatsApp Business",
    ],
    mockup: (
      <div className="space-y-3">
        {["Novo Lead", "Em Negociação", "Visita Agendada", "Proposta Enviada"].map((stage, i) => (
          <div key={stage} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/30">
            <div className={`w-3 h-3 rounded-full ${["bg-info", "bg-warning", "bg-primary", "bg-success"][i]}`} />
            <span className="text-sm font-medium text-foreground flex-1">{stage}</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{[12, 8, 5, 3][i]}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "properties",
    label: "Gestão de Imóveis",
    icon: Building2,
    title: "Controle total do seu portfólio",
    description:
      "Cadastre imóveis com fotos, detalhes e documentos. Acompanhe status, receitas e custos de cada propriedade em tempo real.",
    features: [
      "Cadastro completo com fotos e documentos",
      "Status: disponível, alugado, vendido",
      "Controle financeiro por imóvel",
      "Ranking de performance automático",
    ],
    mockup: (
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: "Apt. Vila Mariana", status: "Alugado", color: "bg-success" },
          { name: "Casa Moema", status: "Disponível", color: "bg-info" },
          { name: "Sala Comercial", status: "Em Reforma", color: "bg-warning" },
          { name: "Cobertura Itaim", status: "À Venda", color: "bg-primary" },
        ].map((prop) => (
          <div key={prop.name} className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <div className="w-full h-16 bg-muted/50 rounded-md mb-2" />
            <p className="text-xs font-medium text-foreground truncate">{prop.name}</p>
            <div className="flex items-center gap-1 mt-1">
              <div className={`w-2 h-2 rounded-full ${prop.color}`} />
              <span className="text-[10px] text-muted-foreground">{prop.status}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "website",
    label: "Site Imobiliário",
    icon: Globe,
    title: "Seu site profissional em minutos",
    description:
      "Crie um site imobiliário otimizado para SEO automaticamente. Seus imóveis publicados com páginas responsivas e otimizadas para conversão.",
    features: [
      "Site gerado automaticamente",
      "SEO otimizado para buscas",
      "Design responsivo (mobile-first)",
      "Páginas de imóvel com formulário de contato",
    ],
    mockup: (
      <div className="bg-muted/30 rounded-lg border border-border/30 p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Globe className="h-3 w-3" />
          <span>www.suaimobiliaria.com.br</span>
        </div>
        <div className="w-full h-20 bg-muted/50 rounded-md flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Hero Banner</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-muted/50 rounded-md p-2">
              <div className="w-full h-10 bg-muted rounded mb-1" />
              <div className="w-3/4 h-2 bg-muted rounded" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Search className="h-3 w-3 text-muted-foreground" />
          <div className="flex-1 h-7 bg-muted/50 rounded-md border border-border/30" />
        </div>
      </div>
    ),
  },
  {
    id: "integrations",
    label: "Integrações",
    icon: Link2,
    title: "Conecte-se aos principais portais",
    description:
      "Publique seus imóveis automaticamente nos maiores portais do Brasil. Sincronização em tempo real sem trabalho manual.",
    features: [
      "Integração com ZAP Imóveis",
      "Publicação automática no VivaReal",
      "Sincronização com OLX",
      "Atualização automática de status",
    ],
    mockup: (
      <div className="space-y-3">
        {[
          { name: "ZAP Imóveis", status: "Conectado", synced: "42 imóveis" },
          { name: "VivaReal", status: "Conectado", synced: "38 imóveis" },
          { name: "OLX", status: "Conectado", synced: "25 imóveis" },
          { name: "WhatsApp", status: "Ativo", synced: "Business API" },
        ].map((portal) => (
          <div key={portal.name} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/30">
            <div className="p-2 rounded-lg bg-primary/10">
              <RefreshCw className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{portal.name}</p>
              <p className="text-xs text-muted-foreground">{portal.synced}</p>
            </div>
            <span className="text-xs text-success font-medium">{portal.status}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: Megaphone,
    title: "Capture e converta mais leads",
    description:
      "Ferramentas de marketing integradas para captar leads qualificados. Landing pages, campanhas automáticas e métricas de conversão.",
    features: [
      "Landing pages de captação",
      "Campanhas de e-mail automáticas",
      "Métricas de conversão em tempo real",
      "Formulários inteligentes de contato",
    ],
    mockup: (
      <div className="space-y-3">
        <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Funil de Conversão</span>
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-2">
            {[
              { stage: "Visitantes", value: "2.450", width: "100%" },
              { stage: "Leads", value: "380", width: "65%" },
              { stage: "Qualificados", value: "142", width: "40%" },
              { stage: "Fechamentos", value: "28", width: "18%" },
            ].map((item) => (
              <div key={item.stage} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-20">{item.stage}</span>
                <div className="flex-1 h-5 bg-muted/50 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/30 rounded-full" style={{ width: item.width }} />
                </div>
                <span className="text-xs font-medium text-foreground w-12 text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

export function FeaturesSection() {
  const [activeTab, setActiveTab] = useState("crm");
  const active = categories.find((c) => c.id === activeTab)!;

  return (
    <section className="py-24 px-4" id="features">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Recursos Completos
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Tudo que sua imobiliária precisa
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Do primeiro contato ao fechamento. Uma plataforma completa para gestão imobiliária moderna.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === cat.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-card text-muted-foreground border border-border/50 hover:border-primary/30 hover:text-foreground"
              }`}
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Text */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{active.title}</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">{active.description}</p>
              <ul className="space-y-4">
                {active.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-primary/10 mt-0.5 shrink-0">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mockup */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-xl p-6">
              {active.mockup}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
