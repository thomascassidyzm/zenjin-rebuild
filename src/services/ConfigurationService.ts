/**
 * APML-Compliant Configuration Service
 * Single interface for runtime configuration - no fallbacks, clear success/failure
 */

export interface Configuration {
  supabaseUrl: string;
  supabaseAnonKey: string;
  configured: boolean;
}

class ConfigurationService {
  private static instance: ConfigurationService;
  private configPromise: Promise<Configuration> | null = null;

  private constructor() {}

  static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  /**
   * Get configuration - APML compliant: either works or throws
   * No fallbacks, no graceful degradation, no fuzzy states
   */
  async getConfiguration(): Promise<Configuration> {
    if (!this.configPromise) {
      this.configPromise = this.fetchConfiguration();
    }
    return this.configPromise;
  }

  private async fetchConfiguration(): Promise<Configuration> {
    const response = await fetch('/api/config');
    
    if (!response.ok) {
      throw new Error(`Configuration endpoint failed: ${response.status} ${response.statusText}`);
    }
    
    const config = await response.json();
    
    // APML validation: either we have valid config or we don't
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      throw new Error('Invalid configuration: missing required Supabase environment variables');
    }
    
    return {
      supabaseUrl: config.supabaseUrl,
      supabaseAnonKey: config.supabaseAnonKey,
      configured: true
    };
  }
}

export const configurationService = ConfigurationService.getInstance();