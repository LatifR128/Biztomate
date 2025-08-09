import { BusinessCard } from '@/types';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { OAUTH_CONFIG, OAUTH_STORAGE_KEYS, API_ENDPOINTS, isOAuthConfigured, getOAuthErrorMessage } from '@/constants/oauth';

// Convert cards to CSV format with proper field mapping
export const cardsToCSV = (cards: BusinessCard[]): string => {
  // Define CSV headers that match the business card fields
  const headers = [
    'Name',
    'Title', 
    'Company',
    'Email',
    'Phone',
    'Website',
    'Address',
    'Notes',
    'Date Added',
    'Device'
  ].join(',');
  
  // Convert each card to a CSV row with proper field mapping
  const rows = cards.map(card => {
    const date = new Date(card.createdAt).toLocaleDateString();
    const deviceInfo = card.deviceLabel || card.deviceId || 'Unknown Device';
    return [
      escapeCsvValue(card.name || ''),           // Name field
      escapeCsvValue(card.title || ''),          // Title field  
      escapeCsvValue(card.company || ''),        // Company field
      escapeCsvValue(card.email || ''),          // Email field
      escapeCsvValue(card.phone || ''),          // Phone field
      escapeCsvValue(card.website || ''),        // Website field
      escapeCsvValue(card.address || ''),        // Address field
      escapeCsvValue(card.notes || ''),          // Notes field
      escapeCsvValue(date),                      // Date Added field
      escapeCsvValue(deviceInfo)                 // Device field
    ].join(',');
  });
  
  // Combine headers and rows
  return [headers, ...rows].join('\n');
};

// Helper function to escape CSV values
const escapeCsvValue = (value: string): string => {
  if (!value) return '';
  
  // If the value contains a comma, quote, or newline, wrap it in quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    // Double any quotes within the value
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

// Download CSV file for web with proper MIME type
const downloadCSVFile = (csvContent: string, filename: string = 'business_cards.csv') => {
  if (Platform.OS === 'web') {
    // Create blob with proper CSV MIME type
    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    // Add to DOM, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    return true;
  }
  return false;
};

// Google OAuth Flow
const initiateGoogleOAuth = async (): Promise<string | null> => {
  try {
    // Check if OAuth is configured
    if (!isOAuthConfigured()) {
      throw new Error('Google OAuth is not configured. Please contact support.');
    }

    const redirectUri = Platform.OS === 'web' && (OAUTH_CONFIG as any).GOOGLE.REDIRECT_URI_WEB
      ? (OAUTH_CONFIG as any).GOOGLE.REDIRECT_URI_WEB
      : OAUTH_CONFIG.GOOGLE.REDIRECT_URI;

    const authUrl = `${OAUTH_CONFIG.GOOGLE.AUTH_URL}?` +
      `client_id=${OAUTH_CONFIG.GOOGLE.CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(OAUTH_CONFIG.GOOGLE.SCOPES)}` +
      `&access_type=offline` +
      `&prompt=consent`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    
    if (result.type === 'success' && result.url) {
      const url = new URL(result.url);
      const code = url.searchParams.get('code');
      return code;
    }
    
    return null;
  } catch (error) {
    console.error('Google OAuth error:', error);
    return null;
  }
};

// Exchange Google authorization code for access token
const exchangeGoogleCodeForToken = async (code: string): Promise<any> => {
  try {
    const response = await fetch(OAUTH_CONFIG.GOOGLE.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: OAUTH_CONFIG.GOOGLE.CLIENT_ID,
        client_secret: OAUTH_CONFIG.GOOGLE.CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`Google token exchange failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Google token exchange error:', error);
    throw error;
  }
};

// Microsoft OAuth Flow
const initiateMicrosoftOAuth = async (): Promise<string | null> => {
  try {
    // Check if OAuth is configured
    if (!isOAuthConfigured()) {
      throw new Error('Microsoft OAuth is not configured. Please contact support.');
    }

    const authUrl = `${OAUTH_CONFIG.MICROSOFT.AUTH_URL}?` +
      `client_id=${OAUTH_CONFIG.MICROSOFT.CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(OAUTH_CONFIG.MICROSOFT.REDIRECT_URI)}` +
      `&scope=${encodeURIComponent(OAUTH_CONFIG.MICROSOFT.SCOPES)}` +
      `&response_mode=query`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, OAUTH_CONFIG.MICROSOFT.REDIRECT_URI);
    
    if (result.type === 'success' && result.url) {
      const url = new URL(result.url);
      const code = url.searchParams.get('code');
      return code;
    }
    
    return null;
  } catch (error) {
    console.error('Microsoft OAuth error:', error);
    return null;
  }
};

// Exchange Microsoft authorization code for access token
const exchangeMicrosoftCodeForToken = async (code: string): Promise<any> => {
  try {
    const response = await fetch(OAUTH_CONFIG.MICROSOFT.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: OAUTH_CONFIG.MICROSOFT.CLIENT_ID,
        client_secret: OAUTH_CONFIG.MICROSOFT.CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: OAUTH_CONFIG.MICROSOFT.REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      throw new Error(`Microsoft token exchange failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Microsoft token exchange error:', error);
    throw error;
  }
};

// Google Sheets API - Create spreadsheet and add data
const createGoogleSpreadsheet = async (accessToken: string, cards: BusinessCard[]): Promise<boolean> => {
  try {
    // Create new spreadsheet
    const createResponse = await fetch(API_ENDPOINTS.GOOGLE_SHEETS.CREATE_SPREADSHEET, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: `Business Cards - ${new Date().toLocaleDateString()}`,
        },
        sheets: [{
          properties: {
            title: 'Contacts',
          },
        }],
      }),
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create Google Spreadsheet: ${createResponse.status}`);
    }

    const spreadsheet = await createResponse.json();
    const spreadsheetId = spreadsheet.spreadsheetId;

    // Prepare data for Google Sheets
    const values = [
      ['Name', 'Title', 'Company', 'Email', 'Phone', 'Website', 'Address', 'Notes', 'Date Added'],
      ...cards.map(card => [
        card.name || '',
        card.title || '',
        card.company || '',
        card.email || '',
        card.phone || '',
        card.website || '',
        card.address || '',
        card.notes || '',
        new Date(card.createdAt).toLocaleDateString(),
      ]),
    ];

    // Add data to spreadsheet
    const updateResponse = await fetch(
      API_ENDPOINTS.GOOGLE_SHEETS.UPDATE_VALUES(spreadsheetId, `A1:I${values.length}`),
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: values,
        }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error(`Failed to update Google Spreadsheet: ${updateResponse.status}`);
    }

    return true;
  } catch (error) {
    console.error('Google Sheets API error:', error);
    throw error;
  }
};

// Microsoft Graph API - Create Excel file in OneDrive
const createExcelFile = async (accessToken: string, cards: BusinessCard[]): Promise<boolean> => {
  try {
    // Create CSV content first
    const csvContent = cardsToCSV(cards);
    
    // Upload to OneDrive as Excel file
    const fileName = `Business Cards - ${new Date().toLocaleDateString()}.csv`;
    
    const response = await fetch(API_ENDPOINTS.MICROSOFT_GRAPH.UPLOAD_FILE(fileName), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'text/csv',
      },
      body: csvContent,
    });

    if (!response.ok) {
      throw new Error(`Failed to create Excel file: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Microsoft Graph API error:', error);
    throw error;
  }
};

