import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTenants } from '@/hooks/useTenants';
import { useLeaseContracts } from '@/hooks/useLeaseContracts';
import { Tenant, TenantFormData } from '@/types/tenant';
import { useOrgPermissions } from '@/hooks/useOrgPermissions';

import { PageTransition } from '@/components/PageTransition';
import { TenantCard } from '@/components/tenants/TenantCard';
import { TenantFormDialog } from '@/components/tenants/TenantFormDialog';
import { DeleteTenantDialog } from '@/components/tenants/DeleteTenantDialog';
import { ContractsList } from '@/components/tenants/ContractsList';
import { ContractAlerts } from '@/components/tenants/ContractAlerts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Users, FileSignature } from 'lucide-react';

export default function Tenants() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { tenants, isLoading, createTenant, updateTenant, deleteTenant } = useTenants();
  const { contracts, expiringContracts, expiredContracts } = useLeaseContracts();
  const { canCreate, canDelete, canEdit } = useOrgPermissions();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('tenants');

  const filteredTenants = tenants.filter(tenant => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      tenant.name.toLowerCase().includes(query) ||
      tenant.email?.toLowerCase().includes(query) ||
      tenant.cpf?.includes(query) ||
      tenant.phone?.includes(query)
    );
  });

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormOpen(true);
  };

  const handleDelete = (tenant: Tenant) => {
    setTenantToDelete(tenant);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (tenantToDelete) {
      deleteTenant.mutate(tenantToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setTenantToDelete(null);
        },
      });
    }
  };

  const handleFormSubmit = (data: TenantFormData) => {
    if (editingTenant) {
      updateTenant.mutate(
        { ...data, id: editingTenant.id },
        {
          onSuccess: () => {
            setFormOpen(false);
            setEditingTenant(null);
          },
        }
      );
    } else {
      createTenant.mutate(data, {
        onSuccess: () => {
          setFormOpen(false);
        },
      });
    }
  };

  const isPageLoading = authLoading || isLoading;

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
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Inquilinos</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie seus {tenants.length} inquilinos e {contracts.length} contratos
              </p>
            </div>
            {canCreate && (
              <Button
                onClick={() => {
                  setEditingTenant(null);
                  setFormOpen(true);
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Novo Inquilino
              </Button>
            )}
          </div>

          {/* Alerts */}
          <ContractAlerts
            expiringContracts={expiringContracts}
            expiredContracts={expiredContracts}
          />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="tenants" className="gap-2">
                <Users className="h-4 w-4" />
                Inquilinos ({tenants.length})
              </TabsTrigger>
              <TabsTrigger value="contracts" className="gap-2">
                <FileSignature className="h-4 w-4" />
                Contratos ({contracts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tenants" className="space-y-4">
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email, CPF ou telefone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Tenants Grid */}
              {filteredTenants.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {tenants.length === 0 ? 'Nenhum inquilino cadastrado' : 'Nenhum inquilino encontrado'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {tenants.length === 0
                      ? 'Cadastre seu primeiro inquilino para começar a gerenciar contratos.'
                      : 'Tente ajustar os termos de busca.'}
                  </p>
                  {tenants.length === 0 && (
                    <Button onClick={() => setFormOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Cadastrar Inquilino
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTenants.map((tenant) => (
                    <TenantCard
                      key={tenant.id}
                      tenant={tenant}
                      contractsCount={contracts.filter(c => c.tenant_id === tenant.id).length}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      canDelete={canDelete}
                      canEdit={canEdit}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="contracts">
              <ContractsList />
            </TabsContent>
          </Tabs>

          {/* Dialogs */}
          <TenantFormDialog
            open={formOpen}
            onOpenChange={(open) => {
              setFormOpen(open);
              if (!open) setEditingTenant(null);
            }}
            tenant={editingTenant}
            onSubmit={handleFormSubmit}
            isLoading={createTenant.isPending || updateTenant.isPending}
          />

          <DeleteTenantDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            tenant={tenantToDelete}
            onConfirm={confirmDelete}
            isLoading={deleteTenant.isPending}
          />
        </div>
        )}
    </PageTransition>
  );
}
