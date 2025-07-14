import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'expo-router';
import { AlertTriangle } from 'lucide-react-native';

export default function TrialBanner() {
  const router = useRouter();
  const { isTrialActive, getTrialDaysLeft, canScanMore, getRemainingCards } = useUserStore();
  
  const trialDaysLeft = getTrialDaysLeft();
  const remainingCards = getRemainingCards();
  
  const handleUpgrade = () => {
    router.push('/subscription');
  };
  
  if (!isTrialActive() && remainingCards <= 0) {
    return (
      <View style={[styles.container, styles.expiredContainer]}>
        <AlertTriangle size={18} color="white" />
        <Text style={styles.text}>
          Your trial has expired. Upgrade now to continue scanning.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleUpgrade}>
          <Text style={styles.buttonText}>Upgrade</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (!canScanMore()) {
    return (
      <View style={[styles.container, styles.limitContainer]}>
        <AlertTriangle size={18} color="white" />
        <Text style={styles.text}>
          You've reached your scan limit. Upgrade for more scans.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleUpgrade}>
          <Text style={styles.buttonText}>Upgrade</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (isTrialActive() && trialDaysLeft <= 1) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          {trialDaysLeft === 0 
            ? "Your trial ends today! " 
            : `${trialDaysLeft} day left in your trial. `}
          {remainingCards} scans remaining.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleUpgrade}>
          <Text style={styles.buttonText}>Upgrade</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (isTrialActive()) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          {trialDaysLeft} days left in your trial. {remainingCards} scans remaining.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleUpgrade}>
          <Text style={styles.buttonText}>Upgrade</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return null;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expiredContainer: {
    backgroundColor: Colors.light.error,
  },
  limitContainer: {
    backgroundColor: Colors.light.warning,
  },
  text: {
    color: 'white',
    fontSize: 14,
    flex: 1,
    marginLeft: 8,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});