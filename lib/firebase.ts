import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
// Some versions don't type-export this in RN; ignore types and import from firebase/auth
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Real Firebase configuration (biztomate-1d23d)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyAlbpMjbvfrjaL0aO0H9YARPrhOJSTX4tc",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "biztomate-1d23d.firebaseapp.com",
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || "https://biztomate-1d23d-default-rtdb.firebaseio.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "biztomate-1d23d",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "biztomate-1d23d.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "11602849370",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:11602849370:web:f82e7944b3768ee53ab263",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-9KQ71T9BYW"
};

const isFirebaseConfigured = () => {
  return true;
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics = null;

try {
  app = initializeApp(firebaseConfig);

  // Configure Auth with proper persistence per platform
  if (Platform.OS === 'web') {
    auth = getAuth(app);
    if (auth) {
      setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.log('Auth persistence setup (web) failed:', error);
      });
    }
  } else {
    // React Native: persist using AsyncStorage
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch (e) {
      console.log('initializeAuth failed, falling back to getAuth:', e);
      auth = getAuth(app);
    }
  }
  
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Conditionally initialize Analytics only if supported
  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported && app) {
        analytics = getAnalytics(app);
        console.log('Firebase Analytics initialized successfully');
      } else {
        console.log('Firebase Analytics not supported in this environment');
      }
    }).catch((error) => {
      console.log('Firebase Analytics initialization failed:', error);
    });
  }
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
}

export { auth, db, storage, analytics, isFirebaseConfigured };
export default app; 