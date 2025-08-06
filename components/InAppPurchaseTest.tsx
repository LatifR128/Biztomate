import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { 
  initializeInAppPurchases, 
  checkInAppPurchaseAvailability, 
  purchaseSubscription,
  disconnectInAppPurchases 
} from '@/lib/inAppPurchases';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptions';
import Colors from '@/constants/colors';

export default function InAppPurchaseTest() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [currentPlan, setCurrentPlan] = useState('');
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);

  useEffect(() => {
    initializeTest();
    return () => {
      disconnectInAppPurchases();
    };
  }, []);

  const initializeTest = async () => {
    try {
      setStatus('Initializing...');
      await initializeInAppPurchases();
      setIsInitialized(true);
      setStatus('Initialized successfully');
      
      // Check availability
      await checkAvailability();
    } catch (error) {
      console.error('Initialization error:', error);
      setStatus(`Initialization failed: ${error}`);
    }
  };

  const checkAvailability = async () => {
    try {
      setLoading(true);
      setStatus('Checking availability...');
      
      const availability = await checkInAppPurchaseAvailability();
      
      setProducts(availability.products);
      setStatus(`Available: ${availability.isAvailable}, Products: ${availability.products.length}`);
      
      console.log('Availability result:', availability);
    } catch (error) {
      console.error('Availability check error:', error);
      setStatus(`Availability check failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (product: any) => {
    try {
      setLoading(true);
      setStatus(`Testing purchase for ${product.title}...`);
      
      const result = await purchaseSubscription(product.id);
      
      if (result.success) {
        Alert.alert('Success', `Purchase successful! Transaction: ${result.transactionId}`);
        setStatus('Purchase successful');
      } else {
        Alert.alert('Error', result.error || 'Purchase failed');
        setStatus(`Purchase failed: ${result.error}`);
      }
      
      console.log('Purchase result:', result);
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', `Purchase error: ${error}`);
      setStatus(`Purchase error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testAllProducts = async () => {
    for (const plan of SUBSCRIPTION_PLANS) {
      console.log(`Testing product: ${plan.productId}`);
      await handlePurchase(plan);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between tests
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: Colors.light.text }}>
        In-App Purchase Test
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 10, color: Colors.light.text }}>
        Test subscription purchases
      </Text>
      <Text style={{ fontSize: 14, color: Colors.light.textSecondary }}>
        Current Plan: {currentPlan}
      </Text>
      <Text style={{ fontSize: 14, color: Colors.light.textSecondary }}>
        Trial Days Left: {trialDaysLeft}
      </Text>
      
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, marginBottom: 10, color: Colors.light.text }}>
          Status: {status}
        </Text>
        <Text style={{ fontSize: 14, color: Colors.light.textSecondary }}>
          Initialized: {isInitialized ? 'Yes' : 'No'}
        </Text>
        <Text style={{ fontSize: 14, color: Colors.light.textSecondary }}>
          Products Found: {products.length}
        </Text>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 8,
          marginBottom: 10,
          opacity: loading ? 0.5 : 1
        }}
        onPress={checkAvailability}
        disabled={loading}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          Check Availability
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: '#34C759',
          padding: 15,
          borderRadius: 8,
          marginBottom: 10,
          opacity: loading ? 0.5 : 1
        }}
        onPress={testAllProducts}
        disabled={loading}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          Test All Products
        </Text>
      </TouchableOpacity>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: Colors.light.text }}>
          Available Products:
        </Text>
        {products.map((product, index) => (
          <View key={index} style={{ marginBottom: 10, padding: 10, backgroundColor: Colors.light.card, borderRadius: 8 }}>
            <Text style={{ fontWeight: 'bold', color: Colors.light.text }}>{product.title}</Text>
            <Text style={{ color: Colors.light.textSecondary }}>{product.description}</Text>
            <Text style={{ color: Colors.light.success, fontSize: 14 }}>{product.price}</Text>
            <Text style={{ fontSize: 12, color: Colors.light.textSecondary }}>ID: {product.id}</Text>
            
            <TouchableOpacity
              style={{ 
                backgroundColor: Colors.light.primary, 
                padding: 10, 
                borderRadius: 8, 
                marginTop: 8,
                alignItems: 'center'
              }}
              onPress={() => handlePurchase(product)}
              disabled={loading}
            >
              <Text style={{ color: Colors.light.background, textAlign: 'center', fontWeight: 'bold' }}>
                {loading ? 'Processing...' : 'Purchase'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: Colors.light.text }}>
          Expected Products:
        </Text>
        {SUBSCRIPTION_PLANS.map((plan, index) => (
          <View key={index} style={{ marginBottom: 5, padding: 5 }}>
            <Text style={{ fontSize: 14, color: Colors.light.textSecondary }}>
              {plan.name}: {plan.productId}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
} 