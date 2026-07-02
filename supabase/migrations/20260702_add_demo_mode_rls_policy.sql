-- Add RLS policy to allow demo mode operations (when auth.uid() is null)
-- This is for development/testing purposes only
-- Run this in Supabase SQL Editor or via: supabase db push (when authenticated)

DROP POLICY IF EXISTS "Allow demo mode operations" ON public.tenants;

CREATE POLICY "Allow demo mode operations"
  ON public.tenants
  FOR ALL
  USING (auth.uid() IS NULL)
  WITH CHECK (auth.uid() IS NULL);
