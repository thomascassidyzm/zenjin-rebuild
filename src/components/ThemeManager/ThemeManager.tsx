import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

// Define TypeScript interfaces based on the requirements
export interface ThemeColors {
  primary: string;       // Primary color (hex code)
  secondary: string;     // Secondary color (hex code)
  background: string;    // Background color (hex code)
  text: string;          // Text color (hex code)
  accent?: string;       // Accent color (hex code)
  success?: string;      // Success color (hex code)
  error?: string;        // Error color (hex code)
  neutral?: string;      // Neutral color (hex code)
}

export interface ThemeAnimation {
  enabled: boolean;      // Whether animations are enabled
  speed?: number;        // Animation speed multiplier (1.0 is normal)
  bubblesDensity?: number; // Density of background bubbles animation
  bubblesSpeed?: number; // Speed of background bubbles animation
}

export interface ThemeConfig {
  colors: ThemeColors;   // Theme color configuration
  animation: ThemeAnimation; // Theme animation configuration
  fontFamily?: string;   // Primary font family
  borderRadius?: number; // Border radius for UI elements in pixels
  spacing?: number;      // Base spacing unit in pixels
}

export interface ThemeManagerInterface {
  // Applies a theme configuration to the application
  applyTheme(config: ThemeConfig): boolean;
  
  // Gets the current theme configuration
  getThemeConfig(): ThemeConfig;
  
  // Gets a specific theme property value
  getThemeProperty(propertyPath: string): any;
  
  // Starts the background bubbles animation
  startBackgroundAnimation(options?: { density?: number; speed?: number }): boolean;
  
  // Stops the background bubbles animation
  stopBackgroundAnimation(): boolean;
  
  // Gets CSS variables for the current theme
  getCSSVariables(): Record<string, string>;
}

