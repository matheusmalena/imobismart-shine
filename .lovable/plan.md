
# Plano: Preview Visual de Relatório + Página Dedicada de Planos

## Objetivo
1. Adicionar preview visual do relatório antes de exportar, mostrando como ficará o documento final
2. Criar uma página dedicada de planos (`/plans`) com visual atrativo que será o destino de todos os botões de upgrade

---

## Parte 1: Página Dedicada de Planos

### Nova Rota
Criar `/plans` como destino de todos os botões de upgrade ao invés de `/settings`.

### Estrutura da Página

```
+------------------------------------------------------------------+
|  Header com título e descrição atrativa                          |
+------------------------------------------------------------------+
|                                                                  |
|  Grid 4 colunas com cards dos planos (estilo landing page)       |
|  +------------+ +------------+ +------------+ +------------+     |
|  | Gratuito   | | Pro        | | Plus       | | Enterprise |     |
|  | R$ 0       | | R$ 49      | | R$ 99      | | Consulte   |     |
|  | [Popular]  | |            | |            | |            |     |
|  |            | |            | |            | |            |     |
|  | Features   | | Features   | | Features   | | Features   |     |
|  |            | |            | |            | |            |     |
|  | [Atual]    | | [Upgrade]  | | [Upgrade]  | | [Contato]  |     |
|  +------------+ +------------+ +------------+ +------------+     |
|                                                                  |
|  Comparativo de recursos (tabela expandida opcional)             |
|                                                                  |
|  FAQ sobre planos                                                |
+------------------------------------------------------------------+
```

### Características Visuais
- Header com gradiente e ícone animado
- Cards com hover effects (elevação, borda primary)
- Badge "Plano Atual" destacado no card do usuário
- Badge "Mais Popular" no plano Pro
- Animações com Framer Motion
- Seção de comparativo de recursos
- FAQ integrado sobre pagamentos

### Arquivos a Criar/Modificar
| Arquivo | Ação |
|---------|------|
| `src/pages/Plans.tsx` | Criar página dedicada de planos |
| `src/App.tsx` | Adicionar rota `/plans` |

### Atualizar Redirecionamentos
Modificar todos os botões de upgrade para apontar para `/plans`:

| Arquivo | Linha | Mudança |
|---------|-------|---------|
| `src/pages/Reports.tsx` | 429, 740 | `/settings` → `/plans` |
| `src/components/dashboard/ProFeaturesCard.tsx` | 104 | `/settings` → `/plans` |
| `src/components/dashboard/PlusAICard.tsx` | 109 | `/settings` → `/plans` |
| `src/components/dashboard/LockedSection.tsx` | 64 | `/settings` → `/plans` |
| `src/pages/Dashboard.tsx` | 163 | `/settings` → `/plans` |
| `src/components/properties/PropertyLimitBanner.tsx` | 52 | `/settings` → `/plans` |
| `src/components/properties/UnarchiveBlockedDialog.tsx` | 65 | `/settings` → `/plans` |

---

## Parte 2: Preview Visual do Relatório

### Funcionamento
Quando o usuário configurar um relatório e clicar para exportar, mostrar um modal com preview antes do download.

### Tipos de Preview

**CSV/XLSX Preview:**
```
+------------------------------------------------------------------+
| Modal: Prévia do Relatório CSV                                   |
+------------------------------------------------------------------+
|                                                                  |
|  RESUMO DO PORTFÓLIO                                             |
|  +------------------------------------------------------------+  |
|  | Total: 5 imóveis | Valor: R$ 2.500.000 | ROI: 8.5%         |  |
|  +------------------------------------------------------------+  |
|                                                                  |
|  PRÉVIA DOS DADOS (tabela simulada)                              |
|  +------------------------------------------------------------+  |
|  | Nome        | Tipo      | Valor       | Receita   | ROI    |  |
|  |-------------|-----------|-------------|-----------|--------|  |
|  | Apto Centro | Apartamento| R$ 500.000 | R$ 3.500  | 8.4%   |  |
|  | Casa Praia  | Casa      | R$ 800.000 | R$ 5.000  | 7.5%   |  |
|  | ...         | ...       | ...        | ...       | ...    |  |
|  +------------------------------------------------------------+  |
|  Mostrando 3 de 5 imóveis                                        |
|                                                                  |
|  CAMPOS INCLUÍDOS: 25 campos selecionados                        |
|  [Básico ✓] [Endereço ✓] [Financeiro ✓] [Características]        |
|                                                                  |
|                     [Cancelar]  [Confirmar Download]             |
+------------------------------------------------------------------+
```

