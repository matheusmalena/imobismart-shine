
CREATE OR REPLACE FUNCTION public.sync_enterprise_org_limits(_client_email text, _max_members integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _owner_user_id uuid;
  _org_id uuid;
BEGIN
  -- Find user_id from profiles by email
  SELECT user_id INTO _owner_user_id
  FROM public.profiles
  WHERE email = _client_email
  LIMIT 1;

  IF _owner_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Find organization owned by this user
  SELECT id INTO _org_id
  FROM public.organizations
  WHERE owner_id = _owner_user_id
  LIMIT 1;

  IF _org_id IS NULL THEN
    RETURN;
  END IF;

  -- Update the organization's max_members
  UPDATE public.organizations
  SET max_members = _max_members, updated_at = now()
  WHERE id = _org_id;
END;
$$;
