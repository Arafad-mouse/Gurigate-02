-- Add current_floor and current_unit columns to customers table
-- These will store the floor and unit number for the customer's assigned property

ALTER TABLE customers
ADD COLUMN IF NOT EXISTS current_floor TEXT,
ADD COLUMN IF NOT EXISTS current_unit TEXT;
