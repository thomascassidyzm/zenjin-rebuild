# Curriculum Management Deployment Guide

## Overview
This guide walks through deploying the curriculum management system that enables flexible concept-to-tube assignments per the L1 strategic vision.

## Database Migration Steps

### 1. Deploy the Schema
Execute the following SQL file in your Supabase SQL Editor:
```sql
/database/create_curriculum_tables.sql
```

This will create:
- `app_facts` table - Mathematical facts storage
- `app_stitches` table - Learning stitch definitions
- Proper indexes and RLS policies
- Initial sample data

### 2. Verify Deployment
Run these queries to confirm successful deployment:

```sql
-- Check tables exist
SELECT 
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'app_facts') as facts_table,
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'app_stitches') as stitches_table,
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'concept_tube_mappings') as mappings_table;

-- Check data counts
SELECT 
  (SELECT COUNT(*) FROM app_facts) as facts_count,
  (SELECT COUNT(*) FROM app_stitches) as stitches_count,
  (SELECT COUNT(*) FROM concept_tube_mappings) as mappings_count;
```

### 3. Set Admin Role
To use the admin interface, ensure your user has admin role:

```sql
UPDATE users 
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb), 
  '{role}', 
  '"admin"'
)
WHERE email = 'your-admin-email@example.com';
```

## API Endpoints

The following endpoints are now available:

### Facts Management
- `GET /api/admin/facts` - List all facts
- `POST /api/admin/facts` - Create new fact
- `PUT /api/admin/facts` - Update fact
- `DELETE /api/admin/facts` - Delete fact

### Stitches Management  
- `GET /api/admin/stitches` - List all stitches
- `POST /api/admin/stitches` - Create new stitch
- `PUT /api/admin/stitches` - Update stitch
- `DELETE /api/admin/stitches` - Delete stitch

### Concept Mappings
- `GET /api/admin/concept-mappings` - List all mappings
- `POST /api/admin/concept-mappings` - Create new mapping
- `PUT /api/admin/concept-mappings` - Update mapping
- `DELETE /api/admin/concept-mappings` - Delete mapping

## Using the Admin Interface

### 1. Access Admin Panel
Navigate to `/admin` in your application

### 2. Content Management Features

#### Facts Tab
- View all mathematical facts
- Filter by operation type
- Create/Edit/Delete facts
- Import/Export (UI present, implementation pending)

#### Stitches Tab
- View all learning stitches
- Define concept parameters
- Set question templates
- Manage active/inactive states

#### Mappings Tab
- Visual concept-to-tube assignment
- Priority management (0-1000)
- Enable/disable mappings
- See all tubes for each concept at a glance

#### Preview Tab
- See curriculum statistics
- Understand content flow
- Preview learner experience

## Test Scenarios

### Scenario 1: Assign Concept to New Tube
1. Go to Mappings tab
2. Click "Add Mapping"
3. Enter:
   - Concept Code: `0002`
   - Tube: `tube2`
   - Priority: `80`
   - Status: Active
4. Save and verify in the UI

### Scenario 2: Create Doubling Facts
1. Go to Facts tab
2. Click "Add Fact"
3. Enter:
   - Statement: "Double 6"
   - Answer: "12"
   - Operation Type: "double"
   - Operand 1: 6
   - Difficulty: 1
4. Save and verify

### Scenario 3: Define New Stitch
1. Go to Stitches tab
2. Click "Create Stitch"
3. Define parameters for concept selection
4. Set question format template
5. Assign to tube and concept

## Integration with Learning Engine

Changes made in the admin interface are immediately reflected:
1. New facts are available for question generation
2. Concept mappings affect tube content
3. Stitches define how questions are selected
4. Priorities determine concept ordering

## Troubleshooting

### "Table does not exist" Error
Run the migration script: `/database/create_curriculum_tables.sql`

### "Permission denied" Error
Ensure your user has admin role in the metadata field

### Facts not appearing
Check that the `app_facts` table has data using SQL query

### Mappings not saving
Verify the concept_code/tube_id combination doesn't already exist

## Success Verification

You know the system is working when:
- ✅ Admin can assign "concept 0002" to tube2 with priority 80
- ✅ Changes appear immediately in the UI
- ✅ No database errors in console
- ✅ All CRUD operations work smoothly
- ✅ Preview shows accurate curriculum state