/**
 * ContentGatingPrompt Component
 * Shows when users hit content limits and need to upgrade
 */

import React from 'react';
import { Crown, Lock, ArrowRight, Star } from 'lucide-react';

interface ContentGatingPromptProps {
  type: 'stitch_limit' | 'offline_request' | 'advanced_feature';
  context: {
    message: string;
    benefits: string[];
    ctaText: string;
    urgency: 'low' | 'medium' | 'high';
  };
  onUpgrade: () => void;
  onContinueFree?: () => void;
  onDismiss?: () => void;
}

export const ContentGatingPrompt: React.FC<ContentGatingPromptProps> = ({
  type,
  context,
  onUpgrade,
  onContinueFree,
  onDismiss
}) => {
  const getUrgencyColors = () => {
    switch (context.urgency) {
      case 'high':
        return 'from-red-900/20 to-orange-900/20 border-orange-600/30';
      case 'medium':
        return 'from-yellow-900/20 to-orange-900/20 border-yellow-600/30';
      case 'low':
        return 'from-blue-900/20 to-indigo-900/20 border-blue-600/30';
      default:
        return 'from-gray-900/20 to-gray-800/20 border-gray-600/30';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'stitch_limit':
        return <Lock className="w-8 h-8 text-orange-500" />;
      case 'offline_request':
        return <Star className="w-8 h-8 text-blue-500" />;
      case 'advanced_feature':
        return <Crown className="w-8 h-8 text-purple-500" />;
      default:
        return <Crown className="w-8 h-8 text-yellow-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className={`bg-gradient-to-br ${getUrgencyColors()} border rounded-lg p-6 max-w-md w-full`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getIcon()}
            <div>
              <h3 className="text-white font-bold text-lg">
                {type === 'stitch_limit' && 'Content Limit Reached'}
                {type === 'offline_request' && 'Offline Learning Available'}
                {type === 'advanced_feature' && 'Premium Feature'}
              </h3>
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Message */}
        <p className="text-gray-300 mb-4">{context.message}</p>

        {/* Benefits */}
        <div className="mb-6">
          <h4 className="text-white font-semibold mb-2">Premium Benefits:</h4>
          <ul className="space-y-2">
            {context.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start space-x-2">
                <Crown className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onUpgrade}
            className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 font-semibold rounded-md hover:from-yellow-600 hover:to-yellow-700 transition-all flex items-center justify-center space-x-2"
          >
            <Crown className="w-5 h-5" />
            <span>{context.ctaText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          {onContinueFree && type === 'stitch_limit' && (
            <button
              onClick={onContinueFree}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
            >
              Continue with practice variations
            </button>
          )}
          
          {onDismiss && type !== 'stitch_limit' && (
            <button
              onClick={onDismiss}
              className="w-full px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              Maybe later
            </button>
          )}
        </div>

        {/* Urgency indicator */}
        {context.urgency === 'high' && (
          <div className="mt-3 text-center">
            <span className="text-orange-400 text-xs font-semibold">
              🔥 Limited time: Save 25% with annual plan
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentGatingPrompt;