

# Plano: Relatórios Completos com Filtros e Configurações Detalhadas

## Objetivo
Adicionar filtros e configuração de relatório para CSV e JSON (igual ao PDF), além de melhorar significativamente a apresentação visual com explicações detalhadas sobre o conteúdo de cada tipo de exportação.

---

## Nova Estrutura Visual

### Layout Proposto

```
+------------------------------------------------------------------+
|  Header: Relatórios + Badge do Plano                             |
+------------------------------------------------------------------+
|                                                                  |
|  SEÇÃO: FILTROS GLOBAIS (Card bonito com ícones)                 |
|  +------------------------------------------------------------+  |
|  | Imóvel: [Dropdown]                                         |  |
|  | Status: [Alugado] [Disponível] [Manutenção] [Todos]        |  |
|  | Tipo:   [Apartamento] [Casa] [Comercial] [Todos]           |  |
|  +------------------------------------------------------------+  |
|                                                                  |
|  GRID 3 COLUNAS - CARDS DE TIPO DE RELATÓRIO                     |
|  +------------------+ +------------------+ +------------------+  |
|  | CSV              | | JSON             | | PDF              |  |
|  | [ícone grande]   | | [ícone grande]   | | [ícone grande]   |  |
|  | Planilha Excel   | | Estruturado      | | Profissional     |  |
|  | [Badge Pro]      | | [Badge Pro]      | | [Badge Plus]     |  |
|  |                  | |                  | |                  |  |
|  | [Configurar]     | | [Configurar]     | | [Configurar]     |  |
|  +------------------+ +------------------+ +------------------+  |
|                                                                  |
|  PAINEL EXPANSÍVEL (Quando clica em Configurar)                  |
|  +------------------------------------------------------------+  |
|  | CONFIGURAÇÃO DO RELATÓRIO CSV                              |  |
|  |                                                             |  |
|  | O QUE É INCLUÍDO (Explicação visual bonita)                 |  |
|  | +--------+ +--------+ +--------+ +--------+                 |  |
|  | |Básico  | |Endereço| |Financeir| |Caract. |                |  |
|  | |[check] | |[check] | |[check] | |[check] |                 |  |
|  | |Nome    | |Rua     | |Valor   | |Quartos |                 |  |
|  | |Tipo    | |Cidade  | |Receita | |Área    |                 |  |
|  | |Status  | |Estado  | |Custos  | |Vagas   |                 |  |
|  | +--------+ +--------+ +--------+ +--------+                 |  |
|  |                                                             |  |
|  | [Baixar CSV]                                                |  |
|  +------------------------------------------------------------+  |
|                                                                  |
+------------------------------------------------------------------+
```

---

## Detalhes da Implementação

### 1. Adicionar Mais Estados para Controle

```typescript
// Estados para controle de painéis
const [activeConfigPanel, setActiveConfigPanel] = useState<'csv' | 'json' | 'pdf' | null>(null);

// Estados para filtros avançados
const [selectedStatus, setSelectedStatus] = useState<string>('all');
const [selectedType, setSelectedType] = useState<string>('all');

// Estados para seleção de campos (CSV e JSON)
const [csvIncludeBasic, setCsvIncludeBasic] = useState(true);
const [csvIncludeAddress, setCsvIncludeAddress] = useState(true);
const [csvIncludeFinancial, setCsvIncludeFinancial] = useState(true);
const [csvIncludeCharacteristics, setCsvIncludeCharacteristics] = useState(true);
const [csvIncludeAmenities, setCsvIncludeAmenities] = useState(true);
const [csvIncludePerformance, setCsvIncludePerformance] = useState(true);

// Mesmos estados para JSON
const [jsonIncludeBasic, setJsonIncludeBasic] = useState(true);
// ... etc
```

### 2. Seção de Filtros Globais Melhorada

Card no topo com filtros visuais bonitos:

- Seletor de imóvel (dropdown com busca)
- Badges clicáveis para Status (Alugado, Disponível, Em Manutenção, Todos)
- Badges clicáveis para Tipo (Apartamento, Casa, Comercial, etc.)
- Contador de imóveis filtrados

### 3. Cards de Tipo de Relatório Redesenhados

Cada card terá:
- Ícone grande centralizado com cor de destaque
- Título e descrição clara
- Badge de plano requerido
- Botão "Configurar e Baixar" que abre painel expansível

### 4. Painéis de Configuração Expansíveis (um por tipo)

Quando o usuário clica em "Configurar" em um card, abre um painel abaixo com:

**Estrutura Visual do Painel:**

```
+------------------------------------------------------------------+
| CONFIGURAÇÃO DO RELATÓRIO [CSV/JSON/PDF]                         |
+------------------------------------------------------------------+
|                                                                   |
| O QUE SERÁ INCLUÍDO NO RELATÓRIO                                  |
| (Selecione as categorias de dados que deseja exportar)            |
|                                                                   |
| +-------------------+ +-------------------+ +-------------------+  |
| | ✓ DADOS BÁSICOS   | | ✓ ENDEREÇO        | | ✓ FINANCEIRO      |  |
| |                   | |                   | |                   |  |
| | • Nome do imóvel  | | • Rua e número    | | • Valor do imóvel |  |
| | • Tipo de imóvel  | | • Bairro          | | • Receita mensal  |  |
| | • Status atual    | | • Cidade/Estado   | | • Custos (4 tipos)|  |
| |                   | | • CEP             | | • Lucro calculado |  |
| |                   | |                   | | • ROI anual       |  |
| +-------------------+ +-------------------+ +-------------------+  |
|                                                                   |
| +-------------------+ +-------------------+ +-------------------+  |
| | ✓ CARACTERÍSTICAS | | ✓ COMODIDADES     | | ✓ PERFORMANCE     |  |
| |                   | |                   | |                   |  |
| | • Área (m²)       | | • Piscina         | | • Taxa ocupação   |  |
| | • Quartos/Suítes  | | • Academia        | | • Data aquisição  |  |
| | • Banheiros       | | • Elevador        | | • Datas sistema   |  |
| | • Vagas           | | • Varanda         | |                   |  |
| | • Andar/Ano       | | • Churrasqueira   | |                   |  |
| +-------------------+ +-------------------+ +-------------------+  |
|                                                                   |
| RESUMO DA EXPORTAÇÃO                                              |
| ┌─────────────────────────────────────────────────────────────┐   |
| │ 5 imóveis selecionados | 25 campos | ~15 KB estimado        │   |
| └─────────────────────────────────────────────────────────────┘   |
|                                                                   |
|                              [Baixar CSV] [Cancelar]              |
+------------------------------------------------------------------+
```

