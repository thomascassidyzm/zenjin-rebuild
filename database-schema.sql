-- Database schema for Curriculum Backend Integration
-- Creates the tables expected by the existing API endpoints

-- Table for curriculum stitches (used by api/admin/stitches.ts)
CREATE TABLE IF NOT EXISTS app_stitches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tube_id TEXT NOT NULL,
  concept_type TEXT NOT NULL,
  concept_params JSONB NOT NULL,
  surprise_weight REAL DEFAULT 0.05,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for mathematical facts (used by api/admin/facts.ts)
CREATE TABLE IF NOT EXISTS app_facts (
  id TEXT PRIMARY KEY,
  statement TEXT NOT NULL,
  answer TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  operand1 INTEGER,
  operand2 INTEGER,
  difficulty_level INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_app_stitches_tube_id ON app_stitches(tube_id);
CREATE INDEX IF NOT EXISTS idx_app_stitches_concept_type ON app_stitches(concept_type);
CREATE INDEX IF NOT EXISTS idx_app_stitches_is_active ON app_stitches(is_active);

CREATE INDEX IF NOT EXISTS idx_app_facts_operation_type ON app_facts(operation_type);
CREATE INDEX IF NOT EXISTS idx_app_facts_operand1 ON app_facts(operand1);
CREATE INDEX IF NOT EXISTS idx_app_facts_operand2 ON app_facts(operand2);
CREATE INDEX IF NOT EXISTS idx_app_facts_difficulty_level ON app_facts(difficulty_level);

-- Sample data for app_stitches (matching the format expected by SimpleCurriculumPlanner)
INSERT INTO app_stitches (id, name, tube_id, concept_type, concept_params, is_active) VALUES
  ('t1-0001-0001', 'Addition 0-5', 'tube1', 'addition', '{"operand1Range": [0, 5], "operand2Range": [0, 5]}', true),
  ('t1-0001-0002', 'Addition 6-10', 'tube1', 'addition', '{"operand1Range": [6, 10], "operand2Range": [0, 5]}', true),
  ('t1-0001-0003', 'Addition 11-20', 'tube1', 'addition', '{"operand1Range": [11, 20], "operand2Range": [0, 10]}', true),
  ('t2-0001-0001', 'Multiplication 2x table', 'tube2', 'multiplication', '{"operand1Range": [1, 12], "operand2Range": [2, 2]}', true),
  ('t2-0001-0002', 'Multiplication 3x table', 'tube2', 'multiplication', '{"operand1Range": [1, 12], "operand2Range": [3, 3]}', true),
  ('t3-0001-0001', 'Doubling 1-50', 'tube3', 'doubling', '{"operand1Range": [1, 50]}', true)
ON CONFLICT (id) DO NOTHING;

-- Sample mathematical facts (matching the format expected by FactRepository)
INSERT INTO app_facts (id, statement, answer, operation_type, operand1, operand2, difficulty_level) VALUES
  ('add-1-1', '1 + 1', '2', 'addition', 1, 1, 1),
  ('add-2-2', '2 + 2', '4', 'addition', 2, 2, 1),
  ('add-3-3', '3 + 3', '6', 'addition', 3, 3, 1),
  ('mult-2-2', '2 × 2', '4', 'multiplication', 2, 2, 2),
  ('mult-3-3', '3 × 3', '9', 'multiplication', 3, 3, 2),
  ('mult-2-5', '2 × 5', '10', 'multiplication', 2, 5, 2),
  ('div-10-2', '10 ÷ 2', '5', 'division', 10, 2, 2),
  ('div-6-2', '6 ÷ 2', '3', 'division', 6, 2, 2)
ON CONFLICT (id) DO NOTHING;