import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs, 
  onSnapshot,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { BusinessCard } from '@/types';

interface CardState {
  cards: BusinessCard[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addCard: (card: BusinessCard) => Promise<boolean>;
  updateCard: (id: string, updates: Partial<BusinessCard>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  getCard: (id: string) => BusinessCard | undefined;
  searchCards: (query: string) => BusinessCard[];
  clearAllCards: () => void;
  cleanupFallbackCards: () => Promise<void>;
  checkDuplicate: (card: BusinessCard) => BusinessCard | null;
  syncCards: () => Promise<void>;
  subscribeToCards: () => (() => void) | null;
}

export const useCardStore = create<CardState>()(
  persist(
    (set, get) => ({
      cards: [],
      isLoading: false,
      error: null,
      
      addCard: async (card: BusinessCard) => {
        try {
          set({ isLoading: true, error: null });
          
          const currentUser = auth?.currentUser;
          if (!currentUser || !db) {
            throw new Error('User not authenticated or database not available');
          }
          
          // Skip duplicate check for fallback data
          if (!card._fallbackId) {
            // Check for duplicates locally using improved logic
            const { cards } = get();
            const duplicate = cards.find(existingCard => {
              // Skip fallback cards in comparison
              if (existingCard._fallbackId) {
                return false;
              }
              
              // Check for exact email match (if both have emails)
              if (card.email && existingCard.email && 
                  card.email.toLowerCase().trim() === existingCard.email.toLowerCase().trim()) {
                return true;
              }
              
              // Check for exact phone match (if both have phones)
              if (card.phone && existingCard.phone && 
                  card.phone.replace(/\D/g, '') === existingCard.phone.replace(/\D/g, '')) {
                return true;
              }
              
              // Check for name + company combination (more accurate than just name)
              if (card.name && existingCard.name) {
                const nameMatch = card.name.toLowerCase().trim() === existingCard.name.toLowerCase().trim();
                
                // If names match, also check if companies match (if both have companies)
                if (nameMatch) {
                  if (card.company && existingCard.company) {
                    return card.company.toLowerCase().trim() === existingCard.company.toLowerCase().trim();
                  } else if (!card.company && !existingCard.company) {
                    // Both have no company, so it's likely a duplicate
                    return true;
                  }
                  // One has company, one doesn't - might be different people
                  return false;
                }
              }
              
              return false;
            });
            
            if (duplicate) {
              set({ isLoading: false, error: 'Duplicate card detected' });
              return false;
            }
          }
          
          // Add to Firestore
          const cardData = {
            ...card,
            userId: currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          
          const docRef = await addDoc(collection(db, 'cards'), cardData);
          
          // Update local state
          const newCard = { ...card, id: docRef.id };
          set((state) => ({
            cards: [...state.cards, newCard],
            isLoading: false
          }));
          
          return true;
        } catch (error: any) {
          console.error('Error adding card:', error);
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to add card' 
          });
          return false;
        }
      },
      
      updateCard: async (id: string, updates: Partial<BusinessCard>) => {
        try {
          set({ isLoading: true, error: null });
          
          if (!db) throw new Error('Database not available');
          
          // Update in Firestore
          const cardRef = doc(db, 'cards', id);
          await updateDoc(cardRef, {
            ...updates,
            updatedAt: serverTimestamp()
          });
          
          // Update local state
          set((state) => ({
            cards: state.cards.map(card =>
              card.id === id
                ? { ...card, ...updates, updatedAt: Date.now() }
                : card
            ),
            isLoading: false
          }));
        } catch (error: any) {
          console.error('Error updating card:', error);
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to update card' 
          });
        }
      },
      
      deleteCard: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          
          if (!db) throw new Error('Database not available');
          
          // Delete from Firestore
          await deleteDoc(doc(db, 'cards', id));
          
          // Update local state
          set((state) => ({
            cards: state.cards.filter(card => card.id !== id),
            isLoading: false
          }));
        } catch (error: any) {
          console.error('Error deleting card:', error);
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to delete card' 
          });
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
      
