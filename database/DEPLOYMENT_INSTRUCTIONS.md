# 🚨 CRITICAL DATABASE DEPLOYMENT REQUIRED

## Issue
Application expects `concept_tube_mappings` table but Supabase returns:
```
relation "public.concept_tube_mappings" does not exist
```

## Root Cause
The table is defined in `schema.sql` but hasn't been deployed to the Supabase database.

## Immediate Action Required

### Step 1: Deploy the Missing Table
1. Open your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the entire contents of `deploy_concept_tube_mappings.sql`
4. Paste and execute in SQL Editor
5. You should see success messages and verification results

### Step 2: Verify Deployment
1. In the same SQL Editor
2. Copy contents of `verify_deployment.sql`
3. Execute to confirm:
   - Table exists
   - Has correct structure
   - Contains initial data
   - Concept "0001" is mapped to tubes

### Step 3: Test Application
1. Restart your application
2. The error should be resolved
3. Concept "0001" should work in any tube

## What This Fixes
- ✅ Resolves "relation does not exist" error
- ✅ Enables flexible concept-to-tube mapping (L1 vision)
- ✅ Allows concept "0001" in tube2
- ✅ Removes fallback behavior (APML compliance)

## Critical Notes
- **NO FALLBACKS**: Once deployed, the system uses only real database data
- **Idempotent**: Script can be run multiple times safely
- **Initial Data**: Includes concept "0001" in both tube1 and tube2

## Troubleshooting
If deployment fails:
1. Check Supabase connection
2. Ensure you have admin privileges
3. Check if `update_updated_at_column()` function exists
4. Review error messages in SQL Editor

## Success Criteria
After deployment, this query should return results:
```sql
SELECT * FROM concept_tube_mappings WHERE concept_code = '0001';
```