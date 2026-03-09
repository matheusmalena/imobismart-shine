CREATE POLICY "Org members can view fellow member profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT om.user_id
    FROM organization_members om
    WHERE om.organization_id IN (
      SELECT om2.organization_id
      FROM organization_members om2
      WHERE om2.user_id = auth.uid()
        AND om2.status = 'active'
    )
    AND om.status = 'active'
  )
);