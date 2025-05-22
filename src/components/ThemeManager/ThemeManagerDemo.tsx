import React, { useState } from 'react';
import { ThemeManagerProvider, useThemeManager, ThemeConfig } from './ThemeManager';

// Example theme configurations
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

const deepOceanTheme: ThemeConfig = {
  colors: {
    primary: '#0EA5E9',    // Sky blue
    secondary: '#06B6D4',  // Cyan
    background: '#0F172A', // Very dark blue
    text: '#F1F5F9',       // Slate light
    accent: '#6366F1',     // Indigo
    success: '#10B981',    // Emerald
    error: '#F43F5E',      // Rose
    neutral: '#64748B'     // Slate
  },
  animation: {
    enabled: true,
    speed: 0.7,
    bubblesDensity: 0.8,
    bubblesSpeed: 0.6
  },
  fontFamily: "'Poppins', sans-serif",
  borderRadius: 12,
  spacing: 4
};

export const BackgroundContainer: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { currentTheme } = useThemeManager();
  
  return (
    <div 
      className="min-h-screen w-full transition-colors duration-300"
      style={{ backgroundColor: currentTheme.colors.background }}
    >
      {children}
    </div>
  );
};

export const ThemeCard: React.FC<{
  title: string;
  children: React.ReactNode;
  accent?: boolean;
}> = ({ title, children, accent = false }) => {
  const { currentTheme } = useThemeManager();
  const { colors, borderRadius } = currentTheme;
  
  return (
    <div 
      className="p-4 backdrop-blur-lg transition-all duration-300"
      style={{
        backgroundColor: `${colors.background}dd`,
        borderRadius: `${borderRadius}px`,
        border: accent 
          ? `1px solid ${colors.accent || colors.primary}33`
          : `1px solid ${colors.primary}33`,
      }}
    >
      <h3 
        className="text-lg font-semibold mb-3 p-2"
        style={{
          backgroundColor: accent 
            ? `${colors.accent || colors.primary}22`
            : `${colors.primary}22`,
          borderRadius: `${borderRadius}px`,
          color: accent 
            ? colors.accent || colors.primary
            : colors.primary
        }}
      >
        {title}
      </h3>
      <div style={{ color: colors.text }}>
        {children}
      </div>
    </div>
  );
};

export const ThemeButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
}> = ({ 
  onClick, 
  children, 
  variant = 'primary',
  size = 'md'
}) => {
  const { currentTheme } = useThemeManager();
  const { colors, borderRadius } = currentTheme;
  
  // Map variant to color
  const getColor = () => {
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.secondary;
      case 'success': return colors.success || '#34D399';
      case 'error': return colors.error || '#EF4444';
      case 'neutral': return colors.neutral || '#6B7280';
      default: return colors.primary;
    }
  };
  
  // Map size to padding
  const getPadding = () => {
    switch (size) {
      case 'sm': return 'px-3 py-1';
      case 'md': return 'px-4 py-2';
      case 'lg': return 'px-6 py-3';
      default: return 'px-4 py-2';
    }
  };
  
  return (
    <button 
      onClick={onClick}
      className={`${getPadding()} rounded transition-all duration-300 transform hover:scale-105`}
      style={{ 
        backgroundColor: getColor(),
        color: colors.text,
        borderRadius: `${borderRadius}px`
      }}
    >
      {children}
    </button>
  );
};