**JSON Preview:**
```
+------------------------------------------------------------------+
| Modal: Prévia do Relatório JSON                                  |
+------------------------------------------------------------------+
|                                                                  |
|  ESTRUTURA DO ARQUIVO                                            |
|  +------------------------------------------------------------+  |
|  | {                                                           |  |
|  |   "metadata": {                                             |  |
|  |     "gerado_em": "2025-01-23T...",                          |  |
|  |     "total_imoveis": 5                                      |  |
|  |   },                                                        |  |
|  |   "resumo": {                                               |  |
|  |     "valor_total_portfolio": 2500000,                       |  |
|  |     "roi_medio": 8.5                                        |  |
|  |   },                                                        |  |
|  |   "imoveis": [...]                                          |  |
|  | }                                                           |  |
|  +------------------------------------------------------------+  |
|                                                                  |
|                     [Cancelar]  [Confirmar Download]             |
+------------------------------------------------------------------+
```

**PDF Preview:**
```
+------------------------------------------------------------------+
| Modal: Prévia do Relatório PDF                                   |
+------------------------------------------------------------------+
|                                                                  |
|  VISUALIZAÇÃO DO DOCUMENTO                                       |
|  +------------------------------------------------------------+  |
|  |                                                             |  |
|  |  [iframe com HTML do PDF renderizado em miniatura]          |  |
|  |                                                             |  |
|  +------------------------------------------------------------+  |
|                                                                  |
|  Seções incluídas: Financeiro, Características, Performance      |
|                                                                  |
|                     [Cancelar]  [Gerar PDF]                      |
+------------------------------------------------------------------+
```

### Componente de Preview
Criar componente `ReportPreviewDialog` que:
- Recebe tipo de relatório (csv, xlsx, json, pdf)
- Recebe dados filtrados e configuração
- Mostra preview apropriado para cada tipo
- Permite confirmar ou cancelar exportação

### Fluxo do Usuário
1. Usuário configura relatório (seleciona campos)
2. Clica em "Baixar CSV/XLSX/JSON/PDF"
3. Modal de preview aparece com visualização
4. Usuário confirma → arquivo é gerado
5. Usuário cancela → volta para configuração

---

## Detalhes Técnicos

### Nova Página de Planos (`src/pages/Plans.tsx`)

```typescript
export default function Plans() {
  const navigate = useNavigate();
  const { activePlans, isLoading } = usePlans();
  const { subscription } = useSubscription();
  
  const currentPlan = subscription?.plan || 'starter';

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header atrativo */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Crown className="h-4 w-4" />
            Escolha seu Plano
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Desbloqueie todo o potencial do ImobiSmart
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Compare os planos e escolha o melhor para gerenciar sua carteira de imóveis
          </p>
        </div>

        {/* Grid de planos com animações */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activePlans.map((plan) => (
            <PlanCard 
              key={plan.id}
              plan={plan}
              isCurrentPlan={plan.id === currentPlan}
              onSelect={() => handleSelectPlan(plan.id)}
            />
          ))}
        </motion.div>

        {/* Comparativo de recursos */}
        <FeatureComparisonTable plans={activePlans} />

        {/* FAQ */}
        <PlansFAQ />
      </div>
    </DashboardLayout>
  );
}
```

### Componente de Preview (`src/components/reports/ReportPreviewDialog.tsx`)

