// FeedbackSystem/index.ts
// Export FeedbackSystem and related functionality

import FeedbackSystem, { 
  FeedbackSystemProvider, 
  useFeedback, 
  useFeedbackSystem, 
  FEEDBACK_ERRORS 
} from './FeedbackSystem';

// Import interfaces from generated interfaces
import { 
  FeedbackSystemInterface 
} from '../../interfaces/FeedbackSystemInterface';

export default FeedbackSystem;

export {
  FeedbackSystemProvider,
  useFeedback,
  useFeedbackSystem,
  FEEDBACK_ERRORS
};

// Re-export the interface
export type { FeedbackSystemInterface };

// Re-export types from the generated interface
export type { 
  FeedbackTarget, 
  FeedbackOptions, 
  FeedbackResult,
  FeedbackSystemErrorCode
} from '../../interfaces/FeedbackSystemInterface';
