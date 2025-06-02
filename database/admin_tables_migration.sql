-- Admin Tables Migration
-- Implements admin_database_migration_interface.apml
-- Migration ID: 20250602_001_create_admin_tables
-- Status: Ready for execution

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY,
  role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'content_admin', 'user_admin')),
  permissions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL,
  last_admin_activity TIMESTAMP WITH TIME ZONE NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT NULL,
  CONSTRAINT admin_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE,
  CONSTRAINT admin_users_created_by_fkey FOREIGN KEY (created_by) REFERENCES app_users(id),
  CONSTRAINT admin_users_valid_permissions CHECK (jsonb_typeof(permissions) = 'array')
);

-- Create indexes for admin_users
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active, role);
CREATE INDEX IF NOT EXISTS idx_admin_users_created_at ON admin_users(created_at);

-- Create admin_activity_log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NULL CHECK (target_type IN ('user', 'fact', 'stitch', 'session', 'system', 'export')),
  target_id VARCHAR(255) NULL,
  details JSONB NOT NULL DEFAULT '{}',
  ip_address INET NULL,
  user_agent TEXT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT admin_activity_log_admin_user_id_fkey FOREIGN KEY (admin_user_id) REFERENCES admin_users(user_id) ON DELETE CASCADE
);

-- Create indexes for admin_activity_log
CREATE INDEX IF NOT EXISTS idx_admin_activity_admin_user ON admin_activity_log(admin_user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_admin_activity_action ON admin_activity_log(action, timestamp);
CREATE INDEX IF NOT EXISTS idx_admin_activity_timestamp ON admin_activity_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_admin_activity_target ON admin_activity_log(target_type, target_id);

-- Create admin users with permissions view
CREATE OR REPLACE VIEW admin_users_with_permissions AS
SELECT 
  au.user_id,
  u.email,
  u.display_name,
  au.role,
  au.permissions,
  au.created_at,
  au.last_admin_activity,
  au.is_active,
  CASE 
    WHEN au.last_admin_activity > NOW() - INTERVAL '24 hours' THEN true
    ELSE false
  END as recently_active
FROM admin_users au
JOIN app_users u ON au.user_id = u.id
WHERE au.is_active = true;

-- Create admin activity summary view
CREATE OR REPLACE VIEW admin_activity_summary AS
SELECT 
  admin_user_id,
  u.email as admin_email,
  action,
  target_type,
  COUNT(*) as action_count,
  MIN(timestamp) as first_occurrence,
  MAX(timestamp) as last_occurrence,
  DATE(timestamp) as activity_date
FROM admin_activity_log aal
JOIN admin_users au ON aal.admin_user_id = au.user_id
JOIN app_users u ON au.user_id = u.id
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY admin_user_id, u.email, action, target_type, DATE(timestamp)
ORDER BY last_occurrence DESC;

-- Create check_admin_status function
CREATE OR REPLACE FUNCTION check_admin_status(input_user_id UUID)
RETURNS TABLE(
  is_admin BOOLEAN,
  role VARCHAR(50),
  permissions JSONB,
  last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE WHEN au.user_id IS NOT NULL THEN true ELSE false END as is_admin,
    au.role,
    au.permissions,
    au.last_admin_activity as last_activity
  FROM app_users u
  LEFT JOIN admin_users au ON u.id = au.user_id AND au.is_active = true
  WHERE u.id = input_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create log_admin_activity function
CREATE OR REPLACE FUNCTION log_admin_activity(
  admin_user_id UUID,
  action_name VARCHAR(100),
  target_type VARCHAR(50) DEFAULT NULL,
  target_id VARCHAR(255) DEFAULT NULL,
  action_details JSONB DEFAULT '{}',
  client_ip INET DEFAULT NULL,
  client_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  -- Insert activity log
  INSERT INTO admin_activity_log (
    admin_user_id, action, target_type, target_id, 
    details, ip_address, user_agent
  ) VALUES (
    admin_user_id, action_name, target_type, target_id,
    action_details, client_ip, client_user_agent
  ) RETURNING id INTO log_id;
  
  -- Update last admin activity
  UPDATE admin_users 
  SET last_admin_activity = NOW()
  WHERE user_id = admin_user_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security on admin tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policy for admin_users SELECT
CREATE POLICY admin_users_select_policy ON admin_users
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'authenticated');

-- Create policy for admin_users INSERT (only super admins can create admin users)
CREATE POLICY admin_users_insert_policy ON admin_users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND 'manage_system' = ANY(SELECT jsonb_array_elements_text(permissions))
      AND is_active = true
    )
  );

-- Create policy for admin_users UPDATE (only super admins can modify admin users)
CREATE POLICY admin_users_update_policy ON admin_users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND 'manage_system' = ANY(SELECT jsonb_array_elements_text(permissions))
      AND is_active = true
    )
  );

-- Create policy for admin_activity_log SELECT (admin users can view logs)
CREATE POLICY admin_activity_log_select_policy ON admin_activity_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Create policy for admin_activity_log INSERT (admin users can create logs)
CREATE POLICY admin_activity_log_insert_policy ON admin_activity_log
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Migration completion notice
DO $$
BEGIN
  RAISE NOTICE 'Admin tables migration completed successfully!';
  RAISE NOTICE 'Tables created: admin_users, admin_activity_log';
  RAISE NOTICE 'Views created: admin_users_with_permissions, admin_activity_summary';
  RAISE NOTICE 'Functions created: check_admin_status, log_admin_activity';
  RAISE NOTICE 'Row Level Security enabled with appropriate policies';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create your first admin user using the admin user creation guide';
  RAISE NOTICE '2. Test admin authentication in the application';
  RAISE NOTICE '3. Verify admin interface access controls';
END $$;