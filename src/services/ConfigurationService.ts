/**
 * APML-Compliant Configuration Service
 * Single interface for runtime configuration - no fallbacks, clear success/failure
 */

export interface Configuration {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey: string;
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
    
    // Debug what we received from the API
    console.log('🔍 Configuration received from API:', {
      configured: config.configured,
      debug: config.debug,
      hasUrl: !!config.supabaseUrl,
      hasAnonKey: !!config.supabaseAnonKey,
      hasServiceKey: !!config.supabaseServiceKey,
      urlPreview: config.supabaseUrl ? `${config.supabaseUrl.substring(0, 20)}...` : 'MISSING',
      anonKeyPreview: config.supabaseAnonKey ? `${config.supabaseAnonKey.substring(0, 20)}...` : 'MISSING',
      serviceKeyPreview: config.supabaseServiceKey ? `${config.supabaseServiceKey.substring(0, 20)}...` : 'MISSING'
    });
    
    // APML validation: either we have valid config or we don't
    if (!config.supabaseUrl || !config.supabaseAnonKey || !config.supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables:', {
        missingUrl: !config.supabaseUrl,
        missingAnonKey: !config.supabaseAnonKey,
        missingServiceKey: !config.supabaseServiceKey,
        serverDebug: config.debug
      });
      throw new Error('Invalid configuration: missing required Supabase environment variables (URL, ANON_KEY, SERVICE_KEY)');
    }
    
    return {
      supabaseUrl: config.supabaseUrl,
      supabaseAnonKey: config.supabaseAnonKey,
      supabaseServiceKey: config.supabaseServiceKey,
      configured: true
    };
  }
}

export const configurationService = ConfigurationService.getInstance();