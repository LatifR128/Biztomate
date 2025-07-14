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
import { Check, AlertCircle, CreditCard, Shield } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/userStore';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptions';
import SubscriptionCard from '@/components/SubscriptionCard';
import Button from '@/components/Button';
import { SubscriptionPlan } from '@/types';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user, updateSubscription } = useUserStore();
  const [selectedPlan, setSelectedPlan] = useState<string>(user.subscriptionPlan);
  
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan.id);
  };
  
  const handleSubscribe = async () => {
    if (selectedPlan === user.subscriptionPlan) {
      router.back();
      return;
    }
    
    if (selectedPlan === 'free') {
      Alert.alert('Free Plan', 'You are already on the free trial plan.');
      return;
    }
    
    // Navigate to payment screen
    router.push(`/payment?planId=${selectedPlan}`);
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
            <CreditCard size={20} color={Colors.light.primary} />
            <Text style={styles.paymentTitle}>Multiple Payment Options</Text>
          </View>
          <Text style={styles.paymentText}>
            We support Credit/Debit Cards (Stripe), Apple Pay, and PayPal for your convenience. All payments are secure and encrypted.
          </Text>
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoHeader}>
            <AlertCircle size={20} color={Colors.light.primary} />
            <Text style={styles.infoTitle}>Subscription Information</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Check size={16} color={Colors.light.success} />
            <Text style={styles.infoText}>
              All plans include AI-powered OCR technology for scanning business cards
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Check size={16} color={Colors.light.success} />
            <Text style={styles.infoText}>
              Subscriptions are billed annually with automatic renewal
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Check size={16} color={Colors.light.success} />
            <Text style={styles.infoText}>
              Cancel anytime from your account settings - no cancellation fees
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Check size={16} color={Colors.light.success} />
            <Text style={styles.infoText}>
              Unused scans do not roll over to the next billing cycle
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Shield size={16} color={Colors.light.success} />
            <Text style={styles.infoText}>
              30-day money-back guarantee on all paid plans
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Check size={16} color={Colors.light.success} />
            <Text style={styles.infoText}>
              Duplicate detection system prevents scanning the same card twice
            </Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
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
        
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
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
    padding: 16,
    marginBottom: 8,
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
  },
  plansContainer: {
    padding: 16,
    paddingTop: 0,
  },
  paymentInfo: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.light.highlight,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
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
    color: Colors.light.text,
    lineHeight: 18,
  },
  infoContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
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
  infoItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
  },
  selectedPlanSummary: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.light.highlight,
    borderRadius: 8,
    width: '100%',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  subscribeButton: {
    width: '100%',
    marginBottom: 16,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '500',
  },
});