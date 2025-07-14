import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  Alert,
  TouchableOpacity
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CreditCard, Shield, Lock, Check, Smartphone } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptions';
import { useUserStore } from '@/store/userStore';

export default function PaymentScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const { updateSubscription } = useUserStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | 'paypal'>('card');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    email: '',
  });
  
  const selectedPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
  
  if (!selectedPlan || selectedPlan.id === 'free') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid plan selected</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="primary" />
      </View>
    );
  }
  
  const handlePayment = async () => {
    // Validate form based on payment method
    if (paymentMethod === 'card') {
      if (!cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name || !cardData.email) {
        Alert.alert('Missing Information', 'Please fill in all payment details.');
        return;
      }
      
      // Basic validation
      if (cardData.number.replace(/\s/g, '').length < 16) {
        Alert.alert('Invalid Card', 'Please enter a valid card number.');
        return;
      }
      
      if (!cardData.email.includes('@')) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return;
      }
    }
    
    setIsProcessing(true);
    
    try {
      let success = false;
      
      if (paymentMethod === 'card') {
        // Process Stripe payment
        success = await processStripePayment();
      } else if (paymentMethod === 'apple') {
        // Process Apple Pay
        success = await processApplePayment();
      } else if (paymentMethod === 'paypal') {
        // Process PayPal payment
        success = await processPayPalPayment();
      }
      
      if (success) {
        // Update subscription
        updateSubscription(planId as any);
        
        Alert.alert(
          "Payment Successful!",
          `Welcome to ${selectedPlan.name}! Your subscription is now active.`,
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
        Alert.alert(
          "Payment Failed",
          "Your payment could not be processed. Please check your payment details and try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        "Payment Error",
        "An unexpected error occurred. Please try again later.",
        [{ text: "OK" }]
      );
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Mock Stripe payment processing
  const processStripePayment = async (): Promise<boolean> => {
    console.log('Processing Stripe payment...');
    
    // In a real app, you would:
    // 1. Create payment intent with Stripe API
    // 2. Confirm payment with card details
    // 3. Handle 3D Secure if required
    // 4. Return success/failure
    
    // Example Stripe integration:
    // const stripe = useStripe();
    // const { error, paymentIntent } = await stripe.confirmPayment({
    //   elements,
    //   confirmParams: {
    //     return_url: 'your-return-url',
    //   },
    // });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    return Math.random() > 0.05; // 95% success rate
  };
  
  // Mock Apple Pay processing
  const processApplePayment = async (): Promise<boolean> => {
    console.log('Processing Apple Pay payment...');
    
    // In a real app, you would:
    // 1. Check Apple Pay availability
    // 2. Create payment request
    // 3. Present Apple Pay sheet
    // 4. Process payment token
    
    // Example Apple Pay integration:
    // const { canMakePayments } = await ApplePay.canMakePayments();
    // if (canMakePayments) {
    //   const paymentRequest = {
    //     merchantIdentifier: 'merchant.com.yourapp',
    //     supportedNetworks: ['visa', 'mastercard', 'amex'],
    //     countryCode: 'US',
    //     currencyCode: 'USD',
    //     paymentSummaryItems: [{
    //       label: selectedPlan.name,
    //       amount: selectedPlan.price
    //     }]
    //   };
    //   const payment = await ApplePay.requestPayment(paymentRequest);
    // }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    return Math.random() > 0.05; // 95% success rate
  };
  
  // Mock PayPal processing
  const processPayPalPayment = async (): Promise<boolean> => {
    console.log('Processing PayPal payment...');
    
    // In a real app, you would:
    // 1. Create PayPal order
    // 2. Open PayPal checkout
    // 3. Handle approval/cancellation
    // 4. Capture payment
    
    // Example PayPal integration:
    // const paypalRequest = {
    //   intent: 'CAPTURE',
    //   purchase_units: [{
    //     amount: {
    //       currency_code: 'USD',
    //       value: selectedPlan.price.replace('$', '').replace('/year', '')
    //     }
    //   }]
    // };
    // const approval = await PayPal.createOrder(paypalRequest);
    
    await new Promise(resolve => setTimeout(resolve, 2500));
    return Math.random() > 0.05; // 95% success rate
  };
  
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };
  
  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
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
        
        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === 'card' && styles.selectedPaymentOption
          ]}
          onPress={() => setPaymentMethod('card')}
        >
          <CreditCard size={24} color={Colors.light.primary} />
          <Text style={styles.paymentOptionText}>Credit/Debit Card (Stripe)</Text>
          {paymentMethod === 'card' && (
            <View style={styles.checkmark}>
              <Check size={16} color="white" />
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === 'apple' && styles.selectedPaymentOption
          ]}
          onPress={() => setPaymentMethod('apple')}
        >
          <Smartphone size={24} color={Colors.light.primary} />
          <Text style={styles.paymentOptionText}>Apple Pay</Text>
          {paymentMethod === 'apple' && (
            <View style={styles.checkmark}>
              <Check size={16} color="white" />
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === 'paypal' && styles.selectedPaymentOption
          ]}
          onPress={() => setPaymentMethod('paypal')}
        >
          <View style={styles.paypalIcon}>
            <Text style={styles.paypalText}>PayPal</Text>
          </View>
          <Text style={styles.paymentOptionText}>PayPal</Text>
          {paymentMethod === 'paypal' && (
            <View style={styles.checkmark}>
              <Check size={16} color="white" />
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      {paymentMethod === 'card' && (
        <View style={styles.cardForm}>
          <Text style={styles.sectionTitle}>Card Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={cardData.email}
              onChangeText={(text) => setCardData(prev => ({ ...prev, email: text }))}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cardholder Name</Text>
            <TextInput
              style={styles.input}
              value={cardData.name}
              onChangeText={(text) => setCardData(prev => ({ ...prev, name: text }))}
              placeholder="John Doe"
              autoCapitalize="words"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Card Number</Text>
            <TextInput
              style={styles.input}
              value={cardData.number}
              onChangeText={(text) => setCardData(prev => ({ ...prev, number: formatCardNumber(text) }))}
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Expiry Date</Text>
              <TextInput
                style={styles.input}
                value={cardData.expiry}
                onChangeText={(text) => setCardData(prev => ({ ...prev, expiry: formatExpiry(text) }))}
                placeholder="MM/YY"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={styles.input}
                value={cardData.cvv}
                onChangeText={(text) => setCardData(prev => ({ ...prev, cvv: text.replace(/\D/g, '').substring(0, 4) }))}
                placeholder="123"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
        </View>
      )}
      
      {paymentMethod === 'apple' && (
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentInfoTitle}>Apple Pay</Text>
          <Text style={styles.paymentInfoText}>
            You will be redirected to Apple Pay to complete your purchase securely using Touch ID, Face ID, or your device passcode.
          </Text>
        </View>
      )}
      
      {paymentMethod === 'paypal' && (
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentInfoTitle}>PayPal</Text>
          <Text style={styles.paymentInfoText}>
            You will be redirected to PayPal to log in and complete your purchase securely.
          </Text>
        </View>
      )}
      
      <View style={styles.securityInfo}>
        <View style={styles.securityHeader}>
          <Shield size={20} color={Colors.light.success} />
          <Text style={styles.securityTitle}>Secure Payment</Text>
        </View>
        <Text style={styles.securityText}>
          Your payment information is encrypted and secure. We never store your card details.
        </Text>
        <View style={styles.securityFeatures}>
          <View style={styles.securityFeature}>
            <Lock size={16} color={Colors.light.success} />
            <Text style={styles.securityFeatureText}>256-bit SSL encryption</Text>
          </View>
          <View style={styles.securityFeature}>
            <Shield size={16} color={Colors.light.success} />
            <Text style={styles.securityFeatureText}>PCI DSS compliant</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title={
            paymentMethod === 'apple' 
              ? `Pay with Apple Pay - ${selectedPlan.price}`
              : paymentMethod === 'paypal'
                ? `Pay with PayPal - ${selectedPlan.price}`
                : `Pay ${selectedPlan.price}`
          }
          onPress={handlePayment}
          variant="primary"
          loading={isProcessing}
          disabled={isProcessing}
          style={styles.payButton}
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
  paymentOptionText: {
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 12,
    flex: 1,
  },
  paypalIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#0070ba',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paypalText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardForm: {
    padding: 20,
    paddingTop: 0,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  paymentInfo: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  paymentInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  paymentInfoText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 18,
  },
  securityInfo: {
    margin: 20,
    padding: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.success,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 8,
  },
  securityText: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 12,
    lineHeight: 18,
  },
  securityFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityFeatureText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginLeft: 4,
  },
  buttonContainer: {
    padding: 20,
  },
  payButton: {
    marginBottom: 12,
  },
  cancelButton: {},
  footer: {
    padding: 20,
    paddingTop: 0,
  },
  footerText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 8,
  },
  footerContact: {
    fontSize: 12,
    color: Colors.light.primary,
    textAlign: 'center',
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
  },
});