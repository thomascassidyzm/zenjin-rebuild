import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SessionSummary } from './SessionSummary';

// Mock html2canvas
jest.mock('html2canvas', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve({
    toDataURL: jest.fn(() => 'mock-image-data-url'),
  })),
}));

// Mock canvas-confetti
jest.mock('canvas-confetti', () => jest.fn());

// Mock chart.js
jest.mock('chart.js', () => ({
  Chart: jest.fn(),
  registerables: [],
  register: jest.fn(),
}));

// Mock chart components
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="mock-bar-chart">Bar Chart</div>,
  Line: () => <div data-testid="mock-line-chart">Line Chart</div>,
  Radar: () => <div data-testid="mock-radar-chart">Radar Chart</div>,
  Doughnut: () => <div data-testid="mock-doughnut-chart">Doughnut Chart</div>,
}));

// Mock console methods
const originalConsoleLog = console.log;
console.log = jest.fn();

// Sample test data
const mockSessionData = {
  sessionId: "test-session-123",
  startTime: new Date("2025-05-19T14:00:00Z"),
  endTime: new Date("2025-05-19T14:30:00Z"),
  duration: 1800,
  questionsAnswered: 45,
  correctAnswers: 38,
  incorrectAnswers: 7,
  timeouts: 0,
  averageResponseTime: 2350,
  boundaryLevels: {
    level1: 95,
    level2: 90,
    level3: 85,
    level4: 75,
    level5: 65
  }
};

const mockMetricsData = {
  ftcPoints: 380,
  ecPoints: 420,
  basePoints: 800,
  bonusMultiplier: 1.25,
  blinkSpeed: 2350,
  totalPoints: 1000,
  evolution: 15
};

const mockAchievementData = {
  newAchievements: [
    {
      id: "test-achievement-1",
      name: "Quick Thinker",
      description: "Answer 10 questions in under 3 seconds each",
      icon: "/icons/quick-thinker.svg",
      pointsAwarded: 50
    }
  ],
  progressAchievements: [
    {
      id: "test-achievement-2",
      name: "Math Master",
      description: "Complete all units in a learning path",
      icon: "/icons/math-master.svg",
      progress: 65,
      target: 100
    }
  ]
};

