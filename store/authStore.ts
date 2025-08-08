import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  changeEmail: (currentPassword: string, newEmail: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeAuth: () => Promise<any>;
  refreshUserData: () => Promise<void>;
  syncUserData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(persist(
  (set, get) => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,

  signUp: async (email: string, password: string, name: string, phone?: string) => {
    try {
      console.log('🚀 Starting sign up process...');
      set({ isLoading: true, error: null });
      
      if (!auth) throw new Error('Firebase not initialized');
      
      console.log('👤 Creating Firebase user...');
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ Firebase user created:', user.uid);
      
      console.log('📝 Updating profile...');
      // Update profile with display name
      await updateProfile(user, { displayName: name });
      console.log('✅ Profile updated');
      
      // Create user document in Firestore
      if (db) {
        console.log('💾 Creating Firestore document...');
        try {
          await setDoc(doc(db, 'users', user.uid), {
            email,
            name,
            phone: phone || null,
            subscriptionPlan: 'free',
            trialEndDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days trial
            scannedCards: 0,
            maxCards: 5,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          console.log('✅ Firestore document created');
        } catch (firestoreError) {
          console.error('❌ Firestore error:', firestoreError);
          // Continue even if Firestore fails
        }
      }

      console.log('💾 Preparing local storage data...');
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
      };
      
      try {
        await userDataStorage.saveUserProfile(userData);
        console.log('✅ Local storage data saved');
      } catch (storageError) {
        console.error('❌ Local storage error:', storageError);
        // Continue even if local storage fails
      }

      console.log('🔄 Setting user state...');
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      console.log('🎉 Sign up completed successfully');
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to create account'
      });
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      console.log('🚀 Starting sign in process...');
      set({ isLoading: true, error: null });
      
      if (!auth) throw new Error('Firebase not initialized');
      
      console.log('🔐 Signing in with Firebase...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ Firebase sign in successful:', user.uid);
      
      // Refresh user data from Firestore and sync
      await get().refreshUserData();
      await get().syncUserData();
      
      console.log('🔄 Setting user state...');
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      console.log('🎉 Sign in completed successfully');
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to sign in'
      });
      throw error;
    }
  },

  signInWithGoogle: async () => {
    try {
      console.log('🚀 Starting Google sign in...');
      set({ isLoading: true, error: null });
      
      const result = await signInWithGoogleOAuth();
      if (!result.success || !result.user) {
        throw new Error(result.error || 'Google sign in failed');
      }
      
      console.log('✅ Google sign in successful:', result.user.id);
      
      // Get the Firebase user from auth
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        throw new Error('Firebase user not found after Google sign in');
      }
      
      // Create or update user document in Firestore
      if (db) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          
          if (!userDoc.exists()) {
            // Create new user document
            await setDoc(doc(db, 'users', currentUser.uid), {
              email: result.user.email,
              name: result.user.name,
              subscriptionPlan: 'free',
              trialEndDate: Date.now() + (7 * 24 * 60 * 60 * 1000),
              scannedCards: 0,
              maxCards: 5,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            console.log('✅ New user document created for Google user');
          } else {
            // Update existing user document
            await updateDoc(doc(db, 'users', currentUser.uid), {
              email: result.user.email,
              name: result.user.name,
              updatedAt: serverTimestamp(),
            });
            console.log('✅ Existing user document updated for Google user');
          }
        } catch (firestoreError) {
          console.error('❌ Firestore error during Google sign in:', firestoreError);
          // Continue even if Firestore fails
        }
      }
      
      // Refresh user data and sync
      await get().refreshUserData();
      await get().syncUserData();
      
      set({
        user: currentUser,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      console.log('🎉 Google sign in completed successfully');
      return result;
    } catch (error: any) {
      console.error('❌ Google sign in error:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to sign in with Google'
      });
      throw error;
    }
  },

  signOut: async () => {
    try {
      console.log('🚀 Starting sign out process...');
      set({ isLoading: true, error: null });
      
      // Sign out from Firebase
      if (auth) {
        await signOut(auth);
        console.log('✅ Firebase sign out successful');
      }
      
      // Sign out from OAuth if needed
      try {
        await signOutFromOAuth();
        console.log('✅ OAuth sign out successful');
      } catch (oauthError) {
        console.error('❌ OAuth sign out error:', oauthError);
        // Continue even if OAuth sign out fails
      }
      
      // Clear local storage
      try {
        const { user } = get();
        if (user) {
          await userDataStorage.clearUserData(user.uid);
        } else {
          await userDataStorage.clearAllData();
        }
        console.log('✅ Local storage cleared');
      } catch (storageError) {
        console.error('❌ Local storage clear error:', storageError);
        // Continue even if local storage clear fails
      }
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      
      console.log('🎉 Sign out completed successfully');
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to sign out'
      });
      throw error;
    }
  },

  deleteAccount: async () => {
    try {
      console.log('🚀 Starting account deletion...');
      set({ isLoading: true, error: null });
      
      const { user } = get();
      if (!user || !auth) {
        throw new Error('No user to delete');
      }
      
      // Delete user document from Firestore
      if (db) {
        try {
          await deleteDoc(doc(db, 'users', user.uid));
          console.log('✅ Firestore document deleted');
        } catch (firestoreError) {
          console.error('❌ Firestore deletion error:', firestoreError);
          // Continue even if Firestore deletion fails
        }
      }
      
      // Delete user from Firebase Auth
      await deleteUser(user);
      console.log('✅ Firebase user deleted');
      
      // Clear local storage
      try {
        await userDataStorage.clearUserData(user.uid);
        console.log('✅ Local storage cleared');
      } catch (storageError) {
        console.error('❌ Local storage clear error:', storageError);
        // Continue even if local storage clear fails
      }
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      
      console.log('🎉 Account deletion completed successfully');
    } catch (error: any) {
      console.error('❌ Account deletion error:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to delete account'
      });
      throw error;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      console.log('🚀 Starting password change...');
      set({ isLoading: true, error: null });
      
      const { user } = get();
      if (!user || !auth) {
        throw new Error('No user to update');
      }
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      console.log('✅ User re-authenticated');
      
      // Update password
      await updatePassword(user, newPassword);
      console.log('✅ Password updated');
      
      set({
        isLoading: false,
        error: null
      });
      
      console.log('🎉 Password change completed successfully');
    } catch (error: any) {
      console.error('❌ Password change error:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to change password'
      });
      throw error;
    }
  },

  changeEmail: async (currentPassword: string, newEmail: string) => {
    try {
      console.log('🚀 Starting email change...');
      set({ isLoading: true, error: null });
      
      const { user } = get();
      if (!user || !auth) {
        throw new Error('No user to update');
      }
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      console.log('✅ User re-authenticated');
      
      // Update email
      await updateEmail(user, newEmail);
      console.log('✅ Email updated');
      
      // Update Firestore document
      if (db) {
        await updateDoc(doc(db, 'users', user.uid), {
          email: newEmail,
          updatedAt: serverTimestamp(),
        });
        console.log('✅ Firestore document updated');
      }
      
      set({
        isLoading: false,
        error: null
      });
      
      console.log('🎉 Email change completed successfully');
    } catch (error: any) {
      console.error('❌ Email change error:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to change email'
      });
      throw error;
    }
  },

  sendPasswordReset: async (email: string) => {
    try {
      console.log('🚀 Starting password reset...');
      set({ isLoading: true, error: null });
      
      if (!auth) throw new Error('Firebase not initialized');
      
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent');
      
      set({
        isLoading: false,
        error: null
      });
      
      console.log('🎉 Password reset completed successfully');
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to send password reset email'
      });
      throw error;
    }
  },

  refreshUserData: async () => {
    try {
      const { user } = get();
      if (!user || !db) return;
      
      console.log('🔄 Refreshing user data from Firestore...');
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('✅ User data refreshed:', userData);
        
        // Update local storage
        try {
          await userDataStorage.saveUserProfile({
            id: user.uid,
            email: userData.email,
            name: userData.name,
            phone: userData.phone,
            subscriptionPlan: userData.subscriptionPlan || 'free',
            trialEndDate: userData.trialEndDate,
            subscriptionEndDate: userData.subscriptionEndDate,
            scannedCards: userData.scannedCards || 0,
            maxCards: userData.maxCards || 5,
            createdAt: userData.createdAt?.toMillis() || Date.now(),
            updatedAt: userData.updatedAt?.toMillis() || Date.now(),
          });
          console.log('✅ Local storage updated with fresh data');
        } catch (storageError) {
          console.error('❌ Local storage update error:', storageError);
        }
      }
    } catch (error) {
      console.error('❌ Error refreshing user data:', error);
    }
  },

  syncUserData: async () => {
    try {
      const { user } = get();
      if (!user) return;
      
      console.log('🔄 Syncing user data...');
      
      // Trigger card store to load cards
      // This ensures card history is loaded when user signs in
      const cardStore = await import('@/store/cardStore');
      await cardStore.useCardStore.getState().loadCards();
      console.log('✅ Card history loaded');
      
      // Trigger user store to refresh
      const userStore = await import('@/store/userStore');
      await userStore.useUserStore.getState().initializeUser();
      console.log('✅ User store refreshed');
      
    } catch (error) {
      console.error('❌ Error syncing user data:', error);
    }
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  initializeAuth: async () => {
    try {
      console.log('🚀 Initializing authentication...');
      set({ isLoading: true, error: null });
      
      if (!auth) {
        console.log('⚠️ Firebase auth not available, checking persisted state');
        const { user, isAuthenticated } = get();
        if (user && isAuthenticated) {
          console.log('✅ Restored user from persistence:', user.uid);
          await get().syncUserData();
        }
        set({ isLoading: false });
        return () => {};
      }
      
      // ✅ FIXED: Check persisted state first
      const { user: persistedUser, isAuthenticated: persistedAuth } = get();
      console.log('🔄 Checking persisted auth state:', persistedUser?.uid || 'no user');
      
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log('🔄 Auth state changed:', user?.uid || 'no user');
        
        if (user) {
          // User is signed in
          console.log('✅ User authenticated:', user.uid);
          
          // Refresh user data from Firestore
          await get().refreshUserData();
          
          // Sync user data (load cards, etc.)
          await get().syncUserData();
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } else {
          // ✅ FIXED: Only clear user-specific data on actual sign out, preserve card history
          const currentState = get();
          if (currentState.isAuthenticated && currentState.user && !persistedAuth) {
            // User was actually signed out, clear only user-specific data
            console.log('👋 User signed out, clearing user data only');
            
            try {
              await userDataStorage.clearUserData(currentState.user.uid);
              console.log('✅ User-specific storage cleared on sign out (cards preserved)');
            } catch (storageError) {
              console.error('❌ User storage clear error:', storageError);
            }
          } else {
            console.log('🔄 App restart detected, preserving all data including cards');
          }
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      });
      
      console.log('✅ Authentication initialized');
      return unsubscribe;
    } catch (error: any) {
      console.error('❌ Authentication initialization error:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to initialize authentication'
      });
      return () => {};
    }
  },
  }),
  {
    name: 'auth-storage',
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      // Don't persist loading and error states
    }),
  }
)); 