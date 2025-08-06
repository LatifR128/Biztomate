import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  type?: 'default' | 'purchase' | 'validation' | 'restore';
}

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

export default function LoadingOverlay({ 
  visible, 
  message, 
  type = 'default' 
}: LoadingOverlayProps) {
  const insets = useSafeAreaInsets();
  
  const getLoadingContent = () => {
    switch (type) {
      case 'purchase':
        return {
          icon: 'card',
          title: 'Processing Purchase',
          defaultMessage: 'Please wait while we process your payment...'
        };
      case 'validation':
        return {
          icon: 'shield-checkmark',
          title: 'Validating Receipt',
          defaultMessage: 'Verifying your purchase with Apple...'
        };
      case 'restore':
        return {
          icon: 'refresh',
          title: 'Restoring Purchases',
          defaultMessage: 'Checking for previous purchases...'
        };
      default:
        return {
          icon: 'hourglass',
          title: 'Loading',
          defaultMessage: 'Please wait...'
        };
    }
  };

  const content = getLoadingContent();

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={[
        styles.overlay,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right
        }
      ]}>
        <View style={[
          styles.container,
          isTablet && styles.containerTablet
        ]}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={content.icon as any} 
              size={isTablet ? 56 : 48} 
              color={Colors.light.primary} 
            />
          </View>
          
          <Text style={[
            styles.title,
            isTablet && styles.titleTablet
          ]}>{content.title}</Text>
          
          <Text style={[
            styles.message,
            isTablet && styles.messageTablet
          ]}>
            {message || content.defaultMessage}
          </Text>
          
          <ActivityIndicator 
            size="large" 
            color={Colors.light.primary} 
            style={styles.spinner}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    padding: 32,
    margin: 20,
    alignItems: 'center',
    width: Math.min(width * 0.85, 320),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  containerTablet: {
    width: Math.min(width * 0.6, 400),
    padding: 40,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  titleTablet: {
    fontSize: 24,
  },
  message: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  messageTablet: {
    fontSize: 18,
  },
  spinner: {
    marginTop: 8,
  },
}); 