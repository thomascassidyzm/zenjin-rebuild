import React from 'react';
import { ThemeManagerProvider, useThemeManager } from './ThemeManager';
import { BackgroundContainer, ThemeCard, ThemeButton } from './ThemeManagerDemo';

// Example of a math problem component styled according to the theme
const MathProblem: React.FC<{
  problem: string;
  options: string[];
  correctAnswer: number;
}> = ({ problem, options, correctAnswer }) => {
  const { currentTheme } = useThemeManager();
  const { colors, borderRadius } = currentTheme;
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [feedback, setFeedback] = React.useState<'correct' | 'incorrect' | null>(null);
  
  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
    setFeedback(index === correctAnswer ? 'correct' : 'incorrect');
  };
  
  return (
    <div 
      className="p-6 backdrop-blur-lg transition-all duration-300"
      style={{
        backgroundColor: `${colors.background}dd`,
        borderRadius: `${borderRadius}px`,
        border: `1px solid ${colors.primary}33`,
      }}
    >
      <div 
        className="text-xl font-bold mb-6 p-4 text-center"
        style={{
          backgroundColor: `${colors.primary}22`,
          borderRadius: `${borderRadius}px`,
          color: colors.text
        }}
      >
        {problem}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {options.map((option, index) => (
          <button
            key={index}
            className="p-4 text-center transition-all duration-300 transform hover:scale-105"
            style={{
              backgroundColor: selectedOption === index
                ? selectedOption === correctAnswer
                  ? `${colors.success}88`
                  : `${colors.error}88`
                : `${colors.secondary}22`,
              borderRadius: `${borderRadius}px`,
              color: colors.text,
              border: selectedOption === index
                ? `2px solid ${selectedOption === correctAnswer ? colors.success : colors.error}`
                : `2px solid transparent`,
            }}
            onClick={() => handleOptionSelect(index)}
            disabled={selectedOption !== null}
          >
            {option}
          </button>
        ))}
      </div>
      
      {feedback && (
        <div 
          className="mt-6 p-4 text-center animate-fadeIn"
          style={{
            backgroundColor: feedback === 'correct' ? `${colors.success}22` : `${colors.error}22`,
            borderRadius: `${borderRadius}px`,
            color: feedback === 'correct' ? colors.success : colors.error,
          }}
        >
          {feedback === 'correct' 
            ? '✓ Correct! Well done!' 
            : '✗ Not quite right. Try another problem.'}
        </div>
      )}
    </div>
  );
};