// Real Google Sheets export
export const exportToGoogleSheets = async (cards: BusinessCard[]): Promise<boolean> => {
  try {
    console.log('Initiating Google Sheets export for', cards.length, 'cards');
    
    // Check if OAuth is configured
    if (!isOAuthConfigured()) {
      throw new Error(getOAuthErrorMessage('google'));
    }
    
    const tokenData = await AsyncStorage.getItem(OAUTH_STORAGE_KEYS.GOOGLE_TOKEN);
    if (!tokenData) {
      throw new Error('Google Sheets not connected. Please connect your Google account first.');
    }

    const { access_token } = JSON.parse(tokenData);
    
    // Check if token is expired and refresh if needed
    const success = await createGoogleSpreadsheet(access_token, cards);
    
    return success;
  } catch (error) {
    console.error('Google Sheets export error:', error);
    throw error;
  }
};

// Real Excel/OneDrive export
export const exportToExcel = async (cards: BusinessCard[]): Promise<boolean> => {
  try {
    console.log('Initiating Excel/OneDrive export for', cards.length, 'cards');
    
    // Check if OAuth is configured
    if (!isOAuthConfigured()) {
      throw new Error(getOAuthErrorMessage('microsoft'));
    }
    
    const tokenData = await AsyncStorage.getItem(OAUTH_STORAGE_KEYS.MICROSOFT_TOKEN);
    if (!tokenData) {
      throw new Error('Excel/OneDrive not connected. Please connect your Microsoft account first.');
    }

    const { access_token } = JSON.parse(tokenData);
    
    const success = await createExcelFile(access_token, cards);
    
    return success;
  } catch (error) {
    console.error('Excel export error:', error);
    throw error;
  }
};

