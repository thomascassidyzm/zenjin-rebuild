import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Debug ALL environment variables related to Supabase
  const allEnvKeys = Object.keys(process.env).filter(key => 
    key.includes('SUPABASE') || key.includes('VERCEL') || key.includes('NODE')
  );
  
  console.log('🔍 ALL Environment Variables:', allEnvKeys.reduce((acc, key) => {
    acc[key] = process.env[key] ? `${process.env[key].substring(0, 20)}...` : 'MISSING';
    return acc;
  }, {}));
  
  console.log('🔍 Raw SERVICE_KEY check:', {
    exists: 'SUPABASE_SERVICE_ROLE_KEY' in process.env,
    value: process.env.SUPABASE_SERVICE_ROLE_KEY,
    length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length,
    type: typeof process.env.SUPABASE_SERVICE_ROLE_KEY
  });
  
  // Debug environment variables
  console.log('🔍 Environment Variables Debug:', {
    SUPABASE_URL: process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL.substring(0, 20)}...` : 'MISSING',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? `${process.env.SUPABASE_ANON_KEY.substring(0, 20)}...` : 'MISSING',
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...` : 'MISSING',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV
  });

  // Expose service key for admin operations - this is server-side only
  const config = {
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    configured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY),
    debug: {
      hasUrl: !!process.env.SUPABASE_URL,
      hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      environment: process.env.VERCEL_ENV || 'unknown'
    }
  };

  // CORS headers for frontend access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  res.status(200).json(config);
}