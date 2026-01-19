import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useLeaseContracts } from '@/hooks/useLeaseContracts';
import { useWhatsAppSettings } from '@/hooks/useWhatsAppSettings';
import { Loader2, AlertTriangle, Phone, MessageSquare, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DEFAULT_MESSAGE_TEMPLATE } from '@/types/whatsapp';

export function WhatsAppSendPanel() {
  const { contracts, isLoading } = useLeaseContracts();
  const { settings, isLoading: isLoadingSettings } = useWhatsAppSettings();

  // Use saved template or default
  const messageTemplate = settings?.message_template || DEFAULT_MESSAGE_TEMPLATE;

  // Filter only active contracts with tenants that have phone numbers
  const validContracts = useMemo(() => {
    return contracts.filter(c => 
      c.status === 'active' && 
      c.tenant?.phone
    );
  }, [contracts]);

  // Generate wa.me link for a contract
  const generateWhatsAppLink = (contract: typeof validContracts[0]) => {
    const dueDay = contract.payment_due_day || 5;
    const now = new Date();
    const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);
    if (dueDate < now) {
      dueDate.setMonth(dueDate.getMonth() + 1);
    }

    const message = messageTemplate
      .replace(/{tenant_name}/g, contract.tenant?.name || 'Inquilino')
      .replace(/{property_name}/g, contract.property?.name || 'Imóvel')
      .replace(/{due_date}/g, format(dueDate, "dd 'de' MMMM", { locale: ptBR }))
      .replace(/{rent_value}/g, new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.monthly_rent));

    // Clean phone number (remove non-numeric chars)
    const phone = contract.tenant?.phone?.replace(/\D/g, '') || '';
    // Add Brazil country code if not present
    const fullPhone = phone.startsWith('55') ? phone : `55${phone}`;
    
    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
  };

  if (isLoading || isLoadingSettings) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (validContracts.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Nenhum contrato ativo com inquilino que tenha telefone cadastrado.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert className="border-primary/20 bg-primary/5">
        <MessageSquare className="h-4 w-4 text-primary" />
        <AlertDescription>
          Clique no botão de cada contrato para abrir o WhatsApp com a mensagem pronta.
          Futuramente você poderá configurar envio automático.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {validContracts.map((contract) => {
          const dueDay = contract.payment_due_day || 5;
          const now = new Date();
          const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);
          if (dueDate < now) {
            dueDate.setMonth(dueDate.getMonth() + 1);
          }

          return (
            <Card key={contract.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  {contract.tenant?.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {contract.property?.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 flex-1 flex flex-col">
                <div className="space-y-2 text-sm flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Telefone</span>
                    <span className="font-mono text-xs">{contract.tenant?.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Aluguel</span>
                    <Badge variant="secondary">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.monthly_rent)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Vencimento</span>
                    <span>{format(dueDate, "dd/MM", { locale: ptBR })}</span>
                  </div>
                </div>

                <Button
                  asChild
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <a
                    href={generateWhatsAppLink(contract)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Enviar Cobrança
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
