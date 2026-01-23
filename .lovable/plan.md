
# Plano: Simplificação do Menu e Melhoria da UI

## Resumo das Alterações

Este plano implementa 4 mudanças principais para melhorar a experiência do usuário:

1. Remover "Configurações" do menu lateral (já acessível via foto de perfil)
2. Unificar "Exportar Dados" e "Relatórios PDF" em uma única página "Relatórios"
3. Remover a barra de input da IA do header
4. Aumentar o ícone da IA e adicionar frases rotativas para incentivar o uso

---

## Alteração 1: Remover Configurações do Menu

**Arquivo:** `src/components/layout/DashboardLayout.tsx`

Remover a linha de "Configurações" do array `navigation`:

```typescript
// Antes
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Imóveis', href: '/properties', icon: Home },
  { name: 'Inquilinos', href: '/tenants', icon: Users },
  { name: 'Documentos', href: '/documents', icon: FileText },
  { name: 'WhatsApp', href: '/whatsapp', icon: MessageCircle },
  { name: 'Configurações', href: '/settings', icon: Settings }, // REMOVER
];

// Depois
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Imóveis', href: '/properties', icon: Home },
  { name: 'Inquilinos', href: '/tenants', icon: Users },
  { name: 'Documentos', href: '/documents', icon: FileText },
  { name: 'WhatsApp', href: '/whatsapp', icon: MessageCircle },
];
```

**Nota:** Configurações permanece acessível via dropdown do perfil no rodapé da sidebar.

---

## Alteração 2: Unificar Exportar Dados e Relatórios PDF

### 2.1 Atualizar o Menu

**Arquivo:** `src/components/layout/DashboardLayout.tsx`

Substituir os dois links separados por um único link "Relatórios":

```typescript
// Remover os dois links separados (Exportar Dados e Relatórios PDF)
// Adicionar um único link:
<Link
  to="/reports"
  className={cn(
    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
    location.pathname === '/reports'
      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
  )}
  onClick={() => setSidebarOpen(false)}
>
  <ClipboardList className="h-5 w-5" />
  Relatórios
  {!isPro && (
    <Badge variant="outline" className="ml-auto gap-1 text-xs bg-sidebar-accent">
      <Lock className="h-3 w-3" />
      Upgrade
    </Badge>
  )}
</Link>
```

### 2.2 Criar Nova Página Unificada

**Arquivo:** `src/pages/Reports.tsx` (reescrever completamente)

Nova estrutura com funcionalidades habilitadas por plano:

- **Usuário Gratuito:** Vê card de upgrade com preview das funcionalidades
- **Usuário Pro:** Acesso a CSV/JSON, vê seção de PDF com lock para Plus
- **Usuário Plus+:** Acesso completo (CSV, JSON e PDF)

Layout proposto:

```
+--------------------------------------------------+
|  Header: Relatórios                              |
+--------------------------------------------------+
|                                                  |
|  SEÇÃO 1: Exportação Rápida (Pro+)               |
|  [CSV Card]        [JSON Card]                   |
|                                                  |
+--------------------------------------------------+
|                                                  |
|  SEÇÃO 2: Relatórios PDF (Plus+)                 |
|  - Configuração de relatório                     |
|  - Seleção de imóvel                             |
|  - Opções de conteúdo                            |
|  - Botão gerar PDF                               |
|                                                  |
+--------------------------------------------------+
```

Lógica de acesso:
- `!isPro`: Mostrar card de upgrade completo
- `isPro && !isPlus`: Mostrar exportação CSV/JSON + seção PDF com lock
- `isPlus`: Acesso total

### 2.3 Remover Página Export

**Arquivo:** `src/pages/Export.tsx` - Será deletado

**Arquivo:** `src/App.tsx` - Remover rota `/export`

---

## Alteração 3: Remover Barra de IA do Header

**Arquivo:** `src/components/layout/DashboardLayout.tsx`

Remover todo o bloco do AI Copilot Input do header (linhas 360-384):

```typescript
// REMOVER TODO ESTE BLOCO:
{/* AI Copilot Input - Centered */}
<div className="flex-1 flex justify-center px-4">
  <div className="relative w-full max-w-xl">
    ...
  </div>
</div>
```

Também remover os estados e lógica relacionados:
- `aiQuestion`, `setAiQuestion`
- `placeholderIndex`, `isTyping`, `displayedPlaceholder`
- `placeholderSuggestions`
- `handleAskCopilot`, `handleAiKeyDown`
- useEffect de animação do placeholder

