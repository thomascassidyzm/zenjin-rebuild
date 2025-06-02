# Admin User Creation Guide

## Overview

This guide provides step-by-step instructions for creating admin users in the Zenjin Maths application. Admin users can **only** be created manually through direct database access for security reasons.

## Prerequisites

1. **Database Access**: Direct access to the Supabase PostgreSQL database
2. **Admin Tables**: The admin tables migration must be completed first
3. **User Account**: The target user must already have a regular user account

## Security Notice

⚠️ **SECURITY**: Admin users can only be created manually through database access. There is no self-service admin registration to maintain strict security control.

## Step-by-Step Instructions

### 1. Run the Admin Tables Migration

First, ensure the admin tables have been created:

```sql
-- Run the admin migration if not already done
\i database/admin_tables_migration.sql
```

### 2. Identify the Target User

Find the user ID of the account you want to make an admin:

```sql
-- Find user by email
SELECT id, email, display_name, created_at 
FROM app_users 
WHERE email = 'admin@example.com';
```

Copy the `id` value - you'll need it for the next step.

### 3. Create the Admin User

Choose the appropriate admin role and permissions:

#### Super Admin (Full Access)
```sql
INSERT INTO admin_users (
  user_id, 
  role, 
  permissions, 
  created_by, 
  notes
) VALUES (
  'REPLACE_WITH_USER_ID',  -- Replace with actual user ID from step 2
  'super_admin',
  '["read_stats","read_content","read_users","write_content","write_users","delete_content","delete_users","manage_system"]'::jsonb,
  'REPLACE_WITH_USER_ID',  -- Same user ID (self-created) or creator's ID
  'Initial super admin created during setup'
);
```

#### Content Admin (Content Management Only)
```sql
INSERT INTO admin_users (
  user_id, 
  role, 
  permissions, 
  created_by, 
  notes
) VALUES (
  'REPLACE_WITH_USER_ID',
  'content_admin',
  '["read_stats","read_content","read_users","write_content","delete_content"]'::jsonb,
  'REPLACE_WITH_CREATOR_USER_ID',
  'Content admin for managing facts and stitches'
);
```

#### User Admin (Read-Only Analytics)
```sql
INSERT INTO admin_users (
  user_id, 
  role, 
  permissions, 
  created_by, 
  notes
) VALUES (
  'REPLACE_WITH_USER_ID',
  'user_admin',
  '["read_stats","read_users"]'::jsonb,
  'REPLACE_WITH_CREATOR_USER_ID',
  'User admin for analytics and user management'
);
```

### 4. Verify Admin User Creation

Check that the admin user was created successfully:

```sql
-- Verify admin user
SELECT 
  au.user_id,
  u.email,
  u.display_name,
  au.role,
  au.permissions,
  au.created_at,
  au.is_active
FROM admin_users au
JOIN app_users u ON au.user_id = u.id
WHERE au.user_id = 'REPLACE_WITH_USER_ID';
```

### 5. Test Admin Status Function

Test the admin status detection function:

```sql
-- Test admin status check
SELECT * FROM check_admin_status('REPLACE_WITH_USER_ID');
```

Expected result:
- `is_admin`: `true`
- `role`: The role you assigned
- `permissions`: JSON array of permissions
- `last_activity`: `null` (until first admin login)

## Admin Roles and Permissions

### Permission Matrix

| Permission | Super Admin | Content Admin | User Admin |
|------------|-------------|---------------|------------|
| `read_stats` | ✅ | ✅ | ✅ |
| `read_content` | ✅ | ✅ | ❌ |
| `read_users` | ✅ | ✅ | ✅ |
| `write_content` | ✅ | ✅ | ❌ |
| `write_users` | ✅ | ❌ | ❌ |
| `delete_content` | ✅ | ✅ | ❌ |
| `delete_users` | ✅ | ❌ | ❌ |
| `manage_system` | ✅ | ❌ | ❌ |

### Role Descriptions

- **Super Admin**: Full system access, can create other admins
- **Content Admin**: Can manage mathematical facts, stitches, and learning content
- **User Admin**: Read-only access for analytics and user oversight

## Testing Admin Access

### 1. Login Test

1. Have the new admin user log into the application
2. Check browser console for admin detection messages:
   ```
   🔍 Admin status queried for user [ID]: ADMIN
   🔐 User admin status updated in session: {...}
   ```

### 2. UI Test

1. After login, verify admin entry point appears in navigation header
2. Click the admin entry point
3. Confirm admin interface access

### 3. Database Logging Test

Check that admin activity is being logged:

```sql
-- Check recent admin activity
SELECT 
  aal.admin_user_id,
  u.email,
  aal.action,
  aal.timestamp
FROM admin_activity_log aal
JOIN admin_users au ON aal.admin_user_id = au.user_id
JOIN app_users u ON au.user_id = u.id
ORDER BY aal.timestamp DESC
LIMIT 10;
```

## Troubleshooting

### Admin Entry Point Not Appearing

1. **Check User ID**: Verify the correct user ID was used
2. **Check Database**: Confirm admin record exists and `is_active = true`
3. **Check Console**: Look for admin detection errors in browser console
4. **Clear Cache**: Try logging out and back in

### Admin Status Query Fails

1. **Check Foreign Keys**: Ensure user exists in `app_users` table
2. **Check Permissions**: Verify database user has SELECT access to admin tables
3. **Check RLS Policies**: Ensure Row Level Security policies allow access

### Permission Errors

1. **Check JSON Format**: Ensure permissions are valid JSON array
2. **Check Constraints**: Verify role is one of the allowed values
3. **Check Function**: Test `check_admin_status()` function directly

## Security Best Practices

1. **Minimal Admins**: Only create admin users when absolutely necessary
2. **Least Privilege**: Assign the minimum required role and permissions
3. **Activity Monitoring**: Regularly review admin activity logs
4. **Regular Audits**: Periodically review active admin users
5. **Deactivation**: Set `is_active = false` instead of deleting admin records

## Example: Complete Setup

Here's a complete example of creating your first super admin:

```sql
-- 1. Find your user account
SELECT id, email FROM app_users WHERE email = 'your-email@example.com';

-- 2. Create super admin (replace USER_ID with actual ID from step 1)
INSERT INTO admin_users (
  user_id, 
  role, 
  permissions, 
  created_by, 
  notes
) VALUES (
  '11111111-1111-1111-1111-111111111111',  -- Replace with your actual user ID
  'super_admin',
  '["read_stats","read_content","read_users","write_content","write_users","delete_content","delete_users","manage_system"]'::jsonb,
  '11111111-1111-1111-1111-111111111111',  -- Same ID (self-created)
  'Initial super admin - system setup'
);

-- 3. Verify creation
SELECT * FROM admin_users_with_permissions 
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- 4. Test admin function
SELECT * FROM check_admin_status('11111111-1111-1111-1111-111111111111');
```

After running these commands, log out and back into the application. You should see the admin entry point in the navigation header.

## Support

If you encounter issues:

1. Check the application console for error messages
2. Verify all migration steps were completed
3. Ensure user IDs are correct and exist in `app_users`
4. Review the admin activity logs for debugging information

The admin system is designed to be secure and auditable. All admin actions are automatically logged for compliance and security monitoring.