-- Add default_tube_positions table for flexible concept-to-tube mapping
-- This allows any concept to be assigned to any tube by curriculum designers

-- ========================================
-- DEFAULT TUBE POSITIONS TABLE
-- ========================================
-- Maps concepts to their default tube assignments
CREATE TABLE IF NOT EXISTS default_tube_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tube_id text NOT NULL,
  logical_position integer NOT NULL,
  stitch_id text NOT NULL,
  concept_code text NOT NULL,
  concept_name text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure unique position per tube
  UNIQUE(tube_id, logical_position),
  -- Ensure each stitch_id is unique across all tubes
  UNIQUE(stitch_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_default_tube_positions_tube_id ON default_tube_positions(tube_id);
CREATE INDEX IF NOT EXISTS idx_default_tube_positions_concept_code ON default_tube_positions(concept_code);
CREATE INDEX IF NOT EXISTS idx_default_tube_positions_active ON default_tube_positions(is_active);

-- Add tube_positions column to user_state if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'user_state' 
    AND column_name = 'tube_positions'
  ) THEN
    ALTER TABLE user_state ADD COLUMN tube_positions jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add active_tube column to user_state if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'user_state' 
    AND column_name = 'active_tube'
  ) THEN
    ALTER TABLE user_state ADD COLUMN active_tube integer DEFAULT 1;
  END IF;
END $$;

