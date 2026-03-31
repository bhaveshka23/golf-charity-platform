-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Charities table (no FK deps)
CREATE TABLE charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  total_donations NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
  subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly', NULL)),
  charity_id UUID REFERENCES charities(id) ON DELETE SET NULL,
  charity_percentage NUMERIC(5, 2) DEFAULT 10 CHECK (charity_percentage >= 10 AND charity_percentage <= 100),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scores table
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'incomplete')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Draws table
CREATE TABLE draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_month TEXT NOT NULL,
  number1 INTEGER NOT NULL CHECK (number1 >= 1 AND number1 <= 45),
  number2 INTEGER NOT NULL CHECK (number2 >= 1 AND number2 <= 45),
  number3 INTEGER NOT NULL CHECK (number3 >= 1 AND number3 <= 45),
  number4 INTEGER NOT NULL CHECK (number4 >= 1 AND number4 <= 45),
  number5 INTEGER NOT NULL CHECK (number5 >= 1 AND number5 <= 45),
  published BOOLEAN DEFAULT FALSE,
  jackpot_amount NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Winners table
CREATE TABLE winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  match_count INTEGER NOT NULL CHECK (match_count IN (3, 4, 5)),
  prize_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  proof_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('subscription', 'prize_payout', 'charity_donation')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_scores_user_id ON scores(user_id);
CREATE INDEX idx_scores_created_at ON scores(user_id, created_at DESC);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_winners_user_id ON winners(user_id);
CREATE INDEX idx_winners_draw_id ON winners(draw_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_draws_month ON draws(draw_month);

-- ============================================================
-- Row Level Security
-- NOTE: Admin policies use auth.jwt() to avoid recursive RLS
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;

-- Helper function: check if current user is admin via JWT metadata
-- (avoids recursive SELECT on users table)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM users WHERE id = auth.uid()),
    false
  )
$$;

-- RLS: Users
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_admin_all" ON users
  FOR ALL USING (is_admin());

-- RLS: Scores
CREATE POLICY "scores_own" ON scores
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "scores_admin" ON scores
  FOR ALL USING (is_admin());

-- RLS: Subscriptions
CREATE POLICY "subscriptions_own" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_admin" ON subscriptions
  FOR ALL USING (is_admin());

-- RLS: Charities (public read)
CREATE POLICY "charities_public_read" ON charities
  FOR SELECT USING (true);

CREATE POLICY "charities_admin" ON charities
  FOR ALL USING (is_admin());

-- RLS: Draws (published = public read)
CREATE POLICY "draws_published_read" ON draws
  FOR SELECT USING (published = true);

CREATE POLICY "draws_admin" ON draws
  FOR ALL USING (is_admin());

-- RLS: Winners
CREATE POLICY "winners_own" ON winners
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "winners_admin" ON winners
  FOR ALL USING (is_admin());

-- RLS: Payments
CREATE POLICY "payments_own" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payments_admin" ON payments
  FOR ALL USING (is_admin());

-- Seed charities
INSERT INTO charities (name, description, image_url) VALUES
  ('Golf Foundation', 'Supporting young golfers across the country through coaching and equipment grants.', NULL),
  ('Green Heart', 'Environmental charity planting trees on golf courses and public land.', NULL),
  ('Caddie Care', 'Providing healthcare and support for retired golf caddies.', NULL);
