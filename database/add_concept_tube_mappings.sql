-- Migration: Add concept_tube_mappings table
-- Purpose: Support flexible concept-to-tube assignments per L1 vision
-- Date: 2025-01-06
-- Author: Agent A - Database Schema Updater

-- ========================================
-- CONCEPT TO TUBE MAPPINGS TABLE
-- ========================================
-- This table allows curriculum designers to assign any concept to any tube
-- Supporting the L1 vision of flexible content organization

CREATE TABLE IF NOT EXISTS concept_tube_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_code varchar(50) NOT NULL,
  tube_id varchar(50) NOT NULL,
  priority integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure unique combination of concept and tube
  UNIQUE(concept_code, tube_id)
);

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_concept_tube_mappings_concept ON concept_tube_mappings(concept_code);
CREATE INDEX IF NOT EXISTS idx_concept_tube_mappings_tube ON concept_tube_mappings(tube_id);
CREATE INDEX IF NOT EXISTS idx_concept_tube_mappings_active ON concept_tube_mappings(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_concept_tube_mappings_priority ON concept_tube_mappings(priority DESC);

-- Enable Row Level Security
ALTER TABLE concept_tube_mappings ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read mappings
CREATE POLICY "Concept tube mappings are readable by authenticated users" ON concept_tube_mappings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only admins can modify mappings (to be implemented with admin role)
-- CREATE POLICY "Only admins can modify concept tube mappings" ON concept_tube_mappings
--   FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Add trigger for automatic updated_at timestamp
DROP TRIGGER IF EXISTS update_concept_tube_mappings_updated_at ON concept_tube_mappings;
CREATE TRIGGER update_concept_tube_mappings_updated_at 
  BEFORE UPDATE ON concept_tube_mappings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- TABLE DOCUMENTATION
-- ========================================
COMMENT ON TABLE concept_tube_mappings IS 'Flexible mapping allowing concepts to appear in multiple tubes per L1 vision';
COMMENT ON COLUMN concept_tube_mappings.concept_code IS 'Unique identifier for the concept (e.g., "0001" for doubling_0_5_endings_1)';
COMMENT ON COLUMN concept_tube_mappings.tube_id IS 'Identifier for the tube (e.g., "tube1", "tube2", "tube3")';
COMMENT ON COLUMN concept_tube_mappings.priority IS 'Priority when concept appears in multiple tubes (higher = preferred)';
COMMENT ON COLUMN concept_tube_mappings.is_active IS 'Whether this mapping is currently active (soft delete support)';

-- ========================================
-- INITIAL DATA POPULATION
-- ========================================
-- These are example mappings that demonstrate the flexibility of the system
-- Curriculum designers can modify these through the admin interface

-- Tube 1: Primary doubling concepts
INSERT INTO concept_tube_mappings (concept_code, tube_id, priority, is_active) VALUES
  ('0001', 'tube1', 100, true),
  ('0002', 'tube1', 100, true),
  ('0003', 'tube1', 100, true),
  ('0004', 'tube1', 100, true),
  ('0005', 'tube1', 100, true),
  ('0006', 'tube1', 100, true),
  ('0007', 'tube1', 100, true),
  ('0008', 'tube1', 100, true),
  ('0009', 'tube1', 100, true),
  ('0010', 'tube1', 100, true),
  ('0011', 'tube1', 100, true),
  ('0012', 'tube1', 100, true),
  ('0013', 'tube1', 100, true),
  ('0014', 'tube1', 100, true),
  ('0015', 'tube1', 100, true),
  ('0016', 'tube1', 100, true),
  ('0017', 'tube1', 100, true),
  ('0018', 'tube1', 100, true),
  ('0019', 'tube1', 100, true),
  ('0020', 'tube1', 100, true)
ON CONFLICT (concept_code, tube_id) DO NOTHING;

-- Tube 2: Multiplication concepts
INSERT INTO concept_tube_mappings (concept_code, tube_id, priority, is_active) VALUES
  ('0003', 'tube2', 100, true),  -- 3x tables
  ('0004', 'tube2', 100, true),  -- 4x tables
  ('0005', 'tube2', 100, true),  -- 5x tables
  ('0006', 'tube2', 100, true),  -- 6x tables
  ('0007', 'tube2', 100, true),  -- 7x tables
  ('0008', 'tube2', 100, true),  -- 8x tables
  ('0009', 'tube2', 100, true),  -- 9x tables
  ('0010', 'tube2', 100, true),  -- 10x tables
  ('0011', 'tube2', 100, true),  -- 11x tables
  ('0012', 'tube2', 100, true),  -- 12x tables
  ('0013', 'tube2', 100, true),  -- 13x tables
  ('0014', 'tube2', 100, true),  -- 14x tables
  ('0015', 'tube2', 100, true),  -- 15x tables
  ('0016', 'tube2', 100, true),  -- 16x tables
  ('0017', 'tube2', 100, true),  -- 17x tables
  ('0018', 'tube2', 100, true),  -- 18x tables
  ('0019', 'tube2', 100, true)   -- 19x tables
ON CONFLICT (concept_code, tube_id) DO NOTHING;

-- Demonstrate flexibility: concept 0001 can also appear in tube2
INSERT INTO concept_tube_mappings (concept_code, tube_id, priority, is_active) VALUES
  ('0001', 'tube2', 50, true)  -- Lower priority in tube2
ON CONFLICT (concept_code, tube_id) DO NOTHING;

-- Tube 3: Division/algebra concepts
INSERT INTO concept_tube_mappings (concept_code, tube_id, priority, is_active) VALUES
  ('1001', 'tube3', 100, true),
  ('1002', 'tube3', 100, true),
  ('1003', 'tube3', 100, true),
  ('1004', 'tube3', 100, true),
  ('1005', 'tube3', 100, true),
  ('1006', 'tube3', 100, true),
  ('1007', 'tube3', 100, true),
  ('1008', 'tube3', 100, true),
  ('1009', 'tube3', 100, true),
  ('1010', 'tube3', 100, true)
ON CONFLICT (concept_code, tube_id) DO NOTHING;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these to verify the table was created correctly:

-- Check table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'concept_tube_mappings'
-- ORDER BY ordinal_position;

-- Check sample data
-- SELECT concept_code, tube_id, priority, is_active
-- FROM concept_tube_mappings
-- ORDER BY tube_id, priority DESC, concept_code
-- LIMIT 20;

-- Check concepts that appear in multiple tubes
-- SELECT concept_code, array_agg(tube_id ORDER BY priority DESC) as tubes
-- FROM concept_tube_mappings
-- WHERE is_active = true
-- GROUP BY concept_code
-- HAVING COUNT(*) > 1;