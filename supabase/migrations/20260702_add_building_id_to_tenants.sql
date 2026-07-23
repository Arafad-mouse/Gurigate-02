-- Add building_id column to tenants table if it doesn't exist
-- Run this in Supabase SQL Editor or via: supabase db push (when authenticated)

ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS building_id TEXT;

-- Create index for building_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_tenants_building_id ON public.tenants(building_id);
