import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

type PlanTier = 'pro' | 'plus' | 'enterprise';

const PLAN_CONFIG: Record<PlanTier, { label: string; badgeClass: string; iconBg: string }> = {
  pro: {
    label: 'Pro',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
    iconBg: 'bg-primary/10',
  },
  plus: {
    label: 'Plus',
    badgeClass: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:text-purple-400 dark:border-purple-800',
    iconBg: 'bg-purple-500/10',
  },
  enterprise: {
    label: 'Enterprise',
    badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800',
    iconBg: 'bg-amber-500/10',
  },
};

interface UpgradeOverlayProps {
  plan: PlanTier;
  title: string;
  description: string;
  icon?: ReactNode;
}

export function UpgradeOverlay({ plan, title, description, icon }: UpgradeOverlayProps) {
  const navigate = useNavigate();
  const config = PLAN_CONFIG[plan];

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
      <div className="absolute inset-0 backdrop-blur-md bg-card/80" />
      <div className="relative z-20 text-center p-6 max-w-sm">
        <div className={cn('p-3 rounded-full w-fit mx-auto mb-3', config.iconBg)}>
          {icon ?? <Lock className="h-5 w-5 text-primary" />}
        </div>
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
        <Button size="sm" onClick={() => navigate('/plans')} className="gap-1.5">
          <Crown className="h-3.5 w-3.5" />
          Upgrade para {config.label}
        </Button>
      </div>
    </div>
  );
}

interface UpgradeBadgeProps {
  plan: PlanTier;
  className?: string;
}

export function UpgradeBadge({ plan, className }: UpgradeBadgeProps) {
  const config = PLAN_CONFIG[plan];
  return (
    <Badge variant="outline" className={cn('gap-1 text-xs ml-auto', config.badgeClass, className)}>
      <Lock className="h-3 w-3" />
      Plano {config.label}
    </Badge>
  );
}
