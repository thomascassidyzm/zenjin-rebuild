# SubscriptionManager Component

## Overview

The SubscriptionManager component manages user subscription tiers (Anonymous, Free, and Premium) for the Zenjin Maths App. It handles subscription operations, enforces tier limitations, and manages transitions between subscription tiers.

## Features

- Manages three subscription tiers: Anonymous, Free, and Premium
- Handles subscription creation, updates, and cancellations
- Supports multiple premium billing cycles (monthly, quarterly, annual)
- Integrates with payment processing for premium subscriptions
- Provides subscription status checking

## Usage

```typescript
import { SubscriptionManager } from './subscription-manager';
import { PaymentProcessor } from './payment-processor';

// Initialize dependencies
const paymentProcessor = new PaymentProcessor();

// Create subscription manager
const subscriptionManager = new SubscriptionManager(paymentProcessor);

// Get available plans
const plans = subscriptionManager.getSubscriptionPlans();

// Create a premium subscription
const subscription = subscriptionManager.createSubscription(
  'user123',
  'premium-monthly',
  'pm_card_visa'
);

// Check subscription status
const status = subscriptionManager.checkSubscriptionStatus('user123');
```

## Implementation Details

The component implements the full `SubscriptionManagerInterface` as specified in the requirements. Key aspects:

1. **Subscription Tier Features**:
   - Anonymous: Limited access with local storage only and time limitations
   - Free: Basic access with cloud storage and no time limitations
   - Premium: Full access with advanced features and different billing options

2. **Error Handling**:
   - Clear error messages for various failure scenarios
   - Validation for all operations

3. **Integration**:
   - Integrates with PaymentProcessor for premium subscriptions
   - Notifies ContentAccessController of subscription changes
