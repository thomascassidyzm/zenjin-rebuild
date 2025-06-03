/**
 * APML v3.1 Responsive System
 * 
 * Contract-based responsive behavior system that enforces device-specific
 * layouts through contracts rather than hard-coded values
 */

import { ResponsiveContract, DeviceDimensions } from '../interfaces/ComponentContracts';

// Device detection types
export type DeviceType = 'mobile_portrait' | 'mobile_landscape' | 'tablet' | 'desktop';

// Device configuration
interface DeviceConfig {
  minWidth: number;
  maxWidth: number;
  orientation?: 'portrait' | 'landscape';
}

// Device breakpoint definitions
const DEVICE_BREAKPOINTS: Record<DeviceType, DeviceConfig> = {
  mobile_portrait: {
    minWidth: 0,
    maxWidth: 480,
    orientation: 'portrait'
  },
  mobile_landscape: {
    minWidth: 481,
    maxWidth: 767,
    orientation: 'landscape'
  },
  tablet: {
    minWidth: 768,
    maxWidth: 1023
  },
  desktop: {
    minWidth: 1024,
    maxWidth: Infinity
  }
};

/**
 * Responsive System
 * Manages device detection and contract application
 */
export class ResponsiveSystem {
  private static instance: ResponsiveSystem;
  private currentDevice: DeviceType;
  private listeners: Set<(device: DeviceType) => void> = new Set();

  private constructor() {
    this.currentDevice = this.detectDevice();
    this.setupEventListeners();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ResponsiveSystem {
    if (!ResponsiveSystem.instance) {
      ResponsiveSystem.instance = new ResponsiveSystem();
    }
    return ResponsiveSystem.instance;
  }

  /**
   * Detect current device type based on viewport
   */
  private detectDevice(): DeviceType {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = height > width;

    // Check each breakpoint
    for (const [device, config] of Object.entries(DEVICE_BREAKPOINTS)) {
      if (width >= config.minWidth && width <= config.maxWidth) {
        // Additional orientation check for mobile
        if (config.orientation) {
          const matchesOrientation = 
            (config.orientation === 'portrait' && isPortrait) ||
            (config.orientation === 'landscape' && !isPortrait);
          
          if (matchesOrientation) {
            return device as DeviceType;
          }
        } else {
          return device as DeviceType;
        }
      }
    }

    return 'desktop'; // Default fallback
  }

  /**
   * Setup viewport change listeners
   */
  private setupEventListeners(): void {
    let resizeTimer: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newDevice = this.detectDevice();
        if (newDevice !== this.currentDevice) {
          this.currentDevice = newDevice;
          this.notifyListeners(newDevice);
        }
      }, 150); // Debounce resize events
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
  }

  /**
   * Notify all listeners of device change
   */
  private notifyListeners(device: DeviceType): void {
    this.listeners.forEach(listener => listener(device));
  }

  /**
   * Subscribe to device changes
   */
  onDeviceChange(callback: (device: DeviceType) => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Get current device type
   */
  getCurrentDevice(): DeviceType {
    return this.currentDevice;
  }

  /**
   * Get dimensions for current device from contract
   */
  getDimensionsForDevice(contract: ResponsiveContract): DeviceDimensions {
    const device = this.getCurrentDevice();
    return contract.breakpoints[device];
  }

  /**
   * Check if current device is mobile
   */
  isMobile(): boolean {
    return this.currentDevice === 'mobile_portrait' || 
           this.currentDevice === 'mobile_landscape';
  }

  /**
   * Check if current device is touch-enabled
   */
  isTouchDevice(): boolean {
    return 'ontouchstart' in window || 
           navigator.maxTouchPoints > 0;
  }

  /**
   * Get minimum touch target size for current device
   */
  getMinimumTouchTarget(): number {
    return this.isMobile() ? 44 : 32; // Mobile: 44px, Desktop: 32px
  }

  /**
   * Apply responsive styles based on contract
   */
  applyResponsiveStyles(contract: ResponsiveContract): React.CSSProperties {
    const dimensions = this.getDimensionsForDevice(contract);
    const styles: React.CSSProperties = {};

    // Apply width
    if (dimensions.width) {
      styles.width = dimensions.width;
    } else {
      if (dimensions.minWidth) styles.minWidth = dimensions.minWidth;
      if (dimensions.maxWidth) styles.maxWidth = dimensions.maxWidth;
    }

    // Apply padding
    styles.padding = dimensions.padding;

    // Apply font size if specified
    if (dimensions.fontSize) {
      styles.fontSize = dimensions.fontSize;
    }

    // Apply touch target sizing for interactive elements
    if (this.isTouchDevice() && contract.touchTargets) {
      styles.minHeight = contract.touchTargets.minimum;
      styles.minWidth = contract.touchTargets.minimum;
    }

    return styles;
  }

  /**
   * Create CSS custom properties for responsive values
   */
  getCSSVariables(contract: ResponsiveContract): Record<string, string> {
    const device = this.getCurrentDevice();
    const dimensions = contract.breakpoints[device];
    
    return {
      '--responsive-width': dimensions.width || 'auto',
      '--responsive-padding': dimensions.padding,
      '--responsive-font-size': dimensions.fontSize || 'inherit',
      '--touch-target-size': contract.touchTargets?.minimum || '44px'
    };
  }
}

// Export singleton instance
export const responsiveSystem = ResponsiveSystem.getInstance();

/**
 * React hook for responsive behavior
 */
export function useResponsive(contract?: ResponsiveContract) {
  const [device, setDevice] = React.useState<DeviceType>(
    responsiveSystem.getCurrentDevice()
  );

  React.useEffect(() => {
    // Subscribe to device changes
    const unsubscribe = responsiveSystem.onDeviceChange(setDevice);
    return unsubscribe;
  }, []);

  return {
    device,
    isMobile: responsiveSystem.isMobile(),
    isTouchDevice: responsiveSystem.isTouchDevice(),
    dimensions: contract ? responsiveSystem.getDimensionsForDevice(contract) : null,
    styles: contract ? responsiveSystem.applyResponsiveStyles(contract) : {},
    cssVars: contract ? responsiveSystem.getCSSVariables(contract) : {}
  };
}

// Re-export React for the hook
import * as React from 'react';