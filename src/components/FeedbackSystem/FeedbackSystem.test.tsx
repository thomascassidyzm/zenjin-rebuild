// FeedbackSystem.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { 
  FeedbackSystemProvider, 
  useFeedback, 
  FeedbackTarget, 
  FEEDBACK_ERRORS 
} from './FeedbackSystem';
import '@testing-library/jest-dom';

// Mock GSAP to avoid actual animations in tests
jest.mock('gsap', () => ({
  timeline: jest.fn(() => ({
    to: jest.fn().mockReturnThis(),
    kill: jest.fn(),
  })),
}));

// Mock window.matchMedia for reduced motion preference
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false, // Default to not preferring reduced motion
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Audio for sound testing
const mockAudioPlay = jest.fn().mockResolvedValue(undefined);
window.Audio = jest.fn().mockImplementation(() => ({
  play: mockAudioPlay,
  volume: 1,
}));

// Mock navigator.vibrate for haptic feedback testing
Object.defineProperty(navigator, 'vibrate', {
  value: jest.fn(),
});

// Test component to access feedback system
function TestComponent({ id }: { id: string }) {
  const feedback = useFeedback();
  
  return (
    <div>
      <div id={id} data-testid={id}>Target element</div>
      
      <button 
        onClick={() => feedback.showCorrectFeedback({ id })}
        data-testid="correct-btn"
      >
        Show Correct
      </button>
      
      <button 
        onClick={() => feedback.showIncorrectFeedback({ id })}
        data-testid="incorrect-btn"
      >
        Show Incorrect
      </button>
      
      <button 
        onClick={() => feedback.showNeutralFeedback({ id })}
        data-testid="neutral-btn"
      >
        Show Neutral
      </button>
      
      <button 
        onClick={() => feedback.showTimeoutFeedback({ id })}
        data-testid="timeout-btn"
      >
        Show Timeout
      </button>
      
      <button 
        onClick={() => feedback.cancelFeedback({ id })}
        data-testid="cancel-btn"
      >
        Cancel Feedback
      </button>
      
      <button 
        onClick={() => feedback.showCustomFeedback({ id }, 'correct')}
        data-testid="custom-btn"
      >
        Show Custom
      </button>
      
      <button 
        onClick={() => {
          try {
            feedback.showCustomFeedback({ id }, 'invalid-type');
          } catch (error) {
            if (error instanceof Error) {
              document.getElementById(id)!.textContent = error.message;
            }
          }
        }}
        data-testid="invalid-type-btn"
      >
        Show Invalid Type
      </button>
    </div>
  );
}

describe('FeedbackSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders and provides feedback context', () => {
    render(
      <FeedbackSystemProvider>
        <TestComponent id="test-element" />
      </FeedbackSystemProvider>
    );
    
    expect(screen.getByTestId('test-element')).toBeInTheDocument();
    expect(screen.getByTestId('correct-btn')).toBeInTheDocument();
  });
  
  test('shows correct feedback', async () => {
    render(
      <FeedbackSystemProvider>
        <TestComponent id="test-element" />
      </FeedbackSystemProvider>
    );
    
    fireEvent.click(screen.getByTestId('correct-btn'));
    
    // We can't test actual animations, but we can verify no errors are thrown
    await waitFor(() => {
      expect(screen.getByTestId('test-element')).toBeInTheDocument();
    });
  });
  
  test('shows incorrect feedback', async () => {
    render(
      <FeedbackSystemProvider>
        <TestComponent id="test-element" />
      </FeedbackSystemProvider>
    );
    
    fireEvent.click(screen.getByTestId('incorrect-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('test-element')).toBeInTheDocument();
    });
  });
  
  test('shows neutral feedback', async () => {
    render(
      <FeedbackSystemProvider>
        <TestComponent id="test-element" />
      </FeedbackSystemProvider>
    );
    
    fireEvent.click(screen.getByTestId('neutral-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('test-element')).toBeInTheDocument();
    });
  });
  
  test('shows timeout feedback', async () => {
    render(
      <FeedbackSystemProvider>
        <TestComponent id="test-element" />
      </FeedbackSystemProvider>
    );
    
    fireEvent.click(screen.getByTestId('timeout-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('test-element')).toBeInTheDocument();
    });
  });
  
  test('shows custom feedback', async () => {
    render(
      <FeedbackSystemProvider>
        <TestComponent id="test-element" />
      </FeedbackSystemProvider>
    );
    
    fireEvent.click(screen.getByTestId('custom-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('test-element')).toBeInTheDocument();
    });
  });
  
  test('throws error for invalid feedback type', async () => {
    render(
      <FeedbackSystemProvider>
        <TestComponent id="test-element" />
      </FeedbackSystemProvider>
    );
    
    fireEvent.click(screen.getByTestId('invalid-type-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('test-element')).toHaveTextContent(FEEDBACK_ERRORS.INVALID_FEEDBACK_TYPE);
    });
  });
  
  test('cancels feedback', async () => {
    render(
      <FeedbackSystemProvider>
        <TestComponent id="test-element" />
      </FeedbackSystemProvider>
    );
    
    // First show some feedback
    fireEvent.click(screen.getByTestId('correct-btn'));
    
    // Then cancel it
    fireEvent.click(screen.getByTestId('cancel-btn'));
    
    // We can't test actual animations, but we can verify no errors are thrown
    await waitFor(() => {
      expect(screen.getByTestId('test-element')).toBeInTheDocument();
    });
  });
});

// Test with mock inputs from implementation package
describe('FeedbackSystem with specified mock inputs', () => {
  test('handles mock example 1: Show correct feedback', async () => {
    const TestWithMock = () => {
      const feedback = useFeedback();
      
      const handleExample = () => {
        // Create test element
        const div = document.createElement('div');
        div.id = 'answer-circle-1';
        document.body.appendChild(div);
        
        // Example 1: Show correct feedback
        const correctResult = feedback.showCorrectFeedback({
          id: 'answer-circle-1',
          type: 'circle'
        }, {
          duration: 1200,
          intensity: 0.9,
          sound: true
        });
        
        expect(correctResult.success).toBe(true);
        expect(correctResult.target).toBe('answer-circle-1');
        expect(correctResult.feedbackType).toBe('correct');
        expect(correctResult.duration).toBe(1200);
      };
      
      return (
        <button onClick={handleExample} data-testid="run-example">
          Run Example 1
        </button>
      );
    };
    
    render(
      <FeedbackSystemProvider>
        <TestWithMock />
      </FeedbackSystemProvider>
    );
    
    fireEvent.click(screen.getByTestId('run-example'));
    
    // Verify that sound would be played
    expect(mockAudioPlay).toHaveBeenCalled();
  });
});
