import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useCardStore } from '@/store/cardStore';
import { useAuthStore } from '@/store/authStore';
import { BusinessCard } from '@/types';
import CardItem from '@/components/CardItem';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';
import TrialBanner from '@/components/TrialBanner';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cards, searchCards, loadCards, syncCards, deleteCard, isLoading, error } = useCardStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  const filteredCards = searchQuery 
    ? searchCards(searchQuery) 
    : cards;
  
  // Load cards when component mounts
  useEffect(() => {
    if (user) {
      loadCards();
    }
  }, [user]);
  
  const handleCardPress = (card: BusinessCard) => {
    if (isSelectionMode) {
      // Toggle selection
      const newSelected = new Set(selectedCards);
      if (newSelected.has(card.id)) {
        newSelected.delete(card.id);
      } else {
        newSelected.add(card.id);
      }
      setSelectedCards(newSelected);
    } else {
      // Navigate to card detail
      router.push(`/card/${card.id}`);
    }
  };
  
  const handleLongPress = (card: BusinessCard) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedCards(new Set([card.id]));
    }
  };
  
  const handleScan = () => {
    router.push('/');
  };
  
  const handleExport = () => {
    router.push('/export');
  };
  
  const handleSelectAll = () => {
    if (selectedCards.size === filteredCards.length) {
      setSelectedCards(new Set());
    } else {
      setSelectedCards(new Set(filteredCards.map(card => card.id)));
    }
  };
  
  const handleDeleteSelected = () => {
    if (selectedCards.size === 0) return;
    
    Alert.alert(
      'Delete Cards',
      `Are you sure you want to delete ${selectedCards.size} card${selectedCards.size > 1 ? 's' : ''}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const cardId of selectedCards) {
                await deleteCard(cardId);
              }
              setSelectedCards(new Set());
              setIsSelectionMode(false);
              Alert.alert('Success', 'Selected cards have been deleted.');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete some cards. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedCards(new Set());
  };
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await syncCards();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [syncCards]);
  
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading your cards...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <EmptyState
          title="Error Loading Cards"
          message={error}
          actionLabel="Try Again"
          onAction={() => loadCards()}
          icon={<Ionicons name="alert-circle" size={48} color={Colors.light.error} />}
        />
      );
    }
    
    if (searchQuery && filteredCards.length === 0) {
      return (
        <EmptyState
          title="No Results Found"
          message="Try adjusting your search or scan new cards."
          icon={<Ionicons name="search" size={48} color={Colors.light.textSecondary} />}
        />
      );
    }
    
    return (
      <EmptyState
        title="You Haven't Used the App Yet."
        message="Start scanning business cards to build your digital collection and never lose contact information again."
        actionLabel="Scan Your First Card"
        onAction={handleScan}
        icon={<Ionicons name="scan" size={48} color={Colors.light.primary} />}
      />
    );
  };
  
  const renderHeader = () => {
    if (isSelectionMode) {
      return (
        <View style={styles.selectionHeader}>
          <TouchableOpacity onPress={handleCancelSelection}>
            <Ionicons name="close" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.selectionTitle}>
            {selectedCards.size} selected
          </Text>
          <TouchableOpacity onPress={handleSelectAll}>
            <Text style={styles.selectAllText}>
              {selectedCards.size === filteredCards.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Card History</Text>
          {cards.length > 0 && (
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => setIsSelectionMode(true)}
            >
              <Ionicons name="ellipsis-vertical" size={24} color={Colors.light.text} />
            </TouchableOpacity>
          )}
        </View>
        
        {cards.length > 0 && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.light.textSecondary} />
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
      </View>
    );
  };
  
  const renderCardItem = ({ item }: { item: BusinessCard }) => (
    <CardItem 
      card={item} 
      onPress={handleCardPress}
      onLongPress={handleLongPress}
      isSelected={selectedCards.has(item.id)}
      showSelection={isSelectionMode}
    />
  );
  
  return (
    <View style={[
      styles.container,
      { 
        paddingTop: insets.top,
        paddingBottom: insets.bottom 
      }
    ]}>
      <TrialBanner />
      
      {renderHeader()}
      
      <FlatList
        data={filteredCards}
        keyExtractor={(item) => item.id}
        renderItem={renderCardItem}
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
      
      {/* Selection Mode Actions */}
      {isSelectionMode && selectedCards.size > 0 && (
        <View style={styles.selectionActions}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteSelected}
          >
            <Ionicons name="trash" size={20} color="white" />
            <Text style={styles.deleteButtonText}>
              Delete ({selectedCards.size})
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Normal Actions */}
      {cards.length > 0 && !isSelectionMode && (
        <View style={styles.actionContainer}>
          <Button
            title="Export Cards"
            onPress={handleExport}
            variant="primary"
            icon={<Ionicons name="document-text" size={20} color="white" style={{ marginRight: 8 }} />}
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
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  menuButton: {
    padding: 8,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.primary,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  selectAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  selectionActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.error,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
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