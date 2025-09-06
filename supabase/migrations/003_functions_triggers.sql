-- Database Functions and Triggers for LastResort Platform

-- Function to check if competition is active
CREATE OR REPLACE FUNCTION is_competition_active(start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOW() BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if competition is past (including grace period)
CREATE OR REPLACE FUNCTION is_competition_past(end_date TIMESTAMPTZ)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOW() > end_date + INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If username is taken, append timestamp
    INSERT INTO profiles (id, username)
    VALUES (
      NEW.id, 
      COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)) || '_' || extract(epoch from now())::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to refresh leaderboard materialized view
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to refresh leaderboard when submissions are completed
CREATE TRIGGER refresh_leaderboard_on_completion
  AFTER UPDATE OF status ON submissions
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION refresh_leaderboard();

-- Function to update best score tracking
CREATE OR REPLACE FUNCTION update_best_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Clear all best_score flags for this user and competition
  UPDATE submissions 
  SET is_best_score = false 
  WHERE user_id = NEW.user_id 
    AND competition_id = NEW.competition_id
    AND status = 'completed';
  
  -- Set the best score flag for the highest scoring submission
  UPDATE submissions 
  SET is_best_score = true 
  WHERE id = (
    SELECT id FROM submissions 
    WHERE user_id = NEW.user_id 
      AND competition_id = NEW.competition_id 
      AND status = 'completed'
    ORDER BY score DESC, completed_at ASC
    LIMIT 1
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update best score when submission is completed
CREATE TRIGGER update_best_score_on_completion
  AFTER UPDATE OF status ON submissions
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_best_score();

-- Function to check if user can register for competition
CREATE OR REPLACE FUNCTION can_register_for_competition(competition_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  comp_end_date TIMESTAMPTZ;
  already_registered BOOLEAN;
BEGIN
  -- Get competition end date
  SELECT end_date INTO comp_end_date
  FROM competitions
  WHERE id = competition_id_param;
  
  -- Check if already registered
  SELECT EXISTS (
    SELECT 1 FROM competition_registrations 
    WHERE competition_id = competition_id_param 
    AND user_id = user_id_param
  ) INTO already_registered;
  
  -- Can register if competition hasn't ended and not already registered
  RETURN comp_end_date > NOW() AND NOT already_registered;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can submit to competition
CREATE OR REPLACE FUNCTION can_submit_to_competition(competition_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_registered BOOLEAN;
  can_submit BOOLEAN;
BEGIN
  -- Check if user is registered
  SELECT EXISTS (
    SELECT 1 FROM competition_registrations 
    WHERE competition_id = competition_id_param 
    AND user_id = user_id_param
  ) INTO is_registered;
  
  -- Check if competition allows submissions (active + 1 day grace)
  SELECT (start_date <= NOW() AND NOW() <= end_date + INTERVAL '1 day')
  INTO can_submit
  FROM competitions
  WHERE id = competition_id_param;
  
  RETURN is_registered AND can_submit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for competitions with computed status (created after functions exist)
CREATE VIEW competitions_with_status AS
SELECT 
  *,
  is_competition_active(start_date, end_date) AS is_active,
  is_competition_past(end_date) AS is_past
FROM competitions;