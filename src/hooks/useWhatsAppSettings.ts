import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { WhatsAppSettings, WhatsAppSettingsFormData, DEFAULT_MESSAGE_TEMPLATE } from '@/types/whatsapp';

export function useWhatsAppSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['whatsapp-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching WhatsApp settings:', error);
        throw error;
      }

      return data as WhatsAppSettings | null;
    },
    enabled: !!user?.id,
  });

  const saveSettings = useMutation({
    mutationFn: async (formData: WhatsAppSettingsFormData) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const settingsData = {
        user_id: user.id,
        is_enabled: formData.is_enabled,
        evolution_api_url: formData.evolution_api_url || null,
        evolution_api_key: formData.evolution_api_key || null,
        evolution_instance_name: formData.evolution_instance_name || null,
        days_before_due: formData.days_before_due,
        message_template: formData.message_template,
      };

      if (settings?.id) {
        // Update existing
        const { error } = await supabase
          .from('whatsapp_settings')
          .update(settingsData)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('whatsapp_settings')
          .insert(settingsData);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-settings'] });
      toast.success('Configurações salvas com sucesso!');
    },
    onError: (error) => {
      console.error('Error saving WhatsApp settings:', error);
      toast.error('Erro ao salvar configurações');
    },
  });

  const testConnection = useMutation({
    mutationFn: async () => {
      if (!settings?.evolution_api_url || !settings?.evolution_api_key) {
        throw new Error('Configure a URL e API Key primeiro');
      }

      // Call the edge function to test connection
      const { data, error } = await supabase.functions.invoke('whatsapp-send', {
        body: {
          action: 'test_connection',
          apiUrl: settings.evolution_api_url,
          apiKey: settings.evolution_api_key,
          instanceName: settings.evolution_instance_name,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Falha na conexão');

      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Conexão com Evolution API estabelecida!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao testar conexão');
    },
  });

  return {
    settings,
    isLoading,
    saveSettings,
    testConnection,
  };
}
