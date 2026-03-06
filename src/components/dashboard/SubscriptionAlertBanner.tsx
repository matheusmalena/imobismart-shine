import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Subscription } from '@/hooks/useUserData';
import { differenceInDays, format } from 'date-fns';

interface SubscriptionAlertBannerProps {
  subscription: Subscription | null;
}

export function SubscriptionAlertBanner({ subscription }: SubscriptionAlertBannerProps) {
  const navigate = useNavigate();

  if (!subscription || subscription.plan === 'free') return null;

  const now = new Date();
  const expiresAt = subscription.expires_at ? new Date(subscription.expires_at) : null;
  const isCancelled = subscription.status === 'cancelled';
  const isInactive = subscription.status === 'inactive';
  const isPix = subscription.payment_method === 'pix';

  // Cancelled with grace period active
  if (isCancelled && expiresAt && expiresAt > now) {
    const daysLeft = differenceInDays(expiresAt, now);
    return (
      <Card className="border-2 border-warning bg-warning/5">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h4 className="font-semibold text-warning">Assinatura cancelada</h4>
                <p className="text-sm text-muted-foreground">
                  Seu plano permanece ativo até {format(expiresAt, 'dd/MM/yyyy')}.
                  {daysLeft <= 3
                    ? ` Faltam apenas ${daysLeft} dia${daysLeft !== 1 ? 's' : ''}!`
                    : ` Restam ${daysLeft} dias.`}
                </p>
              </div>
            </div>
            <Button size="sm" onClick={() => navigate('/plans')} className="gap-2 shrink-0">
              <CreditCard className="h-4 w-4" />
              Renovar Plano
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Inactive / payment failed
  if (isInactive) {
    return (
      <Card className="border-2 border-destructive bg-destructive/5">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h4 className="font-semibold text-destructive">Pagamento pendente</h4>
                <p className="text-sm text-muted-foreground">
                  Não identificamos o pagamento da sua assinatura. Regularize para manter o acesso ao seu plano.
                </p>
              </div>
            </div>
            <Button size="sm" variant="destructive" onClick={() => navigate('/subscription')} className="gap-2 shrink-0">
              <CreditCard className="h-4 w-4" />
              Regularizar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // PIX subscription nearing expiration (active but expires_at within 5 days)
  if (isPix && expiresAt && !isCancelled) {
    const daysUntilExpiry = differenceInDays(expiresAt, now);
    if (daysUntilExpiry <= 5 && daysUntilExpiry >= 0) {
      return (
        <Card className="border-2 border-warning bg-warning/5">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h4 className="font-semibold text-warning">Renovação via PIX próxima</h4>
                  <p className="text-sm text-muted-foreground">
                    Sua assinatura vence em {format(expiresAt, 'dd/MM/yyyy')}.
                    {daysUntilExpiry <= 1
                      ? ' Verifique se o pagamento foi realizado.'
                      : ` Faltam ${daysUntilExpiry} dias para a renovação.`}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate('/subscription')} className="gap-2 shrink-0">
                <CreditCard className="h-4 w-4" />
                Ver Assinatura
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }
  }

  return null;
}
