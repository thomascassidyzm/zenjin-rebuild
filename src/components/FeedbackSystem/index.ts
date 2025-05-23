// FeedbackSystem/index.ts
// Export FeedbackSystem and related functionality

import FeedbackSystem, { 
  FeedbackSystemProvider, 
  useFeedback, 
  useFeedbackSystem, 
  FeedbackTarget, 
  FeedbackOptions, 
  FeedbackResult, 
  FEEDBACK_ERRORS 
} from './FeedbackSystem';

export default FeedbackSystem;

export {
  FeedbackSystemProvider,
  useFeedback,
  useFeedbackSystem,
  FEEDBACK_ERRORS
};

// Use export type for TypeScript interfaces when isolatedModules is enabled
export type { FeedbackTarget, FeedbackOptions, FeedbackResult };
