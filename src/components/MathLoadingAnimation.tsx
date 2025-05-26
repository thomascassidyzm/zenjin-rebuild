import React, { useEffect, useState } from 'react';

/**
 * Math Symbols Loading Animation Component
 * APML v1.4.1 Interface Specification Implementation
 * 
 * Engaging math symbols animation during content loading phase
 */

interface MathLoadingAnimationProps {
  onAnimationComplete: () => void;
  loadingProgress: number;
  duration?: number; // Animation duration in milliseconds
}

const MathLoadingAnimation: React.FC<MathLoadingAnimationProps> = ({
  onAnimationComplete,
  loadingProgress,
  duration = 3000 // Default 3 seconds as per behavioral spec
}) => {
  const [animationPhase, setAnimationPhase] = useState<'intro' | 'symbols' | 'outro'>('intro');
  const [currentSymbolIndex, setCurrentSymbolIndex] = useState(0);

  const mathSymbols = ['+', '−', '×', '÷', '=', '²', '√', '%'];
  
  const motivationalMessages = [
    'Preparing your learning adventure...',
    'Loading mathematical magic...',
    'Crafting your next challenge...',
    'Initializing smart learning...',
    'Building your progress path...'
  ];

  const [currentMessage, setCurrentMessage] = useState(motivationalMessages[0]);

  useEffect(() => {
    // Animation sequence timing
    const phaseTimings = {
      intro: 500,
      symbols: duration - 1000, // Most of the animation time
      outro: 500
    };

    // Intro phase
    setTimeout(() => {
      setAnimationPhase('symbols');
    }, phaseTimings.intro);

    // Symbol cycling during main phase
    const symbolInterval = setInterval(() => {
      setCurrentSymbolIndex(prev => (prev + 1) % mathSymbols.length);
    }, 400);

    // Message cycling
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => {
        const currentIndex = motivationalMessages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % motivationalMessages.length;
        return motivationalMessages[nextIndex];
      });
    }, 800);

    // Outro phase
    setTimeout(() => {
      clearInterval(symbolInterval);
      clearInterval(messageInterval);
      setAnimationPhase('outro');
      
      // Complete animation after outro
      setTimeout(() => {
        onAnimationComplete();
      }, phaseTimings.outro);
    }, phaseTimings.intro + phaseTimings.symbols);

    // Cleanup
    return () => {
      clearInterval(symbolInterval);
      clearInterval(messageInterval);
    };
  }, [duration, onAnimationComplete]);

  const getAnimationClasses = () => {
    switch (animationPhase) {
      case 'intro':
        return 'opacity-0 scale-50 animate-pulse';
      case 'symbols':
        return 'opacity-100 scale-100';
      case 'outro':
        return 'opacity-0 scale-110 transition-all duration-500';
      default:
        return 'opacity-100 scale-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        
        {/* Main Animation Container */}
        <div className={`transition-all duration-500 ${getAnimationClasses()}`}>
          
          {/* Zenjin Logo */}
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center mx-auto mb-8">
            <span className="text-white font-bold text-4xl">Z</span>
          </div>

          {/* Main Math Symbol Display */}
          <div className="relative mb-8">
            {/* Central Math Symbol */}
            <div className="w-32 h-32 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-full flex items-center justify-center border border-indigo-500/30 mx-auto mb-6">
              <span 
                key={currentSymbolIndex}
                className="text-6xl font-bold text-white animate-bounce"
                style={{ 
                  animationDuration: '0.6s',
                  animationIterationCount: '1'
                }}
              >
                {mathSymbols[currentSymbolIndex]}
              </span>
            </div>

            {/* Floating Background Symbols */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {mathSymbols.map((symbol, index) => (
                <div
                  key={`bg-${symbol}-${index}`}
                  className="absolute text-2xl text-indigo-400/20 animate-float"
                  style={{
                    left: `${(index * 12 + 10) % 80}%`,
                    top: `${(index * 15 + 20) % 60}%`,
                    animationDelay: `${index * 0.2}s`,
                    animationDuration: '3s'
                  }}
                >
                  {symbol}
                </div>
              ))}
            </div>
          </div>

          {/* Loading Message */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white mb-3 min-h-[2.5rem] flex items-center justify-center">
              <span 
                key={currentMessage}
                className="animate-fade-in-up"
              >
                {currentMessage}
              </span>
            </h2>
          </div>

          {/* Progress Indicator */}
          <div className="max-w-md mx-auto">
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${Math.max(loadingProgress, 10)}%` }}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              </div>
            </div>
            
            {/* Progress Text */}
            <p className="text-gray-400 text-sm">
              {loadingProgress < 100 
                ? `Preparing content... ${loadingProgress}%`
                : 'Almost ready...'
              }
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="mt-8 flex justify-center space-x-2">
            {[0, 1, 2].map((dot) => (
              <div
                key={dot}
                className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"
                style={{
                  animationDelay: `${dot * 0.2}s`,
                  animationDuration: '1.5s'
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom CSS for additional animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.1; }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default MathLoadingAnimation;