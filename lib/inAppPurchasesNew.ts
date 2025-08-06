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
}

// Initialize in-app purchases
let isInitialized = false;
let cachedProducts: ProductInfo[] = [];

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
    console.log('In-app purchases disconnected');
  } catch (error) {
    console.error('Failed to disconnect in-app purchases:', error);
  }
};

/**
 * Check in-app purchase availability
 */
export const checkInAppPurchaseAvailability = async (): Promise<PurchaseStatus> => {
  if (Platform.OS !== 'ios') {
    return {
      isAvailable: false,
      canMakePayments: false,
      products: [],
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

      console.log('Successfully fetched products:', productInfos.length);
      return {
        isAvailable: true,
        canMakePayments: true,
        products: productInfos,
      };
    } else {
      console.error('Failed to fetch products');
      
      return {
        isAvailable: false,
        canMakePayments: true,
        products: [],
      };
    }
  } catch (error) {
    console.error('Error checking in-app purchase availability:', error);
    return {
      isAvailable: false,
      canMakePayments: false,
      products: [],
    };
  }
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

    console.log('Processing in-app purchase for product:', productId);
    
    // First, verify the product is available
    const products = await getProducts({ skus: [productId] });
    
    if (!products || products.length === 0) {
      console.error('Product not available in store');
      return {
        success: false,
        error: 'Product not available in store',
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
 * Validate receipt on server with improved sandbox handling
 */
export const validateReceipt = async (receiptData: string): Promise<ReceiptValidationResult> => {
  try {
    console.log('Validating receipt on server...');
    
    // Send receipt to our server for validation
    const response = await fetch('/api/receipt-validation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receiptData,
        password: process.env.APP_STORE_SHARED_SECRET,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Receipt validation failed:', result);
      return {
        success: false,
        error: result.error || 'Receipt validation failed',
        endpoint: result.endpoint,
      };
    }

    console.log('Receipt validation successful:', {
      environment: result.environment,
      endpoint: result.endpoint,
      subscriptionValid: result.subscription?.isValid,
    });

    return {
      success: true,
      environment: result.environment,
      endpoint: result.endpoint,
      subscription: result.subscription,
    };
    
  } catch (error) {
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
      };
    }
    
    return {
      success: false,
      error: 'Failed to validate receipt',
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