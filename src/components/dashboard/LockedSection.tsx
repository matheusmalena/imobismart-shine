import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LockedSectionProps {
  title: string;
  description: string;
  requiredPlan: 'pro' | 'plus' | 'enterprise';
  icon?: ReactNode;
  children: ReactNode;
  hasAccess: boolean;
  className?: string;
}

export function LockedSection({
  title,
  description,
  requiredPlan,
  icon,
  children,
  hasAccess,
  className,
}: LockedSectionProps) {
  const navigate = useNavigate();
  
  const planLabels = {
    pro: 'Pro',
    plus: 'Plus',
    enterprise: 'Enterprise',
  };

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
          <Badge variant="outline" className="gap-1 text-xs ml-auto">
            <Lock className="h-3 w-3" />
            {planLabels[requiredPlan]}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative min-h-[180px]">
        {/* Blur overlay */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="absolute inset-0 backdrop-blur-lg bg-background/60" />
          <div className="relative z-20 text-center p-4 max-w-sm">
            <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-3">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <h4 className="font-semibold mb-1">{title}</h4>
            <p className="text-sm text-muted-foreground mb-3">
              {description}
            </p>
            <Button size="sm" onClick={() => navigate('/settings')} className="gap-1.5">
              <Crown className="h-3.5 w-3.5" />
              Upgrade
            </Button>
          </div>
        </div>

        {/* Background content for visual effect */}
        <div className="opacity-20 pointer-events-none select-none">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
