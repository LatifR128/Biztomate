const express = require('express');
const axios = require('axios');
const router = express.Router();

// Apple receipt validation endpoints
const APPLE_PRODUCTION_URL = 'https://buy.itunes.apple.com/verifyReceipt';
const APPLE_SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';

/**
 * Validate Apple receipt
 * POST /validateReceipt
 */
router.post('/validateReceipt', async (req, res) => {
  try {
    const { receiptData, password, environment = 'production' } = req.body;

    // Validate required fields
    if (!receiptData) {
      return res.status(400).json({
        success: false,
        error: 'Receipt data is required',
        statusCode: 400,
        message: 'Missing receipt data'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Shared secret is required',
        statusCode: 400,
        message: 'Missing shared secret'
      });
    }

    console.log('Validating receipt with Apple...', {
      environment,
      receiptLength: receiptData.length,
      hasPassword: !!password
    });

    // Prepare request payload
    const payload = {
      'receipt-data': receiptData,
      password: password,
      'exclude-old-transactions': true
    };

    // First try production endpoint
    let response;
    let endpoint = APPLE_PRODUCTION_URL;
    
    try {
      console.log('Trying production endpoint...');
      response = await axios.post(APPLE_PRODUCTION_URL, payload, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Production endpoint failed:', error.message);
      
      // If production fails, try sandbox
      if (error.response?.data?.status === 21007) {
        console.log('Production failed with 21007, trying sandbox...');
        try {
          response = await axios.post(APPLE_SANDBOX_URL, payload, {
            timeout: 10000,
            headers: {
              'Content-Type': 'application/json'
            }
          });
          endpoint = APPLE_SANDBOX_URL;
        } catch (sandboxError) {
          console.error('Sandbox endpoint also failed:', sandboxError.message);
          return res.status(500).json({
            success: false,
            error: 'Receipt validation failed',
            statusCode: 500,
            message: 'Both production and sandbox validation failed',
            endpoint: 'both'
          });
        }
      } else {
        return res.status(500).json({
          success: false,
          error: 'Receipt validation failed',
          statusCode: 500,
          message: error.message || 'Network error during validation',
          endpoint: 'production'
        });
      }
    }

    const appleResponse = response.data;
    console.log('Apple response status:', appleResponse.status);

    // Handle Apple's response codes
    switch (appleResponse.status) {
      case 0:
        // Success - receipt is valid
        const subscription = extractSubscriptionInfo(appleResponse);
        
        return res.json({
          success: true,
          environment: endpoint === APPLE_SANDBOX_URL ? 'Sandbox' : 'Production',
          endpoint: endpoint === APPLE_SANDBOX_URL ? 'sandbox' : 'production',
          subscription,
          statusCode: 0,
          message: 'Receipt validation successful'
        });

      case 21007:
        // This receipt is from the test environment, but it was sent to the production environment for verification
        return res.status(400).json({
          success: false,
          error: 'Sandbox receipt sent to production',
          statusCode: 21007,
          message: 'This receipt is from the test environment',
          endpoint: 'production'
        });

      case 21008:
        // This receipt is from the production environment, but it was sent to the test environment for verification
        return res.status(400).json({
          success: false,
          error: 'Production receipt sent to sandbox',
          statusCode: 21008,
          message: 'This receipt is from the production environment',
          endpoint: 'sandbox'
        });

      case 21002:
        return res.status(400).json({
          success: false,
          error: 'Invalid receipt data',
          statusCode: 21002,
          message: 'The data in the receipt-data property was malformed',
          endpoint: endpoint === APPLE_SANDBOX_URL ? 'sandbox' : 'production'
        });

      case 21003:
        return res.status(400).json({
          success: false,
          error: 'Authentication failed',
          statusCode: 21003,
          message: 'The receipt could not be authenticated',
          endpoint: endpoint === APPLE_SANDBOX_URL ? 'sandbox' : 'production'
        });

      case 21004:
        return res.status(400).json({
          success: false,
          error: 'Invalid shared secret',
          statusCode: 21004,
          message: 'The shared secret you provided does not match the shared secret on file for your account',
          endpoint: endpoint === APPLE_SANDBOX_URL ? 'sandbox' : 'production'
        });

      case 21005:
        return res.status(400).json({
          success: false,
          error: 'Server unavailable',
          statusCode: 21005,
          message: 'The receipt server is not currently available',
          endpoint: endpoint === APPLE_SANDBOX_URL ? 'sandbox' : 'production'
        });

      case 21006:
        return res.status(400).json({
          success: false,
          error: 'Receipt is valid but subscription has expired',
          statusCode: 21006,
          message: 'This receipt is valid but the subscription has expired',
          endpoint: endpoint === APPLE_SANDBOX_URL ? 'sandbox' : 'production'
        });

      default:
        return res.status(400).json({
          success: false,
          error: 'Receipt validation failed',
          statusCode: appleResponse.status,
          message: `Unknown error: ${appleResponse.status}`,
          endpoint: endpoint === APPLE_SANDBOX_URL ? 'sandbox' : 'production'
        });
    }

  } catch (error) {
    console.error('Receipt validation error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      statusCode: 500,
      message: error.message || 'An unexpected error occurred',
      endpoint: 'unknown'
    });
  }
});

/**
 * Extract subscription information from Apple's response
 */
function extractSubscriptionInfo(appleResponse) {
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
    const renewalInfo = pendingRenewalInfo?.find(info => 
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

module.exports = router; 