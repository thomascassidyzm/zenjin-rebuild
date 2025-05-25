-- Zenjin Maths App Database Schema
-- Supabase Postgres implementation
-- Created: 2025-05-23

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- USERS TABLE
-- ========================================
-- Stores both anonymous and registered users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type text NOT NULL CHECK (user_type IN ('anonymous', 'registered')),
  anonymous_id text UNIQUE,
  email text UNIQUE,
  display_name text,
  subscription_tier text NOT NULL DEFAULT 'Free' CHECK (subscription_tier IN ('Free', 'Premium', 'Pro')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz, -- For anonymous users only
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Constraints
  CONSTRAINT users_anonymous_id_check CHECK (
    (user_type = 'anonymous' AND anonymous_id IS NOT NULL AND email IS NULL) OR
    (user_type = 'registered' AND email IS NOT NULL AND anonymous_id IS NULL)
  )
);

-- ========================================
-- USER STATE TABLE
-- ========================================
-- Current learning state for each user
CREATE TABLE IF NOT EXISTS user_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stitch_positions jsonb NOT NULL DEFAULT '{}'::jsonb,
  triple_helix_state jsonb NOT NULL DEFAULT '{
    "activeTube": 1,
    "currentPath": "addition",
    "rotationCount": 0
  }'::jsonb,
  spaced_repetition_state jsonb NOT NULL DEFAULT '{
    "sequence": [4, 8, 15, 30, 100, 1000],
    "globalPosition": 1
  }'::jsonb,
  progress_metrics jsonb NOT NULL DEFAULT '{
    "totalSessions": 0,
    "totalQuestions": 0,
    "totalCorrect": 0,
    "totalPoints": 0
  }'::jsonb,
  version bigint NOT NULL DEFAULT 1,
  last_sync_time timestamptz DEFAULT now(),
  sync_source text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one state record per user
  UNIQUE(user_id)
);

-- ========================================
-- SESSION METRICS TABLE
-- ========================================
-- Individual session performance data
CREATE TABLE IF NOT EXISTS session_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  learning_path text NOT NULL,
  questions_answered integer NOT NULL DEFAULT 0,
  correct_answers integer NOT NULL DEFAULT 0,
  session_duration integer NOT NULL DEFAULT 0, -- in seconds
  ftc_points integer NOT NULL DEFAULT 0, -- First Time Correct points
  ec_points integer NOT NULL DEFAULT 0, -- Eventually Correct points
  base_points integer NOT NULL DEFAULT 0,
  bonus_multiplier decimal(4,2) NOT NULL DEFAULT 1.0,
  blink_speed decimal(8,2) NOT NULL DEFAULT 0, -- Average response time
  session_data jsonb DEFAULT '{}'::jsonb,
  started_at timestamptz NOT NULL,
  completed_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure session_id is unique per user
  UNIQUE(user_id, session_id)
);

-- ========================================
-- LEARNING PATHS TABLE
-- ========================================
-- Available learning content and paths
CREATE TABLE IF NOT EXISTS learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id text NOT NULL UNIQUE,
  path_name text NOT NULL,
  description text,
  difficulty_level integer NOT NULL CHECK (difficulty_level BETWEEN 1 AND 10),
  required_subscription text NOT NULL DEFAULT 'Free' CHECK (required_subscription IN ('Free', 'Premium', 'Pro')),
  content_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ========================================
-- STITCH POSITIONS TABLE
-- ========================================
-- Individual stitch tracking with spaced repetition
CREATE TABLE IF NOT EXISTS stitch_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  learning_path text NOT NULL,
  stitch_id text NOT NULL,
  current_position integer NOT NULL DEFAULT 1,
  skip_number integer NOT NULL DEFAULT 4, -- From spaced repetition sequence
  next_review_at timestamptz,
  mastery_level integer NOT NULL DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 5),
  times_seen integer NOT NULL DEFAULT 0,
  times_correct integer NOT NULL DEFAULT 0,
  last_seen_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- One position record per user/path/stitch combination
  UNIQUE(user_id, learning_path, stitch_id)
);

-- ========================================
-- USER STATE HISTORY TABLE (Optional)
-- ========================================
-- Track state changes for debugging and analytics
CREATE TABLE IF NOT EXISTS user_state_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  change_type text NOT NULL, -- 'update', 'migration', 'creation'
  old_state jsonb,
  new_state jsonb NOT NULL,
  version_from bigint,
  version_to bigint NOT NULL,
  sync_source text,
  created_at timestamptz DEFAULT now()
);

