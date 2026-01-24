-- Fix STORAGE_EXPOSURE: Make property-photos bucket private
-- This restricts access to authenticated users who own the property or are org members

-- Step 1: Make the bucket private
UPDATE storage.buckets SET public = false WHERE id = 'property-photos';

-- Step 2: Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view property photos" ON storage.objects;

-- Step 3: Create policy for users to view their own uploaded photos
-- Photos are stored in folders named after user_id
CREATE POLICY "Users can view their own property photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'property-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Step 4: Create policy for organization members to view org property photos
CREATE POLICY "Org members can view org property photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'property-photos' AND
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.photo_url LIKE '%' || storage.objects.name || '%'
      AND p.organization_id IS NOT NULL
      AND public.is_org_member(auth.uid(), p.organization_id)
  )
);

-- Step 5: Allow admins to view all property photos
CREATE POLICY "Admins can view all property photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'property-photos' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);