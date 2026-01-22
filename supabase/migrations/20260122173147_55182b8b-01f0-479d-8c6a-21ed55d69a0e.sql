-- Fix PUBLIC_DATA_EXPOSURE: Organization Invitations exposed to public read access
-- The "Anyone can view invitation by token" policy with USING (true) is too permissive

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON public.organization_invitations;

-- Create a security definer function that allows token-based validation
-- This function bypasses RLS to check if a token exists and is not expired
CREATE OR REPLACE FUNCTION public.validate_invitation_token(_token text)
RETURNS TABLE (
  id uuid,
  email text,
  role org_member_role,
  organization_id uuid,
  organization_name text,
  expires_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    oi.id,
    oi.email,
    oi.role,
    oi.organization_id,
    o.name as organization_name,
    oi.expires_at
  FROM public.organization_invitations oi
  JOIN public.organizations o ON o.id = oi.organization_id
  WHERE oi.token = _token
    AND oi.expires_at > now()
  LIMIT 1
$$;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.validate_invitation_token(text) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_invitation_token(text) TO authenticated;