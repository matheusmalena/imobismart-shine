

# Plano: Padronizar Cards de Relatórios e Melhorar Exportações

## Objetivo
Padronizar todos os tipos de relatório (CSV, JSON, PDF) com o mesmo visual de card, especificar claramente o conteúdo de cada formato e melhorar as funcionalidades de exportação.

---

## Nova Estrutura Visual

### Layout Proposto (3 Cards Uniformes)

```
+--------------------------------------------------+
|  Header: Relatórios + Badge do Plano             |
+--------------------------------------------------+
|                                                  |
|  GRID 3 COLUNAS                                  |
|  +-------------+ +-------------+ +-------------+ |
|  | CSV         | | JSON        | | PDF         | |
|  | Planilha    | | Estruturado | | Profissional| |
|  | [Pro]       | | [Pro]       | | [Plus]      | |
|  |             | |             | |             | |
|  | Conteúdo:   | | Conteúdo:   | | Conteúdo:   | |
|  | - 31 campos | | - Hierárquico| | - Visual    | |
|  | - Excel OK  | | - APIs      | | - Impressão | |
|  |             | |             | |             | |
|  | [Baixar]    | | [Baixar]    | | [Configurar]| |
|  +-------------+ +-------------+ +-------------+ |
|                                                  |
+--------------------------------------------------+
|                                                  |
|  SEÇÃO: Configuração do PDF (expansível)         |
|  (Aparece apenas quando Plus+ clica em "Configurar PDF") |
|                                                  |
+--------------------------------------------------+
```

---

## Alterações Detalhadas

### 1. Refatorar Cards de Exportação

Criar 3 cards uniformes com:
- Ícone e título
- Badge de plano requerido (Pro/Plus)
- Lista detalhada do conteúdo incluído
- Botão de ação (Baixar ou Configurar)

**Card CSV:**
- Ícone: Download
- Descrição: Planilha compatível com Excel
- Conteúdo incluído:
  - 31 campos de dados
  - Informações básicas do imóvel
  - Endereço completo
  - Dados financeiros com cálculos (ROI, Lucro)
  - Características físicas
  - Comodidades
- Plano: Pro

**Card JSON:**
- Ícone: FileJson
- Descrição: Formato estruturado para integrações
- Conteúdo incluído:
  - Estrutura hierárquica organizada
  - Agrupamento por categorias (endereco, financeiro, caracteristicas, comodidades)
  - Campos calculados (custos totais, ROI, lucro)
  - Ideal para desenvolvedores e APIs
- Plano: Pro

**Card PDF:**
- Ícone: FileText
- Descrição: Relatório visual profissional
- Conteúdo incluído:
  - Resumo executivo do portfólio
  - Seções personalizáveis
  - Layout pronto para impressão
  - Ideal para apresentações
- Plano: Plus

### 2. Adicionar Seletor de Imóveis Global

Mover o seletor de imóveis para fora dos cards, aplicando a todos os tipos de exportação:

```
+--------------------------------------------------+
|  Filtro: [Todos os imóveis v]                    |
+--------------------------------------------------+
```

### 3. Melhorar Detalhes do Conteúdo

Adicionar lista visual do que cada exportação contém:

```tsx
// Exemplo de estrutura para cada card
<div className="space-y-2 text-sm">
  <p className="font-medium text-muted-foreground">Inclui:</p>
  <ul className="space-y-1 text-muted-foreground">
    <li className="flex items-center gap-2">
      <CheckCircle className="h-3 w-3 text-primary" />
      Dados básicos e endereço
    </li>
    <li className="flex items-center gap-2">
      <CheckCircle className="h-3 w-3 text-primary" />
      Financeiro com ROI calculado
    </li>
    ...
  </ul>
</div>
```

### 4. Painel de Configuração PDF (Expansível)

Quando o usuário Plus+ clicar em "Configurar PDF", mostrar um painel abaixo dos cards:

```tsx
{showPDFConfig && (
  <Card>
    <CardHeader>
      <CardTitle>Configuração do Relatório PDF</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Opções de personalização */}
    </CardContent>
  </Card>
)}
```

### 5. Melhorar Exportação CSV

**Alterações no `useExportData.ts`:**

- Adicionar resumo no início do arquivo (totais, médias)
- Melhorar formatação de valores monetários
- Adicionar cabeçalho com data de geração
- Separar seções logicamente

```typescript
// Novo formato CSV com resumo
const summaryRows = [
  ['RELATÓRIO DE IMÓVEIS - ImobiSmart'],
  [`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`],
  [''],
  ['RESUMO'],
  [`Total de Imóveis: ${properties.length}`],
  [`Valor Total do Portfólio: ${formatCurrency(totalValue)}`],
  [`Receita Mensal Total: ${formatCurrency(totalRevenue)}`],
  [`Lucro Líquido Mensal: ${formatCurrency(totalProfit)}`],
  [`ROI Médio: ${avgROI.toFixed(2)}%`],
  [''],
  ['DETALHES POR IMÓVEL'],
  [''],
];
```

### 6. Melhorar Exportação JSON

**Alterações no `useExportData.ts`:**

- Adicionar metadados do relatório
- Incluir resumo calculado
- Estrutura mais clara

```typescript
// Novo formato JSON com metadados
const exportData = {
  metadata: {
    gerado_em: new Date().toISOString(),
    plataforma: 'ImobiSmart',
    total_imoveis: properties.length,
  },
  resumo: {
    valor_total_portfolio: totalValue,
    receita_mensal_total: totalRevenue,
    lucro_liquido_mensal: totalProfit,
    roi_medio: avgROI,
    ocupacao_media: avgOccupancy,
  },
  imoveis: [...],
};
```

### 7. Melhorar Relatório PDF

