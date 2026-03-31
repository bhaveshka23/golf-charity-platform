-- ============================================================
-- RUN THIS IN SUPABASE SQL EDITOR to fix infinite RLS loop
-- ============================================================

-- Step 1: Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can manage own scores" ON scores;
DROP POLICY IF EXISTS "Admins can manage all scores" ON scores;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Anyone can view charities" ON charities;
DROP POLICY IF EXISTS "Admins can manage charities" ON charities;
DROP POLICY IF EXISTS "Anyone can view published draws" ON draws;
DROP POLICY IF EXISTS "Admins can manage draws" ON draws;
DROP POLICY IF EXISTS "Users can view own winnings" ON winners;
DROP POLICY IF EXISTS "Admins can manage winners" ON winners;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage payments" ON payments;

-- Also drop any new-style policies if re-running
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_admin_all" ON users;
DROP POLICY IF EXISTS "scores_own" ON scores;
DROP POLICY IF EXISTS "scores_admin" ON scores;
DROP POLICY IF EXISTS "subscriptions_own" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_admin" ON subscriptions;
DROP POLICY IF EXISTS "charities_public_read" ON charities;
DROP POLICY IF EXISTS "charities_admin" ON charities;
DROP POLICY IF EXISTS "draws_published_read" ON draws;
DROP POLICY IF EXISTS "draws_admin" ON draws;
DROP POLICY IF EXISTS "winners_own" ON winners;
DROP POLICY IF EXISTS "winners_admin" ON winners;
DROP POLICY IF EXISTS "payments_own" ON payments;
DROP POLICY IF EXISTS "payments_admin" ON payments;

-- Step 2: Create is_admin() helper using SECURITY DEFINER
-- This avoids the recursive SELECT on users table
DROP FUNCTION IF EXISTS is_admin();
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM users WHERE id = auth.uid()),
    false
  )
$$;

-- Step 3: Recreate all policies cleanly

-- Users
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_admin_all" ON users
  FOR ALL USING (is_admin());

-- Scores
CREATE POLICY "scores_own" ON scores
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "scores_admin" ON scores
  FOR ALL USING (is_admin());

-- Subscriptions
CREATE POLICY "subscriptions_own" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_admin" ON subscriptions
  FOR ALL USING (is_admin());

-- Charities (public read)
CREATE POLICY "charities_public_read" ON charities
  FOR SELECT USING (true);

CREATE POLICY "charities_admin" ON charities
  FOR ALL USING (is_admin());

-- Draws (published = public read)
CREATE POLICY "draws_published_read" ON draws
  FOR SELECT USING (published = true);

CREATE POLICY "draws_admin" ON draws
  FOR ALL USING (is_admin());

-- Winners
CREATE POLICY "winners_own" ON winners
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "winners_admin" ON winners
  FOR ALL USING (is_admin());

-- Payments
CREATE POLICY "payments_own" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payments_admin" ON payments
  FOR ALL USING (is_admin());
