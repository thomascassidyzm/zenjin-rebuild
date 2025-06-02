/**
 * ContentGatingEngine
 * Manages content access based on subscription tier
 * 
 * Free Tier: First 10 stitches per tube, then cycles with varied distractors
 * Premium Tier: Full progression + offline caching
 */

import { subscriptionManager } from './SubscriptionManager/SubscriptionManager';
import { userSessionManager } from '../services/UserSessionManager';

export interface ContentGatingResult {
  hasAccess: boolean;
  reason?: 'premium_required' | 'content_locked' | 'offline_unavailable';
  suggestedAction?: 'upgrade' | 'go_online' | 'complete_prerequisites';
  freeAlternative?: {
    stitchId: string;
    description: string;
  };
}

export interface StitchAccessInfo {
  stitchId: string;
  tubeId: string;
  position: number;
  isUnlocked: boolean;
  requiresPremium: boolean;
  isFreeVariant: boolean;
}

export class ContentGatingEngine {
  private readonly FREE_STITCHES_PER_TUBE = 10;
  private stitchAccessCache = new Map<string, StitchAccessInfo>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Check if user can access a specific stitch
   */
  async canAccessStitch(userId: string, stitchId: string, tubeId: string): Promise<ContentGatingResult> {
    try {
      // Get user's subscription status
      const subscription = await subscriptionManager.getUserSubscription(userId);
      const isPremium = subscription.tier === 'premium';
      
      // Get user's current earned logical position (based on skip number progression)
      const earnedLogicalPosition = await this.getUserEarnedLogicalPosition(userId, tubeId);
      
      // Get the logical position this stitch represents
      const stitchLogicalPosition = await this.getStitchLogicalPosition(stitchId, tubeId);
      
      // Check if user has earned access to this logical position through performance
      if (stitchLogicalPosition > earnedLogicalPosition) {
        return {
          hasAccess: false,
          reason: 'content_locked',
          suggestedAction: 'complete_prerequisites',
          freeAlternative: {
            stitchId: await this.getCurrentEarnedStitch(userId, tubeId),
            description: 'Complete current stitch 20/20 three times to unlock next level'
          }
        };
      }
      
      // User has earned this logical position through performance
      // Now check subscription tier limits
      if (!isPremium && stitchLogicalPosition > this.FREE_STITCHES_PER_TUBE) {
        // User's performance has earned them beyond position 10, but they need premium
        const cycleStitchId = await this.getFreeAlternativeStitch(tubeId, stitchLogicalPosition);
        
        return {
          hasAccess: false,
          reason: 'premium_required',
          suggestedAction: 'upgrade',
          freeAlternative: {
            stitchId: cycleStitchId,
            description: 'Continue practicing earlier lessons - distractors will automatically adapt to your performance'
          }
        };
      }
      
      // Either premium user, or free user within position 1-10
      return {
        hasAccess: true
      };
      
    } catch (error) {
      console.error('Content gating check failed:', error);
      return {
        hasAccess: false,
        reason: 'content_locked',
        suggestedAction: 'go_online'
      };
    }
  }

  /**
   * Get the next accessible stitch for a user
   */
  async getNextAccessibleStitch(userId: string, tubeId: string, currentPosition: number): Promise<{
    stitchId: string;
    position: number;
    isPremiumContent: boolean;
    isRepeating: boolean;
  } | null> {
    const subscription = await subscriptionManager.getUserSubscription(userId);
    const isPremium = subscription.tier === 'premium';
    
    if (isPremium) {
      // Premium: get actual next stitch
      return await this.getNextStitchInProgression(tubeId, currentPosition);
    } else {
      // Free: cycle within first 10 stitches (distractors will naturally vary based on performance)
      return await this.getNextFreeStitch(tubeId, currentPosition);
    }
  }

  /**
   * Check if user can download content for offline use
   */
  async canDownloadOfflineContent(userId: string): Promise<ContentGatingResult> {
    const subscription = await subscriptionManager.getUserSubscription(userId);
    const isPremium = subscription.tier === 'premium';
    
    if (isPremium) {
      return {
        hasAccess: true
      };
    }
    
    return {
      hasAccess: false,
      reason: 'premium_required',
      suggestedAction: 'upgrade'
    };
  }

  /**
   * Get list of downloadable content for premium users
   */
  async getDownloadableContent(userId: string, tubeIds: string[]): Promise<{
    stitches: Array<{
      stitchId: string;
      tubeId: string;
      position: number;
      facts: any[];
      estimatedSize: number;
    }>;
    totalSize: number;
  }> {
    const canDownload = await this.canDownloadOfflineContent(userId);
    if (!canDownload.hasAccess) {
      return { stitches: [], totalSize: 0 };
    }

    const downloadableStitches = [];
    let totalSize = 0;

    for (const tubeId of tubeIds) {
      const tubeStitches = await this.getTubeStitches(tubeId);
      for (const stitch of tubeStitches) {
        const facts = await this.getStitchFacts(stitch.stitchId);
        const estimatedSize = this.estimateStitchSize(facts);
        
        downloadableStitches.push({
          stitchId: stitch.stitchId,
          tubeId,
          position: stitch.position,
          facts,
          estimatedSize
        });
        
        totalSize += estimatedSize;
      }
    }

    return { stitches: downloadableStitches, totalSize };
  }

