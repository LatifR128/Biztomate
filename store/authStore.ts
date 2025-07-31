import { create } from 'zustand';
import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, Auth } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeAuth: () => Promise<any>;
}

// Mock user for development
const mockUser = {
  uid: 'dev-user-123',
  email: 'test@biztomate.com',
  displayName: 'Test User',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock-token',
  getIdTokenResult: async () => ({ authTime: 1234567890, expirationTime: 1234567890, signInProvider: null, claims: {} }),
  reload: async () => {},
  toJSON: () => ({}),
  phoneNumber: null,
  photoURL: null,
  providerId: 'password',
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  signUp: async (email: string, password: string, name: string, phone?: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // For development, just set the mock user
      set({ 
        user: mockUser as any, 
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      });
      
      // Store user data in AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify({
        uid: mockUser.uid,
        email: email,
        displayName: name,
        phone: phone || null
      }));
      
    } catch (error: any) {
      set({ 
        error: 'An error occurred during sign up', 
        isLoading: false 
      });
      throw new Error('An error occurred during sign up');
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // For development, just set the mock user
      set({ 
        user: mockUser as any, 
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      });
      
      // Store user data in AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify({
        uid: mockUser.uid,
        email: email,
        displayName: mockUser.displayName
      }));
      
    } catch (error: any) {
      set({ 
        error: 'An error occurred during sign in', 
        isLoading: false 
      });
      throw new Error('An error occurred during sign in');
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      
      // Clear user data from AsyncStorage
      await AsyncStorage.removeItem('user');
      
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
      
      // In a real implementation, you would:
      // 1. Delete user data from your backend
      // 2. Cancel any active subscriptions
      // 3. Delete the Firebase user account
      // 4. Clear all local data
      
      // For now, we'll simulate the deletion process
      console.log('Deleting user account...');
      
      // Clear all stored data
      await AsyncStorage.multiRemove([
        'user',
        'cards',
        'subscription',
        'trial_data'
      ]);
      
      // Reset to unauthenticated state
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null 
      });
      
    } catch (error: any) {
      set({ 
        error: 'An error occurred while deleting account', 
        isLoading: false 
      });
      throw new Error('An error occurred while deleting account');
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
      
      // Check if user is already authenticated from AsyncStorage
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          set({ 
            user: { ...mockUser, ...userData } as any, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } else {
          // No stored user, start in unauthenticated state
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      } catch (storageError: any) {
        console.error('Error reading stored user data:', storageError);
        // Start in unauthenticated state if storage fails
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      }
      
    } catch (error: any) {
      console.error('Auth initialization error:', error);
      set({ 
        error: 'Failed to initialize authentication', 
        isLoading: false 
      });
    }
  }
})); 