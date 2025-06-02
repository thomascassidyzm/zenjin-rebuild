/**
 * SubscriptionCancelled Component
 * Displayed when user cancels the subscription checkout
 */

import React from 'react';
import { X, ArrowLeft } from 'lucide-react';

interface SubscriptionCancelledProps {
  onGoBack?: () => void;
  onTryAgain?: () => void;
}

export const SubscriptionCancelled: React.FC<SubscriptionCancelledProps> = ({ 
  onGoBack, 
  onTryAgain 
}) => {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-900 rounded-lg shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-red-500" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Subscription Cancelled</h1>
          <p className="text-gray-400 mb-8">
            Your subscription purchase was cancelled. No charges were made to your account.
          </p>

          <div className="space-y-3">
            <button
              onClick={onTryAgain || (() => window.location.href = '/dashboard?upgrade=true')}
              className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 font-semibold rounded-md hover:from-yellow-600 hover:to-yellow-700 transition-all"
            >
              Try Again
            </button>
            
            <button
              onClick={onGoBack || (() => window.location.href = '/dashboard')}
              className="w-full px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
          </div>

          <p className="text-gray-500 text-sm mt-6">
            Questions? Contact our support team at support@zenjinmaths.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCancelled;