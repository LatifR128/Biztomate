import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  CreditCard, 
  HelpCircle, 
  Mail, 
  Star, 
  FileText, 
  Shield, 
  ExternalLink,
  LogOut
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/userStore';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptions';

export default function SettingsScreen() {
  const router = useRouter();
  const { 
    user, 
    isTrialActive, 
    isSubscriptionActive, 
    getTrialDaysLeft, 
    getRemainingCards 
  } = useUserStore();
  
  const currentPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === user.subscriptionPlan);
  const trialDaysLeft = getTrialDaysLeft();
  const remainingCards = getRemainingCards();
  
  const handleSubscription = () => {
    router.push('/subscription');
  };
  
  const handleExport = () => {
    router.push('/export');
  };
  
  const handleHelp = () => {
    Linking.openURL('https://biztomate.com/contact');
  };
  
  const handleContact = () => {
    Linking.openURL('https://biztomate.com/contact');
  };
  
  const handleRate = () => {
    Alert.alert(
      "Rate Our App",
      "Would you like to rate our app on the store?",
      [
        { text: "Not Now", style: "cancel" },
        { text: "Rate Now", onPress: () => Linking.openURL('https://example.com/rate') }
      ]
    );
  };
  
  const handlePrivacy = () => {
    router.push('/privacy');
  };
  
  const handleTerms = () => {
    router.push('/terms');
  };
  
  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: () => console.log("User logged out") }
      ]
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>{currentPlan?.name || 'Free Trial'}</Text>
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={handleSubscription}
            >
              <Text style={styles.upgradeText}>
                {isTrialActive() ? 'Upgrade' : 'Manage'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.planDetails}>
            {isTrialActive() ? (
              <Text style={styles.planInfo}>
                {trialDaysLeft} days left in trial • {remainingCards} scans remaining
              </Text>
            ) : isSubscriptionActive() ? (
              <Text style={styles.planInfo}>
                {remainingCards === Infinity ? 'Unlimited' : remainingCards} scans remaining
              </Text>
            ) : (
              <Text style={styles.planInfo}>
                Trial expired • {remainingCards} scans remaining
              </Text>
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleSubscription}
        >
          <CreditCard size={20} color={Colors.light.primary} />
          <Text style={styles.menuText}>Subscription Plans</Text>
          <ExternalLink size={16} color={Colors.light.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleExport}
        >
          <FileText size={20} color={Colors.light.primary} />
          <Text style={styles.menuText}>Export Options</Text>
          <ExternalLink size={16} color={Colors.light.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleHelp}
        >
          <HelpCircle size={20} color={Colors.light.primary} />
          <Text style={styles.menuText}>Help Center</Text>
          <ExternalLink size={16} color={Colors.light.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleContact}
        >
          <Mail size={20} color={Colors.light.primary} />
          <Text style={styles.menuText}>Contact Support</Text>
          <ExternalLink size={16} color={Colors.light.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleRate}
        >
          <Star size={20} color={Colors.light.primary} />
          <Text style={styles.menuText}>Rate the App</Text>
          <ExternalLink size={16} color={Colors.light.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handlePrivacy}
        >
          <Shield size={20} color={Colors.light.primary} />
          <Text style={styles.menuText}>Privacy Policy</Text>
          <ExternalLink size={16} color={Colors.light.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleTerms}
        >
          <FileText size={20} color={Colors.light.primary} />
          <Text style={styles.menuText}>Terms of Service</Text>
          <ExternalLink size={16} color={Colors.light.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[styles.menuItem, styles.logoutButton]}
        onPress={handleLogout}
      >
        <LogOut size={20} color={Colors.light.error} />
        <Text style={[styles.menuText, styles.logoutText]}>Log Out</Text>
      </TouchableOpacity>
      
      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.branding}>Empowered by Biztomate Inc.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: 12,
    marginLeft: 4,
  },
  planCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  upgradeButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  upgradeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  planDetails: {
    marginTop: 4,
  },
  planInfo: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuText: {
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
    marginLeft: 12,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  logoutText: {
    color: Colors.light.error,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  version: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  branding: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
});