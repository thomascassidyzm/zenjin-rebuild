// Example usage of the ContentAccessController in the Zenjin Maths App

import { ContentAccessController } from './ContentAccessController';
import { MockSubscriptionManager } from './MockSubscriptionManager'; // Assumed to be implemented

// Initialize dependencies
const subscriptionManager = new MockSubscriptionManager();

// Create content access controller
const contentAccessController = new ContentAccessController(subscriptionManager);

/**
 * Example: Check content access for a user
 */
function checkUserContentAccess(userId: string, contentId: string) {
  console.log(`\nChecking access for user ${userId} to content ${contentId}...`);
  
  try {
    // Get user's access rights
    const accessRights = contentAccessController.getUserAccessRights(userId);
    console.log(`Current access level: ${accessRights.accessLevel}`);
    
    if (accessRights.expirationDate) {
      const expirationDate = new Date(accessRights.expirationDate);
      const now = new Date();
      const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`Access expires in ${daysRemaining} days`);
    }
    
    if (accessRights.specialAccess && accessRights.specialAccess.length > 0) {
      console.log(`Special access items: ${accessRights.specialAccess.join(', ')}`);
    }
    
    // Check if user has access to the content
    const accessResult = contentAccessController.checkAccess(userId, contentId);
    console.log(`Has access: ${accessResult.hasAccess}`);
    console.log(`Reason: ${accessResult.reason}`);
    
    if (!accessResult.hasAccess) {
      console.log('Suggesting premium upgrade to access this content');
      // Here you would typically show a premium upgrade offer
    }
    
    return accessResult.hasAccess;
  } catch (error: any) {
    console.error(`Error checking access: ${error.message}`);
    return false;
  }
}

/**
 * Example: Handle user subscription upgrade
 */
function upgradeUserSubscription(userId: string, newLevel: 'free' | 'premium', durationMonths: number = 1) {
  console.log(`\nUpgrading user ${userId} to ${newLevel} for ${durationMonths} months...`);
  
  try {
    // Calculate expiration date
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + durationMonths);
    
    // Update access rights
    const updatedRights = contentAccessController.updateAccessRights(
      userId,
      newLevel,
      expirationDate.toISOString()
    );
    
    console.log(`Updated access level: ${updatedRights.accessLevel}`);
    console.log(`New expiration date: ${updatedRights.expirationDate}`);
    
    return true;
  } catch (error: any) {
    console.error(`Error upgrading subscription: ${error.message}`);
    return false;
  }
}

/**
 * Example: Get all accessible content for a user
 */
function getAccessibleContentForUser(userId: string) {
  console.log(`\nFetching accessible content for user ${userId}...`);
  
  try {
    // Get all accessible stitches
    const accessibleStitches = contentAccessController.getAccessibleContent(userId, 'stitch');
    console.log(`Accessible stitches: ${accessibleStitches.length}`);
    
    // Group by tube
    const stitchesByTube = accessibleStitches.reduce((acc: { [key: string]: any[] }, stitch) => {
      const tube = stitch.metadata?.tube || 'unknown';
      if (!acc[tube]) {
        acc[tube] = [];
      }
      acc[tube].push(stitch);
      return acc;
    }, {});
    
    // Display statistics
    Object.entries(stitchesByTube).forEach(([tube, stitches]) => {
      console.log(`${tube}: ${stitches.length} stitches`);
    });
    
    return stitchesByTube;
  } catch (error: any) {
    console.error(`Error fetching accessible content: ${error.message}`);
    return {};
  }
}

/**
 * Example: Grant trial access to premium content
 */
function grantTrialAccess(userId: string, contentIds: string[], durationDays: number = 7) {
  console.log(`\nGranting ${durationDays}-day trial access to user ${userId} for content: ${contentIds.join(', ')}...`);
  
  try {
    // Calculate expiration date
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + durationDays);
    
    // Grant special access
    const updatedRights = contentAccessController.grantSpecialAccess(
      userId,
      contentIds,
      expirationDate.toISOString()
    );
    
    console.log(`Special access granted successfully`);
    console.log(`Total special access items: ${updatedRights.specialAccess?.length || 0}`);
    console.log(`Special access expires: ${updatedRights.expirationDate}`);
    
    return true;
  } catch (error: any) {
    console.error(`Error granting trial access: ${error.message}`);
    return false;
  }
}

/**
 * Example: Handle expired user
 */
function handleExpiredUser(userId: string) {
  console.log(`\nHandling expired subscription for user ${userId}...`);
  
  try {
    // Get user's access rights
    const accessRights = contentAccessController.getUserAccessRights(userId);
    
    // Check if access has expired
    if (accessRights.expirationDate && new Date(accessRights.expirationDate) < new Date()) {
      console.log('Subscription has expired');
      
      // Downgrade to free tier
      contentAccessController.updateAccessRights(userId, 'free');
      console.log('User downgraded to free tier');
      
      // Show renewal option
      console.log('Showing subscription renewal option to user');
      
      return true;
    } else {
      console.log('Subscription is still active');
      return false;
    }
  } catch (error: any) {
    console.error(`Error handling expired user: ${error.message}`);
    return false;
  }
}

/**
 * Example: Main application flow
 */
function appDemo() {
  console.log('=== Zenjin Maths App - Content Access Demo ===\n');
  
  // Example 1: Free user trying to access premium content
  checkUserContentAccess('free-user', 'stitch-mul-15');
  
  // Example 2: Free user accessing accessible content
  checkUserContentAccess('free-user', 'stitch-add-5');
  
  // Example 3: Get all accessible content for free user
  getAccessibleContentForUser('free-user');
  
  // Example 4: Upgrade free user to premium
  upgradeUserSubscription('free-user', 'premium', 1); // 1 month
  
  // Example 5: Check premium access after upgrade
  checkUserContentAccess('free-user', 'stitch-mul-15');
  
  // Example 6: Get all accessible content after upgrade
  getAccessibleContentForUser('free-user');
  
  // Example 7: Handle an expired user
  handleExpiredUser('expired-user');
  
  // Example 8: Grant trial access to a specific premium content
  grantTrialAccess('expired-user', ['stitch-div-25', 'stitch-mul-30'], 7); // 7-day trial
  
  // Example 9: Check access to trial content
  checkUserContentAccess('expired-user', 'stitch-div-25');
}

// Run the demo
appDemo();
