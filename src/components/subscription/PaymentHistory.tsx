import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

interface Payment {
  id: string;
  status: string;
  status_detail: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  payment_method: string;
  payment_type: string;
}

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  approved: { label: 'Aprovado', color: 'bg-green-500/10 text-green-600 border-green-200', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  pending: { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200', icon: <Clock className="h-3.5 w-3.5" /> },
  in_process: { label: 'Em processamento', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: <Clock className="h-3.5 w-3.5" /> },
  rejected: { label: 'Rejeitado', color: 'bg-red-500/10 text-red-600 border-red-200', icon: <XCircle className="h-3.5 w-3.5" /> },
  cancelled: { label: 'Cancelado', color: 'bg-gray-500/10 text-gray-600 border-gray-200', icon: <XCircle className="h-3.5 w-3.5" /> },
  refunded: { label: 'Reembolsado', color: 'bg-purple-500/10 text-purple-600 border-purple-200', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  pix: 'Pix',
  bolbradesco: 'Boleto',
  account_money: 'Saldo MP',
};

export function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-mp-payments');
      
      if (fnError) {
        throw new Error(fnError.message);
      }
      
      setPayments(data?.payments || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar histórico');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const formatCurrency = (amount: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Histórico de Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Histórico de Pagamentos
            </CardTitle>
            <CardDescription>
              Últimas transações da sua assinatura
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchPayments} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-4 rounded-full bg-destructive/10 mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchPayments}>
              Tentar novamente
            </Button>
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Receipt className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-2">Nenhum pagamento encontrado</h3>
            <p className="text-sm text-muted-foreground">
              O histórico de pagamentos aparecerá aqui após sua primeira transação.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {payments.map((payment) => {
                const statusConfig = PAYMENT_STATUS_CONFIG[payment.status] || PAYMENT_STATUS_CONFIG.pending;
                
                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {formatCurrency(payment.amount, payment.currency)}
                        </span>
                        <Badge variant="outline" className={`gap-1 text-xs ${statusConfig.color}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {format(new Date(payment.date), "dd 'de' MMM 'de' yyyy, HH:mm", { locale: ptBR })}
                        </span>
                        <span>•</span>
                        <span>
                          {PAYMENT_METHOD_LABELS[payment.payment_method] || payment.payment_method}
                        </span>
                      </div>
                      {payment.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                          {payment.description}
                        </p>
                      )}
                    </div>
                    <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      #{payment.id.toString().slice(-6)}
                    </code>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
