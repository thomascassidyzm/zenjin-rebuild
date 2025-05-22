import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import PlayerCard, { Question, Response } from './PlayerCard';

// Mock question for testing
const mockQuestion: Question = {
  id: "mult-7-8-001",
  text: "What is 7 × 8?",
  correctAnswer: "56",
  distractor: "54",
  boundaryLevel: 3,
  factId: "mult-7-8"
};

// Mock the framer-motion library for testing
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
      button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
    }
  };
});

describe('PlayerCard Component', () => {
  beforeEach(() => {
    // Mock timers for setTimeout and similar functions
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders without crashing', () => {
    render(<PlayerCard initialQuestion={mockQuestion} />);
    expect(screen.getByText('What is 7 × 8?')).toBeInTheDocument();
  });

  it('displays the question text correctly', async () => {
    render(<PlayerCard initialQuestion={mockQuestion} />);
    
    // Wait for animations and state updates
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    expect(screen.getByText('What is 7 × 8?')).toBeInTheDocument();
  });

  it('displays both answer options', async () => {
    render(<PlayerCard initialQuestion={mockQuestion} />);
    
    // Wait for animations and state updates
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Both answers should be present (in random order)
    expect(screen.getByText('56')).toBeInTheDocument();
    expect(screen.getByText('54')).toBeInTheDocument();
  });

  it('calls onAnswerSelected with correct data when an answer is clicked', async () => {
    const handleAnswerSelected = jest.fn();
    render(
      <PlayerCard 
        initialQuestion={mockQuestion} 
        onAnswerSelected={handleAnswerSelected} 
      />
    );
    
    // Wait for animations and state updates
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Click on the correct answer
    fireEvent.click(screen.getByText('56'));
    
    // Check if callback was called with correct data
    expect(handleAnswerSelected).toHaveBeenCalledTimes(1);
    
    const response = handleAnswerSelected.mock.calls[0][0];
    expect(response.questionId).toBe(mockQuestion.id);
    expect(response.selectedAnswer).toBe('56');
    expect(response.isCorrect).toBe(true);
    expect(response.responseTime).toBeGreaterThan(0);
    expect(response.isFirstAttempt).toBe(true);
  });

  it('shows correct feedback when correct answer is selected', async () => {
    render(<PlayerCard initialQuestion={mockQuestion} />);
    
    // Wait for animations and state updates
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Click on the correct answer
    fireEvent.click(screen.getByText('56'));
    
    // Check if correct feedback is shown (card should have green glow)
    const card = screen.getByTestId('player-card');
    expect(card.className).toContain('shadow-green-500');
  });

  it('shows incorrect feedback with shake animation when wrong answer is selected', async () => {
    render(<PlayerCard initialQuestion={mockQuestion} />);
    
    // Wait for animations and state updates
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Click on the incorrect answer
    fireEvent.click(screen.getByText('54'));
    
    // Check if incorrect feedback is shown (card should have red glow and shake class)
    const card = screen.getByTestId('player-card');
    expect(card.className).toContain('shadow-red-500');
    expect(card.className).toContain('animate-shake');
  });

  it('handles timeout correctly', async () => {
    const ref = React.createRef<any>();
    render(<PlayerCard ref={ref} initialQuestion={mockQuestion} />);
    
    // Wait for animations and state updates
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Simulate timeout
    act(() => {
      ref.current.handleTimeout(mockQuestion.id);
    });
    
    // Check if timeout feedback is shown (card should have blue glow)
    const card = screen.getByTestId('player-card');
    expect(card.className).toContain('shadow-blue-500');
  });

  it('renders boundary level indicators correctly', async () => {
    render(<PlayerCard initialQuestion={mockQuestion} />);
    
    // Wait for animations and state updates
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // For boundary level 3, there should be 3 purple dots and 2 gray dots
    const dots = document.querySelectorAll('div[aria-hidden="true"]');
    
    // Count purple (filled) dots
    const purpleDots = Array.from(dots).filter(dot => 
      dot.className.includes('bg-purple-500')
    );
    
    // Count gray (empty) dots
    const grayDots = Array.from(dots).filter(dot => 
      dot.className.includes('bg-gray-600')
    );
    
    expect(purpleDots.length).toBe(3);
    expect(grayDots.length).toBe(2);
  });

  it('resets to initial state when reset is called', async () => {
    const ref = React.createRef<any>();
    render(<PlayerCard ref={ref} initialQuestion={mockQuestion} />);
    
    // Wait for animations and state updates
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Initial check
    expect(screen.getByText('What is 7 × 8?')).toBeInTheDocument();
    
    // Reset the card
    act(() => {
      ref.current.reset();
    });
    
    // Card should be hidden/removed
    expect(screen.queryByText('What is 7 × 8?')).not.toBeInTheDocument();
  });

  it('successfully presents a new question', async () => {
    const ref = React.createRef<any>();
    render(<PlayerCard ref={ref} />);
    
    // Initially no question
    expect(screen.queryByText('What is 7 × 8?')).not.toBeInTheDocument();
    
    // Present a question
    act(() => {
      ref.current.presentQuestion(mockQuestion);
    });
    
    // Wait for animations and state updates
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Now question should be shown
    expect(screen.getByText('What is 7 × 8?')).toBeInTheDocument();
  });
});
