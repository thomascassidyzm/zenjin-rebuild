/**
 * Configuration Service
 * Fetches runtime configuration from the server to handle environment variables
 * that aren't available at build time
 */

export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  configured: boolean;
}

class ConfigurationService {
  private static instance: ConfigurationService;
  private config: AppConfig | null = null;
  private loadPromise: Promise<AppConfig> | null = null;

  private constructor() {}

  static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  /**
   * Load configuration from the server
   * This method is idempotent - multiple calls return the same promise
   */
  async loadConfig(): Promise<AppConfig> {
    // If already loading, return the existing promise
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // If already loaded, return the cached config
    if (this.config) {
      return Promise.resolve(this.config);
    }

    // Start loading
    this.loadPromise = this.fetchConfig();
    
    try {
      this.config = await this.loadPromise;
      return this.config;
    } catch (error) {
      // Reset on error to allow retry
      this.loadPromise = null;
      throw error;
    }
  }

  private async fetchConfig(): Promise<AppConfig> {
    try {
      const response = await fetch('/api/config');
      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.statusText}`);
      }
      
      const config = await response.json();
      
      // Validate the config
      if (!config.supabaseUrl || !config.supabaseAnonKey) {
        console.warn('Configuration Service: Supabase environment variables not configured on server');
      }
      
      return config;
    } catch (error) {
      console.error('Configuration Service: Failed to load config:', error);
      
      // Return empty config to allow graceful degradation
      return {
        supabaseUrl: '',
        supabaseAnonKey: '',
        configured: false
      };
    }
  }

  /**
   * Get the current configuration
   * Throws if config hasn't been loaded yet
   */
  getConfig(): AppConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfig() first.');
    }
    return this.config;
  }

  /**
   * Check if configuration has been loaded
   */
  isConfigured(): boolean {
    return this.config !== null && this.config.configured;
  }
}

export const configService = ConfigurationService.getInstance();