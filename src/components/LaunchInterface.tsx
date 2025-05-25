import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingInterface from './LoadingInterface';
import {
  LaunchInterfaceInterface,
  LaunchPhase,
  UserAuthChoice,
  LaunchInterfaceProps,
  LaunchAnimationState
} from '../interfaces/LaunchInterfaceInterface';
import { LoadingContext } from '../interfaces/LoadingInterfaceInterface';

/**
 * LaunchInterface Component  
 * APML Framework v1.3.3 Compliant
 * 
 * Welcome/authentication choice interface that replaces automatic anonymous user creation
 * Provides user choice between Sign In, Sign Up, or Try Without Signing Up
 */
const LaunchInterface: React.FC<LaunchInterfaceProps> = ({
  onAuthChoiceSelected,
  onInterfaceComplete,
  branding = {
    appName: 'Zenjin Maths',
    appTagline: 'Master mathematics through adaptive learning',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6'
  },
  authOptions = {
    enableSignIn: true,
    enableSignUp: true,
    enableAnonymous: true,
    anonymousLabel: 'Try Without Signing Up',
    signInLabel: 'Sign In',
    signUpLabel: 'Create Account',
    termsText: 'By continuing, you agree to our Terms of Service and Privacy Policy'
  },
  animations = {
    enableAnimations: true,
    transitionDuration: 500,
    logoAnimationDuration: 600,
    buttonStaggerDelay: 100,
    backgroundAnimationEnabled: true
  },
  accessibility = {
    reducedMotion: false,
    highContrast: false,
    screenReaderSupport: true,
    keyboardNavigationEnabled: true
  }
}) => {
  const [phase, setPhase] = useState<LaunchPhase>(LaunchPhase.APPEARING);
  const [userChoice, setUserChoice] = useState<UserAuthChoice | null>(null);
  const [isProcessingChoice, setIsProcessingChoice] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [animationState, setAnimationState] = useState<LaunchAnimationState>({
    logoScale: 0.8,
    welcomeTextOpacity: 0,
    buttonsVisible: false,
    backgroundGradientPosition: 0
  });

  // Initialize launch sequence
  useEffect(() => {
    initializeLaunchSequence();
  }, []);

  // Animate background gradient if enabled
  useEffect(() => {
    if (animations.backgroundAnimationEnabled && !accessibility.reducedMotion) {
      const interval = setInterval(() => {
        setAnimationState(prev => ({
          ...prev,
          backgroundGradientPosition: (prev.backgroundGradientPosition + 1) % 360
        }));
      }, 50);

      return () => clearInterval(interval);
    }
  }, [animations.backgroundAnimationEnabled, accessibility.reducedMotion]);

  const initializeLaunchSequence = async () => {
    // Phase 1: Appearing
    setPhase(LaunchPhase.APPEARING);
    
    if (animations.enableAnimations && !accessibility.reducedMotion) {
      // Animate logo scale
      setTimeout(() => {
        setAnimationState(prev => ({ ...prev, logoScale: 1 }));
      }, 100);

      // Animate welcome text
      setTimeout(() => {
        setAnimationState(prev => ({ ...prev, welcomeTextOpacity: 1 }));
      }, 300);

      // Show buttons
      setTimeout(() => {
        setAnimationState(prev => ({ ...prev, buttonsVisible: true }));
      }, 600);
    } else {
      // Immediate display for reduced motion
      setAnimationState({
        logoScale: 1,
        welcomeTextOpacity: 1,
        buttonsVisible: true,
        backgroundGradientPosition: 0
      });
    }

    // Phase 2: Welcome (ready for user interaction)
    setTimeout(() => {
      setPhase(LaunchPhase.WELCOME);
    }, animations.enableAnimations ? 800 : 100);
  };

  const handleAuthChoice = async (choice: UserAuthChoice) => {
    if (isProcessingChoice) return;

    try {
      setUserChoice(choice);
      setIsProcessingChoice(true);
      setPhase(LaunchPhase.PROCESSING_CHOICE);
      setHasError(false);
      setErrorMessage(null);

      // Call the auth choice handler
      await onAuthChoiceSelected(choice);

      // Transition out
      setPhase(LaunchPhase.TRANSITIONING_OUT);
      
      // Complete after transition
      setTimeout(() => {
        setPhase(LaunchPhase.COMPLETE);
        onInterfaceComplete();
      }, animations.transitionDuration);

    } catch (error) {
      setHasError(true);
      setErrorMessage(error.message || 'An error occurred while processing your choice');
      setIsProcessingChoice(false);
      setPhase(LaunchPhase.WELCOME); // Return to welcome state
    }
  };

  const getAuthChoiceLoadingContext = (choice: UserAuthChoice): LoadingContext => {
    switch (choice) {
      case UserAuthChoice.SIGN_IN:
      case UserAuthChoice.SIGN_UP:
        return LoadingContext.USER_AUTHENTICATION;
      case UserAuthChoice.ANONYMOUS:
        return LoadingContext.SESSION_INITIALIZATION;
      default:
        return LoadingContext.SESSION_INITIALIZATION;
    }
  };

  // Show loading interface during choice processing
  if (phase === LaunchPhase.PROCESSING_CHOICE && userChoice) {
    return (
      <LoadingInterface
        context={getAuthChoiceLoadingContext(userChoice)}
        onLoadingComplete={() => {
          setPhase(LaunchPhase.TRANSITIONING_OUT);
          setTimeout(() => {
            setPhase(LaunchPhase.COMPLETE);
            onInterfaceComplete();
          }, animations.transitionDuration);
        }}
        branding={{
          primaryColor: branding.primaryColor,
          secondaryColor: branding.secondaryColor,
          backgroundStyle: 'gradient'
        }}
        accessibility={accessibility}
      />
    );
  }

  // Hide when complete
  if (phase === LaunchPhase.COMPLETE) {
    return null;
  }

  const backgroundStyle = animations.backgroundAnimationEnabled 
    ? {
        background: `linear-gradient(${animationState.backgroundGradientPosition}deg, #0f172a, #1e293b, #0f172a)`
      }
    : {
        background: 'linear-gradient(135deg, #0f172a, #1e293b, #0f172a)'
      };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden"
        style={backgroundStyle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: animations.transitionDuration / 1000 }}
      >
        <div className="text-center max-w-lg w-full px-6">
          {/* Logo */}
          <motion.div
            className="mb-8"
            initial={{ scale: animations.enableAnimations ? 0.8 : 1 }}
            animate={{ scale: animationState.logoScale }}
            transition={{ 
              duration: animations.logoAnimationDuration / 1000, 
              ease: "easeOut" 
            }}
          >
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`
              }}
            >
              <span className="text-white font-bold text-3xl">Z</span>
            </div>
          </motion.div>

          {/* Welcome Text */}
          <motion.div
            className="mb-8"
            initial={{ opacity: animations.enableAnimations ? 0 : 1, y: animations.enableAnimations ? 20 : 0 }}
            animate={{ 
              opacity: animationState.welcomeTextOpacity, 
              y: 0 
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h1 className="text-white text-3xl font-bold mb-2">
              Welcome to {branding.appName}
            </h1>
            <p className="text-gray-400 text-lg">
              {branding.appTagline}
            </p>
          </motion.div>

          {/* Authentication Options */}
          <AnimatePresence>
            {animationState.buttonsVisible && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {/* Sign In Button */}
                {authOptions.enableSignIn && (
                  <motion.button
                    onClick={() => handleAuthChoice(UserAuthChoice.SIGN_IN)}
                    disabled={isProcessingChoice}
                    className="w-full font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})`,
                      color: 'white'
                    }}
                    whileHover={animations.enableAnimations ? { scale: 1.02 } : {}}
                    whileTap={animations.enableAnimations ? { scale: 0.98 } : {}}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {authOptions.signInLabel}
                  </motion.button>
                )}

                {/* Sign Up Button */}
                {authOptions.enableSignUp && (
                  <motion.button
                    onClick={() => handleAuthChoice(UserAuthChoice.SIGN_UP)}
                    disabled={isProcessingChoice}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 border-2 border-gray-600 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={animations.enableAnimations ? { scale: 1.02 } : {}}
                    whileTap={animations.enableAnimations ? { scale: 0.98 } : {}}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {authOptions.signUpLabel}
                  </motion.button>
                )}

                {/* Divider */}
                {authOptions.enableAnonymous && (authOptions.enableSignIn || authOptions.enableSignUp) && (
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-gray-950 text-gray-400">or</span>
                    </div>
                  </div>
                )}

                {/* Anonymous/Try Without Signup Button */}
                {authOptions.enableAnonymous && (
                  <motion.button
                    onClick={() => handleAuthChoice(UserAuthChoice.ANONYMOUS)}
                    disabled={isProcessingChoice}
                    className="w-full bg-transparent hover:bg-gray-800/50 text-gray-300 hover:text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-gray-600 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={animations.enableAnimations ? { scale: 1.02 } : {}}
                    whileTap={animations.enableAnimations ? { scale: 0.98 } : {}}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {authOptions.anonymousLabel}
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {hasError && errorMessage && (
            <motion.div
              className="mt-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-red-300 text-sm">{errorMessage}</p>
            </motion.div>
          )}

          {/* Terms and Privacy */}
          <motion.p
            className="text-gray-500 text-sm mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: animationState.buttonsVisible ? 1 : 0 }}
            transition={{ delay: 0.5 }}
          >
            {authOptions.termsText}
          </motion.p>
        </div>

        {/* Screen Reader Support */}
        {accessibility.screenReaderSupport && (
          <div className="sr-only" aria-live="polite">
            {phase === LaunchPhase.WELCOME && 'Welcome screen ready. Choose how you would like to continue.'}
            {isProcessingChoice && 'Processing your choice, please wait.'}
            {hasError && errorMessage && `Error: ${errorMessage}`}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default LaunchInterface;