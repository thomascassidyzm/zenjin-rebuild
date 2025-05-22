import { SubscriptionManager } from './subscription-manager-implementation';
import { PaymentProcessingInterface } from './subscription-manager-interfaces';

/**
 * Simple mock payment processor for demonstration
 */
class MockPaymentProcessor implements PaymentProcessingInterface {
  processPayment() {
    return { success: true, transactionId: 'tx_123456' };
  }
  
  cancelSubscription() {
    return { success: true };
  }
  
  updatePaymentMethod() {
    return { success: true };
  }
}

/**
 * Example usage of the SubscriptionManager
 */
function runExample() {
  // Create dependencies
  const paymentProcessor = new MockPaymentProcessor();
  
  // Create the subscription manager
  const subscriptionManager = new SubscriptionManager(paymentProcessor);
  
  // Get available subscription plans
  const plans = subscriptionManager.getSubscriptionPlans();
  console.log('Available subscription plans:');
  plans.forEach(plan => {
    console.log(`- ${plan.name}: ${plan.price} ${plan.currency} (${plan.billingCycle})`);
  });
  console.log();
  
  try {
    // Create a free subscription
    console.log('Creating a free subscription:');
    const freeSubscription = subscriptionManager.createSubscription('user123', 'free');
    console.log('Free subscription created:', freeSubscription);
    console.log();
    
    // Create a premium subscription
    console.log('Creating a premium subscription:');
    const premiumSubscription = subscriptionManager.createSubscription(
      'user456',
      'premium-monthly',
      'pm_card_visa'
    );
    console.log('Premium subscription created:', premiumSubscription);
    console.log();
    
    // Check subscription status
    console.log('Checking subscription status:');
    const status = subscriptionManager.checkSubscriptionStatus('user456');
    console.log('Status:', status);
    console.log();
    
    // Update subscription to annual plan
    console.log('Updating subscription to annual plan:');
    const updatedSubscription = subscriptionManager.updateSubscription('user456', {
      planId: 'premium-annual'
    });
    console.log('Updated subscription:', updatedSubscription);
    console.log();
    
    // Cancel subscription
    console.log('Cancelling subscription:');
    const cancelled = subscriptionManager.cancelSubscription('user456');
    console.log('Cancelled:', cancelled);
    console.log();
    
    // Get subscription after cancellation
    const finalSubscription = subscriptionManager.getUserSubscription('user456');
    console.log('Subscription after cancellation:', finalSubscription);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
runExample();
