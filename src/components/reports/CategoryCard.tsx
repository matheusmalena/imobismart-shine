import { LucideIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  title: string;
  icon: LucideIcon;
  fields: string[];
  fieldCount: number;
  isSelected: boolean;
  onToggle: () => void;
}

export function CategoryCard({
  title,
  icon: Icon,
  fields,
  fieldCount,
  isSelected,
  onToggle,
}: CategoryCardProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-xl border-2 transition-all cursor-pointer group",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border hover:border-primary/50 hover:bg-muted/30"
      )}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-lg transition-colors",
            isSelected ? "bg-primary/10" : "bg-muted group-hover:bg-primary/10"
          )}>
            <Icon className={cn(
              "h-4 w-4 transition-colors",
              isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary"
            )} />
          </div>
          <span className={cn(
            "font-semibold text-sm transition-colors",
            isSelected ? "text-foreground" : "text-muted-foreground"
          )}>
            {title}
          </span>
        </div>
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={onToggle}
          className="pointer-events-none"
        />
      </div>
      <ul className="text-xs text-muted-foreground space-y-1 mb-3">
        {fields.map((field, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
            {field}
          </li>
        ))}
      </ul>
      <div className={cn(
        "text-xs font-medium px-2 py-1 rounded-full inline-block transition-colors",
        isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      )}>
        {fieldCount} campos
      </div>
    </div>
  );
}
