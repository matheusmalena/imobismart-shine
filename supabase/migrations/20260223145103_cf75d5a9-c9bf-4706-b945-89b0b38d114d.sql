
-- Migration Part 2: Migrate data and update plans

-- 1. Migrate existing 'starter' subscriptions to 'free'
UPDATE public.subscriptions SET plan = 'free' WHERE plan = 'starter';

-- 2. Update the trigger function to use 'free' instead of 'starter'
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  INSERT INTO public.subscriptions (user_id, plan, status, started_at)
  VALUES (new.id, 'free', 'trial', NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$function$;

-- 3. Update existing 'starter' plan row to become 'free'
UPDATE public.plans SET 
  id = 'free',
  name = 'Free',
  description = 'Para começar a gerenciar seus imóveis',
  price = 0,
  price_label = 'Grátis',
  property_limit = 2,
  features = '["Até 2 imóveis", "Dashboard básico", "Gestão de inquilinos", "Contratos simples"]'::jsonb,
  is_highlighted = false,
  sort_order = 0,
  extra_property_price = null,
  checkout_url = null
WHERE id = 'starter';

-- 4. Insert new 'starter' plan (R$49/mês)
INSERT INTO public.plans (id, name, description, price, price_label, property_limit, features, is_highlighted, is_active, sort_order, extra_property_price)
VALUES (
  'starter',
  'Starter',
  'Para quem está começando a investir',
  49,
  'R$ 49',
  15,
  '["Até 15 imóveis", "Imóveis extras: R$ 3,50/mês", "Dashboard completo", "Gestão de inquilinos", "Contratos avançados", "Suporte por email"]'::jsonb,
  false,
  true,
  1,
  3.50
);

-- 5. Update 'pro' plan
UPDATE public.plans SET
  name = 'Pro',
  description = 'Para carteiras em crescimento',
  price = 79,
  price_label = 'R$ 79',
  property_limit = 30,
  features = '["Até 30 imóveis", "Imóveis extras: R$ 3,00/mês", "Exportação CSV/Excel/JSON", "Análise avançada", "Dashboard completo", "Suporte por email"]'::jsonb,
  is_highlighted = true,
  sort_order = 2,
  extra_property_price = 3.00,
  checkout_url = null
WHERE id = 'pro';

-- 6. Update 'plus' plan
UPDATE public.plans SET
  name = 'Plus',
  description = 'Para gestores profissionais',
  price = 129,
  price_label = 'R$ 129',
  property_limit = 60,
  features = '["Até 60 imóveis", "Imóveis extras: R$ 2,50/mês", "Relatórios PDF", "Recomendações IA", "WhatsApp integrado", "Suporte prioritário"]'::jsonb,
  is_highlighted = false,
  sort_order = 3,
  extra_property_price = 2.50,
  checkout_url = null
WHERE id = 'plus';

-- 7. Update 'enterprise' plan
UPDATE public.plans SET
  name = 'Enterprise',
  description = 'Para grandes operações imobiliárias',
  price = 0,
  price_label = 'Sob consulta',
  property_limit = -1,
  features = '["Imóveis ilimitados", "Usuários ilimitados", "Integrações personalizadas", "Gerente de conta dedicado", "SLA garantido", "Imóveis extras: R$ 2,00/mês (base contratual)"]'::jsonb,
  is_highlighted = false,
  sort_order = 4,
  extra_property_price = 2.00,
  checkout_url = null
WHERE id = 'enterprise';
