import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Lock,
  Crown,
  Lightbulb,
  TrendingUp,
  Home,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const navigate = useNavigate();

  // Generate sample AI recommendations based on data
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
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-primary" />
          Recomendações IA
          {!isPlus && (
            <Badge variant="outline" className="gap-1 text-xs ml-auto">
              <Lock className="h-3 w-3" />
              Plus
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {/* Blur overlay for non-Plus */}
        {!isPlus && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="absolute inset-0 backdrop-blur-lg bg-background/60" />
            <div className="relative z-20 text-center p-6 max-w-md">
              <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">Insights com IA</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Recomendações personalizadas baseadas na análise do seu portfólio.
              </p>
              <Button size="sm" onClick={() => navigate('/plans')} className="gap-1.5">
                <Crown className="h-3.5 w-3.5" />
                Upgrade
              </Button>
            </div>
          </div>
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
