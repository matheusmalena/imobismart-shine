-- Drop the existing insert policy for organization_members
DROP POLICY IF EXISTS "Organization owners/admins can add members" ON public.organization_members;

-- Create a new policy that allows:
-- 1. The owner of the organization to insert members (including themselves when creating)
-- 2. Admins of the organization to insert members
CREATE POLICY "Organization owners and admins can add members" 
ON public.organization_members 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Allow if user is the owner of the organization
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_id 
    AND owner_id = auth.uid()
  )
  OR
  -- Allow if user is an admin in this organization
  public.get_org_role(organization_id, auth.uid()) = 'admin'
);