import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  subscriptionPlan: 'free' | 'basic' | 'standard' | 'premium' | 'unlimited';
  subscriptionEndDate?: number;
  trialEndDate?: number;
  scannedCards: number;
  maxCards: number;
  createdAt: number;
  updatedAt: number;
}

interface UserState {
  user: User;
  
  // Actions
  initializeUser: () => void;
  incrementScannedCards: () => void;
  updateSubscription: (plan: User['subscriptionPlan']) => void;
  isTrialActive: () => boolean;
  isSubscriptionActive: () => boolean;
  canScanMore: () => boolean;
  getRemainingCards: () => number;
  getTrialDaysLeft: () => number;
  resetUser: () => void;
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
      user: createDefaultUser(),
      
      initializeUser: () => {
        try {
          const user = get().user;
          if (!user.trialEndDate) {
            set({
              user: createDefaultUser()
            });
          }
        } catch (error) {
          console.error('Error initializing user:', error);
          set({
            user: createDefaultUser()
          });
        }
      },
      
      incrementScannedCards: () => {
        try {
          set((state) => ({
            user: {
              ...state.user,
              scannedCards: state.user.scannedCards + 1,
              updatedAt: Date.now()
            }
          }));
        } catch (error) {
          console.error('Error incrementing scanned cards:', error);
        }
      },
      
      updateSubscription: (plan) => {
        try {
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
          
          set((state) => ({
            user: {
              ...state.user,
              subscriptionPlan: plan,
              subscriptionEndDate,
              maxCards,
              updatedAt: Date.now()
            }
          }));
        } catch (error) {
          console.error('Error updating subscription:', error);
        }
      },
      
      isTrialActive: () => {
        try {
          const { trialEndDate, subscriptionPlan } = get().user;
          return subscriptionPlan === 'free' && 
                 trialEndDate !== undefined && 
                 trialEndDate > Date.now();
        } catch (error) {
          console.error('Error checking trial status:', error);
          return false;
        }
      },
      
      isSubscriptionActive: () => {
        try {
          const { subscriptionEndDate, subscriptionPlan } = get().user;
          return subscriptionPlan !== 'free' && 
                 subscriptionEndDate !== undefined && 
                 subscriptionEndDate > Date.now();
        } catch (error) {
          console.error('Error checking subscription status:', error);
          return false;
        }
      },
      
      canScanMore: () => {
        try {
          const { scannedCards, maxCards } = get().user;
          return scannedCards < maxCards;
        } catch (error) {
          console.error('Error checking scan limit:', error);
          return false;
        }
      },
      
      getRemainingCards: () => {
        try {
          const { scannedCards, maxCards } = get().user;
          return maxCards - scannedCards;
        } catch (error) {
          console.error('Error getting remaining cards:', error);
          return 0;
        }
      },
      
      getTrialDaysLeft: () => {
        try {
          const { trialEndDate } = get().user;
          if (!trialEndDate) return 0;
          
          const daysLeft = Math.ceil((trialEndDate - Date.now()) / (24 * 60 * 60 * 1000));
          return Math.max(0, daysLeft);
        } catch (error) {
          console.error('Error getting trial days left:', error);
          return 0;
        }
      },
      
      resetUser: () => {
        try {
          set({
            user: createDefaultUser()
          });
        } catch (error) {
          console.error('Error resetting user:', error);
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