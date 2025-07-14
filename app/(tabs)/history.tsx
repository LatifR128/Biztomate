import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Plus, FileText, Share2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCardStore } from '@/store/cardStore';
import { BusinessCard } from '@/types';
import CardItem from '@/components/CardItem';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';
import TrialBanner from '@/components/TrialBanner';

export default function HistoryScreen() {
  const router = useRouter();
  const { cards, searchCards } = useCardStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const filteredCards = searchQuery 
    ? searchCards(searchQuery) 
    : cards;
  
  const handleCardPress = (card: BusinessCard) => {
    router.push(`/card/${card.id}`);
  };
  
  const handleScan = () => {
    router.push('/');
  };
  
  const handleExport = () => {
    router.push('/export');
  };
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // In a real app, you might fetch updated data here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  const renderEmptyState = () => {
    if (searchQuery && filteredCards.length === 0) {
      return (
        <EmptyState
          title="No Results Found"
          message="Try adjusting your search or scan new cards."
          icon={<Search size={48} color={Colors.light.textSecondary} />}
        />
      );
    }
    
    return (
      <EmptyState
        title="No Cards Yet"
        message="Start scanning business cards to build your collection."
        actionLabel="Scan a Card"
        onAction={handleScan}
        icon={<Plus size={48} color={Colors.light.primary} />}
      />
    );
  };
  
  return (
    <View style={styles.container}>
      <TrialBanner />
      
      {cards.length > 0 && (
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.light.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cards..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      <FlatList
        data={filteredCards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CardItem card={item} onPress={handleCardPress} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.primary]}
            tintColor={Colors.light.primary}
          />
        }
      />
      
      {cards.length > 0 && (
        <View style={styles.actionContainer}>
          <Button
            title="Export Cards"
            onPress={handleExport}
            variant="primary"
            icon={<FileText size={20} color="white" style={{ marginRight: 8 }} />}
          />
          
          <View style={styles.brandingContainer}>
            <Text style={styles.brandingText}>Empowered by Biztomate Inc.</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    margin: 16,
    marginBottom: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: Colors.light.text,
  },
  clearButton: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    flexGrow: 1,
  },
  actionContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  brandingContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  brandingText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
});