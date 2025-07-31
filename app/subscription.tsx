import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/userStore';
import { useReceiptStore } from '@/store/receiptStore';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptions';
import SubscriptionCard from '@/components/SubscriptionCard';
import Button from '@/components/Button';
import { SubscriptionPlan } from '@/types';
import { restorePurchases, showRestoreSuccessAlert } from '@/lib/inAppPurchases';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user, updateSubscription } = useUserStore();
  const { addReceipt } = useReceiptStore();
  const [selectedPlan, setSelectedPlan] = useState<string>(user.subscriptionPlan);
  const [isRestoring, setIsRestoring] = useState(false);
  
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan.id);
  };
  
  const handleSubscribe = async () => {
    if (selectedPlan === user.subscriptionPlan) {
      router.back();
      return;
    }
    
    // Navigate to payment screen
    router.push(`/payment?planId=${selectedPlan}`);
  };

  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    
    try {
      const results = await restorePurchases();
      const successfulRestores = results.filter(result => result.success);
      
      if (successfulRestores.length > 0) {
        // Store all restored receipts
        successfulRestores.forEach(result => {
          if (result.receiptData && result.transactionId && result.productId) {
            addReceipt({
              productId: result.productId,
              transactionId: result.transactionId,
              originalTransactionId: result.originalTransactionId || result.transactionId,
              receiptData: result.receiptData,
              purchaseDate: result.purchaseDate || new Date().toISOString(),
              expiresDate: result.expiresDate,
              isValid: true,
              environment: 'Production' as const,
            });
          }
        });
        
        // Find the highest tier restored subscription
        const restoredProductIds = successfulRestores.map(result => result.productId);
        const restoredPlans = SUBSCRIPTION_PLANS.filter(plan => 
          restoredProductIds.includes(plan.productId)
        );
        
        if (restoredPlans.length > 0) {
          // Sort by cards limit to find the highest tier
          const highestPlan = restoredPlans.sort((a, b) => b.cardsLimit - a.cardsLimit)[0];
          updateSubscription(highestPlan.id as any);
          
          console.log(`Restored subscription: ${highestPlan.name} (${__DEV__ ? 'Sandbox' : 'Production'})`);
        }
      }
      
      showRestoreSuccessAlert(successfulRestores.length);
      
    } catch (error) {
      console.error('Restore purchases error:', error);
      Alert.alert(
        "Restore Failed",
        "Failed to restore purchases. Please try again or contact support.",
        [{ text: "OK" }]
      );
    } finally {
      setIsRestoring(false);
    }
  };
  
  const selectedPlanDetails = SUBSCRIPTION_PLANS.find(plan => plan.id === selectedPlan);
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>
            Select the plan that best fits your needs
          </Text>
        </View>
        
        <View style={styles.plansContainer}>
          {SUBSCRIPTION_PLANS.map((plan) => (
            <SubscriptionCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan === plan.id}
              onSelect={handleSelectPlan}
            />
          ))}
        </View>
        
        <View style={styles.paymentInfo}>
          <View style={styles.paymentHeader}>
            <Ionicons name="card" size={20} color={Colors.light.primary} />
            <Text style={styles.paymentTitle}>Secure App Store Purchase</Text>
          </View>
          <Text style={styles.paymentText}>
            All purchases are processed securely through the App Store using your Apple ID payment method. Your payment information is protected by Apple's security standards.
          </Text>
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoHeader}>
            <Ionicons name="alert-circle" size={20} color={Colors.light.primary} />
            <Text style={styles.infoTitle}>Important Information</Text>
          </View>
          <Text style={styles.infoText}>
            • Subscriptions automatically renew unless auto-renew is turned off at least 24 hours before the end of the current period
          </Text>
          <Text style={styles.infoText}>
            • You can manage and turn off auto-renewal in your Apple ID Account Settings at any time after purchase
          </Text>
          <Text style={styles.infoText}>
            • Payment will be charged to your Apple ID account at confirmation of purchase
          </Text>
        </View>

        {selectedPlanDetails && selectedPlan !== 'free' && (
          <View style={styles.selectedPlanSummary}>
            <Text style={styles.summaryText}>
              Selected: {selectedPlanDetails.name} - {selectedPlanDetails.price}
            </Text>
            <Text style={styles.summarySubtext}>
              {selectedPlanDetails.cardsLimit === Infinity ? 'Unlimited' : selectedPlanDetails.cardsLimit} cards per year
            </Text>
          </View>
        )}
        
        <Button
          title={
            selectedPlan === 'free' 
              ? "Continue with Free Trial" 
              : selectedPlan === user.subscriptionPlan 
                ? "Current Plan" 
                : `Subscribe to ${selectedPlanDetails?.name || 'Plan'}`
          }
          onPress={handleSubscribe}
          variant="primary"
          disabled={selectedPlan === user.subscriptionPlan && selectedPlan !== 'free'}
          style={styles.subscribeButton}
        />

        <TouchableOpacity 
          style={styles.restoreButton}
          onPress={handleRestorePurchases}
          disabled={isRestoring}
        >
          <Ionicons 
            name="refresh" 
            size={16} 
            color={Colors.light.primary} 
            style={[styles.restoreIcon, isRestoring && styles.restoringIcon]}
          />
          <Text style={[styles.restoreText, isRestoring && styles.restoringText]}>
            {isRestoring ? 'Restoring...' : 'Restore Purchases'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
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
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  plansContainer: {
    padding: 20,
    gap: 16,
  },
  paymentInfo: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 8,
  },
  paymentText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  infoContainer: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: Colors.light.highlight,
    borderRadius: 12,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  selectedPlanSummary: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  subscribeButton: {
    margin: 20,
    marginTop: 0,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  restoreIcon: {
    marginRight: 8,
  },
  restoringIcon: {
    opacity: 0.5,
  },
  restoreText: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  restoringText: {
    opacity: 0.5,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.light.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
});