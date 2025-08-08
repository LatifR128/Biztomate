import { Hono } from 'hono';

const app = new Hono();

// Apple Receipt Validation Endpoints
const APPLE_PRODUCTION_URL = "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_SANDBOX_URL = "https://sandbox.itunes.apple.com/verifyReceipt";
const APPLE_SHARED_SECRET = "1545f3c5d2c6493da6b799f9602aab94";

// Request timeout (10 seconds)
const REQUEST_TIMEOUT = 10000;

interface AppleReceiptResponse {
  status: number;
  environment: 'Production' | 'Sandbox';
  receipt?: any;
  latest_receipt_info?: any[];
  pending_renewal_info?: any[];
  is_retryable?: boolean;
}

interface SubscriptionInfo {
  isActive: boolean;
  isExpired: boolean;
  productId: string;
  expiresDate: string;
  originalPurchaseDate: string;
  originalTransactionId: string;
  transactionId: string;
  autoRenewStatus: boolean;
  environment: 'Production' | 'Sandbox';
  expirationIntent?: number;
  gracePeriodExpiresDate?: string;
}

interface ValidationResponse {
  success: boolean;
  message: string;
  subscription?: SubscriptionInfo;
  error?: string;
  appleStatus?: number;
  environment?: 'Production' | 'Sandbox';
}

/**
 * Enhanced Apple receipt validation with timeout handling
 * Uses fetch with AbortController for timeout control
 */
async function validateWithApple(url: string, receiptData: string): Promise<AppleReceiptResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    console.log(`🔄 Sending request to ${url.includes('sandbox') ? 'Sandbox' : 'Production'} endpoint...`);
    
    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "User-Agent": "Biztomate-Scanner/1.0"
      },
      body: JSON.stringify({
        "receipt-data": receiptData,
        "password": APPLE_SHARED_SECRET,
        "exclude-old-transactions": false // Include all transactions for complete history
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`📊 Apple response status: ${result.status} (${url.includes('sandbox') ? 'Sandbox' : 'Production'})`);
    
    return result;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - Apple servers took too long to respond');
    }
    
    console.error(`❌ Error calling ${url}:`, error.message);
    throw error;
  }
}

/**
 * Main receipt validation endpoint
 * Handles base64-encoded receipts from iOS apps
 */
