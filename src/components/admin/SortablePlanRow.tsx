import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { GripVertical, Pencil, Trash2, Sparkles, Building2 } from 'lucide-react';
import { Plan } from '@/hooks/usePlans';

interface SortablePlanRowProps {
  plan: Plan;
  formatCurrency: (value: number) => string;
  onEdit: (plan: Plan) => void;
  onDelete: (planId: string) => void;
  onToggleActive: (plan: Plan) => void;
  onToggleHighlighted: (plan: Plan) => void;
}

export function SortablePlanRow({
  plan,
  formatCurrency,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleHighlighted,
}: SortablePlanRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: plan.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className="group"
    >
      <TableCell className="w-10">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted touch-none"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell>
        <div className="min-w-0">
          <p className="font-medium text-foreground flex items-center gap-2">
            {plan.name}
            {plan.is_highlighted && (
              <Sparkles className="h-4 w-4 text-primary" />
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {plan.id} • {plan.description}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-semibold">{formatCurrency(plan.price)}</p>
          <p className="text-xs text-muted-foreground">{plan.price_label}</p>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-1">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">
            {plan.property_limit === -1 ? '∞' : plan.property_limit}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline">
          {plan.features.length} recursos
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <Switch
          checked={plan.is_active}
          onCheckedChange={() => onToggleActive(plan)}
        />
      </TableCell>
      <TableCell className="text-center">
        <Switch
          checked={plan.is_highlighted}
          onCheckedChange={() => onToggleHighlighted(plan)}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(plan)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(plan.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
