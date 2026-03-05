import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';
import { usePropertyLimit } from '@/hooks/usePropertyLimit';
import { usePlans } from '@/hooks/usePlans';
import { useOrgPermissions } from '@/hooks/useOrgPermissions';
import { Property, PropertyFormData, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from '@/types/property';

import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyForm } from '@/components/properties/PropertyForm';
import { EmptyState } from '@/components/properties/EmptyState';
import { DeleteConfirmDialog } from '@/components/properties/DeleteConfirmDialog';
import { PropertyLimitBanner } from '@/components/properties/PropertyLimitBanner';
import { UnarchiveBlockedDialog } from '@/components/properties/UnarchiveBlockedDialog';
import { PropertyDetails } from '@/pages/PropertyDetails';
import { PageTransition } from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, SlidersHorizontal, LayoutGrid, List, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Properties() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    properties, 
    isLoading, 
    createProperty, 
    updateProperty, 
    deleteProperty, 
    archiveProperty,
    duplicateProperty 
  } = useProperties();
  
  const { canAddProperty, remainingSlots, isAtLimit, plan, limit, activeCount: planActiveCount } = usePropertyLimit();
  const { canCreate, canDelete } = useOrgPermissions();
  const { getPlanById } = usePlans();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [unarchiveBlockedOpen, setUnarchiveBlockedOpen] = useState(false);
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [showArchived, setShowArchived] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('created_at');

  // TEMPORÁRIO: Desabilitado para screenshots
  // useEffect(() => {
  //   if (!authLoading && !user) {
  //     navigate('/auth');
  //   }
  // }, [user, authLoading, navigate]);

  const filteredProperties = useMemo(() => {
    return properties
      .filter(p => showArchived ? p.is_archived : !p.is_archived)
      .filter(p => {
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(query) ||
            p.address_city?.toLowerCase().includes(query) ||
            p.address_neighborhood?.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .filter(p => typeFilter === 'all' || p.property_type === typeFilter)
      .filter(p => statusFilter === 'all' || p.status === statusFilter)
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'revenue':
            return Number(b.monthly_revenue) - Number(a.monthly_revenue);
          case 'profit':
            const profitA = Number(a.monthly_revenue) - (Number(a.condominium_fee) + Number(a.iptu_fee) + Number(a.maintenance_fee) + Number(a.other_costs));
            const profitB = Number(b.monthly_revenue) - (Number(b.condominium_fee) + Number(b.iptu_fee) + Number(b.maintenance_fee) + Number(b.other_costs));
            return profitB - profitA;
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });
  }, [properties, showArchived, searchQuery, typeFilter, statusFilter, sortBy]);

  const handleEdit = (property: Property) => {
    setSelectedProperty(null);
    setEditingProperty(property);
    setFormOpen(true);
  };

  const handleViewDetails = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleDuplicate = (property: Property) => {
    duplicateProperty.mutate({ property, canAdd: canAddProperty });
  };

  const handleArchive = (property: Property) => {
    // If property is archived and user wants to unarchive, check limit
    if (property.is_archived && isAtLimit) {
      setUnarchiveBlockedOpen(true);
      return;
    }
    archiveProperty.mutate({ id: property.id, isArchived: !property.is_archived });
  };

  const handleDelete = (property: Property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (propertyToDelete) {
      deleteProperty.mutate(propertyToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setPropertyToDelete(null);
        },
      });
    }
  };

  const handleFormSubmit = (data: PropertyFormData) => {
    if (editingProperty) {
      updateProperty.mutate(
        { ...data, id: editingProperty.id },
        {
          onSuccess: () => {
            setFormOpen(false);
            setEditingProperty(null);
          },
        }
      );
    } else {
      createProperty.mutate(data, {
        onSuccess: () => {
          setFormOpen(false);
        },
      });
    }
  };

  const isPageLoading = authLoading || isLoading;

  const activeCount = properties.filter(p => !p.is_archived).length;
  const archivedCount = properties.filter(p => p.is_archived).length;

  // Show property details if selected
  if (selectedProperty) {
    return (
      <PropertyDetails 
        property={selectedProperty} 
        onEdit={handleEdit}
        onClose={() => setSelectedProperty(null)}
      />
    );
  }

  return (
    <PageTransition>
        {isPageLoading ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
        <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Imóveis</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus {activeCount} imóveis ativos
              {archivedCount > 0 && ` (${archivedCount} arquivados)`}
            </p>
          </div>
          {canCreate && (
            <Button 
              onClick={() => {
                if (!canAddProperty) {
                  toast.error('Limite de imóveis atingido! Faça upgrade para adicionar mais.');
                  return;
                }
                setEditingProperty(null); 
                setFormOpen(true); 
              }} 
              className="gap-2"
              variant={canAddProperty ? 'default' : 'secondary'}
            >
              <Plus className="h-4 w-4" />
              Novo Imóvel
            </Button>
          )}
        </div>

        {/* Property Limit Banner */}
        <PropertyLimitBanner 
          remainingSlots={remainingSlots} 
          isAtLimit={isAtLimit} 
          plan={plan}
          limit={limit}
        />

        {/* Filters */}
        <div className="bg-card rounded-xl p-4 shadow-card border border-border/50 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, cidade ou bairro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Tabs value={showArchived ? 'archived' : 'active'} onValueChange={(v) => setShowArchived(v === 'archived')}>
                <TabsList>
                  <TabsTrigger value="active">Ativos</TabsTrigger>
                  <TabsTrigger value="archived" className="gap-2">
                    <Archive className="h-4 w-4" />
                    Arquivados
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  className="rounded-none"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  className="rounded-none"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(PROPERTY_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>


            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Mais recentes</SelectItem>
                <SelectItem value="name">Nome (A-Z)</SelectItem>
                <SelectItem value="revenue">Maior receita</SelectItem>
                <SelectItem value="profit">Maior lucro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Properties Grid/List */}
        {filteredProperties.length === 0 ? (
          properties.length === 0 ? (
            <EmptyState onAddProperty={() => { setEditingProperty(null); setFormOpen(true); }} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum imóvel encontrado com os filtros aplicados.
            </div>
          )
        ) : (
          <div className={cn(
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          )}>
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onClick={() => handleViewDetails(property)}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onArchive={handleArchive}
                onDelete={handleDelete}
                canDelete={canDelete}
                canCreate={canCreate}
              />
            ))}
          </div>
        )}

        {/* Property Form Dialog */}
        <PropertyForm
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditingProperty(null);
          }}
          property={editingProperty}
          onSubmit={handleFormSubmit}
          isLoading={createProperty.isPending || updateProperty.isPending}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          property={propertyToDelete}
          onConfirm={confirmDelete}
          isLoading={deleteProperty.isPending}
        />

        {/* Unarchive Blocked Dialog */}
        <UnarchiveBlockedDialog
          open={unarchiveBlockedOpen}
          onOpenChange={setUnarchiveBlockedOpen}
          activeCount={planActiveCount}
          limit={limit}
          planName={getPlanById(plan)?.name || plan}
        />
      </div>
        )}
    </PageTransition>
  );
}
