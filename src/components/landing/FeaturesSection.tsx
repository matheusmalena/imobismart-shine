import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  FileText,
  MessageCircle,
  BarChart3,
  Zap,
  Check,
  Home,
  Camera,
  DollarSign,
  Shield,
  Bell,
  Upload,
  FolderOpen,
  Send,
  Clock,
  Download,
  Filter,
} from "lucide-react";

const categories = [
  {
    id: "properties",
    label: "Gestão de Imóveis",
    icon: Building2,
    title: "Controle total do seu portfólio",
    description:
      "Cadastre imóveis com fotos, detalhes financeiros e acompanhe status em tempo real. Ranking automático de performance e controle de custos por propriedade.",
    features: [
      "Cadastro completo com galeria de fotos",
      "Status: alugado, vago, em reforma, à venda, vendido",
      "Controle financeiro: receita, custos, ROI por imóvel",
      "Ranking de performance automático",
    ],
    mockup: (
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: "Apt. Vila Mariana", status: "Alugado", color: "bg-success", icon: Home },
          { name: "Casa Moema", status: "Vago", color: "bg-info", icon: Home },
          { name: "Sala Comercial", status: "Em Reforma", color: "bg-warning", icon: Building2 },
          { name: "Cobertura Itaim", status: "À Venda", color: "bg-primary", icon: Home },
        ].map((prop) => (
          <div key={prop.name} className="p-3 bg-muted/30 rounded-lg border border-border/30">
            <div className="w-full h-16 bg-muted/50 rounded-md mb-2 flex items-center justify-center">
              <Camera className="h-5 w-5 text-muted-foreground/40" />
            </div>
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
    id: "tenants",
    label: "Inquilinos e Contratos",
    icon: Users,
    title: "Gestão completa de locações",
    description:
      "Cadastre inquilinos, crie contratos de locação e receba alertas automáticos de vencimento. Tudo organizado e acessível em um só lugar.",
    features: [
      "Cadastro de inquilinos com CPF, RG e contato",
      "Contratos de locação com datas e valores",
      "Alertas automáticos de vencimento de contrato",
      "Upload de contrato em PDF",
    ],
    mockup: (
      <div className="space-y-3">
        {[
          { name: "Maria Silva", property: "Apt. Vila Mariana", status: "Ativo", days: "Vence em 45 dias" },
          { name: "João Santos", property: "Casa Moema", status: "Ativo", days: "Vence em 120 dias" },
          { name: "Ana Costa", property: "Sala Comercial", status: "Vencendo", days: "Vence em 5 dias" },
        ].map((tenant) => (
          <div key={tenant.name} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/30">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{tenant.name}</p>
              <p className="text-xs text-muted-foreground">{tenant.property}</p>
            </div>
            <div className="text-right">
              <span className={`text-xs font-medium ${tenant.status === 'Vencendo' ? 'text-warning' : 'text-success'}`}>{tenant.status}</span>
              <p className="text-[10px] text-muted-foreground">{tenant.days}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "documents",
    label: "Documentos",
    icon: FileText,
    title: "Documentos sempre organizados",
    description:
      "Faça upload e organize documentos por imóvel e categoria. Matrículas, IPTU, contratos e laudos acessíveis de qualquer lugar.",
    features: [
      "Upload de documentos por imóvel",
      "Categorias: matrícula, IPTU, contrato, laudo",
      "Visualização e download rápido",
      "Organização automática por propriedade",
    ],
    mockup: (
      <div className="space-y-3">
        {[
          { name: "Matrícula - Apt. Vila Mariana", category: "Matrícula", icon: Shield, size: "2.4 MB" },
          { name: "IPTU 2024 - Casa Moema", category: "IPTU", icon: DollarSign, size: "1.1 MB" },
          { name: "Contrato Locação - Sala", category: "Contrato", icon: FileText, size: "3.2 MB" },
          { name: "Laudo Vistoria - Cobertura", category: "Laudo", icon: FolderOpen, size: "5.8 MB" },
        ].map((doc) => (
          <div key={doc.name} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/30">
            <div className="p-2 rounded-lg bg-primary/10">
              <doc.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
              <p className="text-xs text-muted-foreground">{doc.category} • {doc.size}</p>
            </div>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "whatsapp",
    label: "WhatsApp Business",
    icon: MessageCircle,
    title: "Comunicação automatizada",
    description:
      "Envie lembretes de aluguel via WhatsApp automaticamente. Configure templates personalizados e dias de antecedência para cada contrato.",
    features: [
      "Lembretes automáticos de aluguel via WhatsApp",
      "Templates de mensagem personalizáveis",
      "Configuração de dias antes do vencimento",
      "Integração com Evolution API",
    ],
    mockup: (
      <div className="space-y-3">
        <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="h-4 w-4 text-success" />
            <span className="text-sm font-medium text-foreground">Template de Lembrete</span>
          </div>
          <div className="bg-success/5 border border-success/20 rounded-lg p-3 text-xs text-foreground leading-relaxed">
            <p>Olá <span className="font-semibold text-primary">{'{inquilino}'}</span>! 🏠</p>
            <p className="mt-1">Lembrete do aluguel do imóvel <span className="font-semibold text-primary">{'{imóvel}'}</span>.</p>
            <p className="mt-1">📅 Vencimento: <span className="font-semibold">{'{data}'}</span></p>
            <p>💰 Valor: <span className="font-semibold">{'{valor}'}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/30">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">Enviar 3 dias e 1 dia antes do vencimento</span>
        </div>
      </div>
    ),
  },
  {
    id: "reports",
    label: "Relatórios",
    icon: BarChart3,
    title: "Relatórios profissionais",
    description:
      "Exporte dados do seu portfólio em múltiplos formatos. Filtros avançados por status, tipo e período para análises detalhadas.",
    features: [
      "Exportação em CSV, Excel (XLSX) e JSON",
      "Relatórios em PDF com layout profissional",
      "Filtros por status, tipo de imóvel e busca",
      "Métricas calculadas: ROI, lucro líquido",
    ],
    mockup: (
      <div className="space-y-3">
        <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Formatos Disponíveis</span>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["CSV", "Excel", "JSON", "PDF"].map((format) => (
              <div key={format} className="flex items-center gap-2 p-2 bg-background rounded-md border border-border/30">
                <Download className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">{format}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-foreground">Métricas Incluídas</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["ROI", "Lucro", "Custos", "Ocupação", "Receita"].map((m) => (
              <span key={m} className="px-2 py-1 bg-primary/10 text-primary text-[10px] rounded-full font-medium">{m}</span>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

export function FeaturesSection() {
  const [activeTab, setActiveTab] = useState("properties");
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
            Tudo que você precisa para gerenciar seus imóveis
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Gestão de imóveis, inquilinos, documentos, WhatsApp e relatórios em uma única plataforma.
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
