-- Add Mercado Pago fields to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS mp_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS mp_payer_email TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'mercadopago';