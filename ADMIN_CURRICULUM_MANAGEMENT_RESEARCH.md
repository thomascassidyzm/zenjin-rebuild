# Admin Curriculum Management Research Report

## Executive Summary

The admin interface has a partially implemented curriculum management system with significant gaps that prevent full L1 vision implementation. While basic infrastructure exists, critical features for flexible curriculum design are missing.

## Current State Assessment

### 1. Admin Interface Structure

**Implemented Components:**
- ✅ AdminRouter with navigation between sections
- ✅ ContentManagement component with three tabs:
  - Facts tab (connected to database)
  - Stitches tab (using mock data)
  - Positions tab (placeholder only)
- ✅ Basic CRUD UI for facts
- ❌ No concept-to-tube mapping interface
- ❌ No bulk operations
- ❌ No preview functionality

### 2. Database Schema Analysis

**Existing Tables:**
- ✅ `concept_tube_mappings` - Flexible concept-to-tube assignments
  - Fields: id, concept_code, tube_id, priority, is_active, timestamps
  - Supports many-to-many relationships
  - Has proper indexes and RLS policies
- ❌ No `facts` table found in schema
- ❌ No `stitches` table found in schema
- ❌ No `concepts` table for concept definitions

**Critical Finding:** The facts and stitches API endpoints reference tables that don't exist in the schema!

### 3. API Endpoints

**Implemented:**
- ✅ `/api/admin/facts` - Full CRUD operations
- ✅ `/api/admin/stitches` - Full CRUD operations
- ✅ `/api/admin/users` - User management
- ✅ `/api/admin/stats` - Analytics
- ❌ No `/api/admin/concept-mappings` endpoint
- ❌ No `/api/admin/curriculum` endpoint

### 4. UI/UX Capabilities

**Facts Management:**
- ✅ Create/Read/Update/Delete individual facts
- ✅ Search and filter by operation type
- ✅ Basic form validation
- ❌ No bulk import/export (buttons exist but not implemented)
- ❌ No connection to concept mappings

**Stitches Management:**
- 🟡 UI exists but uses mock data only
- ❌ Not connected to database
- ❌ No way to define concept parameters
- ❌ No tube assignment interface

**Concept-to-Tube Mapping:**
- ❌ No UI exists
- ❌ No way to assign concepts to tubes
- ❌ No priority management
- ❌ No bulk assignment tools

### 5. Integration Points

**Current Flow:**
- ContentManagement → API endpoints → Supabase
- Facts API attempts to query non-existent table
- No integration with concept_tube_mappings table
- No real-time updates to learning engine

## Gap Analysis

### Critical Missing Features

1. **Database Tables:**
   - Need to create `facts` table
   - Need to create `stitches` table
   - Need to create `concepts` table

2. **API Endpoints:**
   - Need concept-mappings CRUD endpoint
   - Need curriculum management endpoint
   - Need bulk operations endpoints

3. **UI Components:**
   - Need concept-to-tube mapping interface
   - Need bulk import/export functionality
   - Need curriculum preview
   - Need concept definition interface

4. **Integration:**
   - Need to connect UI to concept_tube_mappings
   - Need real-time sync with learning engine
   - Need validation of curriculum changes

## Key Questions Answered

**Q: Can an admin currently assign "concept 0002" to tube2 with priority 80?**
A: No. While the database supports this, there's no UI or API endpoint to manage concept_tube_mappings.

**Q: How are new mathematical concepts added to the system?**
A: Currently impossible. No concepts table or concept management interface exists.

**Q: How are doubling/halving facts managed vs regular multiplication?**
A: Through the operation_type field in facts, but the facts table doesn't exist in the database schema.

**Q: Is there a way to preview how curriculum changes affect learners?**
A: No preview functionality exists.

## Recommended Implementation Order

### Phase 1: Database Foundation (Immediate)
1. Create facts table matching API expectations
2. Create stitches table with proper structure
3. Create concepts definition table
4. Add concept-mappings API endpoint

### Phase 2: Core Admin Features (High Priority)
1. Build concept-to-tube mapping UI
2. Connect stitches UI to database
3. Implement bulk import/export for facts
4. Add concept definition interface

### Phase 3: Advanced Features (Medium Priority)
1. Curriculum preview functionality
2. Real-time sync with learning engine
3. Bulk concept-to-tube assignments
4. Validation and conflict detection

### Phase 4: Polish (Low Priority)
1. Drag-and-drop tube assignments
2. Visual curriculum designer
3. A/B testing interface
4. Analytics integration

## Technical Recommendations

1. **Immediate Action:** Create missing database tables to prevent API errors
2. **Architecture:** Use existing concept_tube_mappings as foundation
3. **UI Pattern:** Extend ContentManagement with new "Mappings" tab
4. **API Design:** RESTful endpoints following existing patterns
5. **State Management:** Consider real-time updates via Supabase subscriptions

## Conclusion

The admin interface has good bones but lacks critical curriculum management features. The L1 vision of flexible concept-to-tube assignment is architecturally supported but not exposed through the UI. Priority should be fixing the database schema mismatch and building the concept mapping interface.