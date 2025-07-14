import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScanLine, Crown, Zap, Shield, Users, Star } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import TrialBanner from '@/components/TrialBanner';
import { useUserStore } from '@/store/userStore';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isTrialActive, getTrialDaysLeft, getRemainingCards } = useUserStore();
  
  const trialDaysLeft = getTrialDaysLeft();
  const remainingCards = getRemainingCards();
  
  const handleStartScanning = () => {
    router.push('/scan');
  };
  
  const handleSeePlans = () => {
    router.push('/subscription');
  };
  
  return (
    <ScrollView style={styles.container}>
      <TrialBanner />
      
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>📱</Text>
          </View>
          <Text style={styles.appName}>Biztomate Scanner</Text>
          <View style={styles.premiumBadge}>
            <Crown size={16} color="white" />
            <Text style={styles.premiumText}>AI Powered</Text>
          </View>
        </View>
        
        <Text style={styles.tagline}>
          Transform business cards into organized contacts instantly with AI-powered OCR technology
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{user.scannedCards}</Text>
          <Text style={styles.statLabel}>Cards Scanned</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {remainingCards === Infinity ? '∞' : remainingCards}
          </Text>
          <Text style={styles.statLabel}>Scans Left</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {isTrialActive() ? trialDaysLeft : '∞'}
          </Text>
          <Text style={styles.statLabel}>
            {isTrialActive() ? 'Days Left' : 'Active'}
          </Text>
        </View>
      </View>
      
      <View style={styles.actionContainer}>
        <Button
          title="Start Scanning"
          onPress={handleStartScanning}
          variant="primary"
          size="large"
          style={styles.primaryButton}
          icon={<ScanLine size={24} color="white" style={{ marginRight: 8 }} />}
        />
        
        <Button
          title="See Plans"
          onPress={handleSeePlans}
          variant="outline"
          size="large"
          style={styles.secondaryButton}
          icon={<Star size={20} color={Colors.light.primary} style={{ marginRight: 8 }} />}
        />
      </View>
      
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Why Choose Biztomate Scanner?</Text>
        
        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <ScanLine size={24} color={Colors.light.primary} />
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
            <Zap size={24} color={Colors.light.primary} />
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
            <Shield size={24} color={Colors.light.primary} />
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
            <Users size={24} color={Colors.light.primary} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Team Collaboration</Text>
            <Text style={styles.featureDescription}>
              Share and collaborate with your team on premium plans
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.brandingText}>Empowered by Biztomate Inc.</Text>
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
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 30,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 6,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  premiumText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  tagline: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  actionContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  primaryButton: {
    paddingVertical: 16,
    marginBottom: 12,
  },
  secondaryButton: {
    paddingVertical: 16,
  },
  featuresContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
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
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  brandingText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
});