// Progress indicator that uses theme colors
const ProgressIndicator: React.FC<{
  current: number;
  total: number;
}> = ({ current, total }) => {
  const { currentTheme } = useThemeManager();
  const { colors, borderRadius } = currentTheme;
  const progress = (current / total) * 100;
  
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <span style={{ color: colors.text }}>Progress</span>
        <span style={{ color: colors.text }}>{current}/{total}</span>
      </div>
      <div 
        className="h-2 w-full"
        style={{
          backgroundColor: `${colors.neutral}44`,
          borderRadius: `${borderRadius}px`,
        }}
      >
        <div 
          className="h-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            backgroundColor: colors.primary,
            borderRadius: `${borderRadius}px`,
            backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.accent || colors.secondary})`,
          }}
        ></div>
      </div>
    </div>
  );
};

// Session timer that uses theme colors
const SessionTimer: React.FC = () => {
  const { currentTheme } = useThemeManager();
  const { colors } = currentTheme;
  const [seconds, setSeconds] = React.useState(0);
  
  React.useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div 
      className="text-center p-3 font-mono text-lg"
      style={{ color: colors.text }}
    >
      Session Time: {formatTime(seconds)}
    </div>
  );
};

// Main practice session component
const MathPracticeSession: React.FC = () => {
  const { themeManager, currentTheme } = useThemeManager();
  const [problemIndex, setProblemIndex] = React.useState(0);
  
  // Sample math problems
  const problems = [
    {
      problem: "What is 8 × 7?",
      options: ["54", "56", "63", "49"],
      correctAnswer: 1 // index of "56"
    },
    {
      problem: "Solve: 15 + 27",
      options: ["32", "42", "47", "52"],
      correctAnswer: 1 // index of "42"
    },
    {
      problem: "Calculate 64 ÷ 8",
      options: ["6", "7", "8", "9"],
      correctAnswer: 2 // index of "8"
    }
  ];
  
  const handleNextProblem = () => {
    if (problemIndex < problems.length - 1) {
      setProblemIndex(prev => prev + 1);
    } else {
      // Session complete
      alert("Practice session complete!");
    }
  };
  
  // Toggle between different animation settings
  const toggleCalm = () => {
    themeManager.startBackgroundAnimation({ density: 0.3, speed: 0.5 });
  };
  
  const toggleFocus = () => {
    themeManager.startBackgroundAnimation({ density: 0.6, speed: 0.8 });
  };
  
  return (
    <BackgroundContainer>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <header className="text-center mb-8">
          <h1 
            className="text-3xl font-bold mb-2 bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, ${currentTheme.colors.primary}, ${currentTheme.colors.accent || currentTheme.colors.secondary})`,
            }}
          >
            Zenjin Maths Practice
          </h1>
          <p className="opacity-80" style={{ color: currentTheme.colors.text }}>
            A calming, anxiety-free learning experience
          </p>
          
          <div className="mt-4 flex justify-center gap-3">
            <ThemeButton onClick={toggleCalm} variant="secondary" size="sm">
              Calm Mode
            </ThemeButton>
            <ThemeButton onClick={toggleFocus} variant="primary" size="sm">
              Focus Mode
            </ThemeButton>
          </div>
        </header>
        
        <ProgressIndicator current={problemIndex + 1} total={problems.length} />
        
        <MathProblem 
          problem={problems[problemIndex].problem}
          options={problems[problemIndex].options}
          correctAnswer={problems[problemIndex].correctAnswer}
        />
        
        <div className="mt-6 flex justify-between items-center">
          <SessionTimer />
          
          <ThemeButton 
            onClick={handleNextProblem} 
            variant="success"
          >
            Next Problem
          </ThemeButton>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <ThemeCard title="Learning Tips" accent={true}>
            <ul className="space-y-2">
              <li>Take deep breaths if you feel anxious</li>
              <li>Remember that mistakes are part of learning</li>
              <li>Focus on understanding, not just getting the right answer</li>
              <li>Try to visualize the problem</li>
            </ul>
          </ThemeCard>
          
          <ThemeCard title="Your Progress">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Problems solved today:</span>
                <span className="font-bold">12</span>
              </div>
              <div className="flex justify-between">
                <span>Current streak:</span>
                <span className="font-bold">3 days</span>
              </div>
              <div className="flex justify-between">
                <span>Accuracy:</span>
                <span className="font-bold">87%</span>
              </div>
            </div>
          </ThemeCard>
        </div>
      </div>
    </BackgroundContainer>
  );
};

// Main app with ThemeManagerProvider
const ZenjinMathsApp: React.FC = () => {
  // Initial theme configuration
  const initialTheme = {
    colors: {
      primary: '#3B82F6',    // Blue
      secondary: '#10B981',  // Green
      background: '#111827', // Dark blue/gray
      text: '#F3F4F6',       // Light gray
      accent: '#8B5CF6',     // Purple
      success: '#34D399',    // Light green
      error: '#EF4444',      // Red
      neutral: '#6B7280'     // Gray
    },
    animation: {
      enabled: true,
      speed: 0.8,
      bubblesDensity: 0.6,
      bubblesSpeed: 0.8
    },
    fontFamily: "'Inter', sans-serif",
    borderRadius: 8,
    spacing: 4
  };
  
  return (
    <ThemeManagerProvider initialTheme={initialTheme}>
      <MathPracticeSession />
    </ThemeManagerProvider>
  );
};

export default ZenjinMathsApp;
