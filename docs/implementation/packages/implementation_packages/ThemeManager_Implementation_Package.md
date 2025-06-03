# ThemeManager Implementation Package

## Implementation Goal
Implement the ThemeManager component that manages the visual theme of the application, including colors, animations, and styling to provide a calming, anxiety-free experience.

## Component Context
The ThemeManager is a core component of the UserInterface module responsible for:
1. Managing the visual theme of the application (colors, animations, styling)
2. Providing a calming, anxiety-free experience through visual design
3. Supporting dark themes to limit battery usage on mobile devices
4. Implementing background bubble animations for a mindful visual experience

## Interface Definition

```typescript
interface ThemeColors {
  primary: string;       // Primary color (hex code)
  secondary: string;     // Secondary color (hex code)
  background: string;    // Background color (hex code)
  text: string;          // Text color (hex code)
  accent?: string;       // Accent color (hex code)
  success?: string;      // Success color (hex code)
  error?: string;        // Error color (hex code)
  neutral?: string;      // Neutral color (hex code)
}

interface ThemeAnimation {
  enabled: boolean;      // Whether animations are enabled
  speed?: number;        // Animation speed multiplier (1.0 is normal)
  bubblesDensity?: number; // Density of background bubbles animation
  bubblesSpeed?: number; // Speed of background bubbles animation
}

interface ThemeConfig {
  colors: ThemeColors;   // Theme color configuration
  animation: ThemeAnimation; // Theme animation configuration
  fontFamily?: string;   // Primary font family
  borderRadius?: number; // Border radius for UI elements in pixels
  spacing?: number;      // Base spacing unit in pixels
}

interface ThemeManagerInterface {
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
  getCSSVariables(): object;
}
```

## Module Context

The ThemeManager component is part of the UserInterface module, which provides a calming, anxiety-free visual experience with appropriate feedback for user interactions. The ThemeManager specifically handles:

1. Visual theming for the entire application
2. Background animations that create a calming atmosphere
3. Consistent styling across all components

The ThemeManager is a dependency for several other components:
- PlayerCard
- FeedbackSystem
- SessionSummary
- Dashboard

## Implementation Requirements

### Visual Design Principles
1. **Calming Experience**: 
   - Implement bubbles animation in background
   - Create gentle, anxiety-free, mindful visuals
   - Ensure smooth animations that maintain 60fps

2. **Color Scheme**:
   - Use rich colors with gradients
   - Implement simple deep gradients
   - Support dark themes only to limit battery cost on mobile devices

3. **Modern Aesthetic**:
   - Create a modern look with dark themes
   - Ensure consistent styling across all components
   - Support responsive design for different screen sizes

### Technical Requirements
1. Use Next.js with TypeScript and Tailwind CSS
2. Implement the ThemeManagerInterface as defined
3. Ensure the implementation is testable with mock inputs
4. Design for performance with smooth animations that maintain 60fps
5. Support dark theme to limit battery usage on mobile devices
6. Implement CSS variables for theme properties
7. Create a background bubble animation that is calming and performant

## Implementation Prompt

You are implementing the ThemeManager component for the Zenjin Maths App, which is responsible for managing the visual theme of the application, including colors, animations, and styling.

The ThemeManager must implement:
1. Visual design principles:
   - Calming Experience: Bubbles animation in background with gentle, anxiety-free, mindful visuals
   - Color Scheme: Rich colors with gradients, simple deep gradients
   - Modern Aesthetic: Modern look with dark themes only to limit battery cost on mobile devices

2. Methods to:
   - Apply theme configuration
   - Retrieve theme properties
   - Start and stop background animations

Technical requirements:
- Use Next.js with TypeScript and Tailwind CSS
- Implement the ThemeManagerInterface as defined in the UserInterface module
- Ensure the implementation is testable with mock inputs
- Design for performance with smooth animations that maintain 60fps
- Support dark theme to limit battery usage on mobile devices

Please implement the ThemeManager component with all necessary TypeScript types, React hooks, and styling. Include comprehensive comments explaining the implementation details and how they contribute to the calming, anxiety-free experience.

## Mock Inputs

```typescript
// Example theme configuration
const themeConfig = {
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
    bubblesDensity: 0.6,
    bubblesSpeed: 0.8
  },
  fontFamily: "'Inter', sans-serif",
  borderRadius: 8,
  spacing: 4
};

// Example property path
const propertyPath = 'colors.primary';

// Example animation options
const animationOptions = {
  density: 0.7,
  speed: 0.9
};
```

## Expected Outputs

```typescript
// Expected output from getThemeProperty('colors.primary')
'#3B82F6'

// Expected output from getCSSVariables()
{
  '--color-primary': '#3B82F6',
  '--color-secondary': '#10B981',
  '--color-background': '#111827',
  '--color-text': '#F3F4F6',
  '--color-accent': '#8B5CF6',
  '--color-success': '#34D399',
  '--color-error': '#EF4444',
  '--color-neutral': '#6B7280',
  '--font-family': "'Inter', sans-serif",
  '--border-radius': '8px',
  '--spacing': '4px',
  '--animation-speed': '1'
}

// Expected output from applyTheme(themeConfig)
true

// Expected output from startBackgroundAnimation(animationOptions)
true
```

## Validation Criteria

1. **UI-002**: Background must display calming bubble animation that maintains 60fps on target devices.
2. **UI-003**: All UI components must consistently apply the theme with rich colors, gradients, and dark theme.

## Distinction-Based Learning Context

The ThemeManager plays a crucial role in supporting the distinction-based learning approach by:

1. Creating a calming, anxiety-free environment that helps students focus on making distinctions between concepts
2. Using visual cues and animations that enhance the learning experience without causing distraction
3. Providing consistent visual feedback that reinforces the boundaries between correct and incorrect concepts
4. Supporting the overall goal of creating a learning environment that minimizes anxiety and maximizes cognitive resources for learning

The visual design should support the five boundary levels of distinction by providing a clear, consistent visual language that helps students understand and navigate the learning content.

Please implement the ThemeManager component with these principles in mind, ensuring that it contributes to the overall goal of creating an effective, anxiety-free learning environment.