```typescript
interface ReportPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'csv' | 'xlsx' | 'json' | 'pdf';
  properties: Property[];
  config: ExportConfig;
  onConfirm: () => void;
}

export function ReportPreviewDialog({
  open,
  onOpenChange,
  type,
  properties,
  config,
  onConfirm
}: ReportPreviewDialogProps) {
  // Renderiza preview baseado no tipo
  const renderPreview = () => {
    switch (type) {
      case 'csv':
      case 'xlsx':
        return <SpreadsheetPreview properties={properties} config={config} />;
      case 'json':
        return <JSONPreview properties={properties} config={config} />;
      case 'pdf':
        return <PDFPreview properties={properties} config={config} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prévia do Relatório {type.toUpperCase()}</DialogTitle>
          <DialogDescription>
            Confira como seu relatório ficará antes de baixar
          </DialogDescription>
        </DialogHeader>
        
        {renderPreview()}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>
            <Download className="mr-2 h-4 w-4" />
            Confirmar Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Componente SpreadsheetPreview

```typescript
function SpreadsheetPreview({ properties, config }: PreviewProps) {
  const summary = calculateSummary(properties);
  const previewData = properties.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Resumo */}
      <div className="grid grid-cols-4 gap-3">
        <MetricBox label="Total Imóveis" value={properties.length} />
        <MetricBox label="Valor Portfólio" value={formatCurrency(summary.totalValue)} />
        <MetricBox label="Receita Mensal" value={formatCurrency(summary.totalRevenue)} />
        <MetricBox label="ROI Médio" value={`${summary.avgROI.toFixed(1)}%`} />
      </div>

      {/* Tabela de preview */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {config.includeBasic && <TableHead>Nome</TableHead>}
              {config.includeBasic && <TableHead>Tipo</TableHead>}
              {config.includeFinancial && <TableHead>Valor</TableHead>}
              {config.includeFinancial && <TableHead>Receita</TableHead>}
              {config.includeFinancial && <TableHead>ROI</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewData.map((property) => (
              <TableRow key={property.id}>
                {/* Células baseadas na config */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="p-2 bg-muted text-xs text-center text-muted-foreground">
          Mostrando {previewData.length} de {properties.length} imóveis
        </div>
      </div>

      {/* Campos selecionados */}
      <div className="flex flex-wrap gap-2">
        {config.includeBasic && <Badge>Básico</Badge>}
        {config.includeAddress && <Badge>Endereço</Badge>}
        {config.includeFinancial && <Badge>Financeiro</Badge>}
        {config.includeCharacteristics && <Badge>Características</Badge>}
        {config.includeAmenities && <Badge>Comodidades</Badge>}
        {config.includePerformance && <Badge>Performance</Badge>}
      </div>
    </div>
  );
}
```

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/Plans.tsx` | **CRIAR** - Página dedicada de planos |
| `src/components/reports/ReportPreviewDialog.tsx` | **CRIAR** - Modal de preview |
| `src/App.tsx` | Adicionar rota `/plans` |
| `src/pages/Reports.tsx` | Integrar preview antes de exportar |
| `src/components/dashboard/ProFeaturesCard.tsx` | Atualizar redirect |
| `src/components/dashboard/PlusAICard.tsx` | Atualizar redirect |
| `src/components/dashboard/LockedSection.tsx` | Atualizar redirect |
| `src/pages/Dashboard.tsx` | Atualizar redirect |
| `src/components/properties/PropertyLimitBanner.tsx` | Atualizar redirect |
| `src/components/properties/UnarchiveBlockedDialog.tsx` | Atualizar redirect |

---

## Resultado Esperado

1. **Página de Planos Dedicada**: Visual atrativo com animações, comparativo de recursos e CTAs claros
2. **Preview Visual**: Usuários veem exatamente como o relatório ficará antes de baixar
3. **Navegação Consistente**: Todos os botões de upgrade levam para a página de planos
4. **Experiência Premium**: Visual profissional que incentiva upgrades
5. **Transparência**: Usuário tem controle total sobre o que será exportado
