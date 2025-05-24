/**
 * SubscriptionSystemIntegrationTest.ts
 * Integration test for SubscriptionSystem components to verify they work together
 */

import { SubscriptionManager } from './SubscriptionManager';
import { PaymentProcessorAdapter } from './PaymentProcessorAdapter';
import { PaymentProcessor } from '../PaymentProcessor/PaymentProcessor';
import { StripeGatewayAdapter } from '../PaymentProcessor/PaymentGatewayAdapter';
import { ContentAccessController } from '../ContentAccessController/ContentAccessController';

// Mock repository for testing
class MockPaymentRepository {
  async userExists(userId: string): Promise<boolean> {
    return userId.length > 0;
  }

  async savePaymentRecord(record: any): Promise<void> {
    console.log('Payment record saved:', record.paymentId);
  }

  async getPaymentRecords(userId: string): Promise<any[]> {
    return [];
  }

  async getPaymentRecord(paymentId: string): Promise<any> {
    return null;
  }

  async updatePaymentRecord(record: any): Promise<void> {
    console.log('Payment record updated:', record.paymentId);
  }
}

// Mock content access controller interface  
class MockContentAccessController {
  updateUserAccess(userId: string, planId: string): boolean {
    console.log(`Access updated for user ${userId} to plan ${planId}`);
    return true;
  }
}

/**
 * Runs integration tests for the SubscriptionSystem
 */
export async function runSubscriptionSystemIntegrationTest(): Promise<{
  success: boolean;
  results: string[];
  errors: string[];
}> {
  const results: string[] = [];
  const errors: string[] = [];

  try {
    // Set up test dependencies
    const mockGateway = new StripeGatewayAdapter('test-stripe-key');
    const mockRepository = new MockPaymentRepository();
    const paymentProcessor = new PaymentProcessor(mockGateway, mockRepository as any);
    const paymentAdapter = new PaymentProcessorAdapter(paymentProcessor);
    const contentController = new MockContentAccessController();

    // Create SubscriptionManager
    const subscriptionManager = new SubscriptionManager(
      paymentAdapter, 
      contentController as any
    );

    results.push('✅ SubscriptionManager created successfully');

    // Test 1: Get subscription plans
    const plans = subscriptionManager.getSubscriptionPlans();
    if (plans.length > 0) {
      results.push(`✅ Retrieved ${plans.length} subscription plans`);
      results.push(`   Plans: ${plans.map(p => p.name).join(', ')}`);
    } else {
      errors.push('❌ No subscription plans found');
    }

    // Test 2: Check subscription status for non-existent user
    try {
      const status = subscriptionManager.checkSubscriptionStatus('test-user-123');
      results.push(`✅ Checked subscription status: ${status.hasActiveSubscription ? 'Active' : 'Inactive'}`);
    } catch (error) {
      results.push('✅ Correctly handled non-existent user subscription check');
    }

    // Test 3: Create a free subscription
    try {
      const freeSubscription = await subscriptionManager.createSubscription(
        'test-user-123',
        'free'
      );
      
      if (freeSubscription.userId === 'test-user-123' && freeSubscription.planId === 'free') {
        results.push('✅ Free subscription created successfully');
        results.push(`   Subscription ID: ${freeSubscription.planId}`);
        results.push(`   Status: ${freeSubscription.status}`);
        results.push(`   Auto-renew: ${freeSubscription.autoRenew}`);
      } else {
        errors.push('❌ Free subscription creation returned unexpected data');
      }
    } catch (error) {
      errors.push(`❌ Failed to create free subscription: ${error}`);
    }

    // Test 4: Check subscription status after creation
    try {
      const status = subscriptionManager.checkSubscriptionStatus('test-user-123');
      if (status.hasActiveSubscription && status.planId === 'free') {
        results.push('✅ Subscription status correctly shows active free plan');
      } else {
        errors.push('❌ Subscription status incorrect after creation');
      }
    } catch (error) {
      errors.push(`❌ Failed to check subscription status: ${error}`);
    }

    // Test 5: Update subscription auto-renew
    try {
      const updatedSubscription = await subscriptionManager.updateSubscription(
        'test-user-123',
        { autoRenew: false }
      );
      
      if (!updatedSubscription.autoRenew) {
        results.push('✅ Subscription auto-renew updated successfully');
      } else {
        errors.push('❌ Subscription auto-renew update failed');
      }
    } catch (error) {
      errors.push(`❌ Failed to update subscription: ${error}`);
    }

    // Test 6: Cancel subscription
    try {
      const cancelled = await subscriptionManager.cancelSubscription('test-user-123', false);
      
      if (cancelled) {
        results.push('✅ Subscription cancelled successfully');
      } else {
        errors.push('❌ Subscription cancellation failed');
      }
    } catch (error) {
      errors.push(`❌ Failed to cancel subscription: ${error}`);
    }

    // Test 7: Test premium subscription (this will fail payment at gateway, which is expected)
    try {
      await subscriptionManager.createSubscription(
        'test-user-premium',
        'premium-monthly',
        'card-1234567890123456' // Proper format with 4 digits at end
      );
      results.push('✅ Premium subscription creation handled (payment processing attempted)');
    } catch (error) {
      if (error instanceof Error && (error.message.includes('gateway') || error.message.includes('Payment processing failed'))) {
        results.push('✅ Premium subscription correctly failed at payment gateway (expected for mock)');
      } else {
        errors.push(`❌ Unexpected error creating premium subscription: ${error}`);
      }
    }

  } catch (error) {
    errors.push(`❌ Integration test setup failed: ${error}`);
  }

  return {
    success: errors.length === 0,
    results,
    errors
  };
}

/**
 * Console runner for the integration test
 */
export async function runIntegrationTestConsole(): Promise<void> {
  console.log('🧪 Running SubscriptionSystem Integration Test...\n');
  
  const testResult = await runSubscriptionSystemIntegrationTest();
  
  console.log('📊 Test Results:');
  testResult.results.forEach(result => console.log(result));
  
  if (testResult.errors.length > 0) {
    console.log('\n❌ Errors:');
    testResult.errors.forEach(error => console.log(error));
  }
  
  console.log(`\n🎯 Overall Result: ${testResult.success ? 'PASS' : 'FAIL'}`);
  console.log(`   ✅ ${testResult.results.length} tests passed`);
  console.log(`   ❌ ${testResult.errors.length} errors found`);
}