-- Create plan_audit_logs table for tracking plan changes
CREATE TABLE public.plan_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  changed_by UUID NOT NULL,
  changes JSONB NOT NULL DEFAULT '{}',
  previous_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plan_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can view all audit logs"
  ON public.plan_audit_logs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert audit logs (via backend operations)
CREATE POLICY "Admins can insert audit logs"
  ON public.plan_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create index for faster queries
CREATE INDEX idx_plan_audit_logs_plan_id ON public.plan_audit_logs(plan_id);
CREATE INDEX idx_plan_audit_logs_created_at ON public.plan_audit_logs(created_at DESC);