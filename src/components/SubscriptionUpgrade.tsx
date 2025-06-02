/**
 * SubscriptionUpgrade Component
 * Displays premium subscription options and handles upgrade flow
 */

import React, { useState } from 'react';
import { Crown, Check, Zap, Shield, Star } from 'lucide-react';
import { stripePaymentService } from '../services/StripePaymentService';
import { userSessionManager } from '../services/UserSessionManager';

interface SubscriptionUpgradeProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const SubscriptionUpgrade: React.FC<SubscriptionUpgradeProps> = ({ onClose, isModal = false }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [error, setError] = useState<string | null>(null);

  const plans = [
    {
      id: 'premium-monthly' as const,
      name: 'Monthly',
      price: 9.99,
      period: 'month',
      description: 'Perfect for trying out premium features',
      savings: null
    },
    {
      id: 'premium-quarterly' as const,
      name: 'Quarterly',
      price: 26.99,
      period: '3 months',
      description: 'Most popular choice',
      savings: '10% savings'
    },
    {
      id: 'premium-annual' as const,
      name: 'Annual',
      price: 89.99,
      period: 'year',
      description: 'Best value for committed learners',
      savings: '25% savings'
    }
  ];

  const features = [
    { icon: <Star className="w-5 h-5" />, text: 'Unlimited learning sessions' },
    { icon: <Zap className="w-5 h-5" />, text: 'Advanced analytics & progress tracking' },
    { icon: <Shield className="w-5 h-5" />, text: 'Priority support' },
    { icon: <Crown className="w-5 h-5" />, text: 'Exclusive learning challenges' },
    { icon: <Check className="w-5 h-5" />, text: 'Ad-free experience' }
  ];

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);

    const user = userSessionManager.state.user;
    if (!user) {
      setError('Please sign in to upgrade to premium');
      setLoading(false);
      return;
    }

    const selectedPlanData = plans.find(p => p.id === `premium-${selectedPlan}`);
    if (!selectedPlanData) {
      setError('Invalid plan selected');
      setLoading(false);
      return;
    }

    try {
      const result = await stripePaymentService.processPayment({
        userId: user.id,
        planId: selectedPlanData.id,
        amount: selectedPlanData.price * 100, // Convert to cents
        currency: 'usd',
        paymentDetails: {
          email: user.email
        }
      });

      if (!result.success) {
        setError(result.errorMessage || 'Payment processing failed');
      }
      // If successful, Stripe will redirect to checkout
    } catch (err) {
      console.error('Upgrade error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Upgrade to Premium</h2>
        <p className="text-gray-600">Unlock the full potential of your maths learning journey</p>
      </div>

      {/* Features */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Premium Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="text-yellow-500">{feature.icon}</div>
              <span className="text-gray-700">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id.replace('premium-', '');
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id.replace('premium-', '') as any)}
                className={`relative p-6 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {plan.savings && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {plan.savings}
                    </span>
                  </div>
                )}
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h4>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
                <p className="text-sm text-gray-600">{plan.description}</p>
                {isSelected && (
                  <div className="absolute bottom-2 right-2">
                    <Check className="w-5 h-5 text-yellow-600" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-md hover:from-yellow-600 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Crown className="w-5 h-5" />
              <span>Upgrade Now</span>
            </>
          )}
        </button>
      </div>

      {/* Security Notice */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <Shield className="w-4 h-4 inline mr-1" />
        Secure payment powered by Stripe. Cancel anytime.
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        {content}
      </div>
    );
  }

  return content;
};

export default SubscriptionUpgrade;