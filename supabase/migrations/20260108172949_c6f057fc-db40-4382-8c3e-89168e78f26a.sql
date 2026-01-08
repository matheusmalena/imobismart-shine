-- Deny anonymous access to profiles table
CREATE POLICY "Deny anonymous access to profiles" 
ON public.profiles 
FOR ALL 
TO anon 
USING (false);

-- Deny anonymous access to properties table
CREATE POLICY "Deny anonymous access to properties" 
ON public.properties 
FOR ALL 
TO anon 
USING (false);