  /**
   * Get user's content access summary
   */
  async getUserContentSummary(userId: string): Promise<{
    subscriptionTier: 'free' | 'premium';
    accessibleStitches: number;
    totalStitches: number;
    downloadableContent: boolean;
    tubeProgress: Array<{
      tubeId: string;
      accessibleCount: number;
      totalCount: number;
      isFullyUnlocked: boolean;
    }>;
  }> {
    const subscription = await subscriptionManager.getUserSubscription(userId);
    const isPremium = subscription.tier === 'premium';
    
    const tubes = await this.getAllTubes();
    const tubeProgress = [];
    let totalAccessible = 0;
    let totalStitches = 0;
    
    for (const tube of tubes) {
      const stitches = await this.getTubeStitches(tube.tubeId);
      const accessibleCount = isPremium ? stitches.length : Math.min(this.FREE_STITCHES_PER_TUBE, stitches.length);
      
      tubeProgress.push({
        tubeId: tube.tubeId,
        accessibleCount,
        totalCount: stitches.length,
        isFullyUnlocked: isPremium || stitches.length <= this.FREE_STITCHES_PER_TUBE
      });
      
      totalAccessible += accessibleCount;
      totalStitches += stitches.length;
    }
    
    return {
      subscriptionTier: subscription.tier,
      accessibleStitches: totalAccessible,
      totalStitches,
      downloadableContent: isPremium,
      tubeProgress
    };
  }

  /**
   * Generate upgrade prompt context
   */
  async getUpgradePromptContext(userId: string, triggeredBy: 'stitch_limit' | 'offline_request' | 'advanced_feature'): Promise<{
    message: string;
    benefits: string[];
    ctaText: string;
    urgency: 'low' | 'medium' | 'high';
  }> {
    const summary = await this.getUserContentSummary(userId);
    const lockedStitches = summary.totalStitches - summary.accessibleStitches;
    
    switch (triggeredBy) {
      case 'stitch_limit':
        return {
          message: `You've completed the free content! ${lockedStitches} more advanced lessons await.`,
          benefits: [
            `Unlock ${lockedStitches} additional learning stitches`,
            'Advanced difficulty progression',
            'Personalized learning paths',
            'Offline learning capability'
          ],
          ctaText: 'Unlock All Content',
          urgency: 'high'
        };
        
      case 'offline_request':
        return {
          message: 'Download lessons for offline learning with Premium!',
          benefits: [
            'Download any lesson for offline use',
            'Learn anywhere, anytime',
            'No internet required',
            'Sync progress when back online'
          ],
          ctaText: 'Enable Offline Learning',
          urgency: 'medium'
        };
        
      case 'advanced_feature':
        return {
          message: 'Advanced features require Premium subscription',
          benefits: [
            'Detailed progress analytics',
            'Custom learning challenges',
            'Export learning data',
            'Priority support'
          ],
          ctaText: 'Upgrade to Premium',
          urgency: 'low'
        };
        
      default:
        return {
          message: 'Unlock your full learning potential!',
          benefits: ['All content', 'Offline learning', 'Advanced features'],
          ctaText: 'Upgrade Now',
          urgency: 'medium'
        };
    }
  }

  // Private helper methods
  private async getStitchPosition(stitchId: string, tubeId: string): Promise<number> {
    // This would query the database for stitch position
    // For now, extract from stitch ID pattern like "t1-0001-0015" = position 15
    const parts = stitchId.split('-');
    if (parts.length >= 3) {
      return parseInt(parts[2], 10) || 1;
    }
    return 1;
  }

  /**
   * Get user's current earned logical position based on skip number progression
   */
  private async getUserEarnedLogicalPosition(userId: string, tubeId: string): Promise<number> {
    try {
      // This would integrate with TripleHelixManager or EngineOrchestrator to get skip number
      const { EngineOrchestrator } = await import('./EngineOrchestrator');
      const orchestrator = new EngineOrchestrator();
      
      // Get user's current skip number for this tube
      const skipNumber = await orchestrator.getUserSkipNumber(userId, tubeId);
      
      // Convert skip number to logical position
      // This would use the actual skip number algorithm from your system
      return this.calculateLogicalPositionFromSkipNumber(skipNumber);
    } catch (error) {
      console.error('Failed to get user earned logical position:', error);
      return 1; // Default to position 1
    }
  }

