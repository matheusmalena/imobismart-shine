
CREATE OR REPLACE FUNCTION public.accept_invitation(_token text, _user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _inv RECORD;
BEGIN
  SELECT * INTO _inv FROM organization_invitations
  WHERE token = _token AND expires_at > now();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convite invalido ou expirado';
  END IF;

  INSERT INTO organization_members (organization_id, user_id, role, status, accepted_at)
  VALUES (_inv.organization_id, _user_id, _inv.role, 'active', now())
  ON CONFLICT DO NOTHING;

  DELETE FROM organization_invitations WHERE id = _inv.id;
END;
$$;
