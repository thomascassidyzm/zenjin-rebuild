import { useState, useEffect, useCallback } from 'react';

/**
 * Auth-to-Player Flow State Machine
 * APML v1.4.1 Behavioral Specification Implementation
 * 
 * Manages the behavioral flow from authentication success to active learning
 */

export type AuthToPlayerState = 'AUTH_SUCCESS' | 'PRE_ENGAGEMENT' | 'LOADING_WITH_ANIMATION' | 'ACTIVE_LEARNING';

export interface UserContext {
  userType: 'authenticated' | 'anonymous';
  userId?: string;
  userName?: string;
  email?: string;
}

export interface AuthToPlayerFlowState {
  currentState: AuthToPlayerState;
  userContext: UserContext | null;
  isContentLoading: boolean;
  loadingProgress: number;
  error: string | null;
  firstStitch: any | null;
}

export interface AuthToPlayerFlowActions {
  initializeFlow: (userContext: UserContext) => void;
  onPlayButtonClicked: () => Promise<void>;
  onContentLoaded: (stitch: any) => void;
  onAnimationComplete: () => void;
  resetFlow: () => void;
}

export const useAuthToPlayerFlow = (): [AuthToPlayerFlowState, AuthToPlayerFlowActions] => {
  const [state, setState] = useState<AuthToPlayerFlowState>({
    currentState: 'AUTH_SUCCESS',
    userContext: null,
    isContentLoading: false,
    loadingProgress: 0,
    error: null,
    firstStitch: null
  });

  // State machine transition functions
  const transitionToPreEngagement = useCallback((userContext: UserContext) => {
    console.log('🎯 State Transition: AUTH_SUCCESS → PRE_ENGAGEMENT');
    setState(prev => ({
      ...prev,
      currentState: 'PRE_ENGAGEMENT',
      userContext,
      error: null
    }));

    // Start background loading processes
    startBackgroundLoading(userContext);
  }, []);

  const transitionToLoadingWithAnimation = useCallback(() => {
    console.log('🎯 State Transition: PRE_ENGAGEMENT → LOADING_WITH_ANIMATION');
    setState(prev => ({
      ...prev,
      currentState: 'LOADING_WITH_ANIMATION',
      isContentLoading: true,
      loadingProgress: 0
    }));
  }, []);

  const transitionToActiveLearning = useCallback((stitch: any) => {
    console.log('🎯 State Transition: LOADING_WITH_ANIMATION → ACTIVE_LEARNING');
    setState(prev => ({
      ...prev,
      currentState: 'ACTIVE_LEARNING',
      isContentLoading: false,
      loadingProgress: 100,
      firstStitch: stitch
    }));
  }, []);

  // Background loading simulation
  const startBackgroundLoading = useCallback(async (userContext: UserContext) => {
    console.log('🔄 Starting background loading processes');
    
    // Simulate dashboard data loading
    setTimeout(() => {
      console.log('✅ Dashboard data loaded in background');
    }, 1000);

    // Pre-load first stitch content
    setTimeout(() => {
      console.log('✅ First stitch content prepared');
      setState(prev => ({
        ...prev,
        loadingProgress: 50
      }));
    }, 1500);
  }, []);

  // Content loading simulation
  const loadFirstStitch = useCallback(async (): Promise<any> => {
    console.log('📚 Loading first stitch content...');
    
    // Simulate content loading with progress updates
    return new Promise((resolve) => {
      let progress = 50; // Start from background loading progress
      
      const progressInterval = setInterval(() => {
        progress += 10;
        setState(prev => ({
          ...prev,
          loadingProgress: Math.min(progress, 90)
        }));
        
        if (progress >= 90) {
          clearInterval(progressInterval);
          
          // Simulate first stitch data
          const mockStitch = {
            id: 'first-stitch',
            question: '2 + 3 = ?',
            answers: ['4', '5', '6', '7'],
            correctAnswer: 1,
            learningPath: 'addition'
          };
          
          console.log('✅ First stitch loaded:', mockStitch);
          resolve(mockStitch);
        }
      }, 200);
    });
  }, []);

  // Actions implementation
  const initializeFlow = useCallback((userContext: UserContext) => {
    console.log('🚀 Initializing Auth-to-Player flow for:', userContext);
    
    // Immediate transition to PRE_ENGAGEMENT (as per behavioral spec)
    setTimeout(() => {
      transitionToPreEngagement(userContext);
    }, 50); // Small delay to ensure smooth UI transition
  }, [transitionToPreEngagement]);

  const onPlayButtonClicked = useCallback(async () => {
    console.log('▶️ Play button clicked - starting content loading');
    
    try {
      // Transition to loading state immediately (as per behavioral spec)
      transitionToLoadingWithAnimation();
      
      // Load content while animation plays
      const stitch = await loadFirstStitch();
      
      // Content is loaded, wait for animation to complete
      setState(prev => ({
        ...prev,
        firstStitch: stitch,
        loadingProgress: 100
      }));
      
    } catch (error) {
      console.error('❌ Content loading failed:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load content',
        isContentLoading: false
      }));
    }
  }, [transitionToLoadingWithAnimation, loadFirstStitch]);

  const onContentLoaded = useCallback((stitch: any) => {
    console.log('📚 Content loaded callback:', stitch);
    setState(prev => ({
      ...prev,
      firstStitch: stitch,
      loadingProgress: 100
    }));
  }, []);

  const onAnimationComplete = useCallback(() => {
    console.log('🎬 Animation completed');
    
    // Check if content is ready before transitioning
    if (state.firstStitch && state.loadingProgress >= 100) {
      transitionToActiveLearning(state.firstStitch);
    } else {
      console.log('⏳ Waiting for content to finish loading...');
      // Animation finished but content not ready - wait for content
      const checkContent = setInterval(() => {
        if (state.firstStitch && state.loadingProgress >= 100) {
          clearInterval(checkContent);
          transitionToActiveLearning(state.firstStitch);
        }
      }, 100);
    }
  }, [state.firstStitch, state.loadingProgress, transitionToActiveLearning]);

  const resetFlow = useCallback(() => {
    console.log('🔄 Resetting Auth-to-Player flow');
    setState({
      currentState: 'AUTH_SUCCESS',
      userContext: null,
      isContentLoading: false,
      loadingProgress: 0,
      error: null,
      firstStitch: null
    });
  }, []);

  // Auto-transition when content finishes loading during animation
  useEffect(() => {
    if (state.currentState === 'LOADING_WITH_ANIMATION' && 
        state.firstStitch && 
        state.loadingProgress >= 100) {
      // Content is ready but we might still be in animation
      // The animation component will call onAnimationComplete when ready
      console.log('📚 Content ready during animation, waiting for animation completion...');
    }
  }, [state.currentState, state.firstStitch, state.loadingProgress]);

  const actions: AuthToPlayerFlowActions = {
    initializeFlow,
    onPlayButtonClicked,
    onContentLoaded,
    onAnimationComplete,
    resetFlow
  };

  return [state, actions];
};