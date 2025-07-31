import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { 
  initializeInAppPurchases, 
  checkInAppPurchaseAvailability, 
  purchaseSubscription,
  disconnectInAppPurchases 
} from '@/lib/inAppPurchases';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptions';

export default function InAppPurchaseTest() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

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

  const testPurchase = async (productId: string) => {
    try {
      setLoading(true);
      setStatus(`Testing purchase for ${productId}...`);
      
      const result = await purchaseSubscription(productId);
      
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
      await testPurchase(plan.productId);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between tests
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        In-App Purchase Test
      </Text>
      
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          Status: {status}
        </Text>
        <Text style={{ fontSize: 14, color: 'gray' }}>
          Initialized: {isInitialized ? 'Yes' : 'No'}
        </Text>
        <Text style={{ fontSize: 14, color: 'gray' }}>
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
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
          Available Products:
        </Text>
        {products.map((product, index) => (
          <View key={index} style={{ marginBottom: 10, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>{product.title}</Text>
            <Text>{product.description}</Text>
            <Text style={{ color: 'green' }}>{product.price}</Text>
            <Text style={{ fontSize: 12, color: 'gray' }}>ID: {product.id}</Text>
            
            <TouchableOpacity
              style={{
                backgroundColor: '#FF9500',
                padding: 8,
                borderRadius: 6,
                marginTop: 5,
                opacity: loading ? 0.5 : 1
              }}
              onPress={() => testPurchase(product.id)}
              disabled={loading}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontSize: 12 }}>
                Test Purchase
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
          Expected Products:
        </Text>
        {SUBSCRIPTION_PLANS.map((plan, index) => (
          <View key={index} style={{ marginBottom: 5, padding: 5 }}>
            <Text style={{ fontSize: 14 }}>
              {plan.name}: {plan.productId}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
} 