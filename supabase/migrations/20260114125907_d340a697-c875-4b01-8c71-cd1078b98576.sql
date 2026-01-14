-- Add storage policy for admins to view all documents in property-documents bucket
CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'property-documents' AND 
  public.has_role(auth.uid(), 'admin'::app_role)
);