import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Property, PROPERTY_STATUS_LABELS } from '@/types/property';

interface OccupancyChartProps {
  properties: Property[];
}

export function OccupancyChart({ properties }: OccupancyChartProps) {
  const statusCounts = properties.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(statusCounts).map(([status, count]) => ({
    name: PROPERTY_STATUS_LABELS[status as keyof typeof PROPERTY_STATUS_LABELS],
    value: count,
    status,
  }));

  const COLORS = {
    alugado: 'hsl(var(--chart-2))',
    vago: 'hsl(var(--chart-3))',
    em_reforma: 'hsl(var(--chart-4))',
    a_venda: 'hsl(var(--chart-1))',
  };

  if (properties.length === 0) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
        <h3 className="text-lg font-semibold text-card-foreground mb-6">Status dos Imóveis</h3>
        <div className="text-center py-8 text-muted-foreground">
          Adicione imóveis para ver a distribuição
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
      <h3 className="text-lg font-semibold text-card-foreground mb-6">Status dos Imóveis</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.status as keyof typeof COLORS]} 
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => [value, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.map((item) => (
          <div key={item.status} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: COLORS[item.status as keyof typeof COLORS] }}
            />
            <span className="text-sm text-muted-foreground">{item.name}</span>
            <span className="text-sm font-medium text-card-foreground ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
