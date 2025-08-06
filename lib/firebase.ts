import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

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
  auth = getAuth(app);
  
  // Set persistence for auth (this will work in both web and React Native)
  if (auth) {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.log('Auth persistence setup failed:', error);
    });
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