import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DEFAULT_MESSAGE_TEMPLATE } from '@/types/whatsapp';
import { Info, RotateCcw, Save, Loader2, Construction } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useWhatsAppSettings } from '@/hooks/useWhatsAppSettings';

export function WhatsAppSettingsPanel() {
  const { settings, isLoading, saveSettings } = useWhatsAppSettings();
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_MESSAGE_TEMPLATE);
  const [hasChanges, setHasChanges] = useState(false);

  // Load saved template when settings are fetched
  useEffect(() => {
    if (settings?.message_template) {
      setMessageTemplate(settings.message_template);
    }
  }, [settings]);

  // Track changes
  useEffect(() => {
    const savedTemplate = settings?.message_template || DEFAULT_MESSAGE_TEMPLATE;
    setHasChanges(messageTemplate !== savedTemplate);
  }, [messageTemplate, settings]);

  const handleReset = () => {
    setMessageTemplate(DEFAULT_MESSAGE_TEMPLATE);
  };

  const handleSave = () => {
    saveSettings.mutate({
      is_enabled: settings?.is_enabled || false,
      evolution_api_url: '',
      evolution_api_key: '',
      evolution_instance_name: '',
      days_before_due: settings?.days_before_due || [3, 1, 0],
      message_template: messageTemplate,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

      {/* Message Template */}
      <Card>
        <CardHeader>
          <CardTitle>Modelo de Mensagem</CardTitle>
          <CardDescription>
            Personalize o modelo usado nas cobranças via WhatsApp.
            <br />
            <span className="text-xs font-mono mt-1 block text-muted-foreground">
              Variáveis: {'{tenant_name}'}, {'{property_name}'}, {'{due_date}'}, {'{rent_value}'}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.target.value)}
            rows={8}
            className="font-mono text-sm"
            placeholder="Digite seu modelo de mensagem..."
          />
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar padrão
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saveSettings.isPending}
              size="sm"
            >
              {saveSettings.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar modelo
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
