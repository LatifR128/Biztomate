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
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { BusinessCard } from '@/types';
import { processBusinessCard, normalizeForComparison } from '@/utils/ocrUtils';
import { userDataStorage } from '@/utils/userDataStorage';

interface CardState {
  cards: BusinessCard[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addCard: (card: BusinessCard) => Promise<boolean>;
  getCard: (id: string) => BusinessCard | null;
  updateCard: (id: string, updates: Partial<BusinessCard>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  loadCards: () => Promise<void>;
  syncCards: () => Promise<void>;
  searchCards: (query: string) => BusinessCard[];
  checkDuplicate: (card: BusinessCard) => BusinessCard | null;
  cleanupFallbackCards: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCardStore = create<CardState>((set, get) => ({
  cards: [],
  isLoading: false,
  error: null,

  addCard: async (card: BusinessCard): Promise<boolean> => {
    try {
      console.log('🚀 Adding card to store:', card.name);
      
      // Validate card data
      if (!card || !card.name || !card.id) {
        console.error('❌ Invalid card data:', card);
        return false;
      }
      
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        console.log('⚠️ User not authenticated, adding to local storage only');
        // Add to local state only if not authenticated
        set(state => ({
          cards: [...state.cards, card],
          isLoading: false,
          error: null
        }));
        return true;
      }

      // Add to local state immediately for faster UI response
      set(state => ({
        cards: [...state.cards, card],
        isLoading: false,
        error: null
      }));

      // Firestore sync in background (non-blocking)
      if (db) {
        try {
          const cardData = {
            ...card,
            userId: currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          
          const docRef = await addDoc(collection(db, 'businessCards'), cardData);
          console.log('✅ Card synced to Firestore with ID:', docRef.id);
          
          // Update the card with the Firestore ID in background
          set(state => ({
            cards: state.cards.map(c => 
              c.id === card.id ? { ...c, id: docRef.id } : c
            )
          }));
        } catch (firestoreError) {
          console.error('⚠️ Firestore sync error (non-blocking):', firestoreError);
          // Don't fail the operation - card is already in local state
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error adding card:', error);
      set({ error: 'Failed to add card' });
      return false;
    }
  },

  getCard: (id: string): BusinessCard | null => {
    const { cards } = get();
    return cards.find(card => card.id === id) || null;
  },

  updateCard: async (id: string, updates: Partial<BusinessCard>) => {
    try {
      set({ isLoading: true, error: null });
      
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Update in Firestore
      if (db) {
        try {
          await updateDoc(doc(db, 'businessCards', id), {
            ...updates,
            updatedAt: serverTimestamp(),
          });
          console.log('Card updated in Firestore');
        } catch (firestoreError) {
          console.error('Firestore error:', firestoreError);
          // Continue even if Firestore fails
        }
      }

      // Update local state
      set(state => ({
        cards: state.cards.map(card => 
          card.id === id ? { ...card, ...updates } : card
        ),
        isLoading: false,
        error: null
      }));

    } catch (error: any) {
      console.error('Update card error:', error);
      set({ 
        error: error.message || 'Failed to update card', 
        isLoading: false 
      });
      throw error;
    }
  },

  deleteCard: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Delete from Firestore
      if (db) {
        try {
          await deleteDoc(doc(db, 'businessCards', id));
          console.log('Card deleted from Firestore');
        } catch (firestoreError) {
          console.error('Firestore error:', firestoreError);
          // Continue even if Firestore fails
        }
      }

      // Remove from local state
      set(state => ({
        cards: state.cards.filter(card => card.id !== id),
        isLoading: false,
        error: null
      }));

    } catch (error: any) {
      console.error('Delete card error:', error);
      set({ 
        error: error.message || 'Failed to delete card', 
        isLoading: false 
      });
      throw error;
    }
  },

  loadCards: async () => {
    try {
      console.log('🚀 Loading cards...');
      set({ isLoading: true, error: null });
      
      const currentUser = auth?.currentUser;
      if (!currentUser) {
        console.log('⚠️ No authenticated user, loading from local storage only');
        // Load from local storage if no authenticated user
        try {
          // For unauthenticated users, we'll use an empty array
          // since we need a userId for getUserScannedCards
          set({ 
            cards: [], 
            isLoading: false 
          });
        } catch (localError) {
          console.error('❌ Local storage error:', localError);
          set({ cards: [], isLoading: false });
        }
        return;
      }

      // Try to load from Firestore first
      if (db) {
        try {
          const cardsQuery = query(
            collection(db, 'businessCards'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
          );
          
          const querySnapshot = await getDocs(cardsQuery);
          const firestoreCards: BusinessCard[] = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            firestoreCards.push({
              id: doc.id,
              name: data.name || 'Unknown Contact',
              title: data.title,
              company: data.company,
              email: data.email,
              phone: data.phone,
              website: data.website,
              address: data.address,
              notes: data.notes,
              imageUri: data.imageUri,
              createdAt: data.createdAt?.toMillis() || Date.now(),
              updatedAt: data.updatedAt?.toMillis() || Date.now(),
              _fallbackId: data._fallbackId,
              _isFallback: data._isFallback,
              deviceId: data.deviceId,
              deviceLabel: data.deviceLabel,
            });
          });
          
          console.log('✅ Loaded', firestoreCards.length, 'cards from Firestore');
          set({ cards: firestoreCards, isLoading: false });
          return;
        } catch (firestoreError) {
          console.error('❌ Firestore error:', firestoreError);
          // Fall back to local storage
        }
      }
      
      // Fallback to local storage
      try {
        // Use current user's cards from local storage
        const localScannedCards = await userDataStorage.getUserScannedCards(currentUser.uid);
        // Convert ScannedCard to BusinessCard format
        const localCards: BusinessCard[] = localScannedCards.map(card => ({
          id: card.id,
          name: card.name,
          title: card.title,
          company: card.company,
          email: card.email,
          phone: card.phone,
          website: card.website,
          address: card.address,
          notes: card.notes,
          imageUri: card.imageUrl,
          createdAt: card.scannedAt,
          updatedAt: card.updatedAt,
          deviceId: 'local',
          deviceLabel: 'Local Storage',
        }));
        set({ 
          cards: localCards || [], 
          isLoading: false 
        });
        console.log('✅ Loaded', localCards?.length || 0, 'cards from local storage');
      } catch (localError) {
        console.error('❌ Local storage error:', localError);
        set({ cards: [], isLoading: false });
      }
      
    } catch (error) {
      console.error('❌ Error loading cards:', error);
      set({ 
        error: 'Failed to load cards', 
        isLoading: false 
      });
    }
  },

  syncCards: async () => {
    try {
      const currentUser = auth?.currentUser;
      if (!currentUser || !db) {
        return;
      }

      const cardsQuery = query(
        collection(db, 'businessCards'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(cardsQuery);
      const cards: BusinessCard[] = [];
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        cards.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || Date.now(),
          updatedAt: data.updatedAt?.toDate?.() || Date.now(),
        } as BusinessCard);
      });

      set({ cards, error: null });
      console.log(`Synced ${cards.length} cards from Firestore`);
    } catch (error: any) {
      console.error('Sync cards error:', error);
      set({ error: error.message || 'Failed to sync cards' });
    }
  },

  searchCards: (searchQuery: string): BusinessCard[] => {
    const { cards } = get();
    if (!searchQuery.trim()) {
      return cards;
    }

    const query = searchQuery.toLowerCase().trim();
    return cards.filter(card => {
      return (
        card.name?.toLowerCase().includes(query) ||
        card.company?.toLowerCase().includes(query) ||
        card.title?.toLowerCase().includes(query) ||
        card.email?.toLowerCase().includes(query) ||
        card.phone?.toLowerCase().includes(query) ||
        card.website?.toLowerCase().includes(query) ||
        card.address?.toLowerCase().includes(query)
      );
    });
  },

  checkDuplicate: (card: BusinessCard): BusinessCard | null => {
    const { cards } = get();
    
    // Skip duplicate check for fallback cards
    if (card._fallbackId || card._isFallback) {
      return null;
    }

    return cards.find(existingCard => {
      // Skip fallback cards in comparison
      if (existingCard._fallbackId || existingCard._isFallback) {
        return false;
      }

      // Enhanced duplicate detection with multiple strategies
      
      // Strategy 1: Exact email match (highest confidence)
      if (card.email && existingCard.email && 
          card.email.toLowerCase().trim() === existingCard.email.toLowerCase().trim()) {
        console.log('Duplicate detected: Exact email match');
        return true;
      }

      // Strategy 2: Phone number match (high confidence)
      if (card.phone && existingCard.phone) {
        const normalizedCardPhone = card.phone.replace(/\D/g, '');
        const normalizedExistingPhone = existingCard.phone.replace(/\D/g, '');
        if (normalizedCardPhone && normalizedExistingPhone && 
            normalizedCardPhone === normalizedExistingPhone) {
          console.log('Duplicate detected: Phone number match');
          return true;
        }
      }

      // Strategy 3: Name + Company combination (medium confidence)
      if (card.name && existingCard.name && card.company && existingCard.company) {
        const normalizedCardName = normalizeForComparison(card.name);
        const normalizedExistingName = normalizeForComparison(existingCard.name);
        const normalizedCardCompany = normalizeForComparison(card.company);
        const normalizedExistingCompany = normalizeForComparison(existingCard.company);
        
        if (normalizedCardName === normalizedExistingName && 
            normalizedCardCompany === normalizedExistingCompany) {
          console.log('Duplicate detected: Name + Company match');
          return true;
        }
      }

      // Strategy 4: Fuzzy name match with high similarity (lower confidence)
      if (card.name && existingCard.name) {
        const normalizedCardName = normalizeForComparison(card.name);
        const normalizedExistingName = normalizeForComparison(existingCard.name);
        
        // Check for very similar names (handles typos and minor variations)
        if (normalizedCardName.length > 3 && normalizedExistingName.length > 3) {
          const similarity = calculateSimilarity(normalizedCardName, normalizedExistingName);
          if (similarity > 0.85) { // 85% similarity threshold
            console.log('Duplicate detected: Fuzzy name match', similarity);
            return true;
          }
        }
      }

      // Strategy 5: Website match (if both have websites)
      if (card.website && existingCard.website) {
        const normalizedCardWebsite = card.website.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
        const normalizedExistingWebsite = existingCard.website.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
        
        if (normalizedCardWebsite === normalizedExistingWebsite) {
          console.log('Duplicate detected: Website match');
          return true;
        }
      }

      return false;
    }) || null;
  },

  cleanupFallbackCards: async () => {
    try {
      const { cards } = get();
      const currentUser = auth?.currentUser;
      
      if (!currentUser) return;

      // Remove fallback cards from local state
      const nonFallbackCards = cards.filter(card => !card._fallbackId && !card._isFallback);
      set({ cards: nonFallbackCards });

      // Remove fallback cards from Firestore
      const fallbackCards = cards.filter(card => card._fallbackId || card._isFallback);
      for (const card of fallbackCards) {
        if (db) {
          try {
            await deleteDoc(doc(db, 'businessCards', card.id));
          } catch (error) {
            console.error('Error deleting fallback card:', error);
          }
        }
      }

      console.log(`Cleaned up ${fallbackCards.length} fallback cards`);
    } catch (error) {
      console.error('Error cleaning up fallback cards:', error);
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));

// Helper function to calculate string similarity (Levenshtein distance)
const calculateSimilarity = (str1: string, str2: string): number => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  const maxLength = Math.max(str1.length, str2.length);
  const distance = matrix[str2.length][str1.length];
  return 1 - (distance / maxLength);
};
