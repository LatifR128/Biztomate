import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { SubscriptionPlan } from '@/types';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  isSelected: boolean;
  onSelect: (plan: SubscriptionPlan) => void;
  onSubscribe?: (plan: SubscriptionPlan) => void;
  isCurrentPlan?: boolean;
  isAvailable?: boolean;
  price?: string;
  product?: any;
}

export default function SubscriptionCard({ 
  plan, 
  isSelected, 
  onSelect, 
  onSubscribe, 
  isCurrentPlan = false, 
  isAvailable = true, 
  price, 
  product 
}: SubscriptionCardProps) {
  const isDisabled = !isAvailable || isCurrentPlan;
  
  const handlePress = () => {
    if (isDisabled) return;
    if (onSubscribe && !isCurrentPlan) {
      onSubscribe(plan);
    } else {
      onSelect(plan);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container, 
        isSelected && styles.selectedContainer, 
        isDisabled && styles.disabledContainer,
        isCurrentPlan && styles.currentPlanContainer,
        isTablet && styles.containerTablet
      ]}
      onPress={handlePress}
      activeOpacity={isDisabled ? 1 : 0.8}
      disabled={isDisabled}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, isTablet && styles.titleTablet]}>{plan.name}</Text>
          {isCurrentPlan && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Current</Text>
            </View>
          )}
        </View>
        <Text style={[styles.price, isTablet && styles.priceTablet]}>
          {price || plan.price}
        </Text>
      </View>

      {/* Features */}
      <View style={styles.featuresContainer}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Ionicons 
              name="checkmark-circle" 
              size={isTablet ? 20 : 16} 
              color={Colors.light.primary} 
            />
            <Text style={[styles.featureText, isTablet && styles.featureTextTablet]}>
              {feature}
            </Text>
          </View>
        ))}
      </View>

      {/* Card Limit */}
      <View style={styles.limitContainer}>
        <Ionicons name="card" size={isTablet ? 20 : 16} color={Colors.light.textSecondary} />
        <Text style={[styles.limitText, isTablet && styles.limitTextTablet]}>
          {plan.cardsLimit === Infinity ? 'Unlimited' : `${plan.cardsLimit} cards`} per year
        </Text>
      </View>

      {/* Action Button */}
      {!isCurrentPlan && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.subscribeButton, isTablet && styles.subscribeButtonTablet]}
            onPress={() => onSubscribe?.(plan)}
            disabled={!isAvailable}
          >
            <Text style={[styles.subscribeButtonText, isTablet && styles.subscribeButtonTextTablet]}>
              {isAvailable ? 'Subscribe' : 'Unavailable'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Selected Indicator */}
      {isSelected && !isCurrentPlan && (
        <View style={[styles.selectedIndicator, isTablet && styles.selectedIndicatorTablet]}>
          <Ionicons name="checkmark" size={isTablet ? 24 : 20} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  containerTablet: {
    padding: 32,
    marginBottom: 24,
    borderRadius: 20,
  },
  selectedContainer: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.highlight,
  },
  disabledContainer: {
    opacity: 0.6,
  },
  currentPlanContainer: {
    borderColor: Colors.light.secondary,
    backgroundColor: Colors.light.highlight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginRight: 8,
  },
  titleTablet: {
    fontSize: 24,
  },
  currentBadge: {
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  priceTablet: {
    fontSize: 22,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  featureTextTablet: {
    fontSize: 16,
    marginLeft: 10,
  },
  limitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  limitText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 8,
  },
  limitTextTablet: {
    fontSize: 16,
    marginLeft: 10,
  },
  actionContainer: {
    marginTop: 8,
  },
  subscribeButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  subscribeButtonTablet: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  subscribeButtonTextTablet: {
    fontSize: 18,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorTablet: {
    top: 16,
    right: 16,
    borderRadius: 16,
    width: 32,
    height: 32,
  },
});