-- ========================================
-- ACHIEVEMENTS TABLE (Optional)
-- ========================================
-- User achievements and milestones
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  achievement_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  earned_at timestamptz DEFAULT now(),
  session_id text, -- Link to the session where achievement was earned
  created_at timestamptz DEFAULT now()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_anonymous_id ON users(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_expires_at ON users(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);

-- User state indexes
CREATE INDEX IF NOT EXISTS idx_user_state_user_id ON user_state(user_id);
CREATE INDEX IF NOT EXISTS idx_user_state_updated_at ON user_state(updated_at);
CREATE INDEX IF NOT EXISTS idx_user_state_version ON user_state(version);

-- Session metrics indexes
CREATE INDEX IF NOT EXISTS idx_session_metrics_user_id ON session_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_session_metrics_learning_path ON session_metrics(learning_path);
CREATE INDEX IF NOT EXISTS idx_session_metrics_started_at ON session_metrics(started_at);
CREATE INDEX IF NOT EXISTS idx_session_metrics_session_id ON session_metrics(session_id);

-- Learning paths indexes
CREATE INDEX IF NOT EXISTS idx_learning_paths_path_id ON learning_paths(path_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_active ON learning_paths(is_active);
CREATE INDEX IF NOT EXISTS idx_learning_paths_subscription ON learning_paths(required_subscription);

-- Stitch positions indexes
CREATE INDEX IF NOT EXISTS idx_stitch_positions_user_id ON stitch_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_stitch_positions_learning_path ON stitch_positions(learning_path);
CREATE INDEX IF NOT EXISTS idx_stitch_positions_next_review ON stitch_positions(next_review_at) WHERE next_review_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stitch_positions_user_path ON stitch_positions(user_id, learning_path);

-- History and achievements indexes
CREATE INDEX IF NOT EXISTS idx_user_state_history_user_id ON user_state_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_state_history_created_at ON user_state_history(created_at);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(achievement_type);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE stitch_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_state_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Learning paths are public (read-only based on subscription)
-- ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can access own data" ON users
  FOR SELECT USING ((select auth.uid()) = id);

-- Users can insert their own data during registration
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can access own state" ON user_state
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can access own metrics" ON session_metrics
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can access own stitch positions" ON stitch_positions
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can access own state history" ON user_state_history
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can access own achievements" ON achievements
  FOR SELECT USING ((select auth.uid()) = user_id);

-- Learning paths are readable by all authenticated users
CREATE POLICY "Learning paths are readable" ON learning_paths
  FOR SELECT USING (auth.role() = 'authenticated');

-- ========================================
-- STORED PROCEDURES
-- ========================================

-- Function to update user state with version checking
CREATE OR REPLACE FUNCTION update_user_state_with_version(
  p_user_id uuid,
  p_state_changes jsonb,
  p_expected_version bigint,
  p_sync_source text
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  version bigint,
  updated_at timestamptz
) AS $$
BEGIN
  -- Check current version
  IF NOT EXISTS (
    SELECT 1 FROM user_state 
    WHERE user_state.user_id = p_user_id AND user_state.version = p_expected_version
  ) THEN
    RAISE EXCEPTION 'version_conflict: Expected version % but current version is different', p_expected_version;
  END IF;

  -- Update with incremented version
  RETURN QUERY
  UPDATE user_state SET
    stitch_positions = COALESCE(p_state_changes->>'stitchPositions', stitch_positions::text)::jsonb,
    triple_helix_state = COALESCE(p_state_changes->>'tripleHelixState', triple_helix_state::text)::jsonb,
    spaced_repetition_state = COALESCE(p_state_changes->>'spacedRepetitionState', spaced_repetition_state::text)::jsonb,
    progress_metrics = COALESCE(p_state_changes->>'progressMetrics', progress_metrics::text)::jsonb,
    version = p_expected_version + 1,
    last_sync_time = now(),
    sync_source = p_sync_source,
    updated_at = now()
  WHERE user_state.user_id = p_user_id AND user_state.version = p_expected_version
  RETURNING user_state.id, user_state.user_id, user_state.version, user_state.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to migrate anonymous user to registered
CREATE OR REPLACE FUNCTION migrate_anonymous_user(
  p_anonymous_id text,
  p_registered_user_id uuid,
  p_preserve_data boolean DEFAULT true
)
RETURNS jsonb AS $$
DECLARE
  v_anonymous_user_id uuid;
  v_migration_result jsonb;
BEGIN
  -- Find the anonymous user
  SELECT id INTO v_anonymous_user_id 
  FROM users 
  WHERE anonymous_id = p_anonymous_id AND user_type = 'anonymous';
  
  IF v_anonymous_user_id IS NULL THEN
    RAISE EXCEPTION 'anonymous_user_not_found: Anonymous user % not found', p_anonymous_id;
  END IF;
  
  -- Check if registered user already has data
  IF EXISTS (SELECT 1 FROM user_state WHERE user_id = p_registered_user_id) THEN
    RAISE EXCEPTION 'registered_user_exists: Registered user % already has state data', p_registered_user_id;
  END IF;
  
  IF p_preserve_data THEN
    -- Copy user state to registered user
    INSERT INTO user_state (
      user_id, stitch_positions, triple_helix_state, spaced_repetition_state,
      progress_metrics, version, last_sync_time, sync_source
    )
    SELECT 
      p_registered_user_id, stitch_positions, triple_helix_state, spaced_repetition_state,
      progress_metrics, 1, now(), 'user_migration'
    FROM user_state WHERE user_id = v_anonymous_user_id;
    
    -- Copy session metrics
    UPDATE session_metrics 
    SET user_id = p_registered_user_id 
    WHERE user_id = v_anonymous_user_id;
    
    -- Copy stitch positions
    UPDATE stitch_positions 
    SET user_id = p_registered_user_id 
    WHERE user_id = v_anonymous_user_id;
    
    -- Copy achievements
    UPDATE achievements 
    SET user_id = p_registered_user_id 
    WHERE user_id = v_anonymous_user_id;
  END IF;
  
  -- Create migration record
  v_migration_result := jsonb_build_object(
    'anonymous_user_id', v_anonymous_user_id,
    'registered_user_id', p_registered_user_id,
    'data_preserved', p_preserve_data,
    'migrated_at', now()
  );
  
  -- Delete anonymous user data
  DELETE FROM user_state WHERE user_id = v_anonymous_user_id;
  DELETE FROM users WHERE id = v_anonymous_user_id;
  
  RETURN v_migration_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired anonymous users
CREATE OR REPLACE FUNCTION cleanup_expired_anonymous_users()
RETURNS INTEGER AS $$
DECLARE
  v_cleanup_count INTEGER;
BEGIN
  -- Delete expired anonymous users and their data (CASCADE will handle related records)
  WITH deleted_users AS (
    DELETE FROM users 
    WHERE user_type = 'anonymous' 
      AND expires_at IS NOT NULL 
      AND expires_at < now()
    RETURNING id
  )
  SELECT COUNT(*) INTO v_cleanup_count FROM deleted_users;
  
  RETURN v_cleanup_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- TRIGGERS
-- ========================================

-- Update updated_at timestamp on record changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_state_updated_at 
  BEFORE UPDATE ON user_state 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_paths_updated_at 
  BEFORE UPDATE ON learning_paths 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stitch_positions_updated_at 
  BEFORE UPDATE ON stitch_positions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- INITIAL DATA
-- ========================================

-- Insert default learning paths
INSERT INTO learning_paths (path_id, path_name, description, difficulty_level, required_subscription, content_data, sort_order) VALUES
  ('addition', 'Addition', 'Basic addition facts and operations', 2, 'Free', '{"facts": ["1+1", "1+2", "2+2", "2+3"], "maxFact": 20}', 1),
  ('subtraction', 'Subtraction', 'Basic subtraction facts and operations', 2, 'Free', '{"facts": ["2-1", "3-1", "3-2", "4-2"], "maxFact": 20}', 2),
  ('multiplication', 'Multiplication', 'Multiplication tables and facts', 3, 'Free', '{"facts": ["2x2", "2x3", "3x3", "2x4"], "tables": [2, 3, 4, 5]}', 3),
  ('division', 'Division', 'Division facts and operations', 4, 'Premium', '{"facts": ["4÷2", "6÷2", "6÷3", "8÷2"], "maxDividend": 100}', 4)
ON CONFLICT (path_id) DO NOTHING;

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE users IS 'Stores both anonymous and registered user accounts';
COMMENT ON TABLE user_state IS 'Current learning state for each user with version control';
COMMENT ON TABLE session_metrics IS 'Individual session performance and analytics data';
COMMENT ON TABLE learning_paths IS 'Available learning content and curriculum paths';
COMMENT ON TABLE stitch_positions IS 'Individual stitch tracking with spaced repetition data';
COMMENT ON TABLE user_state_history IS 'Historical state changes for audit and debugging';
COMMENT ON TABLE achievements IS 'User achievements and milestone tracking';

COMMENT ON FUNCTION update_user_state_with_version IS 'Updates user state with optimistic locking via version checking';
COMMENT ON FUNCTION migrate_anonymous_user IS 'Migrates all data from anonymous user to registered user account';
COMMENT ON FUNCTION cleanup_expired_anonymous_users IS 'Removes expired anonymous users and cleans up orphaned data';