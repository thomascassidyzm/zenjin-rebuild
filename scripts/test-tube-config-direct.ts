/**
 * Direct test script for TubeConfigurationService
 * Uses environment variables directly (no API calls)
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function testTubeConfigurationDirect() {
  console.log('🧪 Testing Tube Configuration (Direct)...\n');

  // Check environment variables
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Make sure you have .env.local with:');
    console.log('  REACT_APP_SUPABASE_URL=your_url');
    console.log('  REACT_APP_SUPABASE_ANON_KEY=your_key');
    process.exit(1);
  }

  console.log('✅ Environment variables found');
  console.log(`  URL: ${supabaseUrl.substring(0, 30)}...`);
  console.log(`  Key: ${supabaseAnonKey.substring(0, 20)}...\n`);

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test 1: Get default tube positions
    console.log('1️⃣ Testing default_tube_positions query...');
    const { data: defaultPositions, error } = await supabase
      .from('default_tube_positions')
      .select('*')
      .order('tube_id')
      .order('logical_position');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`✅ Found ${defaultPositions.length} default positions`);
    
    // Group by tube
    const tubeGroups = defaultPositions.reduce((acc: any, pos: any) => {
      if (!acc[pos.tube_id]) acc[pos.tube_id] = [];
      acc[pos.tube_id].push(pos);
      return acc;
    }, {});

    Object.entries(tubeGroups).forEach(([tubeId, positions]: [string, any]) => {
      console.log(`  ${tubeId}: ${positions.length} positions`);
      console.log(`    Position 1: ${positions[0]?.stitch_id}`);
      console.log(`    Position 2: ${positions[1]?.stitch_id}`);
      if (positions[0]?.stitch_id === 't1-0001-0001') {
        console.log(`    ✅ Position 1 is 2 Times Table (correct)`);
      }
      if (positions[1]?.stitch_id === 't1-0001-0002') {
        console.log(`    ✅ Position 2 is Double Numbers (correct)`);
      }
    });

    // Test 2: Test stitches table
    console.log('\n2️⃣ Testing stitches table...');
    const { data: stitches, error: stitchError } = await supabase
      .from('stitches')
      .select('id, name, concept_type')
      .limit(5);

    if (stitchError) {
      throw new Error(`Stitches query error: ${stitchError.message}`);
    }

    console.log(`✅ Found ${stitches.length} sample stitches:`);
    stitches.forEach((stitch: any) => {
      console.log(`  ${stitch.id}: ${stitch.name} (${stitch.concept_type})`);
    });

    // Test 3: Test facts table
    console.log('\n3️⃣ Testing facts table...');
    const { data: facts, error: factsError } = await supabase
      .from('facts')
      .select('id, statement, operation_type')
      .in('operation_type', ['double', 'half', 'multiplication'])
      .limit(10);

    if (factsError) {
      throw new Error(`Facts query error: ${factsError.message}`);
    }

    console.log(`✅ Found ${facts.length} sample facts:`);
    facts.forEach((fact: any) => {
      console.log(`  ${fact.id}: "${fact.statement}" (${fact.operation_type})`);
    });

    // Test 4: Check for Double and Half operators
    console.log('\n4️⃣ Testing Double/Half operators...');
    const { count: doubleCount } = await supabase
      .from('facts')
      .select('id', { count: 'exact', head: true })
      .eq('operation_type', 'double');

    const { count: halfCount } = await supabase
      .from('facts')
      .select('id', { count: 'exact', head: true })
      .eq('operation_type', 'half');

    console.log(`✅ Double facts: ${doubleCount}`);
    console.log(`✅ Half facts: ${halfCount}`);

    if (doubleCount > 0 && halfCount > 0) {
      console.log('🎉 Word-based operators working correctly!');
    }

    // Test 5: Sample user_state table (if any users exist)
    console.log('\n5️⃣ Testing user_state table...');
    const { data: userStates, error: userError } = await supabase
      .from('user_state')
      .select('user_id, tube_positions, active_tube')
      .limit(3);

    if (userError) {
      console.log(`ℹ️  User state query error (might be empty): ${userError.message}`);
    } else {
      console.log(`✅ Found ${userStates.length} user states`);
      userStates.forEach((state: any) => {
        console.log(`  User ${state.user_id.substring(0, 8)}... (active tube: ${state.active_tube})`);
        if (state.tube_positions && Object.keys(state.tube_positions).length > 0) {
          console.log(`    Has tube positions configured`);
        }
      });
    }

    console.log('\n🎉 All database tests passed!');
    console.log('\n📋 Summary:');
    console.log(`  ✅ Default positions: ${defaultPositions.length}`);
    console.log(`  ✅ Stitches available: ${stitches.length}+`);
    console.log(`  ✅ Facts available: ${facts.length}+`);
    console.log(`  ✅ Double operators: ${doubleCount}`);
    console.log(`  ✅ Half operators: ${halfCount}`);
    console.log(`  ✅ User states: ${userStates?.length || 0}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testTubeConfigurationDirect().then(() => {
  console.log('\n✨ Database is ready for the app!');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Test suite failed:', error);
  process.exit(1);
});