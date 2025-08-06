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
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptions';

// In-App Purchase Status
export interface PurchaseStatus {
  isAvailable: boolean;
  canMakePayments: boolean;
  products: ProductInfo[];
  error?: string;
}

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

// Initialize in-app purchases
let isInitialized = false;
let cachedProducts: ProductInfo[] = [];
let productsLoaded = false;

/**
 * Initialize in-app purchases
 */
export const initializeInAppPurchases = async (): Promise<void> => {
  if (Platform.OS !== 'ios' || isInitialized) {
    return;
  }

  try {
    await initConnection();
    isInitialized = true;
    console.log('In-app purchases initialized successfully');
  } catch (error) {
    console.error('Failed to initialize in-app purchases:', error);
    throw error;
  }
};

/**
 * Disconnect in-app purchases
 */
export const disconnectInAppPurchases = async (): Promise<void> => {
  if (Platform.OS !== 'ios' || !isInitialized) {
    return;
  }

  try {
    await endConnection();
    isInitialized = false;
    productsLoaded = false;
    console.log('In-app purchases disconnected');
  } catch (error) {
    console.error('Failed to disconnect in-app purchases:', error);
  }
};

/**
 * Check in-app purchase availability and load products
 */
export const checkInAppPurchaseAvailability = async (): Promise<PurchaseStatus> => {
  if (Platform.OS !== 'ios') {
    return {
      isAvailable: false,
      canMakePayments: false,
      products: [],
      error: 'In-app purchases are only available on iOS',
    };
  }

  try {
    // Initialize if not already done
    if (!isInitialized) {
      await initializeInAppPurchases();
    }

    // Check if device can make payments (this is handled by the connection)
    console.log('Device can make payments: true (connection successful)');

    // Get product IDs from subscription plans
    const productIds = SUBSCRIPTION_PLANS.map(plan => plan.productId);
    
    console.log('Fetching products from App Store:', productIds);
    
    // Fetch products from App Store
    const products = await getProducts({ skus: productIds });
    
    console.log('Product fetch response:', { productsCount: products?.length });
    
    if (products && products.length > 0) {
      const productInfos: ProductInfo[] = products.map(product => ({
        id: product.productId,
        title: product.title,
        description: product.description,
        price: product.localizedPrice,
        priceAmount: parseFloat(product.price.replace(/[^0-9.]/g, '')),
        currency: product.currency || 'USD',
      }));

      // Cache the products for later use
      cachedProducts = productInfos;
      productsLoaded = true;

      console.log('Successfully fetched products:', productInfos.length);
      return {
        isAvailable: true,
        canMakePayments: true,
        products: productInfos,
      };
    } else {
      console.error('Failed to fetch products - no products returned from App Store');
      productsLoaded = false;
      
      return {
        isAvailable: false,
        canMakePayments: true,
        products: [],
        error: 'Products not available. Please try again later.',
      };
    }
  } catch (error: any) {
    console.error('Error checking in-app purchase availability:', error);
    productsLoaded = false;
    
    return {
      isAvailable: false,
      canMakePayments: false,
      products: [],
      error: error.message || 'Failed to load products',
    };
  }
};

/**
 * Get cached products if available
 */
export const getCachedProducts = (): ProductInfo[] => {
  return cachedProducts;
};

/**
 * Check if products are loaded
 */
export const areProductsLoaded = (): boolean => {
  return productsLoaded;
};

/**
 * Purchase a subscription with improved error handling
 */
