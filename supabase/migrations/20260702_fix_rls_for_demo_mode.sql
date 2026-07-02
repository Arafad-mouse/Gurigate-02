-- Fix RLS policies to work with both authenticated users and demo mode
-- Run this in Supabase SQL Editor or via: supabase db push (when authenticated)

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can insert their own tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can update their own tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can delete their own tenants" ON public.tenants;
DROP POLICY IF EXISTS "Admins can view all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Allow demo mode operations" ON public.tenants;

-- Create new policies that work with both authenticated and demo mode
CREATE POLICY "Users can view their own tenants or all in demo mode"
  ON public.tenants
  FOR SELECT
  USING (auth.uid() = owner_id OR auth.uid() IS NULL);

CREATE POLICY "Users can insert their own tenants or any in demo mode"
  ON public.tenants
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update their own tenants or any in demo mode"
  ON public.tenants
  FOR UPDATE
  USING (auth.uid() = owner_id OR auth.uid() IS NULL)
  WITH CHECK (auth.uid() = owner_id OR auth.uid() IS NULL);

CREATE POLICY "Users can delete their own tenants or any in demo mode"
  ON public.tenants
  FOR DELETE
  USING (auth.uid() = owner_id OR auth.uid() IS NULL);
