-- LastResort Platform Database Schema

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL CHECK (char_length(username) BETWEEN 3 AND 20),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competitions table
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  num_questions INTEGER DEFAULT 1 CHECK (num_questions > 0),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL CHECK (end_date > start_date),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competition registrations (allowed from created_at until end_date)
CREATE TABLE competition_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competition_id, user_id)
);

-- Submissions with best score tracking
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'error')) DEFAULT 'pending',
  score DECIMAL(5,2),
  is_best_score BOOLEAN DEFAULT false,
  admin_reason TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Problems in submission order
CREATE TABLE problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  problem_text TEXT NOT NULL,
  user_solution TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI evaluations
CREATE TABLE ai_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  ai_solution TEXT,
  ai_answer TEXT,
  is_correct BOOLEAN,
  evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materialized view for leaderboard (shows best scores only)
CREATE MATERIALIZED VIEW leaderboard AS
SELECT 
  c.id as competition_id,
  c.name as competition_name,
  p.username,
  s.user_id,
  MAX(s.score) as best_score,
  COUNT(DISTINCT s.id) as total_submissions,
  MAX(s.completed_at) as last_submission
FROM submissions s
JOIN profiles p ON s.user_id = p.id
JOIN competitions c ON s.competition_id = c.id
WHERE s.status = 'completed'
GROUP BY c.id, c.name, p.username, s.user_id;

-- Required for CONCURRENTLY refresh
CREATE UNIQUE INDEX ON leaderboard (competition_id, user_id);