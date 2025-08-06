import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Alert,
  Share,
  Linking
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useCardStore } from '@/store/cardStore';
import Button from '@/components/Button';
import CardDetailField from '@/components/CardDetailField';

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getCard, updateCard, deleteCard } = useCardStore();
  const [isEditing, setIsEditing] = useState(false);
  
  const card = getCard(id);
  
  if (!card) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Card not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()} 
          variant="primary"
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }
  
  const handleEdit = () => {
    router.push(`/card/edit/${id}`);
  };
  
  const handleDelete = () => {
    Alert.alert(
      "Delete Card",
      "Are you sure you want to delete this card? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            deleteCard(id);
            router.back();
          }
        }
      ]
    );
  };
  
  const handleShare = async () => {
    try {
      const message = `
Contact Information:
${card.name}
${card.title ? card.title + '\n' : ''}${card.company ? card.company + '\n' : ''}
${card.email ? 'Email: ' + card.email + '\n' : ''}${card.phone ? 'Phone: ' + card.phone + '\n' : ''}${card.website ? 'Website: ' + card.website + '\n' : ''}${card.address ? 'Address: ' + card.address : ''}
      `.trim();
      
      await Share.share({
        message,
        title: `Contact: ${card.name}`,
      });
    } catch (error) {
      console.error('Error sharing card:', error);
    }
  };
  
  const handleEmail = () => {
    if (card.email) {
      Linking.openURL(`mailto:${card.email}`);
    }
  };
  
  const handleCall = () => {
    if (card.phone) {
      Linking.openURL(`tel:${card.phone}`);
    }
  };
  
  const handleWebsite = () => {
    if (card.website) {
      let url = card.website;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      Linking.openURL(url);
    }
  };
  
  const handleAddress = () => {
    if (card.address) {
      Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(card.address)}`);
    }
  };
  
  const handleUpdateField = (field: string, value: string) => {
    updateCard(id, { [field]: value, updatedAt: Date.now() });
  };
  
  return (
    <ScrollView style={[
      styles.container,
      { 
        paddingTop: insets.top,
        paddingBottom: insets.bottom 
      }
    ]}>
      <View style={styles.header}>
        {card.imageUri ? (
          <Image source={{ uri: card.imageUri }} 
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="document-text" size={48} color={Colors.light.textSecondary} />
          </View>
        )}
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleEdit}
          >
            <Ionicons name="create" size={20} color={Colors.light.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Ionicons name="share" size={20} color={Colors.light.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={20} color={Colors.light.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.nameSection}>
          <Text style={styles.name}>{card.name}</Text>
          {card.title && <Text style={styles.title}>{card.title}</Text>}
          {card.company && <Text style={styles.company}>{card.company}</Text>}
        </View>
        
        <View style={styles.actionButtons}>
          {card.email && (
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={handleEmail}
            >
              <Ionicons name="mail" size={20} color="white" />
              <Text style={styles.contactButtonText}>Email</Text>
            </TouchableOpacity>
          )}
          
          {card.phone && (
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={handleCall}
            >
              <Ionicons name="call" size={20} color="white" />
              <Text style={styles.contactButtonText}>Call</Text>
            </TouchableOpacity>
          )}
          
          {card.website && (
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={handleWebsite}
            >
              <Ionicons name="globe" size={20} color="white" />
              <Text style={styles.contactButtonText}>Website</Text>
            </TouchableOpacity>
          )}
          
          {card.address && (
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={handleAddress}
            >
              <Ionicons name="location" size={20} color="white" />
              <Text style={styles.contactButtonText}>Map</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.detailsSection}>
          <CardDetailField
            label="Name"
            value={card.name}
            onUpdate={(value) => handleUpdateField('name', value)}
          />
          
          <CardDetailField
            label="Title"
            value={card.title || ''}
            onUpdate={(value) => handleUpdateField('title', value)}
            placeholder="Add title"
          />
          
          <CardDetailField
            label="Company"
            value={card.company || ''}
            onUpdate={(value) => handleUpdateField('company', value)}
            placeholder="Add company"
          />
          
          <CardDetailField
            label="Email"
            value={card.email || ''}
            onUpdate={(value) => handleUpdateField('email', value)}
            placeholder="Add email"
          />
          
          <CardDetailField
            label="Phone"
            value={card.phone || ''}
            onUpdate={(value) => handleUpdateField('phone', value)}
            placeholder="Add phone"
          />
          
          <CardDetailField
            label="Website"
            value={card.website || ''}
            onUpdate={(value) => handleUpdateField('website', value)}
            placeholder="Add website"
          />
          
          <CardDetailField
            label="Address"
            value={card.address || ''}
            onUpdate={(value) => handleUpdateField('address', value)}
            placeholder="Add address"
            multiline
          />
          
          <CardDetailField
            label="Notes"
            value={card.notes || ''}
            onUpdate={(value) => handleUpdateField('notes', value)}
            placeholder="Add notes"
            multiline
          />
        </View>
        
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>
            Added on {new Date(card.createdAt).toLocaleDateString()}
          </Text>
          {card.updatedAt !== card.createdAt && (
            <Text style={styles.dateText}>
              Last updated on {new Date(card.updatedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
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
    backgroundColor: Colors.light.card,
    padding: 16,
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    padding: 16,
  },
  nameSection: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.text,
  },
  title: {
    fontSize: 18,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  company: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.light.primary,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12,
    marginBottom: 12,
  },
  contactButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },
  detailsSection: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  dateInfo: {
    marginTop: 8,
    marginBottom: 24,
  },
  dateText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.light.textSecondary,
  },
});