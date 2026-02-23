import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Check, X } from 'lucide-react';

interface Plan {
  id: string;
  property_limit: number;
  extra_property_price?: number | null;
}

interface PlanComparisonProps {
  activePlans: Plan[];
}

export default function PlanComparison({ activePlans }: PlanComparisonProps) {
  const getPlanLimit = (planId: string) => {
    const p = activePlans.find(pl => pl.id === planId);
    if (!p) return '—';
    return p.property_limit === -1 ? 'Ilimitado' : p.property_limit;
  };

  const getExtraPrice = (planId: string) => {
    const p = activePlans.find(pl => pl.id === planId);
    const ep = (p as any)?.extra_property_price;
    if (!ep || ep === 0) return '—';
    return `R$ ${Number(ep).toFixed(2).replace('.', ',')}`;
  };

  const Chk = () => <Check className="h-4 w-4 text-primary mx-auto" />;
  const Nope = () => <X className="h-4 w-4 text-destructive mx-auto" />;

  const rows = [
    { label: 'Limite de imóveis', values: ['free', 'starter', 'pro', 'plus', 'enterprise'].map(getPlanLimit) },
    { label: 'Imóvel extra', values: ['—', getExtraPrice('starter'), getExtraPrice('pro'), getExtraPrice('plus'), getExtraPrice('enterprise')] },
  ];

  const boolRows = [
    { label: 'Dashboard básico', values: [true, true, true, true, true] },
    { label: 'Gestão de inquilinos', values: [true, true, true, true, true] },
    { label: 'Exportação CSV/Excel', values: [false, true, true, true, true] },
    { label: 'Análise avançada', values: [false, false, true, true, true] },
    { label: 'Relatórios PDF', values: [false, false, false, true, true] },
    { label: 'Recomendações IA', values: [false, false, false, true, true] },
    { label: 'Gestão de equipe', values: [false, false, false, false, true] },
    { label: 'Suporte prioritário', values: [false, false, false, true, true] },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="max-w-5xl mx-auto"
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Comparativo de Recursos
          </CardTitle>
          <CardDescription>Veja todos os recursos disponíveis em cada plano</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Recurso</th>
                  {['Free', 'Starter', 'Pro', 'Plus', 'Enterprise'].map(name => (
                    <th key={name} className="text-center py-3 px-2">{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr key={row.label} className="hover:bg-muted/50">
                    <td className="py-3 px-2">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className="text-center py-3 px-2">{v}</td>
                    ))}
                  </tr>
                ))}
                {boolRows.map((row) => (
                  <tr key={row.label} className="hover:bg-muted/50">
                    <td className="py-3 px-2">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className="text-center py-3 px-2">{v ? <Chk /> : <Nope />}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
