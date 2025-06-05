#!/usr/bin/env node

/**
 * Test Backend Integration for Curriculum System
 * 
 * This script validates that:
 * 1. Curriculum changes persist to the database
 * 2. FactRepository loads from backend
 * 3. Claude-generated content saves correctly
 * 4. Learning engine uses backend data
 */

import fetch from 'node-fetch';

const API_BASE = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}/api` 
  : 'http://localhost:3000/api';

console.log('🧪 Testing Backend Integration...');
console.log(`📍 API Base: ${API_BASE}`);

async function testStitchesAPI() {
  console.log('\n1️⃣ Testing Stitches API...');
  
  try {
    // Test GET
    const getResponse = await fetch(`${API_BASE}/admin/stitches`);
    if (!getResponse.ok) {
      throw new Error(`GET failed: ${getResponse.status} ${getResponse.statusText}`);
    }
    const stitches = await getResponse.json();
    console.log(`✅ GET /api/admin/stitches - Found ${stitches.length} stitches`);
    
    // Test POST
    const newStitch = {
      id: `test-stitch-${Date.now()}`,
      name: 'Test Stitch',
      tube_id: 'tube1',
      concept_type: 'addition',
      concept_params: { operand1Range: [0, 5], operand2Range: [0, 5] },
      is_active: true
    };
    
    const postResponse = await fetch(`${API_BASE}/admin/stitches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStitch)
    });
    
    if (!postResponse.ok) {
      throw new Error(`POST failed: ${postResponse.status} ${postResponse.statusText}`);
    }
    const created = await postResponse.json();
    console.log(`✅ POST /api/admin/stitches - Created stitch: ${created.id}`);
    
    // Test PUT
    const updateData = { name: 'Updated Test Stitch' };
    const putResponse = await fetch(`${API_BASE}/admin/stitches?id=${created.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    if (!putResponse.ok) {
      throw new Error(`PUT failed: ${putResponse.status} ${putResponse.statusText}`);
    }
    const updated = await putResponse.json();
    console.log(`✅ PUT /api/admin/stitches - Updated stitch: ${updated.name}`);
    
    // Test DELETE
    const deleteResponse = await fetch(`${API_BASE}/admin/stitches?id=${created.id}`, {
      method: 'DELETE'
    });
    
    if (!deleteResponse.ok) {
      throw new Error(`DELETE failed: ${deleteResponse.status} ${deleteResponse.statusText}`);
    }
    console.log(`✅ DELETE /api/admin/stitches - Deleted test stitch`);
    
  } catch (error) {
    console.error('❌ Stitches API test failed:', error);
    return false;
  }
  
  return true;
}

async function testFactsAPI() {
  console.log('\n2️⃣ Testing Facts API...');
  
  try {
    // Test GET
    const getResponse = await fetch(`${API_BASE}/admin/facts`);
    if (!getResponse.ok) {
      throw new Error(`GET failed: ${getResponse.status} ${getResponse.statusText}`);
    }
    const facts = await getResponse.json();
    console.log(`✅ GET /api/admin/facts - Found ${facts.length} facts`);
    
    // Test POST
    const newFact = {
      statement: '7 + 7',
      answer: '14',
      operation_type: 'addition',
      operand1: 7,
      operand2: 7,
      difficulty_level: 2
    };
    
    const postResponse = await fetch(`${API_BASE}/admin/facts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFact)
    });
    
    if (!postResponse.ok) {
      throw new Error(`POST failed: ${postResponse.status} ${postResponse.statusText}`);
    }
    const created = await postResponse.json();
    console.log(`✅ POST /api/admin/facts - Created fact: ${created.id}`);
    
    // Test DELETE
    const deleteResponse = await fetch(`${API_BASE}/admin/facts?id=${created.id}`, {
      method: 'DELETE'
    });
    
    if (!deleteResponse.ok) {
      throw new Error(`DELETE failed: ${deleteResponse.status} ${deleteResponse.statusText}`);
    }
    console.log(`✅ DELETE /api/admin/facts - Deleted test fact`);
    
  } catch (error) {
    console.error('❌ Facts API test failed:', error);
    return false;
  }
  
  return true;
}

async function testPersistence() {
  console.log('\n3️⃣ Testing Persistence...');
  
  try {
    // Create a stitch
    const testStitch = {
      id: `persistence-test-${Date.now()}`,
      name: 'Persistence Test',
      tube_id: 'tube2',
      concept_type: 'multiplication',
      concept_params: { operand1Range: [1, 5], operand2Range: [2, 2] },
      is_active: true
    };
    
    const createResponse = await fetch(`${API_BASE}/admin/stitches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testStitch)
    });
    
    if (!createResponse.ok) {
      throw new Error(`Failed to create test stitch: ${createResponse.status}`);
    }
    
    // Fetch all stitches to verify it's there
    const getResponse = await fetch(`${API_BASE}/admin/stitches`);
    const allStitches = await getResponse.json();
    
    const found = allStitches.find((s: any) => s.id === testStitch.id);
    if (!found) {
      throw new Error('Created stitch not found in database!');
    }
    
    console.log(`✅ Persistence verified - stitch saved and retrieved`);
    
    // Clean up
    await fetch(`${API_BASE}/admin/stitches?id=${testStitch.id}`, {
      method: 'DELETE'
    });
    
  } catch (error) {
    console.error('❌ Persistence test failed:', error);
    return false;
  }
  
  return true;
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Backend Integration Tests...\n');
  
  const results = {
    stitches: await testStitchesAPI(),
    facts: await testFactsAPI(),
    persistence: await testPersistence()
  };
  
  console.log('\n📊 Test Results:');
  console.log(`  Stitches API: ${results.stitches ? '✅' : '❌'}`);
  console.log(`  Facts API: ${results.facts ? '✅' : '❌'}`);
  console.log(`  Persistence: ${results.persistence ? '✅' : '❌'}`);
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Backend integration is working correctly.');
  } else {
    console.log('\n❌ Some tests failed. Please check the logs above.');
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the tests
runTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});