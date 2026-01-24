-- Fix tenant PII exposure by restricting access to owners/admins only
-- Drop the overly permissive SELECT policy for organization members
DROP POLICY IF EXISTS "Users can view their own or org tenants" ON public.tenants;

-- Create stricter SELECT policy: only owners/admins can view org tenants (not all members)
CREATE POLICY "Users can view their own or org tenants (restricted)"
ON public.tenants
FOR SELECT
USING (
  auth.uid() = user_id 
  OR (organization_id IS NOT NULL AND can_manage_org(auth.uid(), organization_id))
);

-- Note: UPDATE and DELETE policies already use can_manage_org which is correct
-- INSERT policy correctly restricts to user_id = auth.uid()