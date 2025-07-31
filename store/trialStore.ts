import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TrialData {
  uid: string;
  trialStartDate: string;
  trialEndDate: string;
  isActive: boolean;
  daysRemaining: number;
  subscriptionPlan: string;
  email: string;
  name: string;
  phone?: string;
}

interface TrialState {
  trialData: TrialData | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  startTrial: (userData: {
    uid: string;
    email: string;
    name: string;
    phone?: string;
  }) => Promise<void>;
  checkTrialStatus: (uid: string) => Promise<TrialData | null>;
  endTrial: (uid: string) => Promise<void>;
  extendTrial: (uid: string, days: number) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const TRIAL_DAYS = 3; // 3-day free trial

export const useTrialStore = create<TrialState>((set, get) => ({
  trialData: null,
  isLoading: false,
  error: null,

  startTrial: async (userData) => {
    try {
      set({ isLoading: true, error: null });

      const now = new Date();
      const trialEndDate = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

      const trialData: TrialData = {
        uid: userData.uid,
        trialStartDate: now.toISOString(),
        trialEndDate: trialEndDate.toISOString(),
        isActive: true,
        daysRemaining: TRIAL_DAYS,
        subscriptionPlan: 'free',
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
      };

      // Store trial data locally
      await AsyncStorage.setItem(`trial_${userData.uid}`, JSON.stringify(trialData));

      set({ 
        trialData, 
        isLoading: false, 
        error: null 
      });

    } catch (error: any) {
      console.error('Error starting trial:', error);
      set({ 
        error: 'Failed to start trial', 
        isLoading: false 
      });
      throw new Error('Failed to start trial');
    }
  },

  checkTrialStatus: async (uid: string) => {
    try {
      set({ isLoading: true, error: null });

      // Get trial data from storage
      const trialDataString = await AsyncStorage.getItem(`trial_${uid}`);
      
      if (!trialDataString) {
        set({ isLoading: false, error: null });
        return null;
      }

      const trialData: TrialData = JSON.parse(trialDataString);
      const now = new Date();
      const trialEndDate = new Date(trialData.trialEndDate);
      
      // Check if trial is still active
      const isActive = now < trialEndDate;
      const daysRemaining = isActive 
        ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
        : 0;

      const updatedTrialData: TrialData = {
        ...trialData,
        isActive,
        daysRemaining,
      };

      // Update stored data
      await AsyncStorage.setItem(`trial_${uid}`, JSON.stringify(updatedTrialData));

      set({ 
        trialData: updatedTrialData, 
        isLoading: false, 
        error: null 
      });

      return updatedTrialData;

    } catch (error: any) {
      console.error('Error checking trial status:', error);
      set({ 
        error: 'Failed to check trial status', 
        isLoading: false 
      });
      return null;
    }
  },

  endTrial: async (uid: string) => {
    try {
      set({ isLoading: true, error: null });

      const trialDataString = await AsyncStorage.getItem(`trial_${uid}`);
      
      if (trialDataString) {
        const trialData: TrialData = JSON.parse(trialDataString);
        const updatedTrialData: TrialData = {
          ...trialData,
          isActive: false,
          daysRemaining: 0,
        };

        await AsyncStorage.setItem(`trial_${uid}`, JSON.stringify(updatedTrialData));
        set({ trialData: updatedTrialData });
      }

      set({ isLoading: false, error: null });

    } catch (error: any) {
      console.error('Error ending trial:', error);
      set({ 
        error: 'Failed to end trial', 
        isLoading: false 
      });
      throw new Error('Failed to end trial');
    }
  },

  extendTrial: async (uid: string, days: number) => {
    try {
      set({ isLoading: true, error: null });

      const trialDataString = await AsyncStorage.getItem(`trial_${uid}`);
      
      if (trialDataString) {
        const trialData: TrialData = JSON.parse(trialDataString);
        const currentEndDate = new Date(trialData.trialEndDate);
        const newEndDate = new Date(currentEndDate.getTime() + days * 24 * 60 * 60 * 1000);

        const updatedTrialData: TrialData = {
          ...trialData,
          trialEndDate: newEndDate.toISOString(),
          isActive: true,
          daysRemaining: trialData.daysRemaining + days,
        };

        await AsyncStorage.setItem(`trial_${uid}`, JSON.stringify(updatedTrialData));
        set({ trialData: updatedTrialData });
      }

      set({ isLoading: false, error: null });

    } catch (error: any) {
      console.error('Error extending trial:', error);
      set({ 
        error: 'Failed to extend trial', 
        isLoading: false 
      });
      throw new Error('Failed to extend trial');
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
})); 