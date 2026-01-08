import { cn } from '@/lib/utils';

interface LogoTextProps {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4 10.5L12 4L20 10.5V18C20 18.5523 19.5523 19 19 19H5C4.44772 19 4 18.5523 4 18V10.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <rect
        x="9"
        y="12"
        width="2.5"
        height="2.5"
        rx="0.4"
        fill="currentColor"
      />
      <rect
        x="12.5"
        y="12"
        width="2.5"
        height="2.5"
        rx="0.4"
        fill="currentColor"
      />
    </svg>
  );
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
          <LogoIcon className={cn('text-primary', sizes.icon)} />
        </div>
      )}
      <span className={cn('font-bold', sizes.text)}>
        <span className="text-foreground">Imobi</span>
        <span className="text-primary">Smart</span>
      </span>
    </div>
  );
}