const mockProgressData = {
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

const mockOptions = {
  showMetrics: true,
  showAchievements: true,
  showProgress: true,
  showNextSteps: true,
  animateEntrance: false,
  celebrateAchievements: true
};

// Mock theme manager
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

// Mock feedback system
const mockFeedbackSystem = {
  playCelebrationAnimation: jest.fn(),
  playSound: jest.fn(),
};

describe('SessionSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
  });

  // Basic rendering tests
  test('renders without crashing', () => {
    render(
      <SessionSummary
        sessionData={mockSessionData}
        metricsData={mockMetricsData}
        achievementData={mockAchievementData}
        progressData={mockProgressData}
      />
    );
    
    expect(screen.getByText('Session Summary')).toBeInTheDocument();
  });

  test('renders all sections when all options are enabled', () => {
    render(
      <SessionSummary
        sessionData={mockSessionData}
        metricsData={mockMetricsData}
        achievementData={mockAchievementData}
        progressData={mockProgressData}
        options={mockOptions}
      />
    );
    
    // Check for section headers
    expect(screen.getByText('Your Performance')).toBeInTheDocument();
    expect(screen.getByText('Achievements')).toBeInTheDocument();
    expect(screen.getByText('Your Progress')).toBeInTheDocument();
    expect(screen.getByText('Next Steps')).toBeInTheDocument();
    
    // Check for charts
    expect(screen.getByTestId('mock-bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('mock-doughnut-chart')).toBeInTheDocument();
    expect(screen.getByTestId('mock-radar-chart')).toBeInTheDocument();
  });

  test('does not render sections when options are disabled', () => {
    render(
      <SessionSummary
        sessionData={mockSessionData}
        metricsData={mockMetricsData}
        achievementData={mockAchievementData}
        progressData={mockProgressData}
        options={{
          showMetrics: false,
          showAchievements: false,
          showProgress: false,
          showNextSteps: false,
          animateEntrance: false,
          celebrateAchievements: false
        }}
      />
    );
    
    // Check that sections are not rendered
    expect(screen.queryByText('Your Performance')).not.toBeInTheDocument();
    expect(screen.queryByText('Achievements')).not.toBeInTheDocument();
    expect(screen.queryByText('Your Progress')).not.toBeInTheDocument();
    expect(screen.queryByText('Next Steps')).not.toBeInTheDocument();
  });

  // Test key metrics rendering
  test('displays correct session statistics', () => {
    render(
      <SessionSummary
        sessionData={mockSessionData}
        metricsData={mockMetricsData}
        achievementData={mockAchievementData}
        progressData={mockProgressData}
      />
    );
    
    // Check for key metrics
    expect(screen.getByText('Questions: 45')).toBeInTheDocument();
    expect(screen.getByText('Correct: 38')).toBeInTheDocument();
    expect(screen.getByText('Incorrect: 7')).toBeInTheDocument();
    
    // Check for calculated accuracy (38/45 = 84.4%)
    expect(screen.getByText('Accuracy: 84%')).toBeInTheDocument();
  });

  test('displays total points correctly', () => {
    render(
      <SessionSummary
        sessionData={mockSessionData}
        metricsData={mockMetricsData}
        achievementData={mockAchievementData}
        progressData={mockProgressData}
      />
    );
    
    // The total points should be displayed
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('Total Points')).toBeInTheDocument();
  });

  // Test achievements display
  test('renders achievement cards correctly', () => {
    render(
      <SessionSummary
        sessionData={mockSessionData}
        metricsData={mockMetricsData}
        achievementData={mockAchievementData}
        progressData={mockProgressData}
      />
    );
    
    // Check achievement name and description
    expect(screen.getByText('Quick Thinker')).toBeInTheDocument();
    expect(screen.getByText('Answer 10 questions in under 3 seconds each')).toBeInTheDocument();
    
    // Check points awarded
    expect(screen.getByText('+50 points')).toBeInTheDocument();
  });

  test('renders achievement progress correctly', () => {
    render(
      <SessionSummary
        sessionData={mockSessionData}
        metricsData={mockMetricsData}
        achievementData={mockAchievementData}
        progressData={mockProgressData}
      />
    );
    
    // Check progress achievement
    expect(screen.getByText('Math Master')).toBeInTheDocument();
    expect(screen.getByText('Complete all units in a learning path')).toBeInTheDocument();
    expect(screen.getByText('65% complete')).toBeInTheDocument();
  });

  // Test learning paths
  test('displays learning path progress correctly', () => {
    render(
      <SessionSummary
        sessionData={mockSessionData}
        metricsData={mockMetricsData}
        achievementData={mockAchievementData}
        progressData={mockProgressData}
      />
    );
    
    // Check path names
    expect(screen.getByText('Addition & Subtraction')).toBeInTheDocument();
    expect(screen.getByText('Multiplication & Division')).toBeInTheDocument();
    expect(screen.getByText('Fractions & Decimals')).toBeInTheDocument();
    
    // Check overall progress
    expect(screen.getByText('Overall Curriculum Progress')).toBeInTheDocument();
    expect(screen.getByText('47%')).toBeInTheDocument();
  });

  // Test next steps section
  test('displays next session focus areas', () => {
    render(
      <SessionSummary
        sessionData={mockSessionData}
        metricsData={mockMetricsData}
        achievementData={mockAchievementData}
        progressData={mockProgressData}
      />
    );
    
    expect(screen.getByText('Focus Areas for Next Session')).toBeInTheDocument();
    expect(screen.getByText('Multiplication Tables')).toBeInTheDocument();
    expect(screen.getByText('Basic Fractions')).toBeInTheDocument();
  });

  // Test interaction methods
  test('hideSessionSummary method works correctly', async () => {
    render(
      <SessionSummary
        sessionData={mockSessionData}
        metricsData={mockMetricsData}
        achievementData={mockAchievementData}
        progressData={mockProgressData}
      />
    );
    
    const closeButton = screen.getByText('Close Summary');
    fireEvent.click(closeButton);
    
    // Check that the onSummaryHidden event was logged
    expect(console.log).toHaveBeenCalledWith(
      'Event: onSummaryHidden',
      expect.objectContaining({
        summaryId: expect.any(String),
        viewDuration: expect.any(Number),
      })
    );
    
    // Component should be removed from the DOM after animation
    await waitFor(() => {
      expect(screen.queryByText('Session Summary')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  test('celebrateAchievement method works correctly', () => {
    render(
      <SessionSummary
        sessionData={mockSessionData}
        metricsData={mockMetricsData}
        achievementData={mockAchievementData}
        progressData={mockProgressData}
        feedbackSystem={mockFeedbackSystem}
      />
    );
    
    // Find the celebrate button
    const celebrateButton = screen.getByLabelText('Celebrate Quick Thinker achievement');
    fireEvent.click(celebrateButton);
    
    // Check that the onAchievementCelebrated event was logged
    expect(console.log).toHaveBeenCalledWith(
      'Event: onAchievementCelebrated',
      expect.objectContaining({
        summaryId: expect.any(String),
        achievementId: 'test-achievement-1',
        animationType: 'confetti',
      })
    );
    
    // Check that feedback system was called
    expect(mockFeedbackSystem.playCelebrationAnimation).toHaveBeenCalled();
    expect(mockFeedbackSystem.playSound).toHaveBeenCalledWith('achievement');
  });

  test('getSummarySnapshot method works correctly', async () => {
    render(
      <SessionSummary
        sessionData={mockSessionData}
        metricsData={mockMetricsData}
        achievementData={mockAchievementData}
        progressData={mockProgressData}
      />
    );
    
    const shareButton = screen.getByText('Share Summary');
    fireEvent.click(shareButton);
    
    // Wait for the snapshot generation to complete
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(
        'Event: onSnapshotGenerated',
        expect.objectContaining({
          summaryId: expect.any(String),
          format: 'png',
          imageUrl: 'mockImageUrl.png',
        })
      );
    });
  });

  // Test accessibility
  test('has proper accessibility attributes', () => {
    render(
      <SessionSummary
        sessionData={mockSessionData}
        metricsData={mockMetricsData}
        achievementData={mockAchievementData}
        progressData={mockSessionData}
      />
    );
    
    // Check for aria-label on buttons
    const celebrateButton = screen.getByLabelText('Celebrate Quick Thinker achievement');
    expect(celebrateButton).toHaveAttribute('aria-label');
    
    // Check for testid
    expect(screen.getByTestId('session-summary')).toBeInTheDocument();
  });

  // Test dark mode
  test('applies dark mode correctly', () => {
    const darkThemeManager = {
      currentTheme: {
        ...mockThemeManager.currentTheme,
        isDarkMode: true,
      },
    };
    
    render(
      <SessionSummary
        sessionData={mockSessionData}
        metricsData={mockMetricsData}
        achievementData={mockAchievementData}
        progressData={mockProgressData}
        themeManager={darkThemeManager}
      />
    );
    
    // Check for dark mode class
    const summaryElement = screen.getByTestId('session-summary');
    expect(summaryElement).toHaveClass('bg-gray-800');
    expect(summaryElement).toHaveClass('text-white');
  });

  // Test empty data handling
  test('handles empty achievements gracefully', () => {
    render(
      <SessionSummary
        sessionData={mockSessionData}
        metricsData={mockMetricsData}
        achievementData={{ newAchievements: [], progressAchievements: [] }}
        progressData={mockProgressData}
      />
    );
    
    // Achievements section should not be rendered
    expect(screen.queryByText('Unlocked This Session')).not.toBeInTheDocument();
    expect(screen.queryByText('Achievement Progress')).not.toBeInTheDocument();
  });

  test('handles empty next steps gracefully', () => {
    render(
      <SessionSummary
        sessionData={mockSessionData}
        metricsData={mockMetricsData}
        achievementData={mockAchievementData}
        progressData={{ ...mockProgressData, nextSessionFocus: [] }}
      />
    );
    
    // Next steps section should not be rendered
    expect(screen.queryByText('Focus Areas for Next Session')).not.toBeInTheDocument();
  });

  // Test event emission
  test('emits onSummaryDisplayed event on mount', () => {
    render(
      <SessionSummary
        sessionData={mockSessionData}
        metricsData={mockMetricsData}
        achievementData={mockAchievementData}
        progressData={mockProgressData}
        options={{ ...mockOptions, animateEntrance: true }}
      />
    );
    
    // Check that onSummaryDisplayed event was logged
    expect(console.log).toHaveBeenCalledWith(
      'Event: onSummaryDisplayed',
      expect.objectContaining({
        summaryId: expect.any(String),
        sessionId: mockSessionData.sessionId,
        displayTime: expect.any(Date),
      })
    );
  });

  // Test edge cases
  test('handles zero questions answered gracefully', () => {
    const zeroQuestionsData = {
      ...mockSessionData,
      questionsAnswered: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
    };
    
    render(
      <SessionSummary
        sessionData={zeroQuestionsData}
        metricsData={mockMetricsData}
        achievementData={mockAchievementData}
        progressData={mockProgressData}
      />
    );
    
    // Accuracy should be 0%
    expect(screen.getByText('Accuracy: 0%')).toBeInTheDocument();
  });
});
