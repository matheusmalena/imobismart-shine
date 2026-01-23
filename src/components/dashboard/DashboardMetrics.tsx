import { Building2, TrendingUp, Percent, Activity } from 'lucide-react';
import { MetricCard } from './MetricCard';

interface DashboardMetricsProps {
  totalProperties: number;
  netProfit: number;
  avgROI: number;
  avgOccupancy: number;
}

export function DashboardMetrics({
  totalProperties,
  netProfit,
  avgROI,
  avgOccupancy,
}: DashboardMetricsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title={totalProperties === 1 ? "Imóvel" : "Imóveis"}
        value={totalProperties}
        icon={<Building2 className="h-5 w-5 text-primary" />}
      />
      <MetricCard
        title="Lucro Líquido"
        value={formatCurrency(netProfit)}
        icon={<TrendingUp className="h-5 w-5 text-primary" />}
        subtitle="mensal"
      />
      <MetricCard
        title="ROI Médio"
        value={`${avgROI.toFixed(1)}%`}
        icon={<Percent className="h-5 w-5 text-primary" />}
        subtitle="anual"
      />
      <MetricCard
        title="Ocupação"
        value={`${avgOccupancy.toFixed(0)}%`}
        icon={<Activity className="h-5 w-5 text-primary" />}
        subtitle="média"
      />
    </div>
  );
}
