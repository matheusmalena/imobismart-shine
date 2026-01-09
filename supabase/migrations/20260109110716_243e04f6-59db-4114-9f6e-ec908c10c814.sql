-- Fix conflicting policy on subscriptions
-- The policy "Users cannot update their own subscription" conflicts with admin policy
-- Remove it and rely on the fact that only admins have UPDATE policy
DROP POLICY IF EXISTS "Users cannot update their own subscription" ON public.subscriptions;

-- Also add explicit INSERT/DELETE policies for subscriptions that only allow admins
-- Drop and recreate with TO clause for safety
DROP POLICY IF EXISTS "Only admins can insert subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Only admins can delete subscriptions" ON public.subscriptions;

CREATE POLICY "Only admins can insert subscriptions"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete subscriptions"
ON public.subscriptions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Also add INSERT/DELETE policies for user_roles
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));