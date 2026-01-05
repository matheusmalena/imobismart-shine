import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { User, Mail, Crown, Calendar, CreditCard, AlertTriangle, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const PLAN_DESCRIPTIONS: Record<string, string> = {
  starter: 'Ideal para quem está começando. Até 5 imóveis.',
  pro: 'Para investidores em crescimento. Até 20 imóveis.',
  enterprise: 'Para grandes carteiras. Imóveis ilimitados.',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativa',
  inactive: 'Inativa',
  cancelled: 'Cancelada',
  trial: 'Período de Teste',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/10 text-green-600 border-green-500/20',
  inactive: 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  trial: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
};

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const { subscription, isLoading: subscriptionLoading, cancelSubscription } = useSubscription();
  const { role, isLoading: roleLoading } = useUserRole();
  
  const [fullName, setFullName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const isLoading = authLoading || profileLoading || subscriptionLoading || roleLoading;

  const handleSaveProfile = async () => {
    await updateProfile.mutateAsync({ full_name: fullName });
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setFullName(profile?.full_name || '');
    setIsEditing(true);
  };

  const handleCancelSubscription = async () => {
    await cancelSubscription.mutateAsync();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-4xl">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas informações pessoais e assinatura
          </p>
        </div>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Seus dados de perfil na plataforma</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <div className="px-3 py-2 bg-muted rounded-lg text-foreground">
                  {user.email}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome Completo
                </Label>
                {isEditing ? (
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                ) : (
                  <div className="px-3 py-2 bg-muted rounded-lg text-foreground">
                    {profile?.full_name || 'Não informado'}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Tipo de Conta
                </Label>
                <div className="px-3 py-2 bg-muted rounded-lg">
                  <Badge variant="outline" className="capitalize">
                    {role === 'admin' ? 'Administrador' : 'Usuário'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Membro desde
                </Label>
                <div className="px-3 py-2 bg-muted rounded-lg text-foreground">
                  {profile?.created_at 
                    ? format(new Date(profile.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                    : 'Não disponível'}
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end gap-3">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </>
              ) : (
                <Button onClick={handleStartEdit}>
                  Editar Perfil
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Assinatura</CardTitle>
                <CardDescription>Detalhes do seu plano atual</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {subscription ? (
              <>
                <div className="flex items-start justify-between p-4 bg-muted/50 rounded-xl border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <Crown className="h-5 w-5 text-primary" />
                      <span className="text-lg font-semibold">
                        Plano {PLAN_LABELS[subscription.plan]}
                      </span>
                      <Badge className={STATUS_COLORS[subscription.status]}>
                        {STATUS_LABELS[subscription.status]}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {PLAN_DESCRIPTIONS[subscription.plan]}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Início da Assinatura</Label>
                    <div className="px-3 py-2 bg-muted rounded-lg text-foreground">
                      {format(new Date(subscription.started_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Próxima Renovação</Label>
                    <div className="px-3 py-2 bg-muted rounded-lg text-foreground">
                      {subscription.expires_at 
                        ? format(new Date(subscription.expires_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                        : 'Sem data de expiração'}
                    </div>
                  </div>
                </div>

                <Separator />

                {subscription.status !== 'cancelled' && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Ao cancelar, você perderá acesso às funcionalidades do plano</span>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="text-destructive hover:text-destructive">
                          Cancelar Assinatura
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancelar Assinatura</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja cancelar sua assinatura? Você perderá acesso às 
                            funcionalidades premium do plano {PLAN_LABELS[subscription.plan]}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Voltar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleCancelSubscription}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Confirmar Cancelamento
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}

                {subscription.status === 'cancelled' && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">
                      Sua assinatura foi cancelada. Entre em contato para reativar.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma assinatura encontrada.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
