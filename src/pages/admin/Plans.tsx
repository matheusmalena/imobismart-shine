import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { usePlans, Plan, PlanInput } from '@/hooks/usePlans';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PlanFormDialog } from '@/components/admin/PlanFormDialog';
import { SortablePlanRow } from '@/components/admin/SortablePlanRow';
import { CreditCard, Plus, Sparkles, Check, History, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminPlans() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { plans, isLoading: plansLoading, updatePlan, createPlan, deletePlan, reorderPlans, auditLogs, auditLoading } = usePlans();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = plans.findIndex((p) => p.id === active.id);
      const newIndex = plans.findIndex((p) => p.id === over.id);
      const newOrder = arrayMove(plans, oldIndex, newIndex);
      reorderPlans.mutate(newOrder.map((p) => p.id));
    }
  };
  
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<PlanInput>({
    id: '',
    name: '',
    description: '',
    price: 0,
    price_label: 'R$ 0/mês',
    property_limit: 2,
    features: [],
    is_highlighted: false,
    is_active: true,
    sort_order: 0,
  });
  const [featuresText, setFeaturesText] = useState('');

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, roleLoading, navigate]);

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      price: 0,
      price_label: 'R$ 0/mês',
      property_limit: 2,
      features: [],
      is_highlighted: false,
      is_active: true,
      sort_order: plans.length,
    });
    setFeaturesText('');
  };

  const openEditDialog = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      price: plan.price,
      price_label: plan.price_label,
      property_limit: plan.property_limit,
      features: plan.features,
      is_highlighted: plan.is_highlighted,
      is_active: plan.is_active,
      sort_order: plan.sort_order,
    });
    setFeaturesText(plan.features.join('\n'));
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleSave = async () => {
    const features = featuresText.split('\n').filter(f => f.trim());
    const dataToSave = { ...formData, features };

    if (editingPlan) {
      await updatePlan.mutateAsync(dataToSave);
      setEditingPlan(null);
    } else {
      await createPlan.mutateAsync(dataToSave);
      setIsCreateDialogOpen(false);
    }
    resetForm();
  };

  const handleDelete = async (planId: string) => {
    await deletePlan.mutateAsync(planId);
    setDeleteConfirm(null);
  };

  const handleToggleActive = async (plan: Plan) => {
    await updatePlan.mutateAsync({ id: plan.id, is_active: !plan.is_active });
  };

  const handleToggleHighlighted = async (plan: Plan) => {
    await updatePlan.mutateAsync({ id: plan.id, is_highlighted: !plan.is_highlighted });
  };

  if (roleLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestão de Planos</h1>
              <p className="text-muted-foreground text-sm">Configure planos, preços e recursos</p>
            </div>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Plano
          </Button>
        </div>

        {/* Plans Table */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Planos ({plans.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {plansLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : plans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-foreground mb-1">Nenhum plano encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  Crie seu primeiro plano para começar.
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-10"></TableHead>
                        <TableHead className="font-semibold">Plano</TableHead>
                        <TableHead className="font-semibold">Preço</TableHead>
                        <TableHead className="font-semibold text-center">Limite Imóveis</TableHead>
                        <TableHead className="font-semibold text-center">Recursos</TableHead>
                        <TableHead className="font-semibold text-center">Status</TableHead>
                        <TableHead className="font-semibold text-center">Destaque</TableHead>
                        <TableHead className="font-semibold text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <SortableContext
                      items={plans.map((p) => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <TableBody>
                        {plans.map((plan) => (
                          <SortablePlanRow
                            key={plan.id}
                            plan={plan}
                            formatCurrency={formatCurrency}
                            onEdit={openEditDialog}
                            onDelete={(id) => setDeleteConfirm(id)}
                            onToggleActive={handleToggleActive}
                            onToggleHighlighted={handleToggleHighlighted}
                          />
                        ))}
                      </TableBody>
                    </SortableContext>
                  </Table>
                </div>
              </DndContext>
            )}
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Preview dos Planos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {plans.filter(p => p.is_active).map((plan) => (
                <Card
                  key={plan.id}
                  className={cn(
                    "relative transition-all",
                    plan.is_highlighted && "border-primary shadow-lg scale-[1.02]",
                  )}
                >
                  {plan.is_highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Mais Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-foreground">{plan.price_label}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audit Log Section */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Histórico de Alterações</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {auditLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-foreground mb-1">Nenhuma alteração registrada</h3>
                <p className="text-sm text-muted-foreground">
                  O histórico de alterações aparecerá aqui.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">Data</TableHead>
                      <TableHead className="font-semibold">Plano</TableHead>
                      <TableHead className="font-semibold">Ação</TableHead>
                      <TableHead className="font-semibold">Alterações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.slice(0, 20).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.plan_id}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              log.action === 'create' ? 'default' :
                              log.action === 'update' ? 'secondary' :
                              'destructive'
                            }
                          >
                            {log.action === 'create' ? 'Criado' :
                             log.action === 'update' ? 'Atualizado' :
                             'Excluído'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm text-muted-foreground">
                            {log.action === 'update' && log.changes && (
                              Object.keys(log.changes).filter(k => k !== 'id').slice(0, 3).join(', ')
                            )}
                            {log.action === 'create' && 'Novo plano criado'}
                            {log.action === 'delete' && 'Plano removido'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <PlanFormDialog
          isOpen={!!editingPlan}
          onClose={() => setEditingPlan(null)}
          title="Editar Plano"
          description="Modifique as informações do plano"
          formData={formData}
          setFormData={setFormData}
          featuresText={featuresText}
          setFeaturesText={setFeaturesText}
          onSave={handleSave}
          isSaving={updatePlan.isPending}
          isEditing={true}
        />

        {/* Create Dialog */}
        <PlanFormDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          title="Novo Plano"
          description="Crie um novo plano de assinatura"
          formData={formData}
          setFormData={setFormData}
          featuresText={featuresText}
          setFeaturesText={setFeaturesText}
          onSave={handleSave}
          isSaving={createPlan.isPending}
          isEditing={false}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Plano</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.
                Clientes existentes com este plano não serão afetados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                className="bg-destructive hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