// Check if Google Sheets is connected
export const isGoogleSheetsConnected = async (): Promise<boolean> => {
  try {
    // Check if OAuth is configured
    if (!isOAuthConfigured()) {
      return false;
    }
    
    const tokenData = await AsyncStorage.getItem(OAUTH_STORAGE_KEYS.GOOGLE_TOKEN);
    if (!tokenData) return false;
    
    const { access_token, expires_at } = JSON.parse(tokenData);
    
    // Check if token is expired
    if (expires_at && Date.now() > expires_at) {
      await AsyncStorage.removeItem(OAUTH_STORAGE_KEYS.GOOGLE_TOKEN);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking Google Sheets connection:', error);
    return false;
  }
};

// Check if Excel/OneDrive is connected
export const isExcelConnected = async (): Promise<boolean> => {
  try {
    // Check if OAuth is configured
    if (!isOAuthConfigured()) {
      return false;
    }
    
    const tokenData = await AsyncStorage.getItem(OAUTH_STORAGE_KEYS.MICROSOFT_TOKEN);
    if (!tokenData) return false;
    
    const { access_token, expires_at } = JSON.parse(tokenData);
    
    // Check if token is expired
    if (expires_at && Date.now() > expires_at) {
      await AsyncStorage.removeItem(OAUTH_STORAGE_KEYS.MICROSOFT_TOKEN);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking Excel connection:', error);
    return false;
  }
};

// Connect to Google Sheets with real OAuth
export const connectGoogleSheets = async (): Promise<boolean> => {
  try {
    console.log('Initiating Google Sheets OAuth...');
    
    // Check if OAuth is configured
    if (!isOAuthConfigured()) {
      throw new Error(getOAuthErrorMessage('google'));
    }
    
    // Step 1: Initiate OAuth flow
    const code = await initiateGoogleOAuth();
    if (!code) {
      throw new Error('Failed to get authorization code from Google');
    }
    
    // Step 2: Exchange code for access token
    const tokenResponse = await exchangeGoogleCodeForToken(code);
    
    // Step 3: Store token securely
    const tokenData = {
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      expires_at: Date.now() + (tokenResponse.expires_in * 1000),
    };
    
    await AsyncStorage.setItem(OAUTH_STORAGE_KEYS.GOOGLE_TOKEN, JSON.stringify(tokenData));
    
    console.log('Google Sheets connected successfully');
    return true;
  } catch (error) {
    console.error('Google Sheets connection error:', error);
    return false;
  }
};

// Connect to Excel/OneDrive with real OAuth
export const connectExcel = async (): Promise<boolean> => {
  try {
    console.log('Initiating Excel/OneDrive OAuth...');
    
    // Check if OAuth is configured
    if (!isOAuthConfigured()) {
      throw new Error(getOAuthErrorMessage('microsoft'));
    }
    
    // Step 1: Initiate OAuth flow
    const code = await initiateMicrosoftOAuth();
    if (!code) {
      throw new Error('Failed to get authorization code from Microsoft');
    }
    
    // Step 2: Exchange code for access token
    const tokenResponse = await exchangeMicrosoftCodeForToken(code);
    
    // Step 3: Store token securely
    const tokenData = {
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      expires_at: Date.now() + (tokenResponse.expires_in * 1000),
    };
    
    await AsyncStorage.setItem(OAUTH_STORAGE_KEYS.MICROSOFT_TOKEN, JSON.stringify(tokenData));
    
    console.log('Excel/OneDrive connected successfully');
    return true;
  } catch (error) {
    console.error('Excel connection error:', error);
    return false;
  }
};

// Disconnect from Google Sheets
export const disconnectGoogleSheets = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(OAUTH_STORAGE_KEYS.GOOGLE_TOKEN);
    console.log('Google Sheets disconnected');
  } catch (error) {
    console.error('Error disconnecting Google Sheets:', error);
  }
};

// Disconnect from Excel/OneDrive
export const disconnectExcel = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(OAUTH_STORAGE_KEYS.MICROSOFT_TOKEN);
    console.log('Excel/OneDrive disconnected');
  } catch (error) {
    console.error('Error disconnecting Excel:', error);
  }
};

// Export CSV with proper file download and MIME type
export const exportCSV = async (cards: BusinessCard[]): Promise<boolean> => {
  try {
    const csvContent = cardsToCSV(cards);
    
    if (Platform.OS === 'web') {
      // Use proper file download for web with correct MIME type
      return downloadCSVFile(csvContent, 'business_cards.csv');
    } else {
      // For mobile, use Share API with proper file handling
      const { Share } = require('react-native');
      
      // Create a temporary file with proper CSV extension
      const FileSystem = require('expo-file-system');
      const fileUri = FileSystem.documentDirectory + 'business_cards.csv';
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      await Share.share({
        url: fileUri,
        title: 'Business Cards CSV Export',
        message: 'Your business cards have been exported to CSV format.',
      });
      
      return true;
    }
  } catch (error) {
    console.error('CSV export error:', error);
    throw error;
  }
};