import { useState } from "react";
import { motion } from "framer-motion";
import { Monitor, BarChart3, Building2, FileText, Settings, Home, TrendingUp, Users, DollarSign, FolderOpen, Bell, Shield, CheckCircle2, Sliders } from "lucide-react";

const screens = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "properties", label: "Imóveis", icon: Building2 },
  { id: "documents", label: "Documentos", icon: FileText },
  { id: "settings", label: "Configurações", icon: Settings },
];

function DashboardMockup() {
  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Imóveis", value: "24", icon: Home, color: "text-primary" },
          { label: "Alugados", value: "18", icon: CheckCircle2, color: "text-success" },
          { label: "Receita", value: "R$ 52k", icon: DollarSign, color: "text-info" },
          { label: "ROI médio", value: "8.4%", icon: TrendingUp, color: "text-warning" },
        ].map((s) => (
          <div key={s.label} className="bg-muted/30 rounded-lg p-3 border border-border/30 text-center">
            <s.icon className={`h-4 w-4 ${s.color} mx-auto mb-1`} />
            <p className="text-base font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/20 rounded-lg p-3 border border-border/30">
          <p className="text-xs font-medium text-foreground mb-2">Receita Mensal</p>
          <div className="flex items-end gap-0.5 h-12">
            {[40, 55, 35, 65, 50, 75, 60, 80, 70, 90, 85, 95].map((h, i) => (
              <div key={i} className="flex-1 bg-primary rounded-t-sm" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="bg-muted/20 rounded-lg p-3 border border-border/30">
          <p className="text-xs font-medium text-foreground mb-2">Ocupação</p>
          <div className="flex items-center justify-center h-12">
            <div className="relative w-12 h-12">
              <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray="88" strokeDashoffset="22" strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">75%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertiesMockup() {
  const props = [
    { name: "Apt. Vila Mariana", type: "Apartamento", status: "Alugado", revenue: "R$ 3.200", statusColor: "bg-success/10 text-success" },
    { name: "Casa Alphaville", type: "Casa", status: "Vago", revenue: "—", statusColor: "bg-warning/10 text-warning" },
    { name: "Sala Comercial Centro", type: "Comercial", status: "Alugado", revenue: "R$ 5.500", statusColor: "bg-success/10 text-success" },
    { name: "Terreno Cotia", type: "Terreno", status: "À venda", revenue: "—", statusColor: "bg-info/10 text-info" },
  ];
  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium text-foreground">Meus Imóveis</p>
        <span className="text-xs text-muted-foreground">4 imóveis</span>
      </div>
      {props.map((p) => (
        <div key={p.name} className="flex items-center gap-3 bg-muted/30 rounded-lg p-3 border border-border/30">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Home className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
            <p className="text-[10px] text-muted-foreground">{p.type}</p>
          </div>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${p.statusColor}`}>{p.status}</span>
          <span className="text-xs font-semibold text-foreground w-16 text-right">{p.revenue}</span>
        </div>
      ))}
    </div>
  );
}

function DocumentsMockup() {
  const docs = [
    { name: "Matrícula_Apt203.pdf", cat: "Matrícula", size: "2.4 MB", date: "12/01/2025" },
    { name: "IPTU_2024_Vila_Mariana.pdf", cat: "IPTU", size: "1.1 MB", date: "05/01/2025" },
    { name: "Contrato_Locação_Carlos.pdf", cat: "Contrato", size: "3.8 MB", date: "01/12/2024" },
    { name: "Laudo_Vistoria_Casa.pdf", cat: "Laudo", size: "5.2 MB", date: "20/11/2024" },
  ];
  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium text-foreground">Documentos</p>
        <div className="flex gap-1">
          {["Todos", "Matrícula", "IPTU", "Contrato"].map((f) => (
            <span key={f} className={`text-[10px] px-2 py-0.5 rounded-full border ${f === "Todos" ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground border-border/50"}`}>{f}</span>
          ))}
        </div>
      </div>
      {docs.map((d) => (
        <div key={d.name} className="flex items-center gap-3 bg-muted/30 rounded-lg p-3 border border-border/30">
          <FolderOpen className="h-4 w-4 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{d.name}</p>
            <p className="text-[10px] text-muted-foreground">{d.cat} · {d.size}</p>
          </div>
          <span className="text-[10px] text-muted-foreground">{d.date}</span>
        </div>
      ))}
    </div>
  );
}

function SettingsMockup() {
  return (
    <div className="p-6 space-y-4">
      <p className="text-sm font-medium text-foreground">Configurações</p>
      <div className="space-y-3">
        <div className="bg-muted/30 rounded-lg p-4 border border-border/30 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">João Silva</p>
              <p className="text-[10px] text-muted-foreground">joao@email.com</p>
            </div>
          </div>
        </div>
        {[
          { label: "Plano atual", value: "Pro", icon: Shield },
          { label: "Notificações", value: "Ativadas", icon: Bell },
          { label: "Autenticação 2FA", value: "Configurada", icon: CheckCircle2 },
          { label: "Preferências", value: "Personalizar", icon: Sliders },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 bg-muted/30 rounded-lg p-3 border border-border/30">
            <item.icon className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs text-foreground flex-1">{item.label}</span>
            <span className="text-[10px] text-muted-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const mockups: Record<string, () => JSX.Element> = {
  dashboard: DashboardMockup,
  properties: PropertiesMockup,
  documents: DocumentsMockup,
  settings: SettingsMockup,
};

export function PlatformDemo() {
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const MockupComponent = mockups[activeScreen];

  return (
    <section className="py-24 px-4 bg-muted/30" id="demo">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Monitor className="h-4 w-4" />
            Veja na Prática
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Conheça a plataforma por dentro
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Interface moderna e intuitiva. Veja como cada área funciona.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {screens.map((screen) => (
            <button
              key={screen.id}
              onClick={() => setActiveScreen(screen.id)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeScreen === screen.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-card text-muted-foreground border border-border/50 hover:border-primary/30"
              }`}
            >
              <screen.icon className="h-4 w-4" />
              {screen.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeScreen}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md bg-background text-xs text-muted-foreground border border-border/50">
                  app.imobismart.com/{activeScreen}
                </div>
              </div>
            </div>
            <MockupComponent />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
