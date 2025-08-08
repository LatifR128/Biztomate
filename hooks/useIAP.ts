import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import { 
  initConnection, 
  getProducts, 
  requestPurchase, 
  finishTransaction,
  getAvailablePurchases,
  Purchase,
  Product,
  SubscriptionPurchase,
  acknowledgePurchaseAndroid,
  validateReceiptIos,
  validateReceiptAndroid
} from 'react-native-iap';
import { useUserStore } from '@/store/userStore';
import { useReceiptStore } from '@/store/receiptStore';
import { SUBSCRIPTION_PLANS, IAP_CONFIG } from '@/constants/subscriptions';

interface IAPState {
  isInitialized: boolean;
  isLoading: boolean;
  products: Product[];
  error: string | null;
  isDevelopmentMode?: boolean;
}

interface PurchaseResult {
  success: boolean;
  productId?: string;
  transactionId?: string;
  originalTransactionId?: string;
  receiptData?: string;
  purchaseDate?: string;
  expiresDate?: string;
  error?: string;
}

interface ValidationResult {
  success: boolean;
  environment?: string;
  subscription?: {
    isActive: boolean;
    isExpired: boolean;
    productId: string;
    expiresDate: string;
    originalPurchaseDate: string;
    originalTransactionId: string;
    autoRenewStatus: boolean;
    environment: 'Production' | 'Sandbox';
  };
  error?: string;
}

interface RestoreResult {
  success: boolean;
  productId?: string;
  transactionId?: string;
  error?: string;
  restoredCount?: number;
}

interface IAPActions {
  fetchProducts: () => Promise<void>;
  purchaseSubscription: (productId: string) => Promise<PurchaseResult>;
  validateReceipt: (receipt: string, productId: string) => Promise<ValidationResult>;
  restorePurchases: () => Promise<RestoreResult[]>;
}

