import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface UserData {
  id: string;
  email: string;
  name: string;
  phone?: string;
  photoURL?: string;
  subscriptionPlan: 'free' | 'basic' | 'standard' | 'premium' | 'unlimited';
  subscriptionEndDate?: number;
  trialEndDate?: number;
  scannedCards: number;
  maxCards: number;
  createdAt: number;
  updatedAt: number;
  provider?: 'email' | 'google';
}

export interface ScannedCard {
  id: string;
  userId: string;
  name: string;
  company?: string;
  title?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  address?: string;
  notes?: string;
  imageUrl?: string;
  scannedAt: number;
  updatedAt: number;
}

export interface UserSettings {
  userId: string;
  notifications: boolean;
  autoSync: boolean;
  exportFormat: 'csv' | 'excel' | 'google' | 'onedrive';
  theme: 'light' | 'dark' | 'auto';
  language: string;
  updatedAt: number;
}

class UserDataStorage {
  private baseDir: string;
  private usersDir: string;
  private cardsDir: string;
  private settingsDir: string;

  constructor() {
    this.baseDir = `${FileSystem.documentDirectory}userdata/`;
    this.usersDir = `${this.baseDir}users/`;
    this.cardsDir = `${this.baseDir}cards/`;
    this.settingsDir = `${this.baseDir}settings/`;
  }

  // Initialize storage directories
  async initialize(): Promise<void> {
    try {
      await this.createDirectoryIfNotExists(this.baseDir);
      await this.createDirectoryIfNotExists(this.usersDir);
      await this.createDirectoryIfNotExists(this.cardsDir);
      await this.createDirectoryIfNotExists(this.settingsDir);
    } catch (error) {
      console.error('Error initializing user data storage:', error);
    }
  }

