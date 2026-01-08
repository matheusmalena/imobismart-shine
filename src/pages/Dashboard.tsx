import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';
import { useSubscription } from '@/hooks/useSubscription';
import { useExportData } from '@/hooks/useExportData';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { PropertyRanking } from '@/components/dashboard/PropertyRanking';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Percent, 
  Activity,
  Wallet,
  Plus,
  Crown,
  Download,
  FileText,
  Target,
  AlertTriangle,
  CheckCircle,
  Lock,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { activeProperties, isLoading, metrics } = useProperties();
  const { subscription } = useSubscription();
  const { exportToCSV } = useExportData();

  const plan = subscription?.plan || 'starter';
  const isPro = plan === 'pro' || plan === 'enterprise';
  const isEnterprise = plan === 'enterprise';

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] rounded-xl" />
            <Skeleton className="h-[400px] rounded-xl" />
          </div>
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

  const handleExportData = () => {
    exportToCSV(activeProperties);
  };

  // Calculate advanced metrics for Pro/Plus
  const totalValue = activeProperties.reduce((sum, p) => sum + Number(p.property_value), 0);
  const highPerformers = activeProperties.filter(p => {
    const profit = Number(p.monthly_revenue) - (
      Number(p.condominium_fee) + Number(p.iptu_fee) + Number(p.maintenance_fee) + Number(p.other_costs)
    );
    const value = Number(p.property_value);
    const roi = value > 0 ? ((profit * 12) / value) * 100 : 0;
    return roi > metrics.avgROI;
  });
  const lowOccupancy = activeProperties.filter(p => Number(p.occupancy_rate) < 70);

  const getPlanLabel = () => {
    switch (plan) {
      case 'enterprise': return 'Plus';
      case 'pro': return 'Pro';
      default: return 'Gratuito';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Visão geral dos seus investimentos imobiliários
              </p>
            </div>
            <Badge variant={isPro ? 'default' : 'secondary'} className="gap-1">
              <Crown className="h-3 w-3" />
              {getPlanLabel()}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {isEnterprise && (
              <Button variant="outline" onClick={handleExportData} className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            )}
            <Button onClick={() => navigate('/properties')} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Imóvel
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard
            title={metrics.totalProperties === 1 ? "Imóvel" : "Imóveis"}
            value={metrics.totalProperties}
            icon={<Building2 className="h-5 w-5 text-primary" />}
          />
          <MetricCard
            title="Receita"
            value={formatCurrency(metrics.totalRevenue)}
            icon={<DollarSign className="h-5 w-5 text-primary" />}
          />
          <MetricCard
            title="Custos"
            value={formatCurrency(metrics.totalCosts)}
            icon={<Wallet className="h-5 w-5 text-primary" />}
          />
          <MetricCard
            title="Lucro"
            value={formatCurrency(metrics.netProfit)}
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
          />
          <MetricCard
            title="ROI Anual"
            value={`${metrics.avgROI.toFixed(1)}%`}
            icon={<Percent className="h-5 w-5 text-primary" />}
          />
          <MetricCard
            title="Ocupação"
            value={`${metrics.avgOccupancy.toFixed(0)}%`}
            icon={<Activity className="h-5 w-5 text-primary" />}
          />
        </div>

        {/* Pro/Plus: Advanced Analysis Section */}
        {isPro && activeProperties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Valor do Portfólio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(totalValue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total investido
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
                  Acima da média de ROI
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Baixa Ocupação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">
                  {lowOccupancy.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Abaixo de 70%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-info" />
                  Lucro Anual Projetado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", metrics.netProfit >= 0 ? "text-success" : "text-destructive")}>
                  {formatCurrency(metrics.netProfit * 12)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Baseado nos dados atuais
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart properties={activeProperties} />
          <PropertyRanking properties={activeProperties} />
        </div>

        {/* Pro/Plus: Insights Section */}
        {isPro && activeProperties.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Análise de Mercado e Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Insights */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">Alertas e Recomendações</h4>
                  
                  {metrics.avgROI < 6 && (
                    <div className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-warning">ROI abaixo do esperado</p>
                        <p className="text-xs text-muted-foreground">
                          Considere revisar custos ou buscar oportunidades de aumento de receita.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {lowOccupancy.length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-warning">
                          {lowOccupancy.length} imóvel(is) com baixa ocupação
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lowOccupancy.map(p => p.name).slice(0, 3).join(', ')}
                          {lowOccupancy.length > 3 && ` e mais ${lowOccupancy.length - 3}`}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {metrics.avgROI >= 8 && (
                    <div className="flex items-start gap-3 p-3 bg-success/10 border border-success/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-success">Excelente performance!</p>
                        <p className="text-xs text-muted-foreground">
                          Seu portfólio está acima da média do mercado imobiliário.
                        </p>
                      </div>
                    </div>
                  )}

                  {metrics.avgROI >= 6 && metrics.avgROI < 8 && lowOccupancy.length === 0 && (
                    <div className="flex items-start gap-3 p-3 bg-info/10 border border-info/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-info mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-info">Performance adequada</p>
                        <p className="text-xs text-muted-foreground">
                          Seu portfólio está dentro da média esperada.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reports */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">Relatórios Disponíveis</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm">Resumo Mensal</span>
                      </div>
                      <Badge variant="outline" className="text-success border-success/30">
                        Disponível
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        <span className="text-sm">Análise de Performance</span>
                      </div>
                      <Badge variant="outline" className="text-success border-success/30">
                        Disponível
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-primary" />
                        <span className="text-sm">Exportar Dados</span>
                      </div>
                      {isEnterprise ? (
                        <Button size="sm" variant="outline" onClick={handleExportData} className="h-7 text-xs">
                          Exportar CSV
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <Lock className="h-3 w-3 mr-1" />
                          Plus
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm">Relatório Personalizado</span>
                      </div>
                      {isEnterprise ? (
                        <Badge variant="outline" className="text-success border-success/30">
                          Disponível
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <Lock className="h-3 w-3 mr-1" />
                          Plus
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pro/Plus: Performance Ranking Table */}
        {isPro && activeProperties.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">Imóvel</th>
                      <th className="text-right py-3 px-2 font-medium">Receita</th>
                      <th className="text-right py-3 px-2 font-medium">Custos</th>
                      <th className="text-right py-3 px-2 font-medium">Lucro</th>
                      <th className="text-right py-3 px-2 font-medium">ROI</th>
                      <th className="text-right py-3 px-2 font-medium">Ocupação</th>
                      <th className="text-center py-3 px-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeProperties
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
                      .slice(0, 10)
                      .map((property) => (
                        <tr key={property.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 px-2 font-medium">{property.name}</td>
                          <td className="text-right py-3 px-2">{formatCurrency(property.revenue)}</td>
                          <td className="text-right py-3 px-2 text-destructive">{formatCurrency(property.costs)}</td>
                          <td className={cn("text-right py-3 px-2 font-medium", property.profit >= 0 ? "text-success" : "text-destructive")}>
                            {formatCurrency(property.profit)}
                          </td>
                          <td className={cn("text-right py-3 px-2 font-medium", property.roi >= metrics.avgROI ? "text-success" : "text-warning")}>
                            {property.roi.toFixed(1)}%
                          </td>
                          <td className="text-right py-3 px-2">{property.occupancy_rate}%</td>
                          <td className="text-center py-3 px-2">
                            {property.roi >= metrics.avgROI ? (
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

        {/* Status Chart and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <OccupancyChart properties={activeProperties} />
          <div className="lg:col-span-2 bg-card rounded-xl p-6 shadow-card border border-border/50">
            <h3 className="text-lg font-semibold text-card-foreground mb-6">Ações Rápidas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => navigate('/properties')}
              >
                <Building2 className="h-6 w-6" />
                <span>Gerenciar Imóveis</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => navigate('/documents')}
              >
                <FileText className="h-6 w-6" />
                <span>Ver Documentos</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Upgrade prompt for Starter plan */}
        {!isPro && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Desbloqueie recursos avançados</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Faça upgrade para ter análise de mercado, relatórios automáticos, ranking de performance e muito mais.
                    </p>
                  </div>
                </div>
                <Button onClick={() => navigate('/settings')} className="gap-2 shrink-0">
                  <Crown className="h-4 w-4" />
                  Ver Planos
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}