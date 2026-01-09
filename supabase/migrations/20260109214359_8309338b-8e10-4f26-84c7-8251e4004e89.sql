-- Tabela de inquilinos (tenants)
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  rg TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de contratos de aluguel (lease_contracts)
CREATE TABLE public.lease_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent NUMERIC NOT NULL DEFAULT 0,
  deposit_amount NUMERIC DEFAULT 0,
  payment_due_day INTEGER DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated', 'pending')),
  notes TEXT,
  contract_file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lease_contracts ENABLE ROW LEVEL SECURITY;

-- Políticas para tenants
CREATE POLICY "Users can view their own tenants" 
ON public.tenants FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tenants" 
ON public.tenants FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tenants" 
ON public.tenants FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tenants" 
ON public.tenants FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tenants" 
ON public.tenants FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny anonymous access to tenants" 
ON public.tenants FOR ALL 
TO anon
USING (false)
WITH CHECK (false);

-- Políticas para lease_contracts
CREATE POLICY "Users can view their own contracts" 
ON public.lease_contracts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contracts" 
ON public.lease_contracts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contracts" 
ON public.lease_contracts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contracts" 
ON public.lease_contracts FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all contracts" 
ON public.lease_contracts FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny anonymous access to contracts" 
ON public.lease_contracts FOR ALL 
TO anon
USING (false)
WITH CHECK (false);

-- Triggers para updated_at
CREATE TRIGGER update_tenants_updated_at
BEFORE UPDATE ON public.tenants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lease_contracts_updated_at
BEFORE UPDATE ON public.lease_contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_tenants_user_id ON public.tenants(user_id);
CREATE INDEX idx_lease_contracts_user_id ON public.lease_contracts(user_id);
CREATE INDEX idx_lease_contracts_property_id ON public.lease_contracts(property_id);
CREATE INDEX idx_lease_contracts_tenant_id ON public.lease_contracts(tenant_id);
CREATE INDEX idx_lease_contracts_status ON public.lease_contracts(status);
CREATE INDEX idx_lease_contracts_end_date ON public.lease_contracts(end_date);