app.post("/validateReceipt", async (c) => {
  const startTime = Date.now();
  
  try {
    const body = await c.req.json();
    const { receipt, productId } = body;
    
    // Validate required fields
    if (!receipt) {
      return c.json<ValidationResponse>({ 
        success: false, 
        message: "Missing receipt data",
        error: "Base64-encoded receipt data is required"
      }, 400);
    }

    // Validate base64 format
    if (!isValidBase64(receipt)) {
      return c.json<ValidationResponse>({ 
        success: false, 
        message: "Invalid receipt format",
        error: "Receipt must be valid base64-encoded data"
      }, 400);
    }

    console.log('🔄 Starting receipt validation process...');
    console.log(`📱 Product ID: ${productId || 'not specified'}`);
    console.log(`📄 Receipt length: ${receipt.length} characters`);
    
    let result: AppleReceiptResponse;
    let environment: 'Production' | 'Sandbox' = 'Production';

    // Step 1: Try production endpoint first
    try {
      result = await validateWithApple(APPLE_PRODUCTION_URL, receipt);
      environment = 'Production';
    } catch (error: any) {
      console.log('⚠️ Production endpoint failed:', error.message);
      
      // If production fails, try sandbox
      try {
        result = await validateWithApple(APPLE_SANDBOX_URL, receipt);
        environment = 'Sandbox';
      } catch (sandboxError: any) {
        console.error('❌ Both endpoints failed');
        return c.json<ValidationResponse>({ 
          success: false, 
          message: "Apple receipt validation unavailable",
          error: `Production: ${error.message}, Sandbox: ${sandboxError.message}`
        }, 503);
      }
    }

    // Step 2: Handle status 21007 (production receipt sent to sandbox)
    if (result.status === 21007) {
      console.log('🔄 Status 21007 - Retrying with sandbox endpoint...');
      try {
        result = await validateWithApple(APPLE_SANDBOX_URL, receipt);
        environment = 'Sandbox';
      } catch (error: any) {
        return c.json<ValidationResponse>({ 
          success: false, 
          message: "Failed to validate with sandbox endpoint",
          error: error.message,
          appleStatus: 21007
        }, 400);
      }
    }

    // Step 3: Handle status 21008 (sandbox receipt sent to production)
    if (result.status === 21008) {
      console.log('🔄 Status 21008 - Retrying with production endpoint...');
      try {
        result = await validateWithApple(APPLE_PRODUCTION_URL, receipt);
        environment = 'Production';
      } catch (error: any) {
        return c.json<ValidationResponse>({ 
          success: false, 
          message: "Failed to validate with production endpoint",
          error: error.message,
          appleStatus: 21008
        }, 400);
      }
    }

    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Validation completed in ${processingTime}ms`);

    // Step 4: Process successful validation (status 0)
    if (result.status === 0) {
      const subscription = extractSubscriptionInfo(result, environment);
      
      if (subscription.error) {
        return c.json<ValidationResponse>({ 
          success: false, 
          message: "Failed to extract subscription information",
          error: subscription.error,
          environment
        }, 400);
      }

      console.log(`✅ Subscription ${subscription.isActive ? 'ACTIVE' : 'EXPIRED'} for product ${subscription.productId}`);
      console.log(`📅 Expires: ${subscription.expiresDate}`);

      return c.json<ValidationResponse>({ 
        success: true, 
        message: "Receipt validated successfully", 
        subscription,
        environment
      });
    } else {
      // Step 5: Handle Apple error codes
      const errorMessage = getAppleErrorMessage(result.status);
      
      console.log(`❌ Apple validation failed: ${errorMessage} (${result.status})`);
      
      return c.json<ValidationResponse>({ 
        success: false, 
        message: errorMessage,
        error: `Apple status code: ${result.status}`,
        appleStatus: result.status,
        environment
      }, 400);
    }

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Receipt validation error after ${processingTime}ms:`, error);
    
    return c.json<ValidationResponse>({ 
      success: false, 
      message: "Internal server error during receipt validation",
      error: error.message || "Unknown error occurred"
    }, 500);
  }
});

/**
 * Extract comprehensive subscription information from Apple's response
 * Returns detailed subscription status, dates, and renewal information
 */
function extractSubscriptionInfo(appleResponse: AppleReceiptResponse, environment: 'Production' | 'Sandbox'): SubscriptionInfo & { error?: string } {
  try {
    const latestReceiptInfo = appleResponse.latest_receipt_info;
    const pendingRenewalInfo = appleResponse.pending_renewal_info;
    
    if (!latestReceiptInfo || latestReceiptInfo.length === 0) {
      return {
        error: 'No subscription information found in receipt'
      } as any;
    }

    // Sort by expires_date_ms to get the most recent/current subscription
    const sortedTransactions = latestReceiptInfo.sort((a: any, b: any) => 
      parseInt(b.expires_date_ms) - parseInt(a.expires_date_ms)
    );
    
    const latestTransaction = sortedTransactions[0];
    
    // Parse dates
    const expiresDate = new Date(parseInt(latestTransaction.expires_date_ms));
    const originalPurchaseDate = new Date(parseInt(latestTransaction.original_purchase_date_ms));
    const currentDate = new Date();
    
    // Check if subscription is currently active
    const isExpired = expiresDate < currentDate;
    const isActive = !isExpired;
    
    // Find renewal info for this subscription
    const renewalInfo = pendingRenewalInfo?.find((info: any) => 
      info.original_transaction_id === latestTransaction.original_transaction_id
    );

    // Handle grace period
    let gracePeriodExpiresDate: string | undefined;
    if (renewalInfo?.grace_period_expires_date_ms) {
      const gracePeriodDate = new Date(parseInt(renewalInfo.grace_period_expires_date_ms));
      gracePeriodExpiresDate = gracePeriodDate.toISOString();
      
      // If we're in grace period, subscription is still considered active
      if (gracePeriodDate > currentDate && isExpired) {
        console.log('📱 Subscription in grace period - treating as active');
      }
    }

    const subscriptionInfo: SubscriptionInfo = {
      // Core status
      isActive,
      isExpired,
      
      // Product information
      productId: latestTransaction.product_id,
      
      // Date information (ISO 8601 format)
      expiresDate: expiresDate.toISOString(),
      originalPurchaseDate: originalPurchaseDate.toISOString(),
      
      // Transaction identifiers
      originalTransactionId: latestTransaction.original_transaction_id,
      transactionId: latestTransaction.transaction_id,
      
      // Renewal information
      autoRenewStatus: renewalInfo?.auto_renew_status === '1',
      environment,
      
      // Optional fields
      ...(renewalInfo?.expiration_intent && { expirationIntent: parseInt(renewalInfo.expiration_intent) }),
      ...(gracePeriodExpiresDate && { gracePeriodExpiresDate })
    };

    // Log detailed subscription info
    console.log('📊 Subscription Details:');
    console.log(`   Product: ${subscriptionInfo.productId}`);
    console.log(`   Status: ${subscriptionInfo.isActive ? '✅ ACTIVE' : '❌ EXPIRED'}`);
    console.log(`   Expires: ${subscriptionInfo.expiresDate}`);
    console.log(`   Auto-Renew: ${subscriptionInfo.autoRenewStatus ? '✅ ON' : '❌ OFF'}`);
    console.log(`   Environment: ${subscriptionInfo.environment}`);

    return subscriptionInfo;
    
  } catch (error: any) {
    console.error('❌ Error extracting subscription info:', error);
    return {
      error: `Failed to parse subscription information: ${error.message}`
    } as any;
  }
}

