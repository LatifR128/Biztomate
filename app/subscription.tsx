import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/userStore';
import { useReceiptStore } from '@/store/receiptStore';
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_ERRORS } from '@/constants/subscriptions';
import SubscriptionCard from '@/components/SubscriptionCard';
import Button from '@/components/Button';
import LoadingOverlay from '@/components/LoadingOverlay';
import { SubscriptionPlan } from '@/types';
import { useIAP } from '@/hooks/useIAP';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function SubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateSubscription } = useUserStore();
  const { addReceipt } = useReceiptStore();
  const [selectedPlan, setSelectedPlan] = useState<string>(user?.subscriptionPlan || 'free');
  const [isRestoring, setIsRestoring] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use the improved IAP hook
  const {
    isInitialized,
    isLoading,
    products,
    error: iapError,
    fetchProducts,
    restorePurchases,
    validateReceipt,
    purchaseSubscription
  } = useIAP();

  // Load products on component mount
  useEffect(() => {
    if (isInitialized) {
      fetchProducts();
    }
  }, [isInitialized, fetchProducts]);

  // Handle product selection
  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  // Handle subscription purchase
  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!isInitialized) {
      Alert.alert('Error', SUBSCRIPTION_ERRORS.NOT_INITIALIZED);
      return;
    }

    // Check if product is available
    const product = products.find(p => p.id === plan.productId);
    if (!product) {
      Alert.alert('Product Unavailable', SUBSCRIPTION_ERRORS.UNAVAILABLE);
      return;
    }

    setIsProcessing(true);

    try {
      const result = await purchaseSubscription(plan.productId);
      
      if (result.success && result.receiptData) {
        // Validate receipt
        const validationResult = await validateReceipt(result.receiptData);
        
        if (validationResult.success) {
          // Update user subscription
          updateSubscription(plan.id as any);
          
          // Store receipt
          addReceipt({
            productId: result.productId || plan.productId,
            transactionId: result.transactionId || '',
            originalTransactionId: result.originalTransactionId || result.transactionId || '',
            receiptData: result.receiptData,
            purchaseDate: result.purchaseDate || new Date().toISOString(),
            expiresDate: result.expiresDate || '',
            isValid: true,
            environment: (validationResult.environment === 'Sandbox' ? 'Sandbox' : 'Production') as 'Production' | 'Sandbox'
          });

          Alert.alert(
            'Subscription Successful! 🎉',
            `Your ${plan.name} subscription has been activated. You can now scan up to ${plan.cardsLimit === Infinity ? 'unlimited' : plan.cardsLimit} business cards.`,
            [
              {
                text: 'Continue',
                onPress: () => router.replace('/(tabs)')
              }
            ]
          );
        } else {
          Alert.alert('Validation Failed', validationResult.error || SUBSCRIPTION_ERRORS.VALIDATION_FAILED);
        }
      } else {
        Alert.alert('Purchase Failed', result.error || SUBSCRIPTION_ERRORS.PURCHASE_FAILED);
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      Alert.alert('Error', error.message || SUBSCRIPTION_ERRORS.PURCHASE_FAILED);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle restore purchases
  const handleRestorePurchases = async () => {
    setIsRestoring(true);

    try {
      const results = await restorePurchases();
      
      if (results.length > 0 && results[0].success) {
        // Find the highest tier subscription
        const validPurchases = results.filter(r => r.success);
        let highestPlan: SubscriptionPlan | null = null;
        
        for (const purchase of validPurchases) {
          const plan = SUBSCRIPTION_PLANS.find(p => p.productId === purchase.productId);
          if (plan && (!highestPlan || plan.cardsLimit > highestPlan.cardsLimit)) {
            highestPlan = plan;
          }
        }

        if (highestPlan) {
          updateSubscription(highestPlan.id as any);
          
          Alert.alert(
            'Purchases Restored! 🎉',
            `Your ${highestPlan.name} subscription has been restored.`,
            [
              {
                text: 'Continue',
                onPress: () => router.replace('/(tabs)')
              }
            ]
          );
        } else {
          Alert.alert('No Valid Subscriptions', 'No active subscriptions were found to restore.');
        }
      } else {
        Alert.alert('Restore Failed', results[0]?.error || SUBSCRIPTION_ERRORS.RESTORE_FAILED);
      }
    } catch (error: any) {
      console.error('Restore error:', error);
      Alert.alert('Error', error.message || SUBSCRIPTION_ERRORS.RESTORE_FAILED);
    } finally {
      setIsRestoring(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading subscription plans...</Text>
      </View>
    );
  }

  // Show error state
  if (iapError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={Colors.light.error} />
        <Text style={styles.errorTitle}>Subscription Unavailable</Text>
        <Text style={styles.errorText}>{iapError}</Text>
        <Button 
          title="Try Again" 
          onPress={() => fetchProducts()} 
          style={styles.retryButton} 
        />
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      { 
        paddingTop: insets.top,
        paddingBottom: insets.bottom 
      }
    ]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, isTablet && styles.headerTablet]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={[styles.title, isTablet && styles.titleTablet]}>Choose Your Plan</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Current Plan Info */}
        <View style={[styles.currentPlanContainer, isTablet && styles.currentPlanContainerTablet]}>
          <Text style={[styles.currentPlanTitle, isTablet && styles.currentPlanTitleTablet]}>Current Plan</Text>
          <Text style={[styles.currentPlanName, isTablet && styles.currentPlanNameTablet]}>
            {SUBSCRIPTION_PLANS.find(p => p.id === user?.subscriptionPlan)?.name || 'Free'}
          </Text>
          <Text style={[styles.currentPlanDetails, isTablet && styles.currentPlanDetailsTablet]}>
            {user?.subscriptionPlan === 'free' 
              ? `${(user?.maxCards || 5) - (user?.scannedCards || 0)} scans remaining`
              : 'Active subscription'
            }
          </Text>
        </View>

        {/* Subscription Plans */}
        <View style={[styles.plansContainer, isTablet && styles.plansContainerTablet]}>
          {SUBSCRIPTION_PLANS.map((plan) => (
            <SubscriptionCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan === plan.id}
              onSelect={() => handlePlanSelect(plan.id)}
              onSubscribe={() => handleSubscribe(plan)}
              isCurrentPlan={user?.subscriptionPlan === plan.id}
              product={products.find(p => p.id === plan.productId)}
            />
          ))}
        </View>

        {/* Restore Purchases */}
        <View style={[styles.restoreContainer, isTablet && styles.restoreContainerTablet]}>
          <Button
            title={isRestoring ? "Restoring..." : "Restore Purchases"}
            onPress={handleRestorePurchases}
            disabled={isRestoring}
            style={styles.restoreButton}
            textStyle={styles.restoreButtonText}
          />
          <Text style={[styles.restoreText, isTablet && styles.restoreTextTablet]}>
            Already have a subscription? Restore your purchases here.
          </Text>
        </View>

        {/* Terms and Privacy */}
        <View style={[styles.legalContainer, isTablet && styles.legalContainerTablet]}>
          <Text style={[styles.legalText, isTablet && styles.legalTextTablet]}>
            By subscribing, you agree to our{' '}
            <Text style={styles.legalLink} onPress={() => router.push('/terms')}>
              Terms of Service
            </Text>
            {' '}and{' '}
            <Text style={styles.legalLink} onPress={() => router.push('/privacy')}>
              Privacy Policy
            </Text>
          </Text>
        </View>
      </ScrollView>

      {/* Loading Overlays */}
      <LoadingOverlay 
        visible={isProcessing} 
        type="purchase" 
        message="Processing your subscription..."
      />
      <LoadingOverlay 
        visible={isRestoring} 
        type="restore" 
        message="Checking for previous purchases..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTablet: {
    paddingHorizontal: 48,
    paddingTop: 80,
    paddingBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
  },
  titleTablet: {
    fontSize: 32,
  },
  placeholder: {
    width: 40,
  },
  currentPlanContainer: {
    backgroundColor: Colors.light.card,
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
  },
  currentPlanContainerTablet: {
    marginHorizontal: 48,
    marginBottom: 32,
    padding: 32,
    borderRadius: 20,
  },
  currentPlanTitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  currentPlanTitleTablet: {
    fontSize: 16,
    marginBottom: 6,
  },
  currentPlanName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  currentPlanNameTablet: {
    fontSize: 28,
    marginBottom: 6,
  },
  currentPlanDetails: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  currentPlanDetailsTablet: {
    fontSize: 16,
  },
  plansContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  plansContainerTablet: {
    paddingHorizontal: 48,
    marginBottom: 40,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  restoreContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  restoreContainerTablet: {
    paddingHorizontal: 48,
    marginBottom: 32,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  restoreButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.primary,
    marginBottom: 12,
  },
  restoreButtonText: {
    color: Colors.light.primary,
  },
  restoreText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  restoreTextTablet: {
    fontSize: 16,
  },
  legalContainer: {
    paddingHorizontal: 20,
  },
  legalContainerTablet: {
    paddingHorizontal: 48,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  legalText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  legalTextTablet: {
    fontSize: 14,
    lineHeight: 20,
  },
  legalLink: {
    color: Colors.light.primary,
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    minWidth: 120,
  },
});