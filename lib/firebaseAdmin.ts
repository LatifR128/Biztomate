import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Firebase Admin configuration for server-side operations
const firebaseAdminConfig = {
  type: "service_account",
  project_id: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "biztomate-scanner-4d73e",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

let adminApp;
let adminAuth;

try {
  // Initialize Firebase Admin if not already initialized
  if (getApps().length === 0) {
    adminApp = initializeApp({
      credential: cert(firebaseAdminConfig as any),
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "biztomate-scanner-4d73e",
    });
  } else {
    adminApp = getApps()[0];
  }
  
  adminAuth = getAuth(adminApp);
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
}

export { adminAuth, adminApp }; 