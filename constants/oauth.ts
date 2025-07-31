// OAuth Configuration for Google Sheets and Excel/OneDrive
// Replace these with your actual OAuth credentials

export const OAUTH_CONFIG = {
  // Google OAuth Configuration
  GOOGLE: {
    CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your Google OAuth client ID
    CLIENT_SECRET: 'YOUR_GOOGLE_CLIENT_SECRET', // Replace with your Google OAuth client secret
    REDIRECT_URI: 'com.biztomate.scanner://oauth/google',
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
    REDIRECT_URI: 'com.biztomate.scanner://oauth/microsoft',
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