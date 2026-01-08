import { Property, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from '@/types/property';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Edit, 
  Copy, 
  Archive, 
  Trash2,
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
  onEdit: (property: Property) => void;
  onDuplicate: (property: Property) => void;
  onArchive: (property: Property) => void;
  onDelete: (property: Property) => void;
}

export function PropertyCard({ property, onClick, onEdit, onDuplicate, onArchive, onDelete }: PropertyCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalCosts = Number(property.condominium_fee) + Number(property.iptu_fee) + 
    Number(property.maintenance_fee) + Number(property.other_costs);
  const profit = Number(property.monthly_revenue) - totalCosts;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'alugado': return 'bg-success/10 text-success border-success/20';
      case 'vago': return 'bg-warning/10 text-warning border-warning/20';
      case 'em_reforma': return 'bg-info/10 text-info border-info/20';
      case 'a_venda': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };


  const fullAddress = [
    property.address_street,
    property.address_number,
    property.address_neighborhood,
    property.address_city,
    property.address_state,
  ].filter(Boolean).join(', ');

  return (
    <div 
      className={cn(
        "bg-card rounded-xl shadow-card border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group cursor-pointer",
        property.is_archived && "opacity-60"
      )}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5">
        {property.photo_url ? (
          <img 
            src={property.photo_url} 
            alt={property.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="h-16 w-16 text-primary/30" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="outline" className={cn("border", getStatusColor(property.status))}>
            {PROPERTY_STATUS_LABELS[property.status]}
          </Badge>
        </div>
        <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="secondary" 
                size="icon" 
                className="h-8 w-8 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(property)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(property)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onArchive(property)}>
                <Archive className="mr-2 h-4 w-4" />
                {property.is_archived ? 'Desarquivar' : 'Arquivar'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(property)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-card-foreground text-lg truncate">
            {property.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {PROPERTY_TYPE_LABELS[property.property_type]}
          </p>
          {fullAddress && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              {fullAddress}
            </p>
          )}
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {property.area_sqm && (
            <span className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5" />
              {property.area_sqm}m²
            </span>
          )}
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              {property.bathrooms}
            </span>
          )}
          {property.parking_spots > 0 && (
            <span className="flex items-center gap-1">
              <Car className="h-3.5 w-3.5" />
              {property.parking_spots}
            </span>
          )}
        </div>

        {/* Financial */}
        <div className="pt-3 border-t border-border/50 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Receita</p>
            <p className="text-sm font-semibold text-card-foreground">
              {formatCurrency(Number(property.monthly_revenue))}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Custos</p>
            <p className="text-sm font-semibold text-card-foreground">
              {formatCurrency(totalCosts)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Lucro</p>
            <p className={cn(
              "text-sm font-semibold",
              profit >= 0 ? "text-success" : "text-destructive"
            )}>
              {formatCurrency(profit)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
