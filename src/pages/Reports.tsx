import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';
import { useUserData } from '@/hooks/useUserData';
import { useExportData } from '@/hooks/useExportData';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  ClipboardList,
  Crown,
  Lock,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Reports() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { properties, isLoading: propertiesLoading } = useProperties();
  const { isPro, isPlus, isLoading: userLoading } = useUserData();
  const { exportToCSV, exportToJSON } = useExportData();
  
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [reportType, setReportType] = useState<string>('complete');
  const [isGenerating, setIsGenerating] = useState(false);
  const [includeFinancial, setIncludeFinancial] = useState(true);
  const [includeCharacteristics, setIncludeCharacteristics] = useState(true);
  const [includePerformance, setIncludePerformance] = useState(true);
  const [showPDFConfig, setShowPDFConfig] = useState(false);

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
          <Skeleton className="h-20" />
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const activeProperties = properties?.filter(p => !p.is_archived) || [];

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getPropertiesToExport = () => {
    return selectedProperty === 'all' 
      ? activeProperties 
      : activeProperties.filter(p => p.id === selectedProperty);
  };

  const generatePDFReport = async () => {
    setIsGenerating(true);
    
    try {
      const propertiesToExport = getPropertiesToExport();

      if (propertiesToExport.length === 0) {
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
      const totalValue = propertiesToExport.reduce((sum, p) => sum + (p.property_value || 0), 0);
      const totalRevenue = propertiesToExport.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0);
      const totalCosts = propertiesToExport.reduce((sum, p) => 
        sum + (p.condominium_fee || 0) + (p.iptu_fee || 0) + (p.maintenance_fee || 0) + (p.other_costs || 0), 0
      );
      const totalProfit = totalRevenue - totalCosts;
      const avgOccupancy = propertiesToExport.length > 0 
        ? propertiesToExport.reduce((sum, p) => sum + (p.occupancy_rate || 0), 0) / propertiesToExport.length 
        : 0;

      htmlContent += `
        <div class="summary">
          <div class="summary-grid">
            <div class="summary-item">
              <div class="value">${propertiesToExport.length}</div>
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
      for (const property of propertiesToExport) {
        const costs = (property.condominium_fee || 0) + (property.iptu_fee || 0) + (property.maintenance_fee || 0) + (property.other_costs || 0);
        const profit = (property.monthly_revenue || 0) - costs;
        const roi = property.property_value ? ((profit * 12) / property.property_value) * 100 : 0;

        htmlContent += `
          <div class="property">
            <div class="property-header">
              <div class="property-name">${property.name}</div>
              <div class="property-address">${property.address_street || ''} ${property.address_number || ''}, ${property.address_neighborhood || ''} - ${property.address_city || ''}/${property.address_state || ''}</div>
            </div>
        `;

        if (includeFinancial) {
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

        if (includeCharacteristics) {
          htmlContent += `
            <div class="property-section">
              <h4>🏠 Características</h4>
              <div class="property-grid">
                <div class="property-item"><span class="label">Tipo:</span> <span class="value">${property.property_type}</span></div>
                <div class="property-item"><span class="label">Área:</span> <span class="value">${property.area_sqm || 0} m²</span></div>
                <div class="property-item"><span class="label">Quartos:</span> <span class="value">${property.bedrooms || 0}</span></div>
                <div class="property-item"><span class="label">Suítes:</span> <span class="value">${property.suites || 0}</span></div>
                <div class="property-item"><span class="label">Banheiros:</span> <span class="value">${property.bathrooms || 0}</span></div>
                <div class="property-item"><span class="label">Vagas:</span> <span class="value">${property.parking_spots || 0}</span></div>
                <div class="property-item"><span class="label">Andar:</span> <span class="value">${property.floor_number || '-'}</span></div>
                <div class="property-item"><span class="label">Ano:</span> <span class="value">${property.year_built || '-'}</span></div>
              </div>
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
                  ].filter(Boolean).join(', ') || 'Nenhuma'}
                </span>
              </div>
            </div>
          `;
        }

        if (includePerformance) {
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
                <div class="property-item"><span class="label">Status:</span> <span class="value">${property.status || 'Não definido'}</span></div>
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
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCSV = () => {
    const propertiesToExport = getPropertiesToExport();
    exportToCSV(propertiesToExport);
  };

  const handleExportJSON = () => {
    const propertiesToExport = getPropertiesToExport();
    exportToJSON(propertiesToExport);
  };

  // Non-Pro users see upgrade prompt
  if (!isPro) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-12">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Crown className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Relatórios Avançados</CardTitle>
              <CardDescription className="text-base">
                Exporte seus dados e gere relatórios profissionais do seu portfólio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 text-left">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Download className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Exportação CSV/JSON</p>
                    <p className="text-sm text-muted-foreground">Exporte todos os dados do seu portfólio</p>
                  </div>
                  <Badge variant="outline" className="ml-auto">Pro</Badge>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Relatórios PDF</p>
                    <p className="text-sm text-muted-foreground">Gere relatórios profissionais personalizados</p>
                  </div>
                  <Badge variant="outline" className="ml-auto">Plus</Badge>
                </div>
              </div>
              <Button onClick={() => navigate('/settings')} size="lg" className="w-full">
                <Crown className="mr-2 h-4 w-4" />
                Fazer Upgrade para Pro
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Feature content items for each card
  const csvFeatures = [
    'Dados básicos e endereço completo',
    'Financeiro com ROI e lucro calculado',
    'Características físicas do imóvel',
    'Comodidades e status',
    'Resumo do portfólio no cabeçalho',
  ];

  const jsonFeatures = [
    'Estrutura hierárquica organizada',
    'Metadados e resumo do portfólio',
    'Valores formatados e numéricos',
    'Ideal para integrações e APIs',
    'Agrupamento por categorias',
  ];

  const pdfFeatures = [
    'Resumo executivo visual',
    'Seções personalizáveis',
    'Gráficos de performance',
    'Layout pronto para impressão',
    'Ideal para apresentações',
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <Badge variant="secondary" className="gap-1">
            <ClipboardList className="h-3 w-3" />
            {isPlus ? 'Plus' : 'Pro'}
          </Badge>
        </div>

        {/* Global Property Selector */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Filtrar Imóveis</Label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Selecione os imóveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os imóveis ({activeProperties.length})</SelectItem>
                  {activeProperties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground ml-2">
                {selectedProperty === 'all' 
                  ? `${activeProperties.length} imóveis selecionados` 
                  : '1 imóvel selecionado'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 3 Uniform Cards Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* CSV Card */}
          <Card className="flex flex-col hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Download className="h-5 w-5 text-primary" />
                  Exportar CSV
                </CardTitle>
                <Badge variant="outline" className="text-xs">Pro</Badge>
              </div>
              <CardDescription>
                Planilha compatível com Excel e Google Sheets
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-2 text-sm flex-1">
                <p className="font-medium text-muted-foreground">Inclui:</p>
                <ul className="space-y-1.5">
                  {csvFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button onClick={handleExportCSV} className="w-full mt-4" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Baixar CSV
              </Button>
            </CardContent>
          </Card>

          {/* JSON Card */}
          <Card className="flex flex-col hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileJson className="h-5 w-5 text-primary" />
                  Exportar JSON
                </CardTitle>
                <Badge variant="outline" className="text-xs">Pro</Badge>
              </div>
              <CardDescription>
                Formato estruturado para desenvolvedores
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-2 text-sm flex-1">
                <p className="font-medium text-muted-foreground">Inclui:</p>
                <ul className="space-y-1.5">
                  {jsonFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button onClick={handleExportJSON} className="w-full mt-4" variant="outline">
                <FileJson className="mr-2 h-4 w-4" />
                Baixar JSON
              </Button>
            </CardContent>
          </Card>

          {/* PDF Card */}
          <Card className={`flex flex-col transition-shadow ${isPlus ? 'hover:shadow-md' : 'opacity-75'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Relatório PDF
                </CardTitle>
                <Badge variant="secondary" className="text-xs">Plus</Badge>
              </div>
              <CardDescription>
                Relatório visual profissional
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-2 text-sm flex-1">
                <p className="font-medium text-muted-foreground">Inclui:</p>
                <ul className="space-y-1.5">
                  {pdfFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {isPlus ? (
                <Button 
                  onClick={() => setShowPDFConfig(!showPDFConfig)} 
                  className="w-full mt-4" 
                  variant={showPDFConfig ? "default" : "outline"}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Configurar PDF
                  {showPDFConfig ? (
                    <ChevronUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={() => navigate('/settings')} 
                  className="w-full mt-4" 
                  variant="outline"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Upgrade para Plus
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Expandable PDF Configuration Panel */}
        {showPDFConfig && isPlus && (
          <Card className="animate-in fade-in slide-in-from-top-2 duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Configuração do Relatório PDF
              </CardTitle>
              <CardDescription>
                Personalize o conteúdo do seu relatório PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Type */}
              <div className="space-y-2">
                <Label>Tipo de Relatório</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-full md:w-[280px]">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complete">Completo</SelectItem>
                    <SelectItem value="financial">Financeiro</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Content Options */}
              <div className="space-y-3">
                <Label>Incluir no Relatório</Label>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="flex items-center space-x-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <Checkbox 
                      id="financial" 
                      checked={includeFinancial}
                      onCheckedChange={(checked) => setIncludeFinancial(!!checked)}
                    />
                    <Label htmlFor="financial" className="flex items-center gap-2 cursor-pointer flex-1">
                      <DollarSign className="h-4 w-4 text-primary" />
                      Dados Financeiros
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <Checkbox 
                      id="characteristics" 
                      checked={includeCharacteristics}
                      onCheckedChange={(checked) => setIncludeCharacteristics(!!checked)}
                    />
                    <Label htmlFor="characteristics" className="flex items-center gap-2 cursor-pointer flex-1">
                      <ClipboardList className="h-4 w-4 text-primary" />
                      Características
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <Checkbox 
                      id="performance" 
                      checked={includePerformance}
                      onCheckedChange={(checked) => setIncludePerformance(!!checked)}
                    />
                    <Label htmlFor="performance" className="flex items-center gap-2 cursor-pointer flex-1">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Performance
                    </Label>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={generatePDFReport} 
                  disabled={isGenerating}
                  size="lg"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {isGenerating ? 'Gerando...' : 'Gerar Relatório PDF'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
