
-- 1. Criar tabela subscription_addons
CREATE TABLE public.subscription_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  addon_name TEXT NOT NULL,
  addon_properties INTEGER NOT NULL,
  addon_price NUMERIC NOT NULL DEFAULT 0,
  kirvano_product_id TEXT,
  kirvano_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.subscription_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own addons"
  ON public.subscription_addons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all addons"
  ON public.subscription_addons FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert addons"
  ON public.subscription_addons FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update addons"
  ON public.subscription_addons FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete addons"
  ON public.subscription_addons FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Trigger para updated_at
CREATE TRIGGER update_subscription_addons_updated_at
  BEFORE UPDATE ON public.subscription_addons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Adicionar colunas Kirvano na subscriptions
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS kirvano_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS kirvano_customer_id TEXT;
