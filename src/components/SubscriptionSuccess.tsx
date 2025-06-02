/**
 * SubscriptionSuccess Component
 * Displayed after successful subscription purchase
 */

import React, { useEffect, useState } from 'react';
import { Crown, Check, Loader } from 'lucide-react';
import { userSessionManager } from '../services/UserSessionManager';

interface SubscriptionSuccessProps {
  onContinue?: () => void;
}

export const SubscriptionSuccess: React.FC<SubscriptionSuccessProps> = ({ onContinue }) => {
  const [loading, setLoading] = useState(true);
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');

  useEffect(() => {
    // Refresh user session to get updated subscription status
    const refreshUserStatus = async () => {
      try {
        await userSessionManager.refreshUserState();
        // Simulate loading for better UX
        setTimeout(() => setLoading(false), 1500);
      } catch (error) {
        console.error('Error refreshing user status:', error);
        setLoading(false);
      }
    };

    refreshUserStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-900 rounded-lg shadow-xl p-8 text-center">
          {loading ? (
            <>
              <Loader className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold mb-2">Processing Your Subscription...</h1>
              <p className="text-gray-400">Please wait while we activate your premium features.</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-3xl font-bold mb-2">Welcome to Premium!</h1>
              <p className="text-gray-400 mb-6">
                Your subscription has been activated successfully.
              </p>

              <div className="bg-gray-800 rounded-lg p-6 mb-6 text-left">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Crown className="w-5 h-5 text-yellow-500 mr-2" />
                  Your Premium Benefits
                </h3>
                <ul className="space-y-3">
                  {[
                    'Unlimited learning sessions',
                    'Advanced analytics & progress tracking',
                    'Priority support',
                    'Exclusive learning challenges',
                    'Ad-free experience'
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {sessionId && (
                <p className="text-gray-500 text-sm mb-6">
                  Transaction ID: {sessionId}
                </p>
              )}

              <button
                onClick={onContinue || (() => window.location.href = '/dashboard')}
                className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 font-semibold rounded-md hover:from-yellow-600 hover:to-yellow-700 transition-all"
              >
                Continue to Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;