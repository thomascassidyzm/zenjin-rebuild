-- Check if there are any RLS policies on auth schema that might interfere
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'auth';

-- Check if RLS is enabled on auth.users
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'auth' AND tablename = 'users';

-- List all tables in auth schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'auth' 
ORDER BY table_name;