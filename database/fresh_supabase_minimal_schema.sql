-- Minimal Schema for Fresh Supabase Project
-- Just the essential app_users table to resolve authentication
-- Created: 2025-05-25

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- APP_USERS TABLE (renamed to avoid conflict)
-- ========================================
-- Essential user table for authentication - renamed from 'users' to 'app_users'
CREATE TABLE IF NOT EXISTS app_users (
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
  CONSTRAINT app_users_anonymous_id_check CHECK (
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
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
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
-- BASIC INDEXES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_app_users_user_type ON app_users(user_type);
CREATE INDEX IF NOT EXISTS idx_app_users_anonymous_id ON app_users(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_user_state_user_id ON user_state(user_id);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_state ENABLE ROW LEVEL SECURITY;

-- Users can access their own data
CREATE POLICY "Users can access own data" ON app_users
  FOR ALL USING (true); -- Temporarily allow all access for testing

CREATE POLICY "Users can access own state" ON user_state
  FOR ALL USING (true); -- Temporarily allow all access for testing

-- ========================================
-- UPDATE TRIGGER
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_app_users_updated_at 
  BEFORE UPDATE ON app_users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_state_updated_at 
  BEFORE UPDATE ON user_state 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- COMMENTS
-- ========================================
COMMENT ON TABLE app_users IS 'Essential user table - renamed from users to avoid auth.users conflict';
COMMENT ON TABLE user_state IS 'Current learning state for each user';