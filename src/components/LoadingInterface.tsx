import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LoadingInterfaceInterface,
  LoadingContext,
  LoadingPhase,
  LoadingAnimationType,
  LoadingStep,
  MathSymbolState,
  LoadingInterfaceProps,
  LoadingAnimationState
} from '../interfaces/LoadingInterfaceInterface';

/**
 * LoadingInterface Component
 * APML Framework v1.3.3 Compliant
 * 
 * Reusable loading interface with magical math animations
 * Supports multiple contexts with appropriate visual feedback
 */
const LoadingInterface: React.FC<LoadingInterfaceProps> = ({
  context,
  onLoadingComplete,
  customSteps,
  animationType = LoadingAnimationType.MATH_SYMBOLS,
  estimatedDuration = 2000,
  branding,
  accessibility = {
    reducedMotion: false,
    highContrast: false,
    screenReaderAnnouncements: true,
    focusManagement: true,
    respectPrefersReducedMotion: true
  },
  performance = {
    maxMathSymbols: 20,
    animationFPS: 60,
    enableGPUAcceleration: true,
    pauseOnInactive: true,
    memoryOptimized: true
  }
}) => {
  const [phase, setPhase] = useState<LoadingPhase>(LoadingPhase.APPEARING);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<LoadingStep | null>(null);
  const [mathSymbols, setMathSymbols] = useState<MathSymbolState[]>([]);
  const animationFrameRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Math symbols for animations
  const mathSymbolCharacters = ['π', '∞', '∑', '∆', '√', '∫', '≠', '≈', '±', '×', '÷', '+', '-', '=', '²', '³', '°'];

  // Context-specific configurations
  const contextConfigs = {
    [LoadingContext.INITIAL_APP_LOAD]: {
      steps: [
        { id: 'engines', label: 'Loading learning engines...', estimatedDuration: 800 },
        { id: 'backend', label: 'Connecting to services...', estimatedDuration: 600 },
        { id: 'ready', label: 'Almost ready...', estimatedDuration: 400 }
      ],
      showBranding: true,
      primaryColor: branding?.primaryColor || '#6366f1'
    },
    [LoadingContext.USER_AUTHENTICATION]: {
      steps: [
        { id: 'auth', label: 'Authenticating...', estimatedDuration: 500 },
        { id: 'session', label: 'Creating session...', estimatedDuration: 300 }
      ],
      showBranding: false,
      primaryColor: branding?.primaryColor || '#10b981'
    },
    [LoadingContext.SESSION_INITIALIZATION]: {
      steps: [
        { id: 'user', label: 'Setting up your profile...', estimatedDuration: 400 },
        { id: 'state', label: 'Loading your progress...', estimatedDuration: 600 },
        { id: 'sync', label: 'Syncing data...', estimatedDuration: 300 }
      ],
      showBranding: false,
      primaryColor: branding?.primaryColor || '#8b5cf6'
    },
    [LoadingContext.PLAYER_STATE_LOADING]: {
      steps: [
        { id: 'game', label: 'Preparing your session...', estimatedDuration: 400 },
        { id: 'questions', label: 'Generating questions...', estimatedDuration: 200 }
      ],
      showBranding: false,
      primaryColor: branding?.primaryColor || '#f59e0b'
    }
  };

  const config = contextConfigs[context] || contextConfigs[LoadingContext.INITIAL_APP_LOAD];
  const steps = customSteps || config.steps.map((step, index) => ({
    ...step,
    priority: 'high' as const,
    isCompleted: false,
    hasError: false
  }));

  // Initialize math symbols
  useEffect(() => {
    if (animationType === LoadingAnimationType.MATH_SYMBOLS && !accessibility.reducedMotion) {
      initializeMathSymbols();
    }
  }, [animationType, accessibility.reducedMotion]);

  // Main loading sequence
  useEffect(() => {
    executeLoadingSequence();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [context]);

  const initializeMathSymbols = () => {
    const symbols: MathSymbolState[] = [];
    const maxSymbols = accessibility.reducedMotion ? 5 : performance.maxMathSymbols;
    
    for (let i = 0; i < maxSymbols; i++) {
      symbols.push(createMathSymbol());
    }
    setMathSymbols(symbols);
    animateMathSymbols();
  };

  const createMathSymbol = (): MathSymbolState => {
    const containerWidth = containerRef.current?.clientWidth || 800;
    const containerHeight = containerRef.current?.clientHeight || 600;
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      symbol: mathSymbolCharacters[Math.floor(Math.random() * mathSymbolCharacters.length)],
      x: Math.random() * containerWidth,
      y: Math.random() * containerHeight,
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2
      },
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      opacity: 0.1 + Math.random() * 0.3,
      color: config.primaryColor
    };
  };

  const animateMathSymbols = () => {
    const animate = () => {
      setMathSymbols(prev => prev.map(symbol => {
        const containerWidth = containerRef.current?.clientWidth || 800;
        const containerHeight = containerRef.current?.clientHeight || 600;
        
        let newX = symbol.x + symbol.velocity.x;
        let newY = symbol.y + symbol.velocity.y;
        let newVelocityX = symbol.velocity.x;
        let newVelocityY = symbol.velocity.y;

        // Bounce off edges
        if (newX <= 0 || newX >= containerWidth) {
          newVelocityX = -newVelocityX;
          newX = Math.max(0, Math.min(containerWidth, newX));
        }
        if (newY <= 0 || newY >= containerHeight) {
          newVelocityY = -newVelocityY;
          newY = Math.max(0, Math.min(containerHeight, newY));
        }

        return {
          ...symbol,
          x: newX,
          y: newY,
          velocity: { x: newVelocityX, y: newVelocityY },
          rotation: symbol.rotation + 1
        };
      }));

      if (phase === LoadingPhase.LOADING) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    if (!accessibility.reducedMotion) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  };

  const executeLoadingSequence = async () => {
    setPhase(LoadingPhase.APPEARING);
    
    // Small delay for appear animation
    await new Promise(resolve => setTimeout(resolve, 300));
    setPhase(LoadingPhase.LOADING);

    let totalProgress = 0;
    const progressPerStep = 100 / steps.length;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setCurrentStep(step);

      // Animate progress for this step
      const stepDuration = step.estimatedDuration;
      const progressIncrement = progressPerStep / 60; // Assuming 60fps
      const frameTime = stepDuration / (progressPerStep / progressIncrement);

      for (let progress = 0; progress < progressPerStep; progress += progressIncrement) {
        await new Promise(resolve => setTimeout(resolve, frameTime));
        setProgress(totalProgress + progress);
      }

      totalProgress += progressPerStep;
      setProgress(totalProgress);
      
      // Mark step as completed
      steps[i].isCompleted = true;
    }

    // Complete loading
    setPhase(LoadingPhase.COMPLETING);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setPhase(LoadingPhase.DISAPPEARING);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setPhase(LoadingPhase.COMPLETE);
    onLoadingComplete();
  };

  const getContextTitle = () => {
    switch (context) {
      case LoadingContext.INITIAL_APP_LOAD:
        return 'Zenjin Maths';
      case LoadingContext.USER_AUTHENTICATION:
        return 'Signing you in';
      case LoadingContext.SESSION_INITIALIZATION:
        return 'Setting up your session';
      case LoadingContext.PLAYER_STATE_LOADING:
        return 'Preparing your game';
      default:
        return 'Loading';
    }
  };

  const getContextSubtitle = () => {
    switch (context) {
      case LoadingContext.INITIAL_APP_LOAD:
        return 'Adaptive Learning Platform';
      case LoadingContext.USER_AUTHENTICATION:
        return 'Please wait...';
      case LoadingContext.SESSION_INITIALIZATION:
        return 'Almost ready to learn';
      case LoadingContext.PLAYER_STATE_LOADING:
        return 'Get ready to practice';
      default:
        return 'Please wait...';
    }
  };

  if (phase === LoadingPhase.HIDDEN || phase === LoadingPhase.COMPLETE) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center z-50 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Math Symbols Animation */}
        {animationType === LoadingAnimationType.MATH_SYMBOLS && !accessibility.reducedMotion && (
          <div className="absolute inset-0">
            {mathSymbols.map((symbol) => (
              <motion.div
                key={symbol.id}
                className="absolute text-2xl font-bold pointer-events-none select-none"
                style={{
                  left: symbol.x,
                  top: symbol.y,
                  color: symbol.color,
                  opacity: symbol.opacity,
                  transform: `rotate(${symbol.rotation}deg) scale(${symbol.scale})`
                }}
              >
                {symbol.symbol}
              </motion.div>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="text-center max-w-md w-full px-6 relative z-10">
          {/* Logo/Branding */}
          {config.showBranding && (
            <motion.div
              className="mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl"
                style={{ 
                  background: `linear-gradient(135deg, ${config.primaryColor}, ${branding?.secondaryColor || '#3b82f6'})` 
                }}
              >
                <span className="text-white font-bold text-3xl">Z</span>
              </div>
            </motion.div>
          )}

          {/* Title */}
          <motion.div
            className="mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-white text-2xl font-bold">{getContextTitle()}</h1>
            <p className="text-gray-400 text-sm mt-1">{getContextSubtitle()}</p>
          </motion.div>

          {/* Progress Section */}
          <motion.div
            className="mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* Progress Bar */}
            <div className="w-full bg-gray-800 rounded-full h-2 mb-4 overflow-hidden">
              <motion.div
                className="h-full rounded-full transition-all duration-200"
                style={{ 
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${config.primaryColor}, ${branding?.secondaryColor || '#3b82f6'})`
                }}
              />
            </div>

            {/* Current Step */}
            {currentStep && (
              <motion.p
                className="text-gray-300 text-sm"
                key={currentStep.id}
                initial={{ opacity: 0.6, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep.label}
              </motion.p>
            )}

            {/* Progress Percentage */}
            <p className="text-gray-500 text-xs mt-2">{Math.round(progress)}%</p>
          </motion.div>

          {/* Loading Indicator */}
          {animationType !== LoadingAnimationType.MATH_SYMBOLS && (
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: config.primaryColor }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.4, 1, 0.4]
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Screen Reader Announcements */}
        {accessibility.screenReaderAnnouncements && (
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {currentStep ? `Loading: ${currentStep.label}` : 'Loading application'}
            {` ${Math.round(progress)}% complete`}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingInterface;