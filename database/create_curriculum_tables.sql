-- CURRICULUM MANAGEMENT DATABASE SCHEMA
-- Creates missing tables for admin curriculum management
-- Supports L1 vision: flexible concept-to-tube assignment

-- ========================================
-- APP_FACTS TABLE
-- ========================================
-- Store mathematical facts for question generation
CREATE TABLE IF NOT EXISTS app_facts (
  id varchar(100) PRIMARY KEY,  -- Format: "operation-operand1-operand2" e.g., "mult-2-4"
  statement text NOT NULL,       -- Human-readable statement e.g., "2 × 4"
  answer varchar(50) NOT NULL,   -- The correct answer as string
  operation_type varchar(50) NOT NULL CHECK (operation_type IN (
    'addition', 'subtraction', 'multiplication', 'division', 
    'double', 'half', 'square', 'cube'
  )),
  operand1 integer,              -- First operand (nullable for complex operations)
  operand2 integer,              -- Second operand (nullable for single-operand operations)
  difficulty_level integer NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  metadata jsonb DEFAULT '{}'::jsonb,  -- Additional data like visual hints, contexts
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_facts_operation ON app_facts(operation_type);
CREATE INDEX IF NOT EXISTS idx_app_facts_difficulty ON app_facts(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_app_facts_operands ON app_facts(operand1, operand2);

-- Enable RLS
ALTER TABLE app_facts ENABLE ROW LEVEL SECURITY;

-- Facts are readable by all authenticated users
CREATE POLICY "Facts are readable" ON app_facts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can modify facts
CREATE POLICY "Only admins can insert facts" ON app_facts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND metadata->>'role' = 'admin'
    )
  );

CREATE POLICY "Only admins can update facts" ON app_facts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND metadata->>'role' = 'admin'
    )
  );

CREATE POLICY "Only admins can delete facts" ON app_facts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND metadata->>'role' = 'admin'
    )
  );

-- ========================================
-- APP_STITCHES TABLE
-- ========================================
-- Store learning stitches (concept recipes)
CREATE TABLE IF NOT EXISTS app_stitches (
  id varchar(100) PRIMARY KEY,   -- Format: "tube-concept-variant" e.g., "t1-0001-0002"
  name text NOT NULL,            -- Human-readable name
  tube_id varchar(20) NOT NULL CHECK (tube_id IN ('tube1', 'tube2', 'tube3')),
  concept_code varchar(50) NOT NULL,  -- References concept like "0001"
  concept_type varchar(50) NOT NULL,  -- Type of mathematical concept
  concept_params jsonb NOT NULL,      -- Parameters for fact selection
  question_format jsonb NOT NULL DEFAULT '{
    "template": "What is {{operand1}} + {{operand2}}?",
    "answerType": "numeric",
    "variableNotation": null
  }'::jsonb,
  surprise_weight decimal(3,2) NOT NULL DEFAULT 0.05 CHECK (surprise_weight BETWEEN 0 AND 1),
  is_active boolean NOT NULL DEFAULT true,
  min_questions integer NOT NULL DEFAULT 10,
  max_questions integer NOT NULL DEFAULT 20,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_app_stitches_tube ON app_stitches(tube_id);
CREATE INDEX IF NOT EXISTS idx_app_stitches_concept ON app_stitches(concept_code);
CREATE INDEX IF NOT EXISTS idx_app_stitches_type ON app_stitches(concept_type);
CREATE INDEX IF NOT EXISTS idx_app_stitches_active ON app_stitches(is_active);

-- Enable RLS
ALTER TABLE app_stitches ENABLE ROW LEVEL SECURITY;

-- Stitches are readable by all authenticated users
CREATE POLICY "Stitches are readable" ON app_stitches
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can modify stitches
CREATE POLICY "Only admins can insert stitches" ON app_stitches
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND metadata->>'role' = 'admin'
    )
  );

CREATE POLICY "Only admins can update stitches" ON app_stitches
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND metadata->>'role' = 'admin'
    )
  );

