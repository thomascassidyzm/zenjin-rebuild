/**
 * SubscriptionManagement Component
 * Allows users to view and manage their premium subscription
 */

import React, { useState, useEffect } from 'react';
import { Crown, CreditCard, Calendar, AlertCircle, Check, X } from 'lucide-react';
import { stripePaymentService } from '../services/StripePaymentService';
import { userSessionManager } from '../services/UserSessionManager';
import { format } from 'date-fns';

interface SubscriptionInfo {
  active: boolean;
  planId?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

interface SubscriptionManagementProps {
  onUpgradeClicked?: () => void;
  onBack?: () => void;
}

export const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ 
  onUpgradeClicked,
  onBack 
}) => {
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    setLoading(true);
    setError(null);

    const user = userSessionManager.state.user;
    if (!user) {
      setError('Please sign in to view subscription details');
      setLoading(false);
      return;
    }

    try {
      const status = await stripePaymentService.checkSubscriptionStatus(user.id);
      setSubscriptionInfo(status);
    } catch (err) {
      console.error('Error checking subscription status:', err);
      setError('Failed to load subscription details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will continue to have access until the end of your current billing period.')) {
      return;
    }

    setProcessingAction(true);
    setError(null);

    const user = userSessionManager.state.user;
    if (!user || !subscriptionInfo?.planId) {
      setError('Unable to cancel subscription');
      setProcessingAction(false);
      return;
    }

    try {
      const result = await stripePaymentService.cancelSubscription({
        userId: user.id,
        planId: subscriptionInfo.planId,
        immediate: false
      });

      if (result.success) {
        await checkSubscriptionStatus();
      } else {
        setError(result.errorMessage || 'Failed to cancel subscription');
      }
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    setProcessingAction(true);
    setError(null);

    const user = userSessionManager.state.user;
    if (!user || !subscriptionInfo?.planId) {
      setError('Unable to update payment method');
      setProcessingAction(false);
      return;
    }

    try {
      await stripePaymentService.updatePaymentMethod({
        userId: user.id,
        planId: subscriptionInfo.planId,
        amount: 0,
        currency: 'usd'
      });
    } catch (err) {
      console.error('Error updating payment method:', err);
      setError('Failed to open payment method update. Please try again.');
      setProcessingAction(false);
    }
  };

  const handleReactivateSubscription = async () => {
    const user = userSessionManager.state.user;
    if (!user) return;

    setProcessingAction(true);
    try {
      const portalSession = await stripePaymentService.createCustomerPortalSession(user.id);
      if (portalSession?.url) {
        window.location.href = portalSession.url;
      } else {
        setError('Failed to open subscription management portal');
      }
    } catch (err) {
      console.error('Error opening portal:', err);
      setError('Failed to open subscription management portal');
    } finally {
      setProcessingAction(false);
    }
  };

  const getPlanName = (planId?: string) => {
    if (!planId) return 'Unknown';
    if (planId.includes('monthly')) return 'Monthly';
    if (planId.includes('quarterly')) return 'Quarterly';
    if (planId.includes('annual')) return 'Annual';
    return 'Premium';
  };

  const getPlanPrice = (planId?: string) => {
    if (!planId) return '$0';
    if (planId.includes('monthly')) return '$9.99/month';
    if (planId.includes('quarterly')) return '$26.99/3 months';
    if (planId.includes('annual')) return '$89.99/year';
    return 'Premium';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white mb-4 inline-flex items-center"
            >
              ← Back to Dashboard
            </button>
          )}
          <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
          <p className="text-gray-400">Manage your Zenjin Maths premium subscription</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-600/30 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Subscription Status */}
        {subscriptionInfo?.active ? (
          <div className="space-y-6">
            {/* Active Subscription Card */}
            <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-600/30 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Crown className="w-8 h-8 text-yellow-500" />
                  <div>
                    <h2 className="text-xl font-semibold text-white">Premium Subscription</h2>
                    <p className="text-gray-300">{getPlanName(subscriptionInfo.planId)} Plan</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900/30 text-green-400 border border-green-600/30">
                  <Check className="w-4 h-4 mr-1" />
                  Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-400 text-sm">Current Plan</p>
                  <p className="text-white font-semibold">{getPlanPrice(subscriptionInfo.planId)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">
                    {subscriptionInfo.cancelAtPeriodEnd ? 'Cancels on' : 'Renews on'}
                  </p>
                  <p className="text-white font-semibold">
                    {subscriptionInfo.currentPeriodEnd 
                      ? format(new Date(subscriptionInfo.currentPeriodEnd), 'MMMM d, yyyy')
                      : 'Unknown'
                    }
                  </p>
                </div>
              </div>

              {subscriptionInfo.cancelAtPeriodEnd && (
                <div className="mb-4 p-3 bg-orange-900/20 border border-orange-600/30 rounded-md">
                  <p className="text-orange-300 text-sm">
                    Your subscription is set to cancel at the end of the current billing period.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleUpdatePaymentMethod}
                  disabled={processingAction}
                  className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Update Payment Method
                </button>
                
                {subscriptionInfo.cancelAtPeriodEnd ? (
                  <button
                    onClick={handleReactivateSubscription}
                    disabled={processingAction}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reactivate Subscription
                  </button>
                ) : (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={processingAction}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>

            {/* Premium Features */}
            <div className="bg-gray-900/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Your Premium Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Unlimited learning sessions',
                  'Advanced analytics & progress tracking',
                  'Priority support',
                  'Exclusive learning challenges',
                  'Ad-free experience',
                  'Early access to new features'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // No Active Subscription
          <div className="bg-gray-900/50 rounded-lg p-8 text-center">
            <Crown className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Active Subscription</h2>
            <p className="text-gray-400 mb-6">
              Upgrade to Premium to unlock unlimited learning sessions and exclusive features.
            </p>
            {onUpgradeClicked && (
              <button
                onClick={onUpgradeClicked}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 font-semibold rounded-md hover:from-yellow-600 hover:to-yellow-700 transition-all inline-flex items-center"
              >
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to Premium
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManagement;