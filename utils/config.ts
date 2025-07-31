// Import the JavaScript config file
const { AppConfig } = require('../config/app.config.js');

// Type definitions for the config
interface AppConfigType {
  app: {
    name: string;
    slug: string;
    version: string;
    buildNumber: string;
    description: string;
  };
  bundle: {
    ios: string;
    android: string;
  };
  apple: {
    teamId: string;
    developerId: string;
    appleId: string;
    appStoreUrl: string;
  };
  eas: {
    projectId: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  features: {
    camera: boolean;
    photoLibrary: boolean;
    export: boolean;
    subscription: boolean;
    analytics: boolean;
    crashReporting: boolean;
  };
  subscription: {
    trialDays: number;
    freeScans: number;
    plans: {
      [key: string]: {
        id: string;
        price: number;
        scans: number;
        features: string[];
      };
    };
  };
  ui: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    textSecondaryColor: string;
    borderColor: string;
    cardColor: string;
    successColor: string;
    errorColor: string;
    warningColor: string;
  };
  permissions: {
    camera: {
      title: string;
      message: string;
      usage: string;
    };
    photoLibrary: {
      title: string;
      message: string;
      usage: string;
    };
  };
  analytics: {
    enabled: boolean;
    trackingId: string;
    events: {
      scanCompleted: string;
      exportCompleted: string;
      subscriptionStarted: string;
      appOpened: string;
    };
  };
  errorReporting: {
    enabled: boolean;
    service: string;
    dsn: string;
  };
  storage: {
    maxCards: number;
    maxImageSize: number;
    compressionQuality: number;
  };
  ocr: {
    confidence: number;
    maxRetries: number;
    timeout: number;
    supportedLanguages: string[];
  };
  export: {
    formats: readonly string[];
    maxBatchSize: number;
    googleSheets: {
      clientId: string;
      scopes: string[];
    };
    microsoft: {
      clientId: string;
      scopes: string[];
    };
  };
}

// Configuration utility class
class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfigType;

  private constructor() {
    this.config = AppConfig;
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  // App configuration
  get app() {
    return this.config.app;
  }

  // Bundle configuration
  get bundle() {
    return this.config.bundle;
  }

  // Apple configuration
  get apple() {
    return this.config.apple;
  }

  // EAS configuration
  get eas() {
    return this.config.eas;
  }

  // API configuration
  get api() {
    return this.config.api;
  }

  // Feature flags
  get features() {
    return this.config.features;
  }

  // Subscription configuration
  get subscription() {
    return this.config.subscription;
  }

  // UI configuration
  get ui() {
    return this.config.ui;
  }

  // Permissions configuration
  get permissions() {
    return this.config.permissions;
  }

  // Analytics configuration
  get analytics() {
    return this.config.analytics;
  }

  // Error reporting configuration
  get errorReporting() {
    return this.config.errorReporting;
  }

  // Storage configuration
  get storage() {
    return this.config.storage;
  }

  // OCR configuration
  get ocr() {
    return this.config.ocr;
  }

  // Export configuration
  get export() {
    return this.config.export;
  }

  // Check if a feature is enabled
  isFeatureEnabled(feature: keyof AppConfigType['features']): boolean {
    return this.config.features[feature];
  }

  // Get subscription plan by ID
  getSubscriptionPlan(planId: string) {
    return Object.values(this.config.subscription.plans).find(
      (plan: any) => plan.id === planId
    );
  }

  // Get all subscription plans
  getSubscriptionPlans() {
    return this.config.subscription.plans;
  }

  // Get UI color
  getColor(colorKey: keyof AppConfigType['ui']): string {
    return this.config.ui[colorKey];
  }

  // Get permission message
  getPermissionMessage(permission: keyof AppConfigType['permissions']): string {
    return this.config.permissions[permission].message;
  }

  // Get analytics event name
  getAnalyticsEvent(eventKey: keyof AppConfigType['analytics']['events']): string {
    return this.config.analytics.events[eventKey];
  }

  // Check if analytics is enabled
  isAnalyticsEnabled(): boolean {
    return this.config.analytics.enabled;
  }

  // Check if error reporting is enabled
  isErrorReportingEnabled(): boolean {
    return this.config.errorReporting.enabled;
  }

  // Get export format
  getExportFormats(): readonly string[] {
    return this.config.export.formats;
  }

  // Get OCR confidence threshold
  getOCRConfidence(): number {
    return this.config.ocr.confidence;
  }

  // Get storage limits
  getStorageLimits() {
    return {
      maxCards: this.config.storage.maxCards,
      maxImageSize: this.config.storage.maxImageSize,
      compressionQuality: this.config.storage.compressionQuality,
    };
  }

  // Get trial information
  getTrialInfo() {
    return {
      days: this.config.subscription.trialDays,
      freeScans: this.config.subscription.freeScans,
    };
  }

  // Get API configuration
  getAPIConfig() {
    return {
      baseUrl: this.config.api.baseUrl,
      timeout: this.config.api.timeout,
      retryAttempts: this.config.api.retryAttempts,
    };
  }

  // Get OAuth configuration
  getOAuthConfig(provider: 'google' | 'microsoft') {
    if (provider === 'google') {
      return this.config.export.googleSheets;
    } else if (provider === 'microsoft') {
      return this.config.export.microsoft;
    }
    return null;
  }
}

// Export singleton instance
export const config = ConfigManager.getInstance();

// Export types for TypeScript support
export type ConfigType = AppConfigType;
export type SubscriptionPlan = AppConfigType['subscription']['plans'][keyof AppConfigType['subscription']['plans']];
export type FeatureFlag = keyof AppConfigType['features'];
export type UIColor = keyof AppConfigType['ui'];
export type Permission = keyof AppConfigType['permissions'];
export type AnalyticsEvent = keyof AppConfigType['analytics']['events'];

// Default export for convenience
export default config; 