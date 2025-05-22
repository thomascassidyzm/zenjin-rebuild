import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';
import { DashboardData } from './DashboardTypes';

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn(() => 'May 22, 2025'),
}));

// Mock framer-motion
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
      p: ({ children, ...props }: React.ComponentProps<'p'>) => <p {...props}>{children}</p>,
      button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
    }
  };
});

// Mock Audio
const mockAudioPlay = jest.fn().mockResolvedValue(undefined);
window.Audio = jest.fn().mockImplementation(() => ({
  play: mockAudioPlay,
}));

// Sample test data for dashboard
const mockDashboardData: DashboardData = {
  username: 'TestUser',
  subscriptionType: 'Premium',
  avatarUrl: '/avatars/test-avatar.png',
  lastSessionDate: '2025-05-21T14:30:00Z',
  streakDays: 5,
  lifetimeMetrics: {
    totalPoints: 15750,
    totalSessions: 42,
    averageBlinkSpeed: 2100,
    evolution: 7.5,
    globalRanking: 1250,
    progressPercentage: 65,
    ftcPoints: 12000,
    ecPoints: 3000,
    basePoints: 750,
    averageBonusMultiplier: 1.5,
  },
  learningPaths: [
    {
      pathId: 'path-1',
      pathName: 'Addition & Subtraction',
      currentLevel: 4,
      maxLevel: 10,
      completedStitches: 25,
      totalStitches: 50,
      progressPercentage: 50,
      active: true,
    },
    {
      pathId: 'path-2',
      pathName: 'Multiplication & Division',
      currentLevel: 2,
      maxLevel: 8,
      completedStitches: 10,
      totalStitches: 40,
      progressPercentage: 25,
      active: false,
    },
  ],
  recentAchievements: [
    {
      id: 'achievement-1',
      name: 'Math Whiz',
      description: 'Complete 100 questions correctly',
      dateEarned: '2025-05-20T10:15:00Z',
      iconUrl: '/icons/math-whiz.svg',
      pointsAwarded: 500,
    },
    {
      id: 'achievement-2',
      name: 'Speed Demon',
      description: 'Answer 10 questions in under 2 seconds each',
      dateEarned: '2025-05-18T09:30:00Z',
      iconUrl: '/icons/speed-demon.svg',
      pointsAwarded: 250,
    },
  ],
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic rendering tests
  test('renders without crashing', () => {
    render(<Dashboard initialData={mockDashboardData} />);
    expect(screen.getByText('TestUser')).toBeInTheDocument();
  });

  test('displays user profile information correctly', () => {
    render(<Dashboard initialData={mockDashboardData} />);
    
    // Check username and subscription type
    expect(screen.getByText('TestUser')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    
    // Check streak days
    expect(screen.getByText('5 day streak')).toBeInTheDocument();
    
    // Check last session date
    expect(screen.getByText(/Last session:/)).toBeInTheDocument();
  });

  test('displays lifetime metrics correctly', () => {
    render(<Dashboard initialData={mockDashboardData} />);
    
    // Check primary metrics
    expect(screen.getByText('15,750')).toBeInTheDocument(); // Total Points
    expect(screen.getByText('7.50')).toBeInTheDocument(); // Evolution
    expect(screen.getByText('#1,250')).toBeInTheDocument(); // Global Ranking
    expect(screen.getByText('65%')).toBeInTheDocument(); // Overall Progress
    
    // Check secondary metrics
    expect(screen.getByText('2100ms')).toBeInTheDocument(); // Blink Speed
    expect(screen.getByText('12,000')).toBeInTheDocument(); // FTC Points
    expect(screen.getByText('3,000')).toBeInTheDocument(); // EC Points
    
    // Check third row metrics
    expect(screen.getByText('750')).toBeInTheDocument(); // Base Points
    expect(screen.getByText('1.50x')).toBeInTheDocument(); // Bonus Multiplier
    expect(screen.getByText('42')).toBeInTheDocument(); // Total Sessions
  });

  test('displays learning paths correctly', () => {
    render(<Dashboard initialData={mockDashboardData} />);
    
    // Check section header
    expect(screen.getByText('Learning Paths')).toBeInTheDocument();
    
    // Check path names
    expect(screen.getByText('Addition & Subtraction')).toBeInTheDocument();
    expect(screen.getByText('Multiplication & Division')).toBeInTheDocument();
    
    // Check active status
    expect(screen.getByText('Active')).toBeInTheDocument();
    
    // Check levels
    expect(screen.getByText('Level 4 of 10')).toBeInTheDocument();
    expect(screen.getByText('Level 2 of 8')).toBeInTheDocument();
    
    // Check progress percentages
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    
    // Check stitches
    expect(screen.getByText('25 stitches completed')).toBeInTheDocument();
    expect(screen.getByText('10 stitches completed')).toBeInTheDocument();
  });

  test('displays achievements correctly', () => {
    render(<Dashboard initialData={mockDashboardData} />);
    
    // Check section header
    expect(screen.getByText('Recent Achievements')).toBeInTheDocument();
    
    // Check achievement names
    expect(screen.getByText('Math Whiz')).toBeInTheDocument();
    expect(screen.getByText('Speed Demon')).toBeInTheDocument();
    
    // Check achievement descriptions
    expect(screen.getByText('Complete 100 questions correctly')).toBeInTheDocument();
    expect(screen.getByText('Answer 10 questions in under 2 seconds each')).toBeInTheDocument();
    
    // Check points awarded
    expect(screen.getByText('+500 points')).toBeInTheDocument();
    expect(screen.getByText('+250 points')).toBeInTheDocument();
  });

  // Interaction tests
  test('calls onPathSelected when path is clicked', () => {
    const handlePathSelected = jest.fn();
    render(
      <Dashboard 
        initialData={mockDashboardData} 
        onPathSelected={handlePathSelected}
      />
    );
    
    // Click on the first learning path
    fireEvent.click(screen.getByText('Addition & Subtraction'));
    
    // Check that the handler was called with the correct pathId
    expect(handlePathSelected).toHaveBeenCalledWith('path-1');
  });

  test('calls onStartSessionClicked when Start button is clicked', () => {
    const handleStartSessionClicked = jest.fn();
    render(
      <Dashboard 
        initialData={mockDashboardData} 
        onStartSessionClicked={handleStartSessionClicked}
      />
    );
    
    // Find all Start buttons
    const startButtons = screen.getAllByText('Start');
    
    // Click on the first Start button
    fireEvent.click(startButtons[0]);
    
    // Check that the handler was called with the correct pathId
    expect(handleStartSessionClicked).toHaveBeenCalledWith('path-1');
  });

  test('calls onAchievementSelected when achievement is clicked', () => {
    const handleAchievementSelected = jest.fn();
    render(
      <Dashboard 
        initialData={mockDashboardData} 
        onAchievementSelected={handleAchievementSelected}
      />
    );
    
    // Click on the first achievement
    fireEvent.click(screen.getByText('Math Whiz'));
    
    // Check that the handler was called with the correct achievementId
    expect(handleAchievementSelected).toHaveBeenCalledWith('achievement-1');
  });

  // Achievement notification test
  test('shows achievement notification', async () => {
    // Get a reference to the Dashboard component instance
    const dashboardRef = React.createRef<any>();
    render(<Dashboard ref={dashboardRef} initialData={mockDashboardData} />);
    
    // Trigger the achievement notification
    act(() => {
      // Access component methods through ref
      dashboardRef.current.showAchievementNotification(
        mockDashboardData.recentAchievements[0],
        { sound: true }
      );
    });
    
    // Check that notification is shown
    await waitFor(() => {
      expect(screen.getByText('Achievement Unlocked!')).toBeInTheDocument();
      expect(screen.getByText('Math Whiz')).toBeInTheDocument();
    });
    
    // Check that sound was played
    expect(mockAudioPlay).toHaveBeenCalled();
  });

  // Metric update test
  test('updates and highlights a metric', async () => {
    const dashboardRef = React.createRef<any>();
    render(<Dashboard ref={dashboardRef} initialData={mockDashboardData} />);
    
    // Verify initial total points
    expect(screen.getByText('15,750')).toBeInTheDocument();
    
    // Update the total points
    act(() => {
      dashboardRef.current.updateMetric('totalPoints', 16000, { highlight: true });
    });
    
    // Check that the metric was updated
    await waitFor(() => {
      expect(screen.getByText('16,000')).toBeInTheDocument();
    });
  });

  // Error handling test
  test('handles invalid metric update gracefully', async () => {
    // Mock console.error to prevent actual logging
    const originalError = console.error;
    console.error = jest.fn();
    
    const dashboardRef = React.createRef<any>();
    render(<Dashboard ref={dashboardRef} initialData={mockDashboardData} />);
    
    // Try to update an invalid metric
    act(() => {
      const result = dashboardRef.current.updateMetric('invalidMetric', 100);
      expect(result).toBe(false); // Should return false for failure
    });
    
    // Check that error was logged
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalError;
  });
});