-- Drop existing tenants table if it exists to avoid schema conflicts
DROP TABLE IF EXISTS public.tenants CASCADE;

-- Create tenants table
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  building_id TEXT,
  unit_id TEXT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  monthly_rent DECIMAL(10, 2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Paid', 'Pending', 'Overdue')),
  lease_status TEXT NOT NULL DEFAULT 'active' CHECK (lease_status IN ('active', 'inactive', 'terminated')),
  next_due_date DATE NOT NULL,
  move_in_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON public.tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_tenants_building_id ON public.tenants(building_id);
CREATE INDEX IF NOT EXISTS idx_tenants_payment_status ON public.tenants(payment_status);
CREATE INDEX IF NOT EXISTS idx_tenants_lease_status ON public.tenants(lease_status);
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON public.tenants(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Owners can view their own tenants
CREATE POLICY "Users can view their own tenants"
  ON public.tenants
  FOR SELECT
  USING (auth.uid() = owner_id);

-- RLS Policy: Owners can insert tenants
CREATE POLICY "Users can insert their own tenants"
  ON public.tenants
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- RLS Policy: Owners can update their own tenants
CREATE POLICY "Users can update their own tenants"
  ON public.tenants
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- RLS Policy: Owners can delete their own tenants
CREATE POLICY "Users can delete their own tenants"
  ON public.tenants
  FOR DELETE
  USING (auth.uid() = owner_id);

-- RLS Policy: Admin can view all tenants (if admin role exists)
CREATE POLICY "Admins can view all tenants"
  ON public.tenants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policy: Allow demo mode operations (when auth.uid() is null)
-- This is for development/testing purposes only
CREATE POLICY "Allow demo mode operations"
  ON public.tenants
  FOR ALL
  USING (auth.uid() IS NULL)
  WITH CHECK (auth.uid() IS NULL);
