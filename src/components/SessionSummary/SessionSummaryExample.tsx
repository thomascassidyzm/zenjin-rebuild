import React, { useState } from 'react';
import { SessionSummary } from './SessionSummary';
import './sessionSummary.css';

/**
 * SessionSummaryExample Component
 * 
 * This component demonstrates how to use the SessionSummary component
 * with mock data in various configurations.
 */
const SessionSummaryExample: React.FC = () => {
  // State to toggle between different examples
  const [exampleType, setExampleType] = useState<'basic' | 'minimal' | 'custom'>('basic');
  
  // Mock theme manager (simplified for this example)
  const mockThemeManager = {
    currentTheme: {
      isDarkMode: false,
      colors: {
        primary: '#4F46E5',
        secondary: '#10B981',
        accent: '#F59E0B',
        background: '#F3F4F6',
        surface: '#FFFFFF',
        text: '#1F2937',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
    },
  };
  
  // Mock feedback system (simplified for this example)
  const mockFeedbackSystem = {
    playCelebrationAnimation: (type: string, targetElement: HTMLElement) => {
      // Create confetti effect
      const confettiColors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];
      
      // Simplified confetti implementation for the example
      for (let i = 0; i < 30; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'achievement-sparkle animate';
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.top = `${Math.random() * 100}%`;
        sparkle.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        sparkle.style.animationDelay = `${Math.random() * 0.5}s`;
        
        targetElement.appendChild(sparkle);
        
        // Remove sparkle after animation
        setTimeout(() => {
          sparkle.remove();
        }, 1000);
      }
    },
    playSound: (soundType: string) => {
      // In a real implementation, this would play a sound
      console.log(`Playing sound: ${soundType}`);
    },
  };

  // Mock session data for the basic example
  const basicSessionData = {
    sessionId: "session-123",
    startTime: new Date("2025-05-19T14:00:00Z"),
    endTime: new Date("2025-05-19T14:30:00Z"),
    duration: 1800, // 30 minutes in seconds
    questionsAnswered: 45,
    correctAnswers: 38,
    incorrectAnswers: 7,
    timeouts: 0,
    averageResponseTime: 2350, // milliseconds
    boundaryLevels: {
      level1: 95, // percentage correct
      level2: 90,
      level3: 85,
      level4: 75,
      level5: 65
    }
  };
  
  // Mock metrics data for the basic example
  const basicMetricsData = {
    ftcPoints: 380,
    ecPoints: 420,
    basePoints: 800,
    bonusMultiplier: 1.25,
    blinkSpeed: 2350,
    totalPoints: 1000,
    evolution: 15
  };
  
  // Mock achievement data for the basic example
  const basicAchievementData = {
    newAchievements: [
      {
        id: "achievement-1",
        name: "Quick Thinker",
        description: "Answer 10 questions in under 3 seconds each",
        icon: "/icons/quick-thinker.svg",
        pointsAwarded: 50
      },
      {
        id: "achievement-2",
        name: "Perfect Streak",
        description: "Get 10 correct answers in a row",
        icon: "/icons/perfect-streak.svg",
        pointsAwarded: 100
      }
    ],
    progressAchievements: [
      {
        id: "achievement-3",
        name: "Math Master",
        description: "Complete all units in a learning path",
        icon: "/icons/math-master.svg",
        progress: 65,
        target: 100
      }
    ]
  };
  
  // Mock progress data for the basic example
  const basicProgressData = {
    learningPaths: {
      path1: {
        name: "Addition & Subtraction",
        progress: 75,
        unitsCompleted: 15,
        totalUnits: 20,
        currentUnit: "Two-digit Addition"
      },
      path2: {
        name: "Multiplication & Division",
        progress: 40,
        unitsCompleted: 8,
        totalUnits: 20,
        currentUnit: "Multiplication Tables"
      },
      path3: {
        name: "Fractions & Decimals",
        progress: 25,
        unitsCompleted: 5,
        totalUnits: 20,
        currentUnit: "Basic Fractions"
      }
    },
    overallProgress: 47,
    nextSessionFocus: [
      "Multiplication Tables",
      "Basic Fractions"
    ]
  };
  
  // Mock data for the minimal example
  const minimalSessionData = {
    sessionId: "session-456",
    startTime: new Date("2025-05-19T15:00:00Z"),
    endTime: new Date("2025-05-19T15:15:00Z"),
    duration: 900, // 15 minutes in seconds
    questionsAnswered: 20,
    correctAnswers: 15,
    incorrectAnswers: 5,
    timeouts: 0,
    averageResponseTime: 3000, // milliseconds
    boundaryLevels: {
      level1: 90, // percentage correct
      level2: 80,
      level3: 70,
      level4: 60,
      level5: 50
    }
  };
  
  const minimalMetricsData = {
    ftcPoints: 150,
    ecPoints: 200,
    basePoints: 350,
    bonusMultiplier: 1.0,
    blinkSpeed: 3000,
    totalPoints: 350,
    evolution: 5
  };
  
  const minimalAchievementData = {
    newAchievements: [],
    progressAchievements: []
  };
  
  const minimalProgressData = {
    learningPaths: {
      path1: {
        name: "Addition & Subtraction",
        progress: 30,
        unitsCompleted: 6,
        totalUnits: 20,
        currentUnit: "Single-digit Addition"
      },
      path2: {
        name: "Multiplication & Division",
        progress: 10,
        unitsCompleted: 2,
        totalUnits: 20,
        currentUnit: "Introduction to Multiplication"
      },
      path3: {
        name: "Fractions & Decimals",
        progress: 5,
        unitsCompleted: 1,
        totalUnits: 20,
        currentUnit: "Introduction to Fractions"
      }
    },
    overallProgress: 15,
    nextSessionFocus: [
      "Single-digit Addition"
    ]
  };

  // Mock data for a custom example with exceptional performance
  const customSessionData = {
    sessionId: "session-789",
    startTime: new Date("2025-05-19T16:00:00Z"),
    endTime: new Date("2025-05-19T16:45:00Z"),
    duration: 2700, // 45 minutes in seconds
    questionsAnswered: 100,
    correctAnswers: 98,
    incorrectAnswers: 2,
    timeouts: 0,
    averageResponseTime: 1500, // milliseconds
    boundaryLevels: {
      level1: 100, // percentage correct
      level2: 98,
      level3: 95,
      level4: 92,
      level5: 90
    }
  };
  
  const customMetricsData = {
    ftcPoints: 980,
    ecPoints: 1020,
    basePoints: 2000,
    bonusMultiplier: 1.5,
    blinkSpeed: 1500,
    totalPoints: 3000,
    evolution: 35
  };
  
  const customAchievementData = {
    newAchievements: [
      {
        id: "achievement-4",
        name: "Lightning Calculator",
        description: "Answer 50 questions with an average time under 2 seconds",
        icon: "/icons/lightning.svg",
        pointsAwarded: 200
      },
      {
        id: "achievement-5",
        name: "Super Accurate",
        description: "Achieve 95% accuracy in a session with at least 50 questions",
        icon: "/icons/accuracy.svg",
        pointsAwarded: 150
      },
      {
        id: "achievement-6",
        name: "Marathon Learner",
        description: "Complete a session lasting over 30 minutes",
        icon: "/icons/marathon.svg",
        pointsAwarded: 100
      }
    ],
    progressAchievements: [
      {
        id: "achievement-7",
        name: "Number Ninja",
        description: "Master all boundary levels in a single topic",
        icon: "/icons/ninja.svg",
        progress: 90,
        target: 100
      },
      {
        id: "achievement-8",
        name: "Learning Explorer",
        description: "Try all available learning paths",
        icon: "/icons/explorer.svg",
        progress: 100,
        target: 100
      }
    ]
  };
  
  const customProgressData = {
    learningPaths: {
      path1: {
        name: "Addition & Subtraction",
        progress: 100,
        unitsCompleted: 20,
        totalUnits: 20,
        currentUnit: "Complete!"
      },
      path2: {
        name: "Multiplication & Division",
        progress: 80,
        unitsCompleted: 16,
        totalUnits: 20,
        currentUnit: "Advanced Division"
      },
      path3: {
        name: "Fractions & Decimals",
        progress: 60,
        unitsCompleted: 12,
        totalUnits: 20,
        currentUnit: "Decimal Operations"
      }
    },
    overallProgress: 80,
    nextSessionFocus: [
      "Advanced Division",
      "Decimal Operations"
    ]
  };

  // Options for each example
  const basicOptions = {
    showMetrics: true,
    showAchievements: true,
    showProgress: true,
    showNextSteps: true,
    animateEntrance: true,
    celebrateAchievements: true
  };
  
  const minimalOptions = {
    showMetrics: true,
    showAchievements: false,
    showProgress: true,
    showNextSteps: true,
    animateEntrance: false,
    celebrateAchievements: false
  };
  
  const customOptions = {
    showMetrics: true,
    showAchievements: true,
    showProgress: true,
    showNextSteps: true,
    animateEntrance: true,
    celebrateAchievements: true
  };

  // Function to render the selected example
  const renderSelectedExample = () => {
    switch (exampleType) {
      case 'basic':
        return (
          <SessionSummary
            sessionData={basicSessionData}
            metricsData={basicMetricsData}
            achievementData={basicAchievementData}
            progressData={basicProgressData}
            options={basicOptions}
            themeManager={mockThemeManager}
            feedbackSystem={mockFeedbackSystem}
          />
        );
      case 'minimal':
        return (
          <SessionSummary
            sessionData={minimalSessionData}
            metricsData={minimalMetricsData}
            achievementData={minimalAchievementData}
            progressData={minimalProgressData}
            options={minimalOptions}
            themeManager={mockThemeManager}
            feedbackSystem={mockFeedbackSystem}
          />
        );
      case 'custom':
        return (
          <SessionSummary
            sessionData={customSessionData}
            metricsData={customMetricsData}
            achievementData={customAchievementData}
            progressData={customProgressData}
            options={customOptions}
            themeManager={{
              currentTheme: {
                ...mockThemeManager.currentTheme,
                isDarkMode: true,
                colors: {
                  ...mockThemeManager.currentTheme.colors,
                  primary: '#818CF8',
                  secondary: '#34D399',
                  accent: '#FBBF24',
                  background: '#1F2937',
                  surface: '#374151',
                  text: '#F9FAFB',
                }
              }
            }}
            feedbackSystem={mockFeedbackSystem}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`session-summary-example p-6 ${exampleType === 'custom' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 font-comic">Session Summary Examples</h1>
          <p className="mb-4">
            This page demonstrates the SessionSummary component with different mock data and configuration options.
          </p>
          
          <div className="example-selector flex flex-wrap gap-3 mt-6">
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                exampleType === 'basic' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              onClick={() => setExampleType('basic')}
            >
              Basic Example
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                exampleType === 'minimal' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              onClick={() => setExampleType('minimal')}
            >
              Minimal Example
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                exampleType === 'custom' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              onClick={() => setExampleType('custom')}
            >
              Custom Example (Dark Mode)
            </button>
          </div>
        </div>
        
        <div className="example-description mb-8 p-4 bg-white rounded-lg shadow-sm">
          {exampleType === 'basic' && (
            <div>
              <h2 className="text-xl font-bold mb-2">Basic Example</h2>
              <p>
                This example shows a standard session summary with all features enabled:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Complete metrics visualization</li>
                <li>Achievement display with celebrations</li>
                <li>Learning path progress tracking</li>
                <li>Next steps recommendations</li>
                <li>Entrance animations</li>
              </ul>
            </div>
          )}
          
          {exampleType === 'minimal' && (
            <div>
              <h2 className="text-xl font-bold mb-2">Minimal Example</h2>
              <p>
                This example shows a simplified session summary with fewer features:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Basic metrics only</li>
                <li>No achievements section</li>
                <li>Simplified progress tracking</li>
                <li>No animations</li>
              </ul>
            </div>
          )}
          
          {exampleType === 'custom' && (
            <div>
              <h2 className="text-xl font-bold mb-2">Custom Example (Dark Mode)</h2>
              <p>
                This example shows an exceptional performance summary with dark mode theme:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Exceptional performance metrics</li>
                <li>Multiple achievement unlocks</li>
                <li>Advanced progress across all learning paths</li>
                <li>Dark mode UI</li>
              </ul>
            </div>
          )}
        </div>
        
        {/* Render the selected example */}
        {renderSelectedExample()}
      </div>
    </div>
  );
};

export default SessionSummaryExample;
