# Backend Setup Guide

This guide will help you set up the real backend functionality for Biztomate Scanner.

## 1. Firebase Project Setup

### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `biztomate-scanner`
4. Enable Google Analytics (optional)
5. Click "Create project"

### Enable Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

### Enable Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select a location close to your users
5. Click "Done"

### Enable Storage
1. In Firebase Console, go to "Storage"
2. Click "Get started"
3. Choose "Start in test mode"
4. Select a location close to your users
5. Click "Done"

## 2. Get Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select "Web"
4. Register app with name "Biztomate Scanner"
5. Copy the configuration object

## 3. Environment Configuration

Create a `.env` file in your project root:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:ios:abcdef123456
```

Replace the values with your actual Firebase configuration.

## 4. Security Rules

### Firestore Rules
Deploy the security rules from `firestore.rules`:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init firestore`
4. Deploy rules: `firebase deploy --only firestore:rules`

### Storage Rules
Create `storage.rules`:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /cards/{userId}/{cardId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Deploy: `firebase deploy --only storage`

## 5. Features Implemented

### ✅ Real Backend
- Firebase Firestore for data storage
- Real-time data synchronization
- Secure data access with authentication

### ✅ Real Authentication
- Firebase Authentication with email/password
- User registration and login
- Secure user sessions
- Account deletion with re-authentication

### ✅ Data Sync Across Devices
- Real-time Firestore listeners
- Automatic data synchronization
- Offline support with local caching
- Cross-device data consistency

### ✅ Cloud Storage
- Firebase Storage for card images
- Secure file upload/download
- Automatic image optimization
- User-specific storage paths

## 6. Database Schema

### Users Collection
```javascript
{
  id: "user_uid",
  email: "user@example.com",
  name: "User Name",
  phone: "+1234567890",
  subscriptionPlan: "free|basic|standard|premium|unlimited",
  subscriptionEndDate: timestamp,
  trialEndDate: timestamp,
  scannedCards: 0,
  maxCards: 5,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Cards Collection
```javascript
{
  id: "card_id",
  userId: "user_uid",
  name: "Contact Name",
  company: "Company Name",
  title: "Job Title",
  email: "email@example.com",
  phone: "+1234567890",
  address: "Address",
  website: "website.com",
  imageUrl: "storage_url",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 7. Testing

### Test Authentication
1. Run the app
2. Navigate to auth screen
3. Create a new account
4. Verify user data is stored in Firestore

### Test Data Sync
1. Add a business card
2. Check Firestore for the new document
3. Verify real-time updates work

### Test Cloud Storage
1. Scan a business card with image
2. Verify image is uploaded to Firebase Storage
3. Check image URL is stored with card data

## 8. Troubleshooting

### Common Issues

**Firebase not initialized**
- Check environment variables are set correctly
- Verify Firebase project is created and configured

**Authentication errors**
- Ensure Email/Password provider is enabled
- Check Firebase project settings

**Firestore permission errors**
- Deploy security rules: `firebase deploy --only firestore:rules`
- Verify rules allow authenticated access

**Storage upload errors**
- Deploy storage rules: `firebase deploy --only storage`
- Check storage bucket permissions

## 9. Production Deployment

### Before Production
1. Update security rules for production
2. Set up proper Firebase project settings
3. Configure custom domains (optional)
4. Set up monitoring and analytics
5. Test all features thoroughly

### Environment Variables
Ensure all environment variables are set in your deployment platform:
- Vercel, Netlify, or similar for web
- EAS Build for mobile apps

## 10. Security Best Practices

1. **Never expose Firebase config in client code**
2. **Use environment variables for all sensitive data**
3. **Implement proper security rules**
4. **Regularly audit user permissions**
5. **Monitor Firebase usage and costs**
6. **Backup data regularly**
7. **Implement rate limiting for API calls**

## Support

For issues or questions:
1. Check Firebase documentation
2. Review security rules
3. Test with Firebase emulator
4. Check Firebase console for errors 

## ❌ **Instructions NOT Completed**

I can see that the Firebase configuration has **NOT** been updated yet. Here's what still needs to be done:

### **Current Status:**
- ❌ `lib/firebase.ts` still has mock configuration
- ❌ No `.env` file exists
- ❌ Firebase Console services not enabled

### **What You Need to Do:**

## **Step 1: Update Firebase Configuration**

Replace the content of `lib/firebase.ts` with your real Firebase config:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Real Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyDyLXmc25cwyfauVnFLllE8ffLF4r8lDGQ",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "biztomate-scanner-4d73e.firebaseapp.com",
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || "https://biztomate-scanner-4d73e-default-rtdb.firebaseio.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "biztomate-scanner-4d73e",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "biztomate-scanner-4d73e.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "739469982051",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:739469982051:web:12ba3febe85700a4bbbb56",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-9DPFB291TC"
};

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return true; // Now using real Firebase
};

// Initialize Firebase
let app;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Initialize analytics only in web environment
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
}

export { auth, db, storage, analytics, isFirebaseConfigured };
export default app;
```

## **Step 2: Create .env File**

Create a `.env` file in your project root with:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyDyLXmc25cwyfauVnFLllE8ffLF4r8lDGQ
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=biztomate-scanner-4d73e.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://biztomate-scanner-4d73e-default-rtdb.firebaseio.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=biztomate-scanner-4d73e
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=biztomate-scanner-4d73e.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=739469982051
EXPO_PUBLIC_FIREBASE_APP_ID=1:739469982051:web:12ba3febe85700a4bbbb56
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-9DPFB291TC
```

## **Step 3: Enable Firebase Services**

Go to your Firebase Console and enable:

1. **Authentication** → Enable Email/Password
2. **Firestore Database** → Create database in test mode
3. **Storage** → Create storage in test mode

## **Step 4: Test**

After making these changes:
1. Restart your development server: `npm start`
2. Test user registration/login
3. Check Firebase Console for real data

**The instructions are NOT done yet - you need to make these changes to complete the setup!** 