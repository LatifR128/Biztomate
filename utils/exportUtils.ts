import { BusinessCard } from '@/types';
import { Platform } from 'react-native';

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
    'Date Added'
  ].join(',');
  
  // Convert each card to a CSV row with proper field mapping
  const rows = cards.map(card => {
    const date = new Date(card.createdAt).toLocaleDateString();
    return [
      escapeCsvValue(card.name || ''),           // Name field
      escapeCsvValue(card.title || ''),          // Title field  
      escapeCsvValue(card.company || ''),        // Company field
      escapeCsvValue(card.email || ''),          // Email field
      escapeCsvValue(card.phone || ''),          // Phone field
      escapeCsvValue(card.website || ''),        // Website field
      escapeCsvValue(card.address || ''),        // Address field
      escapeCsvValue(card.notes || ''),          // Notes field
      escapeCsvValue(date)                       // Date Added field
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

// Google Sheets integration with OAuth flow
export const exportToGoogleSheets = async (cards: BusinessCard[]): Promise<boolean> => {
  try {
    console.log('Initiating Google Sheets export for', cards.length, 'cards');
    
    // Check if user is authenticated with Google
    if (!isGoogleSheetsConnected()) {
      throw new Error('Google Sheets not connected. Please connect first.');
    }
    
    // Prepare data for Google Sheets API
    const headers = ['Name', 'Title', 'Company', 'Email', 'Phone', 'Website', 'Address', 'Notes', 'Date Added'];
    const rows = cards.map(card => [
      card.name || '',
      card.title || '',
      card.company || '',
      card.email || '',
      card.phone || '',
      card.website || '',
      card.address || '',
      card.notes || '',
      new Date(card.createdAt).toLocaleDateString()
    ]);
    
    // In a real implementation, this would:
    // 1. Use Google Sheets API v4
    // 2. Create or update a spreadsheet
    // 3. Insert data with proper formatting
    // Example API call:
    // const response = await gapi.client.sheets.spreadsheets.values.update({
    //   spreadsheetId: 'your-sheet-id',
    //   range: 'Sheet1!A1',
    //   valueInputOption: 'RAW',
    //   resource: {
    //     values: [headers, ...rows]
    //   }
    // });
    
    // For now, simulate the export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate API call to Google Sheets
    const success = await mockGoogleSheetsAPI(cards);
    
    if (!success) {
      throw new Error('Failed to export to Google Sheets');
    }
    
    return true;
  } catch (error) {
    console.error('Google Sheets export error:', error);
    throw error;
  }
};

// Excel/OneDrive integration with Microsoft Graph API
export const exportToExcel = async (cards: BusinessCard[]): Promise<boolean> => {
  try {
    console.log('Initiating Excel/OneDrive export for', cards.length, 'cards');
    
    // Check if user is authenticated with Microsoft
    if (!isExcelConnected()) {
      throw new Error('Excel/OneDrive not connected. Please connect first.');
    }
    
    // Prepare data for Excel format
    const headers = ['Name', 'Title', 'Company', 'Email', 'Phone', 'Website', 'Address', 'Notes', 'Date Added'];
    const rows = cards.map(card => [
      card.name || '',
      card.title || '',
      card.company || '',
      card.email || '',
      card.phone || '',
      card.website || '',
      card.address || '',
      card.notes || '',
      new Date(card.createdAt).toLocaleDateString()
    ]);
    
    // In a real implementation, this would:
    // 1. Use Microsoft Graph API
    // 2. Create or update an Excel file in OneDrive
    // 3. Insert data with proper formatting
    // Example API call:
    // const response = await fetch('https://graph.microsoft.com/v1.0/me/drive/items/{item-id}/workbook/worksheets/{worksheet-id}/range(address=\'A1\')', {
    //   method: 'PATCH',
    //   headers: {
    //     'Authorization': `Bearer ${accessToken}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     values: [headers, ...rows]
    //   })
    // });
    
    // For now, simulate the export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate API call to Microsoft Graph
    const success = await mockMicrosoftGraphAPI(cards);
    
    if (!success) {
      throw new Error('Failed to export to Excel/OneDrive');
    }
    
    return true;
  } catch (error) {
    console.error('Excel export error:', error);
    throw error;
  }
};

// Mock Google Sheets API call
const mockGoogleSheetsAPI = async (cards: BusinessCard[]): Promise<boolean> => {
  // Simulate API processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate 90% success rate
  return Math.random() > 0.1;
};

// Mock Microsoft Graph API call
const mockMicrosoftGraphAPI = async (cards: BusinessCard[]): Promise<boolean> => {
  // Simulate API processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate 90% success rate
  return Math.random() > 0.1;
};

// Connection status management
let googleSheetsConnected = false;
let excelConnected = false;

// Check if Google Sheets is connected
export const isGoogleSheetsConnected = (): boolean => {
  return googleSheetsConnected;
};

// Check if Excel/OneDrive is connected
export const isExcelConnected = (): boolean => {
  return excelConnected;
};

// Connect to Google Sheets with OAuth
export const connectGoogleSheets = async (): Promise<boolean> => {
  try {
    console.log('Initiating Google Sheets connection...');
    
    // In a real app, this would:
    // 1. Open OAuth flow for Google Sheets API
    // 2. Request necessary scopes (https://www.googleapis.com/auth/spreadsheets)
    // 3. Store access/refresh tokens securely
    // 4. Verify connection by making a test API call
    
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate connection success (95% success rate)
    const success = Math.random() > 0.05;
    
    if (success) {
      googleSheetsConnected = true;
      console.log('Google Sheets connected successfully');
    } else {
      console.log('Google Sheets connection failed');
    }
    
    return success;
  } catch (error) {
    console.error('Google Sheets connection error:', error);
    return false;
  }
};

// Connect to Excel/OneDrive with OAuth
export const connectExcel = async (): Promise<boolean> => {
  try {
    console.log('Initiating Excel/OneDrive connection...');
    
    // In a real app, this would:
    // 1. Open OAuth flow for Microsoft Graph API
    // 2. Request necessary scopes (Files.ReadWrite, Sites.ReadWrite.All)
    // 3. Store access/refresh tokens securely
    // 4. Verify connection by making a test API call
    
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate connection success (95% success rate)
    const success = Math.random() > 0.05;
    
    if (success) {
      excelConnected = true;
      console.log('Excel/OneDrive connected successfully');
    } else {
      console.log('Excel/OneDrive connection failed');
    }
    
    return success;
  } catch (error) {
    console.error('Excel connection error:', error);
    return false;
  }
};

// Disconnect from Google Sheets
export const disconnectGoogleSheets = (): void => {
  googleSheetsConnected = false;
  console.log('Google Sheets disconnected');
};

// Disconnect from Excel/OneDrive
export const disconnectExcel = (): void => {
  excelConnected = false;
  console.log('Excel/OneDrive disconnected');
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