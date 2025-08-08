import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  Dimensions
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import TrialBanner from '@/components/TrialBanner';
import { useCardStore } from '@/store/cardStore';
import { useUserStore } from '@/store/userStore';
import { processBusinessCard } from '@/utils/ocrUtils';
import { BusinessCard } from '@/types';
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');
  
  const { addCard, checkDuplicate } = useCardStore();
  const { canScanMore, incrementScannedCards, isTrialActive } = useUserStore();
  
  const cameraRef = useRef<any>(null);
  
  useEffect(() => {
    requestPermission();
  }, []);
  
  const showDuplicateAlert = (existingCard: BusinessCard, newCard: BusinessCard) => {
    Alert.alert(
      "Duplicate Contact Detected",
      `This contact appears to already exist in your collection:\n\n📋 Existing: ${existingCard.name}${existingCard.company ? `\n🏢 Company: ${existingCard.company}` : ''}${existingCard.email ? `\n📧 Email: ${existingCard.email}` : ''}${existingCard.phone ? `\n📞 Phone: ${existingCard.phone}` : ''}\n\n📋 New: ${newCard.name}${newCard.company ? `\n🏢 Company: ${newCard.company}` : ''}${newCard.email ? `\n📧 Email: ${newCard.email}` : ''}${newCard.phone ? `\n📞 Phone: ${newCard.phone}` : ''}\n\nWould you like to view the existing card or add this as a new contact?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "View Existing", 
          onPress: () => router.push(`/card/${existingCard.id}`)
        },
        { 
          text: "Add as New", 
          onPress: () => {
            // Force add the card with enhanced duplicate handling
            const cardWithNewId: BusinessCard = {
              ...newCard,
              id: Date.now().toString() + '_manual_add',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              _manualOverride: true, // Mark as manually added
            };
            
            // Bypass duplicate check by directly updating the store
            const currentCards = useCardStore.getState().cards;
            useCardStore.setState({ cards: [cardWithNewId, ...currentCards] });
            incrementScannedCards();
            router.push(`/card/${cardWithNewId.id}`);
          }
        }
      ]
    );
  };
  
  const handleCapture = async () => {
    if (!canScanMore()) {
      Alert.alert(
        "Scan Limit Reached",
        "You've reached your scan limit. Upgrade your plan to continue scanning.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Upgrade", onPress: () => router.push('/subscription') }
        ]
      );
      return;
    }
    
    try {
      setIsCapturing(true);
      
      if (Platform.OS !== 'web' && cameraRef.current) {
        // Capture photo from camera on mobile
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.8,
            base64: false,
          });
          
          if (photo && photo.uri) {
            setCapturedImage(photo.uri);
            await processImage(photo.uri);
          } else {
            throw new Error('No photo captured');
          }
        } catch (cameraError) {
          console.error('Camera capture error:', cameraError);
          Alert.alert('Camera Error', 'Failed to capture photo. Please try again.');
        }
      } else {
        // For web or fallback, use a demo image
        const demoImageUri = 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80';
        setCapturedImage(demoImageUri);
        await processImage(demoImageUri);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    } finally {
      setIsCapturing(false);
      setCapturedImage(null);
    }
  };
  
  const handlePickImage = async () => {
    if (!canScanMore()) {
      Alert.alert(
        "Scan Limit Reached",
        "You've reached your scan limit. Upgrade your plan to continue scanning.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Upgrade", onPress: () => router.push('/subscription') }
        ]
      );
      return;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setCapturedImage(imageUri);
        await processImage(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setCapturedImage(null);
    }
  };
  
  const processImage = async (imageUri: string) => {
    try {
      setIsProcessing(true);
      
      // Validate image URI
      if (!imageUri || typeof imageUri !== 'string') {
        throw new Error('Invalid image URI');
      }
      
      // Step 1: Process the image with AI OCR (most important step)
      setProcessingStep('Analyzing business card...');
      const cardData = await processBusinessCard(imageUri);
      
      // Validate card data
      if (!cardData || typeof cardData !== 'object') {
        throw new Error('Failed to process business card data');
      }
      
      // Step 2: Create a new card with device information
      setProcessingStep('Creating contact record...');
      
      // Get device information for tracking with fallbacks
      let deviceId = 'unknown';
      let deviceLabel = 'Unknown Device';
      
      try {
        deviceId = Constants.expoConfig?.extra?.installationId || Constants.installationId || 'unknown';
        deviceLabel = Platform.OS === 'ios' ? 'iPhone' : Platform.OS === 'android' ? 'Android Phone' : 'Web';
      } catch (deviceError) {
        console.error('Device info error:', deviceError);
        // Use fallback values
      }
      
      const newCard: BusinessCard = {
        id: Date.now().toString(),
        name: cardData.name || 'Unknown Contact',
        title: cardData.title || undefined,
        company: cardData.company || undefined,
        email: cardData.email || undefined,
        phone: cardData.phone || undefined,
        website: cardData.website || undefined,
        address: cardData.address || undefined,
        imageUri: imageUri,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        _fallbackId: cardData._fallbackId || undefined,
        _isFallback: cardData._isFallback || false,
        deviceId: deviceId,
        deviceLabel: deviceLabel,
      };
      
      // Step 3: Quick duplicate check (only for non-fallback cards)
      if (!newCard._fallbackId && !newCard._isFallback) {
        setProcessingStep('Checking for duplicates...');
        try {
          const duplicate = checkDuplicate(newCard);
          
          if (duplicate) {
            // Show enhanced duplicate alert
            showDuplicateAlert(duplicate, newCard);
            return;
          }
        } catch (duplicateError) {
          console.error('Duplicate check error:', duplicateError);
          // Continue without duplicate check
        }
      }
      
      // Step 4: Add the card to the store
      setProcessingStep('Saving contact...');
      try {
        const added = await addCard(newCard);
        
        if (added) {
          setProcessingStep('Contact saved successfully!');
          incrementScannedCards();
          router.push(`/card/${newCard.id}`);
        } else {
          throw new Error('Failed to save card');
        }
      } catch (saveError) {
        console.error('Save card error:', saveError);
        Alert.alert('Save Error', 'Failed to save contact. Please try again.');
      }
      
    } catch (error) {
      console.error('❌ Error processing image:', error);
      Alert.alert(
        'Processing Error', 
        'Failed to process business card. Please try again with a clearer image.'
      );
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };
  
  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };
  
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }
  
  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, isTablet && styles.permissionContainerTablet]}>
        <Ionicons 
          name="camera" 
          size={isTablet ? 80 : 64} 
          color={Colors.light.textSecondary} 
        />
        <Text style={[styles.permissionTitle, isTablet && styles.permissionTitleTablet]}>
          Camera Permission Required
        </Text>
        <Text style={[styles.permissionText, isTablet && styles.permissionTextTablet]}>
          Biztomate needs camera access to scan business cards and extract contact information.
        </Text>
        <Button
          title="Grant Permission"
          onPress={requestPermission}
          variant="primary"
          size="large"
        />
      </View>
    );
  }
  
  return (
    <View style={[
      styles.container,
      { 
        paddingTop: insets.top,
        paddingBottom: insets.bottom 
      }
    ]}>
      <TrialBanner />
      
      {isProcessing ? (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.processingText}>Processing business card...</Text>
          <Text style={styles.processingSubtext}>{processingStep}</Text>
          <View style={styles.processingSteps}>
            <Text style={styles.processingStep}>✓ Analyzing card</Text>
            <Text style={styles.processingStep}>✓ Creating record</Text>
            <Text style={styles.processingStep}>✓ Checking duplicates</Text>
            <Text style={styles.processingStep}>✓ Saving contact</Text>
          </View>
        </View>
      ) : (
        <>
          {Platform.OS !== 'web' ? (
            <CameraView 
              style={styles.camera} 
              facing={facing}
              ref={cameraRef}
            >
              <View style={styles.overlay}>
                <View style={styles.scanFrame} />
                <Text style={styles.scanText}>Position business card within frame</Text>
                <Text style={styles.scanSubtext}>Ensure good lighting and clear text</Text>
              </View>
              
              <View style={styles.controls}>
                <TouchableOpacity 
                  style={styles.flipButton}
                  onPress={toggleCameraFacing}
                >
                  <Ionicons name="camera" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </CameraView>
          ) : (
            <View style={styles.webPlaceholder}>
              <Ionicons name="camera" size={48} color={Colors.light.primary} style={styles.icon} />
              <Text style={styles.title}>Camera Preview</Text>
              <Text style={styles.message}>
                Camera preview is not fully supported on web. Please use the buttons below to capture or select an image.
              </Text>
            </View>
          )}
          
          {capturedImage && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: capturedImage }} 
                style={styles.preview} 
                resizeMode="contain"
              />
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            <Button
              title="Capture"
              onPress={handleCapture}
              variant="primary"
              loading={isCapturing}
              disabled={isCapturing || isProcessing}
              style={styles.captureButton}
              icon={<Ionicons name="camera" size={20} color="white" style={{ marginRight: 8 }} />}
            />
            
            <Button
              title="Select Image"
              onPress={handlePickImage}
              variant="outline"
              disabled={isCapturing || isProcessing}
              style={styles.selectButton}
              icon={<Ionicons name="image" size={20} color={Colors.light.primary} style={{ marginRight: 8 }} />}
            />
          </View>
          
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionTitle}>How to scan:</Text>
            <Text style={styles.instructionText}>
              1. Position the business card within the frame
            </Text>
            <Text style={styles.instructionText}>
              2. Ensure good lighting and clear text visibility
            </Text>
            <Text style={styles.instructionText}>
              3. Tap "Capture" or select an existing image
            </Text>
            <Text style={styles.instructionText}>
              4. Review and edit the extracted information
            </Text>
            <View style={styles.duplicateInfo}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.light.success} />
              <Text style={styles.duplicateText}>
                Enhanced duplicate detection active - we'll alert you if this contact already exists
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  camera: {
    flex: 1,
  },
  webPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    margin: 16,
    borderRadius: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 300,
    height: 190,
    borderWidth: 3,
    borderColor: 'white',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scanText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scanSubtext: {
    color: 'white',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: Colors.light.background,
  },
  captureButton: {
    flex: 1,
    marginRight: 8,
  },
  selectButton: {
    flex: 1,
    marginLeft: 8,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  processingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
  },
  processingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.light.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  processingSteps: {
    marginTop: 20,
    alignItems: 'flex-start',
  },
  processingStep: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  previewContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  preview: {
    width: 200,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  instructionContainer: {
    padding: 16,
    backgroundColor: Colors.light.card,
    margin: 16,
    borderRadius: 8,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  duplicateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: Colors.light.highlight,
    borderRadius: 6,
  },
  duplicateText: {
    fontSize: 12,
    color: Colors.light.text,
    marginLeft: 8,
    flex: 1,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  button: {
    minWidth: 200,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionContainerTablet: {
    padding: 64,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  permissionTitleTablet: {
    fontSize: 32,
    marginTop: 32,
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  permissionTextTablet: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 48,
    paddingHorizontal: 40,
  },
});
