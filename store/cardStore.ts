import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BusinessCard } from '@/types';

interface CardState {
  cards: BusinessCard[];
  addCard: (card: BusinessCard) => Promise<boolean>;
  updateCard: (id: string, updatedCard: Partial<BusinessCard>) => void;
  deleteCard: (id: string) => void;
  getCard: (id: string) => BusinessCard | undefined;
  searchCards: (query: string) => BusinessCard[];
  checkDuplicate: (card: Partial<BusinessCard>) => BusinessCard | null;
}

// Helper function to normalize strings for comparison
const normalizeString = (str: string | undefined): string => {
  if (!str) return '';
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
};

// Helper function to normalize phone numbers for comparison
const normalizePhone = (phone: string | undefined): string => {
  if (!phone) return '';
  return phone.replace(/\D/g, ''); // Remove all non-digit characters
};

// Helper function to normalize email for comparison
const normalizeEmail = (email: string | undefined): string => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

export const useCardStore = create<CardState>()(
  persist(
    (set, get) => ({
      cards: [],
      
      addCard: async (card) => {
        // Check for duplicates before adding
        const duplicate = get().checkDuplicate(card);
        
        if (duplicate) {
          // Return false to indicate duplicate found
          return false;
        }
        
        set((state) => ({
          cards: [card, ...state.cards]
        }));
        
        return true;
      },
      
      updateCard: (id, updatedCard) => {
        set((state) => ({
          cards: state.cards.map((card) => 
            card.id === id 
              ? { ...card, ...updatedCard, updatedAt: Date.now() } 
              : card
          )
        }));
      },
      
      deleteCard: (id) => {
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id)
        }));
      },
      
      getCard: (id) => {
        return get().cards.find((card) => card.id === id);
      },
      
      searchCards: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().cards.filter((card) => 
          card.name?.toLowerCase().includes(lowerQuery) ||
          card.company?.toLowerCase().includes(lowerQuery) ||
          card.email?.toLowerCase().includes(lowerQuery) ||
          card.phone?.toLowerCase().includes(lowerQuery) ||
          card.title?.toLowerCase().includes(lowerQuery)
        );
      },
      
      checkDuplicate: (newCard) => {
        const cards = get().cards;
        
        // Check for exact matches on key fields
        for (const existingCard of cards) {
          let matchCount = 0;
          let totalFields = 0;
          
          // Check name match (most important)
          if (newCard.name && existingCard.name) {
            totalFields++;
            if (normalizeString(newCard.name) === normalizeString(existingCard.name)) {
              matchCount++;
            }
          }
          
          // Check email match (unique identifier)
          if (newCard.email && existingCard.email) {
            totalFields++;
            if (normalizeEmail(newCard.email) === normalizeEmail(existingCard.email)) {
              matchCount++;
            }
          }
          
          // Check phone match (unique identifier)
          if (newCard.phone && existingCard.phone) {
            totalFields++;
            if (normalizePhone(newCard.phone) === normalizePhone(existingCard.phone)) {
              matchCount++;
            }
          }
          
          // Check company match
          if (newCard.company && existingCard.company) {
            totalFields++;
            if (normalizeString(newCard.company) === normalizeString(existingCard.company)) {
              matchCount++;
            }
          }
          
          // If we have at least 2 matching fields and match rate > 60%, consider it a duplicate
          if (totalFields >= 2 && matchCount >= 2 && (matchCount / totalFields) > 0.6) {
            return existingCard;
          }
          
          // Special case: if email or phone matches exactly, it's likely a duplicate
          if (newCard.email && existingCard.email && 
              normalizeEmail(newCard.email) === normalizeEmail(existingCard.email)) {
            return existingCard;
          }
          
          if (newCard.phone && existingCard.phone && 
              normalizePhone(newCard.phone) === normalizePhone(existingCard.phone)) {
            return existingCard;
          }
        }
        
        return null;
      }
    }),
    {
      name: 'card-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);