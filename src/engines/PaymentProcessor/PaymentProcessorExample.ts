// PaymentProcessorExample.ts - Example usage of the PaymentProcessor

import { PaymentDetails } from './PaymentProcessorTypes';
import { createPaymentProcessor } from './index';

/**
 * Example usage of the PaymentProcessor component
 */
export async function paymentProcessorExample() {
  // Create a payment processor with in-memory repository and Stripe gateway
  const paymentProcessor = createPaymentProcessor({
    repositoryType: 'memory',
    repositoryConfig: {
      existingUsers: ['user123']
    },
    defaultGateway: 'card',
    gatewayConfig: {
      stripeApiKey: 'sk_test_example'
    }
  });

  // Process a payment
  const userId = 'user123';
  const paymentDetails: PaymentDetails = {
    method: 'card',
    amount: 4.99,
    currency: 'USD',
    methodDetails: {
      token: 'tok_visa',
      lastFour: '4242',
      expiryMonth: 12,
      expiryYear: 2025
    },
    metadata: {
      planId: 'premium-monthly'
    }
  };

  try {
    console.log('Processing payment...');
    const result = await paymentProcessor.processPayment(userId, paymentDetails);
    console.log('Payment result:', result);

    if (result.success) {
      // Get payment history
      console.log('Getting payment history...');
      const history = await paymentProcessor.getPaymentHistory(userId);
      console.log('Payment history:', history);

      // Refund the payment
      console.log('Processing refund...');
      const refundResult = await paymentProcessor.refundPayment(
        result.paymentId!,
        'Customer request - changed mind'
      );
      console.log('Refund result:', refundResult);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Uncomment to run the example
// paymentProcessorExample().catch(console.error);