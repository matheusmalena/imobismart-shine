import { Link } from 'react-router-dom';
import { AlertTriangle, Crown, ArrowRight, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PropertyLimitBannerProps {
  remainingSlots: number;
  isAtLimit: boolean;
  plan: string;
  limit: number;
  excessCount?: number;
  estimatedExtraCost?: number;
}

const PLAN_NAMES: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  plus: 'Plus',
  enterprise: 'Enterprise',
};

export function PropertyLimitBanner({ remainingSlots, isAtLimit, plan, limit, excessCount = 0, estimatedExtraCost = 0 }: PropertyLimitBannerProps) {
  if (!isAtLimit && remainingSlots > 1) return null;
  
  const planName = PLAN_NAMES[plan] || plan;
  const limitText = limit === Infinity ? 'ilimitados' : limit;
  
  return (
    <Card className={`border-2 ${excessCount > 0 ? 'border-amber-400 bg-amber-500/5' : isAtLimit ? 'border-amber-400 bg-amber-500/5' : 'border-warning bg-warning/5'}`}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${excessCount > 0 ? 'bg-amber-500/10' : 'bg-warning/10'}`}>
              {excessCount > 0 ? (
                <Building2 className="h-5 w-5 text-amber-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-warning" />
              )}
            </div>
            <div>
              <h4 className={`font-semibold ${excessCount > 0 ? 'text-amber-600' : 'text-warning'}`}>
                {excessCount > 0
                  ? `${excessCount} ${excessCount === 1 ? 'imóvel extra' : 'imóveis extras'}`
                  : isAtLimit 
                    ? 'Limite de imóveis atingido' 
                    : 'Você está quase no limite!'
                }
              </h4>
              <p className="text-sm text-muted-foreground">
                {excessCount > 0
                  ? `Você tem ${excessCount} ${excessCount === 1 ? 'imóvel' : 'imóveis'} além do limite do plano ${planName}. Custo extra estimado: R$ ${estimatedExtraCost.toFixed(2).replace('.', ',')}/mês.`
                  : isAtLimit 
                    ? `Você atingiu o limite de ${limitText} imóveis do plano ${planName}. Imóveis adicionais serão cobrados extra.`
                    : `Resta apenas 1 vaga no plano ${planName} (limite: ${limitText}).`
                }
              </p>
            </div>
          </div>
          <Link to="/plans">
            <Button 
              size="sm" 
              className="gap-2 whitespace-nowrap"
              variant="outline"
            >
              <Crown className="h-4 w-4" />
              Fazer Upgrade
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
