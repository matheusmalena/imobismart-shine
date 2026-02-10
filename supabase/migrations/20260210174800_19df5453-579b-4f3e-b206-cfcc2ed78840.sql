
-- 1. Add checkout_url to plans table
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS checkout_url text;

-- 2. Add new generic columns to subscriptions (keep old MP columns for safety)
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS external_subscription_id text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS payer_email text;

-- 3. Create enterprise_checkout_links table
CREATE TABLE public.enterprise_checkout_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name text NOT NULL,
  client_email text NOT NULL,
  checkout_url text NOT NULL,
  plan_label text NOT NULL DEFAULT 'Enterprise',
  price numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enterprise_checkout_links ENABLE ROW LEVEL SECURITY;

-- Only admins can CRUD
CREATE POLICY "Admins can view enterprise links"
  ON public.enterprise_checkout_links FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert enterprise links"
  ON public.enterprise_checkout_links FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update enterprise links"
  ON public.enterprise_checkout_links FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete enterprise links"
  ON public.enterprise_checkout_links FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Deny anonymous
CREATE POLICY "Deny anonymous access to enterprise links"
  ON public.enterprise_checkout_links FOR ALL
  USING (false)
  WITH CHECK (false);

-- Updated_at trigger
CREATE TRIGGER update_enterprise_checkout_links_updated_at
  BEFORE UPDATE ON public.enterprise_checkout_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
