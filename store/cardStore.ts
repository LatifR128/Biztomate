import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BusinessCard } from '@/types';

interface CardState {
  cards: BusinessCard[];
  
  // Actions
  addCard: (card: BusinessCard) => Promise<boolean>;
  updateCard: (id: string, updates: Partial<BusinessCard>) => void;
  deleteCard: (id: string) => void;
  getCard: (id: string) => BusinessCard | undefined;
  searchCards: (query: string) => BusinessCard[];
  clearAllCards: () => void;
  checkDuplicate: (card: BusinessCard) => BusinessCard | null;
}

export const useCardStore = create<CardState>()(
  persist(
    (set, get) => ({
      cards: [],
      
      addCard: async (card: BusinessCard) => {
        try {
          const { cards } = get();
          
          // Check for duplicates
          const duplicate = cards.find(existingCard => 
            existingCard.email === card.email && card.email ||
            existingCard.phone === card.phone && card.phone ||
            existingCard.name.toLowerCase() === card.name.toLowerCase()
          );
          
          if (duplicate) {
            console.log('Duplicate card detected:', duplicate);
            return false;
          }
          
          set((state) => ({
            cards: [...state.cards, card]
          }));
          
          return true;
        } catch (error) {
          console.error('Error adding card:', error);
          return false;
        }
      },
      
      updateCard: (id: string, updates: Partial<BusinessCard>) => {
        try {
          set((state) => ({
            cards: state.cards.map(card =>
              card.id === id
                ? { ...card, ...updates, updatedAt: Date.now() }
                : card
            )
          }));
        } catch (error) {
          console.error('Error updating card:', error);
        }
      },
      
      deleteCard: (id: string) => {
        try {
          set((state) => ({
            cards: state.cards.filter(card => card.id !== id)
          }));
        } catch (error) {
          console.error('Error deleting card:', error);
        }
      },
      
      getCard: (id: string) => {
        try {
          const { cards } = get();
          return cards.find(card => card.id === id);
        } catch (error) {
          console.error('Error getting card:', error);
          return undefined;
        }
      },
      
      searchCards: (query: string) => {
        try {
          const { cards } = get();
          const lowercaseQuery = query.toLowerCase();
          
          return cards.filter(card =>
            card.name.toLowerCase().includes(lowercaseQuery) ||
            card.company?.toLowerCase().includes(lowercaseQuery) ||
            card.email?.toLowerCase().includes(lowercaseQuery) ||
            card.phone?.includes(query) ||
            card.title?.toLowerCase().includes(lowercaseQuery)
          );
        } catch (error) {
          console.error('Error searching cards:', error);
          return [];
        }
      },
      
      clearAllCards: () => {
        try {
          set({ cards: [] });
        } catch (error) {
          console.error('Error clearing cards:', error);
        }
      },
      
      checkDuplicate: (card: BusinessCard) => {
        try {
          const { cards } = get();
          
          return cards.find(existingCard => 
            existingCard.email === card.email && card.email ||
            existingCard.phone === card.phone && card.phone ||
            existingCard.name.toLowerCase() === card.name.toLowerCase()
          ) || null;
        } catch (error) {
          console.error('Error checking for duplicates:', error);
          return null;
        }
      }
    }),
    {
      name: 'card-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ cards: state.cards }),
    }
  )
);