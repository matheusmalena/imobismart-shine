
CREATE OR REPLACE FUNCTION public.get_enterprise_limits(_user_id uuid)
RETURNS TABLE(property_limit integer, max_members integer)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _owner_id uuid;
  _owner_email text;
BEGIN
  -- First check if user is an org owner directly
  SELECT o.owner_id INTO _owner_id
  FROM public.organizations o
  WHERE o.owner_id = _user_id
  LIMIT 1;

  -- If not owner, find the owner via org membership
  IF _owner_id IS NULL THEN
    SELECT o.owner_id INTO _owner_id
    FROM public.organization_members om
    JOIN public.organizations o ON o.id = om.organization_id
    WHERE om.user_id = _user_id
      AND om.status = 'active'
    LIMIT 1;
  END IF;

  -- If still no owner found, use the user themselves
  IF _owner_id IS NULL THEN
    _owner_id := _user_id;
  END IF;

  -- Get owner email from profiles
  SELECT p.email INTO _owner_email
  FROM public.profiles p
  WHERE p.user_id = _owner_id
  LIMIT 1;

  IF _owner_email IS NULL THEN
    RETURN;
  END IF;

  -- Return limits from enterprise_checkout_links
  RETURN QUERY
  SELECT ecl.property_limit, ecl.max_members
  FROM public.enterprise_checkout_links ecl
  WHERE ecl.client_email = _owner_email
    AND ecl.is_active = true
  LIMIT 1;
END;
$$;
