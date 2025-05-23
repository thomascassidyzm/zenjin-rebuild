// FeedbackSystem.tsx
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

// Import types from generated interfaces
import {
  FeedbackTarget,
  FeedbackOptions,
  FeedbackResult,
  FeedbackSystemInterface,
  FeedbackSystemErrorCode
} from '../../interfaces/FeedbackSystemInterface';

// Error types (using the enum from the generated interface)
export const FEEDBACK_ERRORS = FeedbackSystemErrorCode;

// Default options
const DEFAULT_OPTIONS: FeedbackOptions = {
  duration: 1000,
  intensity: 0.8,
  sound: false,
  haptic: false,
  animation: 'default',
};

// Sound effects (these would be imported from actual audio files)
const SOUND_EFFECTS = {
  correct: '/sounds/correct.mp3',
  incorrect: '/sounds/incorrect.mp3',
  neutral: '/sounds/neutral.mp3',
  timeout: '/sounds/timeout.mp3',
};

// FeedbackSystem Hook that implements the FeedbackSystemInterface
export function useFeedbackSystem(): FeedbackSystemInterface {
  // Ref to track active animations for cancellation
  const activeAnimations = useRef<Map<string, gsap.core.Timeline>>(new Map());
  
  // Media query for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
  
  // Track active feedback states for potential testing/analytics
  const [activeFeedbacks, setActiveFeedbacks] = useState<Record<string, string>>({});

  /**
   * Helper function to validate target element
   * @param target The target element to validate
   * @throws INVALID_TARGET if the target element is invalid or not found
   */
  const validateTarget = (target: FeedbackTarget): HTMLElement => {
    const element = document.getElementById(target.id);
    if (!element) {
      throw new Error(FEEDBACK_ERRORS.INVALID_TARGET);
    }
    return element;
  };

  /**
   * Helper function to play sound effect
   * @param soundType Type of sound to play
   * @param options Feedback options
   */
  const playSound = (soundType: keyof typeof SOUND_EFFECTS, options?: FeedbackOptions) => {
    if (options?.sound) {
      const audio = new Audio(SOUND_EFFECTS[soundType]);
      // Adjust volume based on intensity if provided
      if (options.intensity !== undefined) {
        audio.volume = Math.min(Math.max(options.intensity, 0.1), 1.0);
      }
      audio.play().catch(err => console.warn('Error playing sound:', err));
    }
  };

  /**
   * Helper function to trigger haptic feedback on supported devices
   * @param options Feedback options
   */
  const triggerHaptic = (options?: FeedbackOptions) => {
    if (options?.haptic && 'navigator' in window && 'vibrate' in navigator) {
      // Duration based on intensity (50-200ms)
      const vibrationDuration = options.intensity 
        ? Math.round(50 + options.intensity * 150) 
        : 100;
      
      navigator.vibrate(vibrationDuration);
    }
  };

  /**
   * Helper function to create and setup a GSAP timeline for animations
   * @param target Target element ID
   * @param options Animation options
   * @returns GSAP Timeline
   */
  const createTimeline = (target: string, options?: FeedbackOptions): gsap.core.Timeline => {
    // Cancel any existing animation on this target
    if (activeAnimations.current.has(target)) {
      activeAnimations.current.get(target)?.kill();
    }
    
    // Create new timeline with duration adjusted by options
    const duration = options?.duration || DEFAULT_OPTIONS.duration!;
    const timeline = gsap.timeline({
      onComplete: () => {
        activeAnimations.current.delete(target);
        setActiveFeedbacks(prev => {
          const newState = { ...prev };
          delete newState[target];
          return newState;
        });
      }
    });
    
    // Store for potential cancellation
    activeAnimations.current.set(target, timeline);
    
    return timeline;
  };

  /**
   * Shows positive feedback for correct answers
   * @param target The target element to show feedback on
   * @param options Options for the feedback animation
   * @returns Result of the feedback operation
   * @throws INVALID_TARGET if the target element is invalid or not found
   * @throws FEEDBACK_FAILED if failed to show feedback due to rendering issues
   */
  const showCorrectFeedback = (
    target: FeedbackTarget, 
    options?: FeedbackOptions
  ): FeedbackResult => {
    try {
      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
      const element = validateTarget(target);
      const startTime = Date.now();
      
      // Set active feedback state
      setActiveFeedbacks(prev => ({
        ...prev,
        [target.id]: 'correct'
      }));
      
      // Apply appropriate styles based on target type
      const isCircle = target.type === 'circle';
      const timeline = createTimeline(target.id, mergedOptions);
      
      // Scale intensity based on options
      const intensity = mergedOptions.intensity || 0.8;
      
      // For reduced motion preference, use simpler animations
      if (prefersReducedMotion) {
        timeline.to(element, {
          backgroundColor: isCircle ? 'rgba(72, 187, 120, 0.9)' : undefined,
          boxShadow: `0 0 ${Math.round(15 * intensity)}px ${Math.round(5 * intensity)}px rgba(72, 187, 120, 0.7)`,
          duration: 0.3,
        });
      } else {
        // Create a green glow animation with subtle pulse
        timeline
          .to(element, {
            backgroundColor: isCircle ? 'rgba(72, 187, 120, 0.9)' : undefined,
            boxShadow: `0 0 ${Math.round(15 * intensity)}px ${Math.round(5 * intensity)}px rgba(72, 187, 120, 0.7)`,
            scale: 1 + (0.05 * intensity),
            duration: 0.3,
            ease: "power2.out",
          })
          .to(element, {
            scale: 1,
            duration: 0.5,
            ease: "elastic.out(1, 0.3)",
          })
          .to(element, {
            boxShadow: 'none',
            backgroundColor: isCircle ? '' : undefined,
            duration: 0.5,
            delay: 0.2,
          });
      }
      
      // Play sound and haptic feedback
      playSound('correct', mergedOptions);
      triggerHaptic(mergedOptions);
      
      return {
        success: true,
        target: target.id,
        feedbackType: 'correct',
        duration: mergedOptions.duration || DEFAULT_OPTIONS.duration!,
      };
    } catch (error) {
      if (error instanceof Error && error.message === FEEDBACK_ERRORS.INVALID_TARGET) {
        throw error;
      }
      console.error('Failed to show correct feedback:', error);
      throw new Error(FEEDBACK_ERRORS.FEEDBACK_FAILED);
    }
  };

  /**
   * Shows negative feedback for incorrect answers
   * @param target The target element to show feedback on
   * @param options Options for the feedback animation
   * @returns Result of the feedback operation
   * @throws INVALID_TARGET if the target element is invalid or not found
   * @throws FEEDBACK_FAILED if failed to show feedback due to rendering issues
   */
  const showIncorrectFeedback = (
    target: FeedbackTarget, 
    options?: FeedbackOptions
  ): FeedbackResult => {
    try {
      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
      const element = validateTarget(target);
      const startTime = Date.now();
      
      // Set active feedback state
      setActiveFeedbacks(prev => ({
        ...prev,
        [target.id]: 'incorrect'
      }));
      
      // Scale intensity based on options
      const intensity = mergedOptions.intensity || 0.8;
      
      // Apply appropriate styles based on target type
      const isCircle = target.type === 'circle';
      const isCard = target.type === 'card';
      const timeline = createTimeline(target.id, mergedOptions);
      
      // For reduced motion preference, use simpler animations
      if (prefersReducedMotion) {
        timeline.to(element, {
          backgroundColor: isCircle ? 'rgba(245, 101, 101, 0.9)' : undefined,
          boxShadow: `0 0 ${Math.round(15 * intensity)}px ${Math.round(5 * intensity)}px rgba(245, 101, 101, 0.7)`,
          duration: 0.5,
        });
      } else {
        // Create a red glow animation with shake
        timeline
          .to(element, {
            backgroundColor: isCircle ? 'rgba(245, 101, 101, 0.9)' : undefined,
            boxShadow: `0 0 ${Math.round(15 * intensity)}px ${Math.round(5 * intensity)}px rgba(245, 101, 101, 0.7)`,
            duration: 0.3,
            ease: "power2.out",
          });
        
        // Add shake animation if requested or for cards by default
        if (mergedOptions.animation === 'shake' || isCard) {
          const shakeIntensity = 5 * intensity;
          
          // Create a shake effect
          timeline.to(element, {
            x: `-=${shakeIntensity}px`,
            duration: 0.1,
            repeat: 3,
            yoyo: true,
            ease: "power1.inOut"
          }, "<");
        }
        
        // Finish animation
        timeline
          .to(element, {
            boxShadow: 'none',
            backgroundColor: isCircle ? '' : undefined,
            x: 0, // Reset any shake
            duration: 0.5,
            delay: 0.2,
          });
      }
      
      // Play sound and haptic feedback
      playSound('incorrect', mergedOptions);
      triggerHaptic(mergedOptions);
      
      return {
        success: true,
        target: target.id,
        feedbackType: 'incorrect',
        duration: mergedOptions.duration || DEFAULT_OPTIONS.duration!,
      };
    } catch (error) {
      if (error instanceof Error && error.message === FEEDBACK_ERRORS.INVALID_TARGET) {
        throw error;
      }
      console.error('Failed to show incorrect feedback:', error);
      throw new Error(FEEDBACK_ERRORS.FEEDBACK_FAILED);
    }
  };

  /**
   * Shows neutral feedback for no-answer scenarios
   * @param target The target element to show feedback on
   * @param options Options for the feedback animation
   * @returns Result of the feedback operation
   * @throws INVALID_TARGET if the target element is invalid or not found
   * @throws FEEDBACK_FAILED if failed to show feedback due to rendering issues
   */
  const showNeutralFeedback = (
    target: FeedbackTarget, 
    options?: FeedbackOptions
  ): FeedbackResult => {
    try {
      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
      const element = validateTarget(target);
      const startTime = Date.now();
      
      // Set active feedback state
      setActiveFeedbacks(prev => ({
        ...prev,
        [target.id]: 'neutral'
      }));
      
      // Apply appropriate styles based on target type
      const isCircle = target.type === 'circle';
      const timeline = createTimeline(target.id, mergedOptions);
      
      // Scale intensity based on options
      const intensity = mergedOptions.intensity || 0.8;
      
      // For reduced motion preference, use simpler animations
      if (prefersReducedMotion) {
        timeline.to(element, {
          backgroundColor: isCircle ? 'rgba(90, 139, 214, 0.9)' : undefined,
          boxShadow: `0 0 ${Math.round(10 * intensity)}px ${Math.round(3 * intensity)}px rgba(90, 139, 214, 0.5)`,
          duration: 0.5,
        });
      } else {
        // Create a blue/neutral glow animation with subtle fade
        timeline
          .to(element, {
            backgroundColor: isCircle ? 'rgba(90, 139, 214, 0.9)' : undefined,
            boxShadow: `0 0 ${Math.round(10 * intensity)}px ${Math.round(3 * intensity)}px rgba(90, 139, 214, 0.5)`,
            duration: 0.5,
            ease: "power1.inOut",
          })
          .to(element, {
            boxShadow: 'none',
            backgroundColor: isCircle ? '' : undefined,
            duration: 0.5,
            delay: 0.3,
          });
      }
      
      // Play sound and haptic feedback
      playSound('neutral', mergedOptions);
      triggerHaptic(mergedOptions);
      
      return {
        success: true,
        target: target.id,
        feedbackType: 'neutral',
        duration: mergedOptions.duration || DEFAULT_OPTIONS.duration!,
      };
    } catch (error) {
      if (error instanceof Error && error.message === FEEDBACK_ERRORS.INVALID_TARGET) {
        throw error;
      }
      console.error('Failed to show neutral feedback:', error);
      throw new Error(FEEDBACK_ERRORS.FEEDBACK_FAILED);
    }
  };

  /**
   * Shows timeout feedback when user doesn't respond within the allocated time
   * @param target The target element to show feedback on
   * @param options Options for the feedback animation
   * @returns Result of the feedback operation
   * @throws INVALID_TARGET if the target element is invalid or not found
   * @throws FEEDBACK_FAILED if failed to show feedback due to rendering issues
   */
  const showTimeoutFeedback = (
    target: FeedbackTarget, 
    options?: FeedbackOptions
  ): FeedbackResult => {
    try {
      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
      const element = validateTarget(target);
      const startTime = Date.now();
      
      // Set active feedback state
      setActiveFeedbacks(prev => ({
        ...prev,
        [target.id]: 'timeout'
      }));
      
      // Apply appropriate styles based on target type
      const isCircle = target.type === 'circle';
      const timeline = createTimeline(target.id, mergedOptions);
      
      // Scale intensity based on options
      const intensity = mergedOptions.intensity || 0.8;
      
      // For reduced motion preference, use simpler animations
      if (prefersReducedMotion) {
        timeline.to(element, {
          backgroundColor: isCircle ? 'rgba(66, 153, 225, 0.9)' : undefined,
          boxShadow: `0 0 ${Math.round(12 * intensity)}px ${Math.round(4 * intensity)}px rgba(66, 153, 225, 0.6)`,
          duration: 0.5,
        });
      } else {
        // Create a pulsing blue glow animation for attention
        timeline
          .to(element, {
            backgroundColor: isCircle ? 'rgba(66, 153, 225, 0.9)' : undefined,
            boxShadow: `0 0 ${Math.round(12 * intensity)}px ${Math.round(4 * intensity)}px rgba(66, 153, 225, 0.6)`,
            duration: 0.5,
            ease: "power1.inOut",
          })
          .to(element, {
            boxShadow: `0 0 ${Math.round(20 * intensity)}px ${Math.round(8 * intensity)}px rgba(66, 153, 225, 0.8)`,
            duration: 0.8,
            repeat: 1,
            yoyo: true,
            ease: "power1.inOut",
          })
          .to(element, {
            boxShadow: 'none',
            backgroundColor: isCircle ? '' : undefined,
            duration: 0.5,
          });
      }
      
      // Play sound and haptic feedback
      playSound('timeout', mergedOptions);
      triggerHaptic(mergedOptions);
      
      return {
        success: true,
        target: target.id,
        feedbackType: 'timeout',
        duration: mergedOptions.duration || DEFAULT_OPTIONS.duration!,
      };
    } catch (error) {
      if (error instanceof Error && error.message === FEEDBACK_ERRORS.INVALID_TARGET) {
        throw error;
      }
      console.error('Failed to show timeout feedback:', error);
      throw new Error(FEEDBACK_ERRORS.FEEDBACK_FAILED);
    }
  };

  /**
   * Shows custom feedback with specified type
   * @param target The target element to show feedback on
   * @param feedbackType Type of feedback to show ('correct', 'incorrect', 'neutral', 'timeout')
   * @param options Options for the feedback animation
   * @returns Result of the feedback operation
   * @throws INVALID_TARGET if the target element is invalid or not found
   * @throws INVALID_FEEDBACK_TYPE if the feedback type is not supported
   * @throws FEEDBACK_FAILED if failed to show feedback due to rendering issues
   */
  const showCustomFeedback = (
    target: FeedbackTarget,
    feedbackType: string,
    options?: FeedbackOptions
  ): FeedbackResult => {
    // Map feedback type to appropriate function
    switch (feedbackType) {
      case 'correct':
        return showCorrectFeedback(target, options);
      case 'incorrect':
        return showIncorrectFeedback(target, options);
      case 'neutral':
        return showNeutralFeedback(target, options);
      case 'timeout':
        return showTimeoutFeedback(target, options);
      default:
        throw new Error(FEEDBACK_ERRORS.INVALID_FEEDBACK_TYPE);
    }
  };

  /**
   * Cancels any active feedback on the target element
   * @param target The target element to cancel feedback on
   * @throws INVALID_TARGET if the target element is invalid or not found
   * @throws NO_ACTIVE_FEEDBACK if there is no active feedback to cancel
   */
  const cancelFeedback = (target: FeedbackTarget): void => {
    try {
      // Validate target exists
      validateTarget(target);
      
      // Check if there's an active animation
      if (!activeAnimations.current.has(target.id)) {
        throw new Error(FEEDBACK_ERRORS.NO_ACTIVE_FEEDBACK);
      }
      
      // Kill the animation
      activeAnimations.current.get(target.id)?.kill();
      activeAnimations.current.delete(target.id);
      
      // Update state
      setActiveFeedbacks(prev => {
        const newState = { ...prev };
        delete newState[target.id];
        return newState;
      });
    } catch (error) {
      if (error instanceof Error && 
          (error.message === FEEDBACK_ERRORS.INVALID_TARGET || 
           error.message === FEEDBACK_ERRORS.NO_ACTIVE_FEEDBACK)) {
        throw error;
      }
      console.error('Failed to cancel feedback:', error);
    }
  };

  // Return the feedback system interface
  return {
    showCorrectFeedback,
    showIncorrectFeedback,
    showNeutralFeedback,
    showTimeoutFeedback,
    showCustomFeedback,
    cancelFeedback,
    activeFeedbacks,
  };
}

// React Context for the FeedbackSystem
import React, { createContext, useContext } from 'react';

// Create context with undefined default
const FeedbackContext = createContext<ReturnType<typeof useFeedbackSystem> | undefined>(undefined);

// Provider component
export function FeedbackSystemProvider({ children }: { children: React.ReactNode }) {
  const feedbackSystem = useFeedbackSystem();
  
  return (
    <FeedbackContext.Provider value={feedbackSystem}>
      {children}
    </FeedbackContext.Provider>
  );
}

// Hook to use the feedback system
export function useFeedback() {
  const context = useContext(FeedbackContext);
  
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackSystemProvider');
  }
  
  return context;
}

// Export everything needed for the feedback system
export default {
  Provider: FeedbackSystemProvider,
  useFeedback,
  useFeedbackSystem,
};
