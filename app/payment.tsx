import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptions';
import { useUserStore } from '@/store/userStore';
import { useReceiptStore } from '@/store/receiptStore';
import { useIAP } from '@/hooks/useIAP';

export default function PaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const { updateSubscription } = useUserStore();
  const { addReceipt } = useReceiptStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [productAvailable, setProductAvailable] = useState(false);

  const selectedPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === planId);

  // Use the new IAP hook
  const {
    isInitialized,
    isLoading,
    products,
    error: iapError,
    purchaseSubscription,
    validateReceipt
  } = useIAP();

  // Check product availability when products load
  useEffect(() => {
    if (selectedPlan && products.length > 0) {
      const product = products.find(p => p.id === selectedPlan.productId);
      setProductAvailable(!!product);
    }
  }, [selectedPlan, products]);
  
  if (!selectedPlan) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={Colors.light.error} />
        <Text style={styles.errorTitle}>Invalid Plan</Text>
        <Text style={styles.errorText}>The selected plan could not be found.</Text>
        <Button title="Go Back" onPress={() => router.back()} style={styles.backButton} />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading payment options...</Text>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="card-outline" size={64} color={Colors.light.error} />
        <Text style={styles.errorTitle}>Payment Unavailable</Text>
        <Text style={styles.errorText}>
          In-app purchases are not available at this time. Please try again later.
        </Text>
        <Button title="Go Back" onPress={() => router.back()} style={styles.backButton} />
      </View>
    );
  }

  if (iapError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="close-circle" size={64} color={Colors.light.error} />
        <Text style={styles.errorTitle}>Payment Error</Text>
        <Text style={styles.errorText}>
          {iapError}
        </Text>
        <Button title="Go Back" onPress={() => router.back()} style={styles.backButton} />
      </View>
    );
  }

  if (!productAvailable) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="close-circle" size={64} color={Colors.light.error} />
        <Text style={styles.errorTitle}>Product Not Available</Text>
        <Text style={styles.errorText}>
          The selected subscription plan is not available in the App Store. Please try again later or contact support.
        </Text>
        <Button title="Go Back" onPress={() => router.back()} style={styles.backButton} />
      </View>
    );
  }
  
  const handlePurchase = async () => {
    setIsProcessing(true);
    
    try {
      // Double-check product availability before purchase
      if (!isInitialized) {
        Alert.alert(
          'In-App Purchases Not Available',
          'In-app purchases are not initialized. Please try again later.',
          [{ text: 'OK' }]
        );
        return;
      }

      const product = products.find(p => p.id === selectedPlan.productId);
      if (!product) {
        Alert.alert(
          'Product Not Available',
          'This subscription plan is not available. Please try again later.',
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('Processing purchase for:', selectedPlan.name, 'Product ID:', selectedPlan.productId);
      
      // Process in-app purchase
      const result = await purchaseSubscription(selectedPlan.productId);
      
      if (result.success && result.receiptData) {
        console.log('Purchase successful, validating receipt...');
        
        // Store the receipt
        addReceipt({
          productId: result.productId!,
          transactionId: result.transactionId!,
          originalTransactionId: result.originalTransactionId!,
          receiptData: result.receiptData,
          purchaseDate: result.purchaseDate!,
          expiresDate: result.expiresDate,
          isValid: true,
          environment: 'Production' as const,
        });
        
        // Validate receipt on server
        const validationResult = await validateReceipt(result.receiptData);
        
        if (validationResult.success && validationResult.subscription?.isValid) {
          // Update subscription
          updateSubscription(planId as any);
          
          Alert.alert(
            "Purchase Successful!",
            `Welcome to ${selectedPlan.name}! Your subscription is now active.\n\nReceipt has been validated and stored securely.${__DEV__ ? '\n\n(Sandbox Environment)' : ''}`,
            [
              { 
                text: "Continue", 
                onPress: () => router.replace('/(tabs)') 
              }
            ]
          );
        } else {
          console.error('Receipt validation failed:', validationResult);
          Alert.alert(
            "Purchase Completed",
            "Your purchase was successful, but we couldn't validate the receipt. Please contact support if you have any issues.",
            [
              { 
                text: "Continue", 
                onPress: () => router.replace('/(tabs)') 
              }
            ]
          );
        }
      } else {
        console.error('Purchase failed:', result.error);
        Alert.alert(
          'Purchase Failed',
          result.error || 'Purchase failed. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      Alert.alert(
        'Purchase Error',
        error.message || 'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={[
      styles.container,
      { 
        paddingTop: insets.top,
        paddingBottom: insets.bottom 
      }
    ]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Ionicons name="card" size={48} color={Colors.light.primary} />
          <Text style={styles.title}>Complete Purchase</Text>
          <Text style={styles.subtitle}>
            You're about to subscribe to {selectedPlan.name}
          </Text>
        </View>

        <View style={styles.planDetails}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>{selectedPlan.name}</Text>
            <Text style={styles.planPrice}>{selectedPlan.price}</Text>
          </View>
          
          <View style={styles.planFeatures}>
            <Text style={styles.featuresTitle}>What's included:</Text>
            {selectedPlan.features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Ionicons name="checkmark" size={16} color={Colors.light.primary} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.paymentInfo}>
          <View style={styles.paymentHeader}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.light.primary} />
            <Text style={styles.paymentTitle}>Secure App Store Purchase</Text>
          </View>
          <Text style={styles.paymentText}>
            Your payment will be processed securely through the App Store using your Apple ID payment method. 
            Your payment information is protected by Apple's security standards.
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          <Button
            title={isProcessing ? "Processing..." : "Subscribe Now"}
            onPress={handlePurchase}
            disabled={isProcessing}
            style={styles.purchaseButton}
          />
          
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="secondary"
            disabled={isProcessing}
            style={styles.cancelButton}
          />
        </View>

        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="small" color={Colors.light.primary} />
            <Text style={styles.processingText}>Processing your purchase...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  planDetails: {
    padding: 20,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.text,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  planFeatures: {
    marginTop: 12,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 8,
  },
  paymentInfo: {
    padding: 20,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 8,
  },
  paymentText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  actionsContainer: {
    padding: 20,
    gap: 12,
  },
  purchaseButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginBottom: 8,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  processingText: {
    marginLeft: 8,
    color: Colors.light.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.error,
    marginTop: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 5,
    textAlign: 'center',
    lineHeight: 22,
  },
  backButton: {
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.light.textSecondary,
  },
});