-- ================================================
-- CRITICAL SECURITY FIX: Block anonymous access to all tables
-- ================================================

-- 1. PROFILES - Deny anonymous access
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 2. SUBSCRIPTIONS - Deny anonymous access
CREATE POLICY "Deny anonymous access to subscriptions"
ON public.subscriptions
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 3. USER_ROLES - Deny anonymous access
CREATE POLICY "Deny anonymous access to user_roles"
ON public.user_roles
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 4. DOCUMENTS - Deny anonymous access
CREATE POLICY "Deny anonymous access to documents"
ON public.documents
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 5. RATE_LIMITS - Fix to explicitly deny non-service-role access
DROP POLICY IF EXISTS "Service role only for rate_limits" ON public.rate_limits;

-- Deny ALL access to rate_limits for anon and authenticated
-- Only service_role will be able to access (via the function which uses SECURITY DEFINER)
CREATE POLICY "Deny anonymous access to rate_limits"
ON public.rate_limits
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny authenticated access to rate_limits"
ON public.rate_limits
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);