  /**
   * Get the logical position that a stitch represents
   */
  private async getStitchLogicalPosition(stitchId: string, tubeId: string): Promise<number> {
    // For now, assume stitch ID directly maps to logical position
    // In reality, this would query the stitch database for its logical position
    const parts = stitchId.split('-');
    if (parts.length >= 3) {
      return parseInt(parts[2], 10) || 1;
    }
    return 1;
  }

  /**
   * Get the stitch the user has currently earned access to
   */
  private async getCurrentEarnedStitch(userId: string, tubeId: string): Promise<string> {
    const earnedPosition = await this.getUserEarnedLogicalPosition(userId, tubeId);
    return `${tubeId}-${String(earnedPosition).padStart(4, '0')}`;
  }

  /**
   * Convert skip number to logical position using your system's algorithm
   */
  private calculateLogicalPositionFromSkipNumber(skipNumber: number): number {
    // This would implement your actual skip number → logical position calculation
    // For now, simple mapping (you'd replace with actual algorithm)
    return Math.min(skipNumber + 1, 50); // Cap at 50 for safety
  }

  private async getFreeAlternativeStitch(tubeId: string, requestedPosition: number): Promise<string> {
    // Simple cycling through first 10 stitches - distractors will naturally vary based on user boundary level
    const cyclePosition = ((requestedPosition - 1) % this.FREE_STITCHES_PER_TUBE) + 1;
    return `${tubeId}-${String(cyclePosition).padStart(4, '0')}`;
  }

  private async getNextStitchInProgression(tubeId: string, currentPosition: number) {
    // Premium users get linear progression
    return {
      stitchId: `${tubeId}-${String(currentPosition + 1).padStart(4, '0')}`,
      position: currentPosition + 1,
      isPremiumContent: currentPosition >= this.FREE_STITCHES_PER_TUBE,
      isRepeating: false
    };
  }

  private async getNextFreeStitch(tubeId: string, currentPosition: number) {
    // Free users cycle through first 10 - intelligence comes from adaptive distractors
    const nextCyclePosition = (currentPosition % this.FREE_STITCHES_PER_TUBE) + 1;
    
    return {
      stitchId: `${tubeId}-${String(nextCyclePosition).padStart(4, '0')}`,
      position: nextCyclePosition,
      isPremiumContent: false,
      isRepeating: currentPosition > this.FREE_STITCHES_PER_TUBE
    };
  }

  /**
   * Check if user has mastered a stitch at highest level (L5 distractor 20/20 multiple times)
   * If so, we can add distractor shuffle mode for extra challenge
   */
  async shouldEnableDistractorShuffle(userId: string, stitchId: string): Promise<boolean> {
    try {
      // This would check user's performance history for this stitch
      // Look for multiple sessions at L5 with 20/20 correct answers
      
      // Mock implementation - would check actual performance data
      const { DistinctionManager } = await import('./DistinctionManager/DistinctionManager');
      const distinctionManager = new DistinctionManager();
      
      const boundaryLevel = distinctionManager.getCurrentBoundaryLevel(userId, stitchId);
      const masteryCount = distinctionManager.getMasterySessionCount?.(userId, stitchId, 5) || 0;
      
      // Enable shuffle mode if user has done L5 perfectly multiple times
      return boundaryLevel >= 5 && masteryCount >= 3;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get enhanced stitch with distractor shuffle if user has mastered it
   */
  async getEnhancedStitchIfMastered(userId: string, stitchId: string): Promise<{
    stitchId: string;
    shuffleMode: boolean;
    description?: string;
  }> {
    const shouldShuffle = await this.shouldEnableDistractorShuffle(userId, stitchId);
    
    if (shouldShuffle) {
      return {
        stitchId: `${stitchId}-shuffle`,
        shuffleMode: true,
        description: 'Extra challenge: Randomized distractor patterns!'
      };
    }
    
    return {
      stitchId,
      shuffleMode: false
    };
  }

  private async getTubeStitches(tubeId: string): Promise<Array<{stitchId: string; position: number}>> {
    // This would query the database for all stitches in a tube
    // Mock implementation for now
    const stitches = [];
    for (let i = 1; i <= 50; i++) { // Assume 50 stitches per tube
      stitches.push({
        stitchId: `${tubeId}-${String(i).padStart(4, '0')}`,
        position: i
      });
    }
    return stitches;
  }

  private async getAllTubes(): Promise<Array<{tubeId: string; name: string}>> {
    // Mock tube data
    return [
      { tubeId: 't1', name: 'Basic Addition' },
      { tubeId: 't2', name: 'Subtraction' },
      { tubeId: 't3', name: 'Multiplication' },
      { tubeId: 't4', name: 'Division' }
    ];
  }

  private async getStitchFacts(stitchId: string): Promise<any[]> {
    // This would fetch facts for the stitch from database
    return []; // Mock for now
  }

  private estimateStitchSize(facts: any[]): number {
    // Estimate storage size in KB
    return facts.length * 0.5; // Roughly 0.5KB per fact
  }
}

// Export singleton instance
export const contentGatingEngine = new ContentGatingEngine();