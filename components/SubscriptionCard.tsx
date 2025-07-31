import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SubscriptionPlan } from '@/types';
import Colors from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  isSelected: boolean;
  onSelect: (plan: SubscriptionPlan) => void;
}

export default function SubscriptionCard({ 
  plan, 
  isSelected, 
  onSelect 
}: SubscriptionCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer
      ]}
      onPress={() => onSelect(plan)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{plan.name}</Text>
        <Text style={styles.price}>{plan.price}</Text>
      </View>
      
      <View style={styles.limitContainer}>
        <Text style={styles.limitText}>
          {plan.cardsLimit === Infinity ? 'Unlimited' : plan.cardsLimit} Cards
        </Text>
      </View>
      
      <View style={styles.featuresContainer}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Ionicons name="checkmark" size={16} color={Colors.light.primary} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
      
      {isSelected && (
        <View style={styles.selectedBadge}>
          <Text style={styles.selectedText}>Selected</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedContainer: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.highlight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  limitContainer: {
    backgroundColor: Colors.light.highlight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  limitText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.primary,
    textAlign: 'center',
  },
  featuresContainer: {
    marginTop: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: 8,
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});