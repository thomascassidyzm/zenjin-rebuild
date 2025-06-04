# Tube Configuration Fix Test Plan

## Overview
This test plan validates the tube configuration architecture fix that enables flexible concept-to-tube mappings according to L1 strategic vision.

## Key Changes Made

### 1. Database Schema Updates
- Added `default_tube_positions` table to map stitches to tubes with concepts
- Added `concept_tube_mappings` table for flexible many-to-many concept-to-tube relationships
- Added `tube_positions` and `active_tube` columns to `user_state` table

### 2. StitchPopulation Service Updates
- Modified `getConceptMapping()` to support flexible tube assignments
- Added `ConceptMappingService` to load mappings from database
- Removed hardcoded concept-to-tube restrictions

### 3. New Services
- Created `ConceptMappingService` to manage flexible concept-to-tube mappings

## Test Scenarios

### 1. Database Migration Test
```bash
# Apply the migration
psql -U postgres -d your_database -f database/add_default_tube_positions.sql

# Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('default_tube_positions', 'concept_tube_mappings');

# Verify sample data
SELECT * FROM default_tube_positions WHERE concept_code = '0001';
SELECT * FROM concept_tube_mappings WHERE concept_code = '0001';
```

### 2. Flexible Concept Mapping Test
```typescript
// Test that concept 0001 can now be used in tube2
const stitchPopulation = new StitchPopulation(factRepository);
const mapping = await stitchPopulation.getConceptMapping('0001', 'tube2');

// Should succeed without throwing INVALID_CONCEPT_CODE error
expect(mapping.tubeId).toBe('tube2');
expect(mapping.conceptCode).toBe('0001');
```

### 3. TubeConfigurationService Integration Test
```typescript
// Test that TubeConfigurationService reads from new table
const tubeConfig = new TubeConfigurationService();
const defaultPositions = await tubeConfig.getDefaultTubePositions();

// Should return positions from database
expect(defaultPositions).toHaveLength(>0);
expect(defaultPositions[0]).toHaveProperty('tube_id');
expect(defaultPositions[0]).toHaveProperty('concept_code');
```

### 4. ConceptMappingService Test
```typescript
// Test flexible mappings
const conceptService = new ConceptMappingService();

// Concept 0001 should be allowed in multiple tubes
const tubes = await conceptService.getConceptTubes('0001');
expect(tubes.has('tube1')).toBe(true);
expect(tubes.has('tube2')).toBe(true);

// Check if concept allowed in specific tube
const isAllowed = await conceptService.isConceptAllowedInTube('0001', 'tube2');
expect(isAllowed).toBe(true);
```

### 5. End-to-End Learning Session Test
```typescript
// Test that a learning session can use concept 0001 in tube2
const userId = 'test-user-id';
const sessionData = {
  userId,
  tubeId: 'tube2',
  stitchId: 'stitch_t2_p18' // Contains concept 0001
};

// This should no longer throw INVALID_CONCEPT_CODE error
const session = await learningEngine.initializeSession(sessionData);
expect(session).toBeDefined();
expect(session.questions).toHaveLength(>0);
```

### 6. Dynamic Concept Assignment Test
```typescript
// Test that ANY concept can be dynamically assigned to ANY tube
const mapping = await stitchPopulation.getConceptMapping('1005', 'tube1');

// Even though 1005 is a division concept, it should work in tube1
expect(mapping.tubeId).toBe('tube1');
console.log('Dynamic mapping created for concept 1005 in tube1');
```

## Expected Outcomes

1. **No More Hardcoded Restrictions**: The error "INVALID_CONCEPT_CODE: Concept 0001 not in tube2" should no longer occur
2. **Flexible Assignments**: Any concept can be used in any tube
3. **Database-Driven Configuration**: Tube assignments are read from database tables
4. **Backward Compatibility**: Existing hardcoded mappings continue to work as defaults

## Performance Considerations

- ConceptMappingService caches mappings to avoid repeated database queries
- TubeConfigurationService caches default positions
- Both services provide `clearCache()` methods for testing

## Rollback Plan

If issues occur:
1. Remove the new database tables
2. Revert StitchPopulation to previous version
3. Remove ConceptMappingService

The system will fall back to hardcoded mappings.