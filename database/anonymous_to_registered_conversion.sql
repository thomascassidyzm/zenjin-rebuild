-- Anonymous to Registered User Conversion
-- Handles the critical flow when anonymous users sign up
-- Preserves all user data while converting user type

-- Function to convert anonymous user to registered
CREATE OR REPLACE FUNCTION convert_anonymous_to_registered(
  p_user_id UUID,
  p_email TEXT,
  p_display_name TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  user_exists BOOLEAN;
  is_anonymous BOOLEAN;
BEGIN
  -- Check if user exists and is anonymous
  SELECT 
    EXISTS(SELECT 1 FROM app_users WHERE id = p_user_id),
    (SELECT user_type = 'anonymous' FROM app_users WHERE id = p_user_id)
  INTO user_exists, is_anonymous;
  
  -- If user doesn't exist or isn't anonymous, return false
  IF NOT user_exists OR NOT is_anonymous THEN
    RETURN FALSE;
  END IF;
  
  -- Convert anonymous user to registered
  UPDATE app_users 
  SET 
    user_type = 'registered',
    anonymous_id = NULL,  -- Remove anonymous_id
    email = p_email,      -- Add email
    display_name = COALESCE(p_display_name, p_email),
    expires_at = NULL,    -- Remove TTL
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log the conversion (if admin system is available)
  IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_activity_log') THEN
    INSERT INTO admin_activity_log (
      admin_user_id, 
      action, 
      target_type, 
      target_id, 
      details
    ) VALUES (
      p_user_id,
      'user_conversion',
      'user',
      p_user_id::text,
      jsonb_build_object(
        'from_type', 'anonymous',
        'to_type', 'registered',
        'email', p_email,
        'converted_at', NOW()
      )
    );
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle auth.users INSERT that might be a conversion
CREATE OR REPLACE FUNCTION handle_auth_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  existing_anonymous_user UUID;
BEGIN
  -- Check if there's an anonymous user with matching criteria
  -- (This would need app-level logic to link anonymous user to auth signup)
  -- For now, we'll create the registered user normally
  
  INSERT INTO app_users (
    id,
    user_type,
    email,
    display_name,
    subscription_tier,
    created_at,
    updated_at,
    metadata
  ) VALUES (
    NEW.id,
    'registered',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'Free',
    NEW.created_at,
    NEW.updated_at,
    '{}'
  ) ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage of conversion function
-- This would be called from your app when anonymous user signs up
-- SELECT convert_anonymous_to_registered(
--   'anonymous-user-uuid-here',
--   'newuser@example.com',
--   'User Name'
-- );

-- Test the conversion function
CREATE OR REPLACE FUNCTION test_anonymous_conversion()
RETURNS TEXT AS $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  conversion_result BOOLEAN;
BEGIN
  -- Create test anonymous user
  INSERT INTO app_users (
    id,
    user_type,
    anonymous_id,
    display_name,
    subscription_tier,
    expires_at
  ) VALUES (
    test_user_id,
    'anonymous',
    'test_anon_' || test_user_id::text,
    'Test Anonymous User',
    'Free',
    NOW() + INTERVAL '30 days'
  );
  
  -- Convert to registered
  SELECT convert_anonymous_to_registered(
    test_user_id,
    'test@example.com',
    'Test Registered User'
  ) INTO conversion_result;
  
  -- Clean up test data
  DELETE FROM app_users WHERE id = test_user_id;
  
  IF conversion_result THEN
    RETURN 'SUCCESS: Anonymous to registered conversion works correctly';
  ELSE
    RETURN 'FAILED: Anonymous to registered conversion failed';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Run test
-- SELECT test_anonymous_conversion();