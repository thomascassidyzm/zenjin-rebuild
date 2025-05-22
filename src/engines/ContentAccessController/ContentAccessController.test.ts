import { ContentAccessController, ErrorTypes } from './ContentAccessController';

// Mock SubscriptionManager for testing
class MockSubscriptionManager {
  private userSubscriptions: Map<string, any> = new Map();

  constructor() {
    // Set up test users with different subscription tiers
    this.userSubscriptions.set('anonymous-user', {
      userId: 'anonymous-user',
      tier: 'anonymous',
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    });

    this.userSubscriptions.set('free-user', {
      userId: 'free-user',
      tier: 'free',
      status: 'active',
      startDate: new Date().toISOString()
    });

    this.userSubscriptions.set('premium-user', {
      userId: 'premium-user',
      tier: 'premium',
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
    });

    this.userSubscriptions.set('expired-user', {
      userId: 'expired-user',
      tier: 'premium',
      status: 'expired',
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
      endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    });
  }

  getUserSubscription(userId: string) {
    const subscription = this.userSubscriptions.get(userId);
    if (!subscription) {
      throw new Error(`User not found: ${userId}`);
    }
    return subscription;
  }
}

/**
 * Test function to run all tests
 */
function runTests() {
  console.log('Starting ContentAccessController tests...');
  
  const mockSubscriptionManager = new MockSubscriptionManager();
  const controller = new ContentAccessController(mockSubscriptionManager);
  
  // Test 1: Free User Access to Free Content
  testFreeUserAccess(controller);
  
  // Test 2: Free User No Access to Premium Content
  testFreeUserNoPremiumAccess(controller);
  
  // Test 3: Premium User Access to All Content
  testPremiumUserAccess(controller);
  
  // Test 4: Special Access Granting
  testSpecialAccessGrant(controller);
  
  // Test 5: Special Access Revocation
  testSpecialAccessRevoke(controller);
  
  // Test 6: Access Rights Update
  testAccessRightsUpdate(controller);
  
  // Test 7: Get Accessible Content
  testGetAccessibleContent(controller);
  
  // Test 8: Tube-Based Content Limitation
  testTubeBasedLimitation(controller);

  // Test 9: Error Handling
  testErrorHandling(controller);
  
  console.log('All tests completed!');
}

/**
 * Test free user access to free content
 */
