import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserRole } from '@/hooks/useUserRole';
import { PlanComparison } from '@/components/settings/PlanComparison';
import { TwoFactorSetup } from '@/components/settings/TwoFactorSetup';
import { ProfilePhotoUpload } from '@/components/settings/ProfilePhotoUpload';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User, Mail, Crown, Calendar, CreditCard, AlertTriangle, Shield, ArrowUpRight, Lock, Camera } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const PLAN_LABELS: Record<string, string> = {
  starter: 'Gratuito',
  pro: 'Pro',
  enterprise: 'Plus',
};

const PLAN_DESCRIPTIONS: Record<string, string> = {
  starter: 'Perfeito para começar. Até 2 imóveis.',
  pro: 'Para investidores sérios. Até 25 imóveis.',
  enterprise: 'Para grandes portfólios. Imóveis ilimitados.',
};

// Map database plan to UI plan for PlanComparison component
const mapPlanToUI = (plan: string): 'starter' | 'pro' | 'plus' => {
  if (plan === 'enterprise') return 'plus';
  return plan as 'starter' | 'pro' | 'plus';
};

// Map UI plan back to database plan
const mapPlanToDB = (plan: 'starter' | 'pro' | 'plus'): 'starter' | 'pro' | 'enterprise' => {
  if (plan === 'plus') return 'enterprise';
  return plan as 'starter' | 'pro' | 'enterprise';
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
  const { role, isAdmin, isLoading: roleLoading } = useUserRole();
  
  const [fullName, setFullName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);

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

  const handleSelectPlan = (plan: 'starter' | 'pro' | 'plus') => {
    const dbPlan = mapPlanToDB(plan);
    // In a real app, this would redirect to a payment flow
    toast.info(`Para alterar para o plano ${PLAN_LABELS[dbPlan]}, entre em contato com nosso suporte.`);
    setShowPlanDialog(false);
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

  // TEMPORÁRIO: Desabilitado para screenshots - usar dados mock
  const mockUser = user || { email: 'usuario@exemplo.com' };
  const mockProfile = profile || { full_name: 'João da Silva', created_at: '2024-06-15' };
  const mockSubscription = subscription || { 
    plan: 'pro' as const, 
    status: 'active' as const, 
    started_at: '2024-06-15',
    expires_at: '2025-06-15'
  };

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
            {/* Profile Photo */}
            <div className="space-y-2">
              <Label className="text-muted-foreground flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Foto de Perfil
              </Label>
              <ProfilePhotoUpload />
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <div className="px-3 py-2 bg-muted rounded-lg text-foreground">
                  {mockUser.email}
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
                    {mockProfile?.full_name || 'Não informado'}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Show account type only for admins */}
              {isAdmin && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Tipo de Conta
                  </Label>
                  <div className="px-3 py-2 bg-muted rounded-lg">
                    <Badge variant="outline" className="capitalize">
                      Administrador
                    </Badge>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Membro desde
                </Label>
                <div className="px-3 py-2 bg-muted rounded-lg text-foreground">
                  {mockProfile?.created_at 
                    ? format(new Date(mockProfile.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
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

        {/* Security Section - 2FA */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>Configure opções de segurança da sua conta</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <TwoFactorSetup />
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
            {mockSubscription ? (
              <>
                <div className="flex items-start justify-between p-4 bg-muted/50 rounded-xl border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <Crown className="h-5 w-5 text-primary" />
                      <span className="text-lg font-semibold">
                        Plano {PLAN_LABELS[mockSubscription.plan]}
                      </span>
                      <Badge className={STATUS_COLORS[mockSubscription.status]}>
                        {STATUS_LABELS[mockSubscription.status]}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {PLAN_DESCRIPTIONS[mockSubscription.plan]}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPlanDialog(true)}
                    className="flex items-center gap-1"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    Alterar Plano
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Início da Assinatura</Label>
                    <div className="px-3 py-2 bg-muted rounded-lg text-foreground">
                      {format(new Date(mockSubscription.started_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Próxima Renovação</Label>
                    <div className="px-3 py-2 bg-muted rounded-lg text-foreground">
                      {mockSubscription.expires_at 
                        ? format(new Date(mockSubscription.expires_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                        : 'Sem data de expiração'}
                    </div>
                  </div>
                </div>

                <Separator />

                {mockSubscription.status !== 'cancelled' && mockSubscription.plan !== 'starter' && (
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
                            funcionalidades premium do plano {PLAN_LABELS[mockSubscription.plan]}.
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

                {mockSubscription.status === 'cancelled' && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center justify-between">
                    <p className="text-sm text-destructive">
                      Sua assinatura foi cancelada.
                    </p>
                    <Button size="sm" onClick={() => setShowPlanDialog(true)}>
                      Reativar Plano
                    </Button>
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

        {/* Plan Comparison Dialog */}
        <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Escolha seu Plano</DialogTitle>
              <DialogDescription>
                Compare os planos e escolha o melhor para você
              </DialogDescription>
            </DialogHeader>
            <PlanComparison
              currentPlan={mapPlanToUI(mockSubscription?.plan || 'starter')}
              onSelectPlan={handleSelectPlan}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
