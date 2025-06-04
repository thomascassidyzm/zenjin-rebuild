-- VERIFICATION SCRIPT
-- Run this after deploying concept_tube_mappings table

-- 1. Check if table exists
SELECT 
  'Table Exists' as check_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'concept_tube_mappings'
  ) as status;

-- 2. Check table structure
SELECT 
  'Column Check' as check_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'concept_tube_mappings'
ORDER BY ordinal_position;

-- 3. Check indexes
SELECT 
  'Index Check' as check_name,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'concept_tube_mappings';

-- 4. Check RLS status
SELECT 
  'RLS Enabled' as check_name,
  relrowsecurity as status
FROM pg_class
WHERE relname = 'concept_tube_mappings';

-- 5. Check policies
SELECT 
  'Policies' as check_name,
  polname as policy_name,
  polcmd as command,
  polroles::text as roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'concept_tube_mappings';

-- 6. Check data
SELECT 
  'Data Summary' as check_name,
  COUNT(*) as total_mappings,
  COUNT(DISTINCT concept_code) as unique_concepts,
  COUNT(DISTINCT tube_id) as unique_tubes,
  COUNT(CASE WHEN is_active THEN 1 END) as active_mappings
FROM concept_tube_mappings;

-- 7. Check specific concept "0001" (the one causing errors)
SELECT 
  'Concept 0001 Mappings' as check_name,
  concept_code,
  tube_id,
  priority,
  is_active
FROM concept_tube_mappings
WHERE concept_code = '0001'
ORDER BY priority DESC;

-- 8. Test the query that ConceptMappingService uses
SELECT 
  'Service Query Test' as check_name,
  COUNT(*) as result_count
FROM (
  SELECT * 
  FROM concept_tube_mappings
  WHERE concept_code = '0001'
  AND is_active = true
) as test_query;

-- Final status
SELECT 
  '🚀 DEPLOYMENT STATUS' as status,
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'concept_tube_mappings'
    ) 
    AND EXISTS (
      SELECT FROM concept_tube_mappings WHERE concept_code = '0001'
    )
    THEN '✅ READY - Table exists and has data'
    ELSE '❌ NOT READY - Check deployment script'
  END as result;