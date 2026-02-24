import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import {
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: 'Ativada', color: 'bg-green-500/10 text-green-600 border-green-200', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  trial: { label: 'Período de Teste', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: <Clock className="h-3.5 w-3.5" /> },
  inactive: { label: 'Inativa', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  cancelled: { label: 'Cancelada', color: 'bg-red-500/10 text-red-600 border-red-200', icon: <XCircle className="h-3.5 w-3.5" /> },
};

const PLAN_NAMES: Record<string, string> = {
  free: 'Gratuito',
  starter: 'Starter',
  pro: 'Pro',
  plus: 'Plus',
  enterprise: 'Enterprise',
};

export function PaymentHistory() {
  const { subscription } = useSubscription();

  const currentPlan = subscription?.plan || 'free';
  const currentStatus = subscription?.status || 'trial';
  const statusConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.trial;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Informações da Assinatura
        </CardTitle>
        <CardDescription>
          Detalhes do seu plano atual
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  Plano {PLAN_NAMES[currentPlan] || currentPlan}
                </span>
                <Badge variant="outline" className={`gap-1 text-xs ${statusConfig.color}`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {subscription?.started_at && (
                  <span>
                    Desde {format(new Date(subscription.started_at), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                  </span>
                )}
                {subscription?.updated_at && (
                  <>
                    <span>•</span>
                    <span>
                      Última atualização: {format(new Date(subscription.updated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            O histórico detalhado de pagamentos está disponível no painel da Kirvano.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
