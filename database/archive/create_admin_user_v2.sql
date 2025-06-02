-- Create Admin User for Tom Cassidy (Version 2 - Fixed)
-- This script creates the user in app_users and makes them a super admin
-- Run this entire file in Supabase SQL Editor

-- Step 1: Create user in app_users table (with all required fields)
INSERT INTO app_users (
  id,
  email,
  display_name,
  user_type,
  subscription_tier,
  created_at,
  updated_at,
  metadata
) VALUES (
  'ec8aea50-fc28-4856-a147-5668fb3eaaba',
  'thomas.cassidy+zmadmin@gmail.com',
  'Tom Cassidy (Admin)',
  'authenticated',
  'Free',
  NOW(),
  NOW(),
  '{}'
) ON CONFLICT (id) DO NOTHING;

-- Step 2: Create super admin user
INSERT INTO admin_users (
  user_id, 
  role, 
  permissions, 
  created_by, 
  notes
) VALUES (
  'ec8aea50-fc28-4856-a147-5668fb3eaaba',
  'super_admin',
  jsonb_build_array(
    'read_stats',
    'read_content', 
    'read_users',
    'write_content',
    'write_users',
    'delete_content',
    'delete_users',
    'manage_system'
  ),
  'ec8aea50-fc28-4856-a147-5668fb3eaaba',
  'Initial super admin - Tom Cassidy'
);

-- Step 3: Verify admin user creation
SELECT 
  au.user_id,
  u.email,
  u.display_name,
  u.user_type,
  u.subscription_tier,
  au.role,
  au.permissions,
  au.created_at,
  au.is_active
FROM admin_users au
JOIN app_users u ON au.user_id = u.id
WHERE u.email = 'thomas.cassidy+zmadmin@gmail.com';

-- Step 4: Test admin status function
SELECT * FROM check_admin_status('ec8aea50-fc28-4856-a147-5668fb3eaaba');

-- Expected results:
-- Step 3 should show your admin user details with user_type='authenticated'
-- Step 4 should show: is_admin=true, role=super_admin, permissions array, last_activity=null