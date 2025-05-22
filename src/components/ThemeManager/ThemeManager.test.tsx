import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeManagerProvider, { useThemeManager, ThemeConfig } from './ThemeManager';

// Mock the bubble animation to avoid testing canvas operations
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useRef: jest.fn(() => ({
      current: {
        getContext: jest.fn(() => ({
          clearRect: jest.fn(),
          beginPath: jest.fn(),
          arc: jest.fn(),
          fill: jest.fn(),
        })),
        width: 1000,
        height: 800,
      },
    })),
  };
});

// Test component to access theme manager
function TestComponent() {
  const { themeManager, currentTheme } = useThemeManager();
  
  const handleApplyLightTheme = () => {
    themeManager.applyTheme({
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        background: '#FFFFFF',
        text: '#111827',
        accent: '#8B5CF6',
        success: '#34D399',
        error: '#EF4444',
        neutral: '#6B7280'
      },
      animation: {
        enabled: true,
        speed: 1.0,
      },
      fontFamily: "'Inter', sans-serif",
      borderRadius: 8,
      spacing: 4
    });
  };

  const handleApplyDarkTheme = () => {
    themeManager.applyTheme({
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        background: '#111827',
        text: '#F3F4F6',
        accent: '#8B5CF6',
        success: '#34D399',
        error: '#EF4444',
        neutral: '#6B7280'
      },
      animation: {
        enabled: true,
        speed: 1.0,
      },
      fontFamily: "'Inter', sans-serif",
      borderRadius: 8,
      spacing: 4
    });
  };

  const handleStartAnimation = () => {
    themeManager.startBackgroundAnimation({ density: 1.0, speed: 1.5 });
  };

  const handleStopAnimation = () => {
    themeManager.stopBackgroundAnimation();
  };

  return (
    <div>
      <div data-testid="theme-background" style={{ backgroundColor: currentTheme.colors.background }}>
        <h1 style={{ color: currentTheme.colors.text }}>Current Theme</h1>
        <p data-testid="theme-mode">
          {currentTheme.colors.background === '#FFFFFF' ? 'Light Mode' : 'Dark Mode'}
        </p>
        <p data-testid="animation-status">
          Animation: {currentTheme.animation.enabled ? 'Enabled' : 'Disabled'}
        </p>
      </div>
      <button onClick={handleApplyLightTheme} data-testid="light-theme-btn">
        Switch to Light Theme
      </button>
      <button onClick={handleApplyDarkTheme} data-testid="dark-theme-btn">
        Switch to Dark Theme
      </button>
      <button onClick={handleStartAnimation} data-testid="start-animation-btn">
        Start Animation
      </button>
      <button onClick={handleStopAnimation} data-testid="stop-animation-btn">
        Stop Animation
      </button>
    </div>
  );
}

describe('ThemeManager', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset document.documentElement.style
    document.documentElement.style.cssText = '';
  });

  test('renders with default theme and provides theme context', () => {
    render(
      <ThemeManagerProvider>
        <TestComponent />
      </ThemeManagerProvider>
    );
    
    // Default theme is dark
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('Dark Mode');
  });

  test('applies light theme correctly', async () => {
    render(
      <ThemeManagerProvider>
        <TestComponent />
      </ThemeManagerProvider>
    );
    
    // Initially dark theme
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('Dark Mode');
    
    // Switch to light theme
    fireEvent.click(screen.getByTestId('light-theme-btn'));
    
    // Verify theme was changed
    await waitFor(() => {
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('Light Mode');
    });
    
    // Check background color was applied
    const backgroundElement = screen.getByTestId('theme-background');
    expect(backgroundElement).toHaveStyle('background-color: #FFFFFF');
  });

  test('applies dark theme correctly', async () => {
    // Start with a custom light theme
    const lightTheme: ThemeConfig = {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        background: '#FFFFFF',
        text: '#111827',
        accent: '#8B5CF6',
      },
      animation: {
        enabled: true,
      },
    };
    
    render(
      <ThemeManagerProvider initialTheme={lightTheme}>
        <TestComponent />
      </ThemeManagerProvider>
    );
    
    // Initially light theme
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('Light Mode');
    
    // Switch to dark theme
    fireEvent.click(screen.getByTestId('dark-theme-btn'));
    
    // Verify theme was changed
    await waitFor(() => {
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('Dark Mode');
    });
    
    // Check background color was applied
    const backgroundElement = screen.getByTestId('theme-background');
    expect(backgroundElement).toHaveStyle('background-color: #111827');
  });

  test('controls animation state correctly', async () => {
    render(
      <ThemeManagerProvider>
        <TestComponent />
      </ThemeManagerProvider>
    );
    
    // Animation is enabled by default
    expect(screen.getByTestId('animation-status')).toHaveTextContent('Animation: Enabled');
    
    // Stop animation
    fireEvent.click(screen.getByTestId('stop-animation-btn'));
    
    // Verify animation was disabled
    await waitFor(() => {
      expect(screen.getByTestId('animation-status')).toHaveTextContent('Animation: Disabled');
    });
    
    // Start animation
    fireEvent.click(screen.getByTestId('start-animation-btn'));
    
    // Verify animation was re-enabled
    await waitFor(() => {
      expect(screen.getByTestId('animation-status')).toHaveTextContent('Animation: Enabled');
    });
  });

  test('applies CSS variables to document root', async () => {
    render(
      <ThemeManagerProvider>
        <TestComponent />
      </ThemeManagerProvider>
    );
    
    // Check that CSS variables are applied to document root
    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#3B82F6');
    expect(document.documentElement.style.getPropertyValue('--color-secondary')).toBe('#10B981');
    expect(document.documentElement.style.getPropertyValue('--color-background')).toBe('#111827');
    expect(document.documentElement.style.getPropertyValue('--color-text')).toBe('#F3F4F6');
    expect(document.documentElement.style.getPropertyValue('--font-family')).toBe("'Inter', sans-serif");
    expect(document.documentElement.style.getPropertyValue('--border-radius')).toBe('8px');
    expect(document.documentElement.style.getPropertyValue('--spacing')).toBe('4px');
  });

  test('getThemeProperty returns correct values', async () => {
    const TestPropertyComponent = () => {
      const { themeManager } = useThemeManager();
      
      const getPrimaryColor = () => {
        const primaryColor = themeManager.getThemeProperty('colors.primary');
        document.getElementById('property-test')!.textContent = primaryColor;
      };
      
      return (
        <div>
          <div id="property-test" data-testid="property-test">No property</div>
          <button onClick={getPrimaryColor} data-testid="get-property-btn">
            Get Primary Color
          </button>
        </div>
      );
    };
    
    render(
      <ThemeManagerProvider>
        <TestPropertyComponent />
      </ThemeManagerProvider>
    );
    
    // Get primary color
    fireEvent.click(screen.getByTestId('get-property-btn'));
    
    // Verify correct property was returned
    await waitFor(() => {
      expect(screen.getByTestId('property-test')).toHaveTextContent('#3B82F6');
    });
  });

  test('throws error when useThemeManager is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();
    
    // Error spy
    const errorSpy = jest.spyOn(console, 'error');
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useThemeManager must be used within a ThemeManagerProvider');
    
    // Restore console.error
    console.error = originalError;
  });
});