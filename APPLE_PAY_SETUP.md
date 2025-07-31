# Apple Pay Setup Guide for Biztomate Scanner

## Overview

This guide provides step-by-step instructions to properly configure Apple Pay for the Biztomate Scanner app.

## Prerequisites

- Apple Developer Account
- iOS App ID configured
- Xcode installed
- Stripe account (for payment processing)

## Step 1: Apple Developer Configuration

### 1.1 Create Merchant ID
1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** → **Merchant IDs**
4. Create a new Merchant ID:
   - **Description**: Biztomate Scanner Payments
   - **Identifier**: `merchant.com.biztomate.scanner`
5. Save the Merchant ID

### 1.2 Configure Apple Pay Capability
1. Go to **Identifiers** → Select your App ID
2. Enable **Apple Pay** capability
3. Select the Merchant ID you created
4. Save changes

### 1.3 Create Payment Processing Certificate
1. Go to **Certificates** → **+** → **Apple Pay Payment Processing Certificate**
2. Select your Merchant ID
3. Download and install the certificate
4. Note the certificate details for backend configuration

## Step 2: Xcode Configuration

### 2.1 Enable Apple Pay Capability
1. Open your project in Xcode
2. Select your target → **Signing & Capabilities**
3. Click **+ Capability** → **Apple Pay**
4. Select your Merchant ID
5. Add supported payment networks:
   - Visa
   - Mastercard
   - American Express
   - Discover

### 2.2 Update Info.plist
Add the following to your `Info.plist`:

```xml
<key>NSApplePayUsageDescription</key>
<string>This app uses Apple Pay to process subscription payments securely.</string>
```

## Step 3: Stripe Configuration

### 3.1 Stripe Dashboard Setup
1. Log into your [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Settings** → **Payment methods** → **Apple Pay**
3. Add your domain for web Apple Pay (if applicable)
4. Note your Stripe publishable key

### 3.2 Backend Integration
Your backend needs to handle Apple Pay tokens. Here's a basic example:

```javascript
// Example Node.js/Express endpoint
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, paymentMethodType } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: [paymentMethodType],
      capture_method: 'automatic',
    });
    
    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## Step 4: Code Configuration

### 4.1 Update Merchant Identifier
In `lib/applePay.ts`, update the merchant identifier:

```typescript
export const APPLE_PAY_CONFIG = {
  merchantIdentifier: 'merchant.com.biztomate.scanner', // Your actual Merchant ID
  // ... other config
};
```

### 4.2 Environment Variables
Add to your environment configuration:

```env
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
APPLE_PAY_MERCHANT_ID=merchant.com.biztomate.scanner
```

## Step 5: Testing

### 5.1 Test Environment
1. Use Stripe test keys for development
2. Test with Apple Pay sandbox environment
3. Use test cards from [Stripe Test Cards](https://stripe.com/docs/testing#cards)

### 5.2 Test Cards
- Visa: `4000000000000002`
- Mastercard: `5200828282828210`
- American Express: `378282246310005`

### 5.3 Device Testing
1. Test on physical iOS device (Apple Pay doesn't work in simulator)
2. Ensure device has Apple Pay set up
3. Test with different payment methods

## Step 6: Production Deployment

### 6.1 Production Certificates
1. Create production Apple Pay certificate
2. Update Stripe to production mode
3. Update app configuration with production keys

### 6.2 App Store Review
1. Ensure Apple Pay usage description is clear
2. Test payment flow thoroughly
3. Provide test account for App Store review

## Troubleshooting

### Common Issues

#### 1. "Apple Pay is not available"
- Check device compatibility
- Ensure Apple Pay is set up on device
- Verify Merchant ID configuration

#### 2. "Payment failed"
- Check Stripe configuration
- Verify payment processing certificate
- Review server logs for errors

#### 3. "Invalid merchant"
- Verify Merchant ID matches Apple Developer configuration
- Check Apple Pay capability is enabled
- Ensure proper certificate installation

### Debug Tips
1. Enable detailed logging in development
2. Test with Stripe test mode first
3. Use Apple Pay sandbox for testing
4. Monitor Stripe dashboard for payment attempts

## Security Considerations

### 1. Token Handling
- Never store payment tokens on device
- Process tokens immediately on backend
- Use secure communication (HTTPS)

### 2. Data Protection
- Implement proper error handling
- Don't log sensitive payment data
- Follow PCI DSS guidelines

### 3. User Privacy
- Request minimal required data
- Clear privacy policy for payment data
- Secure data transmission

## Monitoring & Analytics

### 1. Payment Analytics
- Track Apple Pay usage
- Monitor conversion rates
- Analyze payment failures

### 2. Error Tracking
- Log payment errors (without sensitive data)
- Monitor Apple Pay availability
- Track user feedback

## Support Resources

- [Apple Pay Developer Documentation](https://developer.apple.com/apple-pay/)
- [Stripe Apple Pay Integration](https://stripe.com/docs/apple-pay)
- [Expo Apple Pay Documentation](https://docs.expo.dev/versions/latest/sdk/apple-pay/)

## Next Steps

1. Complete the setup steps above
2. Test thoroughly in development
3. Submit for App Store review
4. Monitor production usage
5. Implement analytics and monitoring

---

**Note**: This setup guide assumes you have basic knowledge of iOS development and Stripe integration. For production use, consider consulting with payment security experts. 