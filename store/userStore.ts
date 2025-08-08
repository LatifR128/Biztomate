import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  subscriptionPlan: 'free' | 'basic' | 'standard' | 'premium' | 'unlimited';
  subscriptionEndDate?: number;
  trialEndDate?: number;
  scannedCards: number;
  maxCards: number;
  createdAt: number;
  updatedAt: number;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializeUser: () => Promise<void>;
  incrementScannedCards: () => Promise<void>;
  updateSubscription: (plan: User['subscriptionPlan']) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  isTrialActive: () => boolean;
  isSubscriptionActive: () => boolean;
  canScanMore: () => boolean;
  getRemainingCards: () => number;
  getTrialDaysLeft: () => number;
  resetUser: () => void;
  syncUserFromFirestore: () => Promise<void>;
}

const createDefaultUser = (): User => ({
  id: 'default-user',
  email: 'user@biztomate.com',
  name: 'User',
  subscriptionPlan: 'free',
  trialEndDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days trial
  scannedCards: 0,
  maxCards: 5,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      
      initializeUser: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const currentUser = auth?.currentUser;
          if (!currentUser || !db) {
            // Fall back to default user if not authenticated
            console.log('⚠️ No Firebase auth/db, using default user');
            set({
              user: createDefaultUser(),
              isLoading: false
            });
            return;
          }
          
          // Try to get user data from Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              set({
                user: {
                  id: currentUser.uid,
                  email: userData.email || currentUser.email || 'user@biztomate.com',
                  name: userData.name || currentUser.displayName || 'User',
                  subscriptionPlan: userData.subscriptionPlan || 'free',
                  subscriptionEndDate: userData.subscriptionEndDate,
                  trialEndDate: userData.trialEndDate || Date.now() + (7 * 24 * 60 * 60 * 1000),
                  scannedCards: userData.scannedCards || 0,
                  maxCards: userData.maxCards || 5,
                  createdAt: userData.createdAt || Date.now(),
                  updatedAt: userData.updatedAt || Date.now(),
                },
                isLoading: false
              });
            } else {
              // Create default user document
              console.log('📝 Creating new user document in Firestore');
              const defaultUser = createDefaultUser();
              defaultUser.id = currentUser.uid;
              defaultUser.email = currentUser.email || 'user@biztomate.com';
              defaultUser.name = currentUser.displayName || 'User';
              
              try {
                await setDoc(doc(db, 'users', currentUser.uid), {
                  email: defaultUser.email,
                  name: defaultUser.name,
                  subscriptionPlan: defaultUser.subscriptionPlan,
                  trialEndDate: defaultUser.trialEndDate,
                  scannedCards: defaultUser.scannedCards,
                  maxCards: defaultUser.maxCards,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                });
                console.log('✅ User document created in Firestore');
              } catch (firestoreError) {
                console.error('❌ Firestore create error:', firestoreError);
                // Continue with default user even if Firestore fails
              }
              
              set({
                user: defaultUser,
                isLoading: false
              });
            }
          } catch (firestoreError) {
            console.error('❌ Firestore error:', firestoreError);
            // Fall back to default user
            set({
              user: createDefaultUser(),
              isLoading: false
            });
          }
        } catch (error) {
          console.error('❌ User initialization error:', error);
          set({
            user: createDefaultUser(),
            isLoading: false,
            error: 'Failed to initialize user'
          });
        }
      },
      
      incrementScannedCards: async () => {
        try {
          const currentUser = auth?.currentUser;
          const { user } = get();
          
          if (!user) return;
          
          const newScannedCards = user.scannedCards + 1;
          
          // Update local state
          set((state) => ({
            user: state.user ? {
              ...state.user,
              scannedCards: newScannedCards,
              updatedAt: Date.now()
            } : null
          }));
          
          // Update Firestore if authenticated
          if (currentUser && db) {
            await updateDoc(doc(db, 'users', currentUser.uid), {
              scannedCards: newScannedCards,
              updatedAt: serverTimestamp()
            });
          }
        } catch (error: any) {
          console.error('Error incrementing scanned cards:', error);
          set({ error: error.message });
        }
      },
      
      updateSubscription: async (plan) => {
        try {
          const currentUser = auth?.currentUser;
          const { user } = get();
          
          if (!user) return;
          
          const maxCards = {
            'free': 5,
            'basic': 100,
            'standard': 250,
            'premium': 500,
            'unlimited': Infinity
          }[plan];
          
          const subscriptionEndDate = plan === 'free' 
            ? undefined 
            : Date.now() + 365 * 24 * 60 * 60 * 1000; // 1 year
          
          // Update local state
          set((state) => ({
            user: state.user ? {
              ...state.user,
              subscriptionPlan: plan,
              subscriptionEndDate,
              maxCards,
              updatedAt: Date.now()
            } : null
          }));
          
          // Update Firestore if authenticated
          if (currentUser && db) {
            await updateDoc(doc(db, 'users', currentUser.uid), {
              subscriptionPlan: plan,
              subscriptionEndDate,
              maxCards,
              updatedAt: serverTimestamp()
            });
          }
        } catch (error: any) {
          console.error('Error updating subscription:', error);
          set({ error: error.message });
        }
      },
      
      updateUser: async (updates: Partial<User>) => {
        try {
          const currentUser = auth?.currentUser;
          const { user } = get();
          
          if (!user) return;
          
          const updatedUser = {
            ...user,
            ...updates,
            updatedAt: Date.now()
          };
          
          // Update local state
          set({ user: updatedUser });
          
          // Update Firestore if authenticated
          if (currentUser && db) {
            const firestoreUpdates: any = { ...updates, updatedAt: serverTimestamp() };
            await updateDoc(doc(db, 'users', currentUser.uid), firestoreUpdates);
          }
        } catch (error: any) {
          console.error('Error updating user:', error);
          set({ error: error.message });
        }
      },
      
      isTrialActive: () => {
        const { user } = get();
        if (!user) return false;
        
        // If user has an active subscription, they are no longer in trial
        if (user.subscriptionPlan !== 'free' && user.subscriptionEndDate && Date.now() < user.subscriptionEndDate) {
          return false;
        }
        
        // Check if trial is still active
        return user.trialEndDate ? Date.now() < user.trialEndDate : false;
      },
      
      isSubscriptionActive: () => {
        const { user } = get();
        if (!user) return false;
        return user.subscriptionEndDate ? Date.now() < user.subscriptionEndDate : false;
      },
      
      canScanMore: () => {
        const { user } = get();
        if (!user) return false;
        return user.scannedCards < user.maxCards;
      },
      
      getRemainingCards: () => {
        const { user } = get();
        if (!user) return 0;
        return Math.max(0, user.maxCards - user.scannedCards);
      },
      
      getTrialDaysLeft: () => {
        const { user } = get();
        if (!user || !user.trialEndDate) return 0;
        const daysLeft = Math.ceil((user.trialEndDate - Date.now()) / (24 * 60 * 60 * 1000));
        return Math.max(0, daysLeft);
      },
      
      resetUser: () => {
        set({ user: null, error: null });
      },
      
      syncUserFromFirestore: async () => {
        try {
          const currentUser = auth?.currentUser;
          if (!currentUser || !db) return;
          
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            set({
              user: {
                id: currentUser.uid,
                email: userData.email,
                name: userData.name,
                subscriptionPlan: userData.subscriptionPlan || 'free',
                subscriptionEndDate: userData.subscriptionEndDate,
                trialEndDate: userData.trialEndDate,
                scannedCards: userData.scannedCards || 0,
                maxCards: userData.maxCards || 5,
                createdAt: userData.createdAt || Date.now(),
                updatedAt: userData.updatedAt || Date.now(),
              }
            });
          }
        } catch (error: any) {
          console.error('Error syncing user from Firestore:', error);
          set({ error: error.message });
        }
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);