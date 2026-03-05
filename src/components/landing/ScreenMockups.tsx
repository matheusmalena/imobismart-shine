import { BarChart3, Building2, FileText, Shield, Search, Users, TrendingUp, Home, MessageSquare, CreditCard, ClipboardList, Settings, Camera, ChevronDown } from 'lucide-react';

const Sidebar = ({ active }: { active: string }) => {
  const items = [
    { icon: <BarChart3 className="h-3.5 w-3.5" />, label: 'Dashboard' },
    { icon: <Home className="h-3.5 w-3.5" />, label: 'Imóveis' },
    { icon: <Users className="h-3.5 w-3.5" />, label: 'Inquilinos' },
    { icon: <FileText className="h-3.5 w-3.5" />, label: 'Documentos' },
    { icon: <MessageSquare className="h-3.5 w-3.5" />, label: 'WhatsApp' },
    { icon: <CreditCard className="h-3.5 w-3.5" />, label: 'Assinatura' },
    { icon: <ClipboardList className="h-3.5 w-3.5" />, label: 'Relatórios' },
    { icon: <Users className="h-3.5 w-3.5" />, label: 'Equipe' },
  ];
  return (
    <div className="w-[140px] shrink-0 bg-[hsl(var(--sidebar-background,var(--card)))] border-r border-border/30 p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 mb-4 px-1">
        <div className="w-5 h-5 rounded-lg bg-primary flex items-center justify-center">
          <Building2 className="h-3 w-3 text-primary-foreground" />
        </div>
        <span className="text-[10px] font-bold text-foreground">ImobiSmart</span>
      </div>
      {items.map((item) => (
        <div
          key={item.label}
          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[9px] font-medium ${
            item.label === active
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground'
          }`}
        >
          {item.icon}
          {item.label}
        </div>
      ))}
    </div>
  );
};

const MetricCard = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="bg-card rounded-lg border border-border/40 p-3 flex items-center gap-2">
    <div className="p-1.5 rounded-lg bg-primary/10">{icon}</div>
    <div>
      <p className="text-[8px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm font-bold text-foreground">{value}</p>
    </div>
  </div>
);

export function DashboardMockup() {
  return (
    <div className="flex h-[320px] bg-background rounded-b-lg overflow-hidden text-foreground">
      <Sidebar active="Dashboard" />
      <div className="flex-1 p-4 overflow-hidden">
        <div className="mb-4">
          <h3 className="text-sm font-bold">Olá, Carlos! <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">Pro</span></h3>
          <p className="text-[9px] text-muted-foreground">Visão geral dos seus investimentos</p>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          <MetricCard label="Imóveis" value="5" icon={<Building2 className="h-3.5 w-3.5 text-primary" />} />
          <MetricCard label="Lucro Líquido" value="R$ 24.900" icon={<TrendingUp className="h-3.5 w-3.5 text-primary" />} />
          <MetricCard label="ROI Médio" value="4.2%" icon={<BarChart3 className="h-3.5 w-3.5 text-primary" />} />
          <MetricCard label="Ocupação" value="79%" icon={<Users className="h-3.5 w-3.5 text-primary" />} />
        </div>
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-3 bg-card rounded-lg border border-border/40 p-3">
            <p className="text-[10px] font-semibold mb-2">Resumo Financeiro Mensal</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-primary/5 rounded-md p-2">
                <p className="text-[8px] text-muted-foreground">Receita Total</p>
                <p className="text-xs font-bold text-primary">R$ 32.800</p>
              </div>
              <div className="bg-destructive/5 rounded-md p-2">
                <p className="text-[8px] text-muted-foreground">Custos Totais</p>
                <p className="text-xs font-bold text-destructive">R$ 7.900</p>
              </div>
              <div className="bg-primary/5 rounded-md p-2">
                <p className="text-[8px] text-muted-foreground">Lucro Líquido</p>
                <p className="text-xs font-bold text-primary">R$ 24.900</p>
              </div>
            </div>
            {['Apartamento Jardins', 'Casa Alphaville', 'Sala Comercial'].map((name, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-t border-border/20">
                <span className="text-[9px] text-foreground">{name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-semibold text-primary">R$ {['6.650', '9.800', '4.100'][i]}</span>
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${[26, 37, 17][i]}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="col-span-2 bg-card rounded-lg border border-border/40 p-3">
            <p className="text-[10px] font-semibold mb-3">Status dos Imóveis</p>
            <div className="flex justify-center">
              <svg viewBox="0 0 100 100" className="w-24 h-24">
                <circle cx="50" cy="50" r="35" fill="none" stroke="hsl(var(--primary))" strokeWidth="14" strokeDasharray="176 220" strokeDashoffset="0" className="opacity-80" />
                <circle cx="50" cy="50" r="35" fill="none" stroke="hsl(var(--primary)/0.3)" strokeWidth="14" strokeDasharray="44 220" strokeDashoffset="-176" />
              </svg>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[8px] text-muted-foreground">Alugado 4</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary/30" />
                <span className="text-[8px] text-muted-foreground">Vago 1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PropertyCard = ({ name, type, area, beds, baths, revenue, profit, status }: {
  name: string; type: string; area: string; beds: number; baths: number; revenue: string; profit: string; status: string;
}) => (
  <div className="bg-card rounded-lg border border-border/40 overflow-hidden">
    <div className="h-20 bg-gradient-to-br from-muted to-muted/50 relative">
      <span className="absolute top-1.5 left-1.5 text-[7px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-medium">{status}</span>
    </div>
    <div className="p-2.5">
      <p className="text-[10px] font-semibold text-foreground">{name}</p>
      <p className="text-[8px] text-muted-foreground">{type}</p>
      <div className="flex gap-2 mt-1 text-[8px] text-muted-foreground">
        <span>{area}</span><span>{beds}🛏</span><span>{baths}🚿</span>
      </div>
      <div className="grid grid-cols-2 gap-1 mt-2 pt-2 border-t border-border/20">
        <div>
          <p className="text-[7px] text-muted-foreground">Receita</p>
          <p className="text-[9px] font-semibold">{revenue}</p>
        </div>
        <div>
          <p className="text-[7px] text-muted-foreground">Lucro</p>
          <p className="text-[9px] font-semibold text-primary">{profit}</p>
        </div>
      </div>
    </div>
  </div>
);

export function PropertiesMockup() {
  return (
    <div className="flex h-[320px] bg-background rounded-b-lg overflow-hidden text-foreground">
      <Sidebar active="Imóveis" />
      <div className="flex-1 p-4 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-bold">Imóveis</h3>
            <p className="text-[9px] text-muted-foreground">Gerencie seus 5 imóveis ativos</p>
          </div>
          <div className="bg-primary text-primary-foreground text-[9px] px-3 py-1.5 rounded-lg font-medium">+ Novo Imóvel</div>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 flex items-center gap-1.5 bg-card border border-border/40 rounded-lg px-2.5 py-1.5">
            <Search className="h-3 w-3 text-muted-foreground" />
            <span className="text-[9px] text-muted-foreground">Buscar por nome, cidade ou bairro...</span>
          </div>
          <div className="flex items-center gap-1 bg-card border border-border/40 rounded-lg px-2.5 py-1.5 text-[9px] text-muted-foreground">
            Todos os tipos <ChevronDown className="h-3 w-3" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <PropertyCard name="Apartamento Jardins" type="Apartamento" area="120m²" beds={3} baths={2} revenue="R$ 8.500" profit="R$ 6.650" status="Alugado" />
          <PropertyCard name="Casa Alphaville" type="Casa" area="280m²" beds={4} baths={4} revenue="R$ 12.000" profit="R$ 9.800" status="Alugado" />
          <PropertyCard name="Sala Comercial Faria Lima" type="Sala" area="65m²" beds={1} baths={1} revenue="R$ 5.500" profit="R$ 4.100" status="Alugado" />
        </div>
      </div>
    </div>
  );
}

export function DocumentsMockup() {
  return (
    <div className="flex h-[320px] bg-background rounded-b-lg overflow-hidden text-foreground">
      <Sidebar active="Documentos" />
      <div className="flex-1 p-4 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-bold">Documentos</h3>
            <p className="text-[9px] text-muted-foreground">Gerencie os documentos dos seus imóveis</p>
          </div>
          <div className="bg-primary text-primary-foreground text-[9px] px-3 py-1.5 rounded-lg font-medium">📤 Upload de Documento</div>
        </div>
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 flex items-center gap-1.5 bg-card border border-border/40 rounded-lg px-2.5 py-1.5">
            <Search className="h-3 w-3 text-muted-foreground" />
            <span className="text-[9px] text-muted-foreground">Buscar documentos...</span>
          </div>
          <div className="flex items-center gap-1 bg-card border border-border/40 rounded-lg px-2.5 py-1.5 text-[9px] text-muted-foreground">
            Todos os imóveis <ChevronDown className="h-3 w-3" />
          </div>
          <div className="flex items-center gap-1 bg-card border border-border/40 rounded-lg px-2.5 py-1.5 text-[9px] text-muted-foreground">
            Todas categorias <ChevronDown className="h-3 w-3" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-8 bg-card rounded-xl border border-border/40">
          <div className="p-4 rounded-full bg-primary/10 mb-3">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <p className="text-xs font-semibold text-foreground mb-1">Nenhum documento encontrado</p>
          <p className="text-[9px] text-muted-foreground text-center max-w-[200px] mb-3">
            Faça upload de documentos como matrículas, contratos, laudos e comprovantes de IPTU.
          </p>
          <div className="bg-primary/10 text-primary text-[9px] px-3 py-1.5 rounded-lg font-medium">
            📤 Upload de Documento
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsMockup() {
  return (
    <div className="flex h-[320px] bg-background rounded-b-lg overflow-hidden text-foreground">
      <Sidebar active="Dashboard" />
      <div className="flex-1 p-4 overflow-hidden">
        <div className="mb-4">
          <h3 className="text-sm font-bold">Configurações</h3>
          <p className="text-[9px] text-muted-foreground">Gerencie suas informações pessoais e assinatura</p>
        </div>
        <div className="bg-card rounded-xl border border-border/40 p-4 mb-3">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-[10px] font-semibold">Informações Pessoais</p>
              <p className="text-[8px] text-muted-foreground">Seus dados de perfil na plataforma</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">CM</div>
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-2.5 py-1.5 text-[9px] text-muted-foreground">
              <Camera className="h-3 w-3" /> Alterar Foto
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Email', value: 'carlos@email.com' },
              { label: 'Nome Completo', value: 'Carlos Mendes' },
              { label: 'Telefone', value: '(11) 99876-5432' },
              { label: 'Membro desde', value: '5 de março de 2026' },
            ].map((field) => (
              <div key={field.label}>
                <p className="text-[8px] text-muted-foreground mb-0.5">{field.label}</p>
                <div className="bg-muted/30 rounded-md px-2 py-1.5 text-[9px] text-foreground">{field.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border/40 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] font-semibold">Segurança</p>
                <p className="text-[8px] text-muted-foreground">Autenticação de Dois Fatores (2FA)</p>
              </div>
            </div>
            <div className="w-7 h-4 rounded-full bg-muted relative">
              <div className="absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-muted-foreground/40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const SCREEN_MOCKUPS: Record<string, React.FC> = {
  dashboard: DashboardMockup,
  properties: PropertiesMockup,
  documents: DocumentsMockup,
  settings: SettingsMockup,
};
