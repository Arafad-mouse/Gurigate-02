-- TEMPORARY: Disable RLS on expenses table for development
-- This allows all users to view all expenses regardless of owner_id
-- TODO: Re-enable RLS with proper admin policies before production

ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
