import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import {
  signInWithCredential,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Platform } from 'react-native';
import { userDataStorage, UserData } from '@/utils/userDataStorage';
import { OAUTH_CONFIG } from '@/constants/oauth';

// Note: Do not import GoogleSignin statically; dynamically import when needed to avoid Expo Go crashes

// Configure WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

export interface OAuthUser {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  provider: 'google';
}

export interface AuthResult {
  success: boolean;
  user?: OAuthUser;
  error?: string;
}

// Google Sign-In
export const signInWithGoogle = async (): Promise<AuthResult> => {
  try {
    // Web (Expo Web): use Firebase Auth popup flow
    if (Platform.OS === 'web') {
      if (!auth) throw new Error('Firebase auth not initialized');
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Create user document in Firestore
      if (db && user) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: user.displayName || 'User',
          photoURL: user.photoURL || undefined,
          subscriptionPlan: 'free',
          trialEndDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days trial
          scannedCards: 0,
          maxCards: 5,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          provider: 'google',
        });
      }

      // Save user data to local storage
      const userData: UserData = {
        id: user.uid,
        email: user.email || '',
        name: user.displayName || 'User',
        photoURL: user.photoURL || undefined,
        subscriptionPlan: 'free',
        trialEndDate: Date.now() + (7 * 24 * 60 * 60 * 1000),
        scannedCards: 0,
        maxCards: 5,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        provider: 'google',
      };
      await userDataStorage.saveUserProfile(userData);

      return {
        success: true,
        user: {
          id: user.uid,
          email: user.email || '',
          name: user.displayName || 'User',
          photoURL: user.photoURL || undefined,
          provider: 'google',
        },
      };
    }

    // On Expo Go (appOwnership === 'expo'), native module isn't available. Fallback to web popup flow.
    if (Constants.appOwnership === 'expo') {
      if (!auth) throw new Error('Firebase auth not initialized');
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      // Create user doc and save local profile (same as web branch)
      if (db && user) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: user.displayName || 'User',
          photoURL: user.photoURL || undefined,
          subscriptionPlan: 'free',
          trialEndDate: Date.now() + (7 * 24 * 60 * 60 * 1000),
          scannedCards: 0,
          maxCards: 5,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          provider: 'google',
        });
      }
      const userData: UserData = {
        id: user.uid,
        email: user.email || '',
        name: user.displayName || 'User',
        photoURL: user.photoURL || undefined,
        subscriptionPlan: 'free',
        trialEndDate: Date.now() + (7 * 24 * 60 * 60 * 1000),
        scannedCards: 0,
        maxCards: 5,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        provider: 'google',
      };
      await userDataStorage.saveUserProfile(userData);
      return {
        success: true,
        user: {
          id: user.uid,
          email: user.email || '',
          name: user.displayName || 'User',
          photoURL: user.photoURL || undefined,
          provider: 'google',
        },
      };
    }

    // Native dev/prod build: require Google Sign-In module synchronously
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
    GoogleSignin.configure({
      iosClientId: '589420296847-30lpkp40vn7kjn27qkq72i9dma9kc0dc.apps.googleusercontent.com',
      webClientId: process.env.GOOGLE_CLIENT_ID || OAUTH_CONFIG.GOOGLE.CLIENT_ID,
      offlineAccess: true,
    });
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices();
    }
    const userInfo = await GoogleSignin.signIn();
    
    if (!userInfo) {
      throw new Error('Google sign-in was cancelled');
    }

    // Get Google credentials
    const { idToken } = await GoogleSignin.getTokens();
    const credential = GoogleAuthProvider.credential(idToken);
    
    // Sign in to Firebase with Google credentials
    if (!auth) throw new Error('Firebase auth not initialized');
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;

    // Create user document in Firestore
    if (db && user) {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: user.displayName || 'User',
        photoURL: user.photoURL || undefined,
        subscriptionPlan: 'free',
        trialEndDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days trial
        scannedCards: 0,
        maxCards: 5,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        provider: 'google',
      });
    }

    // Save user data to local storage
    const userData: UserData = {
      id: user.uid,
      email: user.email || '',
      name: user.displayName || 'User',
      photoURL: user.photoURL || undefined,
      subscriptionPlan: 'free',
      trialEndDate: Date.now() + (7 * 24 * 60 * 60 * 1000),
      scannedCards: 0,
      maxCards: 5,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      provider: 'google',
    };
    await userDataStorage.saveUserProfile(userData);

    return {
      success: true,
      user: {
        id: user.uid,
        email: user.email || '',
        name: user.displayName || 'User',
        photoURL: user.photoURL || undefined,
        provider: 'google',
      },
    };
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    return {
      success: false,
      error: error.message || 'Google sign-in failed',
    };
  }
};

// Sign out from OAuth providers
export const signOutFromOAuth = async (): Promise<void> => {
  try {
    // Sign out from Google; avoid requiring native module on Expo Go
    try {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        if (Constants.appOwnership !== 'expo') {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { GoogleSignin } = require('@react-native-google-signin/google-signin');
          await GoogleSignin.signOut();
        }
      }
    } catch (error) {
      // Ignore sign out errors
    }
    
    // Sign out from Firebase
    if (auth) {
      await auth.signOut();
    }
  } catch (error: any) {
    console.error('OAuth sign-out error:', error);
    throw new Error('Sign-out failed');
  }
};

// Check if user is signed in with OAuth
export const isOAuthSignedIn = async (): Promise<boolean> => {
  try {
    const isFirebaseSignedIn = auth?.currentUser !== null;
    
    return isFirebaseSignedIn;
  } catch (error) {
    return false;
  }
};

// Get current OAuth user
export const getCurrentOAuthUser = async (): Promise<OAuthUser | null> => {
  try {
    if (auth?.currentUser) {
      return {
        id: auth.currentUser.uid,
        email: auth.currentUser.email || '',
        name: auth.currentUser.displayName || 'User',
        photoURL: auth.currentUser.photoURL || undefined,
        provider: 'google',
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
}; 