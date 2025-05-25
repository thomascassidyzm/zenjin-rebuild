-- APML-Compliant Database Reset and Initialization
-- Drops existing tables and recreates with correct schema
-- Run this in Supabase SQL Editor

-- ========================================
-- DROP EXISTING TABLES (IF ANY)
-- ========================================
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS user_state_history CASCADE;
DROP TABLE IF EXISTS stitch_positions CASCADE;
DROP TABLE IF EXISTS session_metrics CASCADE;
DROP TABLE IF EXISTS user_state CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS learning_paths CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_user_state_with_version CASCADE;
DROP FUNCTION IF EXISTS migrate_anonymous_user CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_anonymous_users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- ========================================
-- USERS TABLE
-- ========================================
-- Stores both anonymous and registered users
CREATE TABLE users (
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
CREATE TABLE user_state (
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
CREATE TABLE session_metrics (
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
CREATE TABLE learning_paths (
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
CREATE TABLE stitch_positions (
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
CREATE TABLE user_state_history (
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
CREATE TABLE achievements (
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
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_anonymous_id ON users(anonymous_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_expires_at ON users(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);

-- User state indexes
CREATE INDEX idx_user_state_user_id ON user_state(user_id);
CREATE INDEX idx_user_state_updated_at ON user_state(updated_at);
CREATE INDEX idx_user_state_version ON user_state(version);

-- Session metrics indexes
CREATE INDEX idx_session_metrics_user_id ON session_metrics(user_id);
CREATE INDEX idx_session_metrics_learning_path ON session_metrics(learning_path);
CREATE INDEX idx_session_metrics_started_at ON session_metrics(started_at);
CREATE INDEX idx_session_metrics_session_id ON session_metrics(session_id);

-- Learning paths indexes
CREATE INDEX idx_learning_paths_path_id ON learning_paths(path_id);
CREATE INDEX idx_learning_paths_active ON learning_paths(is_active);
CREATE INDEX idx_learning_paths_subscription ON learning_paths(required_subscription);

-- Stitch positions indexes
CREATE INDEX idx_stitch_positions_user_id ON stitch_positions(user_id);
CREATE INDEX idx_stitch_positions_learning_path ON stitch_positions(learning_path);
CREATE INDEX idx_stitch_positions_next_review ON stitch_positions(next_review_at) WHERE next_review_at IS NOT NULL;
CREATE INDEX idx_stitch_positions_user_path ON stitch_positions(user_id, learning_path);

-- History and achievements indexes
CREATE INDEX idx_user_state_history_user_id ON user_state_history(user_id);
CREATE INDEX idx_user_state_history_created_at ON user_state_history(created_at);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_type ON achievements(achievement_type);

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

-- Users can access and insert their own data
CREATE POLICY "Users can access own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can access own state" ON user_state
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can access own metrics" ON session_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can access own stitch positions" ON stitch_positions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can access own state history" ON user_state_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can access own achievements" ON achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Learning paths are readable by all authenticated users
CREATE POLICY "Learning paths are readable" ON learning_paths
  FOR SELECT USING (auth.role() = 'authenticated');

-- ========================================
-- STORED PROCEDURES
-- ========================================

-- Function to update updated_at timestamp on record changes
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
  ('division', 'Division', 'Division facts and operations', 4, 'Premium', '{"facts": ["4÷2", "6÷2", "6÷3", "8÷2"], "maxDividend": 100}', 4);

-- ========================================
-- VERIFICATION
-- ========================================

-- Verify tables were created
SELECT 'VERIFICATION: Tables created successfully' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;