const ThemeControls: React.FC = () => {
  const { themeManager, currentTheme } = useThemeManager();
  const [animationEnabled, setAnimationEnabled] = useState(currentTheme.animation.enabled);
  const [density, setDensity] = useState(currentTheme.animation.bubblesDensity || 0.6);
  const [speed, setSpeed] = useState(currentTheme.animation.bubblesSpeed || 0.8);
  
  // Toggle between themes
  const toggleTheme = () => {
    // Compare with current theme to decide which one to apply
    const isCurrentDarkTheme = currentTheme.colors.background === darkTheme.colors.background;
    themeManager.applyTheme(isCurrentDarkTheme ? deepOceanTheme : darkTheme);
  };
  
  // Toggle animation
  const toggleAnimation = () => {
    if (animationEnabled) {
      themeManager.stopBackgroundAnimation();
    } else {
      themeManager.startBackgroundAnimation({ density, speed });
    }
    setAnimationEnabled(!animationEnabled);
  };
  
  // Apply animation settings
  const applyAnimationSettings = () => {
    themeManager.startBackgroundAnimation({ density, speed });
  };
  
  // Get CSS variables for display
  const cssVariables = themeManager.getCSSVariables();
  
  return (
    <div className="z-10 relative p-8 max-w-3xl mx-auto">
      <div className="bg-opacity-80 bg-gray-900 backdrop-blur-lg rounded-lg p-6 shadow-xl border border-opacity-20 border-gray-700">
        <h1 className="text-2xl font-bold mb-6" style={{ color: currentTheme.colors.text }}>
          Theme Manager Demo
        </h1>
        
        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <h2 className="text-xl font-semibold mb-3" style={{ color: currentTheme.colors.text }}>
              Theme Selection
            </h2>
            <button 
              onClick={toggleTheme}
              className="px-4 py-2 rounded transition-all duration-300 transform hover:scale-105"
              style={{ 
                backgroundColor: currentTheme.colors.primary,
                color: currentTheme.colors.text,
                borderRadius: `${currentTheme.borderRadius}px`
              }}
            >
              Switch Theme
            </button>
          </div>
          
          {/* Animation Controls */}
          <div>
            <h2 className="text-xl font-semibold mb-3" style={{ color: currentTheme.colors.text }}>
              Animation Controls
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <button 
                  onClick={toggleAnimation}
                  className="px-4 py-2 mr-4 rounded transition-all duration-300 transform hover:scale-105"
                  style={{ 
                    backgroundColor: animationEnabled ? currentTheme.colors.error : currentTheme.colors.success,
                    color: currentTheme.colors.text,
                    borderRadius: `${currentTheme.borderRadius}px`
                  }}
                >
                  {animationEnabled ? 'Stop Animation' : 'Start Animation'}
                </button>
                <span style={{ color: currentTheme.colors.text }}>
                  Status: {animationEnabled ? 'Active' : 'Paused'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label 
                    className="block mb-2"
                    style={{ color: currentTheme.colors.text }}
                  >
                    Bubble Density: {density}
                  </label>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="1.0" 
                    step="0.1"
                    value={density}
                    onChange={(e) => setDensity(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label 
                    className="block mb-2"
                    style={{ color: currentTheme.colors.text }}
                  >
                    Bubble Speed: {speed}
                  </label>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="2.0" 
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
              
              <button 
                onClick={applyAnimationSettings}
                className="px-4 py-2 rounded transition-all duration-300 transform hover:scale-105"
                style={{ 
                  backgroundColor: currentTheme.colors.secondary,
                  color: currentTheme.colors.text,
                  borderRadius: `${currentTheme.borderRadius}px`
                }}
              >
                Apply Animation Settings
              </button>
            </div>
          </div>
          
          {/* Theme Properties Demonstration */}
          <div>
            <h2 className="text-xl font-semibold mb-3" style={{ color: currentTheme.colors.text }}>
              Current Theme Properties
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(currentTheme.colors).map(([key, value]) => (
                <div 
                  key={key}
                  className="flex items-center p-2 rounded"
                  style={{ backgroundColor: `${value}33` }} // Adding 33 for low opacity
                >
                  <div 
                    className="w-6 h-6 rounded-full mr-2" 
                    style={{ backgroundColor: value }}
                  ></div>
                  <span style={{ color: currentTheme.colors.text }}>
                    {key}: {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* CSS Variables */}
          <div>
            <h2 className="text-xl font-semibold mb-3" style={{ color: currentTheme.colors.text }}>
              CSS Variables
            </h2>
            <div 
              className="p-4 rounded text-sm overflow-auto max-h-60"
              style={{ 
                backgroundColor: `${currentTheme.colors.background}`, 
                color: currentTheme.colors.text,
                borderRadius: `${currentTheme.borderRadius}px`,
                border: `1px solid ${currentTheme.colors.primary}33`
              }}
            >
              <pre>
                {JSON.stringify(cssVariables, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap the app with the ThemeManagerProvider
const ThemeManagerDemo: React.FC = () => {
  return (
    <ThemeManagerProvider initialTheme={darkTheme}>
      <ThemeControls />
    </ThemeManagerProvider>
  );
};

export default ThemeManagerDemo;
