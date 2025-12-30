import { Property, PROPERTY_TYPE_LABELS, PROPERTY_PERFORMANCE_LABELS } from '@/types/property';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyRankingProps {
  properties: Property[];
}

export function PropertyRanking({ properties }: PropertyRankingProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Sort by profit (revenue - costs)
  const rankedProperties = [...properties]
    .map(p => ({
      ...p,
      profit: Number(p.monthly_revenue) - (
        Number(p.condominium_fee) + 
        Number(p.iptu_fee) + 
        Number(p.maintenance_fee) + 
        Number(p.other_costs)
      ),
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  const getPerformanceIcon = (performance: string | null) => {
    switch (performance) {
      case 'alta':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'baixa':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-warning" />;
    }
  };

  const getPerformanceBadgeClass = (performance: string | null) => {
    switch (performance) {
      case 'alta':
        return 'bg-success/10 text-success border-success/20';
      case 'baixa':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-warning/10 text-warning border-warning/20';
    }
  };

  if (rankedProperties.length === 0) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
        <h3 className="text-lg font-semibold text-card-foreground mb-6">Ranking de Performance</h3>
        <div className="text-center py-8 text-muted-foreground">
          Adicione imóveis para ver o ranking
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
      <h3 className="text-lg font-semibold text-card-foreground mb-6">Ranking de Performance</h3>
      <div className="space-y-4">
        {rankedProperties.map((property, index) => (
          <div
            key={property.id}
            className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
              index === 0 && "bg-warning text-warning-foreground",
              index === 1 && "bg-muted text-muted-foreground",
              index === 2 && "bg-warning/50 text-warning-foreground",
              index > 2 && "bg-secondary text-secondary-foreground"
            )}>
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-card-foreground truncate">{property.name}</p>
              <p className="text-xs text-muted-foreground">
                {PROPERTY_TYPE_LABELS[property.property_type]}
              </p>
            </div>
            <Badge 
              variant="outline" 
              className={cn("gap-1", getPerformanceBadgeClass(property.performance))}
            >
              {getPerformanceIcon(property.performance)}
              {property.performance ? PROPERTY_PERFORMANCE_LABELS[property.performance] : 'N/A'}
            </Badge>
            <div className="text-right">
              <p className={cn(
                "font-semibold",
                property.profit >= 0 ? "text-success" : "text-destructive"
              )}>
                {formatCurrency(property.profit)}
              </p>
              <p className="text-xs text-muted-foreground">lucro/mês</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
