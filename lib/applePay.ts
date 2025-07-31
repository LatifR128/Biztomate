import { Platform, Alert } from 'react-native';

// Apple Pay Configuration
export const APPLE_PAY_CONFIG = {
  merchantIdentifier: 'merchant.com.biztomate.scanner', // Replace with your actual merchant ID
  supportedNetworks: ['visa', 'mastercard', 'amex', 'discover'] as const,
  countryCode: 'US',
  currencyCode: 'USD',
  merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'] as const,
};

// Payment Request Interface
export interface PaymentRequest {
  label: string;
  amount: number;
  isPending?: boolean;
}

// Apple Pay Status
export interface ApplePayStatus {
  isAvailable: boolean;
  canMakePayments: boolean;
  canMakePaymentsWithActiveCard: boolean;
}

/**
 * Check Apple Pay availability on the device
 */
export const checkApplePayAvailability = async (): Promise<ApplePayStatus> => {
  if (Platform.OS !== 'ios') {
    return {
      isAvailable: false,
      canMakePayments: false,
      canMakePaymentsWithActiveCard: false,
    };
  }

  try {
    // For now, we'll simulate Apple Pay availability
    // In a real implementation, you would use the actual expo-apple-pay API
    return {
      isAvailable: true,
      canMakePayments: true,
      canMakePaymentsWithActiveCard: true,
    };
  } catch (error) {
    console.error('Error checking Apple Pay availability:', error);
    return {
      isAvailable: false,
      canMakePayments: false,
      canMakePaymentsWithActiveCard: false,
    };
  }
};

/**
 * Create Apple Pay payment request
 */
export const createApplePayRequest = (
  paymentItems: PaymentRequest[],
  totalAmount: number,
      merchantName: string = 'Biztomate'
) => {
  const paymentSummaryItems = [
    ...paymentItems.map(item => ({
      label: item.label,
      amount: item.amount,
      isPending: item.isPending || false,
    })),
    {
      label: merchantName,
      amount: totalAmount,
      isPending: false,
    },
  ];

  return {
    merchantIdentifier: APPLE_PAY_CONFIG.merchantIdentifier,
    supportedNetworks: APPLE_PAY_CONFIG.supportedNetworks,
    merchantCapabilities: APPLE_PAY_CONFIG.merchantCapabilities,
    countryCode: APPLE_PAY_CONFIG.countryCode,
    currencyCode: APPLE_PAY_CONFIG.currencyCode,
    paymentSummaryItems,
    requiredBillingContactFields: ['emailAddress', 'name', 'phoneNumber', 'postalAddress'],
    requiredShippingContactFields: ['emailAddress', 'name', 'phoneNumber', 'postalAddress'],
    shippingType: 'delivery',
    applicationData: 'biztomate-scanner-payment',
  };
};

/**
 * Process Apple Pay payment with Stripe integration
 */
export const processApplePayWithStripe = async (
  paymentItems: PaymentRequest[],
  totalAmount: number,
  stripeClientSecret: string
): Promise<{ success: boolean; error?: string; paymentToken?: string }> => {
  try {
    // Check Apple Pay availability
    const applePayStatus = await checkApplePayAvailability();
    
    if (!applePayStatus.canMakePayments) {
      return {
        success: false,
        error: 'Apple Pay is not available on this device',
      };
    }

    if (!applePayStatus.canMakePaymentsWithActiveCard) {
      return {
        success: false,
        error: 'No payment cards are available for Apple Pay',
      };
    }

    // Create payment request
    const paymentRequest = createApplePayRequest(paymentItems, totalAmount);

    // Simulate Apple Pay payment processing
    // In a real implementation, you would use expo-apple-pay here
    console.log('Processing Apple Pay payment with request:', paymentRequest);
    
    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate success (95% success rate)
    const success = Math.random() > 0.05;
    
    if (success) {
      // Generate a mock payment token
      const paymentToken = `tok_apple_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Apple Pay payment successful, token:', paymentToken);

      return {
        success: true,
        paymentToken,
      };
    } else {
      return {
        success: false,
        error: 'Payment was declined',
      };
    }

  } catch (error: any) {
    console.error('Apple Pay processing error:', error);
    
    return {
      success: false,
      error: error.message || 'Payment failed',
    };
  }
};

/**
 * Show Apple Pay setup alert
 */
export const showApplePaySetupAlert = () => {
  Alert.alert(
    'Apple Pay Not Available',
    'To use Apple Pay, please add a payment card to your Apple Wallet in Settings > Wallet & Apple Pay.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => {
        // In a real app, you might want to open Settings
        console.log('Open Apple Pay settings');
      }},
    ]
  );
};

/**
 * Format amount for Apple Pay (in cents)
 */
export const formatAmountForApplePay = (amount: number): number => {
  // Apple Pay expects amounts in the smallest currency unit (cents for USD)
  return Math.round(amount * 100);
};

/**
 * Validate Apple Pay configuration
 */
export const validateApplePayConfig = (): boolean => {
  const requiredFields = [
    'merchantIdentifier',
    'supportedNetworks',
    'countryCode',
    'currencyCode',
  ];

  for (const field of requiredFields) {
    if (!APPLE_PAY_CONFIG[field as keyof typeof APPLE_PAY_CONFIG]) {
      console.error(`Missing required Apple Pay config: ${field}`);
      return false;
    }
  }

  return true;
}; 