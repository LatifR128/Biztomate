import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { BusinessCard } from '@/types';
import Colors from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface CardItemProps {
  card: BusinessCard;
  onPress: (card: BusinessCard) => void;
}

export default function CardItem({ card, onPress }: CardItemProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(card)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{card.name}</Text>
            {card.title && <Text style={styles.title}>{card.title}</Text>}
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
        </View>
        
        {card.company && (
          <Text style={styles.company}>{card.company}</Text>
        )}
        
        <View style={styles.detailsContainer}>
          {card.email && (
            <View style={styles.detailRow}>
              <Ionicons name="mail" size={16} color={Colors.light.primary} />
              <Text style={styles.detailText} numberOfLines={1}>{card.email}</Text>
            </View>
          )}
          
          {card.phone && (
            <View style={styles.detailRow}>
              <Ionicons name="call" size={16} color={Colors.light.primary} />
              <Text style={styles.detailText}>{card.phone}</Text>
            </View>
          )}
          
          {card.website && (
            <View style={styles.detailRow}>
              <Ionicons name="globe" size={16} color={Colors.light.primary} />
              <Text style={styles.detailText} numberOfLines={1}>{card.website}</Text>
            </View>
          )}
          
          {card.address && (
            <View style={styles.detailRow}>
              <Ionicons name="location" size={16} color={Colors.light.primary} />
              <Text style={styles.detailText} numberOfLines={1}>{card.address}</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.date}>Added on {formatDate(card.createdAt)}</Text>
      </View>
      
      {card.imageUri && (
        <Ionicons name="image" source={{ uri: card.imageUri }} 
          style={styles.thumbnail}
          resizeMode="cover"
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  title: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  company: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.primary,
    marginBottom: 8,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: 8,
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginLeft: 12,
  },
});