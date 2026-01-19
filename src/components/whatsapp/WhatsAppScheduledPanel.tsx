import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWhatsAppMessages } from '@/hooks/useWhatsAppMessages';
import { useWhatsAppSettings } from '@/hooks/useWhatsAppSettings';
import { Calendar, Loader2, X, Clock, Home, User, AlertTriangle } from 'lucide-react';
import { format, differenceInDays, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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

export function WhatsAppScheduledPanel() {
  const { settings } = useWhatsAppSettings();
  const { scheduledMessages, isLoading, cancelScheduled } = useWhatsAppMessages();

  if (!settings?.is_enabled) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          As notificações via WhatsApp estão desativadas. Vá em Configurações para ativá-las.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getScheduleStatus = (date: string) => {
    const scheduledDate = new Date(date);
    if (isPast(scheduledDate) && !isToday(scheduledDate)) {
      return { label: 'Atrasado', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
    }
    if (isToday(scheduledDate)) {
      return { label: 'Hoje', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
    }
    const daysUntil = differenceInDays(scheduledDate, new Date());
    if (daysUntil <= 3) {
      return { label: `Em ${daysUntil} dias`, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
    }
    return { label: format(scheduledDate, "dd/MM", { locale: ptBR }), color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' };
  };

  return (
    <div className="space-y-6">
      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Mensagens Agendadas
          </CardTitle>
          <CardDescription>
            Mensagens que serão enviadas automaticamente {settings.days_before_due?.length > 0 && (
              <>({settings.days_before_due.join(', ')} dias antes do vencimento)</>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Scheduled Messages */}
      {scheduledMessages.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data de Envio</TableHead>
                  <TableHead>Inquilino</TableHead>
                  <TableHead>Imóvel</TableHead>
                  <TableHead>Aluguel</TableHead>
                  <TableHead>Dias antes</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledMessages.map((scheduled) => {
                  const status = getScheduleStatus(scheduled.scheduled_date);
                  return (
                    <TableRow key={scheduled.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(scheduled.scheduled_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                          <Badge className={status.color}>{status.label}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {scheduled.contract?.tenant?.name || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          {scheduled.contract?.property?.name || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {scheduled.contract?.monthly_rent && (
                          <Badge variant="secondary">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(scheduled.contract.monthly_rent)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {scheduled.days_before_due} {scheduled.days_before_due === 1 ? 'dia' : 'dias'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <X className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancelar agendamento</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja cancelar este agendamento? A mensagem não será enviada automaticamente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Manter</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => cancelScheduled.mutate(scheduled.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Cancelar agendamento
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhum agendamento pendente</h3>
            <p className="text-muted-foreground max-w-md">
              As mensagens serão agendadas automaticamente com base nos contratos ativos e nas configurações de dias antes do vencimento.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