### 5. Categorias de Campos Detalhadas

**Dados Básicos (3 campos):**
- Nome do imóvel
- Tipo (Apartamento, Casa, etc.)
- Status (Alugado, Disponível, etc.)

**Endereço (7 campos):**
- Rua, Número, Complemento
- Bairro, Cidade, Estado, CEP

**Financeiro (9 campos):**
- Valor do imóvel
- Receita mensal
- Condomínio, IPTU, Manutenção, Outros custos
- Custos totais (calculado)
- Lucro mensal (calculado)
- ROI anual (calculado)

**Características (8 campos):**
- Área (m²)
- Quartos, Suítes, Banheiros
- Vagas de garagem
- Andar, Ano de construção

**Comodidades (6 campos):**
- Piscina, Academia, Elevador
- Varanda, Churrasqueira, Mobiliado

**Performance (3 campos):**
- Taxa de ocupação
- Data de aquisição
- Datas do sistema

### 6. Atualizar useExportData.ts

Modificar as funções para aceitar configurações de campos:

```typescript
interface ExportConfig {
  includeBasic: boolean;
  includeAddress: boolean;
  includeFinancial: boolean;
  includeCharacteristics: boolean;
  includeAmenities: boolean;
  includePerformance: boolean;
}

const exportToCSV = (properties: Property[], config: ExportConfig) => {
  // Construir headers e rows baseado na config
  const headers: string[] = [];
  
  if (config.includeBasic) {
    headers.push('Nome', 'Tipo', 'Status');
  }
  if (config.includeAddress) {
    headers.push('Endereço Completo', 'Cidade', 'Estado', 'CEP');
  }
  // ... etc
};

const exportToJSON = (properties: Property[], config: ExportConfig) => {
  // Similar, incluir apenas seções selecionadas
};
```

---

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/Reports.tsx` | Refatorar completamente com nova UI de filtros, painéis expansíveis e explicações detalhadas |
| `src/hooks/useExportData.ts` | Adicionar suporte para exportação configurável com seleção de campos |

---

## Componentes Visuais Detalhados

### Card de Categoria Selecionável

```tsx
// Componente para cada categoria de dados
<div 
  className={cn(
    "p-4 rounded-lg border-2 transition-all cursor-pointer",
    isSelected 
      ? "border-primary bg-primary/5" 
      : "border-border hover:border-primary/50"
  )}
  onClick={() => toggleCategory()}
>
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-primary" />
      <span className="font-medium">Dados Básicos</span>
    </div>
    <Checkbox checked={isSelected} />
  </div>
  <ul className="text-sm text-muted-foreground space-y-1">
    <li>• Nome do imóvel</li>
    <li>• Tipo de imóvel</li>
    <li>• Status atual</li>
  </ul>
  <div className="mt-2 text-xs text-muted-foreground">
    3 campos
  </div>
</div>
```

### Filtros de Status e Tipo

```tsx
// Badges clicáveis para filtros
<div className="flex flex-wrap gap-2">
  {statusOptions.map((status) => (
    <Badge
      key={status.value}
      variant={selectedStatus === status.value ? "default" : "outline"}
      className="cursor-pointer transition-colors"
      onClick={() => setSelectedStatus(status.value)}
    >
      <status.icon className="h-3 w-3 mr-1" />
      {status.label}
    </Badge>
  ))}
</div>
```

### Resumo da Exportação

```tsx
// Box com resumo antes de exportar
<div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
  <div className="flex items-center gap-4 text-sm">
    <span className="flex items-center gap-1">
      <Home className="h-4 w-4" />
      {filteredProperties.length} imóveis
    </span>
    <span className="flex items-center gap-1">
      <ClipboardList className="h-4 w-4" />
      {selectedFieldsCount} campos
    </span>
  </div>
  <div className="flex gap-2">
    <Button variant="outline" onClick={closePanel}>
      Cancelar
    </Button>
    <Button onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Baixar {exportType.toUpperCase()}
    </Button>
  </div>
</div>
```

---

## Experiência do Usuário

1. **Usuário abre a página** → Vê os 3 cards de tipo de relatório
2. **Aplica filtros globais** → Seleciona status "Alugado" e tipo "Apartamento"
3. **Clica em "Configurar CSV"** → Painel expansível abre com categorias
4. **Seleciona categorias** → Desabilita "Comodidades" se não precisar
5. **Vê resumo** → "5 imóveis | 25 campos selecionados"
6. **Clica em Baixar** → Arquivo gerado apenas com dados selecionados

---

## Resultado Esperado

1. Interface muito mais bonita e profissional
2. Explicações claras do que cada tipo de relatório inclui
3. Controle total sobre os dados exportados
4. Filtros avançados por status e tipo de imóvel
5. Experiência consistente entre CSV, JSON e PDF
6. Feedback visual sobre a quantidade de dados que será exportada