  private async createDirectoryIfNotExists(dirPath: string): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(dirPath);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
    }
  }

  // User Profile Management
  async saveUserProfile(userData: UserData): Promise<void> {
    try {
      // Save to AsyncStorage first for quick access
      await AsyncStorage.setItem(`user_profile_${userData.id}`, JSON.stringify(userData));
      
      // Save to FileSystem in background (don't await)
      this.saveToFileSystem(userData).catch(error => {
        console.error('FileSystem save error:', error);
      });
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw new Error('Failed to save user profile');
    }
  }

  private async saveToFileSystem(userData: UserData): Promise<void> {
    try {
      const userDir = `${this.usersDir}${userData.id}/`;
      await this.createDirectoryIfNotExists(userDir);
      
      const profilePath = `${userDir}profile.json`;
      await FileSystem.writeAsStringAsync(profilePath, JSON.stringify(userData, null, 2));
    } catch (error) {
      console.error('FileSystem save error:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<UserData | null> {
    try {
      // Try AsyncStorage first for quick access
      const cachedProfile = await AsyncStorage.getItem(`user_profile_${userId}`);
      if (cachedProfile) {
        return JSON.parse(cachedProfile);
      }

      // Fall back to file system
      const profilePath = `${this.usersDir}${userId}/profile.json`;
      const fileInfo = await FileSystem.getInfoAsync(profilePath);
      
      if (fileInfo.exists) {
        const profileData = await FileSystem.readAsStringAsync(profilePath);
        const userData = JSON.parse(profileData);
        
        // Cache in AsyncStorage
        await AsyncStorage.setItem(`user_profile_${userId}`, profileData);
        
        return userData;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserData>): Promise<void> {
    try {
      const currentProfile = await this.getUserProfile(userId);
      if (!currentProfile) {
        throw new Error('User profile not found');
      }

      const updatedProfile = {
        ...currentProfile,
        ...updates,
        updatedAt: Date.now(),
      };

      await this.saveUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  async deleteUserProfile(userId: string): Promise<void> {
    try {
      const userDir = `${this.usersDir}${userId}/`;
      const dirInfo = await FileSystem.getInfoAsync(userDir);
      
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(userDir, { idempotent: true });
      }
      
      // Remove from AsyncStorage
      await AsyncStorage.removeItem(`user_profile_${userId}`);
    } catch (error) {
      console.error('Error deleting user profile:', error);
      throw new Error('Failed to delete user profile');
    }
  }

  // Scanned Cards Management
  async saveScannedCard(card: ScannedCard): Promise<void> {
    try {
      const userCardsDir = `${this.cardsDir}${card.userId}/`;
      await this.createDirectoryIfNotExists(userCardsDir);
      
      const cardPath = `${userCardsDir}${card.id}.json`;
      await FileSystem.writeAsStringAsync(cardPath, JSON.stringify(card, null, 2));
      
      // Update user's scanned cards count
      await this.updateUserProfile(card.userId, {
        scannedCards: (await this.getUserScannedCardsCount(card.userId)) + 1,
      });
    } catch (error) {
      console.error('Error saving scanned card:', error);
      throw new Error('Failed to save scanned card');
    }
  }

  async getScannedCard(userId: string, cardId: string): Promise<ScannedCard | null> {
    try {
      const cardPath = `${this.cardsDir}${userId}/${cardId}.json`;
      const fileInfo = await FileSystem.getInfoAsync(cardPath);
      
      if (fileInfo.exists) {
        const cardData = await FileSystem.readAsStringAsync(cardPath);
        return JSON.parse(cardData);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting scanned card:', error);
      return null;
    }
  }

  async getUserScannedCards(userId: string): Promise<ScannedCard[]> {
    try {
      const userCardsDir = `${this.cardsDir}${userId}/`;
      const dirInfo = await FileSystem.getInfoAsync(userCardsDir);
      
      if (!dirInfo.exists) {
        return [];
      }

      const files = await FileSystem.readDirectoryAsync(userCardsDir);
      const cards: ScannedCard[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const cardData = await FileSystem.readAsStringAsync(`${userCardsDir}${file}`);
          cards.push(JSON.parse(cardData));
        }
      }

      // Sort by scanned date (newest first)
      return cards.sort((a, b) => b.scannedAt - a.scannedAt);
    } catch (error) {
      console.error('Error getting user scanned cards:', error);
      return [];
    }
  }

  async getUserScannedCardsCount(userId: string): Promise<number> {
    try {
      const cards = await this.getUserScannedCards(userId);
      return cards.length;
    } catch (error) {
      console.error('Error getting user scanned cards count:', error);
      return 0;
    }
  }

  async updateScannedCard(card: ScannedCard): Promise<void> {
    try {
      const updatedCard = {
        ...card,
        updatedAt: Date.now(),
      };
      
      await this.saveScannedCard(updatedCard);
    } catch (error) {
      console.error('Error updating scanned card:', error);
      throw new Error('Failed to update scanned card');
    }
  }

  async deleteScannedCard(userId: string, cardId: string): Promise<void> {
    try {
      const cardPath = `${this.cardsDir}${userId}/${cardId}.json`;
      const fileInfo = await FileSystem.getInfoAsync(cardPath);
      
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(cardPath);
        
        // Update user's scanned cards count
        const currentCount = await this.getUserScannedCardsCount(userId);
        await this.updateUserProfile(userId, {
          scannedCards: Math.max(0, currentCount - 1),
        });
      }
    } catch (error) {
      console.error('Error deleting scanned card:', error);
      throw new Error('Failed to delete scanned card');
    }
  }

  // User Settings Management
  async saveUserSettings(settings: UserSettings): Promise<void> {
    try {
      const settingsPath = `${this.settingsDir}${settings.userId}.json`;
      await FileSystem.writeAsStringAsync(settingsPath, JSON.stringify(settings, null, 2));
      
      // Also save to AsyncStorage for quick access
      await AsyncStorage.setItem(`user_settings_${settings.userId}`, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving user settings:', error);
      throw new Error('Failed to save user settings');
    }
  }

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      // Try AsyncStorage first for quick access
      const cachedSettings = await AsyncStorage.getItem(`user_settings_${userId}`);
      if (cachedSettings) {
        return JSON.parse(cachedSettings);
      }

      // Fall back to file system
      const settingsPath = `${this.settingsDir}${userId}.json`;
      const fileInfo = await FileSystem.getInfoAsync(settingsPath);
      
      if (fileInfo.exists) {
        const settingsData = await FileSystem.readAsStringAsync(settingsPath);
        const settings = JSON.parse(settingsData);
        
        // Cache in AsyncStorage
        await AsyncStorage.setItem(`user_settings_${userId}`, settingsData);
        
        return settings;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user settings:', error);
      return null;
    }
  }

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<void> {
    try {
      const currentSettings = await this.getUserSettings(userId);
      const updatedSettings = {
        userId,
        notifications: true,
        autoSync: true,
        exportFormat: 'csv' as const,
        theme: 'auto' as const,
        language: 'en',
        updatedAt: Date.now(),
        ...currentSettings,
        ...updates,
      };

      await this.saveUserSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw new Error('Failed to update user settings');
    }
  }

  // Data Export
  async exportUserData(userId: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const userProfile = await this.getUserProfile(userId);
      const scannedCards = await this.getUserScannedCards(userId);
      const userSettings = await this.getUserSettings(userId);

      const exportData = {
        user: userProfile,
        cards: scannedCards,
        settings: userSettings,
        exportedAt: new Date().toISOString(),
      };

      if (format === 'csv') {
        // Convert to CSV format
        return this.convertToCSV(exportData);
      }

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw new Error('Failed to export user data');
    }
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion for cards
    const cards = data.cards || [];
    if (cards.length === 0) return 'No cards found';

    const headers = ['Name', 'Company', 'Title', 'Email', 'Phone', 'Mobile', 'Website', 'Address', 'Notes', 'Scanned At'];
    const csvRows = [headers.join(',')];

    cards.forEach((card: ScannedCard) => {
      const row = [
        card.name || '',
        card.company || '',
        card.title || '',
        card.email || '',
        card.phone || '',
        card.mobile || '',
        card.website || '',
        card.address || '',
        card.notes || '',
        new Date(card.scannedAt).toISOString(),
      ].map(field => `"${field.replace(/"/g, '""')}"`).join(',');
      
      csvRows.push(row);
    });

    return csvRows.join('\n');
  }

  // Cleanup
  async clearAllData(): Promise<void> {
    try {
      await FileSystem.deleteAsync(this.baseDir, { idempotent: true });
      await this.initialize();
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw new Error('Failed to clear all data');
    }
  }

  async clearUserData(userId: string): Promise<void> {
    try {
      const userDir = `${this.usersDir}${userId}/`;
      const userCardsDir = `${this.cardsDir}${userId}/`;
      const settingsPath = `${this.settingsDir}${userId}.json`;

      await FileSystem.deleteAsync(userDir, { idempotent: true });
      await FileSystem.deleteAsync(userCardsDir, { idempotent: true });
      await FileSystem.deleteAsync(settingsPath, { idempotent: true });

      // Clear from AsyncStorage
      await AsyncStorage.multiRemove([
        `user_profile_${userId}`,
        `user_settings_${userId}`,
      ]);
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw new Error('Failed to clear user data');
    }
  }
}

// Export singleton instance
export const userDataStorage = new UserDataStorage(); 