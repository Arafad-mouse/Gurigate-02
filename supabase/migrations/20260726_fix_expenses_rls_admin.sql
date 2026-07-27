-- Add admin policy to view all expenses
-- This allows admin users to see all expenses regardless of owner_id

DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;

-- Admin policy: admins can view all expenses
CREATE POLICY "Admins can view all expenses" ON expenses
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Regular user policy: users can view own expenses
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (owner_id = auth.uid());
