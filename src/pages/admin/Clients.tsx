import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminClients, ClientData } from '@/hooks/useAdminClients';
import { EditSubscriptionDialog } from '@/components/admin/EditSubscriptionDialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Building2, Crown, AlertCircle, Search, Filter, TrendingUp, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const PLAN_LABELS: Record<string, string> = {
  starter: 'Gratuito',
  pro: 'Pro',
  plus: 'Plus',
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
    case 'plus': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      (client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (client.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesPlan = planFilter === 'all' || client.plan === planFilter;
    const matchesStatus = statusFilter === 'all' || client.subscription_status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.subscription_status === 'active').length;
  const proClients = clients.filter(c => c.plan === 'pro' || c.plan === 'plus' || c.plan === 'enterprise').length;
  const totalProperties = clients.reduce((sum, c) => sum + c.properties_count, 0);
  const trialClients = clients.filter(c => c.subscription_status === 'trial').length;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Painel Admin</h1>
              <p className="text-muted-foreground text-sm">Gerencie clientes e assinaturas da plataforma</p>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card className="bg-card border-border/50">
            <CardContent className="p-4 sm:pt-6">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Clientes</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{totalClients}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-primary/10 shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardContent className="p-4 sm:pt-6">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Ativos</p>
                  <p className="text-xl sm:text-2xl font-bold text-success">{activeClients}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-success/10 shrink-0">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardContent className="p-4 sm:pt-6">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Em Trial</p>
                  <p className="text-xl sm:text-2xl font-bold text-warning">{trialClients}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-warning/10 shrink-0">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardContent className="p-4 sm:pt-6">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Pro/Plus</p>
                  <p className="text-xl sm:text-2xl font-bold text-info">{proClients}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-info/10 shrink-0">
                  <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:pt-6">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Imóveis</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{totalProperties}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-xl bg-accent shrink-0">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Planos</SelectItem>
                    <SelectItem value="starter">Gratuito</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="plus">Plus</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Clientes ({filteredClients.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {clientsLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-foreground mb-1">
                  {clients.length === 0 ? 'Nenhum cliente encontrado' : 'Nenhum resultado'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {clients.length === 0 
                    ? 'Os clientes aparecerão aqui quando se cadastrarem.'
                    : 'Tente ajustar os filtros de busca.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">Cliente</TableHead>
                      <TableHead className="font-semibold">Plano</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-center">Imóveis</TableHead>
                      <TableHead className="font-semibold hidden sm:table-cell">Criado em</TableHead>
                      <TableHead className="font-semibold text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id} className="group">
                        <TableCell>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[200px]">
                              {client.full_name || 'Sem nome'}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[200px]">
                              {client.email || 'Sem email'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("border text-xs", getPlanColor(client.plan))}>
                            {PLAN_LABELS[client.plan]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("border text-xs", getStatusColor(client.subscription_status))}>
                            {STATUS_LABELS[client.subscription_status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold text-foreground">{client.properties_count}</span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(client.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/clients/${client.user_id}`)}
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <EditSubscriptionDialog client={client} />
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
      </div>
    </DashboardLayout>
  );
}
