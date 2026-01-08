import { Property } from '@/types/property';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Download,
  FileText,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface AdvancedDashboardProps {
  properties: Property[];
  plan: 'pro' | 'enterprise';
  onExportData?: () => void;
}

export function AdvancedDashboard({ properties, plan, onExportData }: AdvancedDashboardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Calculate advanced metrics
  const totalRevenue = properties.reduce((sum, p) => sum + Number(p.monthly_revenue), 0);
  const totalCosts = properties.reduce((sum, p) => 
    sum + Number(p.condominium_fee) + Number(p.iptu_fee) + Number(p.maintenance_fee) + Number(p.other_costs), 0
  );
  const totalProfit = totalRevenue - totalCosts;
  const totalValue = properties.reduce((sum, p) => sum + Number(p.property_value), 0);
  const avgROI = totalValue > 0 ? ((totalProfit * 12) / totalValue) * 100 : 0;

  // Performance analysis
  const highPerformers = properties.filter(p => {
    const profit = Number(p.monthly_revenue) - (
      Number(p.condominium_fee) + Number(p.iptu_fee) + Number(p.maintenance_fee) + Number(p.other_costs)
    );
    const value = Number(p.property_value);
    const roi = value > 0 ? ((profit * 12) / value) * 100 : 0;
    return roi > avgROI;
  });

  const lowPerformers = properties.filter(p => {
    const profit = Number(p.monthly_revenue) - (
      Number(p.condominium_fee) + Number(p.iptu_fee) + Number(p.maintenance_fee) + Number(p.other_costs)
    );
    const value = Number(p.property_value);
    const roi = value > 0 ? ((profit * 12) / value) * 100 : 0;
    return roi < avgROI * 0.5;
  });

  // Occupancy analysis
  const avgOccupancy = properties.length > 0 
    ? properties.reduce((sum, p) => sum + Number(p.occupancy_rate), 0) / properties.length 
    : 0;
  const lowOccupancy = properties.filter(p => Number(p.occupancy_rate) < 70);

  // Status distribution
  const statusDistribution = properties.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Type distribution
  const typeDistribution = properties.reduce((acc, p) => {
    acc[p.property_type] = (acc[p.property_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header with Export button for Plus plan */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Dashboard Avançado</h2>
          <p className="text-sm text-muted-foreground">
            Análise detalhada do seu portfólio imobiliário
          </p>
        </div>
        {plan === 'enterprise' && onExportData && (
          <Button onClick={onExportData} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Dados
          </Button>
        )}
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              ROI Médio Anual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: avgROI >= 0 ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))' }}>
              {avgROI.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Meta recomendada: 8-12%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Alta Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {highPerformers.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Imóveis acima da média
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Baixa Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {lowPerformers.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Imóveis abaixo de 50% da média
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-info" />
              Ocupação Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgOccupancy.toFixed(0)}%
            </div>
            <Progress value={avgOccupancy} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Market Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Análise de Mercado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Valor total do portfólio</span>
                <span className="font-semibold">{formatCurrency(totalValue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Receita anual projetada</span>
                <span className="font-semibold text-success">{formatCurrency(totalRevenue * 12)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Custos anuais projetados</span>
                <span className="font-semibold text-destructive">{formatCurrency(totalCosts * 12)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm font-medium">Lucro anual projetado</span>
                <span className={`font-bold ${totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(totalProfit * 12)}
                </span>
              </div>
            </div>

            {/* Market insights */}
            <div className="pt-4 border-t space-y-2">
              <h4 className="font-medium text-sm">Insights</h4>
              {avgROI < 6 && (
                <div className="flex items-start gap-2 text-sm text-warning">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>ROI abaixo do esperado. Considere revisar custos ou aumentar receitas.</span>
                </div>
              )}
              {lowOccupancy.length > 0 && (
                <div className="flex items-start gap-2 text-sm text-warning">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{lowOccupancy.length} imóvel(is) com ocupação abaixo de 70%.</span>
                </div>
              )}
              {avgROI >= 8 && (
                <div className="flex items-start gap-2 text-sm text-success">
                  <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Excelente performance! Seu portfólio está acima da média do mercado.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribuição do Portfólio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* By Status */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Por Status</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(statusDistribution).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* By Type */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Por Tipo</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(typeDistribution).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <span className="text-sm capitalize">{type}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automatic Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatórios Automáticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-medium">Relatório Mensal</h4>
              <p className="text-sm text-muted-foreground">
                Resumo de receitas, custos e lucros do mês
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-success border-success/30">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Disponível
                </Badge>
              </div>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-medium">Análise de Performance</h4>
              <p className="text-sm text-muted-foreground">
                Comparativo de ROI e ocupação por imóvel
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-success border-success/30">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Disponível
                </Badge>
              </div>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-medium">Relatório Personalizado</h4>
              <p className="text-sm text-muted-foreground">
                Crie relatórios customizados com seus dados
              </p>
              <div className="flex items-center gap-2">
                {plan === 'enterprise' ? (
                  <Badge variant="outline" className="text-success border-success/30">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Disponível
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Apenas Plus
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Performance Table */}
      {properties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ranking de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Imóvel</th>
                    <th className="text-right py-3 px-2">Receita</th>
                    <th className="text-right py-3 px-2">Custos</th>
                    <th className="text-right py-3 px-2">Lucro</th>
                    <th className="text-right py-3 px-2">ROI</th>
                    <th className="text-right py-3 px-2">Ocupação</th>
                    <th className="text-center py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {properties
                    .map(p => {
                      const revenue = Number(p.monthly_revenue);
                      const costs = Number(p.condominium_fee) + Number(p.iptu_fee) + 
                                   Number(p.maintenance_fee) + Number(p.other_costs);
                      const profit = revenue - costs;
                      const value = Number(p.property_value);
                      const roi = value > 0 ? ((profit * 12) / value) * 100 : 0;
                      return { ...p, revenue, costs, profit, roi };
                    })
                    .sort((a, b) => b.roi - a.roi)
                    .map((property) => (
                      <tr key={property.id} className="border-b last:border-0">
                        <td className="py-3 px-2 font-medium">{property.name}</td>
                        <td className="text-right py-3 px-2">{formatCurrency(property.revenue)}</td>
                        <td className="text-right py-3 px-2 text-destructive">{formatCurrency(property.costs)}</td>
                        <td className={`text-right py-3 px-2 font-medium ${property.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {formatCurrency(property.profit)}
                        </td>
                        <td className={`text-right py-3 px-2 font-medium ${property.roi >= avgROI ? 'text-success' : 'text-warning'}`}>
                          {property.roi.toFixed(1)}%
                        </td>
                        <td className="text-right py-3 px-2">{property.occupancy_rate}%</td>
                        <td className="text-center py-3 px-2">
                          {property.roi >= avgROI ? (
                            <TrendingUp className="h-4 w-4 text-success inline" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-warning inline" />
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}