      // Clean up fallback cards (temporary cards created when OCR fails)
      cleanupFallbackCards: async () => {
        try {
          const { cards } = get();
          const fallbackCards = cards.filter(card => card._fallbackId);
          
          if (fallbackCards.length > 0) {
            console.log(`Cleaning up ${fallbackCards.length} fallback cards`);
            
            // Remove from local state
            set((state) => ({
              cards: state.cards.filter(card => !card._fallbackId)
            }));
            
            // Remove from Firestore if they were saved
            if (db) {
              const currentUser = auth?.currentUser;
              if (currentUser) {
                for (const card of fallbackCards) {
                  try {
                    await deleteDoc(doc(db, 'cards', card.id));
                  } catch (error) {
                    console.log('Fallback card already removed from Firestore:', card.id);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error cleaning up fallback cards:', error);
        }
      },
      
      checkDuplicate: (card: BusinessCard) => {
        try {
          const { cards } = get();
          
          // Skip duplicate check for fallback data
          if (card._fallbackId) {
            return null;
          }
          
          // More intelligent duplicate detection
          return cards.find(existingCard => {
            // Skip fallback cards in comparison
            if (existingCard._fallbackId) {
              return false;
            }
            
            // Check for exact email match (if both have emails)
            if (card.email && existingCard.email && 
                card.email.toLowerCase().trim() === existingCard.email.toLowerCase().trim()) {
              return true;
            }
            
            // Check for exact phone match (if both have phones)
            if (card.phone && existingCard.phone && 
                card.phone.replace(/\D/g, '') === existingCard.phone.replace(/\D/g, '')) {
              return true;
            }
            
            // Check for name + company combination (more accurate than just name)
            if (card.name && existingCard.name) {
              const nameMatch = card.name.toLowerCase().trim() === existingCard.name.toLowerCase().trim();
              
              // If names match, also check if companies match (if both have companies)
              if (nameMatch) {
                if (card.company && existingCard.company) {
                  return card.company.toLowerCase().trim() === existingCard.company.toLowerCase().trim();
                } else if (!card.company && !existingCard.company) {
                  // Both have no company, so it's likely a duplicate
                  return true;
                }
                // One has company, one doesn't - might be different people
                return false;
              }
            }
            
            return false;
          }) || null;
        } catch (error) {
          console.error('Error checking for duplicates:', error);
          return null;
        }
      },
      
      syncCards: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const currentUser = auth?.currentUser;
          if (!currentUser || !db) {
            throw new Error('User not authenticated or database not available');
          }
          
          // Fetch cards from Firestore
          const cardsQuery = query(
            collection(db, 'cards'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
          );
          
          const querySnapshot = await getDocs(cardsQuery);
          const cards: BusinessCard[] = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            cards.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || Date.now(),
              updatedAt: data.updatedAt?.toDate?.() || Date.now(),
            } as BusinessCard);
          });
          
          set({ cards, isLoading: false });
        } catch (error: any) {
          console.error('Error syncing cards:', error);
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to sync cards' 
          });
        }
      },
      
      subscribeToCards: () => {
        try {
          const currentUser = auth?.currentUser;
          if (!currentUser || !db) {
            return null;
          }
          
          const cardsQuery = query(
            collection(db, 'cards'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
          );
          
          const unsubscribe = onSnapshot(cardsQuery, (querySnapshot) => {
            const cards: BusinessCard[] = [];
            
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              cards.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.() || Date.now(),
                updatedAt: data.updatedAt?.toDate?.() || Date.now(),
              } as BusinessCard);
            });
            
            set({ cards });
          }, (error) => {
            console.error('Error listening to cards:', error);
            set({ error: error.message });
          });
          
          return unsubscribe;
        } catch (error: any) {
          console.error('Error setting up cards subscription:', error);
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