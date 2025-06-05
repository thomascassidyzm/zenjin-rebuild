#!/usr/bin/env node

/**
 * Quick database content checker
 * Run with: node scripts/check-database-content.js
 */

async function checkDatabase() {
  console.log('🔍 Checking database content...\n');

  try {
    // Check stitches
    console.log('📚 CHECKING STITCHES:');
    const stitchesResponse = await fetch('http://localhost:5173/api/admin/stitches');
    if (stitchesResponse.ok) {
      const stitches = await stitchesResponse.json();
      console.log(`Found ${stitches.length} stitches in database:\n`);
      
      // Group by tube
      const byTube = { tube1: [], tube2: [], tube3: [] };
      stitches.forEach(s => {
        if (byTube[s.tube_id]) {
          byTube[s.tube_id].push(s);
        }
      });
      
      Object.entries(byTube).forEach(([tube, items]) => {
        console.log(`\n${tube.toUpperCase()} (${items.length} stitches):`);
        items.sort((a, b) => a.position - b.position).forEach(stitch => {
          console.log(`  ${stitch.position}: ${stitch.stitch_id} - ${stitch.concept_type} ${JSON.stringify(stitch.concept_params)}`);
        });
      });
    } else {
      console.log('❌ Failed to fetch stitches:', stitchesResponse.status);
    }

    // Check facts count
    console.log('\n\n📊 CHECKING FACTS:');
    const factsResponse = await fetch('http://localhost:5173/api/admin/facts');
    if (factsResponse.ok) {
      const facts = await factsResponse.json();
      console.log(`Found ${facts.length} facts in database`);
      
      // Sample a few
      if (facts.length > 0) {
        console.log('\nSample facts:');
        facts.slice(0, 5).forEach(fact => {
          console.log(`  ${fact.fact_id}: ${fact.operand1} ${fact.operation} ${fact.operand2} = ${fact.result}`);
        });
        if (facts.length > 5) {
          console.log(`  ... and ${facts.length - 5} more`);
        }
      }
    } else {
      console.log('❌ Failed to fetch facts:', factsResponse.status);
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
    console.log('\nMake sure:');
    console.log('1. The app is running (npm run dev)');
    console.log('2. You\'re logged in as admin');
    console.log('3. The backend is connected');
  }
}

// Direct Supabase query option (requires env vars)
async function checkSupabaseDirectly() {
  console.log('\n\n🔗 DIRECT SUPABASE CHECK:');
  console.log('Run this SQL in Supabase dashboard:');
  console.log(`
SELECT tube_id, COUNT(*) as count 
FROM app_stitches 
GROUP BY tube_id;

SELECT * FROM app_stitches 
ORDER BY tube_id, position 
LIMIT 20;
  `);
}

checkDatabase();
checkSupabaseDirectly();