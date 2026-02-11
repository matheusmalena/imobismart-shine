import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { UpgradeOverlay, UpgradeBadge } from '@/components/common/UpgradeOverlay';

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
  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
          <UpgradeBadge plan={requiredPlan} />
        </CardTitle>
      </CardHeader>
      <CardContent className="relative min-h-[180px]">
        <UpgradeOverlay
          plan={requiredPlan}
          title={title}
          description={description}
        />

        {/* Background content for visual effect */}
        <div className="opacity-20 pointer-events-none select-none">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
