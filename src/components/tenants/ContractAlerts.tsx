import { LeaseContract } from '@/types/tenant';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Clock } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ContractAlertsProps {
  expiringContracts: LeaseContract[];
  expiredContracts: LeaseContract[];
}

export function ContractAlerts({ expiringContracts, expiredContracts }: ContractAlertsProps) {
  if (expiringContracts.length === 0 && expiredContracts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {expiredContracts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Contratos Vencidos</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1">
              {expiredContracts.map((contract) => (
                <li key={contract.id} className="text-sm">
                  <strong>{contract.tenant?.name}</strong> - {contract.property?.name}
                  {' '}(venceu em {format(new Date(contract.end_date), "dd/MM/yyyy", { locale: ptBR })})
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {expiringContracts.length > 0 && (
        <Alert className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-900/10">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-400">
            Contratos Próximos do Vencimento
          </AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300/80">
            <ul className="mt-2 space-y-1">
              {expiringContracts.map((contract) => {
                const daysLeft = differenceInDays(new Date(contract.end_date), new Date());
                return (
                  <li key={contract.id} className="text-sm">
                    <strong>{contract.tenant?.name}</strong> - {contract.property?.name}
                    {' '}({daysLeft} {daysLeft === 1 ? 'dia restante' : 'dias restantes'})
                  </li>
                );
              })}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
