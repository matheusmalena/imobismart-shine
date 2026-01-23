-- 1. Criar subscriptions para usuários que não têm (starter por padrão)
INSERT INTO public.subscriptions (user_id, plan, status, started_at)
SELECT p.user_id, 'starter', 'trial', NOW()
FROM public.profiles p
LEFT JOIN public.subscriptions s ON p.user_id = s.user_id
WHERE s.id IS NULL
ON CONFLICT DO NOTHING;

-- 2. Adicionar constraint UNIQUE para prevenir duplicatas futuras
ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);

-- 3. Atualizar trigger para ser mais robusto com ON CONFLICT
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create user role (default: user) - ignore if exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Create subscription (default: starter trial) - ignore if exists
  INSERT INTO public.subscriptions (user_id, plan, status, started_at)
  VALUES (new.id, 'starter', 'trial', NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$;