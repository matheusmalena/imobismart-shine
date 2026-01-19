import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWhatsAppSettings } from '@/hooks/useWhatsAppSettings';
import { DEFAULT_MESSAGE_TEMPLATE } from '@/types/whatsapp';
import { Save, TestTube2, Loader2, Info, ExternalLink, X, Plus } from 'lucide-react';

export function WhatsAppSettingsPanel() {
  const { settings, isLoading, saveSettings, testConnection } = useWhatsAppSettings();
  
  const [formData, setFormData] = useState({
    is_enabled: false,
    evolution_api_url: '',
    evolution_api_key: '',
    evolution_instance_name: '',
    days_before_due: [3, 1] as number[],
    message_template: DEFAULT_MESSAGE_TEMPLATE,
  });

  const [newDayValue, setNewDayValue] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData({
        is_enabled: settings.is_enabled,
        evolution_api_url: settings.evolution_api_url || '',
        evolution_api_key: settings.evolution_api_key || '',
        evolution_instance_name: settings.evolution_instance_name || '',
        days_before_due: settings.days_before_due || [3, 1],
        message_template: settings.message_template || DEFAULT_MESSAGE_TEMPLATE,
      });
    }
  }, [settings]);

  const handleSave = () => {
    saveSettings.mutate(formData);
  };

  const handleAddDay = () => {
    const day = parseInt(newDayValue);
    if (day > 0 && day <= 30 && !formData.days_before_due.includes(day)) {
      setFormData(prev => ({
        ...prev,
        days_before_due: [...prev.days_before_due, day].sort((a, b) => b - a),
      }));
      setNewDayValue('');
    }
  };

  const handleRemoveDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      days_before_due: prev.days_before_due.filter(d => d !== day),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            Para usar este recurso, você precisa de uma instância da Evolution API.
          </span>
          <a
            href="https://doc.evolution-api.com/pt/get-started/introduction"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline ml-2"
          >
            Documentação
            <ExternalLink className="h-3 w-3" />
          </a>
        </AlertDescription>
      </Alert>

      {/* Enable/Disable */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ativar Notificações</span>
            <Switch
              checked={formData.is_enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_enabled: checked }))}
            />
          </CardTitle>
          <CardDescription>
            Habilite para enviar lembretes automáticos de pagamento via WhatsApp
          </CardDescription>
        </CardHeader>
      </Card>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração da Evolution API</CardTitle>
          <CardDescription>
            Configure as credenciais da sua instância Evolution API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="api_url">URL da API</Label>
              <Input
                id="api_url"
                placeholder="https://sua-instancia.evolution-api.com"
                value={formData.evolution_api_url}
                onChange={(e) => setFormData(prev => ({ ...prev, evolution_api_url: e.target.value }))}
              />
              {formData.evolution_api_url && 
                (formData.evolution_api_url.toLowerCase().includes('localhost') || 
                 formData.evolution_api_url.includes('127.0.0.1') ||
                 formData.evolution_api_url.includes('0.0.0.0')) && (
                <p className="text-xs text-destructive">
                  ⚠️ URLs locais não funcionam. Use a URL pública da sua Evolution API.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="instance_name">Nome da Instância</Label>
              <Input
                id="instance_name"
                placeholder="minha-instancia"
                value={formData.evolution_instance_name}
                onChange={(e) => setFormData(prev => ({ ...prev, evolution_instance_name: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="api_key">API Key</Label>
            <Input
              id="api_key"
              type="password"
              placeholder="Sua chave de API"
              value={formData.evolution_api_key}
              onChange={(e) => setFormData(prev => ({ ...prev, evolution_api_key: e.target.value }))}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => testConnection.mutate()}
            disabled={testConnection.isPending || !formData.evolution_api_url || !formData.evolution_api_key}
          >
            {testConnection.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TestTube2 className="h-4 w-4 mr-2" />
            )}
            Testar Conexão
          </Button>
        </CardContent>
      </Card>

      {/* Schedule Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamento Automático</CardTitle>
          <CardDescription>
            Configure quantos dias antes do vencimento as mensagens devem ser enviadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {formData.days_before_due.map((day) => (
              <Badge key={day} variant="secondary" className="gap-1 px-3 py-1.5">
                {day} {day === 1 ? 'dia' : 'dias'} antes
                <button
                  onClick={() => handleRemoveDay(day)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              max="30"
              placeholder="Dias antes"
              value={newDayValue}
              onChange={(e) => setNewDayValue(e.target.value)}
              className="w-32"
            />
            <Button variant="outline" size="icon" onClick={handleAddDay}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Message Template */}
      <Card>
        <CardHeader>
          <CardTitle>Modelo de Mensagem</CardTitle>
          <CardDescription>
            Personalize a mensagem de lembrete. Use as variáveis: {'{tenant_name}'}, {'{property_name}'}, {'{due_date}'}, {'{rent_value}'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={formData.message_template}
            onChange={(e) => setFormData(prev => ({ ...prev, message_template: e.target.value }))}
            rows={8}
            className="font-mono text-sm"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFormData(prev => ({ ...prev, message_template: DEFAULT_MESSAGE_TEMPLATE }))}
          >
            Restaurar modelo padrão
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saveSettings.isPending}>
          {saveSettings.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
