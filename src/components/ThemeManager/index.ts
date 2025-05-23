// ThemeManager/index.ts
// Export ThemeManager and related functionality

import ThemeManagerProvider, {
  ThemeManagerProvider as Provider,
  useThemeManager,
  THEME_MANAGER_ERRORS
} from './ThemeManager';

// Import interfaces from generated interfaces
import { ThemeManagerInterface } from '../../interfaces/ThemeManagerInterface';

export default ThemeManagerProvider;

export {
  Provider,
  useThemeManager,
  THEME_MANAGER_ERRORS
};

// Re-export the interface
export type { ThemeManagerInterface };

// Re-export types from the generated interface
export type {
  ThemeColors,
  ThemeAnimation,
  ThemeConfig,
  ThemeManagerErrorCode
} from '../../interfaces/ThemeManagerInterface';
