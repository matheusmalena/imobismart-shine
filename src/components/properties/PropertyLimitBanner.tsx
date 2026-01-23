import { Link } from 'react-router-dom';
import { AlertTriangle, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PropertyLimitBannerProps {
  remainingSlots: number;
  isAtLimit: boolean;
  plan: string;
  limit: number;
}

const PLAN_NAMES: Record<string, string> = {
  starter: 'Gratuito',
  pro: 'Pro',
  enterprise: 'Plus',
};

export function PropertyLimitBanner({ remainingSlots, isAtLimit, plan, limit }: PropertyLimitBannerProps) {
  if (!isAtLimit && remainingSlots > 1) return null;
  
  const planName = PLAN_NAMES[plan] || plan;
  const limitText = limit === Infinity ? 'ilimitados' : limit;
  
  return (
    <Card className={`border-2 ${isAtLimit ? 'border-destructive bg-destructive/5' : 'border-warning bg-warning/5'}`}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${isAtLimit ? 'bg-destructive/10' : 'bg-warning/10'}`}>
              {isAtLimit ? (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-warning" />
              )}
            </div>
            <div>
              <h4 className={`font-semibold ${isAtLimit ? 'text-destructive' : 'text-warning'}`}>
                {isAtLimit 
                  ? 'Limite de imóveis atingido!' 
                  : 'Você está quase no limite!'
                }
              </h4>
              <p className="text-sm text-muted-foreground">
                {isAtLimit 
                  ? `O plano ${planName} permite apenas ${limitText} imóveis. Faça upgrade para adicionar mais.`
                  : `Resta apenas 1 vaga no plano ${planName} (limite: ${limitText}). Considere fazer upgrade.`
                }
              </p>
            </div>
          </div>
          <Link to="/plans">
            <Button 
              size="sm" 
              className="gap-2 whitespace-nowrap"
              variant={isAtLimit ? 'default' : 'outline'}
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
