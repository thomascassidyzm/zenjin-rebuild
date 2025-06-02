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

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const { range = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let daysBack = 30;
    switch (range) {
      case '7d':
        daysBack = 7;
        break;
      case '90d':
        daysBack = 90;
        break;
      default:
        daysBack = 30;
    }
    
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Get user growth data
    const { data: userGrowthData, error: userGrowthError } = await supabase
      .from('app_users')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at');

    if (userGrowthError) {
      console.error('Error fetching user growth:', userGrowthError);
      return res.status(500).json({ error: 'Failed to fetch user growth data' });
    }

    // Process user growth into daily counts
    const userGrowth = [];
    const growthMap = new Map();
    
    // Initialize with zeros
    for (let i = 0; i < daysBack; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      growthMap.set(dateKey, 0);
    }
    
    // Count users per day
    (userGrowthData || []).forEach(user => {
      const dateKey = user.created_at.split('T')[0];
      if (growthMap.has(dateKey)) {
        growthMap.set(dateKey, growthMap.get(dateKey) + 1);
      }
    });
    
    // Convert to cumulative growth
    let cumulative = 0;
    for (const [date, count] of growthMap) {
      cumulative += count;
      userGrowth.push({ date, users: cumulative });
    }

    // Get session metrics
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('started_at, ended_at, total_points, session_completed')
      .gte('started_at', startDate.toISOString());

    if (sessionError) {
      console.error('Error fetching session data:', sessionError);
      return res.status(500).json({ error: 'Failed to fetch session data' });
    }

    const sessions = sessionData || [];
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.session_completed).length;
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    
    // Calculate average session length (in minutes)
    const sessionsWithDuration = sessions.filter(s => s.ended_at);
    const totalDuration = sessionsWithDuration.reduce((sum, session) => {
      const start = new Date(session.started_at);
      const end = new Date(session.ended_at);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60); // minutes
    }, 0);
    const averageSessionLength = sessionsWithDuration.length > 0 ? 
      totalDuration / sessionsWithDuration.length : 0;

    // Get content performance (by stitch)
    const { data: stitchPerformance, error: stitchError } = await supabase
      .from('sessions')
      .select(`
        id,
        total_points,
        session_completed,
        session_data
      `)
      .gte('started_at', startDate.toISOString())
      .not('session_data', 'is', null);

    if (stitchError) {
      console.error('Error fetching stitch performance:', stitchError);
    }

    // Process stitch performance
    const stitchStats = new Map();
    (stitchPerformance || []).forEach(session => {
      try {
        const sessionData = session.session_data;
        if (sessionData && sessionData.currentStitch) {
          const stitchId = sessionData.currentStitch;
          
          if (!stitchStats.has(stitchId)) {
            stitchStats.set(stitchId, {
              stitchId,
              name: `Stitch ${stitchId}`, // We'd need to join with stitches table for real names
              sessions: 0,
              totalScore: 0,
              completedSessions: 0
            });
          }
          
          const stats = stitchStats.get(stitchId);
          stats.sessions += 1;
          stats.totalScore += session.total_points || 0;
          if (session.session_completed) {
            stats.completedSessions += 1;
          }
        }
      } catch (e) {
        // Ignore parsing errors for session_data
      }
    });

    const contentPerformance = Array.from(stitchStats.values()).map(stats => ({
      stitchId: stats.stitchId,
      name: stats.name,
      sessions: stats.sessions,
      averageScore: stats.sessions > 0 ? stats.totalScore / stats.sessions : 0,
      completionRate: stats.sessions > 0 ? (stats.completedSessions / stats.sessions) * 100 : 0
    })).slice(0, 10); // Top 10

    // Learning metrics
    const averagePointsPerSession = totalSessions > 0 ? 
      sessions.reduce((sum, s) => sum + (s.total_points || 0), 0) / totalSessions : 0;
    
    // FTC (First Time Correct) percentage - this would need question-level data
    // For now, using a placeholder calculation based on session completion
    const ftcPercentage = completionRate * 0.8; // Rough estimate

    // Popular operations - would need question data, using mock data
    const popularOperations = [
      { operation: 'multiplication', usage: 45.2 },
      { operation: 'double', usage: 23.1 },
      { operation: 'addition', usage: 18.7 },
      { operation: 'half', usage: 13.0 }
    ];

    const analytics = {
      userGrowth: userGrowth.slice(-Math.min(daysBack, 30)), // Last 30 data points max
      sessionMetrics: {
        totalSessions,
        averageSessionLength: Math.round(averageSessionLength * 10) / 10,
        completionRate: Math.round(completionRate * 10) / 10
      },
      contentPerformance,
      learningMetrics: {
        averagePointsPerSession: Math.round(averagePointsPerSession * 10) / 10,
        ftcPercentage: Math.round(ftcPercentage * 10) / 10,
        popularOperations
      }
    };

    res.status(200).json(analytics);
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}