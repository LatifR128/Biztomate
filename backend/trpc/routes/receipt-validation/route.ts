import { Hono } from 'hono';

const app = new Hono();

const APPLE_PRODUCTION_URL = "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_SANDBOX_URL = "https://sandbox.itunes.apple.com/verifyReceipt";
const APPLE_SHARED_SECRET = "1545f3c5d2c6493da6b799f9602aab94"; // Your actual shared secret

async function validateWithApple(url: string, receiptData: string) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      "receipt-data": receiptData,
      "password": APPLE_SHARED_SECRET,
      "exclude-old-transactions": true
    }),
  });
  return response.json();
}

app.post("/validateReceipt", async (c) => {
  const body = await c.req.json();
  const { receipt } = body;
  
  if (!receipt) {
    return c.json({ 
      success: false, 
      message: "Missing receipt data",
      error: "Receipt data is required"
    }, 400);
  }

  try {
    console.log('🔄 Validating receipt with Apple...');
    
    // First try production endpoint
    let result = await validateWithApple(APPLE_PRODUCTION_URL, receipt);
    
    // If status is 21007, retry with sandbox endpoint
    if (result.status === 21007) {
      console.log('🔄 Production failed with 21007, trying sandbox...');
      result = await validateWithApple(APPLE_SANDBOX_URL, receipt);
    }
    
    console.log('📊 Apple validation result status:', result.status);
    
    if (result.status === 0) {
      // Success - receipt is valid
      const subscription = extractSubscriptionInfo(result);
      
      return c.json({ 
        success: true, 
        message: "Receipt validated successfully", 
        data: {
          ...result,
          environment: result.environment || 'production',
          subscription
        }
      });
    } else {
      // Handle specific Apple error codes
      const errorMessage = getAppleErrorMessage(result.status);
      
      return c.json({ 
        success: false, 
        message: errorMessage,
        error: errorMessage,
        data: result 
      }, 400);
    }
  } catch (error) {
    console.error("❌ Receipt validation error:", error);
    return c.json({ 
      success: false, 
      message: "Internal server error during receipt validation",
      error: "Network error during validation"
    }, 500);
  }
});

/**
 * Extract subscription information from Apple's response
 */
function extractSubscriptionInfo(appleResponse: any) {
  try {
    const latestReceiptInfo = appleResponse.latest_receipt_info;
    const pendingRenewalInfo = appleResponse.pending_renewal_info;
    
    if (!latestReceiptInfo || latestReceiptInfo.length === 0) {
      return {
        isValid: false,
        error: 'No subscription information found'
      };
    }

    // Get the most recent transaction
    const latestTransaction = latestReceiptInfo[0];
    
    // Check if subscription is still active
    const expiresDate = new Date(parseInt(latestTransaction.expires_date_ms));
    const isExpired = expiresDate < new Date();
    
    // Find pending renewal info for this subscription
    const renewalInfo = pendingRenewalInfo?.find((info: any) => 
      info.original_transaction_id === latestTransaction.original_transaction_id
    );

    return {
      isValid: !isExpired,
      productId: latestTransaction.product_id,
      expiresDate: expiresDate.toISOString(),
      isExpired,
      environment: appleResponse.environment,
      originalTransactionId: latestTransaction.original_transaction_id,
      transactionId: latestTransaction.transaction_id,
      purchaseDate: new Date(parseInt(latestTransaction.purchase_date_ms)).toISOString(),
      autoRenewStatus: renewalInfo?.auto_renew_status === '1',
      expirationIntent: renewalInfo?.expiration_intent
    };
  } catch (error) {
    console.error('Error extracting subscription info:', error);
    return {
      isValid: false,
      error: 'Failed to parse subscription information'
    };
  }
}

/**
 * Get user-friendly error message for Apple status codes
 */
function getAppleErrorMessage(status: number): string {
  switch (status) {
    case 21007:
      return 'This receipt is from the test environment';
    case 21008:
      return 'This receipt is from the production environment';
    case 21002:
      return 'The receipt data was malformed';
    case 21003:
      return 'The receipt could not be authenticated';
    case 21004:
      return 'The shared secret does not match';
    case 21005:
      return 'The receipt server is not currently available';
    case 21006:
      return 'This receipt is valid but the subscription has expired';
    default:
      return `Receipt validation failed with status: ${status}`;
  }
}

export default app;
