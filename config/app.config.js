// Complete app configuration
exports.AppConfig = {
  app: {
    name: 'Biztomate',
    slug: 'biztomate-scanner',
    version: '1.2',
    buildNumber: '9',
    description: 'AI-powered business card scanner'
  },
  bundle: {
    ios: 'com.biztomate.scanner',
    android: 'com.biztomate.scanner'
  },
  apple: {
    teamId: 'PFW54M8N5A',
    developerId: '970814e0-d3eb-4319-9b3f-83982733ca3c',
    appleId: 'latif@biztomate.com',
    appStoreUrl: 'https://apps.apple.com/app/id6748657473'
  },
  eas: {
    projectId: 'eb90d0c8-fdbf-4a14-a35c-88e2a13c4ea2'
  },
  api: {
    baseUrl: 'https://api.biztomate.com',
    timeout: 30000,
    retryAttempts: 3
  },
  features: {
    camera: true,
    photoLibrary: true,
    export: true,
    subscription: true,
    analytics: false,
    crashReporting: false
  },
  subscription: {
    trialDays: 7,
    freeScans: 5,
    plans: {
      basic: {
        id: 'basic',
        price: 4.99,
        scans: 100,
        features: ['100 scans per month', 'Export to CSV', 'Basic support']
      },
      standard: {
        id: 'standard',
        price: 9.99,
        scans: 250,
        features: ['250 scans per month', 'Export to Excel', 'Priority support']
      },
      premium: {
        id: 'premium',
        price: 19.99,
        scans: 500,
        features: ['500 scans per month', 'All export formats', 'Premium support']
      }
    }
  },
  ui: {
    primaryColor: '#007AFF',
    secondaryColor: '#5856D6',
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    textSecondaryColor: '#8E8E93',
    borderColor: '#C6C6C8',
    cardColor: '#F2F2F7',
    successColor: '#34C759',
    errorColor: '#FF3B30',
    warningColor: '#FF9500'
  },
  permissions: {
    camera: {
      title: 'Camera Permission',
      message: 'This app needs camera access to scan business cards',
      usage: 'This app uses the camera to scan business cards and extract contact information.'
    },
    photoLibrary: {
      title: 'Photo Library Permission',
      message: 'This app needs photo library access to select business card images',
      usage: 'This app accesses your photo library to select business card images for scanning.'
    }
  },
  analytics: {
    enabled: false,
    trackingId: '',
    events: {
      scanCompleted: 'scan_completed',
      exportCompleted: 'export_completed',
      subscriptionStarted: 'subscription_started',
      appOpened: 'app_opened'
    }
  },
  errorReporting: {
    enabled: false,
    service: 'sentry',
    dsn: ''
  },
  storage: {
    maxCards: 1000,
    maxImageSize: 10485760, // 10MB
    compressionQuality: 0.8
  },
  ocr: {
    confidence: 0.8,
    maxRetries: 3,
    timeout: 30000,
    supportedLanguages: ['en']
  },
  export: {
    formats: ['csv', 'excel', 'json'],
    maxBatchSize: 100,
    googleSheets: {
      clientId: '',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    },
    microsoft: {
      clientId: '',
      scopes: ['https://graph.microsoft.com/Files.ReadWrite']
    }
  }
}; 