-- Row Level Security Policies for LastResort Platform

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_evaluations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile (for signup)
CREATE POLICY "Users create own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Competitions policies
CREATE POLICY "Public read competitions" ON competitions
  FOR SELECT USING (true);

CREATE POLICY "Admins manage competitions" ON competitions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Competitions with status view policies (inherits from competitions table)

-- Competition registrations policies
CREATE POLICY "Users see own registrations" ON competition_registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create own registrations" ON competition_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own registrations" ON competition_registrations
  FOR DELETE USING (auth.uid() = user_id);

-- Submissions policies (users see only their own, admins see all)
CREATE POLICY "Users see own submissions" ON submissions
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Users create own submissions" ON submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins update submissions" ON submissions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Problems policies (tied to submission ownership)
CREATE POLICY "Users see own problems" ON problems
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM submissions WHERE id = submission_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Users create problems for own submissions" ON problems
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM submissions WHERE id = submission_id AND user_id = auth.uid())
  );

-- AI evaluations policies (same as problems)
CREATE POLICY "Users see own evaluations" ON ai_evaluations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM problems p 
      JOIN submissions s ON p.submission_id = s.id 
      WHERE p.id = problem_id AND s.user_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "System creates evaluations" ON ai_evaluations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System updates evaluations" ON ai_evaluations
  FOR UPDATE USING (true);

-- Note: Leaderboard is a materialized view and doesn't support RLS policies
-- Access control will be handled at the application level