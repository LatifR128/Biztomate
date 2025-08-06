import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { initializeUser } = useUserStore();
  
  const handleGetStarted = async () => {
    try {
      // Navigate to auth screen for real authentication
      router.replace('/auth');
    } catch (error) {
      console.error('Error starting app:', error);
    }
  };
  
  const handleViewPlans = async () => {
    try {
      // Navigate to auth screen for real authentication
      router.replace('/auth');
    } catch (error) {
      console.error('Error starting app:', error);
    }
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
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>📱</Text>
          </View>
          <Text style={styles.appName}>Biztomate</Text>
          <View style={styles.premiumBadge}>
            <Ionicons name="diamond" size={16} color="white" />
            <Text style={styles.premiumText}>AI Powered</Text>
          </View>
        </View>
        
        <Text style={styles.tagline}>
          Transform business cards into organized contacts instantly with AI-powered OCR technology
        </Text>
      </View>

      <View style={styles.trialBanner}>
        <View style={styles.trialHeader}>
          <Ionicons name="star" size={24} color={Colors.light.warning} />
          <Text style={styles.trialTitle}>Start Your FREE 3-Day Trial</Text>
        </View>
        <Text style={styles.trialSubtitle}>
          Get 5 free scans • No credit card required • Cancel anytime
        </Text>
      </View>
      
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Why Choose Biztomate?</Text>
        
        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <Ionicons name="scan" size={28} color={Colors.light.primary} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Smart OCR Technology</Text>
            <Text style={styles.featureDescription}>
              AI-powered scanning extracts contact information with 99% accuracy
            </Text>
          </View>
        </View>
        
        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <Ionicons name="flash" size={28} color={Colors.light.primary} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Instant Export</Text>
            <Text style={styles.featureDescription}>
              Export to Google Sheets, Excel, or CSV with just one tap
            </Text>
          </View>
        </View>
        
        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <Ionicons name="shield-checkmark" size={28} color={Colors.light.primary} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Secure & Private</Text>
            <Text style={styles.featureDescription}>
              Your data is encrypted and stored securely on your device
            </Text>
          </View>
        </View>
        
        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <Ionicons name="people" size={28} color={Colors.light.primary} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Team Collaboration</Text>
            <Text style={styles.featureDescription}>
              Share and collaborate with your team on premium plans
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.plansPreview}>
        <Text style={styles.plansTitle}>Choose Your Perfect Plan</Text>
        <View style={styles.planCards}>
          <View style={styles.planCard}>
            <Text style={styles.planName}>Basic</Text>
            <Text style={styles.planPrice}>$19.99/year</Text>
            <Text style={styles.planFeature}>100 Cards</Text>
          </View>
          <View style={[styles.planCard, styles.popularPlan]}>
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>POPULAR</Text>
            </View>
            <Text style={styles.planName}>Standard</Text>
            <Text style={styles.planPrice}>$24.99/year</Text>
            <Text style={styles.planFeature}>250 Cards</Text>
          </View>
          <View style={styles.planCard}>
            <Text style={styles.planName}>Unlimited</Text>
            <Text style={styles.planPrice}>$49.99/year</Text>
            <Text style={styles.planFeature}>∞ Cards</Text>
          </View>
        </View>
      </View>

      <View style={styles.qrSection}>
        <Text style={styles.qrTitle}>Share with Friends</Text>
        <Image source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://biztomatescanner.app/welcome' }}
          style={styles.qrCode}
        />
        <Text style={styles.qrDescription}>Scan to download Biztomate</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Start Free Trial"
          onPress={handleGetStarted}
          variant="primary"
          size="large"
          style={styles.getStartedButton}
        />
        
        <TouchableOpacity onPress={handleViewPlans}>
          <Text style={styles.viewPlansText}>View All Plans</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.brandingText}>Empowered by Biztomate Inc.</Text>
        <Text style={styles.contactText}>hello@biztomate.com</Text>
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
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  tagline: {
    fontSize: 18,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  trialBanner: {
    backgroundColor: Colors.light.highlight,
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  trialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trialTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
    marginLeft: 8,
  },
  trialSubtitle: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
  },
  featuresContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
  featureDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  plansPreview: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  plansTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  planCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  planCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  popularPlan: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.highlight,
    transform: [{ scale: 1.05 }],
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  popularText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  planName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  planFeature: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  qrSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  qrCode: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  qrDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  getStartedButton: {
    paddingVertical: 16,
    marginBottom: 16,
  },
  viewPlansText: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  brandingText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
});