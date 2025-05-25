-- Restore Supabase auth schema to original state
-- THIS IS SAFE - it only affects internal Supabase auth tables, not our custom tables

-- First, let's see what's wrong with the auth.users table
-- Check if is_anonymous column exists and its properties
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users' 
AND column_name IN ('is_anonymous', 'id', 'email')
ORDER BY column_name;

-- Check if there are any constraints that might be broken
SELECT 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'auth' 
AND tc.table_name = 'users'
ORDER BY tc.constraint_type, tc.constraint_name;