// PlayerCard/index.ts
// Export PlayerCard component and related types

import PlayerCard, { PresentationOptions, PlayerCardImpl } from './PlayerCard';
import { PlayerCardInterface } from '../../interfaces/PlayerCardInterface';

// Re-export the interface
export type { PlayerCardInterface };

// Export the component as default
export default PlayerCard;

// Use export type for TypeScript interfaces when isolatedModules is enabled
export type {
  PresentationOptions,
  PlayerCardImpl
};

// Re-export types from the generated interface
export type { 
  Question, 
  Response, 
  FeedbackOptions,
  PlayerCardErrorCode
} from '../../interfaces/PlayerCardInterface';
