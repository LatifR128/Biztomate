import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import { FREE_TRIAL_DAYS } from '@/constants/subscriptions';

interface UserState {
  user: User;
  initializeUser: () => void;
  incrementScannedCards: () => void;
  updateSubscription: (plan: User['subscriptionPlan']) => void;
  isTrialActive: () => boolean;
  isSubscriptionActive: () => boolean;
  canScanMore: () => boolean;
  getRemainingCards: () => number;
  getTrialDaysLeft: () => number;
}

const createDefaultUser = (): User => ({
  subscriptionPlan: 'free',
  trialEndDate: Date.now() + FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000,
  scannedCards: 0,
  maxCards: 5
});

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: createDefaultUser(),
      
      initializeUser: () => {
        const user = get().user;
        if (!user.trialEndDate) {
          set({
            user: createDefaultUser()
          });
        }
      },
      
      incrementScannedCards: () => {
        set((state) => ({
          user: {
            ...state.user,
            scannedCards: state.user.scannedCards + 1
          }
        }));
      },
      
      updateSubscription: (plan) => {
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
            maxCards
          }
        }));
      },
      
      isTrialActive: () => {
        const { trialEndDate, subscriptionPlan } = get().user;
        return subscriptionPlan === 'free' && 
               trialEndDate !== undefined && 
               trialEndDate > Date.now();
      },
      
      isSubscriptionActive: () => {
        const { subscriptionEndDate, subscriptionPlan } = get().user;
        return subscriptionPlan !== 'free' && 
               subscriptionEndDate !== undefined && 
               subscriptionEndDate > Date.now();
      },
      
      canScanMore: () => {
        const { scannedCards, maxCards } = get().user;
        return scannedCards < maxCards;
      },
      
      getRemainingCards: () => {
        const { scannedCards, maxCards } = get().user;
        return maxCards - scannedCards;
      },
      
      getTrialDaysLeft: () => {
        const { trialEndDate } = get().user;
        if (!trialEndDate) return 0;
        
        const msLeft = trialEndDate - Date.now();
        return Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);