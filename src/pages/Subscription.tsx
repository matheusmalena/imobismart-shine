import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserData } from '@/hooks/useUserData';
import { usePropertyLimit } from '@/hooks/usePropertyLimit';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PaymentHistory } from '@/components/subscription/PaymentHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CreditCard,
  Calendar,
  Crown,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Clock,
  Loader2,
  Sparkles,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PLAN_NAMES: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  plus: 'Plus',
  enterprise: 'Enterprise',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: 'Ativa', color: 'bg-green-500/10 text-green-600 border-green-200', icon: <CheckCircle className="h-4 w-4" /> },
  trial: { label: 'Período de Teste', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: <Clock className="h-4 w-4" /> },
  inactive: { label: 'Inativa', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200', icon: <AlertTriangle className="h-4 w-4" /> },
  cancelled: { label: 'Cancelada', color: 'bg-red-500/10 text-red-600 border-red-200', icon: <XCircle className="h-4 w-4" /> },
};

export default function Subscription() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { subscription, isLoading: subscriptionLoading, refetch } = useSubscription();
  const { profile } = useUserData();
  const { activeCount, limit, excessCount, estimatedExtraCost, isUnlimited } = usePropertyLimit();
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  const isLoading = authLoading || subscriptionLoading;

  if (!authLoading && !user) {
    navigate('/auth');
    return null;
  }

  const handleCheckSubscription = async () => {
    setIsOpeningPortal(true);
    try {
      await supabase.functions.invoke('check-subscription');
      refetch();
      toast.success('Status da assinatura atualizado');
    } catch (error) {
      console.error('Check subscription error:', error);
      toast.error('Erro ao verificar assinatura');
    } finally {
      setIsOpeningPortal(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 md:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
        </div>
      </DashboardLayout>
    );
  }

  const currentPlan = subscription?.plan || 'free';
  const currentStatus = subscription?.status || 'trial';
  const statusConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.inactive;
  const isPaid = currentPlan !== 'free';

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Minha Assinatura</h1>
            <p className="text-muted-foreground mt-1">Gerencie seu plano e pagamentos</p>
          </div>
          <Button onClick={() => navigate('/plans')} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Ver Planos
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Plan Card */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Plano Atual
              </CardTitle>
              <CardDescription>Detalhes da sua assinatura atual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plano</span>
                <span className="text-lg font-semibold text-foreground">{PLAN_NAMES[currentPlan] || currentPlan}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className={`gap-1.5 ${statusConfig.color}`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </Badge>
              </div>
              {subscription?.started_at && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Início</span>
                  <span className="text-foreground">{format(new Date(subscription.started_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                </div>
              )}
              {subscription?.expires_at && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Próxima cobrança</span>
                  <span className="text-foreground">{format(new Date(subscription.expires_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                </div>
              )}

              <div className="pt-4 border-t space-y-3">
              {isPaid && (
                  <Button variant="outline" className="w-full gap-2" onClick={handleCheckSubscription} disabled={isOpeningPortal}>
                    {isOpeningPortal ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    Verificar Status
                  </Button>
                )}
                {currentPlan === 'free' && currentStatus !== 'cancelled' && (
                  <Button onClick={() => navigate('/plans')} className="w-full gap-2">
                    <Crown className="h-4 w-4" />
                    Fazer Upgrade
                  </Button>
                )}
                {currentStatus === 'cancelled' && (
                  <Button onClick={() => navigate('/plans')} className="w-full gap-2">
                    <Sparkles className="h-4 w-4" />
                    Reativar Assinatura
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Usage Card */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Uso de Imóveis
              </CardTitle>
              <CardDescription>Seu consumo atual de imóveis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Limite do plano</span>
                <span className="text-foreground font-semibold">{isUnlimited ? 'Ilimitado' : limit}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Imóveis ativos</span>
                <span className="text-foreground font-semibold">{activeCount}</span>
              </div>
              {excessCount > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Imóveis excedentes</span>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
                      +{excessCount}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Custo extra estimado</span>
                    <span className="text-foreground font-semibold">
                      R$ {estimatedExtraCost.toFixed(2).replace('.', ',')}/mês
                    </span>
                  </div>
                </>
              )}

              {!isUnlimited && (
                <div className="pt-4 border-t">
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        excessCount > 0 ? 'bg-amber-500' : activeCount >= limit ? 'bg-amber-500' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(100, (activeCount / limit) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {activeCount}/{limit} imóveis
                    {excessCount > 0 && ` (+${excessCount} extras)`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <PaymentHistory />

        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-start gap-4 py-4">
            <div className="p-2 rounded-full bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-1">Sobre renovações</h4>
              <p className="text-sm text-muted-foreground">
                Sua assinatura é renovada automaticamente a cada mês. Imóveis excedentes são cobrados na próxima fatura. Pagamentos via PIX, Boleto ou Cartão.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
