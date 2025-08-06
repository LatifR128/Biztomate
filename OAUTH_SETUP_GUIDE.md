# OAuth Setup Guide for Google Sheets & Excel Integration

## 🔧 Google Sheets OAuth Setup

### Step 1: Google Cloud Console Setup
1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select existing one
3. **Enable APIs**:
   - Google Sheets API
   - Google Drive API

### Step 2: Create OAuth 2.0 Credentials
1. **Go to Credentials**: https://console.cloud.google.com/apis/credentials
2. **Click "Create Credentials"** → "OAuth 2.0 Client IDs"
3. **Configure OAuth consent screen**:
   - User Type: External
   - App name: Biztomate Scanner
   - User support email: [your-email]
   - Developer contact information: [your-email]

4. **Create OAuth 2.0 Client ID**:
   - Application type: iOS
   - Bundle ID: `com.biztomate.scanner`
   - **Copy the Client ID and Client Secret**

### Step 3: Configure iOS App
1. **Add URL Scheme** to your iOS app:
   - In Xcode: Info.plist → URL Types
   - Add: `com.biztomate.scanner`

---

## 🔧 Microsoft Excel OAuth Setup

### Step 1: Azure Portal Setup
1. **Go to Azure Portal**: https://portal.azure.com/
2. **Register a new application**:
   - Name: Biztomate Scanner
   - Supported account types: Personal Microsoft accounts only
   - Redirect URI: `com.biztomate.scanner://oauth/microsoft`

### Step 2: Configure Permissions
1. **API permissions**:
   - Microsoft Graph → Delegated permissions
   - Add: `Files.ReadWrite`, `Sites.ReadWrite.All`

### Step 3: Create Client Secret
1. **Certificates & secrets** → "New client secret"
2. **Copy the Client ID and Client Secret**

---

## 🔧 Update App Configuration

### Step 1: Update OAuth Constants
Replace the placeholder values in `constants/oauth.ts`:

```typescript
export const OAUTH_CONFIG = {
  GOOGLE: {
    CLIENT_ID: 'your-actual-google-client-id-here',
    CLIENT_SECRET: 'your-actual-google-client-secret-here',
    // ... rest stays the same
  },
  MICROSOFT: {
    CLIENT_ID: 'your-actual-microsoft-client-id-here',
    CLIENT_SECRET: 'your-actual-microsoft-client-secret-here',
    // ... rest stays the same
  }
};
```

### Step 2: Environment Variables (Optional)
For better security, use environment variables:

```typescript
export const OAUTH_CONFIG = {
  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'your-actual-google-client-id',
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'your-actual-google-client-secret',
    // ... rest stays the same
  },
  MICROSOFT: {
    CLIENT_ID: process.env.MICROSOFT_CLIENT_ID || 'your-actual-microsoft-client-id',
    CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET || 'your-actual-microsoft-client-secret',
    // ... rest stays the same
  }
};
```

---

## 🔧 Testing the Integration

### Step 1: Test Google Sheets
1. Open the app
2. Go to Export Cards
3. Tap "Connect Google"
4. Should open Google OAuth flow
5. After authorization, should show "✓ Connected"

### Step 2: Test Excel
1. Go to Export Cards
2. Tap "Connect Microsoft"
3. Should open Microsoft OAuth flow
4. After authorization, should show "✓ Connected"

### Step 3: Test Export
1. Select some business cards
2. Try exporting to Google Sheets
3. Try exporting to Excel
4. Verify files are created in respective accounts

---

## 🚨 Important Notes

1. **Bundle ID Must Match**: Ensure your iOS bundle ID exactly matches what you configure in Google Cloud Console
2. **URL Schemes**: Make sure URL schemes are properly configured in your iOS app
3. **TestFlight**: OAuth works in TestFlight builds
4. **Production**: OAuth will work in App Store builds once configured

---

## 🔍 Troubleshooting

### "Connection Failed" Error
- Check if OAuth credentials are properly configured
- Verify bundle ID matches
- Check internet connection
- Ensure URL schemes are configured

### OAuth Flow Not Starting
- Verify CLIENT_ID and CLIENT_SECRET are correct
- Check if APIs are enabled in Google Cloud Console
- Ensure redirect URIs are properly configured

### Export Fails After Connection
- Check if access tokens are stored properly
- Verify API permissions are granted
- Check network connectivity 