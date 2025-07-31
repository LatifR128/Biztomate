import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Receipt {
  id: string;
  productId: string;
  transactionId: string;
  originalTransactionId: string;
  receiptData: string;
  purchaseDate: string;
  expiresDate?: string;
  isValid: boolean;
  environment: 'Production' | 'Sandbox';
  createdAt: number;
  updatedAt: number;
}

interface ReceiptState {
  receipts: Receipt[];
  
  // Actions
  addReceipt: (receipt: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReceipt: (id: string, updates: Partial<Receipt>) => void;
  removeReceipt: (id: string) => void;
  getReceiptByTransactionId: (transactionId: string) => Receipt | undefined;
  getValidReceipts: () => Receipt[];
  getReceiptsByProductId: (productId: string) => Receipt[];
  clearAllReceipts: () => void;
  validateReceipt: (receiptId: string) => Promise<boolean>;
}

export const useReceiptStore = create<ReceiptState>()(
  persist(
    (set, get) => ({
      receipts: [],
      
      addReceipt: (receiptData) => {
        const newReceipt: Receipt = {
          ...receiptData,
          id: `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        set((state) => ({
          receipts: [...state.receipts, newReceipt]
        }));
        
        console.log('Receipt added:', newReceipt.id);
      },
      
      updateReceipt: (id, updates) => {
        set((state) => ({
          receipts: state.receipts.map(receipt => 
            receipt.id === id 
              ? { ...receipt, ...updates, updatedAt: Date.now() }
              : receipt
          )
        }));
      },
      
      removeReceipt: (id) => {
        set((state) => ({
          receipts: state.receipts.filter(receipt => receipt.id !== id)
        }));
      },
      
      getReceiptByTransactionId: (transactionId) => {
        return get().receipts.find(receipt => receipt.transactionId === transactionId);
      },
      
      getValidReceipts: () => {
        const now = new Date();
        return get().receipts.filter(receipt => {
          if (!receipt.isValid) return false;
          if (receipt.expiresDate) {
            return new Date(receipt.expiresDate) > now;
          }
          return true;
        });
      },
      
      getReceiptsByProductId: (productId) => {
        return get().receipts.filter(receipt => receipt.productId === productId);
      },
      
      clearAllReceipts: () => {
        set({ receipts: [] });
      },
      
      validateReceipt: async (receiptId) => {
        const receipt = get().receipts.find(r => r.id === receiptId);
        if (!receipt) return false;
        
        try {
          // In a real implementation, you would validate with your server
          // For now, we'll simulate validation
          const isValid = receipt.isValid && (!receipt.expiresDate || new Date(receipt.expiresDate) > new Date());
          
          // Update receipt validation status
          get().updateReceipt(receiptId, { isValid });
          
          return isValid;
        } catch (error) {
          console.error('Receipt validation error:', error);
          return false;
        }
      },
    }),
    {
      name: 'receipt-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 