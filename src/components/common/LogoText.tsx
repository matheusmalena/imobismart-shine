import { cn } from '@/lib/utils';
import logoIcon from '@/assets/logo-icon.png';

interface LogoTextProps {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  variant?: 'default' | 'sidebar';
  className?: string;
}

export function LogoText({ size = 'md', showIcon = true, variant = 'default', className }: LogoTextProps) {
  const sizeClasses = {
    sm: {
      icon: 'h-8 w-8',
      text: 'text-sm leading-tight',
    },
    md: {
      icon: 'h-10 w-10',
      text: 'text-base leading-tight',
    },
    lg: {
      icon: 'h-12 w-12',
      text: 'text-lg leading-tight',
    },
  };

  const sizes = sizeClasses[size];

  const textColor = variant === 'sidebar' 
    ? 'text-sidebar-foreground' 
    : 'text-foreground';

  const primaryColor = variant === 'sidebar'
    ? 'text-sidebar-primary'
    : 'text-primary';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showIcon && (
        <img 
          src={logoIcon} 
          alt="ImobiSmart Logo" 
          className={cn(sizes.icon, 'object-contain')}
        />
      )}
      <div className={cn('font-bold flex flex-col', sizes.text)}>
        <span className={textColor}>Imobi</span>
        <span className={cn(primaryColor, '-mt-1')}>Smart</span>
      </div>
    </div>
  );
}
