
-- Fix tenants SELECT policy: use is_org_member instead of can_manage_org so operators can view
DROP POLICY IF EXISTS "Users can view their own or org tenants (restricted)" ON public.tenants;

CREATE POLICY "Users can view their own or org tenants"
ON public.tenants
FOR SELECT
USING (
  (auth.uid() = user_id) 
  OR (
    (organization_id IS NOT NULL) 
    AND is_org_member(auth.uid(), organization_id)
  )
);
