import { create } from 'zustand';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  updateEmail,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { signInWithGoogle as signInWithGoogleOAuth, signOutFromOAuth, OAuthUser, AuthResult } from '@/lib/oauthAuth';
import { userDataStorage, UserData } from '@/utils/userDataStorage';


interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<OAuthUser | null>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  changeEmail: (currentPassword: string, newEmail: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeAuth: () => Promise<any>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  signUp: async (email: string, password: string, name: string, phone?: string) => {
    try {
      console.log('Starting sign up process...');
      set({ isLoading: true, error: null });
      
      if (!auth) throw new Error('Firebase not initialized');
      
      console.log('Creating Firebase user...');
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Firebase user created:', user.uid);
      
      console.log('Updating profile...');
      // Update profile with display name
      await updateProfile(user, { displayName: name });
      console.log('Profile updated');
      
      // Create user document in Firestore
      if (db) {
        console.log('Creating Firestore document...');
        try {
          await setDoc(doc(db, 'users', user.uid), {
            email,
            name,
            phone: phone || null,
            subscriptionPlan: 'free',
            trialEndDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days trial
            scannedCards: 0,
            maxCards: 5,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          console.log('Firestore document created');
        } catch (firestoreError) {
          console.error('Firestore error:', firestoreError);
          // Continue even if Firestore fails
        }
      }

      console.log('Preparing local storage data...');
      // Save user data to local storage (non-blocking)
      const userData: UserData = {
        id: user.uid,
        email,
        name,
        phone: phone || undefined,
        subscriptionPlan: 'free',
        trialEndDate: Date.now() + (7 * 24 * 60 * 60 * 1000),
        scannedCards: 0,
        maxCards: 5,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        provider: 'email',
      };
      
      console.log('Saving to local storage...');
      // Save to local storage in background (don't await)
      userDataStorage.saveUserProfile(userData).catch(error => {
        console.error('Local storage error:', error);
      });
      
      console.log('Setting auth state...');
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      });
      
      console.log('Sign up completed successfully');
      
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      let errorMessage = 'An error occurred during sign up';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already registered';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw new Error(errorMessage);
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      if (!auth) throw new Error('Firebase not initialized');
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      });
      
    } catch (error: any) {
      const errorMessage = error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password'
        ? 'Invalid email or password' 
        : 'An error occurred during sign in';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw new Error(errorMessage);
    }
  },

  signInWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const result = await signInWithGoogleOAuth();
      
      if (result.success && result.user) {
        set({ 
          isAuthenticated: true, 
          isLoading: false,
          error: null 
        });
        return result.user;
      } else {
        set({ 
          error: result.error || 'Google sign-in failed', 
          isLoading: false 
        });
        return null;
      }
      
    } catch (error: any) {
      set({ 
        error: error.message || 'Google sign-in failed', 
        isLoading: false 
      });
      return null;
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      
      await signOutFromOAuth();
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null 
      });
      
    } catch (error: any) {
      set({ 
        error: 'An error occurred during sign out', 
        isLoading: false 
      });
      throw new Error('An error occurred during sign out');
    }
  },

  deleteAccount: async () => {
    try {
      set({ isLoading: true });
      
      if (!auth || !auth.currentUser) throw new Error('No user logged in');
      
      // Delete user data from Firestore
      if (db) {
        try {
          await deleteDoc(doc(db, 'users', auth.currentUser.uid));
          // Note: Deleting all user's cards would require a batch delete operation
        } catch (firestoreError) {
          console.error('Firestore deletion error:', firestoreError);
          // Continue even if Firestore deletion fails
        }
      }
      
      // Delete Firebase user account
      await deleteUser(auth.currentUser);
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null 
      });
      
    } catch (error: any) {
      console.error('Account deletion error:', error);
      set({ 
        error: 'An error occurred while deleting account', 
        isLoading: false 
      });
      throw new Error('An error occurred while deleting account');
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      set({ isLoading: true, error: null });
      
      if (!auth?.currentUser) throw new Error('No user logged in');
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password
      await updatePassword(auth.currentUser, newPassword);
      
      set({ isLoading: false, error: null });
    } catch (error: any) {
      const errorMessage = error.code === 'auth/wrong-password' 
        ? 'Current password is incorrect' 
        : 'Failed to change password';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  changeEmail: async (currentPassword: string, newEmail: string) => {
    try {
      set({ isLoading: true, error: null });
      
      if (!auth?.currentUser) throw new Error('No user logged in');
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update email
      await updateEmail(auth.currentUser, newEmail);
      
      // Update Firestore
      if (db) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          email: newEmail,
          updatedAt: serverTimestamp()
        });
      }
      
      set({ isLoading: false, error: null });
    } catch (error: any) {
      const errorMessage = error.code === 'auth/email-already-in-use' 
        ? 'Email already in use' 
        : 'Failed to change email';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  sendPasswordReset: async (email: string) => {
    try {
      set({ isLoading: true, error: null });
      
      if (!auth) throw new Error('Firebase not initialized');
      
      // Use standard Firebase password reset
      await sendPasswordResetEmail(auth, email);
      
      set({ isLoading: false, error: null });
    } catch (error: any) {
      console.error('Password reset error:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  setUser: (user: User | null) => {
    set({ 
      user, 
      isAuthenticated: !!user 
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      
      if (!auth) {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
        return;
      }
      
      // Listen for auth state changes
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } else {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      });
      
      // Return unsubscribe function for cleanup
      return unsubscribe;
      
    } catch (error: any) {
      console.error('Auth initialization error:', error);
      set({ 
        error: 'Failed to initialize authentication', 
        isLoading: false 
      });
    }
  }
})); 