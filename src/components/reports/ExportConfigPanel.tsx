import { 
  Home, 
  MapPin, 
  DollarSign, 
  Ruler, 
  Sparkles, 
  TrendingUp,
  Download,
  X,
  FileJson,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CategoryCard } from './CategoryCard';
import { ExportConfig, countSelectedFields } from '@/hooks/useExportData';

interface ExportConfigPanelProps {
  type: 'csv' | 'json' | 'pdf';
  config: ExportConfig;
  onConfigChange: (key: keyof ExportConfig, value: boolean) => void;
  onExport: () => void;
  onClose: () => void;
  propertiesCount: number;
  isGenerating?: boolean;
}

const CATEGORIES = [
  {
    key: 'includeBasic' as const,
    title: 'Dados Básicos',
    icon: Home,
    fields: ['Nome do imóvel', 'Tipo (Apartamento, Casa...)', 'Status atual'],
    fieldCount: 3,
  },
  {
    key: 'includeAddress' as const,
    title: 'Endereço',
    icon: MapPin,
    fields: ['Rua e número', 'Bairro', 'Cidade/Estado', 'CEP', 'Complemento'],
    fieldCount: 7,
  },
  {
    key: 'includeFinancial' as const,
    title: 'Financeiro',
    icon: DollarSign,
    fields: ['Valor do imóvel', 'Receita mensal', 'Custos (4 tipos)', 'Lucro calculado', 'ROI anual'],
    fieldCount: 9,
  },
  {
    key: 'includeCharacteristics' as const,
    title: 'Características',
    icon: Ruler,
    fields: ['Área (m²)', 'Quartos/Suítes', 'Banheiros', 'Vagas', 'Andar/Ano'],
    fieldCount: 8,
  },
  {
    key: 'includeAmenities' as const,
    title: 'Comodidades',
    icon: Sparkles,
    fields: ['Piscina', 'Academia', 'Elevador', 'Varanda', 'Churrasqueira', 'Mobiliado'],
    fieldCount: 6,
  },
  {
    key: 'includePerformance' as const,
    title: 'Performance',
    icon: TrendingUp,
    fields: ['Taxa de ocupação', 'Data de aquisição', 'Datas do sistema'],
    fieldCount: 3,
  },
];

const TYPE_CONFIG = {
  csv: {
    title: 'Exportar CSV',
    description: 'Selecione as categorias de dados que deseja incluir na planilha',
    icon: Download,
    buttonText: 'Baixar CSV',
    buttonIcon: Download,
  },
  json: {
    title: 'Exportar JSON',
    description: 'Selecione as categorias de dados para estrutura JSON',
    icon: FileJson,
    buttonText: 'Baixar JSON',
    buttonIcon: FileJson,
  },
  pdf: {
    title: 'Relatório PDF',
    description: 'Personalize o conteúdo do seu relatório visual',
    icon: FileText,
    buttonText: 'Gerar PDF',
    buttonIcon: FileText,
  },
};

export function ExportConfigPanel({
  type,
  config,
  onConfigChange,
  onExport,
  onClose,
  propertiesCount,
  isGenerating = false,
}: ExportConfigPanelProps) {
  const selectedFieldsCount = countSelectedFields(config);
  const typeConfig = TYPE_CONFIG[type];
  const TypeIcon = typeConfig.icon;
  const ButtonIcon = typeConfig.buttonIcon;

  const hasAnySelected = Object.values(config).some(v => v);

  return (
    <Card className="animate-in fade-in slide-in-from-top-2 duration-300 border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <TypeIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{typeConfig.title}</CardTitle>
              <CardDescription className="mt-0.5">
                {typeConfig.description}
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section Title */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            O que será incluído no relatório
          </h4>
          <p className="text-xs text-muted-foreground">
            Clique nas categorias para selecionar ou remover do relatório final
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.key}
              title={category.title}
              icon={category.icon}
              fields={category.fields}
              fieldCount={category.fieldCount}
              isSelected={config[category.key]}
              onToggle={() => onConfigChange(category.key, !config[category.key])}
            />
          ))}
        </div>

        {/* Export Summary */}
        <div className="bg-muted/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1">
              <Home className="h-3.5 w-3.5" />
              {propertiesCount} {propertiesCount === 1 ? 'imóvel' : 'imóveis'}
            </Badge>
            <Badge variant="outline" className="gap-1.5 px-3 py-1">
              <Ruler className="h-3.5 w-3.5" />
              {selectedFieldsCount} campos
            </Badge>
            {!hasAnySelected && (
              <span className="text-xs text-destructive">
                Selecione ao menos uma categoria
              </span>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button 
              onClick={onExport} 
              disabled={!hasAnySelected || isGenerating}
              className="flex-1 sm:flex-none gap-2"
            >
              <ButtonIcon className="h-4 w-4" />
              {isGenerating ? 'Gerando...' : typeConfig.buttonText}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
