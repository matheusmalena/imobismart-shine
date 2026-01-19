-- Create table for WhatsApp settings per user
CREATE TABLE public.whatsapp_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  evolution_api_url TEXT,
  evolution_api_key TEXT,
  evolution_instance_name TEXT,
  days_before_due INTEGER[] DEFAULT ARRAY[3, 1],
  message_template TEXT DEFAULT 'Olá {tenant_name}! 🏠

Este é um lembrete amigável sobre o aluguel do imóvel {property_name}.

📅 Vencimento: {due_date}
💰 Valor: {rent_value}

Qualquer dúvida, estamos à disposição!',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create table for message history
CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES public.lease_contracts(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL,
  message_content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'payment_reminder',
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for scheduled messages
CREATE TABLE public.whatsapp_scheduled (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  contract_id UUID NOT NULL REFERENCES public.lease_contracts(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  days_before_due INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message_id UUID REFERENCES public.whatsapp_messages(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contract_id, scheduled_date, days_before_due)
);

-- Enable RLS
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_scheduled ENABLE ROW LEVEL SECURITY;

-- RLS Policies for whatsapp_settings
CREATE POLICY "Users can view own whatsapp settings"
  ON public.whatsapp_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own whatsapp settings"
  ON public.whatsapp_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own whatsapp settings"
  ON public.whatsapp_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for whatsapp_messages
CREATE POLICY "Users can view own whatsapp messages"
  ON public.whatsapp_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own whatsapp messages"
  ON public.whatsapp_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own whatsapp messages"
  ON public.whatsapp_messages FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for whatsapp_scheduled
CREATE POLICY "Users can view own scheduled messages"
  ON public.whatsapp_scheduled FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own scheduled messages"
  ON public.whatsapp_scheduled FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled messages"
  ON public.whatsapp_scheduled FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled messages"
  ON public.whatsapp_scheduled FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at on whatsapp_settings
CREATE TRIGGER update_whatsapp_settings_updated_at
  BEFORE UPDATE ON public.whatsapp_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();