import { Platform, Alert } from 'react-native';
import * as InAppPurchases from 'expo-in-app-purchases';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptions';

// In-App Purchase Status
export interface PurchaseStatus {
  isAvailable: boolean;
  canMakePayments: boolean;
  products: Product[];
}

export interface Product {
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
let cachedProducts: Product[] = [];

/**
 * Initialize in-app purchases
 */
export const initializeInAppPurchases = async (): Promise<void> => {
  if (Platform.OS !== 'ios' || isInitialized) {
    return;
  }

  try {
    await InAppPurchases.connectAsync();
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
    await InAppPurchases.disconnectAsync();
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
    const { responseCode, results } = await InAppPurchases.getProductsAsync(productIds);
    
    console.log('Product fetch response:', { responseCode, resultsCount: results?.length });
    
    if (responseCode === InAppPurchases.IAPResponseCode.OK && results && results.length > 0) {
      const products: Product[] = results.map(product => ({
        id: product.productId,
        title: product.title,
        description: product.description,
        price: product.price,
        priceAmount: parseFloat(product.price.replace(/[^0-9.]/g, '')),
        currency: product.priceCurrencyCode || 'USD',
      }));

      // Cache the products for later use
      cachedProducts = products;

      console.log('Successfully fetched products:', products.length);
      return {
        isAvailable: true,
        canMakePayments: true,
        products,
      };
    } else {
      console.error('Failed to fetch products. Response code:', responseCode);
      
      // Handle response code
      const errorMessage = `Products not available (Response code: ${responseCode})`;
      
      console.error('Product fetch error:', errorMessage);
      
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
    const { responseCode: queryResponseCode, results: queryResults } = await InAppPurchases.getProductsAsync([productId]);
    
    if (queryResponseCode !== InAppPurchases.IAPResponseCode.OK || !queryResults || queryResults.length === 0) {
      console.error('Product not available in store. Response code:', queryResponseCode);
      return {
        success: false,
        error: `Product not available in store. Response code: ${queryResponseCode}`,
      };
    }
    
    console.log('Product verified, proceeding with purchase...');
    
    // Set up purchase listener
    let purchaseCompleted = false;
    let purchaseError: string | null = null;
    
    const purchaseListener = (result: any) => {
      console.log('Purchase listener triggered:', result);
      
      if (result.responseCode === InAppPurchases.IAPResponseCode.OK && result.results) {
        purchaseCompleted = true;
        console.log('Purchase successful:', result.results);
      } else {
        purchaseError = `Purchase failed: ${result.errorCode || 'Unknown error'}`;
        console.error('Purchase failed:', result);
      }
    };
    
    InAppPurchases.setPurchaseListener(purchaseListener);
    
    try {
      // Initiate the purchase
      console.log('Initiating purchase for product:', productId);
      await InAppPurchases.purchaseItemAsync(productId);
      
      // Wait for purchase completion or timeout
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds
      
      while (!purchaseCompleted && !purchaseError && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
      
      if (purchaseError) {
        return {
          success: false,
          error: purchaseError,
        };
      }
      
      if (!purchaseCompleted) {
        return {
          success: false,
          error: 'Purchase timeout - please try again',
        };
      }
      
      // For development/testing, simulate a successful purchase
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const receiptData = generateMockReceipt(productId, transactionId);
      
      console.log('In-app purchase successful (simulated)');
      
      return {
        success: true,
        transactionId,
        productId,
        receiptData,
        originalTransactionId: transactionId,
        purchaseDate: new Date().toISOString(),
        expiresDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      };

    } finally {
      // Clean up the listener
      InAppPurchases.setPurchaseListener(() => {});
    }

  } catch (error: any) {
    console.error('In-app purchase error:', error);
    
    // Handle specific error codes
    let errorMessage = 'Purchase failed';
    
    if (error.message?.includes('Product not available')) {
      errorMessage = 'This product is not available in the App Store. Please check your App Store configuration.';
    } else if (error.message?.includes('User cancelled')) {
      errorMessage = 'Purchase was cancelled';
    } else if (error.message?.includes('Payment not allowed')) {
      errorMessage = 'In-app purchases are not allowed on this device';
    } else if (error.message?.includes('Network error')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Generate mock receipt for sandbox testing
 */
const generateMockReceipt = (productId: string, transactionId: string): string => {
  const receipt = {
    receipt_type: "ProductionSandbox",
    bundle_id: "com.biztomate.scanner",
    application_version: "1.3.3",
    original_application_version: "1.3.3",
    in_app: [
      {
        quantity: "1",
        product_id: productId,
        transaction_id: transactionId,
        original_transaction_id: transactionId,
        purchase_date: new Date().toISOString(),
        purchase_date_ms: Date.now().toString(),
        purchase_date_pst: new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"}),
        original_purchase_date: new Date().toISOString(),
        original_purchase_date_ms: Date.now().toString(),
        original_purchase_date_pst: new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"}),
        expires_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        expires_date_ms: (Date.now() + 365 * 24 * 60 * 60 * 1000).toString(),
        expires_date_pst: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleString("en-US", {timeZone: "America/Los_Angeles"}),
        web_order_line_item_id: Math.floor(Math.random() * 1000000).toString(),
        is_trial_period: "false",
        is_in_intro_offer_period: "false",
        subscription_group_identifier: "21482456"
      }
    ],
    version_external_identifier: "0",
    receipt_creation_date: new Date().toISOString(),
    receipt_creation_date_ms: Date.now().toString(),
    receipt_creation_date_pst: new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"}),
    request_date: new Date().toISOString(),
    request_date_ms: Date.now().toString(),
    request_date_pst: new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"}),
    original_purchase_date: new Date().toISOString(),
    original_purchase_date_ms: Date.now().toString(),
    original_purchase_date_pst: new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"}),
    adam_id: 0,
    download_id: 0,
    app_item_id: 0,
    version_bundle_id: "com.biztomate.scanner"
  };

  // Convert to base64 encoded string (simulating Apple's receipt format)
  return Buffer.from(JSON.stringify(receipt)).toString('base64');
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
    
    // For now, simulate restored purchases for testing
    const mockRestoredPurchases: PurchaseResult[] = [
      {
        success: true,
        transactionId: `txn_restore_${Date.now()}`,
        productId: 'com.biztomate.scanner.basic',
        receiptData: generateMockReceipt('com.biztomate.scanner.basic', `txn_restore_${Date.now()}`),
        originalTransactionId: `txn_restore_${Date.now()}`,
        purchaseDate: new Date().toISOString(),
        expiresDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];

    console.log('Restored purchases:', mockRestoredPurchases.length);
    return mockRestoredPurchases;

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
