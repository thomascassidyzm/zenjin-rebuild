# Vercel-Supabase Environment Variable Solutions

## Problem
Vercel's Supabase integration creates `SUPABASE_URL` and `SUPABASE_ANON_KEY` but Vite needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for frontend access.

## Solution 1: Manual Environment Variable Addition (Immediate)
In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Add:
   - `VITE_SUPABASE_URL` = copy value from `SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` = copy value from `SUPABASE_ANON_KEY`
3. Redeploy

**Pros**: Quick fix, maintains current architecture
**Cons**: Manual duplication, must maintain sync

## Solution 2: Server-Side Configuration Endpoint (Recommended)
Create an API endpoint that provides configuration to the frontend:

```typescript
// api/config.ts
export default function handler(req: Request) {
  return Response.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY
  });
}
```

Then fetch this config on app initialization.

**Pros**: Single source of truth, works with any hosting
**Cons**: Additional API call, slight complexity increase

## Solution 3: Build-Time Variable Injection
Use a Vite plugin or build script to inject variables:

```javascript
// vite.config.ts
export default {
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY)
  }
}
```

**Pros**: No runtime overhead, transparent to app code
**Cons**: Requires build configuration changes

## APML Implications

Until environment variables are properly configured:
- **SupabaseAuth** cannot validate `createAnonymousUser()` 
- **BackendServices** components remain at "scaffolded" status
- Cannot progress to "functional" status without successful integration tests
- Violates APML Axiom 5: "Validation Through Distinction"

## Recommendation
For immediate resolution: Use Solution 1
For long-term: Implement Solution 2 for better architecture