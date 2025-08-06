import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Linking,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptions';
import TrialBanner from '@/components/TrialBanner';
import { Typography } from '@/constants/typography';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { 
    user, 
    isTrialActive, 
    isSubscriptionActive, 
    getTrialDaysLeft, 
    getRemainingCards,
    resetUser
  } = useUserStore();
  const { signOut, deleteAccount } = useAuthStore();
  
  // Password modal state

  
  const currentPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === user?.subscriptionPlan);
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
  
  const handleEditProfile = () => {
    router.push('/profile/edit' as any);
  };
  
  const handleLogout = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out? You'll need to sign in again to access your account.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive", 
          onPress: async () => {
            try {
              await signOut();
              // Redirect to sign in page
              router.replace('/auth/signin');
            } catch (error) {
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data including scanned cards and subscription information.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete Account", 
          style: "destructive", 
          onPress: () => {
            Alert.alert(
              "Final Confirmation",
              "This is your final warning. Deleting your account will:\n\n• Permanently delete all your scanned cards\n• Cancel your subscription\n• Remove all your data from our servers\n• This action cannot be undone\n\nAre you absolutely sure?",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Yes, Delete My Account", 
                  style: "destructive", 
                  onPress: async () => {
                    try {
                      await deleteAccount();
                      resetUser();
                      Alert.alert(
                        "Account Deleted",
                        "Your account has been successfully deleted. Thank you for using Biztomate.",
                        [{ 
                          text: "OK", 
                          onPress: () => router.replace('/') 
                        }]
                      );
                    } catch (error: any) {
                      Alert.alert("Error", error.message || "Failed to delete account. Please try again.");
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };


  
  return (
    <ScrollView 
      style={[
        styles.container,
        { 
          paddingTop: insets.top,
          paddingBottom: insets.bottom 
        }
      ]}
      showsVerticalScrollIndicator={false}
    >
      <TrialBanner />
      
      <View style={[styles.content, isTablet && styles.contentTablet]}>
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
            onPress={handleEditProfile}
          >
            <Ionicons name="person" size={20} color={Colors.light.primary} />
            <Text style={styles.menuText}>Edit Profile</Text>
            <Ionicons name="open-outline" size={16} color={Colors.light.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleSubscription}
          >
            <Ionicons name="card" size={20} color={Colors.light.primary} />
            <Text style={styles.menuText}>Subscription Plans</Text>
            <Ionicons name="open-outline" size={16} color={Colors.light.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleExport}
          >
            <Ionicons name="document-text" size={20} color={Colors.light.primary} />
            <Text style={styles.menuText}>Export Options</Text>
            <Ionicons name="open-outline" size={16} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleHelp}
          >
            <Ionicons name="help-circle" size={20} color={Colors.light.primary} />
            <Text style={styles.menuText}>Help Center</Text>
            <Ionicons name="open-outline" size={16} color={Colors.light.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleContact}
          >
            <Ionicons name="mail" size={20} color={Colors.light.primary} />
            <Text style={styles.menuText}>Contact Support</Text>
            <Ionicons name="open-outline" size={16} color={Colors.light.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleRate}
          >
            <Ionicons name="star" size={20} color={Colors.light.primary} />
            <Text style={styles.menuText}>Rate the App</Text>
            <Ionicons name="open-outline" size={16} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handlePrivacy}
          >
            <Ionicons name="shield-checkmark" size={20} color={Colors.light.primary} />
            <Text style={styles.menuText}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={16} color={Colors.light.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleTerms}
          >
            <Ionicons name="document-text" size={20} color={Colors.light.primary} />
            <Text style={styles.menuText}>Terms of Service</Text>
            <Ionicons name="open-outline" size={16} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={20} color={Colors.light.primary} />
            <Text style={styles.menuText}>Sign Out</Text>
            <Ionicons name="open-outline" size={16} color={Colors.light.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, styles.dangerItem]}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash" size={20} color={Colors.light.error} />
            <Text style={[styles.menuText, styles.dangerText]}>Delete Account</Text>
            <Ionicons name="open-outline" size={16} color={Colors.light.error} />
          </TouchableOpacity>
        </View>


        
        <View style={styles.footer}>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.branding}>Empowered by Biztomate Inc.</Text>
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
  content: {
    padding: 16,
  },
  contentTablet: {
    padding: 32,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  planCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.light.card,
    marginBottom: 1,
  },
  dangerItem: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.error,
  },
  menuText: {
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 12,
    flex: 1,
  },
  dangerText: {
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    height: 50,
    borderColor: Colors.light.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: Colors.light.border,
    width: '40%',
  },
  confirmButton: {
    backgroundColor: Colors.light.error,
    width: '40%',
  },
  modalButtonText: {
    color: Colors.light.background,
    fontSize: Typography.sizes.lg,
    fontWeight: '500',
    textAlign: 'center',
  },
});