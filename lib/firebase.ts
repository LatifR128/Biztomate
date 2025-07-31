import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock Firebase configuration for development
const firebaseConfig = {
  apiKey: "mock-api-key-for-development",
  authDomain: "biztomate-scanner-dev.firebaseapp.com",
  projectId: "biztomate-scanner-dev",
  storageBucket: "biztomate-scanner-dev.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:ios:abcdef123456"
};

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return true; // Always return true for development
};

// Initialize Firebase
let app;
let auth: Auth | null = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
}

export { auth, isFirebaseConfigured };
export default app; 