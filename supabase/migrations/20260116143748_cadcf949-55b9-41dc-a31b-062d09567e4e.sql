-- Create enum for organization member roles
CREATE TYPE public.org_member_role AS ENUM ('owner', 'admin', 'financial', 'operator');

-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID NOT NULL,
  max_members INTEGER NOT NULL DEFAULT 3, -- Default limit of 3 members (owner + 2)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organization members table
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role org_member_role NOT NULL DEFAULT 'operator',
  invited_by UUID,
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Create organization invitations table for pending invites
CREATE TABLE public.organization_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role org_member_role NOT NULL DEFAULT 'operator',
  invited_by UUID NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, email)
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is member of an organization
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND status = 'active'
  )
$$;

-- Helper function to get user's organization role
CREATE OR REPLACE FUNCTION public.get_org_role(_user_id UUID, _org_id UUID)
RETURNS org_member_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.organization_members
  WHERE user_id = _user_id
    AND organization_id = _org_id
    AND status = 'active'
$$;

-- Helper function to check if user can manage organization (owner or admin)
CREATE OR REPLACE FUNCTION public.can_manage_org(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND status = 'active'
      AND role IN ('owner', 'admin')
  )
$$;

-- Helper function to get user's organization ID
CREATE OR REPLACE FUNCTION public.get_user_org_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = _user_id
    AND status = 'active'
  LIMIT 1
$$;

-- RLS Policies for organizations
CREATE POLICY "Users can view their organization"
ON public.organizations
FOR SELECT
USING (public.is_org_member(auth.uid(), id) OR owner_id = auth.uid());

CREATE POLICY "Only owners can update their organization"
ON public.organizations
FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create organizations"
ON public.organizations
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Admins can view all organizations"
ON public.organizations
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for organization_members
CREATE POLICY "Members can view their organization members"
ON public.organization_members
FOR SELECT
USING (public.is_org_member(auth.uid(), organization_id) OR user_id = auth.uid());

CREATE POLICY "Org admins can insert members"
ON public.organization_members
FOR INSERT
WITH CHECK (public.can_manage_org(auth.uid(), organization_id));

CREATE POLICY "Org admins can update members"
ON public.organization_members
FOR UPDATE
USING (public.can_manage_org(auth.uid(), organization_id));

CREATE POLICY "Org admins can delete members"
ON public.organization_members
FOR DELETE
USING (public.can_manage_org(auth.uid(), organization_id) AND role != 'owner');

CREATE POLICY "Users can update their own membership"
ON public.organization_members
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all members"
ON public.organization_members
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for organization_invitations
CREATE POLICY "Org admins can view invitations"
ON public.organization_invitations
FOR SELECT
USING (public.can_manage_org(auth.uid(), organization_id));

CREATE POLICY "Org admins can create invitations"
ON public.organization_invitations
FOR INSERT
WITH CHECK (public.can_manage_org(auth.uid(), organization_id));

CREATE POLICY "Org admins can delete invitations"
ON public.organization_invitations
FOR DELETE
USING (public.can_manage_org(auth.uid(), organization_id));

CREATE POLICY "Anyone can view invitation by token"
ON public.organization_invitations
FOR SELECT
USING (true);

CREATE POLICY "Admins can view all invitations"
ON public.organization_invitations
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Add organization_id to properties table for shared access
ALTER TABLE public.properties ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Add organization_id to other related tables
ALTER TABLE public.tenants ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
ALTER TABLE public.documents ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
ALTER TABLE public.lease_contracts ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Create or replace RLS policies for properties to include organization access
DROP POLICY IF EXISTS "Users can view their own properties" ON public.properties;
CREATE POLICY "Users can view their own or org properties"
ON public.properties
FOR SELECT
USING (
  auth.uid() = user_id 
  OR (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id))
);

DROP POLICY IF EXISTS "Users can insert their own properties" ON public.properties;
CREATE POLICY "Users can insert their own properties"
ON public.properties
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties;
CREATE POLICY "Users can update their own or org properties"
ON public.properties
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR (organization_id IS NOT NULL AND public.can_manage_org(auth.uid(), organization_id))
);

DROP POLICY IF EXISTS "Users can delete their own properties" ON public.properties;
CREATE POLICY "Users can delete their own or org properties"
ON public.properties
FOR DELETE
USING (
  auth.uid() = user_id 
  OR (organization_id IS NOT NULL AND public.can_manage_org(auth.uid(), organization_id))
);

-- Update tenants policies
DROP POLICY IF EXISTS "Users can view their own tenants" ON public.tenants;
CREATE POLICY "Users can view their own or org tenants"
ON public.tenants
FOR SELECT
USING (
  auth.uid() = user_id 
  OR (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id))
);

DROP POLICY IF EXISTS "Users can insert their own tenants" ON public.tenants;
CREATE POLICY "Users can insert their own tenants"
ON public.tenants
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tenants" ON public.tenants;
CREATE POLICY "Users can update their own or org tenants"
ON public.tenants
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR (organization_id IS NOT NULL AND public.can_manage_org(auth.uid(), organization_id))
);

DROP POLICY IF EXISTS "Users can delete their own tenants" ON public.tenants;
CREATE POLICY "Users can delete their own or org tenants"
ON public.tenants
FOR DELETE
USING (
  auth.uid() = user_id 
  OR (organization_id IS NOT NULL AND public.can_manage_org(auth.uid(), organization_id))
);

-- Update documents policies
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
CREATE POLICY "Users can view their own or org documents"
ON public.documents
FOR SELECT
USING (
  auth.uid() = user_id 
  OR (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id))
);

DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
CREATE POLICY "Users can insert their own documents"
ON public.documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
CREATE POLICY "Users can update their own or org documents"
ON public.documents
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR (organization_id IS NOT NULL AND public.can_manage_org(auth.uid(), organization_id))
);

DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
CREATE POLICY "Users can delete their own or org documents"
ON public.documents
FOR DELETE
USING (
  auth.uid() = user_id 
  OR (organization_id IS NOT NULL AND public.can_manage_org(auth.uid(), organization_id))
);

-- Update lease_contracts policies
DROP POLICY IF EXISTS "Users can view their own contracts" ON public.lease_contracts;
CREATE POLICY "Users can view their own or org contracts"
ON public.lease_contracts
FOR SELECT
USING (
  auth.uid() = user_id 
  OR (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id))
);

DROP POLICY IF EXISTS "Users can insert their own contracts" ON public.lease_contracts;
CREATE POLICY "Users can insert their own contracts"
ON public.lease_contracts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own contracts" ON public.lease_contracts;
CREATE POLICY "Users can update their own or org contracts"
ON public.lease_contracts
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR (organization_id IS NOT NULL AND public.can_manage_org(auth.uid(), organization_id))
);

DROP POLICY IF EXISTS "Users can delete their own contracts" ON public.lease_contracts;
CREATE POLICY "Users can delete their own or org contracts"
ON public.lease_contracts
FOR DELETE
USING (
  auth.uid() = user_id 
  OR (organization_id IS NOT NULL AND public.can_manage_org(auth.uid(), organization_id))
);

-- Trigger for updated_at
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_members_updated_at
BEFORE UPDATE ON public.organization_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();