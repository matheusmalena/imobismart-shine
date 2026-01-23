import { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  Building2,
  DollarSign,
  TrendingUp,
  Percent,
  Loader2,
} from 'lucide-react';
import { Property, PROPERTY_TYPE_LABELS } from '@/types/property';
import { ExportConfig } from '@/hooks/useExportData';
import { cn } from '@/lib/utils';

interface ReportPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'csv' | 'xlsx' | 'json' | 'pdf';
  properties: Property[];
  config: ExportConfig;
  onConfirm: () => void;
  isGenerating?: boolean;
}

interface MetricBoxProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  className?: string;
}

function MetricBox({ icon, label, value, className }: MetricBoxProps) {
  return (
    <Card className={cn("text-center", className)}>
      <CardContent className="p-3">
        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <p className="text-lg font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

const TYPE_CONFIG = {
  csv: {
    icon: FileSpreadsheet,
    title: 'Prévia do Relatório CSV',
    description: 'Visualize como seus dados ficarão no arquivo CSV',
    buttonText: 'Baixar CSV',
    iconColor: 'text-primary',
  },
  xlsx: {
    icon: FileSpreadsheet,
    title: 'Prévia do Relatório Excel',
    description: 'Visualize como seus dados ficarão no arquivo Excel',
    buttonText: 'Baixar Excel',
    iconColor: 'text-green-600',
  },
  json: {
    icon: FileJson,
    title: 'Prévia do Relatório JSON',
    description: 'Visualize a estrutura do arquivo JSON',
    buttonText: 'Baixar JSON',
    iconColor: 'text-primary',
  },
  pdf: {
    icon: FileText,
    title: 'Prévia do Relatório PDF',
    description: 'Visualize o layout do relatório PDF',
    buttonText: 'Gerar PDF',
    iconColor: 'text-primary',
  },
};

export function ReportPreviewDialog({
  open,
  onOpenChange,
  type,
  properties,
  config,
  onConfirm,
  isGenerating = false,
}: ReportPreviewDialogProps) {
  const typeConfig = TYPE_CONFIG[type];
  const Icon = typeConfig.icon;

  // Calculate summary metrics
  const summary = useMemo(() => {
    const totalValue = properties.reduce((sum, p) => sum + (p.property_value || 0), 0);
    const totalRevenue = properties.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0);
    const totalCosts = properties.reduce(
      (sum, p) =>
        sum +
        (p.condominium_fee || 0) +
        (p.iptu_fee || 0) +
        (p.maintenance_fee || 0) +
        (p.other_costs || 0),
      0
    );
    const totalProfit = totalRevenue - totalCosts;
    const avgOccupancy =
      properties.length > 0
        ? properties.reduce((sum, p) => sum + (p.occupancy_rate || 0), 0) / properties.length
        : 0;
    const avgROI =
      totalValue > 0 ? ((totalProfit * 12) / totalValue) * 100 : 0;

    return { totalValue, totalRevenue, totalProfit, avgOccupancy, avgROI };
  }, [properties]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get selected categories
  const selectedCategories = [
    config.includeBasic && 'Básico',
    config.includeAddress && 'Endereço',
    config.includeFinancial && 'Financeiro',
    config.includeCharacteristics && 'Características',
    config.includeAmenities && 'Comodidades',
    config.includePerformance && 'Performance',
  ].filter(Boolean);

  // Preview data (first 3 items)
  const previewData = properties.slice(0, 3);

  const renderSpreadsheetPreview = () => (
    <div className="space-y-4">
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricBox
          icon={<Building2 className="h-3.5 w-3.5" />}
          label="Imóveis"
          value={properties.length}
        />
        <MetricBox
          icon={<DollarSign className="h-3.5 w-3.5" />}
          label="Valor Total"
          value={formatCurrency(summary.totalValue)}
        />
        <MetricBox
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          label="Lucro/mês"
          value={formatCurrency(summary.totalProfit)}
        />
        <MetricBox
          icon={<Percent className="h-3.5 w-3.5" />}
          label="ROI Médio"
          value={`${summary.avgROI.toFixed(1)}%`}
        />
      </div>

      {/* Data Table Preview */}
      <div className="border rounded-lg overflow-hidden">
        <ScrollArea className="max-h-[250px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {config.includeBasic && <TableHead className="font-semibold">Nome</TableHead>}
                {config.includeBasic && <TableHead className="font-semibold">Tipo</TableHead>}
                {config.includeFinancial && <TableHead className="font-semibold text-right">Valor</TableHead>}
                {config.includeFinancial && <TableHead className="font-semibold text-right">Receita</TableHead>}
                {config.includePerformance && <TableHead className="font-semibold text-right">ROI</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.map((property) => {
                const costs =
                  (property.condominium_fee || 0) +
                  (property.iptu_fee || 0) +
                  (property.maintenance_fee || 0) +
                  (property.other_costs || 0);
                const profit = (property.monthly_revenue || 0) - costs;
                const roi =
                  property.property_value
                    ? ((profit * 12) / property.property_value) * 100
                    : 0;

                return (
                  <TableRow key={property.id}>
                    {config.includeBasic && (
                      <TableCell className="font-medium max-w-[150px] truncate">
                        {property.name}
                      </TableCell>
                    )}
                    {config.includeBasic && (
                      <TableCell>
                        {PROPERTY_TYPE_LABELS[property.property_type]}
                      </TableCell>
                    )}
                    {config.includeFinancial && (
                      <TableCell className="text-right">
                        {formatCurrency(property.property_value || 0)}
                      </TableCell>
                    )}
                    {config.includeFinancial && (
                      <TableCell className="text-right">
                        {formatCurrency(property.monthly_revenue || 0)}
                      </TableCell>
                    )}
                    {config.includePerformance && (
                      <TableCell className="text-right">
                        <span className={roi >= summary.avgROI ? 'text-success' : 'text-warning'}>
                          {roi.toFixed(1)}%
                        </span>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
        <div className="p-2 bg-muted/30 border-t text-xs text-center text-muted-foreground">
          Mostrando {previewData.length} de {properties.length} imóveis
        </div>
      </div>

      {/* Selected Categories */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground">Campos incluídos:</span>
        {selectedCategories.map((cat) => (
          <Badge key={cat} variant="secondary" className="text-xs">
            {cat}
          </Badge>
        ))}
      </div>
    </div>
  );

  const renderJSONPreview = () => {
    const jsonPreview = {
      metadata: {
        gerado_em: new Date().toISOString(),
        total_imoveis: properties.length,
        campos_selecionados: selectedCategories,
      },
      resumo: {
        valor_total_portfolio: summary.totalValue,
        receita_mensal_total: summary.totalRevenue,
        lucro_liquido_mensal: summary.totalProfit,
        roi_medio_anual: Number(summary.avgROI.toFixed(2)),
        taxa_ocupacao_media: Number(summary.avgOccupancy.toFixed(1)),
      },
      imoveis: `[...${properties.length} imóveis]`,
    };

    return (
      <div className="space-y-4">
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricBox
            icon={<Building2 className="h-3.5 w-3.5" />}
            label="Imóveis"
            value={properties.length}
          />
          <MetricBox
            icon={<DollarSign className="h-3.5 w-3.5" />}
            label="Valor Total"
            value={formatCurrency(summary.totalValue)}
          />
          <MetricBox
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            label="Lucro/mês"
            value={formatCurrency(summary.totalProfit)}
          />
          <MetricBox
            icon={<Percent className="h-3.5 w-3.5" />}
            label="ROI Médio"
            value={`${summary.avgROI.toFixed(1)}%`}
          />
        </div>

        {/* JSON Preview */}
        <div className="border rounded-lg overflow-hidden bg-muted/30">
          <div className="p-2 bg-muted/50 border-b text-xs font-medium text-muted-foreground">
            Estrutura do arquivo JSON
          </div>
          <ScrollArea className="h-[200px]">
            <pre className="p-4 text-xs font-mono overflow-x-auto">
              {JSON.stringify(jsonPreview, null, 2)}
            </pre>
          </ScrollArea>
        </div>

        {/* Selected Categories */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground">Campos incluídos:</span>
          {selectedCategories.map((cat) => (
            <Badge key={cat} variant="secondary" className="text-xs">
              {cat}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  const renderPDFPreview = () => (
    <div className="space-y-4">
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricBox
          icon={<Building2 className="h-3.5 w-3.5" />}
          label="Imóveis"
          value={properties.length}
        />
        <MetricBox
          icon={<DollarSign className="h-3.5 w-3.5" />}
          label="Valor Total"
          value={formatCurrency(summary.totalValue)}
        />
        <MetricBox
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          label="Lucro/mês"
          value={formatCurrency(summary.totalProfit)}
        />
        <MetricBox
          icon={<Percent className="h-3.5 w-3.5" />}
          label="ROI Médio"
          value={`${summary.avgROI.toFixed(1)}%`}
        />
      </div>

      {/* PDF Layout Preview */}
      <div className="border rounded-lg overflow-hidden bg-white dark:bg-muted/10">
        <div className="p-3 bg-primary/5 border-b text-center">
          <h3 className="font-bold text-primary">📊 Relatório de Imóveis</h3>
          <p className="text-xs text-muted-foreground">
            Gerado em {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
        <ScrollArea className="h-[180px]">
          <div className="p-4 space-y-3">
            {previewData.map((property, index) => (
              <div key={property.id} className="p-3 border rounded-lg bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{property.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {PROPERTY_TYPE_LABELS[property.property_type]}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {config.includeFinancial && (
                    <>
                      <span>Valor: {formatCurrency(property.property_value || 0)}</span>
                      <span>Receita: {formatCurrency(property.monthly_revenue || 0)}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
            {properties.length > 3 && (
              <p className="text-xs text-center text-muted-foreground">
                + {properties.length - 3} imóveis adicionais
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Selected Categories */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground">Seções incluídas:</span>
        {selectedCategories.map((cat) => (
          <Badge key={cat} variant="secondary" className="text-xs">
            {cat}
          </Badge>
        ))}
      </div>
    </div>
  );

  const renderPreview = () => {
    switch (type) {
      case 'csv':
      case 'xlsx':
        return renderSpreadsheetPreview();
      case 'json':
        return renderJSONPreview();
      case 'pdf':
        return renderPDFPreview();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={cn("h-5 w-5", typeConfig.iconColor)} />
            {typeConfig.title}
          </DialogTitle>
          <DialogDescription>{typeConfig.description}</DialogDescription>
        </DialogHeader>

        {renderPreview()}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={isGenerating} className="gap-2">
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isGenerating ? 'Gerando...' : typeConfig.buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
