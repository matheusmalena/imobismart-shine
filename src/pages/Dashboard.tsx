import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { PropertyRanking } from '@/components/dashboard/PropertyRanking';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Percent, 
  Activity,
  Wallet,
  Plus,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { activeProperties, isLoading, metrics } = useProperties();

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

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Visão geral dos seus investimentos imobiliários
            </p>
          </div>
          <Button onClick={() => navigate('/properties')} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Imóvel
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard
            title="Total de Imóveis"
            value={metrics.totalProperties}
            icon={<Building2 className="h-5 w-5 text-primary" />}
          />
          <MetricCard
            title="Receita Mensal"
            value={formatCurrency(metrics.totalRevenue)}
            icon={<DollarSign className="h-5 w-5 text-primary" />}
          />
          <MetricCard
            title="Custos Mensais"
            value={formatCurrency(metrics.totalCosts)}
            icon={<Wallet className="h-5 w-5 text-primary" />}
          />
          <MetricCard
            title="Lucro Líquido"
            value={formatCurrency(metrics.netProfit)}
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
            trend={metrics.netProfit !== 0 ? {
              value: 12,
              isPositive: metrics.netProfit > 0,
            } : undefined}
          />
          <MetricCard
            title="ROI Médio"
            value={`${metrics.avgROI.toFixed(1)}%`}
            subtitle="ao ano"
            icon={<Percent className="h-5 w-5 text-primary" />}
          />
          <MetricCard
            title="Ocupação Média"
            value={`${metrics.avgOccupancy.toFixed(0)}%`}
            icon={<Activity className="h-5 w-5 text-primary" />}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart properties={activeProperties} />
          <PropertyRanking properties={activeProperties} />
        </div>

        {/* Status Chart */}
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
                <Activity className="h-6 w-6" />
                <span>Ver Documentos</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
