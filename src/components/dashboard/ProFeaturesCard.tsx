import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Lock,
  Crown,
  BarChart3,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Property } from '@/types/property';

interface ProFeaturesCardProps {
  properties: Property[];
  avgROI: number;
  isPro: boolean;
  onExport?: () => void;
}

export function ProFeaturesCard({ 
  properties, 
  avgROI, 
  isPro, 
  onExport 
}: ProFeaturesCardProps) {
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Calculate metrics
  const totalValue = properties.reduce((sum, p) => sum + Number(p.property_value), 0);
  
  const highPerformers = properties.filter((p) => {
    const profit = Number(p.monthly_revenue) - (
      Number(p.condominium_fee) +
      Number(p.iptu_fee) +
      Number(p.maintenance_fee) +
      Number(p.other_costs)
    );
    const value = Number(p.property_value);
    const roi = value > 0 ? ((profit * 12) / value) * 100 : 0;
    return roi > avgROI;
  });

  const lowOccupancy = properties.filter((p) => Number(p.occupancy_rate) < 70);

  // Calculate ranking data
  const rankedProperties = properties
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
    .slice(0, 5);

  if (properties.length === 0) {
    return null;
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-5 w-5 text-primary" />
          Análise Avançada
          {!isPro && (
            <Badge variant="outline" className="gap-1 text-xs ml-auto">
              <Lock className="h-3 w-3" />
              Plano Pro
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {/* Blur overlay for non-Pro */}
        {!isPro && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="absolute inset-0 backdrop-blur-lg bg-background/60" />
            <div className="relative z-20 text-center p-6 max-w-md">
              <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-3">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">Recursos Pro</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Valor do portfólio, ranking de performance, alertas e exportação de dados.
              </p>
              <Button size="sm" onClick={() => navigate('/plans')} className="gap-1.5">
                <Crown className="h-3.5 w-3.5" />
                Upgrade para Pro
              </Button>
            </div>
          </div>
        )}

        <div className={cn("space-y-5", !isPro && "opacity-20 pointer-events-none select-none")}>
          {/* Key Metrics Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-center">
              <Target className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-primary">
                {formatCurrency(totalValue)}
              </p>
              <p className="text-xs text-muted-foreground">Valor Total</p>
            </div>
            <div className="p-3 rounded-lg bg-success/5 border border-success/10 text-center">
              <CheckCircle className="h-4 w-4 text-success mx-auto mb-1" />
              <p className="text-lg font-bold text-success">
                {highPerformers.length}
              </p>
              <p className="text-xs text-muted-foreground">Alta Performance</p>
            </div>
            <div className="p-3 rounded-lg bg-warning/5 border border-warning/10 text-center">
              <AlertTriangle className="h-4 w-4 text-warning mx-auto mb-1" />
              <p className="text-lg font-bold text-warning">
                {lowOccupancy.length}
              </p>
              <p className="text-xs text-muted-foreground">Baixa Ocupação</p>
            </div>
          </div>

          {/* Ranking Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-muted-foreground">Top 5 Performance</h4>
              {isPro && onExport && (
                <Button size="sm" variant="ghost" onClick={onExport} className="h-7 gap-1 text-xs">
                  <Download className="h-3 w-3" />
                  CSV
                </Button>
              )}
            </div>
            <div className="space-y-1.5">
              {rankedProperties.map((property, index) => (
                <div 
                  key={property.id} 
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-5">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium truncate max-w-[150px]">
                      {property.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-sm font-semibold",
                      property.profit >= 0 ? "text-success" : "text-destructive"
                    )}>
                      {formatCurrency(property.profit)}
                    </span>
                    <div className="flex items-center gap-1 min-w-[50px] justify-end">
                      <span className={cn(
                        "text-xs font-medium",
                        property.roi >= avgROI ? "text-success" : "text-warning"
                      )}>
                        {property.roi.toFixed(1)}%
                      </span>
                      {property.roi >= avgROI ? (
                        <TrendingUp className="h-3 w-3 text-success" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-warning" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
