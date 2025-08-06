import { useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import {
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  finishTransaction,
  getAvailablePurchases,
  Product,
  Purchase,
  PurchaseError,
  SubscriptionPurchase,
  ProductPurchase
} from 'react-native-iap';
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_ERRORS } from '@/constants/subscriptions';

export interface ProductInfo {
  id: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currency: string;
}

export interface PurchaseResult {
  success: boolean;
  error?: string;
  transactionId?: string;
  productId?: string;
  receiptData?: string;
  originalTransactionId?: string;
  purchaseDate?: string;
  expiresDate?: string;
}

export interface ReceiptValidationResult {
  success: boolean;
  environment?: string;
  endpoint?: string;
  subscription?: {
    isValid: boolean;
    productId?: string;
    expiresDate?: string;
    isExpired: boolean;
    environment?: string;
  };
  error?: string;
  statusCode?: number;
  message?: string;
}

export interface IAPState {
  isInitialized: boolean;
  isLoading: boolean;
  products: ProductInfo[];
  error: string | null;
}

export const useIAP = () => {
  const [state, setState] = useState<IAPState>({
    isInitialized: false,
    isLoading: false,
    products: [],
    error: null,
  });

  // Initialize IAP connection
  const initializeIAP = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      console.log('⚠️ IAP only available on iOS');
      return;
    }

    if (state.isInitialized) {
      console.log('ℹ️ IAP already initialized');
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('🔄 Initializing IAP connection...');
      await initConnection();
      
      setState(prev => ({ 
        ...prev, 
        isInitialized: true, 
        isLoading: false 
      }));
      
      console.log('✅ IAP initialized successfully');
    } catch (error: any) {
      console.error('❌ Failed to initialize IAP:', error);
      setState(prev => ({ 
        ...prev, 
        isInitialized: false,
        isLoading: false,
        error: SUBSCRIPTION_ERRORS.NOT_INITIALIZED
      }));
    }
  }, [state.isInitialized]);

  // Fetch products from App Store
  const fetchProducts = useCallback(async () => {
    if (!state.isInitialized) {
      console.log('🔄 IAP not initialized, initializing first...');
      await initializeIAP();
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Get product IDs from subscription plans
      const productIds = SUBSCRIPTION_PLANS.map(plan => plan.productId);
      
      console.log('🔄 Fetching products from App Store...');
      console.log('📋 Product IDs:', productIds);
      
      const products = await getProducts({ skus: productIds });
      
      console.log('📦 Raw products response:', products);
      console.log('📊 Products count:', products?.length || 0);
      
      if (products && products.length > 0) {
        const productInfos: ProductInfo[] = products.map(product => ({
          id: product.productId,
          title: product.title,
          description: product.description,
          price: product.localizedPrice,
          priceAmount: parseFloat(product.price.replace(/[^0-9.]/g, '')),
          currency: product.currency || 'USD',
        }));

        console.log('✅ Successfully mapped products:', productInfos);

        setState(prev => ({ 
          ...prev, 
          products: productInfos,
          isLoading: false 
        }));
        
        console.log('✅ Successfully fetched products:', productInfos.length);
      } else {
        console.error('❌ No products returned from App Store');
        console.log('🔍 This could mean:');
        console.log('   - Product IDs are incorrect');
        console.log('   - Products are not configured in App Store Connect');
        console.log('   - App is not in review/approved state');
        console.log('   - Network connectivity issues');
        
        setState(prev => ({ 
          ...prev, 
          products: [],
          isLoading: false,
          error: SUBSCRIPTION_ERRORS.PRODUCTS_NOT_AVAILABLE
        }));
      }
    } catch (error: any) {
      console.error('❌ Error fetching products:', error);
      
      setState(prev => ({ 
        ...prev, 
        products: [],
        isLoading: false,
        error: SUBSCRIPTION_ERRORS.NETWORK_ERROR
      }));
    }
  }, [state.isInitialized, initializeIAP]);

  // Purchase a subscription
  const purchaseSubscription = useCallback(async (productId: string): Promise<PurchaseResult> => {
    if (Platform.OS !== 'ios') {
      return {
        success: false,
        error: 'In-app purchases are only available on iOS',
      };
    }

    if (!state.isInitialized) {
      return {
        success: false,
        error: SUBSCRIPTION_ERRORS.NOT_INITIALIZED,
      };
    }

    // Check if product is available
    const product = state.products.find(p => p.id === productId);
    if (!product) {
      console.error('❌ Product not found:', productId);
      console.log('📋 Available products:', state.products.map(p => p.id));
      return {
        success: false,
        error: SUBSCRIPTION_ERRORS.UNAVAILABLE,
      };
    }

    try {
      console.log('🔄 Processing purchase for product:', productId);
      
      // Request the purchase
      const purchase = await requestPurchase({ sku: productId });
      
      if (purchase && Array.isArray(purchase) && purchase.length > 0) {
        const purchaseItem = purchase[0];
        
        // Finish the transaction
        await finishTransaction({ purchase: purchaseItem });
        
        console.log('✅ Purchase successful:', purchaseItem);
        
        return {
          success: true,
          transactionId: purchaseItem.transactionId,
          productId: purchaseItem.productId,
          receiptData: purchaseItem.transactionReceipt,
          originalTransactionId: purchaseItem.originalTransactionIdentifierIOS,
          purchaseDate: String(purchaseItem.transactionDate || Date.now()),
          expiresDate: purchaseItem.expirationDateIos ? String(purchaseItem.expirationDateIos) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        };
      } else {
        return {
          success: false,
          error: SUBSCRIPTION_ERRORS.CANCELLED,
        };
      }
    } catch (error: any) {
      console.error('❌ Purchase error:', error);
      
      // Handle specific error codes
      let errorMessage = SUBSCRIPTION_ERRORS.PURCHASE_FAILED;
      
      if (error.code === 'E_ALREADY_OWNED') {
        errorMessage = SUBSCRIPTION_ERRORS.ALREADY_OWNED;
      } else if (error.code === 'E_USER_CANCELLED') {
        errorMessage = SUBSCRIPTION_ERRORS.CANCELLED;
      } else if (error.code === 'E_ITEM_UNAVAILABLE') {
        errorMessage = SUBSCRIPTION_ERRORS.UNAVAILABLE;
      } else if (error.code === 'E_NETWORK_ERROR') {
        errorMessage = SUBSCRIPTION_ERRORS.NETWORK_ERROR;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [state.isInitialized, state.products]);

  // Restore purchases
  const restorePurchases = useCallback(async (): Promise<PurchaseResult[]> => {
    if (Platform.OS !== 'ios') {
      return [{
        success: false,
        error: 'In-app purchases are only available on iOS',
      }];
    }

    if (!state.isInitialized) {
      return [{
        success: false,
        error: SUBSCRIPTION_ERRORS.NOT_INITIALIZED,
      }];
    }

    try {
      console.log('🔄 Restoring purchases...');
      
      const purchases = await getAvailablePurchases();
      
      if (purchases && purchases.length > 0) {
        const results: PurchaseResult[] = purchases.map(purchase => ({
          success: true,
          transactionId: purchase.transactionId,
          productId: purchase.productId,
          receiptData: purchase.transactionReceipt,
          originalTransactionId: purchase.originalTransactionIdentifierIOS,
          purchaseDate: String(purchase.transactionDate || Date.now()),
          expiresDate: purchase.expirationDateIos ? String(purchase.expirationDateIos) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        }));

        console.log('✅ Restored purchases:', results.length);
        return results;
      } else {
        console.log('ℹ️ No purchases found to restore');
        return [{
          success: false,
          error: 'No previous purchases found',
        }];
      }
    } catch (error: any) {
      console.error('❌ Restore purchases error:', error);
      
      return [{
        success: false,
        error: SUBSCRIPTION_ERRORS.RESTORE_FAILED,
      }];
    }
  }, [state.isInitialized]);

  // Validate receipt on server
  const validateReceipt = useCallback(async (receiptData: string): Promise<ReceiptValidationResult> => {
    try {
      console.log('🔄 Validating receipt on server...');
      
      const response = await fetch('/api/receipt-validation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receipt: receiptData,
          password: '1545f3c5d2c6493da6b799f9602aab94', // Your shared secret
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('✅ Receipt validation successful:', {
          message: result.message,
          data: result.data,
        });

        return {
          success: true,
          environment: result.data?.environment || 'production',
          endpoint: result.data?.environment || 'production',
          subscription: {
            isValid: true,
            productId: result.data?.latest_receipt_info?.[0]?.product_id,
            expiresDate: result.data?.latest_receipt_info?.[0]?.expires_date,
            isExpired: false,
            environment: result.data?.environment || 'production',
          },
          statusCode: result.data?.status || 0,
          message: result.message,
        };
      } else {
        console.error('❌ Receipt validation failed:', result);
        return {
          success: false,
          error: SUBSCRIPTION_ERRORS.VALIDATION_FAILED,
          statusCode: result.data?.status,
          message: result.message,
        };
      }
      
    } catch (error: any) {
      console.error('❌ Receipt validation error:', error);
      
      return {
        success: false,
        error: SUBSCRIPTION_ERRORS.VALIDATION_FAILED,
        message: error.message || 'Network error during validation',
      };
    }
  }, []);

  // Disconnect IAP
  const disconnectIAP = useCallback(async () => {
    if (Platform.OS !== 'ios' || !state.isInitialized) {
      return;
    }

    try {
      await endConnection();
      setState(prev => ({ 
        ...prev, 
        isInitialized: false,
        products: []
      }));
      console.log('✅ IAP disconnected');
    } catch (error) {
      console.error('❌ Failed to disconnect IAP:', error);
    }
  }, [state.isInitialized]);

  // Initialize on mount
  useEffect(() => {
    console.log('🚀 useIAP hook mounted');
    initializeIAP();
    
    // Cleanup on unmount
    return () => {
      console.log('🧹 useIAP hook unmounting');
      disconnectIAP();
    };
  }, []);

  return {
    ...state,
    initializeIAP,
    fetchProducts,
    purchaseSubscription,
    restorePurchases,
    validateReceipt,
    disconnectIAP,
  };
}; 