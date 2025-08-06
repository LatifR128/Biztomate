# App Store Connect Setup Guide - Canadian Pricing

## 🍁 Setting Up Subscription Products with Canadian Dollar Pricing

### 📋 Required Product IDs

You need to create these 4 subscription products in App Store Connect:

1. **Basic Plan**: `com.biztomate.scanner.basic`
2. **Standard Plan**: `com.biztomate.scanner.standard`
3. **Premium Plan**: `com.biztomate.scanner.premium`
4. **Unlimited Plan**: `com.biztomate.scanner.unlimited`

---

## 🚀 Step-by-Step Setup Instructions

### Step 1: Access App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Sign in with your Apple Developer account
3. Select your app: **Biztomate Scanner**

### Step 2: Create Subscription Group

1. Navigate to **Features** → **In-App Purchases**
2. Click **+** to create a new subscription group
3. Name it: `Biztomate Scanner Subscriptions`
4. Set **Reference Name**: `Biztomate Scanner Subscriptions`
5. Click **Create**

### Step 3: Create Subscription Products

For each product, follow these steps:

#### Product 1: Basic Plan

1. **Product ID**: `com.biztomate.scanner.basic`
2. **Reference Name**: `Basic Plan - 100 Cards`
3. **Subscription Duration**: 1 Year
4. **Pricing**:
   - **Canada**: $19.99 CAD
   - **United States**: $19.99 USD
   - **Other regions**: Auto-calculated based on Apple's pricing matrix

#### Product 2: Standard Plan

1. **Product ID**: `com.biztomate.scanner.standard`
2. **Reference Name**: `Standard Plan - 250 Cards`
3. **Subscription Duration**: 1 Year
4. **Pricing**:
   - **Canada**: $24.99 CAD
   - **United States**: $24.99 USD
   - **Other regions**: Auto-calculated

#### Product 3: Premium Plan

1. **Product ID**: `com.biztomate.scanner.premium`
2. **Reference Name**: `Premium Plan - 500 Cards`
3. **Subscription Duration**: 1 Year
4. **Pricing**:
   - **Canada**: $36.99 CAD
   - **United States**: $36.99 USD
   - **Other regions**: Auto-calculated

#### Product 4: Unlimited Plan

1. **Product ID**: `com.biztomate.scanner.unlimited`
2. **Reference Name**: `Unlimited Plan - Unlimited Cards`
3. **Subscription Duration**: 1 Year
4. **Pricing**:
   - **Canada**: $49.99 CAD
   - **United States**: $49.99 USD
   - **Other regions**: Auto-calculated

---

## 📝 Product Details Configuration

### For Each Product, Configure:

#### **Basic Information**
- **Product ID**: (as specified above)
- **Reference Name**: (as specified above)
- **Subscription Duration**: 1 Year
- **Subscription Group**: Biztomate Scanner Subscriptions

#### **Pricing and Availability**
- **Price**: Set Canadian pricing as primary (same amounts as USD)
- **Availability**: All countries/regions
- **Subscription Start**: Immediately

#### **Localization**
- **Display Name**: 
  - Basic: "Basic - 100 Cards/Year"
  - Standard: "Standard - 250 Cards/Year"
  - Premium: "Premium - 500 Cards/Year"
  - Unlimited: "Unlimited - Unlimited Cards/Year"

- **Description**:
  - Basic: "Perfect for small businesses. Scan up to 100 business cards per year with advanced OCR technology."
  - Standard: "Great for growing businesses. Scan up to 250 business cards per year with priority support."
  - Premium: "For established businesses. Scan up to 500 business cards per year with premium support."
  - Unlimited: "For large organizations. Scan unlimited business cards with team sharing features."

#### **Review Information**
- **Review Notes**: "Subscription provides access to business card scanning features with specified card limits per year."
- **Screenshot**: Upload a screenshot showing the subscription screen

---

## 🔧 Advanced Configuration

### Subscription Group Settings

1. **Subscription Group Name**: `Biztomate Scanner Subscriptions`
2. **Subscription Group ID**: Auto-generated
3. **Subscription Group Type**: Auto-Renewable Subscriptions

### Pricing Tiers

Set up the following pricing tiers (same amounts, different currencies):

| Tier | Canada (CAD) | US (USD) | Description |
|------|-------------|----------|-------------|
| Tier 1 | $19.99 | $19.99 | Basic Plan |
| Tier 2 | $24.99 | $24.99 | Standard Plan |
| Tier 3 | $36.99 | $36.99 | Premium Plan |
| Tier 4 | $49.99 | $49.99 | Unlimited Plan |

### Free Trial Configuration

1. **Offer Type**: Free Trial
2. **Duration**: 7 days
3. **Eligibility**: New subscribers only
4. **Display Name**: "7-Day Free Trial"

---

## 🧪 Testing Configuration

### Sandbox Testing

1. **Create Sandbox Testers**:
   - Go to **Users and Access** → **Sandbox Testers**
   - Create test accounts for different regions

2. **Test Purchase Flow**:
   - Use sandbox accounts to test purchases
   - Verify Canadian pricing displays correctly
   - Test receipt validation

3. **Test Subscription Management**:
   - Test subscription renewal
   - Test subscription cancellation
   - Test restore purchases

### TestFlight Testing

1. **Upload Build**: Use the build script to create a TestFlight build
2. **Internal Testing**: Test with your team
3. **External Testing**: Test with external testers

---

## 📊 Pricing Matrix

### Same Amounts, Different Currencies

| Plan | Price (CAD) | Price (USD) | Cards Limit | Features |
|------|------------|-------------|-------------|----------|
| Basic | $19.99/year | $19.99/year | 100 | OCR, Export, Email Support |
| Standard | $24.99/year | $24.99/year | 250 | OCR, Export, Priority Support |
| Premium | $36.99/year | $36.99/year | 500 | OCR, All Exports, Premium Support |
| Unlimited | $49.99/year | $49.99/year | Unlimited | OCR, All Exports, Team Sharing |

### Currency Conversion

Apple will automatically convert prices to local currencies based on their pricing matrix. The Canadian dollar prices are set as the primary pricing tier with the same numerical values as USD.

---

## ✅ Verification Checklist

Before submitting to App Store:

- [ ] All 4 subscription products created with correct IDs
- [ ] Canadian pricing set as primary (same amounts as USD)
- [ ] All localizations completed
- [ ] Review information provided
- [ ] Screenshots uploaded
- [ ] Sandbox testing completed
- [ ] TestFlight testing completed
- [ ] Receipt validation working
- [ ] Purchase restoration working
- [ ] Error handling tested

---

## 🚨 Important Notes

1. **Product IDs**: Must match exactly what's in the code
2. **Pricing**: Set Canadian dollar as primary pricing (same amounts as USD)
3. **Testing**: Always test in sandbox before production
4. **Review**: Provide clear review notes for Apple
5. **Compliance**: Ensure all features match the subscription description

---

## 📞 Support

If you encounter issues:

1. Check Apple's [In-App Purchase Guidelines](https://developer.apple.com/app-store/review/guidelines/#in-app-purchase)
2. Review [App Store Connect Help](https://help.apple.com/app-store-connect/)
3. Contact Apple Developer Support if needed

---

**Your subscription products are now ready for App Store review! 🎉** 