export const useIAP = (): IAPState & IAPActions => {
  const [state, setState] = useState<IAPState>({
    isInitialized: false,
    isLoading: false,
    products: [],
    error: null,
    isDevelopmentMode: __DEV__ && Platform.OS === 'web',
  });

  const { updateSubscription } = useUserStore();
  const { addReceipt } = useReceiptStore();

  // Initialize IAP connection
  useEffect(() => {
    initializeIAP();
  }, []);

  const initializeIAP = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('🔧 Initializing IAP connection...');
      
      // Allow all platforms for development and testing
      if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
        console.log('⚠️ IAP not supported on this platform, using mock mode');
      }
      
      await initConnection();
      console.log('✅ IAP connection initialized successfully');
      setState(prev => ({ 
        ...prev, 
        isInitialized: true, 
        isLoading: false 
      }));
      
      // Fetch products after initialization
      await fetchProducts();
    } catch (error: any) {
      console.error('❌ IAP initialization error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Failed to initialize IAP' 
      }));
    }
  };

  const fetchProducts = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('🛍️ Fetching IAP products...');
      console.log('🔗 Subscription Group Bundle ID:', IAP_CONFIG.SUBSCRIPTION_GROUP_BUNDLE_ID);
      
      // Get product IDs from subscription plans
      const productIds = SUBSCRIPTION_PLANS.map(plan => plan.productId);
      console.log('📋 Product IDs to fetch:', productIds);
      
      // Enhanced product fetching with subscription group context
      const products = await getProducts({ 
        skus: productIds
      });
      console.log('📦 Fetched products:', products);
      
      if (!products || products.length === 0) {
        console.log('⚠️ No products found - this may be due to App Store Connect approval pending or network issues');
        
        // In development or when products unavailable, create mock products for testing
        if (__DEV__ || Platform.OS === 'web') {
          console.log('🛠️ Creating mock products for development/testing');
          const mockProducts = SUBSCRIPTION_PLANS.map(plan => ({
            productId: plan.productId,
            title: plan.name,
            description: `${plan.name} Subscription`,
            price: plan.price,
            localizedPrice: plan.price,
            currency: 'CAD'
          })) as Product[];
          
          setState(prev => ({ 
            ...prev, 
            products: mockProducts, 
            isLoading: false,
            isDevelopmentMode: true,
            error: null
          }));
          return;
        }
        
        // Production fallback - show error but don't crash
        setState(prev => ({ 
          ...prev, 
          products: [], 
          isLoading: false,
          error: 'Products temporarily unavailable. Please try again later.'
        }));
        return;
      }
      
      setState(prev => ({ 
        ...prev, 
        products, 
        isLoading: false 
      }));
      
      console.log('✅ Products loaded successfully:', products.length);
    } catch (error: any) {
      console.error('❌ Error fetching products:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Failed to fetch products' 
      }));
    }
  };

  const purchaseSubscription = async (productId: string): Promise<PurchaseResult> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('💳 Starting purchase for product:', productId);
      
      // Check if we have the product
      const product = state.products.find(p => p.productId === productId);
      if (!product) {
        // Graceful fallback - try to fetch products again
        console.log('⚠️ Product not found locally, attempting to refresh products...');
        await fetchProducts();
        
        // Check again after refresh
        const refreshedProduct = state.products.find(p => p.productId === productId);
        if (!refreshedProduct) {
          throw new Error('Product temporarily unavailable. This may be due to App Store Connect configuration. Please try again later or contact support.');
        }
      }
      
      console.log('✅ Product found, requesting purchase...');
      
      // Request the purchase - this will trigger Apple's native purchase flow
      // This is where the user will see the Apple authentication dialog
      const purchase = await requestPurchase({ sku: productId });
      console.log('📱 Purchase initiated:', purchase);
      
      if (!purchase || (Array.isArray(purchase) && purchase.length === 0)) {
        throw new Error('Purchase was cancelled or failed');
      }
      
      const purchaseItem = Array.isArray(purchase) ? purchase[0] : purchase;
      
      console.log('✅ Purchase successful, finishing transaction...');
      
      // Finish transaction
      await finishTransaction({ purchase: purchaseItem });
      console.log('✅ Transaction finished');
      
      // Validate receipt with enhanced backend
      const validationResult = await validateReceipt(purchaseItem.transactionReceipt || '', productId);
      
      if (validationResult.success && validationResult.subscription) {
        console.log('✅ Receipt validation successful');
        
        // Update user subscription
        const plan = SUBSCRIPTION_PLANS.find(p => p.productId === productId);
        if (plan) {
          await updateSubscription(plan.id as any);
          console.log('✅ Subscription updated to:', plan.id);
        }
        
        // Save receipt with enhanced data
        addReceipt({
          productId,
          transactionId: purchaseItem.transactionId || '',
          originalTransactionId: purchaseItem.originalTransactionIdentifierIOS || '',
          receiptData: purchaseItem.transactionReceipt || '',
          purchaseDate: validationResult.subscription.originalPurchaseDate,
          isValid: true,
          environment: validationResult.subscription.environment,
        });
        
        setState(prev => ({ ...prev, isLoading: false }));
        
        return {
          success: true,
          productId,
          transactionId: purchaseItem.transactionId || '',
          originalTransactionId: purchaseItem.originalTransactionIdentifierIOS || '',
          receiptData: purchaseItem.transactionReceipt || '',
          purchaseDate: validationResult.subscription.originalPurchaseDate,
          expiresDate: validationResult.subscription.expiresDate,
        };
      } else {
        throw new Error(validationResult.error || 'Receipt validation failed');
      }
      
    } catch (error: any) {
      console.error('❌ Purchase error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Purchase failed' 
      }));
      
      return {
        success: false,
        error: error.message || 'Purchase failed'
      };
    }
  };

  const validateReceiptWithServer = async (receipt: string, productId: string): Promise<ValidationResult> => {
    try {
      console.log('🔍 Validating receipt with enhanced server...');
      
      // Send receipt to your backend for validation with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch(IAP_CONFIG.BACKEND_VALIDATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receipt,
          productId,
          platform: Platform.OS,
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server validation failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.subscription) {
        console.log('✅ Enhanced server validation successful');
        console.log(`📊 Subscription Status: ${result.subscription.isActive ? 'ACTIVE' : 'EXPIRED'}`);
        console.log(`📅 Expires: ${result.subscription.expiresDate}`);
        console.log(`🏷️ Product: ${result.subscription.productId}`);
        console.log(`🌍 Environment: ${result.subscription.environment}`);
        
        return {
          success: true,
          environment: result.subscription.environment,
          subscription: result.subscription
        };
      } else {
        console.log('❌ Enhanced server validation failed:', result.error);
        return {
          success: false,
          error: result.error || result.message || 'Validation failed'
        };
      }
    } catch (error: any) {
      console.error('❌ Enhanced server validation error:', error);
      throw error;
    }
  };

  const validateReceipt = async (receipt: string, productId: string): Promise<ValidationResult> => {
    try {
      console.log('🔍 Validating receipt for product:', productId);
      
      // First try server-side validation with timeout and fallback
      try {
        const serverValidation = await Promise.race([
          validateReceiptWithServer(receipt, productId),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Server validation timeout')), 10000)
          )
        ]) as ValidationResult;
        
        if (serverValidation.success) {
          console.log('✅ Server validation successful');
          return serverValidation;
        } else {
          console.log('❌ Server validation failed:', serverValidation.error);
        }
      } catch (serverError) {
        console.log('⚠️ Server validation unavailable, using local validation:', serverError);
      }
      
      // Fallback to local validation
      if (Platform.OS === 'ios') {
        console.log('🔍 Using iOS local validation...');
        
        // iOS receipt validation
        const validationResult = await validateReceiptIos({
          receiptBody: {
            'receipt-data': receipt,
            'password': IAP_CONFIG.APPLE_SHARED_SECRET,
          },
        });
        
        console.log('📊 iOS validation result:', validationResult);
        return {
          success: validationResult.valid === true,
          environment: validationResult.environment || 'Production'
        };
      } else if (Platform.OS === 'android') {
        console.log('🔍 Using Android local validation...');
        
        // Android receipt validation
        const validationResult = await validateReceiptAndroid({
          packageName: IAP_CONFIG.ANDROID_PACKAGE_NAME,
          productId,
          productToken: receipt,
          accessToken: IAP_CONFIG.ANDROID_ACCESS_TOKEN,
        });
        
        console.log('📊 Android validation result:', validationResult);
        return {
          success: validationResult.valid === true,
          environment: 'Production'
        };
      }
      
      return { success: false, error: 'Platform not supported' };
    } catch (error: any) {
      console.error('❌ Receipt validation error:', error);
      return { success: false, error: error.message || 'Validation failed' };
    }
  };

  const restorePurchases = async (): Promise<RestoreResult[]> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('🔄 Restoring purchases...');
      
      // ✅ FIXED: Get available purchases from App Store
      const availablePurchases = await getAvailablePurchases();
      console.log('📱 Available purchases:', availablePurchases);
      
      if (!availablePurchases || availablePurchases.length === 0) {
        setState(prev => ({ ...prev, isLoading: false }));
        
        Alert.alert(
          'No Purchases Found',
          'No previous purchases were found to restore.',
          [{ text: 'OK' }]
        );
        
        return [{ success: true, restoredCount: 0 }];
      }
      
      const restoredPurchases: RestoreResult[] = [];
      
      // Process each available purchase
      for (const purchase of availablePurchases) {
        try {
          console.log('🔍 Processing purchase:', purchase.productId);
          
          // Validate the receipt with enhanced backend
          const validationResult = await validateReceipt(
            purchase.transactionReceipt || '', 
            purchase.productId
          );
          
          if (validationResult.success && validationResult.subscription?.isActive) {
            console.log('✅ Purchase restored successfully:', purchase.productId);
            
            // Update user subscription
            const plan = SUBSCRIPTION_PLANS.find(p => p.productId === purchase.productId);
            if (plan) {
              await updateSubscription(plan.id as any);
              console.log('✅ Subscription updated to:', plan.id);
            }
            
            // Save receipt with enhanced data
            if (validationResult.subscription) {
              addReceipt({
                productId: purchase.productId,
                transactionId: purchase.transactionId || '',
                originalTransactionId: purchase.originalTransactionIdentifierIOS || '',
                receiptData: purchase.transactionReceipt || '',
                purchaseDate: validationResult.subscription.originalPurchaseDate,
                isValid: true,
                environment: validationResult.subscription.environment,
              });
            }
            
            restoredPurchases.push({
              success: true,
              productId: purchase.productId,
              transactionId: purchase.transactionId || ''
            });
          } else {
            console.log('❌ Purchase validation failed or expired:', purchase.productId);
            restoredPurchases.push({
              success: false,
              productId: purchase.productId,
              error: validationResult.error || 'Subscription expired'
            });
          }
        } catch (error: any) {
          console.error('❌ Error processing purchase:', purchase.productId, error);
          restoredPurchases.push({
            success: false,
            productId: purchase.productId,
            error: error.message || 'Processing failed'
          });
        }
      }
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      // ✅ FIXED: Show proper success/error message based on actual results
      const successfulRestores = restoredPurchases.filter(r => r.success);
      
      if (successfulRestores.length > 0) {
        Alert.alert(
          'Purchases Restored',
          `Successfully restored ${successfulRestores.length} active subscription(s).`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Restore Failed', 
          'No valid active subscriptions could be restored. Please try again or contact support.',
          [{ text: 'OK' }]
        );
      }
      
      return restoredPurchases;
      
    } catch (error: any) {
      console.error('❌ Restore purchases error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Failed to restore purchases' 
      }));
      
      // ✅ FIXED: Show proper error message
      Alert.alert(
        'Restore Failed',
        `Failed to restore purchases: ${error.message || 'Unknown error'}. Please check your internet connection and try again.`,
        [{ text: 'OK' }]
      );
      
      return [{ success: false, error: error.message || 'Failed to restore purchases' }];
    }
  };

  return {
    ...state,
    fetchProducts,
    purchaseSubscription,
    validateReceipt,
    restorePurchases,
  };
};