// Default theme configuration - dark theme by default to limit battery usage
const DEFAULT_THEME: ThemeConfig = {
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

// Create context for the ThemeManager
interface ThemeContextType {
  themeManager: ThemeManagerInterface;
  currentTheme: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Class implementation of the ThemeManager
class ThemeManagerImpl implements ThemeManagerInterface {
  private config: ThemeConfig;
  private setStateCallback: React.Dispatch<React.SetStateAction<ThemeConfig>>;
  private animationActive: boolean = false;

  constructor(initialConfig: ThemeConfig, setStateCallback: React.Dispatch<React.SetStateAction<ThemeConfig>>) {
    this.config = { ...initialConfig };
    this.setStateCallback = setStateCallback;
  }

  /**
   * Applies a new theme configuration to the application
   * @param config The theme configuration to apply
   * @returns true if successful, false otherwise
   */
  applyTheme(config: ThemeConfig): boolean {
    try {
      this.config = { ...config };
      this.setStateCallback(this.config);
      return true;
    } catch (error) {
      console.error("Failed to apply theme:", error);
      return false;
    }
  }

  /**
   * Gets the current theme configuration
   * @returns The current theme configuration
   */
  getThemeConfig(): ThemeConfig {
    return { ...this.config };
  }

  /**
   * Gets a specific theme property value using dot notation
   * @param propertyPath The path to the property (e.g., 'colors.primary')
   * @returns The property value or undefined if not found
   */
  getThemeProperty(propertyPath: string): any {
    const paths = propertyPath.split('.');
    let current: any = this.config;
    
    for (const path of paths) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = current[path];
    }
    
    return current;
  }

  /**
   * Converts the theme configuration to CSS variables
   * @returns An object with CSS variable names and values
   */
  getCSSVariables(): Record<string, string> {
    const variables: Record<string, string> = {};
    
    // Add color variables
    Object.entries(this.config.colors).forEach(([key, value]) => {
      variables[`--color-${key}`] = value;
    });
    
    // Add other theme variables
    if (this.config.fontFamily) {
      variables['--font-family'] = this.config.fontFamily;
    }
    
    if (this.config.borderRadius !== undefined) {
      variables['--border-radius'] = `${this.config.borderRadius}px`;
    }
    
    if (this.config.spacing !== undefined) {
      variables['--spacing'] = `${this.config.spacing}px`;
    }
    
    // Add animation variables
    if (this.config.animation) {
      variables['--animation-speed'] = `${this.config.animation.speed || 1}`;
      variables['--bubbles-density'] = `${this.config.animation.bubblesDensity || 0.5}`;
      variables['--bubbles-speed'] = `${this.config.animation.bubblesSpeed || 1}`;
    }
    
    return variables;
  }

  /**
   * Starts the background bubbles animation
   * @param options Optional configuration for the animation
   * @returns true if successful, false otherwise
   */
  startBackgroundAnimation(options?: { density?: number; speed?: number }): boolean {
    try {
      // Apply animation options if provided
      if (options) {
        const newConfig = { ...this.config };
        if (options.density !== undefined) {
          newConfig.animation.bubblesDensity = options.density;
        }
        if (options.speed !== undefined) {
          newConfig.animation.bubblesSpeed = options.speed;
        }
        newConfig.animation.enabled = true;
        this.applyTheme(newConfig);
      } else if (!this.config.animation.enabled) {
        // Enable animation if it was disabled
        const newConfig = { ...this.config };
        newConfig.animation.enabled = true;
        this.applyTheme(newConfig);
      }
      
      this.animationActive = true;
      return true;
    } catch (error) {
      console.error("Failed to start background animation:", error);
      return false;
    }
  }

  /**
   * Stops the background bubbles animation
   * @returns true if successful, false otherwise
   */
  stopBackgroundAnimation(): boolean {
    try {
      const newConfig = { ...this.config };
      newConfig.animation.enabled = false;
      this.applyTheme(newConfig);
      this.animationActive = false;
      return true;
    } catch (error) {
      console.error("Failed to stop background animation:", error);
      return false;
    }
  }
}

// Bubble animation component for the background
const BubbleAnimation: React.FC<{ 
  enabled: boolean;
  density: number;
  speed: number;
  backgroundColor: string;
}> = ({ enabled, density, speed, backgroundColor }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const bubbles = useRef<Array<{
    x: number;
    y: number;
    radius: number;
    color: string;
    velocity: number;
    opacity: number;
  }>>([]);
  
  // Generate a random color with the primary/accent color base but with varying opacity
  const generateRandomColor = useCallback((baseColor: string, opacity: number): string => {
    // Convert hex to rgb to use with rgba
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }, []);

  // Initialize bubbles
  const initBubbles = useCallback((canvas: HTMLCanvasElement, themeColors: ThemeColors, bubbleDensity: number) => {
    const { width, height } = canvas;
    const count = Math.floor(width * height * bubbleDensity / 10000); // Calculate based on screen size and density
    const colors = [themeColors.primary, themeColors.secondary, themeColors.accent].filter(Boolean) as string[];
    
    bubbles.current = [];
    for (let i = 0; i < count; i++) {
      const radius = Math.random() * 50 + 10; // Random size between 10 and 60
      bubbles.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius,
        color: generateRandomColor(colors[Math.floor(Math.random() * colors.length)], Math.random() * 0.3 + 0.1),
        velocity: (Math.random() * 0.5 + 0.1) * speed, // Random speed influenced by theme speed
        opacity: Math.random() * 0.3 + 0.1 // Random opacity for a subtle effect
      });
    }
  }, [generateRandomColor]);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw bubbles
    bubbles.current.forEach((bubble) => {
      // Move bubble up
      bubble.y -= bubble.velocity;

      // If bubble goes off screen, reset from bottom
      if (bubble.y + bubble.radius < 0) {
        bubble.y = canvas.height + bubble.radius;
        bubble.x = Math.random() * canvas.width;
      }

      // Draw bubble
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      ctx.fillStyle = bubble.color;
      ctx.fill();
    });

    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // Setup and cleanup effects
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    // Set canvas dimensions
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initBubbles(canvas, {
        primary: '#3B82F6',
        secondary: '#10B981',
        background: backgroundColor,
        text: '#F3F4F6',
        accent: '#8B5CF6'
      }, density);
    };

    // Initial setup
    updateCanvasSize();
    
    // Handle resize
    window.addEventListener('resize', updateCanvasSize);
    
    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [enabled, density, speed, backgroundColor, animate, initBubbles]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ 
        opacity: 0.8, // Subtle effect
      }}
    />
  );
};

// ThemeManager provider component
export const ThemeManagerProvider: React.FC<{
  children: React.ReactNode;
  initialTheme?: ThemeConfig;
}> = ({ children, initialTheme = DEFAULT_THEME }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(initialTheme);
  const themeManagerRef = useRef<ThemeManagerInterface | null>(null);
  
  // Initialize the theme manager if not already done
  if (!themeManagerRef.current) {
    themeManagerRef.current = new ThemeManagerImpl(currentTheme, setCurrentTheme);
  }
  
  // Apply CSS variables to the document root
  useEffect(() => {
    if (!themeManagerRef.current) return;
    
    const cssVariables = themeManagerRef.current.getCSSVariables();
    Object.entries(cssVariables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [currentTheme]);
  
  // Context value
  const contextValue: ThemeContextType = {
    themeManager: themeManagerRef.current,
    currentTheme
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      <div 
        className="theme-container min-h-screen transition-colors duration-300"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <BubbleAnimation 
          enabled={currentTheme.animation.enabled} 
          density={currentTheme.animation.bubblesDensity || 0.6}
          speed={currentTheme.animation.bubblesSpeed || 0.8}
          backgroundColor={currentTheme.colors.background}
        />
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the ThemeManager
export const useThemeManager = (): {
  themeManager: ThemeManagerInterface;
  currentTheme: ThemeConfig;
} => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useThemeManager must be used within a ThemeManagerProvider');
  }
  
  return context;
};

export default ThemeManagerProvider;
