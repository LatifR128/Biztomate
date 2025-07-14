import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Colors from '@/constants/colors';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last updated: January 11, 2025</Text>
        
        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          Card Scanner collects and processes the following information:
        </Text>
        <Text style={styles.bulletPoint}>
          • Business card images you capture or upload
        </Text>
        <Text style={styles.bulletPoint}>
          • Contact information extracted from business cards (names, emails, phone numbers, addresses, company information)
        </Text>
        <Text style={styles.bulletPoint}>
          • Usage data and app analytics to improve our services
        </Text>
        <Text style={styles.bulletPoint}>
          • Device information and technical data for app functionality
        </Text>
        
        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use your information to:
        </Text>
        <Text style={styles.bulletPoint}>
          • Provide OCR services to extract contact information from business cards
        </Text>
        <Text style={styles.bulletPoint}>
          • Store and organize your scanned contacts
        </Text>
        <Text style={styles.bulletPoint}>
          • Enable export functionality to various formats
        </Text>
        <Text style={styles.bulletPoint}>
          • Improve our AI and OCR accuracy
        </Text>
        <Text style={styles.bulletPoint}>
          • Provide customer support
        </Text>
        
        <Text style={styles.sectionTitle}>3. Data Storage and Security</Text>
        <Text style={styles.paragraph}>
          Your data is primarily stored locally on your device. When using cloud features:
        </Text>
        <Text style={styles.bulletPoint}>
          • Data is encrypted in transit and at rest
        </Text>
        <Text style={styles.bulletPoint}>
          • We use industry-standard security measures
        </Text>
        <Text style={styles.bulletPoint}>
          • Access is restricted to authorized personnel only
        </Text>
        <Text style={styles.bulletPoint}>
          • We do not sell your personal information to third parties
        </Text>
        
        <Text style={styles.sectionTitle}>4. Third-Party Services</Text>
        <Text style={styles.paragraph}>
          We may use third-party services for:
        </Text>
        <Text style={styles.bulletPoint}>
          • OCR and AI processing
        </Text>
        <Text style={styles.bulletPoint}>
          • Cloud storage and synchronization
        </Text>
        <Text style={styles.bulletPoint}>
          • Analytics and crash reporting
        </Text>
        <Text style={styles.bulletPoint}>
          • Payment processing for subscriptions
        </Text>
        
        <Text style={styles.sectionTitle}>5. Data Retention</Text>
        <Text style={styles.paragraph}>
          We retain your data for as long as your account is active or as needed to provide services. You can delete your data at any time through the app settings.
        </Text>
        
        <Text style={styles.sectionTitle}>6. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to:
        </Text>
        <Text style={styles.bulletPoint}>
          • Access your personal data
        </Text>
        <Text style={styles.bulletPoint}>
          • Correct inaccurate data
        </Text>
        <Text style={styles.bulletPoint}>
          • Delete your data
        </Text>
        <Text style={styles.bulletPoint}>
          • Export your data
        </Text>
        <Text style={styles.bulletPoint}>
          • Opt-out of data processing for marketing purposes
        </Text>
        
        <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
        </Text>
        
        <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy in the app.
        </Text>
        
        <Text style={styles.sectionTitle}>9. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about this privacy policy, please contact us at:
        </Text>
        <Text style={styles.contactInfo}>
          Biztomate Inc.{'\n'}
          Email: hello@biztomate.com{'\n'}
          Website: https://biztomate.com/contact
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.brandingText}>Empowered by Biztomate Inc.</Text>
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 8,
    marginLeft: 16,
  },
  contactInfo: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  brandingText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
});