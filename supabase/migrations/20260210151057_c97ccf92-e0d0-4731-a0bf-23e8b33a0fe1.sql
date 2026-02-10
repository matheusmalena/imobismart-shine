
-- Create a SECURITY DEFINER function to get the org owner's plan for a member
CREATE OR REPLACE FUNCTION public.get_org_owner_plan(_user_id uuid)
RETURNS TABLE(plan subscription_plan, status subscription_status)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT s.plan, s.status
  FROM organization_members om
  JOIN organizations o ON o.id = om.organization_id
  JOIN subscriptions s ON s.user_id = o.owner_id
  WHERE om.user_id = _user_id
    AND om.status = 'active'
    AND om.role != 'owner'
  LIMIT 1
$$;
