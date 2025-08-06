import { SubscriptionPlan } from '@/types';

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