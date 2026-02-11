import { Property } from '@/types/property';
import { Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RevenueChartProps {
  properties: Property[];
}

export function RevenueChart({ properties }: RevenueChartProps) {
  // Calculate current totals based on actual property data
  const totalRevenue = properties.reduce((sum, p) => sum + Number(p.monthly_revenue), 0);
  const totalCosts = properties.reduce((sum, p) => 
    sum + Number(p.condominium_fee) + Number(p.iptu_fee) + Number(p.maintenance_fee) + Number(p.other_costs), 0
  );
  const totalProfit = totalRevenue - totalCosts;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (properties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Adicione imóveis para ver o resumo financeiro
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Resumo Financeiro Mensal</CardTitle>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Info className="h-3 w-3" />
          <span>Baseado nos dados atuais</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-chart-1/10 border border-chart-1/20">
              <p className="text-xs text-muted-foreground mb-1">Receita Total</p>
              <p className="text-lg font-bold" style={{ color: 'hsl(var(--chart-1))' }}>
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-muted-foreground mb-1">Custos Totais</p>
              <p className="text-lg font-bold text-destructive">
                {formatCurrency(totalCosts)}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${totalProfit >= 0 ? 'bg-chart-2/10 border-chart-2/20' : 'bg-destructive/10 border-destructive/20'} border`}>
              <p className="text-xs text-muted-foreground mb-1">Lucro Líquido</p>
              <p className={`text-lg font-bold ${totalProfit >= 0 ? '' : 'text-destructive'}`} style={totalProfit >= 0 ? { color: 'hsl(var(--chart-2))' } : {}}>
                {formatCurrency(totalProfit)}
              </p>
            </div>
          </div>

          {/* Per Property Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Por Imóvel</h4>
            <div className="max-h-[200px] overflow-y-auto space-y-2">
              {properties.map((property) => {
                const revenue = Number(property.monthly_revenue);
                const costs = Number(property.condominium_fee) + Number(property.iptu_fee) + 
                             Number(property.maintenance_fee) + Number(property.other_costs);
                const profit = revenue - costs;
                const revenuePercent = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
                
                return (
                  <div key={property.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate flex-1">{property.name}</span>
                      <span className={`text-sm font-bold ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(profit)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${revenuePercent}%`,
                            backgroundColor: 'hsl(var(--chart-1))'
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {revenuePercent.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-1" />
            <span className="text-sm text-muted-foreground">Receita</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-2" />
            <span className="text-sm text-muted-foreground">Lucro</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}