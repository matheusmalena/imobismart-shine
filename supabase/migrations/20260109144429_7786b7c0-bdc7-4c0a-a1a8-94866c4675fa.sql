-- Create plans table for dynamic plan management
CREATE TABLE public.plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  price_label text NOT NULL DEFAULT 'R$ 0/mês',
  property_limit integer NOT NULL DEFAULT 2,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_highlighted boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Plans are publicly readable (needed for pricing page, settings, etc.)
CREATE POLICY "Plans are viewable by everyone" 
ON public.plans 
FOR SELECT 
USING (true);

-- Only admins can manage plans
CREATE POLICY "Admins can insert plans" 
ON public.plans 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update plans" 
ON public.plans 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete plans" 
ON public.plans 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default plans
INSERT INTO public.plans (id, name, description, price, price_label, property_limit, features, is_highlighted, sort_order)
VALUES 
  ('starter', 'Gratuito', 'Perfeito para começar', 0, 'R$ 0/mês', 2, '["Até 2 imóveis cadastrados", "Dashboard básico", "Upload de documentos (100MB)", "Suporte por email"]'::jsonb, false, 0),
  ('pro', 'Pro', 'Para investidores sérios', 49, 'R$ 49/mês', 25, '["Até 25 imóveis cadastrados", "Dashboard avançado", "Upload ilimitado de documentos", "Relatórios automáticos", "Análise de mercado", "Suporte prioritário"]'::jsonb, true, 1),
  ('enterprise', 'Plus', 'Para grandes portfólios', 99, 'R$ 99/mês', -1, '["Imóveis ilimitados", "Todos os recursos Pro", "Relatórios personalizados", "Exportação de dados", "Suporte prioritário 24/7"]'::jsonb, false, 2);

-- Add trigger for updated_at
CREATE TRIGGER update_plans_updated_at
BEFORE UPDATE ON public.plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();