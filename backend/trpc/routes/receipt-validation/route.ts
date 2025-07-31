import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono();

// Receipt validation schema
const ReceiptValidationSchema = z.object({
  receiptData: z.string(),
  password: z.string().optional(), // App-specific shared secret
});

// App Store receipt validation endpoints
const PRODUCTION_URL = 'https://buy.itunes.apple.com/verifyReceipt';
const SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';

// App-specific shared secret (should be stored securely in production)
const APP_SHARED_SECRET = process.env.APP_STORE_SHARED_SECRET || 'your-app-specific-shared-secret';

interface ReceiptValidationResponse {
  status: number;
  environment: string;
  receipt: {
    in_app: Array<{
      product_id: string;
      transaction_id: string;
      original_transaction_id: string;
      purchase_date: string;
      expires_date?: string;
      cancellation_date?: string;
    }>;
  };
  latest_receipt_info?: Array<{
    product_id: string;
    transaction_id: string;
    original_transaction_id: string;
    purchase_date: string;
    expires_date?: string;
    cancellation_date?: string;
  }>;
}

/**
 * Validate receipt with Apple's servers
 * First tries production, then sandbox if needed
 */
async function validateReceiptWithApple(
  receiptData: string,
  password?: string
): Promise<{ result: ReceiptValidationResponse; endpoint: string }> {
  const requestBody = {
    'receipt-data': receiptData,
    password: password || APP_SHARED_SECRET,
    'exclude-old-transactions': true,
  };

  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Starting receipt validation...`);

  try {
    // First try production environment
    console.log(`[${requestId}] Attempting production validation...`);
    const productionResponse = await fetch(PRODUCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const productionResult = await productionResponse.json();
    console.log(`[${requestId}] Production response status:`, productionResult.status);

    // If production validation succeeds, return the result
    if (productionResult.status === 0) {
      console.log(`[${requestId}] Production validation successful`);
      return { result: productionResult, endpoint: 'production' };
    }

    // If production validation fails with sandbox receipt error, try sandbox
    if (productionResult.status === 21007) {
      console.log(`[${requestId}] Sandbox receipt detected, trying sandbox validation...`);
      
      const sandboxResponse = await fetch(SANDBOX_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const sandboxResult = await sandboxResponse.json();
      console.log(`[${requestId}] Sandbox response status:`, sandboxResult.status);

      if (sandboxResult.status === 0) {
        console.log(`[${requestId}] Sandbox validation successful`);
        return { result: sandboxResult, endpoint: 'sandbox' };
      } else {
        console.log(`[${requestId}] Sandbox validation failed with status:`, sandboxResult.status);
        return { result: sandboxResult, endpoint: 'sandbox' };
      }
    }

    // If production validation fails with other error, return the error
    console.log(`[${requestId}] Production validation failed with status:`, productionResult.status);
    return { result: productionResult, endpoint: 'production' };

  } catch (error) {
    console.error(`[${requestId}] Receipt validation error:`, error);
    throw new Error('Failed to validate receipt with Apple');
  }
}

/**
 * Validate subscription status
 */
function validateSubscriptionStatus(
  receiptInfo: ReceiptValidationResponse['latest_receipt_info']
): {
  isValid: boolean;
  productId?: string;
  expiresDate?: string;
  isExpired: boolean;
  environment?: string;
} {
  if (!receiptInfo || receiptInfo.length === 0) {
    return { isValid: false, isExpired: true };
  }

  // Get the most recent transaction
  const latestTransaction = receiptInfo[0];
  const now = new Date();
  const expiresDate = latestTransaction.expires_date 
    ? new Date(latestTransaction.expires_date) 
    : null;

  const isExpired = expiresDate ? expiresDate < now : true;

  return {
    isValid: !isExpired,
    productId: latestTransaction.product_id,
    expiresDate: latestTransaction.expires_date,
    isExpired,
  };
}

/**
 * Parse and validate receipt data format
 */
function parseReceiptData(receiptData: string): any {
  try {
    // Decode base64 receipt data
    const decodedData = Buffer.from(receiptData, 'base64').toString('utf-8');
    const receipt = JSON.parse(decodedData);
    
    // Validate receipt structure
    if (!receipt.bundle_id || !receipt.in_app || !Array.isArray(receipt.in_app)) {
      throw new Error('Invalid receipt format');
    }
    
    return receipt;
  } catch (error) {
    console.error('Error parsing receipt data:', error);
    throw new Error('Invalid receipt data format');
  }
}

/**
 * Get all available subscription product IDs
 */
function getAvailableProductIds(): string[] {
  return [
    'com.biztomate.scanner.basic',
    'com.biztomate.scanner.standard',
    'com.biztomate.scanner.premium',
    'com.biztomate.scanner.unlimited'
  ];
}

// POST /api/receipt-validation
app.post('/api/receipt-validation', async (c) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Receipt validation request received`);

  try {
    const body = await c.req.json();
    const { receiptData, password } = ReceiptValidationSchema.parse(body);

    // Parse and validate receipt format
    const parsedReceipt = parseReceiptData(receiptData);
    console.log(`[${requestId}] Receipt parsed successfully for bundle:`, parsedReceipt.bundle_id);

    // Validate receipt with Apple
    const { result: validationResult, endpoint } = await validateReceiptWithApple(receiptData, password);

    // Check if validation was successful
    if (validationResult.status !== 0) {
      console.error(`[${requestId}] Receipt validation failed with status:`, validationResult.status, 'from endpoint:', endpoint);
      return c.json({
        success: false,
        error: `Receipt validation failed with status: ${validationResult.status}`,
        status: validationResult.status,
        endpoint: endpoint,
        timestamp: new Date().toISOString(),
      }, 400);
    }

    // Validate subscription status
    const subscriptionStatus = validateSubscriptionStatus(
      validationResult.latest_receipt_info
    );

    console.log(`[${requestId}] Receipt validation successful:`, {
      endpoint: endpoint,
      environment: validationResult.environment,
      subscriptionValid: subscriptionStatus.isValid,
      productId: subscriptionStatus.productId,
      isExpired: subscriptionStatus.isExpired,
    });

    return c.json({
      success: true,
      environment: validationResult.environment,
      endpoint: endpoint,
      subscription: {
        ...subscriptionStatus,
        environment: endpoint,
      },
      receipt: validationResult.receipt,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error(`[${requestId}] Receipt validation error:`, error);
    
    if (error instanceof z.ZodError) {
      return c.json({
        success: false,
        error: 'Invalid request data',
        details: error.issues,
        timestamp: new Date().toISOString(),
      }, 400);
    }

    return c.json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// GET /api/receipt-validation/products
app.get('/api/receipt-validation/products', (c) => {
  const products = getAvailableProductIds();
  console.log('Available products requested:', products);
  
  return c.json({
    success: true,
    products: products,
    count: products.length,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/receipt-validation/health
app.get('/api/receipt-validation/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.3.2',
    endpoints: {
      production: PRODUCTION_URL,
      sandbox: SANDBOX_URL,
    },
    availableProducts: getAvailableProductIds(),
  });
});

export default app;
