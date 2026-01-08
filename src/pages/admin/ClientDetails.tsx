import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  CreditCard, 
  Building2, 
  FileText, 
  Crown,
  Home,
  MapPin,
  DollarSign,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PLAN_LABELS = {
  starter: 'Gratuito',
  pro: 'Pro',
  enterprise: 'Plus',
};

const STATUS_LABELS = {
  active: 'Ativo',
  inactive: 'Inativo',
  cancelled: 'Cancelado',
  trial: 'Trial',
};

const PROPERTY_STATUS_LABELS: Record<string, string> = {
  alugado: 'Alugado',
  vago: 'Vago',
  em_reforma: 'Em Reforma',
  a_venda: 'À Venda',
};

const DOCUMENT_CATEGORY_LABELS: Record<string, string> = {
  matricula: 'Matrícula',
  iptu: 'IPTU',
  contrato: 'Contrato',
  laudo: 'Laudo',
  outro: 'Outro',
};

export default function ClientDetails() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { isAdmin, isLoading: roleLoading } = useUserRole();

  // Fetch client profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['admin-client-profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: isAdmin && !!userId,
  });

  // Fetch client role
  const { data: userRole } = useQuery({
    queryKey: ['admin-client-role', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: isAdmin && !!userId,
  });

  // Fetch client subscription
  const { data: subscription } = useQuery({
    queryKey: ['admin-client-subscription', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: isAdmin && !!userId,
  });

  // Fetch client properties
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['admin-client-properties', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin && !!userId,
  });

  // Fetch client documents
  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['admin-client-documents', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*, properties(name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin && !!userId,
  });

  if (roleLoading || profileLoading) {
    return (
      <DashboardLayout>
        <PageTransition>
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-6 md:grid-cols-3">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </PageTransition>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <PageTransition>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Acesso não autorizado</p>
          </div>
        </PageTransition>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <PageTransition>
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-muted-foreground">Cliente não encontrado</p>
            <Button onClick={() => navigate('/admin/clients')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        </PageTransition>
      </DashboardLayout>
    );
  }

  const totalRevenue = properties.reduce((sum, p) => sum + (Number(p.monthly_revenue) || 0), 0);
  const totalValue = properties.reduce((sum, p) => sum + (Number(p.property_value) || 0), 0);

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/admin/clients')} variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{profile.full_name || 'Sem nome'}</h1>
              <p className="text-muted-foreground">{profile.email}</p>
            </div>
            {userRole?.role === 'admin' && (
              <Badge className="bg-primary/20 text-primary border-primary/30">
                <Crown className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-semibold capitalize">{userRole?.role || 'user'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Plano</p>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {PLAN_LABELS[subscription?.plan as keyof typeof PLAN_LABELS] || 'Starter'}
                      </p>
                      <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'}>
                        {STATUS_LABELS[subscription?.status as keyof typeof STATUS_LABELS] || 'Trial'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Imóveis</p>
                    <p className="font-semibold">{properties.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cadastrado em</p>
                    <p className="font-semibold">
                      {format(new Date(profile.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Valor Total em Imóveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Receita Mensal Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Documentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{documents.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs with Properties and Documents */}
          <Tabs defaultValue="properties" className="w-full">
            <TabsList>
              <TabsTrigger value="properties" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Imóveis ({properties.length})
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documentos ({documents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {propertiesLoading ? (
                    <div className="p-6">
                      <Skeleton className="h-32" />
                    </div>
                  ) : properties.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum imóvel cadastrado</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Endereço</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Receita Mensal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {properties.map((property) => (
                          <TableRow key={property.id}>
                            <TableCell className="font-medium">{property.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {property.address_city || 'N/A'}, {property.address_state || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {PROPERTY_STATUS_LABELS[property.status] || property.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {Number(property.property_value || 0).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })}
                            </TableCell>
                            <TableCell className="text-green-600 font-medium">
                              {Number(property.monthly_revenue || 0).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {documentsLoading ? (
                    <div className="p-6">
                      <Skeleton className="h-32" />
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum documento cadastrado</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Imóvel</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((doc: any) => (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium">{doc.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {DOCUMENT_CATEGORY_LABELS[doc.category] || doc.category}
                              </Badge>
                            </TableCell>
                            <TableCell>{doc.properties?.name || 'N/A'}</TableCell>
                            <TableCell>
                              {format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(doc.file_url, '_blank')}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
