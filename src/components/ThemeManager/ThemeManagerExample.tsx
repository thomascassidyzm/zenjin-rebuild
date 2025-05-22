import React, { useState } from 'react';
import { ThemeManagerProvider, useThemeManager, ThemeConfig } from './ThemeManager';

// Define example theme configurations
const lightTheme: ThemeConfig = {
  colors: {
    primary: '#3B82F6',    // Blue
    secondary: '#10B981',  // Green
    background: '#F9FAFB', // Light gray
    text: '#111827',       // Dark gray
    accent: '#8B5CF6',     // Purple
    success: '#34D399',    // Light green
    error: '#EF4444',      // Red
    neutral: '#6B7280'     // Gray
  },
  animation: {
    enabled: true,
    speed: 1.0,
    bubblesDensity: 0.4,
    bubblesSpeed: 0.6
  },
  fontFamily: "'Inter', sans-serif",
  borderRadius: 8,
  spacing: 4
};

const darkTheme: ThemeConfig = {
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
    speed: 1.0,
    bubblesDensity: 0.6,
    bubblesSpeed: 0.8
  },
  fontFamily: "'Inter', sans-serif",
  borderRadius: 8,
  spacing: 4
};

// Component demonstrating use of the theme
const ThemeExample: React.FC = () => {
  const { themeManager, currentTheme } = useThemeManager();
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  // Function to toggle between themes
  const toggleTheme = () => {
    themeManager.applyTheme(isDarkTheme ? lightTheme : darkTheme);
    setIsDarkTheme(!isDarkTheme);
  };

  // Function to toggle animation
  const toggleAnimation = () => {
    if (currentTheme.animation.enabled) {
      themeManager.stopBackgroundAnimation();
    } else {
      themeManager.startBackgroundAnimation();
    }
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-screen">
      <div 
        className="max-w-4xl w-full p-6 rounded-lg shadow-lg" 
        style={{ 
          backgroundColor: `${currentTheme.colors.background}E6`,
          color: currentTheme.colors.text,
          borderRadius: `${currentTheme.borderRadius}px`
        }}
      >
        <h1 className="text-3xl font-bold mb-6" style={{ color: currentTheme.colors.primary }}>
          ThemeManager Example
        </h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3" style={{ color: currentTheme.colors.secondary }}>
            Theme Controls
          </h2>
          
          <div className="flex space-x-4 mb-4">
            <button 
              onClick={toggleTheme}
              className="px-4 py-2 rounded-md transition-all duration-300 hover:opacity-90"
              style={{ 
                backgroundColor: currentTheme.colors.primary,
                color: 'white',
                borderRadius: `${currentTheme.borderRadius}px`
              }}
            >
              Switch to {isDarkTheme ? 'Light' : 'Dark'} Theme
            </button>
            
            <button 
              onClick={toggleAnimation}
              className="px-4 py-2 rounded-md transition-all duration-300 hover:opacity-90"
              style={{ 
                backgroundColor: currentTheme.colors.secondary,
                color: 'white',
                borderRadius: `${currentTheme.borderRadius}px`
              }}
            >
              {currentTheme.animation.enabled ? 'Disable' : 'Enable'} Animation
            </button>
          </div>
          
          <div className="text-sm opacity-75">
            Animation Status: {currentTheme.animation.enabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sample UI Components */}
          <div 
            className="p-4 rounded-lg"
            style={{ 
              backgroundColor: `${currentTheme.colors.primary}22`,
              borderRadius: `${currentTheme.borderRadius}px`
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.primary }}>
              UI Component Example
            </h3>
            
            <div className="space-y-4">
              <div className="p-3 rounded-md" style={{ backgroundColor: `${currentTheme.colors.background}99` }}>
                <p className="font-medium">Normal Text</p>
                <p className="text-sm mt-1 opacity-80">
                  This text is styled using the current theme's text color.
                </p>
              </div>
              
              <div className="p-3 rounded-md" style={{ 
                backgroundColor: `${currentTheme.colors.accent}22`,
                borderLeft: `4px solid ${currentTheme.colors.accent}`
              }}>
                <p className="font-medium" style={{ color: currentTheme.colors.accent }}>
                  Accent Component
                </p>
                <p className="text-sm mt-1">
                  This component uses the theme's accent color.
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 rounded-md transition-all duration-300 hover:opacity-90"
                  style={{ 
                    backgroundColor: currentTheme.colors.success,
                    color: 'white',
                    borderRadius: `${currentTheme.borderRadius}px`
                  }}
                >
                  Success
                </button>
                
                <button
                  className="px-3 py-1 rounded-md transition-all duration-300 hover:opacity-90"
                  style={{ 
                    backgroundColor: currentTheme.colors.error,
                    color: 'white',
                    borderRadius: `${currentTheme.borderRadius}px`
                  }}
                >
                  Error
                </button>
                
                <button
                  className="px-3 py-1 rounded-md transition-all duration-300 hover:opacity-90"
                  style={{ 
                    backgroundColor: currentTheme.colors.neutral,
                    color: 'white',
                    borderRadius: `${currentTheme.borderRadius}px`
                  }}
                >
                  Neutral
                </button>
              </div>
            </div>
          </div>
          
          {/* Theme Properties */}
          <div 
            className="p-4 rounded-lg"
            style={{ 
              backgroundColor: `${currentTheme.colors.secondary}22`,
              borderRadius: `${currentTheme.borderRadius}px`
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: currentTheme.colors.secondary }}>
              Current Theme Properties
            </h3>
            
            <div className="space-y-3 text-sm">
              {/* Colors */}
              <div>
                <p className="font-medium mb-2">Colors:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(currentTheme.colors).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-sm mr-2" 
                        style={{ backgroundColor: value }}
                      />
                      <span>{key}: {value}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Animation */}
              <div>
                <p className="font-medium mb-2">Animation:</p>
                <div className="pl-2">
                  <p>Enabled: {currentTheme.animation.enabled ? 'Yes' : 'No'}</p>
                  <p>Speed: {currentTheme.animation.speed}</p>
                  <p>Bubbles Density: {currentTheme.animation.bubblesDensity}</p>
                  <p>Bubbles Speed: {currentTheme.animation.bubblesSpeed}</p>
                </div>
              </div>
              
              {/* Other Properties */}
              <div>
                <p className="font-medium mb-2">Other Properties:</p>
                <div className="pl-2">
                  <p>Font Family: {currentTheme.fontFamily}</p>
                  <p>Border Radius: {currentTheme.borderRadius}px</p>
                  <p>Spacing: {currentTheme.spacing}px</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm opacity-60">
          This example demonstrates the ThemeManager component's capabilities for theme switching and animation control.
        </div>
      </div>
    </div>
  );
};

// Main component that wraps everything with the ThemeManagerProvider
const ThemeManagerExample: React.FC = () => {
  return (
    <ThemeManagerProvider initialTheme={darkTheme}>
      <ThemeExample />
    </ThemeManagerProvider>
  );
};

export default ThemeManagerExample;