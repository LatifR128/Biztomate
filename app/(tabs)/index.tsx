import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import TrialBanner from '@/components/TrialBanner';
import { useUserStore } from '@/store/userStore';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isLargeScreen = width >= 1024;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isTrialActive, getTrialDaysLeft, getRemainingCards } = useUserStore();
  
  const trialDaysLeft = getTrialDaysLeft();
  const remainingCards = getRemainingCards();
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [heartbeatAnim] = useState(new Animated.Value(1));
  const [shineAnim] = useState(new Animated.Value(0));
  
  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Start heartbeat animation
  useEffect(() => {
    const startHeartbeat = () => {
      Animated.sequence([
        Animated.timing(heartbeatAnim, {
          toValue: 1.1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(startHeartbeat, 2000);
      });
    };
    startHeartbeat();
  }, [heartbeatAnim]);

  // Start shine animation
  useEffect(() => {
    const startShine = () => {
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setTimeout(startShine, 3000);
      });
    };
    startShine();
  }, [shineAnim]);
  
  const handleStartScanning = () => {
    router.push('/scan');
  };
  
  const handleSeePlans = () => {
    router.push('/subscription');
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={[
          styles.container, 
          { 
            paddingTop: insets.top,
            paddingBottom: insets.bottom 
          }
        ]} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TrialBanner />
        
        {/* Biztomate with Shine Effect */}
        <View style={styles.biztomateContainer}>
          <Animated.Text 
            style={[
              styles.biztomateText,
              isTablet && styles.biztomateTextTablet,
            ]}
          >
            Biztomate
          </Animated.Text>
          <Animated.View 
            style={[
              styles.shineOverlay,
              {
                opacity: shineAnim,
                transform: [{
                  translateX: shineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, 200],
                  })
                }]
              }
            ]}
          />
        </View>

        {/* Animated Statement */}
        <Animated.Text 
          style={[
            styles.animatedStatement,
            isTablet && styles.animatedStatementTablet,
            {
              transform: [{ scale: heartbeatAnim }]
            }
          ]}
        >
          Organize Your Contacts Right Away!
        </Animated.Text>
        
        <Animated.View 
          style={[
            styles.header,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.logoContainer}>
            <Animated.View 
              style={[
                styles.logo, 
                isTablet && styles.logoTablet,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <Text style={[styles.emojiText, isTablet && styles.emojiTextTablet]}>
                🏆👍
              </Text>
            </Animated.View>
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond" size={isTablet ? 20 : 16} color="white" />
              <Text style={[styles.premiumText, isTablet && styles.premiumTextTablet]}>AI Powered</Text>
            </View>
          </View>
          
          <Text style={[styles.tagline, isTablet && styles.taglineTablet]}>
            Transform business cards into organized contacts instantly with AI-powered OCR technology
          </Text>
        </Animated.View>

        <Animated.View 
          style={[
            styles.statsContainer, 
            isTablet && styles.statsContainerTablet,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={[styles.statCard, isTablet && styles.statCardTablet]}>
            <Text style={[styles.statNumber, isTablet && styles.statNumberTablet]}>{user?.scannedCards || 0}</Text>
            <Text style={[styles.statLabel, isTablet && styles.statLabelTablet]}>Cards Scanned</Text>
          </View>
          <View style={[styles.statCard, isTablet && styles.statCardTablet]}>
            <Text style={[styles.statNumber, isTablet && styles.statNumberTablet]}>
              {remainingCards === Infinity ? '∞' : remainingCards}
            </Text>
            <Text style={[styles.statLabel, isTablet && styles.statLabelTablet]}>Scans Left</Text>
          </View>
          <View style={[styles.statCard, isTablet && styles.statCardTablet]}>
            <Text style={[styles.statNumber, isTablet && styles.statNumberTablet]}>
              {isTrialActive() ? trialDaysLeft : '∞'}
            </Text>
            <Text style={[styles.statLabel, isTablet && styles.statLabelTablet]}>
              {isTrialActive() ? 'Days Left' : 'Active'}
            </Text>
          </View>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.actionContainer, 
            isTablet && styles.actionContainerTablet,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Button
            title="Start Scanning"
            onPress={handleStartScanning}
            variant="primary"
            size="large"
            style={isTablet ? styles.primaryButtonTablet : styles.primaryButton}
            icon={<Ionicons name="scan" size={isTablet ? 28 : 24} color="white" style={{ marginRight: 8 }} />}
          />
          
          <Button
            title="See Plans"
            onPress={handleSeePlans}
            variant="outline"
            size="large"
            style={isTablet ? styles.secondaryButtonTablet : styles.secondaryButton}
            icon={<Ionicons name="star" size={isTablet ? 24 : 20} color={Colors.light.primary} style={{ marginRight: 8 }} />}
          />
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.featuresContainer, 
            isTablet && styles.featuresContainerTablet,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={[styles.featuresTitle, isTablet && styles.featuresTitleTablet]}>Why Choose Biztomate?</Text>
          
          <View style={[styles.feature, isTablet && styles.featureTablet]}>
            <View style={[styles.featureIcon, isTablet && styles.featureIconTablet]}>
              <Ionicons name="scan" size={isTablet ? 28 : 24} color={Colors.light.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, isTablet && styles.featureTitleTablet]}>Smart OCR Technology</Text>
              <Text style={[styles.featureDescription, isTablet && styles.featureDescriptionTablet]}>
                AI-powered scanning extracts contact information with 99% accuracy
              </Text>
            </View>
          </View>
          
          <View style={[styles.feature, isTablet && styles.featureTablet]}>
            <View style={[styles.featureIcon, isTablet && styles.featureIconTablet]}>
              <Ionicons name="flash" size={isTablet ? 28 : 24} color={Colors.light.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, isTablet && styles.featureTitleTablet]}>Instant Export</Text>
              <Text style={[styles.featureDescription, isTablet && styles.featureDescriptionTablet]}>
                Export to Google Sheets, Excel, or CSV with just one tap
              </Text>
            </View>
          </View>
          
          <View style={[styles.feature, isTablet && styles.featureTablet]}>
            <View style={[styles.featureIcon, isTablet && styles.featureIconTablet]}>
              <Ionicons name="shield-checkmark" size={isTablet ? 28 : 24} color={Colors.light.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, isTablet && styles.featureTitleTablet]}>Secure & Private</Text>
              <Text style={[styles.featureDescription, isTablet && styles.featureDescriptionTablet]}>
                Your data is encrypted and stored securely on your device
              </Text>
            </View>
          </View>
          
          <View style={[styles.feature, isTablet && styles.featureTablet]}>
            <View style={[styles.featureIcon, isTablet && styles.featureIconTablet]}>
              <Ionicons name="people" size={isTablet ? 28 : 24} color={Colors.light.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, isTablet && styles.featureTitleTablet]}>Team Collaboration</Text>
              <Text style={[styles.featureDescription, isTablet && styles.featureDescriptionTablet]}>
                Share and collaborate with your team on premium plans
              </Text>
            </View>
          </View>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.footer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={[styles.brandingText, isTablet && styles.brandingTextTablet]}>Empowered by Biztomate Inc.</Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: isTablet ? 48 : 24,
    paddingVertical: isTablet ? 48 : 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: isTablet ? 24 : 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoTablet: {
    width: 100,
    height: 100,
    borderRadius: 25,
    marginBottom: 20,
  },
  logoImage: {
    width: 70,
    height: 70,
  },
  logoImageTablet: {
    width: 90,
    height: 90,
  },
  emojiText: {
    fontSize: 50,
    textAlign: 'center',
    lineHeight: 60,
  },
  emojiTextTablet: {
    fontSize: 70,
    lineHeight: 80,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  premiumText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  premiumTextTablet: {
    fontSize: 14,
    marginLeft: 6,
  },
  tagline: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 400,
  },
  taglineTablet: {
    fontSize: 20,
    lineHeight: 28,
    maxWidth: 600,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: isTablet ? 48 : 24,
    marginBottom: isTablet ? 32 : 24,
  },
  statsContainerTablet: {
    justifyContent: 'center',
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardTablet: {
    padding: 24,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  statNumberTablet: {
    fontSize: 32,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  statLabelTablet: {
    fontSize: 14,
  },
  actionContainer: {
    paddingHorizontal: isTablet ? 48 : 24,
    marginBottom: isTablet ? 40 : 32,
  },
  actionContainerTablet: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  primaryButton: {
    paddingVertical: 16,
    marginBottom: 12,
    borderRadius: 16,
  },
  primaryButtonTablet: {
    paddingVertical: 20,
    marginBottom: 16,
    borderRadius: 20,
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
  },
  secondaryButtonTablet: {
    paddingVertical: 20,
    borderRadius: 20,
  },
  featuresContainer: {
    paddingHorizontal: isTablet ? 48 : 24,
    marginBottom: isTablet ? 40 : 32,
  },
  featuresContainerTablet: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  featuresTitleTablet: {
    fontSize: 28,
    marginBottom: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureTablet: {
    marginBottom: 20,
    padding: 24,
    borderRadius: 20,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureIconTablet: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 20,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  featureTitleTablet: {
    fontSize: 20,
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  featureDescriptionTablet: {
    fontSize: 16,
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: isTablet ? 48 : 32,
  },
  brandingText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  brandingTextTablet: {
    fontSize: 16,
  },
  animatedStatement: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  animatedStatementTablet: {
    fontSize: 24,
    marginBottom: 20,
  },
  biztomateContainer: {
    position: 'relative',
    marginBottom: 24,
    overflow: 'hidden',
  },
  biztomateText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.light.primary,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  biztomateTextTablet: {
    fontSize: 42,
  },
  shineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    transform: [{ skewX: '-20deg' }],
  },
});