import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Initialize Supabase with service role key for admin operations
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Missing Supabase configuration' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('app_users')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      console.error('Error fetching users count:', usersError);
      return res.status(500).json({ error: 'Failed to fetch users count' });
    }

    // Get total facts count
    const { count: totalFacts, error: factsError } = await supabase
      .from('facts')
      .select('*', { count: 'exact', head: true });

    if (factsError) {
      console.error('Error fetching facts count:', factsError);
      return res.status(500).json({ error: 'Failed to fetch facts count' });
    }

    // Get total stitches count
    const { count: totalStitches, error: stitchesError } = await supabase
      .from('stitches')
      .select('*', { count: 'exact', head: true });

    if (stitchesError) {
      console.error('Error fetching stitches count:', stitchesError);
      return res.status(500).json({ error: 'Failed to fetch stitches count' });
    }

    // Get active sessions count (sessions from last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: activeSessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .gte('started_at', twentyFourHoursAgo);

    if (sessionsError) {
      console.error('Error fetching sessions count:', sessionsError);
      return res.status(500).json({ error: 'Failed to fetch sessions count' });
    }

    // Determine system health based on basic metrics
    let systemHealth: 'healthy' | 'warning' | 'error' = 'healthy';
    if ((totalUsers || 0) === 0 || (totalFacts || 0) === 0) {
      systemHealth = 'error';
    } else if ((activeSessions || 0) === 0) {
      systemHealth = 'warning';
    }

    const stats = {
      totalUsers: totalUsers || 0,
      totalFacts: totalFacts || 0,
      totalStitches: totalStitches || 0,
      activeSessions: activeSessions || 0,
      systemHealth
    };

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}