CREATE POLICY "Only admins can delete stitches" ON app_stitches
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND metadata->>'role' = 'admin'
    )
  );

-- ========================================
-- UPDATE TRIGGERS
-- ========================================
-- Ensure updated_at is maintained
CREATE TRIGGER update_app_facts_updated_at 
  BEFORE UPDATE ON app_facts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_stitches_updated_at 
  BEFORE UPDATE ON app_stitches 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- INITIAL DATA
-- ========================================
-- Insert sample facts for doubling
INSERT INTO app_facts (id, statement, answer, operation_type, operand1, operand2, difficulty_level) VALUES
  ('double-1', 'Double 1', '2', 'double', 1, NULL, 1),
  ('double-2', 'Double 2', '4', 'double', 2, NULL, 1),
  ('double-3', 'Double 3', '6', 'double', 3, NULL, 1),
  ('double-4', 'Double 4', '8', 'double', 4, NULL, 1),
  ('double-5', 'Double 5', '10', 'double', 5, NULL, 1),
  ('double-10', 'Double 10', '20', 'double', 10, NULL, 1),
  ('double-15', 'Double 15', '30', 'double', 15, NULL, 2),
  ('double-20', 'Double 20', '40', 'double', 20, NULL, 2),
  ('double-25', 'Double 25', '50', 'double', 25, NULL, 2),
  ('double-50', 'Double 50', '100', 'double', 50, NULL, 3)
ON CONFLICT (id) DO NOTHING;

-- Also insert as multiplication facts for compatibility
INSERT INTO app_facts (id, statement, answer, operation_type, operand1, operand2, difficulty_level) VALUES
  ('mult-2-1', '2 × 1', '2', 'multiplication', 2, 1, 1),
  ('mult-2-2', '2 × 2', '4', 'multiplication', 2, 2, 1),
  ('mult-2-3', '2 × 3', '6', 'multiplication', 2, 3, 1),
  ('mult-2-4', '2 × 4', '8', 'multiplication', 2, 4, 1),
  ('mult-2-5', '2 × 5', '10', 'multiplication', 2, 5, 1)
ON CONFLICT (id) DO NOTHING;

-- Insert sample stitches
INSERT INTO app_stitches (
  id, name, tube_id, concept_code, concept_type, 
  concept_params, question_format, surprise_weight
) VALUES
  (
    't1-0001-double5', 
    'Doubling numbers ending in 5 or 0 (up to 100)', 
    'tube1', 
    '0001', 
    'doubling',
    '{
      "operation": "doubling",
      "criteria": {
        "numberRange": [0, 100],
        "numberEndings": ["0", "5"],
        "patternType": "endings"
      },
      "maxFacts": 20
    }'::jsonb,
    '{
      "template": "Double {{operand1}}",
      "answerType": "numeric",
      "variableNotation": null
    }'::jsonb,
    0.05
  ),
  (
    't1-0002-mult2', 
    'Multiplication by 2 (basic)', 
    'tube1', 
    '0002', 
    'multiplication',
    '{
      "operation": "multiplication",
      "criteria": {
        "multiplier": 2,
        "multiplicandRange": [1, 10]
      },
      "maxFacts": 10
    }'::jsonb,
    '{
      "template": "What is {{operand1}} × {{operand2}}?",
      "answerType": "numeric"
    }'::jsonb,
    0.05
  )
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Check tables exist
SELECT 
  'Tables Created' as status,
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'app_facts') as facts_table,
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'app_stitches') as stitches_table,
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'concept_tube_mappings') as mappings_table;

-- Count initial data
SELECT 
  'Initial Data' as status,
  (SELECT COUNT(*) FROM app_facts) as facts_count,
  (SELECT COUNT(*) FROM app_stitches) as stitches_count,
  (SELECT COUNT(*) FROM concept_tube_mappings) as mappings_count;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================
-- ✅ Tables created successfully
-- ✅ Initial data inserted
-- ✅ Admin interface should now work with real data