import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';
import { useSubscription } from '@/hooks/useSubscription';
import { useExportData } from '@/hooks/useExportData';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Crown, 
  Lock,
  Building2,
  DollarSign,
  BarChart3,
  FileDown,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Reports() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { activeProperties, isLoading } = useProperties();
  const { subscription } = useSubscription();
  const { exportToCSV, exportToJSON } = useExportData();

  const plan = subscription?.plan || 'starter';
  const isEnterprise = plan === 'enterprise';

  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [reportType, setReportType] = useState<string>('complete');
  const [isGenerating, setIsGenerating] = useState(false);
  const [includeFinancial, setIncludeFinancial] = useState(true);
  const [includeCharacteristics, setIncludeCharacteristics] = useState(true);
  const [includeMetrics, setIncludeMetrics] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-4xl">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  // Show upgrade prompt for non-Plus users
  if (!isEnterprise) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-12 animate-fade-in">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto p-4 rounded-full bg-primary/10 w-fit mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Relatórios Personalizados</CardTitle>
              <CardDescription className="text-base mt-2">
                Gere relatórios profissionais em PDF com análises detalhadas do seu portfólio imobiliário.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 text-left">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Relatórios em PDF</p>
                    <p className="text-sm text-muted-foreground">Layout profissional pronto para impressão</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Análises Detalhadas</p>
                    <p className="text-sm text-muted-foreground">Métricas de performance e ROI por imóvel</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Download className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Exportação Avançada</p>
                    <p className="text-sm text-muted-foreground">CSV, JSON e PDF personalizados</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Badge variant="outline" className="gap-1 mb-4 bg-primary/10 border-primary/30 text-primary">
                  <Crown className="h-3 w-3" />
                  Disponível no Plano Plus
                </Badge>
                <Button onClick={() => navigate('/settings')} size="lg" className="w-full gap-2">
                  <Crown className="h-4 w-4" />
                  Fazer Upgrade para Plus
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const generatePDFReport = async () => {
    setIsGenerating(true);
    
    try {
      // Filter properties based on selection
      const propertiesToReport = selectedProperty === 'all' 
        ? activeProperties 
        : activeProperties.filter(p => p.id === selectedProperty);

      if (propertiesToReport.length === 0) {
        toast.error('Nenhum imóvel selecionado para o relatório');
        return;
      }

      // Create HTML content for the report
      const currentDate = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

      let htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Relatório ImobiSmart</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
            .header h1 { color: #2563eb; font-size: 28px; margin-bottom: 8px; }
            .header p { color: #666; font-size: 14px; }
            .summary { background: linear-gradient(135deg, #f0f7ff 0%, #e0efff 100%); padding: 24px; border-radius: 12px; margin-bottom: 32px; }
            .summary h2 { color: #2563eb; margin-bottom: 16px; font-size: 18px; }
            .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
            .summary-item { background: white; padding: 16px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            .summary-item .value { font-size: 24px; font-weight: bold; color: #2563eb; }
            .summary-item .label { font-size: 12px; color: #666; margin-top: 4px; }
            .property { page-break-inside: avoid; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 24px; overflow: hidden; }
            .property-header { background: #f8fafc; padding: 16px 20px; border-bottom: 1px solid #e5e7eb; }
            .property-header h3 { color: #1a1a1a; font-size: 18px; }
            .property-header .type { color: #666; font-size: 13px; margin-top: 4px; }
            .property-content { padding: 20px; }
            .section { margin-bottom: 20px; }
            .section:last-child { margin-bottom: 0; }
            .section h4 { color: #2563eb; font-size: 14px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
            .grid-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e5e7eb; }
            .grid-item:last-child { border-bottom: none; }
            .grid-item .label { color: #666; font-size: 13px; }
            .grid-item .value { font-weight: 600; color: #1a1a1a; font-size: 13px; }
            .grid-item .value.positive { color: #16a34a; }
            .grid-item .value.negative { color: #dc2626; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
            @media print { body { padding: 20px; } .property { break-inside: avoid; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Relatório de Imóveis</h1>
            <p>Gerado em ${currentDate} • ImobiSmart</p>
          </div>
      `;

      // Calculate totals
      const totals = propertiesToReport.reduce((acc, p) => {
        const costs = Number(p.condominium_fee) + Number(p.iptu_fee) + Number(p.maintenance_fee) + Number(p.other_costs);
        const profit = Number(p.monthly_revenue) - costs;
        return {
          value: acc.value + Number(p.property_value),
          revenue: acc.revenue + Number(p.monthly_revenue),
          profit: acc.profit + profit,
        };
      }, { value: 0, revenue: 0, profit: 0 });

      // Summary section
      htmlContent += `
        <div class="summary">
          <h2>Resumo do Portfólio</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="value">${propertiesToReport.length}</div>
              <div class="label">Total de Imóveis</div>
            </div>
            <div class="summary-item">
              <div class="value">${formatCurrency(totals.value)}</div>
              <div class="label">Valor Total</div>
            </div>
            <div class="summary-item">
              <div class="value">${formatCurrency(totals.profit)}</div>
              <div class="label">Lucro Mensal</div>
            </div>
          </div>
        </div>
      `;

      // Property details
      for (const property of propertiesToReport) {
        const costs = Number(property.condominium_fee) + Number(property.iptu_fee) + 
                     Number(property.maintenance_fee) + Number(property.other_costs);
        const profit = Number(property.monthly_revenue) - costs;
        const roi = property.property_value ? ((profit * 12) / Number(property.property_value)) * 100 : 0;

        htmlContent += `
          <div class="property">
            <div class="property-header">
              <h3>${property.name}</h3>
              <div class="type">${property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)} • ${property.status === 'alugado' ? 'Alugado' : property.status === 'vago' ? 'Vago' : property.status === 'em_reforma' ? 'Em Reforma' : 'À Venda'}</div>
            </div>
            <div class="property-content">
        `;

        if (includeFinancial) {
          htmlContent += `
            <div class="section">
              <h4>💰 Informações Financeiras</h4>
              <div class="grid">
                <div class="grid-item">
                  <span class="label">Valor do Imóvel</span>
                  <span class="value">${formatCurrency(Number(property.property_value))}</span>
                </div>
                <div class="grid-item">
                  <span class="label">Receita Mensal</span>
                  <span class="value positive">${formatCurrency(Number(property.monthly_revenue))}</span>
                </div>
                <div class="grid-item">
                  <span class="label">Custos Mensais</span>
                  <span class="value negative">${formatCurrency(costs)}</span>
                </div>
                <div class="grid-item">
                  <span class="label">Lucro Líquido</span>
                  <span class="value ${profit >= 0 ? 'positive' : 'negative'}">${formatCurrency(profit)}</span>
                </div>
              </div>
            </div>
          `;
        }

        if (includeCharacteristics) {
          htmlContent += `
            <div class="section">
              <h4>🏠 Características</h4>
              <div class="grid">
                <div class="grid-item">
                  <span class="label">Área</span>
                  <span class="value">${property.area_sqm || 0} m²</span>
                </div>
                <div class="grid-item">
                  <span class="label">Quartos</span>
                  <span class="value">${property.bedrooms || 0}</span>
                </div>
                <div class="grid-item">
                  <span class="label">Banheiros</span>
                  <span class="value">${property.bathrooms || 0}</span>
                </div>
                <div class="grid-item">
                  <span class="label">Vagas</span>
                  <span class="value">${property.parking_spots || 0}</span>
                </div>
              </div>
            </div>
          `;
        }

        if (includeMetrics) {
          htmlContent += `
            <div class="section">
              <h4>📈 Métricas de Performance</h4>
              <div class="grid">
                <div class="grid-item">
                  <span class="label">Taxa de Ocupação</span>
                  <span class="value">${property.occupancy_rate || 0}%</span>
                </div>
                <div class="grid-item">
                  <span class="label">ROI Anual</span>
                  <span class="value ${roi >= 0 ? 'positive' : 'negative'}">${roi.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          `;
        }

        htmlContent += `
            </div>
          </div>
        `;
      }

      htmlContent += `
          <div class="footer">
            <p>Relatório gerado automaticamente pelo ImobiSmart • ${currentDate}</p>
            <p>Este documento é confidencial e destinado apenas ao proprietário da conta.</p>
          </div>
        </body>
        </html>
      `;

      // Create a Blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Open in new window for printing
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
      
      toast.success('Relatório gerado com sucesso! Use Ctrl+P para salvar como PDF.');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCSV = () => {
    const propertiesToExport = selectedProperty === 'all' 
      ? activeProperties 
      : activeProperties.filter(p => p.id === selectedProperty);
    exportToCSV(propertiesToExport);
  };

  const handleExportJSON = () => {
    const propertiesToExport = selectedProperty === 'all' 
      ? activeProperties 
      : activeProperties.filter(p => p.id === selectedProperty);
    exportToJSON(propertiesToExport);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            <Badge variant="default" className="gap-1">
              <Crown className="h-3 w-3" />
              Plus
            </Badge>
          </div>
        </div>

        {/* Report Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Gerar Relatório Personalizado</CardTitle>
                <CardDescription>Configure e exporte relatórios detalhados do seu portfólio</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Imóvel</Label>
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o imóvel" />
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

              <div className="space-y-2">
                <Label>Tipo de Relatório</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complete">Relatório Completo</SelectItem>
                    <SelectItem value="financial">Apenas Financeiro</SelectItem>
                    <SelectItem value="performance">Apenas Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Incluir no Relatório</Label>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="financial" 
                    checked={includeFinancial}
                    onCheckedChange={(checked) => setIncludeFinancial(checked as boolean)}
                  />
                  <Label htmlFor="financial" className="cursor-pointer">
                    Informações Financeiras
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="characteristics" 
                    checked={includeCharacteristics}
                    onCheckedChange={(checked) => setIncludeCharacteristics(checked as boolean)}
                  />
                  <Label htmlFor="characteristics" className="cursor-pointer">
                    Características
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="metrics" 
                    checked={includeMetrics}
                    onCheckedChange={(checked) => setIncludeMetrics(checked as boolean)}
                  />
                  <Label htmlFor="metrics" className="cursor-pointer">
                    Métricas de Performance
                  </Label>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-3">
              <Button onClick={generatePDFReport} disabled={isGenerating} className="gap-2">
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                Gerar PDF
              </Button>
              <Button variant="outline" onClick={handleExportCSV} className="gap-2">
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
              <Button variant="outline" onClick={handleExportJSON} className="gap-2">
                <Download className="h-4 w-4" />
                Exportar JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Reports */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => {
            setReportType('complete');
            setIncludeFinancial(true);
            setIncludeCharacteristics(true);
            setIncludeMetrics(true);
          }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="font-medium">Relatório Completo</div>
              </div>
              <p className="text-sm text-muted-foreground">
                Inclui todas as informações: financeiro, características e métricas.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => {
            setReportType('financial');
            setIncludeFinancial(true);
            setIncludeCharacteristics(false);
            setIncludeMetrics(false);
          }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
                <div className="font-medium">Relatório Financeiro</div>
              </div>
              <p className="text-sm text-muted-foreground">
                Foco em receitas, custos, lucros e valores dos imóveis.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => {
            setReportType('performance');
            setIncludeFinancial(false);
            setIncludeCharacteristics(false);
            setIncludeMetrics(true);
          }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-info/10">
                  <BarChart3 className="h-5 w-5 text-info" />
                </div>
                <div className="font-medium">Relatório de Performance</div>
              </div>
              <p className="text-sm text-muted-foreground">
                Análise de ocupação, ROI e indicadores de desempenho.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}