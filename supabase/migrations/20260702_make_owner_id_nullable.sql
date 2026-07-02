-- Make owner_id nullable to allow demo mode operations
-- Run this in Supabase SQL Editor or via: supabase db push (when authenticated)

ALTER TABLE public.tenants ALTER COLUMN owner_id DROP NOT NULL;
