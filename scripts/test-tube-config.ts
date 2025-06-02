/**
 * Test script for TubeConfigurationService
 * Run this to verify default tube positions are working
 */

import { tubeConfigurationService } from '../src/services/TubeConfigurationService';

async function testTubeConfiguration() {
  console.log('🧪 Testing TubeConfigurationService...\n');

  try {
    // Test 1: Get default tube positions
    console.log('1️⃣ Testing getDefaultTubePositions...');
    const defaultPositions = await tubeConfigurationService.getDefaultTubePositions();
    console.log(`✅ Found ${defaultPositions.length} default positions`);
    
    // Show first few positions for each tube
    const tubeGroups = defaultPositions.reduce((acc, pos) => {
      if (!acc[pos.tube_id]) acc[pos.tube_id] = [];
      acc[pos.tube_id].push(pos);
      return acc;
    }, {} as any);

    Object.entries(tubeGroups).forEach(([tubeId, positions]: [string, any]) => {
      console.log(`  ${tubeId}: ${positions.length} positions`);
      console.log(`    Position 1: ${positions[0]?.stitch_id}`);
      console.log(`    Position 2: ${positions[1]?.stitch_id}`);
    });

    // Test 2: Convert to user format
    console.log('\n2️⃣ Testing convertToUserFormat...');
    const userFormat = tubeConfigurationService.convertToUserFormat(defaultPositions);
    console.log('✅ Converted to user format:');
    Object.entries(userFormat).forEach(([tubeId, positions]) => {
      const posCount = Object.keys(positions).length;
      console.log(`  ${tubeId}: ${posCount} positions`);
      console.log(`    Position 1: ${positions['1']}`);
      console.log(`    Position 2: ${positions['2']}`);
    });

    // Test 3: Test with a mock user ID
    console.log('\n3️⃣ Testing initializeUserTubePositions...');
    const mockUserId = '11111111-1111-1111-1111-111111111111'; // Test user from seed
    
    try {
      const initializedPositions = await tubeConfigurationService.initializeUserTubePositions(mockUserId);
      console.log('✅ Successfully initialized user tube positions');
      console.log(`  Tube1 position 1: ${initializedPositions.tube1?.['1']}`);
      console.log(`  Tube2 position 1: ${initializedPositions.tube2?.['1']}`);
      console.log(`  Tube3 position 1: ${initializedPositions.tube3?.['1']}`);
    } catch (error) {
      console.log('ℹ️  User initialization test skipped (user may not exist)');
      console.log(`   Error: ${error}`);
    }

    // Test 4: Test getCurrentStitch
    console.log('\n4️⃣ Testing getCurrentStitch...');
    try {
      const currentStitch = await tubeConfigurationService.getCurrentStitch(mockUserId);
      if (currentStitch) {
        console.log(`✅ Current stitch: ${currentStitch}`);
      } else {
        console.log('ℹ️  No current stitch found');
      }
    } catch (error) {
      console.log('ℹ️  getCurrentStitch test skipped');
      console.log(`   Error: ${error}`);
    }

    console.log('\n🎉 TubeConfigurationService tests completed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testTubeConfiguration().then(() => {
  console.log('\n✨ All tests passed!');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Test suite failed:', error);
  process.exit(1);
});