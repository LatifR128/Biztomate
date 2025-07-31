import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { 
  checkApplePayAvailability, 
  processApplePayWithStripe,
  showApplePaySetupAlert 
} from '@/lib/applePay';

interface ApplePayTestProps {
  onTestComplete?: (success: boolean) => void;
}

export default function ApplePayTest({ onTestComplete }: ApplePayTestProps) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    try {
      const status = await checkApplePayAvailability();
      setIsAvailable(status.canMakePaymentsWithActiveCard);
    } catch (error) {
      console.error('Error checking Apple Pay availability:', error);
      setIsAvailable(false);
    }
  };

  const runTest = async () => {
    if (!isAvailable) {
      showApplePaySetupAlert();
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const testItems = [
        {
          label: 'Test Subscription',
          amount: 999, // $9.99 in cents
        }
      ];

      const result = await processApplePayWithStripe(
        testItems,
        999,
        'test_client_secret'
      );

      if (result.success) {
        setTestResult('✅ Apple Pay test successful!');
        Alert.alert(
          'Test Successful',
          'Apple Pay is working correctly. Payment token: ' + result.paymentToken?.substring(0, 20) + '...'
        );
        onTestComplete?.(true);
      } else {
        setTestResult('❌ Apple Pay test failed: ' + result.error);
        Alert.alert('Test Failed', result.error || 'Unknown error occurred');
        onTestComplete?.(false);
      }
    } catch (error: any) {
      setTestResult('❌ Test error: ' + error.message);
      Alert.alert('Test Error', error.message || 'An unexpected error occurred');
      onTestComplete?.(false);
    } finally {
      setIsTesting(false);
    }
  };

  if (Platform.OS !== 'ios') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Apple Pay Test</Text>
        <View style={styles.notAvailable}>
          <Ionicons name="phone-portrait" size={48} color={Colors.light.textSecondary} />
          <Text style={styles.notAvailableText}>Apple Pay is only available on iOS devices</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apple Pay Test</Text>
      
      <View style={styles.statusContainer}>
        <View style={styles.statusRow}>
          <Ionicons 
            name="phone-portrait" 
            size={24} 
            color={isAvailable ? Colors.light.success : Colors.light.error} 
          />
          <Text style={styles.statusText}>
            Apple Pay: {isAvailable === null ? 'Checking...' : isAvailable ? 'Available' : 'Not Available'}
          </Text>
        </View>
        
        {isAvailable === false && (
          <Text style={styles.helpText}>
            Make sure Apple Pay is set up in Settings {'>'} Wallet & Apple Pay
          </Text>
        )}
      </View>

      {testResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{testResult}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.testButton,
          (!isAvailable || isTesting) && styles.disabledButton
        ]}
        onPress={runTest}
        disabled={!isAvailable || isTesting}
      >
        {isTesting ? (
          <Text style={styles.testButtonText}>Testing...</Text>
        ) : (
          <>
            <Ionicons name="play" size={20} color="white" />
            <Text style={styles.testButtonText}>Run Apple Pay Test</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Test Information:</Text>
        <Text style={styles.infoText}>• Tests Apple Pay availability</Text>
        <Text style={styles.infoText}>• Simulates a $9.99 payment</Text>
        <Text style={styles.infoText}>• No actual charges will be made</Text>
        <Text style={styles.infoText}>• Requires Apple Pay setup on device</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  notAvailable: {
    alignItems: 'center',
    padding: 40,
  },
  notAvailableText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  statusContainer: {
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  helpText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
  },
  resultContainer: {
    backgroundColor: Colors.light.highlight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  resultText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
  },
  testButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
}); 