export interface WhatsAppSettings {
  id: string;
  user_id: string;
  organization_id: string | null;
  is_enabled: boolean;
  evolution_api_url: string | null;
  evolution_api_key: string | null;
  evolution_api_key_encrypted: string | null;
  evolution_instance_name: string | null;
  days_before_due: number[];
  message_template: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessage {
  id: string;
  user_id: string;
  organization_id: string | null;
  tenant_id: string;
  property_id: string;
  contract_id: string | null;
  phone_number: string;
  message_content: string;
  message_type: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
  // Joined data
  tenant?: {
    id: string;
    name: string;
    phone: string | null;
  };
  property?: {
    id: string;
    name: string;
  };
}

export interface WhatsAppScheduled {
  id: string;
  user_id: string;
  organization_id: string | null;
  contract_id: string;
  scheduled_date: string;
  days_before_due: number;
  status: 'pending' | 'sent' | 'cancelled';
  message_id: string | null;
  created_at: string;
  // Joined data
  contract?: {
    id: string;
    monthly_rent: number;
    payment_due_day: number;
    tenant?: {
      id: string;
      name: string;
      phone: string | null;
    };
    property?: {
      id: string;
      name: string;
    };
  };
}

export interface WhatsAppSettingsFormData {
  is_enabled: boolean;
  evolution_api_url: string;
  evolution_api_key: string;
  evolution_instance_name: string;
  days_before_due: number[];
  message_template: string;
}

export const MESSAGE_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  sent: 'Enviada',
  failed: 'Falhou',
  delivered: 'Entregue',
};

export const MESSAGE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

export const DEFAULT_MESSAGE_TEMPLATE = `Olá {tenant_name}! 🏠

Este é um lembrete amigável sobre o aluguel do imóvel {property_name}.

📅 Vencimento: {due_date}
💰 Valor: {rent_value}

Qualquer dúvida, estamos à disposição!`;
