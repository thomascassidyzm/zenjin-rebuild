/**
 * ThemeManagerInterface.ts
 * Generated from APML Interface Definition
 * Module: UserInterface
 */

import { undefined } from './undefined';

/**
 * Defines the contract for the ThemeManager component that manages the visual theme of the application, including colors, animations, and styling.
 */
/**
 * ThemeColors
 */
export interface ThemeColors {
  /** Primary color (hex code) */
  primary: string;
  /** Secondary color (hex code) */
  secondary: string;
  /** Background color (hex code) */
  background: string;
  /** Text color (hex code) */
  text: string;
  /** Accent color (hex code) */
  accent?: string;
  /** Success color (hex code) */
  success?: string;
  /** Error color (hex code) */
  error?: string;
  /** Neutral color (hex code) */
  neutral?: string;
}

/**
 * ThemeAnimation
 */
export interface ThemeAnimation {
  /** Whether animations are enabled */
  enabled: boolean;
  /** Animation speed multiplier (1.0 is normal) */
  speed?: number;
  /** Density of background bubbles animation */
  bubblesDensity?: number;
  /** Speed of background bubbles animation */
  bubblesSpeed?: number;
}

/**
 * ThemeConfig
 */
export interface ThemeConfig {
  /** Theme color configuration */
  colors: ThemeColors;
  /** Theme animation configuration */
  animation: ThemeAnimation;
  /** Primary font family */
  fontFamily?: string;
  /** Border radius for UI elements in pixels */
  borderRadius?: number;
  /** Base spacing unit in pixels */
  spacing?: number;
}

/**
 * Error codes for ThemeManagerInterface
 */
export enum ThemeManagerErrorCode {
  INVALID_CONFIG = 'INVALID_CONFIG',
  THEME_APPLICATION_FAILED = 'THEME_APPLICATION_FAILED',
  NO_ACTIVE_THEME = 'NO_ACTIVE_THEME',
  INVALID_PROPERTY_PATH = 'INVALID_PROPERTY_PATH',
  PROPERTY_NOT_FOUND = 'PROPERTY_NOT_FOUND',
  ANIMATION_START_FAILED = 'ANIMATION_START_FAILED',
  ANIMATION_STOP_FAILED = 'ANIMATION_STOP_FAILED',
  NO_ACTIVE_ANIMATION = 'NO_ACTIVE_ANIMATION',
}

/**
 * ThemeManagerInterface
 */
export interface ThemeManagerInterface {
  /**
   * Applies a theme configuration to the application
   * @param config - The theme configuration to apply
   * @returns Whether the theme was successfully applied
   * @throws INVALID_CONFIG if The theme configuration is invalid
   * @throws THEME_APPLICATION_FAILED if Failed to apply the theme
   */
  applyTheme(config: ThemeConfig): boolean;

  /**
   * Gets the current theme configuration
   * @returns The current theme configuration
   * @throws NO_ACTIVE_THEME if No active theme configuration found
   */
  getThemeConfig(): ThemeConfig;

  /**
   * Gets a specific theme property value
   * @param propertyPath - Path to the property (e.g., 'colors.primary', 'animation.speed')
   * @returns The value of the specified property
   * @throws INVALID_PROPERTY_PATH if The property path is invalid
   * @throws PROPERTY_NOT_FOUND if The specified property was not found
   */
  getThemeProperty(propertyPath: string): any;

  /**
   * Starts the background bubbles animation
   * @param options - Animation options
   * @returns Whether the animation was successfully started
   * @throws ANIMATION_START_FAILED if Failed to start the animation
   */
  startBackgroundAnimation(options?: Record<string, any>): boolean;

  /**
   * Stops the background bubbles animation
   * @returns Whether the animation was successfully stopped
   * @throws ANIMATION_STOP_FAILED if Failed to stop the animation
   * @throws NO_ACTIVE_ANIMATION if No active animation to stop
   */
  stopBackgroundAnimation(): boolean;

  /**
   * Gets CSS variables for the current theme
   * @returns Object containing CSS variable names and values
   * @throws NO_ACTIVE_THEME if No active theme configuration found
   */
  getCSSVariables(): Record<string, any>;

}

// Export default interface
export default ThemeManagerInterface;
