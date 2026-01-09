import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { usePlans, Plan, PlanInput } from '@/hooks/usePlans';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { CreditCard, Pencil, Trash2, Plus, Sparkles, Building2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminPlans() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { plans, isLoading: plansLoading, updatePlan, createPlan, deletePlan } = usePlans();
  
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

  const PlanDialog = ({ isOpen, onClose, title, description }: { 
    isOpen: boolean; 
    onClose: () => void; 
    title: string;
    description: string;
  }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id">ID do Plano</Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                placeholder="ex: starter"
                disabled={!!editingPlan}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex: Gratuito"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="ex: Perfeito para começar"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_label">Label do Preço</Label>
              <Input
                id="price_label"
                value={formData.price_label}
                onChange={(e) => setFormData({ ...formData, price_label: e.target.value })}
                placeholder="ex: R$ 49/mês"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property_limit">Limite de Imóveis</Label>
              <Input
                id="property_limit"
                type="number"
                value={formData.property_limit}
                onChange={(e) => setFormData({ ...formData, property_limit: Number(e.target.value) })}
                min={-1}
              />
              <p className="text-xs text-muted-foreground">Use -1 para ilimitado</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort_order">Ordem</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                min={0}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Recursos (um por linha)</Label>
            <Textarea
              id="features"
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              placeholder="Dashboard básico&#10;Upload de documentos&#10;Suporte por email"
              rows={5}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Ativo</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_highlighted"
                checked={formData.is_highlighted}
                onCheckedChange={(checked) => setFormData({ ...formData, is_highlighted: checked })}
              />
              <Label htmlFor="is_highlighted">Destacado</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!formData.id || !formData.name || updatePlan.isPending || createPlan.isPending}
          >
            {updatePlan.isPending || createPlan.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">Plano</TableHead>
                      <TableHead className="font-semibold">Preço</TableHead>
                      <TableHead className="font-semibold text-center">Limite Imóveis</TableHead>
                      <TableHead className="font-semibold text-center">Recursos</TableHead>
                      <TableHead className="font-semibold text-center">Status</TableHead>
                      <TableHead className="font-semibold text-center">Destaque</TableHead>
                      <TableHead className="font-semibold text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow key={plan.id} className="group">
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
                            onCheckedChange={() => handleToggleActive(plan)}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={plan.is_highlighted}
                            onCheckedChange={() => handleToggleHighlighted(plan)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(plan)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm(plan.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

        {/* Edit Dialog */}
        <PlanDialog
          isOpen={!!editingPlan}
          onClose={() => setEditingPlan(null)}
          title="Editar Plano"
          description="Modifique as informações do plano"
        />

        {/* Create Dialog */}
        <PlanDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          title="Novo Plano"
          description="Crie um novo plano de assinatura"
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
