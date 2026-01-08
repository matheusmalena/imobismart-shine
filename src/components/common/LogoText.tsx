import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoTextProps {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function LogoText({ size = 'md', showIcon = true, className }: LogoTextProps) {
  const sizeClasses = {
    sm: {
      icon: 'h-6 w-6',
      iconWrapper: 'p-1.5',
      text: 'text-lg',
    },
    md: {
      icon: 'h-6 w-6',
      iconWrapper: 'p-2',
      text: 'text-xl',
    },
    lg: {
      icon: 'h-8 w-8',
      iconWrapper: 'p-2.5',
      text: 'text-2xl',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showIcon && (
        <div className={cn('rounded-xl bg-primary/10', sizes.iconWrapper)}>
          <Building2 className={cn('text-primary', sizes.icon)} />
        </div>
      )}
      <span className={cn('font-bold', sizes.text)}>
        <span className="text-foreground">Imobi</span>
        <span className="text-primary">Smart</span>
      </span>
    </div>
  );
}
