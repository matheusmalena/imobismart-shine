import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { Link2, Plus, Pencil, Trash2, Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EnterpriseLink {
  id: string;
  client_name: string;
  client_email: string;
  checkout_url: string;
  plan_label: string;
  price: number;
  is_active: boolean;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface LinkFormData {
  client_name: string;
  client_email: string;
  checkout_url: string;
  plan_label: string;
  price: number;
  is_active: boolean;
  notes: string;
}

const emptyForm: LinkFormData = {
  client_name: '',
  client_email: '',
  checkout_url: '',
  plan_label: 'Enterprise',
  price: 0,
  is_active: true,
  notes: '',
};

export default function EnterpriseLinks() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<EnterpriseLink | null>(null);
  const [formData, setFormData] = useState<LinkFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!roleLoading && !isAdmin) navigate('/dashboard');
  }, [isAdmin, roleLoading, navigate]);

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['enterprise-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enterprise_checkout_links')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as EnterpriseLink[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: LinkFormData & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from('enterprise_checkout_links')
          .update({
            client_name: data.client_name,
            client_email: data.client_email,
            checkout_url: data.checkout_url,
            plan_label: data.plan_label,
            price: data.price,
            is_active: data.is_active,
            notes: data.notes || null,
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('enterprise_checkout_links')
          .insert({
            client_name: data.client_name,
            client_email: data.client_email,
            checkout_url: data.checkout_url,
            plan_label: data.plan_label,
            price: data.price,
            is_active: data.is_active,
            notes: data.notes || null,
            created_by: user!.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprise-links'] });
      toast.success(editingLink ? 'Link atualizado' : 'Link criado com sucesso');
      closeDialog();
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao salvar link');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('enterprise_checkout_links').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprise-links'] });
      toast.success('Link removido');
      setDeleteConfirm(null);
    },
    onError: () => toast.error('Erro ao remover link'),
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingLink(null);
    setFormData(emptyForm);
  };

  const openCreate = () => {
    setFormData(emptyForm);
    setEditingLink(null);
    setIsDialogOpen(true);
  };

  const openEdit = (link: EnterpriseLink) => {
    setEditingLink(link);
    setFormData({
      client_name: link.client_name,
      client_email: link.client_email,
      checkout_url: link.checkout_url,
      plan_label: link.plan_label,
      price: link.price,
      is_active: link.is_active,
      notes: link.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate({ ...formData, id: editingLink?.id });
  };

  const copyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Link copiado!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (roleLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Link2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Links Enterprise</h1>
              <p className="text-muted-foreground text-sm">Gerencie links de checkout personalizados para clientes Enterprise</p>
            </div>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Link
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Links ({links.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : links.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Link2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-foreground mb-1">Nenhum link criado</h3>
                <p className="text-sm text-muted-foreground">Crie um link de checkout personalizado para um cliente Enterprise.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {links.map(link => (
                      <TableRow key={link.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground">{link.client_name}</div>
                            <div className="text-xs text-muted-foreground">{link.client_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{link.plan_label}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(link.price)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={link.is_active ? 'default' : 'secondary'}>
                            {link.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(link.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => copyLink(link.checkout_url, link.id)} title="Copiar link">
                              {copiedId === link.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => window.open(link.checkout_url, '_blank')} title="Abrir link">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(link)} title="Editar">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(link.id)} title="Excluir" className="text-destructive hover:text-destructive">
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

        {/* Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingLink ? 'Editar Link' : 'Novo Link Enterprise'}</DialogTitle>
              <DialogDescription>
                {editingLink ? 'Atualize as informações do link' : 'Crie um link de checkout personalizado para um cliente Enterprise'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Cliente</Label>
                  <Input value={formData.client_name} onChange={e => setFormData({ ...formData, client_name: e.target.value })} placeholder="ex: João Silva" />
                </div>
                <div className="space-y-2">
                  <Label>Email do Cliente</Label>
                  <Input type="email" value={formData.client_email} onChange={e => setFormData({ ...formData, client_email: e.target.value })} placeholder="ex: joao@email.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Link de Checkout (Cakto)</Label>
                <Input value={formData.checkout_url} onChange={e => setFormData({ ...formData, checkout_url: e.target.value })} placeholder="https://pay.cakto.com.br/..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Descrição do Plano</Label>
                  <Input value={formData.plan_label} onChange={e => setFormData({ ...formData, plan_label: e.target.value })} placeholder="ex: Enterprise 50 imóveis" />
                </div>
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} min={0} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Detalhes do acordo..." rows={3} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_active} onCheckedChange={checked => setFormData({ ...formData, is_active: checked })} />
                <Label>Ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
              <Button onClick={handleSave} disabled={!formData.client_name || !formData.client_email || !formData.checkout_url || saveMutation.isPending}>
                {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Link</AlertDialogTitle>
              <AlertDialogDescription>Tem certeza? Esta ação não pode ser desfeita.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)} className="bg-destructive hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
