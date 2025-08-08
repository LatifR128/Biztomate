import { SubscriptionPlan } from '@/types';

// IAP Configuration
export const IAP_CONFIG = {
  // Apple App Store
  APPLE_SHARED_SECRET: '1545f3c5d2c6493da6b799f9602aab94',
  APPLE_PRODUCTION_URL: 'https://buy.itunes.apple.com/verifyReceipt',
  APPLE_SANDBOX_URL: 'https://sandbox.itunes.apple.com/verifyReceipt',
  
  // App Store Connect API
  APP_STORE_CONNECT_API_KEY_ID: 'ASCR2B57BH',
  APP_STORE_CONNECT_ISSUER_ID: '970814e0-d3eb-4319-9b3f-83982733ca3c',
  
  // In-App Purchase ID
  IN_APP_PURCHASE_ID: '772Z7DYA7W',
  
  // Subscription Group Bundle ID - CRITICAL for IAP connection
  SUBSCRIPTION_GROUP_BUNDLE_ID: '21734048',
  
  // Backend validation
  BACKEND_VALIDATION_URL: 'https://toolkit.rork.com/receipt-validation/validateReceipt',
  
  // Android (if needed)
  ANDROID_ACCESS_TOKEN: 'your-access-token', // Replace when implementing Android
  
  // Bundle identifiers
  IOS_BUNDLE_ID: 'com.biztomate.scanner',
  ANDROID_PACKAGE_NAME: 'com.biztomate.scanner',
};

// Real product IDs from App Store Connect - these should match your actual configured products
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$19.99 CAD/year',
    cardsLimit: 100,
    productId: 'com.biztomate.scanner.subscription.basic', // NEW subscription product ID
    features: ['100 Cards', 'Advanced OCR', 'Export to Sheets', 'Email Support']
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '$24.99 CAD/year',
    cardsLimit: 250,
    productId: 'com.biztomate.scanner.subscription.standard', // NEW subscription product ID
    features: ['250 Cards', 'Advanced OCR', 'Export to Sheets', 'Priority Support']
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$36.99 CAD/year',
    cardsLimit: 500,
    productId: 'com.biztomate.scanner.subscription.premium', // NEW subscription product ID
    features: ['500 Cards', 'Advanced OCR', 'All Export Options', 'Premium Support']
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: '$49.99 CAD/year',
    cardsLimit: Infinity,
    productId: 'com.biztomate.scanner.subscription.unlimited', // NEW subscription product ID
    features: ['Unlimited Cards', 'Advanced OCR', 'All Export Options', 'Premium Support', 'Team Sharing']
  }
];

export const FREE_TRIAL_DAYS = 7;

// Fallback product IDs for development/testing
export const FALLBACK_PRODUCT_IDS = {
  basic: 'com.biztomate.scanner.subscription.basic',
  standard: 'com.biztomate.scanner.subscription.standard', 
  premium: 'com.biztomate.scanner.subscription.premium',
  unlimited: 'com.biztomate.scanner.subscription.unlimited'
};

// Error messages for different scenarios
export const SUBSCRIPTION_ERRORS = {
  PRODUCTS_NOT_AVAILABLE: 'Subscription products are not available. Please try again later.',
  PURCHASE_FAILED: 'Purchase failed. Please check your payment method and try again.',
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  ALREADY_OWNED: 'You already own this subscription.',
  CANCELLED: 'Purchase was cancelled.',
  UNAVAILABLE: 'This product is not available in the App Store.',
  NOT_INITIALIZED: 'In-app purchases are not initialized.',
  VALIDATION_FAILED: 'Receipt validation failed. Please contact support.',
  RESTORE_FAILED: 'Failed to restore purchases. Please try again.'
};

// Canadian pricing configuration - same amounts, CAD currency
export const CANADIAN_PRICING = {
  basic: {
    price: 19.99,
    currency: 'CAD',
    displayPrice: '$19.99 CAD/year'
  },
  standard: {
    price: 24.99,
    currency: 'CAD',
    displayPrice: '$24.99 CAD/year'
  },
  premium: {
    price: 36.99,
    currency: 'CAD',
    displayPrice: '$36.99 CAD/year'
  },
  unlimited: {
    price: 49.99,
    currency: 'CAD',
    displayPrice: '$49.99 CAD/year'
  }
};