function testFreeUserAccess(controller: ContentAccessController) {
  console.log('\nTest: Free User Access to Free Content');
  
  try {
    // Check access to a free content item
    const result = controller.checkAccess('free-user', 'stitch-add-1');
    
    console.assert(result.hasAccess === true, 'Free user should have access to free content');
    console.log(`Result: ${result.hasAccess ? 'PASS' : 'FAIL'} - ${result.reason}`);
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

/**
 * Test free user no access to premium content
 */
function testFreeUserNoPremiumAccess(controller: ContentAccessController) {
  console.log('\nTest: Free User No Access to Premium Content');
  
  try {
    // Check access to a premium content item
    const result = controller.checkAccess('free-user', 'stitch-add-15');
    
    console.assert(result.hasAccess === false, 'Free user should not have access to premium content');
    console.log(`Result: ${result.hasAccess ? 'FAIL' : 'PASS'} - ${result.reason}`);
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

/**
 * Test premium user access to all content
 */
function testPremiumUserAccess(controller: ContentAccessController) {
  console.log('\nTest: Premium User Access to All Content');
  
  try {
    // Check access to a premium content item
    const result = controller.checkAccess('premium-user', 'stitch-mul-25');
    
    console.assert(result.hasAccess === true, 'Premium user should have access to premium content');
    console.log(`Result: ${result.hasAccess ? 'PASS' : 'FAIL'} - ${result.reason}`);
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

/**
 * Test special access granting
 */
function testSpecialAccessGrant(controller: ContentAccessController) {
  console.log('\nTest: Special Access Granting');
  
  try {
    // Grant special access to premium content for a free user
    const premiumContentIds = ['stitch-mul-15', 'stitch-sub-20'];
    const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days from now
    
    const updatedRights = controller.grantSpecialAccess('free-user', premiumContentIds, expirationDate);
    
    console.assert(updatedRights.specialAccess !== undefined, 'Special access array should exist');
    console.assert(updatedRights.specialAccess!.includes('stitch-mul-15'), 'Special access should include first content ID');
    console.assert(updatedRights.specialAccess!.includes('stitch-sub-20'), 'Special access should include second content ID');
    console.assert(updatedRights.expirationDate === expirationDate, 'Expiration date should be set correctly');
    
    console.log(`Special access granted: ${updatedRights.specialAccess?.join(', ')}`);
    console.log(`Expiration date: ${updatedRights.expirationDate}`);
    
    // Verify access to the special content
    const accessResult = controller.checkAccess('free-user', 'stitch-mul-15');
    console.assert(accessResult.hasAccess === true, 'Free user should now have access to specially granted content');
    console.log(`Access check result: ${accessResult.hasAccess ? 'PASS' : 'FAIL'} - ${accessResult.reason}`);
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

/**
 * Test special access revocation
 */
function testSpecialAccessRevoke(controller: ContentAccessController) {
  console.log('\nTest: Special Access Revocation');
  
  try {
    // Revoke special access to one content item
    const contentIdsToRevoke = ['stitch-mul-15'];
    
    const updatedRights = controller.revokeSpecialAccess('free-user', contentIdsToRevoke);
    
    console.assert(updatedRights.specialAccess !== undefined, 'Special access array should exist');
    console.assert(!updatedRights.specialAccess!.includes('stitch-mul-15'), 'Special access should not include revoked content ID');
    console.assert(updatedRights.specialAccess!.includes('stitch-sub-20'), 'Special access should still include non-revoked content ID');
    
    console.log(`Remaining special access: ${updatedRights.specialAccess?.join(', ')}`);
    
    // Verify no access to the revoked content
    const accessResult = controller.checkAccess('free-user', 'stitch-mul-15');
    console.assert(accessResult.hasAccess === false, 'Free user should no longer have access to revoked content');
    console.log(`Access check result: ${accessResult.hasAccess ? 'FAIL' : 'PASS'} - ${accessResult.reason}`);
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

/**
 * Test access rights update
 */
function testAccessRightsUpdate(controller: ContentAccessController) {
  console.log('\nTest: Access Rights Update');
  
  try {
    // Update a free user to premium
    const expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now
    
    const updatedRights = controller.updateAccessRights('free-user', 'premium', expirationDate);
    
    console.assert(updatedRights.accessLevel === 'premium', 'Access level should be updated to premium');
    console.assert(updatedRights.expirationDate === expirationDate, 'Expiration date should be set correctly');
    
    console.log(`Updated access level: ${updatedRights.accessLevel}`);
    console.log(`Updated expiration date: ${updatedRights.expirationDate}`);
    
    // Verify access to premium content
    const accessResult = controller.checkAccess('free-user', 'stitch-mul-15');
    console.assert(accessResult.hasAccess === true, 'User should now have premium access');
    console.log(`Access check result: ${accessResult.hasAccess ? 'PASS' : 'FAIL'} - ${accessResult.reason}`);
    
    // Revert back to free for other tests
    controller.updateAccessRights('free-user', 'free');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

/**
 * Test get accessible content
 */
function testGetAccessibleContent(controller: ContentAccessController) {
  console.log('\nTest: Get Accessible Content');
  
  try {
    // Get all stitches accessible to a free user
    const accessibleContent = controller.getAccessibleContent('free-user', 'stitch');
    
    // Group by tube
    const contentByTube: { [tube: string]: any[] } = {};
    
    accessibleContent.forEach(content => {
      const tube = content.metadata?.tube || 'unknown';
      if (!contentByTube[tube]) {
        contentByTube[tube] = [];
      }
      contentByTube[tube].push(content);
    });
    
    console.log(`Total accessible stitches: ${accessibleContent.length}`);
    
    Object.entries(contentByTube).forEach(([tube, contents]) => {
      console.log(`${tube}: ${contents.length} stitches`);
      console.assert(contents.length <= 10, `Free tier should be limited to 10 stitches per tube (${tube})`);
    });
    
    // Verify premium user gets more content
    const premiumAccessibleContent = controller.getAccessibleContent('premium-user', 'stitch');
    console.assert(
      premiumAccessibleContent.length > accessibleContent.length,
      'Premium user should have access to more content than free user'
    );
    console.log(`Premium user accessible stitches: ${premiumAccessibleContent.length}`);
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

/**
 * Test tube-based content limitation
 */
function testTubeBasedLimitation(controller: ContentAccessController) {
  console.log('\nTest: Tube-Based Content Limitation');
  
  try {
    // Count accessible stitches for the free user's addition tube
    const accessibleContent = controller.getAccessibleContent('free-user', 'stitch');
    
    const additionStitches = accessibleContent.filter(content => 
      content.metadata?.tube === 'addition'
    );
    
    console.log(`Accessible addition stitches for free user: ${additionStitches.length}`);
    console.assert(additionStitches.length === 10, 'Free user should have access to exactly 10 addition stitches');
    
    // Try to access the 11th addition stitch (should fail)
    const eleventhStitchId = 'stitch-add-11';
    const accessResult = controller.checkAccess('free-user', eleventhStitchId);
    
    console.assert(accessResult.hasAccess === false, 'Free user should not have access to the 11th stitch');
    console.log(`Access to 11th stitch: ${accessResult.hasAccess ? 'FAIL' : 'PASS'} - ${accessResult.reason}`);
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

/**
 * Test error handling
 */
function testErrorHandling(controller: ContentAccessController) {
  console.log('\nTest: Error Handling');
  
  // Test invalid user ID
  try {
    controller.checkAccess('non-existent-user', 'stitch-add-1');
    console.log('FAIL: Should have thrown USER_NOT_FOUND error');
  } catch (error: any) {
    console.assert(error.code === ErrorTypes.USER_NOT_FOUND, 'Should throw USER_NOT_FOUND error');
    console.log(`PASS: Correctly threw error with code ${error.code}`);
  }
  
  // Test invalid content ID
  try {
    controller.checkAccess('free-user', 'non-existent-content');
    console.log('FAIL: Should have thrown CONTENT_NOT_FOUND error');
  } catch (error: any) {
    console.assert(error.code === ErrorTypes.CONTENT_NOT_FOUND, 'Should throw CONTENT_NOT_FOUND error');
    console.log(`PASS: Correctly threw error with code ${error.code}`);
  }
  
  // Test invalid access level
  try {
    (controller as any).updateAccessRights('free-user', 'invalid-level');
    console.log('FAIL: Should have thrown INVALID_ACCESS_LEVEL error');
  } catch (error: any) {
    console.assert(error.code === ErrorTypes.INVALID_ACCESS_LEVEL, 'Should throw INVALID_ACCESS_LEVEL error');
    console.log(`PASS: Correctly threw error with code ${error.code}`);
  }
}

// Run all tests
runTests();
