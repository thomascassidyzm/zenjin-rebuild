import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize Supabase with service role key for admin operations
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Missing Supabase configuration' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get all users with optional filtering and aggregated data
        const { 
          user_type, 
          subscription_tier, 
          is_active, 
          search, 
          limit = 100, 
          offset = 0 
        } = req.query;
        
        // Build query for users with session stats
        let userQuery = supabase
          .from('app_users')
          .select(`
            id,
            email,
            display_name,
            user_type,
            subscription_tier,
            created_at,
            is_active
          `)
          .order('created_at', { ascending: false });

        // Apply filters
        if (user_type && user_type !== 'all') {
          userQuery = userQuery.eq('user_type', user_type);
        }

        if (subscription_tier && subscription_tier !== 'all') {
          userQuery = userQuery.eq('subscription_tier', subscription_tier);
        }

        if (is_active !== undefined) {
          userQuery = userQuery.eq('is_active', is_active === 'true');
        }

        if (search) {
          userQuery = userQuery.or(`email.ilike.%${search}%,display_name.ilike.%${search}%,id.ilike.%${search}%`);
        }

        userQuery = userQuery.range(Number(offset), Number(offset) + Number(limit) - 1);

        const { data: users, error: usersError } = await userQuery;

        if (usersError) {
          console.error('Error fetching users:', usersError);
          return res.status(500).json({ error: 'Failed to fetch users' });
        }

        // For each user, get their session stats
        const usersWithStats = await Promise.all(
          (users || []).map(async (user) => {
            // Get session count and last session
            const { data: sessions, error: sessionsError } = await supabase
              .from('sessions')
              .select('started_at, total_points')
              .eq('user_id', user.id)
              .order('started_at', { ascending: false });

            if (sessionsError) {
              console.warn(`Error fetching sessions for user ${user.id}:`, sessionsError);
            }

            const sessionData = sessions || [];
            const totalSessions = sessionData.length;
            const totalPoints = sessionData.reduce((sum, session) => sum + (session.total_points || 0), 0);
            const lastSession = sessionData[0]?.started_at || null;

            // Get current tube from user_state
            const { data: userState, error: stateError } = await supabase
              .from('user_state')
              .select('current_tube')
              .eq('user_id', user.id)
              .single();

            if (stateError) {
              console.warn(`Error fetching user state for ${user.id}:`, stateError);
            }

            return {
              ...user,
              last_session_at: lastSession,
              total_sessions: totalSessions,
              total_points: totalPoints,
              active_tube: userState?.current_tube || 1
            };
          })
        );

        return res.status(200).json(usersWithStats);

      case 'PUT':
        // Update user (admin actions like deactivating, changing subscription)
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Missing user ID' });
        }

        const updates = req.body;
        
        // Only allow specific admin updates
        const allowedUpdates = ['is_active', 'subscription_tier', 'display_name'];
        const filteredUpdates = Object.keys(updates)
          .filter(key => allowedUpdates.includes(key))
          .reduce((obj, key) => {
            obj[key] = updates[key];
            return obj;
          }, {});

        if (Object.keys(filteredUpdates).length === 0) {
          return res.status(400).json({ error: 'No valid updates provided' });
        }

        const { data: updatedUser, error: updateError } = await supabase
          .from('app_users')
          .update(filteredUpdates)
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating user:', updateError);
          return res.status(500).json({ error: 'Failed to update user' });
        }

        return res.status(200).json(updatedUser);

      case 'DELETE':
        // Delete user (careful operation)
        const { id: deleteId } = req.query;
        if (!deleteId) {
          return res.status(400).json({ error: 'Missing user ID' });
        }

        // First delete related data (sessions, user_state)
        await supabase.from('sessions').delete().eq('user_id', deleteId);
        await supabase.from('user_state').delete().eq('user_id', deleteId);

        // Then delete the user
        const { error: deleteError } = await supabase
          .from('app_users')
          .delete()
          .eq('id', deleteId);

        if (deleteError) {
          console.error('Error deleting user:', deleteError);
          return res.status(500).json({ error: 'Failed to delete user' });
        }

        return res.status(200).json({ message: 'User deleted successfully' });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin users API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}