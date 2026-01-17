-- Create function to cleanup expired invitations
CREATE OR REPLACE FUNCTION public.cleanup_expired_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.organization_invitations
  WHERE expires_at < now();
END;
$$;

-- Add RLS policy for updating invitations (needed for resend functionality)
CREATE POLICY "Org admins can update invitations" 
ON public.organization_invitations 
FOR UPDATE 
USING (can_manage_org(auth.uid(), organization_id));