-- ============================================================
-- 002_rls_policies.sql
-- Run this SECOND in the Supabase SQL Editor
-- Sets up Row Level Security for all tables
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_progress ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

-- Anyone authenticated can read all profiles (for leaderboard display names)
CREATE POLICY "profiles_read_all_authenticated"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admins can update any profile (for role management)
CREATE POLICY "profiles_admin_update_all"
ON profiles FOR UPDATE
TO authenticated
USING (get_user_role() = 'admin');

-- ============================================================
-- TRADES POLICIES
-- ============================================================

-- Users can read their own trades
CREATE POLICY "trades_read_own"
ON trades FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR get_user_role() = 'admin');

-- Users can insert their own trades
CREATE POLICY "trades_insert_own"
ON trades FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own trades
CREATE POLICY "trades_update_own"
ON trades FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own trades
CREATE POLICY "trades_delete_own"
ON trades FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR get_user_role() = 'admin');

-- ============================================================
-- REFERRAL CODES POLICIES
-- ============================================================

-- Admins can do everything with referral codes
CREATE POLICY "referral_codes_admin_all"
ON referral_codes FOR ALL
TO authenticated
USING (get_user_role() = 'admin')
WITH CHECK (get_user_role() = 'admin');

-- Managers can read codes assigned to them
CREATE POLICY "referral_codes_manager_read_assigned"
ON referral_codes FOR SELECT
TO authenticated
USING (
  assigned_to = auth.uid()
  AND get_user_role() IN ('manager', 'admin')
);

-- Users can validate referral codes during signup (read-only)
CREATE POLICY "referral_codes_validate"
ON referral_codes FOR SELECT
TO authenticated
USING (is_active = true);

-- ============================================================
-- REFERRAL USES POLICIES
-- ============================================================

-- Admins and managers can read referral uses
CREATE POLICY "referral_uses_admin_manager_read"
ON referral_uses FOR SELECT
TO authenticated
USING (
  get_user_role() IN ('admin', 'manager')
  OR used_by = auth.uid()
);

-- Authenticated users can insert referral uses
CREATE POLICY "referral_uses_insert_own"
ON referral_uses FOR INSERT
TO authenticated
WITH CHECK (used_by = auth.uid());

-- ============================================================
-- TICKETS POLICIES
-- ============================================================

-- Users can read their own tickets
CREATE POLICY "tickets_read_own"
ON tickets FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR assigned_to = auth.uid()
  OR get_user_role() IN ('admin', 'manager')
);

-- Users can create tickets
CREATE POLICY "tickets_insert_own"
ON tickets FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own tickets (e.g., add info)
-- Staff can update status, assignment etc.
CREATE POLICY "tickets_update"
ON tickets FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  OR get_user_role() IN ('admin', 'manager')
);

-- ============================================================
-- TICKET MESSAGES POLICIES
-- ============================================================

-- Users can read messages on their tickets
CREATE POLICY "ticket_messages_read"
ON ticket_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tickets
    WHERE tickets.id = ticket_messages.ticket_id
    AND (
      tickets.user_id = auth.uid()
      OR tickets.assigned_to = auth.uid()
      OR get_user_role() IN ('admin', 'manager')
    )
  )
);

-- Users and staff can send messages
CREATE POLICY "ticket_messages_insert"
ON ticket_messages FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM tickets
    WHERE tickets.id = ticket_messages.ticket_id
    AND (
      tickets.user_id = auth.uid()
      OR get_user_role() IN ('admin', 'manager')
    )
  )
);

-- ============================================================
-- EDUCATION MODULES POLICIES
-- ============================================================

-- All authenticated users can read published modules
CREATE POLICY "education_modules_read_published"
ON education_modules FOR SELECT
TO authenticated
USING (is_published = true OR get_user_role() = 'admin');

-- Only admins can manage modules
CREATE POLICY "education_modules_admin_all"
ON education_modules FOR ALL
TO authenticated
USING (get_user_role() = 'admin')
WITH CHECK (get_user_role() = 'admin');

-- ============================================================
-- EDUCATION QUESTIONS POLICIES
-- ============================================================

-- All authenticated users can read questions of published modules
CREATE POLICY "education_questions_read"
ON education_questions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM education_modules
    WHERE education_modules.id = education_questions.module_id
    AND (education_modules.is_published = true OR get_user_role() = 'admin')
  )
);

-- Only admins can manage questions
CREATE POLICY "education_questions_admin_all"
ON education_questions FOR ALL
TO authenticated
USING (get_user_role() = 'admin')
WITH CHECK (get_user_role() = 'admin');

-- ============================================================
-- EDUCATION PROGRESS POLICIES
-- ============================================================

-- Users can read and manage their own progress
CREATE POLICY "education_progress_own"
ON education_progress FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins can read all progress
CREATE POLICY "education_progress_admin_read"
ON education_progress FOR SELECT
TO authenticated
USING (get_user_role() = 'admin');

-- Enable Realtime for ticket messages (for live chat)
ALTER TABLE ticket_messages REPLICA IDENTITY FULL;
ALTER TABLE trades REPLICA IDENTITY FULL;

-- Grant access to the leaderboard function
GRANT EXECUTE ON FUNCTION get_leaderboard TO authenticated;
