import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';
import { useUserData } from '@/hooks/useUserData';
import { useExportData, ExportConfig } from '@/hooks/useExportData';
import { PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from '@/types/property';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ExportConfigPanel } from '@/components/reports/ExportConfigPanel';
import { ReportPreviewDialog } from '@/components/reports/ReportPreviewDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Download,
  FileJson,
  FileText,
  FileSpreadsheet,
  ClipboardList,
  Crown,
  Lock,
  CheckCircle2,
  Filter,
  Home,
  Settings2,
  Building2,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

// Status filter options
const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'alugado', label: 'Alugado' },
  { value: 'vago', label: 'Vago' },
  { value: 'em_reforma', label: 'Em Reforma' },
  { value: 'a_venda', label: 'À Venda' },
];

// Type filter options
const TYPE_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'casa', label: 'Casa' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'galpao', label: 'Galpão' },
  { value: 'sala', label: 'Sala' },
  { value: 'loja', label: 'Loja' },
  { value: 'outro', label: 'Outro' },
];

const defaultConfig: ExportConfig = {
  includeBasic: true,
  includeAddress: true,
  includeFinancial: true,
  includeCharacteristics: true,
  includeAmenities: true,
  includePerformance: true,
};

export default function Reports() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { properties, isLoading: propertiesLoading } = useProperties();
  const { isPro, isPlus, isLoading: userLoading } = useUserData();
  const { exportToCSV, exportToJSON, exportToXLSX } = useExportData();

  // Global filter states
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Panel control
  const [activePanel, setActivePanel] = useState<'csv' | 'xlsx' | 'json' | 'pdf' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Preview dialog state
  const [previewType, setPreviewType] = useState<'csv' | 'xlsx' | 'json' | 'pdf' | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Export configs (separate for each type)
  const [csvConfig, setCsvConfig] = useState<ExportConfig>(defaultConfig);
  const [xlsxConfig, setXlsxConfig] = useState<ExportConfig>(defaultConfig);
  const [jsonConfig, setJsonConfig] = useState<ExportConfig>(defaultConfig);
  const [pdfConfig, setPdfConfig] = useState<ExportConfig>(defaultConfig);

  const activeProperties = properties?.filter(p => !p.is_archived) || [];

  // Apply filters - must be before conditional returns
  const filteredProperties = useMemo(() => {
    return activeProperties.filter(p => {
      // Property selector filter
      if (selectedProperty !== 'all' && p.id !== selectedProperty) return false;
      // Status filter
      if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;
      // Type filter
      if (selectedType !== 'all' && p.property_type !== selectedType) return false;
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesAddress = [p.address_street, p.address_city, p.address_neighborhood]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query);
        if (!matchesName && !matchesAddress) return false;
      }
      return true;
    });
  }, [activeProperties, selectedProperty, selectedStatus, selectedType, searchQuery]);

  // Redirect if not authenticated
  if (!authLoading && !user) {
    navigate('/auth');
    return null;
  }

  // Loading state
  if (authLoading || propertiesLoading || userLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-32" />
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const generatePDFReport = async () => {
    setIsGenerating(true);

    try {
      if (filteredProperties.length === 0) {
        toast.error('Nenhum imóvel encontrado para gerar o relatório');
        return;
      }

      // Build HTML content
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Relatório de Imóveis - ImobiSmart</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
            .header h1 { color: #10b981; margin: 0; }
            .header p { color: #666; margin-top: 10px; }
            .summary { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
            .summary-item { text-align: center; }
            .summary-item .value { font-size: 24px; font-weight: bold; color: #10b981; }
            .summary-item .label { font-size: 12px; color: #666; }
            .property { page-break-inside: avoid; margin-bottom: 30px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; }
            .property-header { border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px; }
            .property-name { font-size: 18px; font-weight: bold; color: #1e293b; }
            .property-address { font-size: 14px; color: #64748b; }
            .property-section { margin-top: 15px; }
            .property-section h4 { font-size: 14px; color: #10b981; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
            .property-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
            .property-item { font-size: 13px; }
            .property-item .label { color: #64748b; }
            .property-item .value { color: #1e293b; font-weight: 500; }
            .progress-bar { background: #e2e8f0; border-radius: 4px; height: 8px; margin-top: 4px; }
            .progress-fill { background: #10b981; border-radius: 4px; height: 100%; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #666; font-size: 12px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Relatório de Imóveis</h1>
            <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          </div>
      `;

      // Summary section
      const totalValue = filteredProperties.reduce((sum, p) => sum + (p.property_value || 0), 0);
      const totalRevenue = filteredProperties.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0);
      const totalCosts = filteredProperties.reduce(
        (sum, p) =>
          sum + (p.condominium_fee || 0) + (p.iptu_fee || 0) + (p.maintenance_fee || 0) + (p.other_costs || 0),
        0
      );
      const totalProfit = totalRevenue - totalCosts;
      const avgOccupancy =
        filteredProperties.length > 0
          ? filteredProperties.reduce((sum, p) => sum + (p.occupancy_rate || 0), 0) / filteredProperties.length
          : 0;

      htmlContent += `
        <div class="summary">
          <div class="summary-grid">
            <div class="summary-item">
              <div class="value">${filteredProperties.length}</div>
              <div class="label">Total de Imóveis</div>
            </div>
            <div class="summary-item">
              <div class="value">${formatCurrency(totalValue)}</div>
              <div class="label">Valor do Portfólio</div>
            </div>
            <div class="summary-item">
              <div class="value">${formatCurrency(totalProfit)}/mês</div>
              <div class="label">Lucro Líquido</div>
            </div>
            <div class="summary-item">
              <div class="value">${avgOccupancy.toFixed(0)}%</div>
              <div class="label">Ocupação Média</div>
            </div>
          </div>
        </div>
      `;

      // Properties
      for (const property of filteredProperties) {
        const costs =
          (property.condominium_fee || 0) +
          (property.iptu_fee || 0) +
          (property.maintenance_fee || 0) +
          (property.other_costs || 0);
        const profit = (property.monthly_revenue || 0) - costs;
        const roi = property.property_value ? ((profit * 12) / property.property_value) * 100 : 0;

        htmlContent += `
          <div class="property">
            <div class="property-header">
              <div class="property-name">${property.name}</div>
              <div class="property-address">${property.address_street || ''} ${property.address_number || ''}, ${property.address_neighborhood || ''} - ${property.address_city || ''}/${property.address_state || ''}</div>
            </div>
        `;

        if (pdfConfig.includeFinancial) {
          htmlContent += `
            <div class="property-section">
              <h4>💰 Dados Financeiros</h4>
              <div class="property-grid">
                <div class="property-item"><span class="label">Valor do Imóvel:</span> <span class="value">${formatCurrency(property.property_value || 0)}</span></div>
                <div class="property-item"><span class="label">Receita Mensal:</span> <span class="value">${formatCurrency(property.monthly_revenue || 0)}</span></div>
                <div class="property-item"><span class="label">Condomínio:</span> <span class="value">${formatCurrency(property.condominium_fee || 0)}</span></div>
                <div class="property-item"><span class="label">IPTU:</span> <span class="value">${formatCurrency(property.iptu_fee || 0)}</span></div>
                <div class="property-item"><span class="label">Manutenção:</span> <span class="value">${formatCurrency(property.maintenance_fee || 0)}</span></div>
                <div class="property-item"><span class="label">Outros Custos:</span> <span class="value">${formatCurrency(property.other_costs || 0)}</span></div>
                <div class="property-item"><span class="label">Custos Totais:</span> <span class="value">${formatCurrency(costs)}</span></div>
                <div class="property-item"><span class="label">Lucro Líquido:</span> <span class="value" style="color: ${profit >= 0 ? '#10b981' : '#ef4444'}">${formatCurrency(profit)}</span></div>
                <div class="property-item"><span class="label">ROI Anual:</span> <span class="value">${roi.toFixed(2)}%</span></div>
              </div>
            </div>
          `;
        }

        if (pdfConfig.includeCharacteristics || pdfConfig.includeAmenities) {
          htmlContent += `
            <div class="property-section">
              <h4>🏠 Características</h4>
              <div class="property-grid">
                <div class="property-item"><span class="label">Tipo:</span> <span class="value">${PROPERTY_TYPE_LABELS[property.property_type]}</span></div>
                <div class="property-item"><span class="label">Área:</span> <span class="value">${property.area_sqm || 0} m²</span></div>
                <div class="property-item"><span class="label">Quartos:</span> <span class="value">${property.bedrooms || 0}</span></div>
                <div class="property-item"><span class="label">Suítes:</span> <span class="value">${property.suites || 0}</span></div>
                <div class="property-item"><span class="label">Banheiros:</span> <span class="value">${property.bathrooms || 0}</span></div>
                <div class="property-item"><span class="label">Vagas:</span> <span class="value">${property.parking_spots || 0}</span></div>
                <div class="property-item"><span class="label">Andar:</span> <span class="value">${property.floor_number || '-'}</span></div>
                <div class="property-item"><span class="label">Ano:</span> <span class="value">${property.year_built || '-'}</span></div>
              </div>
              ${pdfConfig.includeAmenities ? `
              <div style="margin-top: 10px; font-size: 13px;">
                <span class="label">Comodidades:</span>
                <span class="value">
                  ${[
                    property.has_pool && 'Piscina',
                    property.has_gym && 'Academia',
                    property.has_elevator && 'Elevador',
                    property.has_balcony && 'Varanda',
                    property.has_barbecue && 'Churrasqueira',
                    property.is_furnished && 'Mobiliado',
                  ]
                    .filter(Boolean)
                    .join(', ') || 'Nenhuma'}
                </span>
              </div>
              ` : ''}
            </div>
          `;
        }

        if (pdfConfig.includePerformance) {
          const occupancy = property.occupancy_rate || 0;
          htmlContent += `
            <div class="property-section">
              <h4>📈 Performance</h4>
              <div class="property-grid">
                <div class="property-item">
                  <span class="label">Taxa de Ocupação:</span>
                  <span class="value">${occupancy}%</span>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${occupancy}%"></div>
                  </div>
                </div>
                <div class="property-item"><span class="label">Status:</span> <span class="value">${PROPERTY_STATUS_LABELS[property.status]}</span></div>
              </div>
            </div>
          `;
        }

        htmlContent += '</div>';
      }

      htmlContent += `
          <div class="footer">
            <p>Relatório gerado automaticamente pelo ImobiSmart</p>
            <p>www.imobismart.com.br</p>
          </div>
        </body>
        </html>
      `;

      // Create blob and open print dialog
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');

      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }

      toast.success('Relatório gerado! Use Ctrl+P para salvar como PDF.');
      setActivePanel(null);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setIsGenerating(false);
    }
  };

  // Preview handlers - show preview first
  const handleShowPreview = (type: 'csv' | 'xlsx' | 'json' | 'pdf') => {
    setPreviewType(type);
    setShowPreview(true);
  };

  const handleConfirmExport = () => {
    if (!previewType) return;
    
    switch (previewType) {
      case 'csv':
        exportToCSV(filteredProperties, csvConfig);
        break;
      case 'xlsx':
        exportToXLSX(filteredProperties, xlsxConfig);
        break;
      case 'json':
        exportToJSON(filteredProperties, jsonConfig);
        break;
      case 'pdf':
        generatePDFReport();
        break;
    }
    
    setShowPreview(false);
    setPreviewType(null);
    setActivePanel(null);
  };

  const getActiveConfig = (): ExportConfig => {
    switch (previewType) {
      case 'csv': return csvConfig;
      case 'xlsx': return xlsxConfig;
      case 'json': return jsonConfig;
      case 'pdf': return pdfConfig;
      default: return defaultConfig;
    }
  };

  const updateCsvConfig = (key: keyof ExportConfig, value: boolean) => {
    setCsvConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateXlsxConfig = (key: keyof ExportConfig, value: boolean) => {
    setXlsxConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateJsonConfig = (key: keyof ExportConfig, value: boolean) => {
    setJsonConfig(prev => ({ ...prev, [key]: value }));
  };

  const updatePdfConfig = (key: keyof ExportConfig, value: boolean) => {
    setPdfConfig(prev => ({ ...prev, [key]: value }));
  };

  // Non-Pro users see upgrade prompt
  if (!isPro) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground mt-1">Exporte dados e gere relatórios do seu portfólio</p>
          </div>
          <LockedPagePlaceholder
            icon={<Crown className="h-8 w-8 text-muted-foreground" />}
            title="Relatórios Avançados"
            description="Exporte seus dados e gere relatórios profissionais do seu portfólio"
            requiredPlan="pro"
            buttonLabel="Fazer Upgrade para Pro"
            features={[
              {
                icon: <Download className="h-5 w-5" />,
                label: 'Exportação CSV/JSON',
                description: 'Exporte todos os dados do seu portfólio',
                plan: 'pro',
              },
              {
                icon: <FileText className="h-5 w-5" />,
                label: 'Relatórios PDF',
                description: 'Gere relatórios profissionais personalizados',
                plan: 'plus',
              },
            ]}
          />
        </div>
      </DashboardLayout>
    );
  }

  // Feature content items for each card
  const csvFeatures = [
    'Planilha compatível com Excel',
    'Resumo do portfólio no cabeçalho',
    'Campos configuráveis',
    'Valores formatados em BRL',
    'ROI e lucro calculados',
  ];

  const xlsxFeatures = [
    'Arquivo .xlsx nativo do Excel',
    '2 abas: Resumo + Detalhes',
    'Colunas com largura automática',
    'Abre direto no Excel/Sheets',
    'Formatação profissional',
  ];

  const jsonFeatures = [
    'Estrutura hierárquica organizada',
    'Metadados e resumo incluídos',
    'Ideal para integrações e APIs',
    'Campos configuráveis',
    'Valores numéricos e formatados',
  ];

  const pdfFeatures = [
    'Resumo executivo visual',
    'Seções personalizáveis',
    'Gráficos de ocupação',
    'Layout para impressão',
    'Ideal para apresentações',
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            <Badge variant="secondary" className="gap-1">
              <ClipboardList className="h-3 w-3" />
              {isPlus ? 'Plus' : 'Pro'}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">Exporte dados e gere relatórios do seu portfólio</p>
        </div>

        {/* Global Filters Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              Filtros de Imóveis
            </CardTitle>
            <CardDescription>
              Filtre os imóveis que serão incluídos nos relatórios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou endereço..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Property Selector */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  Imóvel Específico
                </Label>
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os imóveis</SelectItem>
                    {activeProperties.map(property => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Settings2 className="h-3 w-3" />
                  Status
                </Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Tipo de Imóvel
                </Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Results Counter */}
              <div className="flex items-end">
                <div className="w-full p-3 rounded-lg bg-muted/50 text-center">
                  <span className="text-2xl font-bold text-primary">{filteredProperties.length}</span>
                  <span className="text-xs text-muted-foreground block">
                    {filteredProperties.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4 Column Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* CSV Card */}
          <Card className={`flex flex-col transition-all ${activePanel === 'csv' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Download className="h-5 w-5 text-primary" />
                  </div>
                  CSV
                </CardTitle>
                <Badge variant="outline" className="text-xs gap-1">
                  <Lock className="h-3 w-3" />
                  Plano Pro
                </Badge>
              </div>
              <CardDescription>Texto separado por vírgulas</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-2 text-sm flex-1">
                <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Inclui:</p>
                <ul className="space-y-1.5">
                  {csvFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-muted-foreground text-sm">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                onClick={() => setActivePanel(activePanel === 'csv' ? null : 'csv')}
                className="w-full mt-4"
                variant={activePanel === 'csv' ? 'default' : 'outline'}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                {activePanel === 'csv' ? 'Fechar' : 'Configurar'}
              </Button>
            </CardContent>
          </Card>

          {/* Excel Card */}
          <Card className={`flex flex-col transition-all ${activePanel === 'xlsx' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  </div>
                  Excel
                </CardTitle>
                <Badge variant="outline" className="text-xs gap-1">
                  <Lock className="h-3 w-3" />
                  Plano Pro
                </Badge>
              </div>
              <CardDescription>Planilha .xlsx nativa</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-2 text-sm flex-1">
                <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Inclui:</p>
                <ul className="space-y-1.5">
                  {xlsxFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-muted-foreground text-sm">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                onClick={() => setActivePanel(activePanel === 'xlsx' ? null : 'xlsx')}
                className="w-full mt-4"
                variant={activePanel === 'xlsx' ? 'default' : 'outline'}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                {activePanel === 'xlsx' ? 'Fechar' : 'Configurar'}
              </Button>
            </CardContent>
          </Card>

          {/* JSON Card */}
          <Card className={`flex flex-col transition-all ${activePanel === 'json' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileJson className="h-5 w-5 text-primary" />
                  </div>
                  JSON
                </CardTitle>
                <Badge variant="outline" className="text-xs gap-1">
                  <Lock className="h-3 w-3" />
                  Plano Pro
                </Badge>
              </div>
              <CardDescription>Estruturado para devs</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-2 text-sm flex-1">
                <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Inclui:</p>
                <ul className="space-y-1.5">
                  {jsonFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-muted-foreground text-sm">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                onClick={() => setActivePanel(activePanel === 'json' ? null : 'json')}
                className="w-full mt-4"
                variant={activePanel === 'json' ? 'default' : 'outline'}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                {activePanel === 'json' ? 'Fechar' : 'Configurar'}
              </Button>
            </CardContent>
          </Card>

          {/* PDF Card */}
          <Card className={`flex flex-col transition-all ${activePanel === 'pdf' ? 'ring-2 ring-primary' : ''} ${isPlus ? 'hover:shadow-md' : 'opacity-75'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  PDF
                </CardTitle>
                <Badge variant="outline" className="text-xs gap-1 bg-purple-500/10 text-purple-600 border-purple-200">
                  <Lock className="h-3 w-3" />
                  Plano Plus
                </Badge>
              </div>
              <CardDescription>Relatório visual profissional</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-2 text-sm flex-1">
                <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Inclui:</p>
                <ul className="space-y-1.5">
                  {pdfFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-muted-foreground text-sm">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {isPlus ? (
                <Button
                  onClick={() => setActivePanel(activePanel === 'pdf' ? null : 'pdf')}
                  className="w-full mt-4"
                  variant={activePanel === 'pdf' ? 'default' : 'outline'}
                >
                  <Settings2 className="mr-2 h-4 w-4" />
                  {activePanel === 'pdf' ? 'Fechar' : 'Configurar'}
                </Button>
              ) : (
                <Button onClick={() => navigate('/plans')} className="w-full mt-4" variant="outline">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade para Plus
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Expandable Configuration Panels */}
        {activePanel === 'csv' && (
          <ExportConfigPanel
            type="csv"
            config={csvConfig}
            onConfigChange={updateCsvConfig}
            onExport={() => handleShowPreview('csv')}
            onClose={() => setActivePanel(null)}
            propertiesCount={filteredProperties.length}
          />
        )}

        {activePanel === 'xlsx' && (
          <ExportConfigPanel
            type="xlsx"
            config={xlsxConfig}
            onConfigChange={updateXlsxConfig}
            onExport={() => handleShowPreview('xlsx')}
            onClose={() => setActivePanel(null)}
            propertiesCount={filteredProperties.length}
          />
        )}

        {activePanel === 'json' && (
          <ExportConfigPanel
            type="json"
            config={jsonConfig}
            onConfigChange={updateJsonConfig}
            onExport={() => handleShowPreview('json')}
            onClose={() => setActivePanel(null)}
            propertiesCount={filteredProperties.length}
          />
        )}

        {activePanel === 'pdf' && isPlus && (
          <ExportConfigPanel
            type="pdf"
            config={pdfConfig}
            onConfigChange={updatePdfConfig}
            onExport={() => handleShowPreview('pdf')}
            onClose={() => setActivePanel(null)}
            propertiesCount={filteredProperties.length}
            isGenerating={isGenerating}
          />
        )}

        {/* Preview Dialog */}
        {previewType && (
          <ReportPreviewDialog
            open={showPreview}
            onOpenChange={(open) => {
              setShowPreview(open);
              if (!open) setPreviewType(null);
            }}
            type={previewType}
            properties={filteredProperties}
            config={getActiveConfig()}
            onConfirm={handleConfirmExport}
            isGenerating={isGenerating}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