/**
 * Get user-friendly error messages for Apple status codes
 * Reference: https://developer.apple.com/documentation/appstorereceipts/status
 */
function getAppleErrorMessage(status: number): string {
  switch (status) {
    case 21000:
      return 'The request to the App Store was not made using the HTTP POST request method';
    case 21001:
      return 'This status code is no longer sent by the App Store';
    case 21002:
      return 'The receipt data was malformed or missing';
    case 21003:
      return 'The receipt could not be authenticated';
    case 21004:
      return 'The shared secret does not match the one you submitted';
    case 21005:
      return 'The receipt server is temporarily unavailable';
    case 21006:
      return 'This receipt is valid but the subscription has expired';
    case 21007:
      return 'This receipt is from the test environment, but sent to production';
    case 21008:
      return 'This receipt is from the production environment, but sent to test';
    case 21009:
      return 'Internal data access error. Try again later';
    case 21010:
      return 'The user account cannot be found or has been deleted';
    default:
      return `Receipt validation failed with status: ${status}`;
  }
}

/**
 * Validate base64 string format
 */
function isValidBase64(str: string): boolean {
  try {
    // Check if string is valid base64
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
}

/**
 * Health check endpoint for monitoring
 */
app.get("/health", async (c) => {
  return c.json({
    status: "healthy",
    service: "receipt-validation",
    timestamp: new Date().toISOString(),
    version: "2.0.0"
  });
});

/**
 * API documentation endpoint
 */
app.get("/docs", async (c) => {
  return c.json({
    service: "iOS Receipt Validation API",
    version: "2.0.0",
    endpoints: {
      "POST /validateReceipt": {
        description: "Validate iOS App Store receipt",
        body: {
          receipt: "Base64-encoded receipt data (required)",
          productId: "Product identifier (optional)"
        },
        response: {
          success: "boolean",
          message: "string",
          subscription: {
            isActive: "boolean - Whether subscription is currently active",
            isExpired: "boolean - Whether subscription has expired",
            productId: "string - Product identifier",
            expiresDate: "string - ISO 8601 expiration date",
            originalPurchaseDate: "string - ISO 8601 original purchase date",
            originalTransactionId: "string - Apple transaction ID",
            autoRenewStatus: "boolean - Auto-renewal status",
            environment: "string - Production or Sandbox"
          }
        }
      },
      "GET /health": "Service health check",
      "GET /docs": "API documentation"
    },
    examples: {
      request: {
        receipt: "base64-encoded-receipt-data",
        productId: "com.biztomate.scanner.subscription.premium"
      },
      response: {
        success: true,
        message: "Receipt validated successfully",
        subscription: {
          isActive: true,
          isExpired: false,
          productId: "com.biztomate.scanner.subscription.premium",
          expiresDate: "2024-03-15T10:30:00.000Z",
          originalPurchaseDate: "2024-02-15T10:30:00.000Z",
          originalTransactionId: "1000000123456789",
          autoRenewStatus: true,
          environment: "Production"
        }
      }
    }
  });
});

export default app;