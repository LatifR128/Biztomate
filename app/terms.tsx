import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Colors from '@/constants/colors';

export default function TermsOfServiceScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.lastUpdated}>Last updated: January 11, 2025</Text>
        
        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By downloading, installing, or using the Card Scanner app ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.
        </Text>
        
        <Text style={styles.sectionTitle}>2. Description of Service</Text>
        <Text style={styles.paragraph}>
          Card Scanner is a mobile application that uses OCR (Optical Character Recognition) technology to extract contact information from business card images and organize them digitally.
        </Text>
        
        <Text style={styles.sectionTitle}>3. User Accounts and Subscriptions</Text>
        <Text style={styles.paragraph}>
          The Service offers various subscription plans:
        </Text>
        <Text style={styles.bulletPoint}>
          • Free Trial: 3 days with 5 card scans
        </Text>
        <Text style={styles.bulletPoint}>
          • Basic Plan: $19.99/year for 100 cards
        </Text>
        <Text style={styles.bulletPoint}>
          • Standard Plan: $24.99/year for 250 cards
        </Text>
        <Text style={styles.bulletPoint}>
          • Premium Plan: $36.99/year for 500 cards
        </Text>
        <Text style={styles.bulletPoint}>
          • Unlimited Plan: $49.99/year for unlimited cards
        </Text>
        
        <Text style={styles.sectionTitle}>4. Payment and Billing</Text>
        <Text style={styles.paragraph}>
          Subscription fees are billed annually in advance. All fees are non-refundable except as required by law. We reserve the right to change pricing with 30 days notice.
        </Text>
        
        <Text style={styles.sectionTitle}>5. User Responsibilities</Text>
        <Text style={styles.paragraph}>
          You agree to:
        </Text>
        <Text style={styles.bulletPoint}>
          • Use the Service only for lawful purposes
        </Text>
        <Text style={styles.bulletPoint}>
          • Not scan copyrighted or confidential materials without permission
        </Text>
        <Text style={styles.bulletPoint}>
          • Respect others' privacy and data protection rights
        </Text>
        <Text style={styles.bulletPoint}>
          • Not attempt to reverse engineer or hack the Service
        </Text>
        <Text style={styles.bulletPoint}>
          • Maintain the security of your account credentials
        </Text>
        
        <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          The Service, including its software, design, and content, is owned by Biztomate Inc. and protected by intellectual property laws. You retain ownership of your data and scanned content.
        </Text>
        
        <Text style={styles.sectionTitle}>7. Privacy and Data</Text>
        <Text style={styles.paragraph}>
          Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.
        </Text>
        
        <Text style={styles.sectionTitle}>8. Service Availability</Text>
        <Text style={styles.paragraph}>
          We strive to maintain high availability but do not guarantee uninterrupted service. We may perform maintenance, updates, or modifications that temporarily affect service availability.
        </Text>
        
        <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          To the maximum extent permitted by law, Biztomate Inc. shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
        </Text>
        
        <Text style={styles.sectionTitle}>10. OCR Accuracy</Text>
        <Text style={styles.paragraph}>
          While we strive for high OCR accuracy, we do not guarantee 100% accuracy in text extraction. Users should review and verify extracted information before use.
        </Text>
        
        <Text style={styles.sectionTitle}>11. Termination</Text>
        <Text style={styles.paragraph}>
          You may cancel your subscription at any time. We may terminate or suspend your account for violation of these Terms. Upon termination, your access to the Service will cease.
        </Text>
        
        <Text style={styles.sectionTitle}>12. Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms are governed by the laws of the jurisdiction where Biztomate Inc. is incorporated, without regard to conflict of law principles.
        </Text>
        
        <Text style={styles.sectionTitle}>13. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We may modify these Terms at any time. We will notify users of material changes through the app or email. Continued use after changes constitutes acceptance.
        </Text>
        
        <Text style={styles.sectionTitle}>14. Contact Information</Text>
        <Text style={styles.paragraph}>
          For questions about these Terms, please contact us at:
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