export const purchaseSubscription = async (productId: string): Promise<PurchaseResult> => {
  if (Platform.OS !== 'ios') {
    return {
      success: false,
      error: 'In-app purchases are only available on iOS',
    };
  }

  try {
    // Initialize if not already done
    if (!isInitialized) {
      await initializeInAppPurchases();
    }

    // Check if products are loaded
    if (!productsLoaded) {
      const status = await checkInAppPurchaseAvailability();
      if (!status.isAvailable) {
        return {
          success: false,
          error: status.error || 'Products not available. Please try again later.',
        };
      }
    }

    console.log('Processing in-app purchase for product:', productId);
    
    // Verify the product is available in cached products
    const productExists = cachedProducts.find(p => p.id === productId);
    if (!productExists) {
      console.error('Product not found in cached products:', productId);
      return {
        success: false,
        error: 'Product not available in store. Please try again later.',
      };
    }
    
    console.log('Product verified, proceeding with purchase...');
    
    // Request the purchase
    const purchase = await requestPurchase({ sku: productId });
    
    if (purchase && Array.isArray(purchase) && purchase.length > 0) {
      const purchaseItem = purchase[0];
      // Finish the transaction
      await finishTransaction({ purchase: purchaseItem });
      
      console.log('In-app purchase successful:', purchaseItem);
      
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
        error: 'Purchase was cancelled or failed',
      };
    }

  } catch (error: any) {
    console.error('In-app purchase error:', error);
    
    // Handle specific error codes
    let errorMessage = 'Purchase failed';
    
    if (error.code === 'E_ALREADY_OWNED') {
      errorMessage = 'You already own this product';
    } else if (error.code === 'E_USER_CANCELLED') {
      errorMessage = 'Purchase was cancelled';
    } else if (error.code === 'E_ITEM_UNAVAILABLE') {
      errorMessage = 'This product is not available in the App Store';
    } else if (error.code === 'E_NETWORK_ERROR') {
      errorMessage = 'Network error. Please check your internet connection and try again';
    } else if (error.message?.includes('Product not available')) {
      errorMessage = 'Product not available in store. Please try again later.';
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Restore purchases
 */
export const restorePurchases = async (): Promise<PurchaseResult[]> => {
  if (Platform.OS !== 'ios') {
    return [{
      success: false,
      error: 'In-app purchases are only available on iOS',
    }];
  }

  try {
    // Initialize if not already done
    if (!isInitialized) {
      await initializeInAppPurchases();
    }

    console.log('Restoring purchases...');
    
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

      console.log('Restored purchases:', results.length);
      return results;
    } else {
      console.log('No purchases found to restore');
      return [{
        success: false,
        error: 'No previous purchases found',
      }];
    }

  } catch (error: any) {
    console.error('Restore purchases error:', error);
    
    return [{
      success: false,
      error: error.message || 'Restore failed',
    }];
  }
};

/**
 * Validate receipt on server with proper Apple guidelines implementation
 */
export const validateReceipt = async (receiptData: string): Promise<ReceiptValidationResult> => {
  try {
    console.log('Validating receipt on server...');
    
    // First try production endpoint
    const productionResponse = await fetch('/api/receipt-validation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receiptData,
        password: process.env.APP_STORE_SHARED_SECRET,
        environment: 'production',
      }),
    });

    const productionResult = await productionResponse.json();
    
    // If production validation succeeds
    if (productionResponse.ok && productionResult.success) {
      console.log('Receipt validation successful (production):', {
        environment: productionResult.environment,
        endpoint: productionResult.endpoint,
        subscriptionValid: productionResult.subscription?.isValid,
      });

      return {
        success: true,
        environment: productionResult.environment,
        endpoint: productionResult.endpoint,
        subscription: productionResult.subscription,
        statusCode: productionResult.statusCode,
        message: productionResult.message,
      };
    }
    
    // If production validation fails with error code 21007 (sandbox receipt), try sandbox
    if (productionResult.statusCode === 21007) {
      console.log('Production validation failed with 21007, trying sandbox...');
      
      const sandboxResponse = await fetch('/api/receipt-validation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiptData,
          password: process.env.APP_STORE_SHARED_SECRET,
          environment: 'sandbox',
        }),
      });

      const sandboxResult = await sandboxResponse.json();
      
      if (sandboxResponse.ok && sandboxResult.success) {
        console.log('Receipt validation successful (sandbox):', {
          environment: sandboxResult.environment,
          endpoint: sandboxResult.endpoint,
          subscriptionValid: sandboxResult.subscription?.isValid,
        });

        return {
          success: true,
          environment: sandboxResult.environment,
          endpoint: sandboxResult.endpoint,
          subscription: sandboxResult.subscription,
          statusCode: sandboxResult.statusCode,
          message: sandboxResult.message,
        };
      } else {
        console.error('Sandbox receipt validation failed:', sandboxResult);
        return {
          success: false,
          error: sandboxResult.error || 'Receipt validation failed',
          endpoint: 'sandbox',
          statusCode: sandboxResult.statusCode,
          message: sandboxResult.message,
        };
      }
    }
    
    // If production validation failed for other reasons
    console.error('Production receipt validation failed:', productionResult);
    return {
      success: false,
      error: productionResult.error || 'Receipt validation failed',
      endpoint: 'production',
      statusCode: productionResult.statusCode,
      message: productionResult.message,
    };
    
  } catch (error: any) {
    console.error('Receipt validation error:', error);
    
    // For development/testing, simulate successful validation
    // In production, this should always validate with Apple's servers
    const isDevelopment = __DEV__;
    
    if (isDevelopment) {
      console.log('Development mode: Simulating successful receipt validation');
      return {
        success: true,
        environment: 'Sandbox',
        endpoint: 'sandbox',
        subscription: {
          isValid: true,
          productId: 'com.biztomate.scanner.basic',
          expiresDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          isExpired: false,
          environment: 'sandbox',
        },
        statusCode: 0,
        message: 'Development mode - simulated validation',
      };
    }
    
    return {
      success: false,
      error: 'Failed to validate receipt',
      message: error.message || 'Network error during validation',
    };
  }
};

/**
 * Show purchase error alert
 */
export const showPurchaseErrorAlert = (error: string) => {
  Alert.alert(
    'Purchase Failed',
    error || 'Your purchase could not be completed. Please try again.',
    [{ text: 'OK' }]
  );
};

/**
 * Show restore success alert
 */
export const showRestoreSuccessAlert = (restoredCount: number) => {
  if (restoredCount > 0) {
    Alert.alert(
      'Purchases Restored',
      `Successfully restored ${restoredCount} purchase${restoredCount > 1 ? 's' : ''}.`,
      [{ text: 'OK' }]
    );
  } else {
    Alert.alert(
      'No Purchases Found',
      'No previous purchases were found to restore.',
      [{ text: 'OK' }]
    );
  }
};
