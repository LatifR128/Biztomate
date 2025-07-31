import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptions';
import { useUserStore } from '@/store/userStore';
import { useReceiptStore } from '@/store/receiptStore';
import { 
  checkInAppPurchaseAvailability,
  purchaseSubscription,
  validateReceipt,
  showPurchaseErrorAlert,
  type PurchaseStatus 
} from '@/lib/inAppPurchases';

export default function PaymentScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const { updateSubscription } = useUserStore();
  const { addReceipt } = useReceiptStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus | null>(null);

  const selectedPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === planId);

  // Check in-app purchase availability on component mount
  useEffect(() => {
    const checkPurchases = async () => {
      try {
        const status = await checkInAppPurchaseAvailability();
        setPurchaseStatus(status);
        
        if (!status.isAvailable) {
          console.warn('In-app purchases not available');
        }
      } catch (error) {
        console.error('Error checking in-app purchase availability:', error);
        // Set a default status for fallback
        setPurchaseStatus({
          isAvailable: false,
          canMakePayments: false,
          products: [],
        });
      }
    };
    
    checkPurchases();
  }, []);
  
  if (!selectedPlan) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid plan selected</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="primary" />
      </View>
    );
  }
  
  const handlePurchase = async () => {
    setIsProcessing(true);
    
    try {
      // Process in-app purchase
      const result = await purchaseSubscription(selectedPlan.productId);
      
      if (result.success && result.receiptData) {
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
                onPress: () => {
                  router.dismissAll();
                  router.replace('/(tabs)');
                }
              }
            ]
          );
        } else {
          // Receipt validation failed
          showPurchaseErrorAlert(
            validationResult.error || 'Receipt validation failed. Please contact support.'
          );
        }
      } else {
        showPurchaseErrorAlert(result.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert(
        "Purchase Error",
        "An unexpected error occurred. Please try again later.",
        [{ text: "OK" }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Complete Your Purchase</Text>
        <View style={styles.planSummary}>
          <Text style={styles.planName}>{selectedPlan.name}</Text>
          <Text style={styles.planPrice}>{selectedPlan.price}</Text>
          <Text style={styles.planFeature}>
            {selectedPlan.cardsLimit === Infinity ? 'Unlimited' : selectedPlan.cardsLimit} cards per year
          </Text>
        </View>
      </View>
      
      <View style={styles.paymentMethods}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        
        <View style={[
          styles.paymentOption,
          styles.selectedPaymentOption,
          !purchaseStatus?.canMakePayments && styles.disabledPaymentOption
        ]}>
          <Ionicons 
            name="card" 
            size={24}
            color={purchaseStatus?.canMakePayments ? Colors.light.primary : Colors.light.textSecondary} 
          />
          <View style={styles.paymentOptionContent}>
            <Text style={[
              styles.paymentOptionText,
              !purchaseStatus?.canMakePayments && styles.disabledText
            ]}>
              App Store Purchase
            </Text>
            {!purchaseStatus?.canMakePayments && (
              <Text style={styles.unavailableText}>Not available</Text>
            )}
          </View>
          <View style={styles.checkmark}>
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
        </View>
      </View>
      
      <View style={styles.paymentInfo}>
        <Text style={styles.paymentInfoTitle}>App Store Purchase</Text>
        <Text style={styles.paymentInfoText}>
          Your purchase will be processed securely through the App Store using your Apple ID payment method.
        </Text>
      </View>
      
      <View style={styles.securityInfo}>
        <View style={styles.securityHeader}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.light.success} />
          <Text style={styles.securityTitle}>Secure Payment</Text>
        </View>
        <Text style={styles.securityText}>
          Your payment information is secure and managed by Apple. We never store your payment details.
        </Text>
        <View style={styles.securityFeatures}>
          <View style={styles.securityFeature}>
            <Ionicons name="lock-closed" size={16} color={Colors.light.success} />
            <Text style={styles.securityFeatureText}>Apple ID secure payment</Text>
          </View>
          <View style={styles.securityFeature}>
            <Ionicons name="shield-checkmark" size={16} color={Colors.light.success} />
            <Text style={styles.securityFeatureText}>App Store verified</Text>
          </View>
          <View style={styles.securityFeature}>
            <Ionicons name="document-text" size={16} color={Colors.light.success} />
            <Text style={styles.securityFeatureText}>Receipt validation</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title={`Purchase ${selectedPlan.name} - ${selectedPlan.price}`}
          onPress={handlePurchase}
          variant="primary"
          loading={isProcessing}
          disabled={isProcessing || !purchaseStatus?.canMakePayments}
          style={styles.purchaseButton}
        />
        
        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="outline"
          disabled={isProcessing}
          style={styles.cancelButton}
        />
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By completing this purchase, you agree to our Terms of Service and Privacy Policy.
        </Text>
        <Text style={styles.footerContact}>
          Need help? Contact us at hello@biztomate.com
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.light.error,
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  planSummary: {
    backgroundColor: Colors.light.highlight,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  planFeature: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  paymentMethods: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPaymentOption: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.highlight,
  },
  disabledPaymentOption: {
    opacity: 0.6,
    borderColor: Colors.light.border,
  },
  paymentOptionText: {
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 12,
    flex: 1,
  },
  paymentOptionContent: {
    flex: 1,
    marginLeft: 12,
  },
  disabledText: {
    color: Colors.light.textSecondary,
  },
  unavailableText: {
    fontSize: 12,
    color: Colors.light.error,
    marginTop: 2,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfo: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
  },
  paymentInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  paymentInfoText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  securityInfo: {
    margin: 20,
    padding: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 8,
  },
  securityText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  securityFeatures: {
    gap: 8,
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityFeatureText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 8,
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  purchaseButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginBottom: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 16,
  },
  footerContact: {
    fontSize: 12,
    color: Colors.light.primary,
    textAlign: 'center',
  },
});