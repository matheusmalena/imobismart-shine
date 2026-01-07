-- Permitir que admins vejam todos os profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir que admins vejam todas as properties (para monitorar clientes)
CREATE POLICY "Admins can view all properties"
ON public.properties
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir que admins vejam todos os documents (para monitorar clientes)
CREATE POLICY "Admins can view all documents"
ON public.documents
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));