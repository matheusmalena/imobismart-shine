import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminClients, ClientData } from '@/hooks/useAdminClients';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Building2, Crown, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  cancelled: 'Cancelado',
  trial: 'Trial',
};

function getPlanColor(plan: string) {
  switch (plan) {
    case 'enterprise': return 'bg-primary/10 text-primary border-primary/20';
    case 'pro': return 'bg-info/10 text-info border-info/20';
    default: return 'bg-muted text-muted-foreground';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'active': return 'bg-success/10 text-success border-success/20';
    case 'trial': return 'bg-warning/10 text-warning border-warning/20';
    case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
    default: return 'bg-muted text-muted-foreground';
  }
}

export default function AdminClients() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { clients, isLoading: clientsLoading } = useAdminClients();

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, roleLoading, navigate]);

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

  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.subscription_status === 'active').length;
  const proClients = clients.filter(c => c.plan === 'pro' || c.plan === 'enterprise').length;
  const totalProperties = clients.reduce((sum, c) => sum + c.properties_count, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Painel Admin</h1>
            <p className="text-muted-foreground">Gerencie clientes e assinaturas</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Clientes</p>
                  <p className="text-2xl font-bold text-foreground">{totalClients}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Assinaturas Ativas</p>
                  <p className="text-2xl font-bold text-success">{activeClients}</p>
                </div>
                <div className="p-3 rounded-xl bg-success/10">
                  <Users className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Clientes Pro/Enterprise</p>
                  <p className="text-2xl font-bold text-info">{proClients}</p>
                </div>
                <div className="p-3 rounded-xl bg-info/10">
                  <Crown className="h-5 w-5 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Imóveis</p>
                  <p className="text-2xl font-bold text-foreground">{totalProperties}</p>
                </div>
                <div className="p-3 rounded-xl bg-accent/10">
                  <Building2 className="h-5 w-5 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {clientsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : clients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-foreground mb-1">Nenhum cliente encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  Os clientes aparecerão aqui quando se cadastrarem.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Imóveis</TableHead>
                      <TableHead>Criado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">
                              {client.full_name || 'Sem nome'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {client.email || 'Sem email'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("border", getPlanColor(client.plan))}>
                            {PLAN_LABELS[client.plan]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("border", getStatusColor(client.subscription_status))}>
                            {STATUS_LABELS[client.subscription_status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{client.properties_count}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {format(new Date(client.created_at), "dd MMM yyyy", { locale: ptBR })}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
