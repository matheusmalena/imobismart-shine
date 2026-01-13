-- Create table for property gallery images
CREATE TABLE public.property_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_gallery ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own gallery images"
ON public.property_gallery
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gallery images"
ON public.property_gallery
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gallery images"
ON public.property_gallery
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gallery images"
ON public.property_gallery
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all gallery images"
ON public.property_gallery
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny anonymous access to gallery"
ON public.property_gallery
FOR ALL
USING (false)
WITH CHECK (false);

-- Add trigger for updated_at
CREATE TRIGGER update_property_gallery_updated_at
BEFORE UPDATE ON public.property_gallery
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();