---

## Alteração 4: Melhorar Ícone da IA com Frases Rotativas

**Arquivo:** `src/components/ai/PortfolioCopilot.tsx`

### 4.1 Aumentar Tamanho do Botão

```typescript
// Antes
<Button
  className={cn(
    "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50",
    ...
  )}
>
  <Sparkles className="h-6 w-6" />
</Button>

// Depois
<Button
  className={cn(
    "fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-xl z-50",
    ...
  )}
>
  <Sparkles className="h-7 w-7" />
</Button>
```

### 4.2 Adicionar Frases Rotativas Acima do Ícone

Adicionar estado e lógica para frases animadas:

```typescript
// Novo array de frases de incentivo
const AI_PROMPTS = [
  "Pergunte sobre seu portfólio",
  "Qual imóvel rende mais?",
  "Analise sua ocupação",
  "Descubra oportunidades",
  "Tire suas dúvidas",
];

// Estado para controle da frase atual
const [promptIndex, setPromptIndex] = useState(0);

// useEffect para rotação das frases
useEffect(() => {
  const interval = setInterval(() => {
    setPromptIndex((prev) => (prev + 1) % AI_PROMPTS.length);
  }, 3000);
  return () => clearInterval(interval);
}, []);
```

### 4.3 Novo Layout do Botão com Tooltip Animado

```tsx
{/* Floating Button with Prompt */}
<div className={cn(
  "fixed bottom-6 right-6 flex flex-col items-end gap-2 z-50",
  isOpen && "hidden"
)}>
  {/* Animated Prompt Bubble */}
  <div className="bg-background border rounded-full px-4 py-2 shadow-lg animate-fade-in">
    <p className="text-sm text-muted-foreground whitespace-nowrap">
      {AI_PROMPTS[promptIndex]}
    </p>
  </div>
  
  {/* Button */}
  <Button
    onClick={() => setIsOpen(true)}
    className={cn(
      "h-16 w-16 rounded-full shadow-xl",
      "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
      "transition-all duration-300 hover:scale-110"
    )}
    size="icon"
  >
    <Sparkles className="h-7 w-7" />
  </Button>
</div>
```

---

## Resumo de Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/layout/DashboardLayout.tsx` | Remover Configurações do menu, unificar links de relatório, remover input IA do header |
| `src/pages/Reports.tsx` | Reescrever com layout unificado e lógica por plano |
| `src/pages/Export.tsx` | **DELETAR** |
| `src/App.tsx` | Remover rota `/export` |
| `src/components/ai/PortfolioCopilot.tsx` | Aumentar botão e adicionar frases rotativas |

---

## Fluxo de Acesso por Plano (Página Relatórios)

### Gratuito (Starter)
- Vê card centralizado de upgrade
- Preview das funcionalidades disponíveis
- CTA: "Fazer Upgrade para Pro"

### Pro
- Acesso completo a CSV e JSON
- Seção de PDF visível mas com LockedSection
- CTA na seção PDF: "Fazer Upgrade para Plus"

### Plus / Enterprise
- Acesso total a todas as funcionalidades
- CSV, JSON e geração de PDF

---

## Detalhes Técnicos

### Imports Necessários em Reports.tsx

```typescript
import { useUserData } from '@/hooks/useUserData';
const { isPro, isPlus, plan } = useUserData();
```

### Lógica de Renderização Condicional

```tsx
// Não é Pro - mostra upgrade completo
if (!isPro) {
  return <UpgradeCard requiredPlan="Pro" />;
}

// É Pro - mostra página com seções
return (
  <>
    {/* Seção Export - sempre visível para Pro+ */}
    <ExportSection />
    
    {/* Seção PDF - locked para Pro, open para Plus+ */}
    <LockedSection hasAccess={isPlus} requiredPlan="Plus">
      <PDFReportSection />
    </LockedSection>
  </>
);
```

### Simplificação do Header

O header ficará mais limpo, contendo apenas:
- Botão de menu mobile (hamburger)
- Espaço flexível (sem input de IA)
- ThemeToggle

```tsx
<header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 lg:px-8">
  <button className="lg:hidden ...">
    <Menu className="h-5 w-5" />
  </button>
  
  <div className="flex-1" /> {/* Spacer */}
  
  <ThemeToggle />
</header>
```

