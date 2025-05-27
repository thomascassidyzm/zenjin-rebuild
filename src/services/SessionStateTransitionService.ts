/**
 * SessionStateTransitionService.ts
 * APML-compliant service adapter for managing session state transitions
 * Prevents UI flashing during authentication flows
 */

export type TransitionType = 'anonymous_creation' | 'authenticated_signin';

export interface SessionStateTransitionServiceInterface {
  markTransitionInProgress(transitionType: TransitionType): void;
  completeTransition(transitionType: TransitionType, authToPlayerReady: boolean): void;
  isInTransition(): boolean;
  getCurrentTransitionType(): TransitionType | null;
}

class SessionStateTransitionService implements SessionStateTransitionServiceInterface {
  private transitionInProgress: TransitionType | null = null;
  private authToPlayerReady: boolean = false;

  /**
   * Mark that a state transition is in progress
   * APML-compliant implementation with proper state isolation
   */
  markTransitionInProgress(transitionType: TransitionType): void {
    this.transitionInProgress = transitionType;
    this.authToPlayerReady = false;
    console.log(`🔄 Session transition started: ${transitionType}`);
  }

  /**
   * Mark transition as complete and ready for Auth-to-Player flow
   * APML-compliant implementation with validation
   */
  completeTransition(transitionType: TransitionType, authToPlayerReady: boolean): void {
    if (this.transitionInProgress !== transitionType) {
      console.warn(`⚠️ Transition completion mismatch: expected ${this.transitionInProgress}, got ${transitionType}`);
      return;
    }

    this.transitionInProgress = null;
    this.authToPlayerReady = authToPlayerReady;
    console.log(`✅ Session transition completed: ${transitionType} (Auth-to-Player ready: ${authToPlayerReady})`);
  }

  /**
   * Check if any state transition is currently in progress
   * APML-compliant read-only operation
   */
  isInTransition(): boolean {
    return this.transitionInProgress !== null;
  }

  /**
   * Get current transition type if in progress
   * APML-compliant state accessor
   */
  getCurrentTransitionType(): TransitionType | null {
    return this.transitionInProgress;
  }

  /**
   * Reset service state for testing
   * APML-compliant cleanup method
   */
  reset(): void {
    this.transitionInProgress = null;
    this.authToPlayerReady = false;
  }
}

// Export singleton instance following APML service adapter pattern
export const sessionStateTransitionService = new SessionStateTransitionService();