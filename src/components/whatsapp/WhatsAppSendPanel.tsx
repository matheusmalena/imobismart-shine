import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useLeaseContracts } from '@/hooks/useLeaseContracts';
import { useWhatsAppSettings } from '@/hooks/useWhatsAppSettings';
import { useWhatsAppMessages } from '@/hooks/useWhatsAppMessages';
import { Send, Loader2, AlertTriangle, CheckCircle2, Phone } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function WhatsAppSendPanel() {
  const { settings } = useWhatsAppSettings();
  const { contracts, isLoading: contractsLoading } = useLeaseContracts();
  const { sendMessage } = useWhatsAppMessages();
  
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');

  // Filter only active contracts with tenants that have phone numbers
  const validContracts = useMemo(() => {
    return contracts.filter(c => 
      c.status === 'active' && 
      c.tenant?.phone
    );
  }, [contracts]);

  const selectedContract = validContracts.find(c => c.id === selectedContractId);

  // Generate message preview
  const messagePreview = useMemo(() => {
    if (!selectedContract || !settings?.message_template) return '';

    const template = customMessage || settings.message_template;
    const dueDay = selectedContract.payment_due_day || 5;
    const now = new Date();
    const dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);
    if (dueDate < now) {
      dueDate.setMonth(dueDate.getMonth() + 1);
    }

    return template
      .replace(/{tenant_name}/g, selectedContract.tenant?.name || 'Inquilino')
      .replace(/{property_name}/g, selectedContract.property?.name || 'Imóvel')
      .replace(/{due_date}/g, format(dueDate, "dd 'de' MMMM", { locale: ptBR }))
      .replace(/{rent_value}/g, new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedContract.monthly_rent));
  }, [selectedContract, settings?.message_template, customMessage]);

  const handleSend = () => {
    if (!selectedContract?.tenant?.phone) return;

    sendMessage.mutate({
      tenantId: selectedContract.tenant_id,
      propertyId: selectedContract.property_id,
      contractId: selectedContract.id,
      phoneNumber: selectedContract.tenant.phone,
      message: messagePreview,
    });
  };

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

  if (!settings?.evolution_api_url || !settings?.evolution_api_key) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Configure a Evolution API nas configurações antes de enviar mensagens.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Send Form */}
      <Card>
        <CardHeader>
          <CardTitle>Enviar Mensagem</CardTitle>
          <CardDescription>
            Selecione um contrato ativo para enviar lembrete de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Contrato</Label>
            <Select value={selectedContractId} onValueChange={setSelectedContractId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um contrato" />
              </SelectTrigger>
              <SelectContent>
                {validContracts.map((contract) => (
                  <SelectItem key={contract.id} value={contract.id}>
                    <div className="flex items-center gap-2">
                      <span>{contract.tenant?.name}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="text-muted-foreground">{contract.property?.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedContract && (
            <>
              {/* Contract Details */}
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Inquilino</span>
                  <span className="font-medium">{selectedContract.tenant?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Telefone</span>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{selectedContract.tenant?.phone}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Imóvel</span>
                  <span className="font-medium">{selectedContract.property?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Aluguel</span>
                  <Badge variant="secondary">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedContract.monthly_rent)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Vencimento</span>
                  <span className="font-medium">Dia {selectedContract.payment_due_day || 5}</span>
                </div>
              </div>

              {/* Custom Message (optional) */}
              <div className="space-y-2">
                <Label>Mensagem personalizada (opcional)</Label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Deixe em branco para usar o modelo padrão"
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSend} 
                className="w-full"
                disabled={sendMessage.isPending}
              >
                {sendMessage.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enviar via WhatsApp
              </Button>
            </>
          )}

          {contractsLoading && (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!contractsLoading && validContracts.length === 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Nenhum contrato ativo com inquilino que tenha telefone cadastrado.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Message Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Pré-visualização
          </CardTitle>
          <CardDescription>
            Veja como a mensagem ficará no WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          {messagePreview ? (
            <div className="bg-[#dcf8c6] dark:bg-green-900/30 rounded-lg p-4 shadow-sm whitespace-pre-wrap">
              {messagePreview}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Selecione um contrato para ver a pré-visualização
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
