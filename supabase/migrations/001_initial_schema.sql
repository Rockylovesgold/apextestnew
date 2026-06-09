-- ============================================================
-- 001_initial_schema.sql
-- Run this FIRST in the Supabase SQL Editor
-- Project: AIOV Capital Community
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES TABLE (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'manager', 'admin')),
  account_balance DECIMAL(15,2) DEFAULT 10000.00,
  risk_percentage DECIMAL(5,2) DEFAULT 1.00,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_referral_code TEXT;
BEGIN
  -- Generate unique referral code for new user
  v_referral_code := UPPER(SUBSTRING(MD5(NEW.id::TEXT || NOW()::TEXT), 1, 8));

  INSERT INTO profiles (id, email, display_name, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    v_referral_code
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRADES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  instrument TEXT NOT NULL DEFAULT 'XAU/USD',
  direction TEXT NOT NULL CHECK (direction IN ('buy', 'sell')),
  entry_price DECIMAL(15,5) NOT NULL,
  exit_price DECIMAL(15,5),
  stop_loss DECIMAL(15,5),
  take_profit DECIMAL(15,5),
  lot_size DECIMAL(10,4) NOT NULL DEFAULT 0.01,
  pips DECIMAL(10,2),
  profit_loss DECIMAL(15,2),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  session TEXT CHECK (session IN ('london', 'new_york', 'asian', 'overlap')),
  strategy TEXT,
  notes TEXT,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_opened_at ON trades(opened_at DESC);

-- ============================================================
-- REFERRAL CODES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  assigned_to UUID REFERENCES profiles(id),
  max_uses INTEGER DEFAULT 0,  -- 0 = unlimited
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_codes_assigned_to ON referral_codes(assigned_to);

-- ============================================================
-- REFERRAL USES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS referral_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID NOT NULL REFERENCES referral_codes(id),
  used_by UUID NOT NULL REFERENCES profiles(id),
  used_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(code_id, used_by)
);

CREATE INDEX idx_referral_uses_code_id ON referral_uses(code_id);

-- ============================================================
-- TICKETS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id),
  subject TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('technical', 'billing', 'trading', 'account', 'other')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);

-- ============================================================
-- TICKET MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  message TEXT NOT NULL,
  is_staff BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);

-- ============================================================
-- EDUCATION MODULES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS education_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  order_index INTEGER NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_minutes INTEGER DEFAULT 30,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(order_index)
);

CREATE TRIGGER education_modules_updated_at
  BEFORE UPDATE ON education_modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- EDUCATION QUESTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS education_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES education_modules(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'tap_reveal')),
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_education_questions_module_id ON education_questions(module_id);

-- ============================================================
-- EDUCATION PROGRESS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS education_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES education_modules(id) ON DELETE CASCADE,
  questions_answered INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

CREATE INDEX idx_education_progress_user_id ON education_progress(user_id);
CREATE INDEX idx_education_progress_module_id ON education_progress(module_id);

-- ============================================================
-- LEADERBOARD FUNCTION
-- Returns aggregated trade stats per user
-- ============================================================
CREATE OR REPLACE FUNCTION get_leaderboard(time_filter TEXT DEFAULT 'all')
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  total_trades BIGINT,
  winning_trades BIGINT,
  win_rate DECIMAL,
  total_pnl DECIMAL,
  total_pips DECIMAL,
  profit_factor DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS user_id,
    p.display_name,
    p.avatar_url,
    COUNT(t.id) AS total_trades,
    COUNT(t.id) FILTER (WHERE t.profit_loss > 0) AS winning_trades,
    CASE
      WHEN COUNT(t.id) > 0 THEN
        ROUND(COUNT(t.id) FILTER (WHERE t.profit_loss > 0)::DECIMAL / COUNT(t.id) * 100, 2)
      ELSE 0
    END AS win_rate,
    COALESCE(SUM(t.profit_loss), 0) AS total_pnl,
    COALESCE(SUM(t.pips), 0) AS total_pips,
    CASE
      WHEN COALESCE(SUM(t.profit_loss) FILTER (WHERE t.profit_loss < 0), 0) != 0 THEN
        ROUND(ABS(COALESCE(SUM(t.profit_loss) FILTER (WHERE t.profit_loss > 0), 0) /
          COALESCE(SUM(t.profit_loss) FILTER (WHERE t.profit_loss < 0), -1)), 2)
      ELSE COALESCE(SUM(t.profit_loss) FILTER (WHERE t.profit_loss > 0), 0)
    END AS profit_factor
  FROM profiles p
  INNER JOIN trades t ON t.user_id = p.id
  WHERE
    t.status = 'closed'
    AND p.is_active = true
    AND (
      time_filter = 'all'
      OR (time_filter = 'week' AND t.closed_at >= NOW() - INTERVAL '7 days')
      OR (time_filter = 'month' AND t.closed_at >= NOW() - INTERVAL '30 days')
    )
  GROUP BY p.id, p.display_name, p.avatar_url
  HAVING COUNT(t.id) >= 1
  ORDER BY total_pnl DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- HELPER: Increment referral code usage count
-- Called after a user signs up with a referral code
-- ============================================================
CREATE OR REPLACE FUNCTION increment_referral_uses(code_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE referral_codes
  SET current_uses = current_uses + 1
  WHERE id = code_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_referral_uses TO authenticated;

-- ============================================================
-- STORAGE: Avatar bucket
-- MANUAL STEP: In Supabase Dashboard → Storage → New Bucket
--   Name: avatars    Public: ON
-- Then uncomment and run these policies:
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
--
-- CREATE POLICY "Avatars publicly readable"
-- ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
--
-- CREATE POLICY "Users upload own avatar"
-- ON storage.objects FOR INSERT TO authenticated
-- WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
--
-- CREATE POLICY "Users update own avatar"
-- ON storage.objects FOR UPDATE TO authenticated
-- USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
