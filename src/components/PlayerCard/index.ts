// PlayerCard/index.ts
// Export PlayerCard component and related types

import PlayerCard, { Question, Response, FeedbackOptions, PresentationOptions, PlayerCardImpl } from './PlayerCard';

export default PlayerCard;

// Use export type for TypeScript interfaces when isolatedModules is enabled
export type {
  Question,
  Response,
  FeedbackOptions,
  PresentationOptions,
  PlayerCardImpl
};
