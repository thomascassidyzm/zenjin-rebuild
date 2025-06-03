/**
 * Payment Context Module
 * 
 * APML v3.1 compliant context boundary for all payment-related components
 * This module is lazy-loaded only when payment functionality is needed
 */

import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingInterface from '../components/LoadingInterface';
import SubscriptionUpgrade from '../components/SubscriptionUpgrade';
import SubscriptionManagement from '../components/SubscriptionManagement';
import SubscriptionSuccess from '../components/SubscriptionSuccess';
import SubscriptionCancelled from '../components/SubscriptionCancelled';
import ContentGatingPrompt from '../components/ContentGatingPrompt';

interface PaymentContextProps {
  userId: string;
  userEmail?: string;
  currentPlan: string;
}

/**
 * Payment Context Component
 * Encapsulates all payment-related functionality in a single context boundary
 */
export const PaymentContext: React.FC<PaymentContextProps> = ({
  userId,
  userEmail,
  currentPlan
}) => {
  return (
    <div className="payment-context">
      <Suspense fallback={<LoadingInterface context={{ source: 'payment' }} />}>
        <Routes>
          <Route path="/subscribe" element={
            <SubscriptionUpgrade 
              userId={userId}
              userEmail={userEmail}
              currentPlan={currentPlan}
            />
          } />
          
          <Route path="/billing" element={
            <SubscriptionManagement />
          } />
          
          <Route path="/subscription/success" element={
            <SubscriptionSuccess />
          } />
          
          <Route path="/subscription/cancelled" element={
            <SubscriptionCancelled />
          } />
          
          <Route path="/content-gated" element={
            <ContentGatingPrompt />
          } />
        </Routes>
      </Suspense>
    </div>
  );
};

// Export the context as default for lazy loading
export default PaymentContext;