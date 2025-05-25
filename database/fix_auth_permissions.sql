-- Fix Supabase auth schema permissions
-- Run this in Supabase SQL Editor

-- Ensure the auth schema exists and has proper permissions
GRANT USAGE ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO supabase_auth_admin;

-- Ensure the auth.users table has the is_anonymous column
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users' 
AND column_name = 'is_anonymous';

-- If the column exists, this should return one row
-- If not, we need to recreate it