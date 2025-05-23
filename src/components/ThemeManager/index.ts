// ThemeManager/index.ts
// Export ThemeManager and related functionality

import ThemeManagerProvider, {
  ThemeManagerProvider as Provider,
  useThemeManager,
  ThemeColors,
  ThemeAnimation,
  ThemeConfig,
  ThemeManagerInterface
} from './ThemeManager';

export default ThemeManagerProvider;

export {
  Provider,
  useThemeManager
};

// Use export type for TypeScript interfaces when isolatedModules is enabled
export type {
  ThemeColors,
  ThemeAnimation,
  ThemeConfig,
  ThemeManagerInterface
};
