import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

type PlanTier = 'pro' | 'plus' | 'enterprise';

const PLAN_CONFIG: Record<PlanTier, { label: string; badgeClass: string }> = {
  pro: {
    label: 'Pro',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
  },
  plus: {
    label: 'Plus',
    badgeClass: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:text-purple-400 dark:border-purple-800',
  },
  enterprise: {
    label: 'Enterprise',
    badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800',
  },
};

export interface LockedFeature {
  icon: ReactNode;
  label: string;
  description: string;
  plan: PlanTier;
}

interface LockedPagePlaceholderProps {
  icon: ReactNode;
  title: string;
  description: string;
  features?: LockedFeature[];
  requiredPlan: PlanTier;
  buttonLabel?: string;
}

export function LockedPagePlaceholder({
  icon,
  title,
  description,
  features,
  requiredPlan,
  buttonLabel,
}: LockedPagePlaceholderProps) {
  const navigate = useNavigate();
  const config = PLAN_CONFIG[requiredPlan];

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 rounded-full bg-muted mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground max-w-md mb-2">{description}</p>
        <Badge variant="outline" className={cn('gap-1 mb-6', config.badgeClass)}>
          <Lock className="h-3 w-3" />
          Plano {config.label}
        </Badge>

        {features && features.length > 0 && (
          <div className="grid gap-3 text-left w-full max-w-lg mb-6">
            {features.map((feature, i) => {
              const fConfig = PLAN_CONFIG[feature.plan];
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="mt-0.5 text-primary">{feature.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{feature.label}</p>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                  <Badge variant="outline" className={cn('gap-1 text-xs shrink-0', fConfig.badgeClass)}>
                    <Lock className="h-3 w-3" />
                    {fConfig.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}

        <Button onClick={() => navigate('/plans')} className="gap-2">
          <Crown className="h-4 w-4" />
          {buttonLabel || `Upgrade para ${config.label}`}
        </Button>
      </CardContent>
    </Card>
  );
}
