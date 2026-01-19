import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { WhatsAppMessage, WhatsAppScheduled } from '@/types/whatsapp';

export function useWhatsAppMessages(filters?: { tenantId?: string; propertyId?: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['whatsapp-messages', user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('whatsapp_messages')
        .select(`
          *,
          tenant:tenants(id, name, phone),
          property:properties(id, name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filters?.tenantId) {
        query = query.eq('tenant_id', filters.tenantId);
      }
      if (filters?.propertyId) {
        query = query.eq('property_id', filters.propertyId);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Error fetching WhatsApp messages:', error);
        throw error;
      }

      return data as WhatsAppMessage[];
    },
    enabled: !!user?.id,
  });

  const { data: scheduledMessages = [], isLoading: scheduledLoading } = useQuery({
    queryKey: ['whatsapp-scheduled', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('whatsapp_scheduled')
        .select(`
          *,
          contract:lease_contracts(
            id,
            monthly_rent,
            payment_due_day,
            tenant:tenants(id, name, phone),
            property:properties(id, name)
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('scheduled_date', { ascending: true });

      if (error) {
        console.error('Error fetching scheduled messages:', error);
        throw error;
      }

      return data as WhatsAppScheduled[];
    },
    enabled: !!user?.id,
  });

  const sendMessage = useMutation({
    mutationFn: async ({
      tenantId,
      propertyId,
      contractId,
      phoneNumber,
      message,
    }: {
      tenantId: string;
      propertyId: string;
      contractId?: string;
      phoneNumber: string;
      message: string;
    }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Call edge function to send message
      const { data, error } = await supabase.functions.invoke('whatsapp-send', {
        body: {
          action: 'send_message',
          tenantId,
          propertyId,
          contractId,
          phoneNumber,
          message,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Falha ao enviar mensagem');

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages'] });
      toast.success('Mensagem enviada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error sending WhatsApp message:', error);
      toast.error(error.message || 'Erro ao enviar mensagem');
    },
  });

  const cancelScheduled = useMutation({
    mutationFn: async (scheduledId: string) => {
      const { error } = await supabase
        .from('whatsapp_scheduled')
        .update({ status: 'cancelled' })
        .eq('id', scheduledId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-scheduled'] });
      toast.success('Agendamento cancelado');
    },
    onError: (error) => {
      console.error('Error cancelling scheduled message:', error);
      toast.error('Erro ao cancelar agendamento');
    },
  });

  return {
    messages,
    scheduledMessages,
    isLoading: messagesLoading || scheduledLoading,
    sendMessage,
    cancelScheduled,
  };
}
