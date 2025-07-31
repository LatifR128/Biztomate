#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing In-App Purchase Configuration...\n');

// Check app.json configuration
console.log('1. Checking app.json configuration...');
try {
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  
  // Check if expo-in-app-purchases plugin is configured
  const plugins = appJson.expo.plugins || [];
  const iapPlugin = plugins.find(plugin => 
    Array.isArray(plugin) && plugin[0] === 'expo-in-app-purchases'
  );
  
  if (iapPlugin) {
    console.log('✅ expo-in-app-purchases plugin found in app.json');
    console.log('   Configuration:', JSON.stringify(iapPlugin[1], null, 2));
  } else {
    console.log('❌ expo-in-app-purchases plugin not found in app.json');
  }
  
  // Check iOS bundle identifier
  const bundleId = appJson.expo.ios?.bundleIdentifier;
  if (bundleId) {
    console.log(`✅ iOS bundle identifier: ${bundleId}`);
  } else {
    console.log('❌ iOS bundle identifier not found');
  }
  
} catch (error) {
  console.log('❌ Error reading app.json:', error.message);
}

// Check subscription constants
console.log('\n2. Checking subscription constants...');
try {
  const subscriptionsPath = path.join(__dirname, '../constants/subscriptions.ts');
  const subscriptionsContent = fs.readFileSync(subscriptionsPath, 'utf8');
  
  // Check for product IDs
  const productIds = [
    'com.biztomate.scanner.basic',
    'com.biztomate.scanner.standard', 
    'com.biztomate.scanner.premium',
    'com.biztomate.scanner.unlimited'
  ];
  
  productIds.forEach(id => {
    if (subscriptionsContent.includes(id)) {
      console.log(`✅ Product ID found: ${id}`);
    } else {
      console.log(`❌ Product ID missing: ${id}`);
    }
  });
  
} catch (error) {
  console.log('❌ Error reading subscriptions.ts:', error.message);
}

// Check in-app purchase implementation
console.log('\n3. Checking in-app purchase implementation...');
try {
  const iapPath = path.join(__dirname, '../lib/inAppPurchases.ts');
  const iapContent = fs.readFileSync(iapPath, 'utf8');
  
  const checks = [
    { name: 'initializeInAppPurchases function', pattern: 'initializeInAppPurchases' },
    { name: 'purchaseSubscription function', pattern: 'purchaseSubscription' },
    { name: 'checkInAppPurchaseAvailability function', pattern: 'checkInAppPurchaseAvailability' },
    { name: 'Product verification before purchase', pattern: 'getProductsAsync' },
    { name: 'Purchase listener setup', pattern: 'setPurchaseListener' },
    { name: 'Error handling', pattern: 'error.*message' }
  ];
  
  checks.forEach(check => {
    if (iapContent.includes(check.pattern)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name}`);
    }
  });
  
} catch (error) {
  console.log('❌ Error reading inAppPurchases.ts:', error.message);
}

// Check package.json dependencies
console.log('\n4. Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = packageJson.dependencies || {};
  
  if (dependencies['expo-in-app-purchases']) {
    console.log(`✅ expo-in-app-purchases: ${dependencies['expo-in-app-purchases']}`);
  } else {
    console.log('❌ expo-in-app-purchases not found in dependencies');
  }
  
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

console.log('\n📋 Summary:');
console.log('If all checks show ✅, your in-app purchase configuration is correct.');
console.log('If any checks show ❌, those issues need to be fixed before building.');
console.log('\n🚀 Next steps:');
console.log('1. Fix any ❌ issues above');
console.log('2. Test with sandbox Apple ID');
console.log('3. Build and deploy to TestFlight');
console.log('4. Test in-app purchases in TestFlight'); 