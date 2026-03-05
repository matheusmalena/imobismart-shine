import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSubscription } from '@/hooks/useSubscription';
import { usePaymentHistory } from '@/hooks/usePaymentHistory';
import {
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
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

const EVENT_LABELS: Record<string, string> = {
  purchase_approved: 'Ativação',
  PURCHASE_APPROVED: 'Ativação',
  subscription_active: 'Ativação',
  SUBSCRIPTION_ACTIVE: 'Ativação',
  payment_approved: 'Pagamento',
  PAYMENT_APPROVED: 'Pagamento',
  subscription_cancelled: 'Cancelamento',
  SUBSCRIPTION_CANCELLED: 'Cancelamento',
  purchase_refunded: 'Reembolso',
  PURCHASE_REFUNDED: 'Reembolso',
  purchase_chargeback: 'Chargeback',
  PURCHASE_CHARGEBACK: 'Chargeback',
};

const HISTORY_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  approved: { label: 'Aprovado', color: 'bg-green-500/10 text-green-600 border-green-200' },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/10 text-red-600 border-red-200' },
  refunded: { label: 'Reembolsado', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
  chargeback: { label: 'Chargeback', color: 'bg-red-500/10 text-red-600 border-red-200' },
};

export function PaymentHistory() {
  const { subscription } = useSubscription();
  const { data: history, isLoading: historyLoading } = usePaymentHistory();

  const currentPlan = subscription?.plan || 'free';
  const currentStatus = subscription?.status || 'trial';
  const statusConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.trial;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Receipt className="h-5 w-5 text-primary" />
        </div>
        <div>
          <CardTitle className="text-base">Informações da Assinatura</CardTitle>
          <CardDescription>Detalhes do seu plano atual e histórico de pagamentos</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current plan info */}
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

          {/* Payment history table */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Histórico de Pagamentos</h4>
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (() => {
              const ACTIVATION_EVENTS = ['purchase_approved', 'PURCHASE_APPROVED', 'subscription_active', 'SUBSCRIPTION_ACTIVE'];
              const filtered = history?.filter(e => ACTIVATION_EVENTS.includes(e.event)) || [];
              return filtered.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                   <TableBody>
                    {filtered.map((entry) => {
                      const eventLabel = EVENT_LABELS[entry.event] || entry.event;
                      const statusCfg = HISTORY_STATUS_CONFIG[entry.status] || { label: entry.status, color: 'bg-muted text-muted-foreground' };
                      return (
                        <TableRow key={entry.id}>
                          <TableCell className="text-sm">
                            {format(new Date(entry.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-sm font-medium">{eventLabel}</TableCell>
                          <TableCell className="text-sm">
                            {entry.plan ? (PLAN_NAMES[entry.plan] || entry.plan) : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${statusCfg.color}`}>
                              {statusCfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-right">
                            {entry.amount > 0
                              ? `R$ ${Number(entry.amount).toFixed(2).replace('.', ',')}`
                              : '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhum registro de pagamento encontrado.
              </p>
            );
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
