import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';

interface TrialBannerProps {
  onUpgrade?: () => void;
  showUpgradeButton?: boolean;
}

export default function TrialBanner({ onUpgrade, showUpgradeButton = true }: TrialBannerProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { user: userData, isTrialActive, getTrialDaysLeft } = useUserStore();

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Check if user is authenticated
      if (!user) {
        // If not authenticated, go to signup page
        router.push('/auth/signup' as any);
      } else {
        // If authenticated, go to subscription page
        router.push('/subscription' as any);
      }
    }
  };

  const handleExtendTrial = () => {
    Alert.alert(
      'Extend Trial',
      'Would you like to extend your trial by 2 more days?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Extend', 
          onPress: () => {
            // In a real app, you might want to show a form or contact support
            Alert.alert(
              'Contact Support',
              'Please contact support to extend your trial.',
              [{ text: 'OK' }]
            );
          }
        },
      ]
    );
  };

  // Don't show banner if trial is not active
  if (!isTrialActive()) {
    return null;
  }

  const daysRemaining = getTrialDaysLeft();
  const isExpiringSoon = daysRemaining <= 1;

  return (
    <View style={[
      styles.container,
      isExpiringSoon ? styles.expiringContainer : styles.activeContainer
    ]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={isExpiringSoon ? "warning" : "star"} 
            size={20} 
            color={isExpiringSoon ? Colors.light.warning : Colors.light.primary} 
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isExpiringSoon ? 'Trial Expiring Soon!' : 'Free Trial Active'}
          </Text>
          <Text style={styles.subtitle}>
            {isExpiringSoon 
              ? `Your trial expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`
              : `${daysRemaining} days remaining in your trial`
            }
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          {showUpgradeButton && (
            <TouchableOpacity
              style={[styles.button, styles.upgradeButton]}
              onPress={handleUpgrade}
            >
              <Text style={styles.upgradeButtonText}>Upgrade</Text>
            </TouchableOpacity>
          )}
          
          {isExpiringSoon && (
            <TouchableOpacity
              style={[styles.button, styles.extendButton]}
              onPress={handleExtendTrial}
            >
              <Text style={styles.extendButtonText}>Extend</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeContainer: {
    backgroundColor: Colors.light.highlight,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  expiringContainer: {
    backgroundColor: Colors.light.overlay.warning,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.warning,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  upgradeButton: {
    backgroundColor: Colors.light.primary,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  extendButton: {
    backgroundColor: Colors.light.warning,
  },
  extendButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});