
-- Migration Part 1: Add enum value and new columns

-- 1. Add 'free' to subscription_plan enum
ALTER TYPE public.subscription_plan ADD VALUE IF NOT EXISTS 'free';

-- 2. Add Stripe columns to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS extra_properties_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS extra_properties_amount numeric NOT NULL DEFAULT 0;

-- 3. Add Stripe columns to plans table
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS extra_property_price numeric,
ADD COLUMN IF NOT EXISTS stripe_price_id text,
ADD COLUMN IF NOT EXISTS stripe_metered_price_id text;
