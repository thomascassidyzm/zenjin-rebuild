# Backend Integration Test Guide

## Overview
This guide helps verify that the curriculum backend integration is working properly. All changes made in the admin interface should persist to the database and affect the learning engine.

## Prerequisites
1. Ensure your Supabase database has the required tables (`app_stitches` and `app_facts`)
2. Have the app running locally or deployed
3. Access to the admin interface

## Test 1: SimpleCurriculumPlanner Persistence

### Steps:
1. Navigate to Admin Dashboard → Curriculum Planner
2. Note the current stitches displayed
3. Click "Add stitch" in any tube
4. Enter a new stitch (e.g., "Double [10-20]")
5. Press Enter to save
6. **Refresh the page** (F5 or Cmd+R)

### Expected Result:
✅ The new stitch should still be visible after refresh
❌ If the stitch disappears, backend persistence is not working

## Test 2: Edit Existing Stitch

### Steps:
1. Click on any existing stitch title in the curriculum planner
2. Edit the title (e.g., change "Double [1-5]" to "Double [1-10]")
3. Click the check mark to save
4. **Refresh the page**

### Expected Result:
✅ The edited title should persist after refresh
❌ If it reverts to the old title, the update API is not working

## Test 3: Claude Content Generation

### Steps:
1. In the curriculum planner, use the Claude input box
2. Enter: "Create 3 addition stitches for numbers 20-30"
3. Click Generate
4. Wait for Claude to generate content
5. **Refresh the page**

### Expected Result:
✅ Generated stitches should appear and persist after refresh
✅ Console should show "✅ Generated stitches saved to backend"
❌ If stitches disappear, Claude integration is not saving to backend

## Test 4: Learning Engine Integration

### Steps:
1. Create a new stitch in Tube 1: "Addition [5-5]" (only 5+5)
2. Save and refresh to confirm it persists
3. Go to the main learning interface
4. Start a new session
5. Play through questions

### Expected Result:
✅ You should see questions using your defined curriculum
✅ If you created "Addition [5-5]", you should see "5 + 5" questions
❌ If you see unrelated questions (like multiplication), the learning engine is not using backend data

## Test 5: Fact Repository Loading

### Steps:
1. Open browser developer console (F12)
2. Refresh the app
3. Look for console messages during initialization

### Expected Result:
✅ Should see: "✅ Loaded X facts from backend"
✅ Should NOT see: "⚠️ Failed to load facts from backend, using hardcoded fallback"
❌ If you see the fallback message, FactRepository is not loading from backend

## Test 6: Database Verification

### For developers with Supabase access:
1. Log into Supabase dashboard
2. Navigate to Table Editor
3. Check `app_stitches` table
4. Check `app_facts` table

### Expected Result:
✅ Should see your created/edited stitches in `app_stitches`
✅ Should see mathematical facts in `app_facts`
✅ Changes made in admin UI should appear here immediately

## Common Issues & Solutions

### Issue: Changes don't persist after refresh
- **Check**: Browser console for API errors
- **Solution**: Ensure API endpoints are accessible and Supabase is configured

### Issue: "operand1=undefined" errors
- **Check**: Fact data in database has proper operand values
- **Solution**: Ensure facts are properly formatted when saved

### Issue: Learning engine uses wrong questions
- **Check**: Console for "FactRepository: Initialization complete"
- **Solution**: Ensure FactRepository loads from backend before learning starts

## Automated Test Script

Run the automated test script:
```bash
npm run test:backend-integration
```

This will verify:
- API endpoints are working
- CRUD operations succeed
- Data persists correctly

## Success Criteria

The backend integration is working correctly when:
- ✅ All curriculum changes survive page refresh
- ✅ Claude-generated content saves to database
- ✅ Learning sessions use the defined curriculum
- ✅ No "undefined" errors in question generation
- ✅ Console shows facts loading from backend

## Next Steps

If all tests pass:
1. The curriculum backend integration is complete
2. Admin users can now manage curriculum with confidence
3. Changes will immediately affect the learning experience

If tests fail:
1. Check browser console for specific errors
2. Verify database tables exist and have correct schema
3. Ensure API keys and environment variables are set correctly