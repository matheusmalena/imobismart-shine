import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Sparkles, 
  Lightbulb,
  TrendingUp,
  Home,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UpgradeOverlay, UpgradeBadge } from '@/components/common/UpgradeOverlay';

interface PlusAICardProps {
  isPlus: boolean;
  propertyCount: number;
  avgROI: number;
  avgOccupancy: number;
}

export function PlusAICard({ 
  isPlus, 
  propertyCount,
  avgROI,
  avgOccupancy
}: PlusAICardProps) {
  const getRecommendations = () => {
    const recommendations = [];
    
    if (avgOccupancy < 80) {
      recommendations.push({
        icon: Home,
        title: "Melhorar taxa de ocupação",
        description: "Considere revisar preços ou investir em marketing dos imóveis vagos.",
        type: "warning" as const
      });
    }
    
    if (avgROI < 8) {
      recommendations.push({
        icon: TrendingUp,
        title: "Otimizar rentabilidade",
        description: "Analise custos fixos e explore oportunidades de aumento de receita.",
        type: "info" as const
      });
    }
    
    if (propertyCount > 3) {
      recommendations.push({
        icon: DollarSign,
        title: "Diversificação de portfólio",
        description: "Seu portfólio está crescendo! Considere diversificar tipos de imóveis.",
        type: "success" as const
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        icon: Lightbulb,
        title: "Portfólio saudável",
        description: "Seus indicadores estão positivos. Continue monitorando o mercado.",
        type: "success" as const
      });
    }

    return recommendations.slice(0, 3);
  };

  const recommendations = getRecommendations();

  const typeStyles = {
    warning: "bg-warning/10 border-warning/20 text-warning",
    info: "bg-info/10 border-info/20 text-info",
    success: "bg-success/10 border-success/20 text-success"
  };

  return (
    <Card className="relative overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-primary" />
          Recomendações IA
          {!isPlus && <UpgradeBadge plan="plus" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative flex-1 min-h-[220px]">
        {!isPlus && (
          <UpgradeOverlay
            plan="plus"
            title="Insights com IA"
            description="Recomendações personalizadas baseadas na análise do seu portfólio."
            icon={<Sparkles className="h-5 w-5 text-purple-600" />}
          />
        )}

        <div className={cn("space-y-3", !isPlus && "opacity-20 pointer-events-none select-none")}>
          {recommendations.map((rec, index) => (
            <div 
              key={index} 
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border",
                typeStyles[rec.type]
              )}
            >
              <rec.icon className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{rec.title}</p>
                <p className="text-xs opacity-80 mt-0.5">{rec.description}</p>
              </div>
            </div>
          ))}
          
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              Atualizado mensalmente com base nos seus dados
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
