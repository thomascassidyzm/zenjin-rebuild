-- Fix User Sync Issue (Safe Version)
-- This solves the problem where auth.users and app_users are out of sync
-- Run this entire file in Supabase SQL Editor

-- Step 1: Migrate all existing auth users to app_users
INSERT INTO app_users (id, email, display_name, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email) as display_name,
  created_at,
  updated_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM app_users)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create function to sync new auth users to app_users automatically
CREATE OR REPLACE FUNCTION sync_auth_user_to_app_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO app_users (
    id,
    email,
    display_name,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.created_at,
    NEW.updated_at
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create trigger to automatically sync future users (only if it doesn't exist)
CREATE TRIGGER sync_auth_user_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_to_app_user();

-- Step 4: Verify the sync worked
SELECT 
  COUNT(*) as auth_users_count
FROM auth.users;

SELECT 
  COUNT(*) as app_users_count
FROM app_users;

-- Both counts should be the same after running this script