**Alterações no `Reports.tsx`:**

- Adicionar mais opções de personalização
- Melhorar visual do HTML gerado
- Adicionar gráficos simples (barras de progresso)
- Incluir comparativo de performance

---

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/Reports.tsx` | Refatorar layout com 3 cards uniformes, seletor global, painel expansível |
| `src/hooks/useExportData.ts` | Adicionar resumos, metadados, melhorar formatação |

---

## Detalhes de Implementação

### Nova Estrutura do Reports.tsx

```tsx
// Estado para controlar painel PDF
const [showPDFConfig, setShowPDFConfig] = useState(false);

return (
  <DashboardLayout>
    {/* Header */}
    <div className="flex items-center gap-3 mb-6">
      <h1>Relatórios</h1>
      <Badge>{plan}</Badge>
    </div>

    {/* Seletor Global de Imóveis */}
    <Card className="mb-6">
      <CardContent className="pt-4">
        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
          ...
        </Select>
      </CardContent>
    </Card>

    {/* Grid de 3 Cards */}
    <div className="grid gap-4 md:grid-cols-3">
      {/* Card CSV */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar CSV</CardTitle>
          <Badge>Pro</Badge>
        </CardHeader>
        <CardContent>
          <p>Planilha compatível com Excel</p>
          <ul>Conteúdo incluído...</ul>
          <Button onClick={handleExportCSV} disabled={!isPro}>
            {!isPro && <Lock />}
            Baixar CSV
          </Button>
        </CardContent>
      </Card>

      {/* Card JSON */}
      <Card>...</Card>

      {/* Card PDF */}
      <Card>
        ...
        <Button onClick={() => setShowPDFConfig(true)} disabled={!isPlus}>
          {!isPlus && <Lock />}
          Configurar PDF
        </Button>
      </Card>
    </div>

    {/* Painel de Configuração PDF (condicional) */}
    {showPDFConfig && isPlus && (
      <Card className="mt-6">
        {/* Configurações existentes */}
      </Card>
    )}
  </DashboardLayout>
);
```

### Novo Formato useExportData.ts

```typescript
// Função auxiliar de formatação
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Cálculo de métricas agregadas
const calculateSummary = (properties: Property[]) => {
  const totalValue = properties.reduce((sum, p) => sum + Number(p.property_value), 0);
  const totalRevenue = properties.reduce((sum, p) => sum + Number(p.monthly_revenue), 0);
  const totalCosts = properties.reduce((sum, p) => 
    sum + Number(p.condominium_fee) + Number(p.iptu_fee) + 
    Number(p.maintenance_fee) + Number(p.other_costs), 0
  );
  const totalProfit = totalRevenue - totalCosts;
  const avgROI = properties.length > 0 
    ? properties.reduce((sum, p) => {
        const profit = Number(p.monthly_revenue) - (Number(p.condominium_fee) + 
          Number(p.iptu_fee) + Number(p.maintenance_fee) + Number(p.other_costs));
        return sum + (Number(p.property_value) > 0 
          ? ((profit * 12) / Number(p.property_value)) * 100 
          : 0);
      }, 0) / properties.length
    : 0;
  const avgOccupancy = properties.length > 0
    ? properties.reduce((sum, p) => sum + Number(p.occupancy_rate), 0) / properties.length
    : 0;

  return { totalValue, totalRevenue, totalCosts, totalProfit, avgROI, avgOccupancy };
};
```

---

## Especificação de Conteúdo por Tipo

### CSV (31+ campos)
| Categoria | Campos |
|-----------|--------|
| **Básico** | Nome, Tipo, Status |
| **Endereço** | Rua, Número, Complemento, Bairro, Cidade, Estado, CEP |
| **Financeiro** | Valor Imóvel, Receita Mensal, Condomínio, IPTU, Manutenção, Outros Custos, Custos Totais, Lucro Mensal, ROI Anual |
| **Características** | Área, Quartos, Suítes, Banheiros, Vagas, Andar, Ano Construção |
| **Comodidades** | Piscina, Academia, Elevador, Varanda, Churrasqueira, Mobiliado |
| **Outros** | Taxa Ocupação, Data Aquisição |

### JSON (Estrutura Hierárquica)
```
{
  metadata: { gerado_em, plataforma, total_imoveis }
  resumo: { valor_total, receita_total, lucro_total, roi_medio, ocupacao_media }
  imoveis: [
    {
      basico: { nome, tipo, status }
      endereco: { rua, numero, ... }
      financeiro: { valor, receita, custos: {...}, lucro, roi }
      caracteristicas: { area, quartos, ... }
      comodidades: { piscina, academia, ... }
    }
  ]
}
```

### PDF (Seções Visuais)
| Seção | Conteúdo |
|-------|----------|
| **Cabeçalho** | Logo, Data/Hora, Título |
| **Resumo Executivo** | Total Imóveis, Valor Portfólio, Receita Mensal |
| **Detalhes por Imóvel** | Card visual com nome, endereço, foto placeholder |
| **Financeiro** | Receita, Custos detalhados, Lucro, ROI (se checkbox marcado) |
| **Características** | Área, quartos, banheiros, etc. (se checkbox marcado) |
| **Performance** | Ocupação, Status (se checkbox marcado) |
| **Rodapé** | "Gerado por ImobiSmart" |

---

## Resultado Esperado

1. **Visual Consistente**: Os 3 tipos de relatório terão o mesmo padrão visual de card
2. **Clareza**: Cada card mostra exatamente o que será exportado
3. **Hierarquia de Planos**: CSV/JSON para Pro+, PDF para Plus+
4. **Exportações Melhoradas**: Incluem resumos, metadados e formatação profissional
5. **UX Simplificada**: Seletor global de imóveis no topo, painel PDF expansível

