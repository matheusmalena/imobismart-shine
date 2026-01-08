import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function MetricCard({ title, value, subtitle, icon, trend, className }: MetricCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-2xl p-4 sm:p-5 shadow-card border border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 group min-h-[100px] flex items-center",
      className
    )}>
      <div className="flex items-center gap-3 sm:gap-4 w-full">
        <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors shrink-0 flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">{title}</p>
          <p className="text-base sm:text-xl md:text-2xl font-bold text-card-foreground break-all leading-tight">{value}</p>
          {(subtitle || trend) && (
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              {subtitle && (
                <span className="text-[10px] sm:text-xs text-muted-foreground">{subtitle}</span>
              )}
              {trend && (
                <div className={cn(
                  "inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full",
                  trend.isPositive 
                    ? "bg-success/15 text-success" 
                    : "bg-destructive/15 text-destructive"
                )}>
                  <span className="text-[8px] sm:text-[10px]">{trend.isPositive ? '▲' : '▼'}</span>
                  <span>{Math.abs(trend.value)}%</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
