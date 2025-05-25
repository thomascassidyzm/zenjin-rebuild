-- Fix table name conflict between auth.users and public.users
-- Rename our custom table so Supabase can find its own auth.users table

-- Rename our custom users table
ALTER TABLE public.users RENAME TO app_users;

-- Update all foreign key references
ALTER TABLE public.user_state 
  DROP CONSTRAINT user_state_user_id_fkey,
  ADD CONSTRAINT user_state_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;

ALTER TABLE public.session_metrics 
  DROP CONSTRAINT session_metrics_user_id_fkey,
  ADD CONSTRAINT session_metrics_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;

ALTER TABLE public.stitch_positions 
  DROP CONSTRAINT stitch_positions_user_id_fkey,
  ADD CONSTRAINT stitch_positions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;

ALTER TABLE public.user_state_history 
  DROP CONSTRAINT user_state_history_user_id_fkey,
  ADD CONSTRAINT user_state_history_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;

ALTER TABLE public.achievements 
  DROP CONSTRAINT achievements_user_id_fkey,
  ADD CONSTRAINT achievements_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.app_users(id) ON DELETE CASCADE;

-- Update RLS policies to use new table name
DROP POLICY IF EXISTS "Users can access own data" ON public.app_users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.app_users;

CREATE POLICY "Users can access own data" ON public.app_users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.app_users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Verification
SELECT 'Table renamed successfully' as status;
SELECT table_schema, table_name FROM information_schema.tables WHERE table_name LIKE '%users%' ORDER BY table_schema, table_name;