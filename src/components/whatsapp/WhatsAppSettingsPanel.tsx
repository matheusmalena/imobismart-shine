import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DEFAULT_MESSAGE_TEMPLATE } from '@/types/whatsapp';
import { Info, RotateCcw, Construction } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function WhatsAppSettingsPanel() {
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_MESSAGE_TEMPLATE);

  const handleReset = () => {
    setMessageTemplate(DEFAULT_MESSAGE_TEMPLATE);
    toast.success('Modelo restaurado ao padrão');
  };

  return (
    <div className="space-y-6">
      {/* Coming Soon Alert */}
      <Alert className="border-amber-500/20 bg-amber-500/5">
        <Construction className="h-4 w-4 text-amber-600" />
        <AlertDescription>
          <strong>Em breve:</strong> Envio automático de lembretes via API. 
          Por enquanto, use os links do WhatsApp na aba "Enviar" para cobranças manuais.
        </AlertDescription>
      </Alert>

      {/* Message Template Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Modelo de Mensagem</CardTitle>
          <CardDescription>
            Visualize e personalize o modelo usado nas cobranças.
            Variáveis: {'{tenant_name}'}, {'{property_name}'}, {'{due_date}'}, {'{rent_value}'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.target.value)}
            rows={8}
            className="font-mono text-sm"
          />
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar padrão
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info about future features */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Funcionalidades planejadas:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Integração com APIs de WhatsApp (Evolution API, Z-API, etc.)</li>
            <li>Envio automático de lembretes X dias antes do vencimento</li>
            <li>Histórico de mensagens enviadas</li>
            <li>Agendamento de mensagens</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
