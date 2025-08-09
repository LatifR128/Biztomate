// OAuth Configuration for Google Sheets and Excel/OneDrive
// Replace these with your actual OAuth credentials

export const OAUTH_CONFIG = {
  // Google OAuth Configuration
  GOOGLE: {
    // Web OAuth Client ID (keep iOS Client ID for native sign-in separate)
    CLIENT_ID: 'REDACTED_CLIENT_ID',
    CLIENT_SECRET: 'REDACTED_CLIENT_SECRET',
    REDIRECT_URI: 'biztomatescanner://oauth/google',
    REDIRECT_URI_WEB: 'https://biztomate-1d23d.firebaseapp.com/auth/handler',
    JAVASCRIPT_ORIGINS: ['https://biztomate-1d23d.firebaseapp.com'],
    SCOPES: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ].join(' '),
    AUTH_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
    TOKEN_URL: 'https://oauth2.googleapis.com/token',
  },
  
  // Microsoft OAuth Configuration
  MICROSOFT: {
    CLIENT_ID: 'YOUR_MICROSOFT_CLIENT_ID', // Replace with your Microsoft OAuth client ID
    CLIENT_SECRET: 'YOUR_MICROSOFT_CLIENT_SECRET', // Replace with your Microsoft OAuth client secret
    REDIRECT_URI: 'biztomatescanner://oauth/microsoft',
    SCOPES: [
      'Files.ReadWrite',
      'Sites.ReadWrite.All'
    ].join(' '),
    AUTH_URL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    TOKEN_URL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  }
};

// Storage keys for OAuth tokens
export const OAUTH_STORAGE_KEYS = {
  GOOGLE_TOKEN: 'google_oauth_token',
  MICROSOFT_TOKEN: 'microsoft_oauth_token',
};

// API endpoints
export const API_ENDPOINTS = {
  GOOGLE_SHEETS: {
    CREATE_SPREADSHEET: 'https://sheets.googleapis.com/v4/spreadsheets',
    UPDATE_VALUES: (spreadsheetId: string, range: string) => 
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`,
  },
  MICROSOFT_GRAPH: {
    UPLOAD_FILE: (fileName: string) => 
      `https://graph.microsoft.com/v1.0/me/drive/root:/${fileName}:/content`,
  }
};

// Check if OAuth is configured
export const isGoogleConfigured = (): boolean => {
  return OAUTH_CONFIG.GOOGLE.CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID' &&
    typeof OAUTH_CONFIG.GOOGLE.CLIENT_SECRET === 'string' &&
    OAUTH_CONFIG.GOOGLE.CLIENT_SECRET !== '' &&
    !OAUTH_CONFIG.GOOGLE.CLIENT_SECRET.includes('YOUR_GOOGLE_CLIENT_SECRET');
};

export const isMicrosoftConfigured = (): boolean => {
  return OAUTH_CONFIG.MICROSOFT.CLIENT_ID !== 'YOUR_MICROSOFT_CLIENT_ID' &&
    typeof OAUTH_CONFIG.MICROSOFT.CLIENT_SECRET === 'string' &&
    OAUTH_CONFIG.MICROSOFT.CLIENT_SECRET !== '' &&
    !OAUTH_CONFIG.MICROSOFT.CLIENT_SECRET.includes('YOUR_MICROSOFT_CLIENT_SECRET');
};

// Backward-compatible aggregate check
export const isOAuthConfigured = (): boolean => {
  return isGoogleConfigured() && isMicrosoftConfigured();
};

// Get OAuth error messages
export const getOAuthErrorMessage = (provider: 'google' | 'microsoft'): string => {
  if (provider === 'google') {
    return 'Google OAuth is not configured. Please contact support to enable Google Sheets export.';
  } else if (provider === 'microsoft') {
    return 'Microsoft OAuth is not configured. Please contact support to enable Excel/OneDrive export.';
  }
  return 'OAuth is not configured. Please contact support.';
}; 