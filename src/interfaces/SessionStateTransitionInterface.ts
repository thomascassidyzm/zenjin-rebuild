/**
 * SessionStateTransitionInterface.ts
 * Generated from APML Interface Definition
 * Module: Authentication
 */

import { UserSessionManager } from './UserSessionManager';
import { AuthToPlayerEventBus } from './AuthToPlayerEventBus';

/**
 * Define interface contracts for managing session state transitions to prevent UI flashing
 * between authentication completion and Auth-to-Player flow initialization.
 */
/**
 * Type of authentication transition
 */
export interface TransitionType {
}

export interface TransitionState {
  /** State name */
  name: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  transitionType: string;
}

export interface StateTransitionSequence {
  transitionType: TransitionType;
  description: string;
  /** Ordered sequence of states */
  states: TransitionState[];
  transitionGuarantee: string;
}

// Export default interface
export default SessionStateTransitionInterface;
