-- ================================================
-- SECURITY FIX: Add missing RLS policies
-- ================================================

-- 1. PROTECT user_roles from privilege escalation
-- Only admins can INSERT new roles (prevent users from granting themselves admin)
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can DELETE roles (prevent users from removing admin roles)
CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. PROTECT subscriptions from manipulation
-- Only admins can INSERT subscriptions (system creates via trigger, admins can manually add)
CREATE POLICY "Only admins can insert subscriptions"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can DELETE subscriptions
CREATE POLICY "Only admins can delete subscriptions"
ON public.subscriptions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Restrict UPDATE on user_roles more tightly
-- Drop existing admin update policy and recreate with WITH CHECK
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Ensure users cannot update their own subscription
-- (only admins should be able to change subscription plans)
CREATE POLICY "Users cannot update their own subscription"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  AND public.has_role(auth.uid(), 'admin') = false
)
WITH CHECK (false);

-- 5. Add rate limiting tracking table for API abuse prevention
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  action TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only backend/service role can access rate_limits
CREATE POLICY "Service role only for rate_limits"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action 
ON public.rate_limits(user_id, action, window_start);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_action 
ON public.rate_limits(ip_address, action, window_start);

-- 6. Create rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _user_id UUID,
  _action TEXT,
  _max_requests INTEGER DEFAULT 100,
  _window_minutes INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_count INTEGER;
  _window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  _window_start := now() - (_window_minutes || ' minutes')::interval;
  
  -- Count requests in the current window
  SELECT COALESCE(SUM(request_count), 0) INTO _current_count
  FROM public.rate_limits
  WHERE user_id = _user_id
    AND action = _action
    AND window_start >= _window_start;
  
  -- If over limit, return false
  IF _current_count >= _max_requests THEN
    RETURN false;
  END IF;
  
  -- Log this request
  INSERT INTO public.rate_limits (user_id, action, request_count, window_start)
  VALUES (_user_id, _action, 1, now());
  
  RETURN true;
END;
$$;

-- 7. Cleanup old rate limit records (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_start < now() - interval '1 hour';
END;
$$;