-- ========================================
-- CONCEPT TO TUBE MAPPING TABLE
-- ========================================
-- Flexible mapping of concepts to tubes (many-to-many)
CREATE TABLE IF NOT EXISTS concept_tube_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_code text NOT NULL,
  tube_id text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  priority integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Allow same concept in multiple tubes
  UNIQUE(concept_code, tube_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_concept_tube_mappings_concept ON concept_tube_mappings(concept_code);
CREATE INDEX IF NOT EXISTS idx_concept_tube_mappings_tube ON concept_tube_mappings(tube_id);
CREATE INDEX IF NOT EXISTS idx_concept_tube_mappings_default ON concept_tube_mappings(is_default);

-- ========================================
-- INITIAL DEFAULT TUBE POSITIONS
-- ========================================
-- Following the L1 vision, we populate with flexible assignments

-- Tube 1: Doubling concepts (but can be reassigned)
INSERT INTO default_tube_positions (tube_id, logical_position, stitch_id, concept_code, concept_name) VALUES
  ('tube1', 1, 'stitch_t1_p1', '0001', 'doubling_0_5_endings_1'),
  ('tube1', 2, 'stitch_t1_p2', '0002', 'doubling_0_5_endings_2'),
  ('tube1', 3, 'stitch_t1_p3', '0003', 'doubling_0_5_endings_3'),
  ('tube1', 4, 'stitch_t1_p4', '0004', 'doubling_0_5_endings_4'),
  ('tube1', 5, 'stitch_t1_p5', '0005', 'doubling_0_5_endings_5'),
  ('tube1', 6, 'stitch_t1_p6', '0006', 'doubling_0_5_endings_6'),
  ('tube1', 7, 'stitch_t1_p7', '0007', 'doubling_0_5_endings_7'),
  ('tube1', 8, 'stitch_t1_p8', '0008', 'doubling_1_4_endings_8'),
  ('tube1', 9, 'stitch_t1_p9', '0009', 'doubling_1_4_endings_9'),
  ('tube1', 10, 'stitch_t1_p10', '0010', 'doubling_1_4_endings_10'),
  ('tube1', 11, 'stitch_t1_p11', '0011', 'doubling_1_4_endings_11'),
  ('tube1', 12, 'stitch_t1_p12', '0012', 'doubling_1_4_endings_12'),
  ('tube1', 13, 'stitch_t1_p13', '0013', 'doubling_1_4_endings_13'),
  ('tube1', 14, 'stitch_t1_p14', '0014', 'doubling_1_4_endings_14'),
  ('tube1', 15, 'stitch_t1_p15', '0015', 'doubling_6_9_endings_15'),
  ('tube1', 16, 'stitch_t1_p16', '0016', 'doubling_6_9_endings_16'),
  ('tube1', 17, 'stitch_t1_p17', '0017', 'doubling_6_9_endings_17'),
  ('tube1', 18, 'stitch_t1_p18', '0018', 'doubling_6_9_endings_18'),
  ('tube1', 19, 'stitch_t1_p19', '0019', 'doubling_6_9_endings_19'),
  ('tube1', 20, 'stitch_t1_p20', '0020', 'doubling_6_9_endings_20')
ON CONFLICT (stitch_id) DO NOTHING;

-- Tube 2: Multiplication concepts (but can include ANY concept)
INSERT INTO default_tube_positions (tube_id, logical_position, stitch_id, concept_code, concept_name) VALUES
  ('tube2', 1, 'stitch_t2_p1', '0019', 'multiplication_19x'),
  ('tube2', 2, 'stitch_t2_p2', '0018', 'multiplication_18x'),
  ('tube2', 3, 'stitch_t2_p3', '0017', 'multiplication_17x'),
  ('tube2', 4, 'stitch_t2_p4', '0016', 'multiplication_16x'),
  ('tube2', 5, 'stitch_t2_p5', '0015', 'multiplication_15x'),
  ('tube2', 6, 'stitch_t2_p6', '0014', 'multiplication_14x'),
  ('tube2', 7, 'stitch_t2_p7', '0013', 'multiplication_13x'),
  ('tube2', 8, 'stitch_t2_p8', '0012', 'multiplication_12x'),
  ('tube2', 9, 'stitch_t2_p9', '0011', 'multiplication_11x'),
  ('tube2', 10, 'stitch_t2_p10', '0010', 'multiplication_10x'),
  ('tube2', 11, 'stitch_t2_p11', '0009', 'multiplication_9x'),
  ('tube2', 12, 'stitch_t2_p12', '0008', 'multiplication_8x'),
  ('tube2', 13, 'stitch_t2_p13', '0007', 'multiplication_7x'),
  ('tube2', 14, 'stitch_t2_p14', '0006', 'multiplication_6x'),
  ('tube2', 15, 'stitch_t2_p15', '0005', 'multiplication_5x'),
  ('tube2', 16, 'stitch_t2_p16', '0004', 'multiplication_4x'),
  ('tube2', 17, 'stitch_t2_p17', '0003', 'multiplication_3x'),
  -- IMPORTANT: Demonstrating flexibility - concept 0001 can also be in tube2!
  ('tube2', 18, 'stitch_t2_p18', '0001', 'doubling_0_5_endings_1')
ON CONFLICT (stitch_id) DO NOTHING;

-- Tube 3: Division concepts
INSERT INTO default_tube_positions (tube_id, logical_position, stitch_id, concept_code, concept_name) VALUES
  ('tube3', 1, 'stitch_t3_p1', '1001', 'division_algebra_1'),
  ('tube3', 2, 'stitch_t3_p2', '1002', 'division_algebra_2'),
  ('tube3', 3, 'stitch_t3_p3', '1003', 'division_algebra_3'),
  ('tube3', 4, 'stitch_t3_p4', '1004', 'division_algebra_4'),
  ('tube3', 5, 'stitch_t3_p5', '1005', 'division_algebra_5'),
  ('tube3', 6, 'stitch_t3_p6', '1006', 'division_algebra_6'),
  ('tube3', 7, 'stitch_t3_p7', '1007', 'division_algebra_7'),
  ('tube3', 8, 'stitch_t3_p8', '1008', 'division_algebra_8'),
  ('tube3', 9, 'stitch_t3_p9', '1009', 'division_algebra_9'),
  ('tube3', 10, 'stitch_t3_p10', '1010', 'division_algebra_10')
ON CONFLICT (stitch_id) DO NOTHING;

-- ========================================
-- POPULATE CONCEPT TO TUBE MAPPINGS
-- ========================================
-- This allows concepts to be in multiple tubes

-- Doubling concepts - primarily in tube1 but can be anywhere
INSERT INTO concept_tube_mappings (concept_code, tube_id, is_default) 
SELECT concept_code, 'tube1', true 
FROM generate_series(1, 20) AS i(num)
CROSS JOIN LATERAL (SELECT lpad(num::text, 4, '0') AS concept_code) AS c
ON CONFLICT (concept_code, tube_id) DO NOTHING;

-- Multiplication concepts - can be in tube2
INSERT INTO concept_tube_mappings (concept_code, tube_id, is_default) 
SELECT concept_code, 'tube2', true 
FROM generate_series(3, 19) AS i(num)
CROSS JOIN LATERAL (SELECT lpad(num::text, 4, '0') AS concept_code) AS c
ON CONFLICT (concept_code, tube_id) DO NOTHING;

-- Division concepts - in tube3
INSERT INTO concept_tube_mappings (concept_code, tube_id, is_default) 
SELECT concept_code, 'tube3', true 
FROM generate_series(1001, 1020) AS i(num)
CROSS JOIN LATERAL (SELECT num::text AS concept_code) AS c
ON CONFLICT (concept_code, tube_id) DO NOTHING;

-- CRITICAL: Allow concept 0001 to be in tube2 as well (demonstrating flexibility)
INSERT INTO concept_tube_mappings (concept_code, tube_id, is_default) VALUES
  ('0001', 'tube2', false)
ON CONFLICT (concept_code, tube_id) DO NOTHING;

-- Apply updated_at trigger to new tables
CREATE TRIGGER update_default_tube_positions_updated_at 
  BEFORE UPDATE ON default_tube_positions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_concept_tube_mappings_updated_at 
  BEFORE UPDATE ON concept_tube_mappings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE default_tube_positions IS 'Default tube position assignments for curriculum design';
COMMENT ON TABLE concept_tube_mappings IS 'Flexible mapping allowing concepts to appear in multiple tubes';
COMMENT ON COLUMN concept_tube_mappings.is_default IS 'Whether this is the primary/default tube for this concept';
COMMENT ON COLUMN concept_tube_mappings.priority IS 'Priority when concept appears in multiple tubes (higher = more important)';