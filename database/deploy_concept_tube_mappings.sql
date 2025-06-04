-- IMMEDIATE DEPLOYMENT SCRIPT FOR MISSING TABLE
-- Execute this in Supabase SQL Editor to resolve "relation does not exist" error
-- APML v3.1 - NO FALLBACKS ALLOWED

-- ========================================
-- STEP 1: CREATE THE MISSING TABLE
-- ========================================

-- Flexible mapping of concepts to tubes (many-to-many)
-- Supports L1 vision: any concept can be assigned to any tube
CREATE TABLE IF NOT EXISTS concept_tube_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_code varchar(50) NOT NULL,
  tube_id varchar(50) NOT NULL,
  priority integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Allow same concept in multiple tubes, but unique combination
  UNIQUE(concept_code, tube_id)
);

-- ========================================
-- STEP 2: ADD PERFORMANCE INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_concept_tube_mappings_concept ON concept_tube_mappings(concept_code);
CREATE INDEX IF NOT EXISTS idx_concept_tube_mappings_tube ON concept_tube_mappings(tube_id);
CREATE INDEX IF NOT EXISTS idx_concept_tube_mappings_active ON concept_tube_mappings(is_active);
CREATE INDEX IF NOT EXISTS idx_concept_tube_mappings_priority ON concept_tube_mappings(priority DESC);

-- ========================================
-- STEP 3: ENABLE ROW LEVEL SECURITY
-- ========================================

ALTER TABLE concept_tube_mappings ENABLE ROW LEVEL SECURITY;

-- Concept tube mappings are readable by all authenticated users
CREATE POLICY "Concept tube mappings are readable" ON concept_tube_mappings
  FOR SELECT USING (auth.role() = 'authenticated');

-- ========================================
-- STEP 4: ADD UPDATE TRIGGER (if function exists)
-- ========================================

-- Check if update_updated_at_column function exists before creating trigger
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE TRIGGER update_concept_tube_mappings_updated_at 
      BEFORE UPDATE ON concept_tube_mappings 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- ========================================
-- STEP 5: INSERT INITIAL DATA
-- ========================================

-- Insert initial concept to tube mappings
-- Supporting L1 vision: flexible concept assignment
INSERT INTO concept_tube_mappings (concept_code, tube_id, priority, is_active) VALUES
  -- Example mappings for concept "0001" - can be in multiple tubes
  ('0001', 'tube1', 100, true),  -- Primary assignment to tube1
  ('0001', 'tube2', 50, true),   -- Also available in tube2
  -- More concept mappings can be added by curriculum designers
  ('0002', 'tube1', 100, true),
  ('0003', 'tube1', 100, true),
  ('0004', 'tube1', 100, true),
  ('0005', 'tube1', 100, true)
ON CONFLICT (concept_code, tube_id) DO NOTHING;

-- ========================================
-- STEP 6: VERIFY DEPLOYMENT
-- ========================================

-- Verify table exists
SELECT 
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'concept_tube_mappings'
  ) as table_exists;

-- Verify data was inserted
SELECT 
  COUNT(*) as mapping_count,
  COUNT(DISTINCT concept_code) as distinct_concepts,
  COUNT(DISTINCT tube_id) as distinct_tubes
FROM concept_tube_mappings;

-- Show sample mappings
SELECT * FROM concept_tube_mappings ORDER BY concept_code, priority DESC LIMIT 10;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================
-- If all queries above execute successfully:
-- ✅ Table created
-- ✅ Indexes added
-- ✅ RLS enabled
-- ✅ Initial data inserted
-- ✅ Application queries should now work