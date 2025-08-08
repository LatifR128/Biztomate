import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Dimensions,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import { sanitizeInput } from '@/utils/validationUtils';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user: userData, updateUser } = useUserStore();
  const { user: authUser, changePassword, changeEmail, sendPasswordReset } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [emailData, setEmailData] = useState({
    currentPassword: '',
    newEmail: ''
  });
  
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showEmailSection, setShowEmailSection] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Initialize form data from both auth user and user data
  useEffect(() => {
    if (authUser && userData) {
      setFormData({
        name: userData.name || authUser.displayName || '',
        email: authUser.email || userData.email || '',
        phone: userData.phone || ''
      });
      setIsLoadingProfile(false);
    }
  }, [authUser, userData]);

  const updateFormData = (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    clearError(field);
  };

  const updatePasswordData = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const updateEmailData = (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setEmailData(prev => ({ ...prev, [field]: sanitizedValue }));
    clearError(field);
  };

  const clearError = (field: string) => {
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordChange = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEmailChange = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!emailData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!emailData.newEmail) {
      errors.newEmail = 'New email is required';
    } else if (!/\S+@\S+\.\S+/.test(emailData.newEmail)) {
      errors.newEmail = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      if (userData) {
        await updateUser({
          name: formData.name.trim(),
          phone: formData.phone.trim() || undefined,
        });
        
        Alert.alert(
          '✅ Profile Updated',
          'Your profile has been updated successfully.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert('❌ Update Failed', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordChange()) return;

    setLoading(true);
    
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      Alert.alert(
        '✅ Password Changed',
        'Your password has been changed successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
              setShowPasswordSection(false);
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Password change error:', error);
      Alert.alert('❌ Password Change Failed', error.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!validateEmailChange()) return;

    Alert.alert(
      'Change Email',
      'Are you sure you want to change your email address? You will need to verify the new email.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change Email',
          onPress: async () => {
            setLoading(true);
            
            try {
              await changeEmail(emailData.currentPassword, emailData.newEmail);
              
              Alert.alert(
                '✅ Email Changed',
                'Your email has been changed successfully. Please check your new email for verification.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setEmailData({ currentPassword: '', newEmail: '' });
                      setShowEmailSection(false);
                    }
                  }
                ]
              );
            } catch (error: any) {
              console.error('Email change error:', error);
              Alert.alert('❌ Email Change Failed', error.message || 'Failed to change email. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleForgotPassword = async () => {
    const currentEmail = authUser?.email || userData?.email;
    
    Alert.prompt(
      'Reset Password',
      'Enter your email address to receive a password reset link:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Reset Link',
          onPress: async (email) => {
            if (!email || !/\S+@\S+\.\S+/.test(email)) {
              Alert.alert('❌ Invalid Email', 'Please enter a valid email address.');
              return;
            }

            setLoading(true);
            
            try {
              await sendPasswordReset(email);
              
              Alert.alert(
                '✅ Reset Link Sent',
                'A password reset link has been sent to your email address.',
                [{ text: 'OK' }]
              );
            } catch (error: any) {
              console.error('Password reset error:', error);
              Alert.alert('❌ Failed to Send Reset Link', error.message || 'Failed to send reset link. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ],
      'plain-text',
      currentEmail || ''
    );
  };

  const handleBack = () => {
    router.back();
  };

  // Show loading if user data is not available
  if (isLoadingProfile || !authUser || !userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#FFFFFF', '#FFFFFF']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Profile Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={[styles.inputWrapper, formErrors.name && styles.inputError]}>
              <Ionicons name="person" size={20} color={Colors.light.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={Colors.light.textSecondary}
                value={formData.name}
                onChangeText={(text) => updateFormData('name', text)}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
            {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
          </View>

          {/* Email Display (Read-only) */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={[styles.inputWrapper, styles.readOnlyInput]}>
              <Ionicons name="mail" size={20} color={Colors.light.textSecondary} />
              <Text style={styles.readOnlyText}>{formData.email}</Text>
            </View>
            <Text style={styles.helperText}>Use the "Change Email" section below to update your email</Text>
          </View>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call" size={20} color={Colors.light.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor={Colors.light.textSecondary}
                value={formData.phone}
                onChangeText={(text) => updateFormData('phone', text)}
                keyboardType="phone-pad"
                autoCorrect={false}
              />
            </View>
          </View>
        </View>

        {/* Password Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Password</Text>
            <TouchableOpacity onPress={() => setShowPasswordSection(!showPasswordSection)}>
              <Ionicons 
                name={showPasswordSection ? "chevron-up" : "chevron-down"} 
                size={24} 
                color={Colors.light.text} 
              />
            </TouchableOpacity>
          </View>

          {showPasswordSection && (
            <View style={styles.passwordSection}>
              {/* Current Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <View style={[styles.inputWrapper, formErrors.currentPassword && styles.inputError]}>
                  <Ionicons name="lock-closed" size={20} color={Colors.light.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter current password"
                    placeholderTextColor={Colors.light.textSecondary}
                    value={passwordData.currentPassword}
                    onChangeText={(text) => updatePasswordData('currentPassword', text)}
                    secureTextEntry
                    autoCorrect={false}
                  />
                </View>
                {formErrors.currentPassword && <Text style={styles.errorText}>{formErrors.currentPassword}</Text>}
              </View>

              {/* New Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={[styles.inputWrapper, formErrors.newPassword && styles.inputError]}>
                  <Ionicons name="lock-closed" size={20} color={Colors.light.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor={Colors.light.textSecondary}
                    value={passwordData.newPassword}
                    onChangeText={(text) => updatePasswordData('newPassword', text)}
                    secureTextEntry
                    autoCorrect={false}
                  />
                </View>
                {formErrors.newPassword && <Text style={styles.errorText}>{formErrors.newPassword}</Text>}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <View style={[styles.inputWrapper, formErrors.confirmPassword && styles.inputError]}>
                  <Ionicons name="lock-closed" size={20} color={Colors.light.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor={Colors.light.textSecondary}
                    value={passwordData.confirmPassword}
                    onChangeText={(text) => updatePasswordData('confirmPassword', text)}
                    secureTextEntry
                    autoCorrect={false}
                  />
                </View>
                {formErrors.confirmPassword && <Text style={styles.errorText}>{formErrors.confirmPassword}</Text>}
              </View>

              {/* Change Password Button */}
              <TouchableOpacity
                style={[styles.actionButton, styles.changePasswordButton]}
                onPress={handleChangePassword}
                disabled={loading}
              >
                <Text style={styles.actionButtonText}>Change Password</Text>
              </TouchableOpacity>

              {/* Forgot Password Button */}
              <TouchableOpacity
                style={[styles.actionButton, styles.forgotPasswordButton]}
                onPress={handleForgotPassword}
                disabled={loading}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Email Change Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Change Email</Text>
            <TouchableOpacity onPress={() => setShowEmailSection(!showEmailSection)}>
              <Ionicons 
                name={showEmailSection ? "chevron-up" : "chevron-down"} 
                size={24} 
                color={Colors.light.text} 
              />
            </TouchableOpacity>
          </View>

          {showEmailSection && (
            <View style={styles.emailSection}>
              {/* Current Password for Email Change */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <View style={[styles.inputWrapper, formErrors.currentPassword && styles.inputError]}>
                  <Ionicons name="lock-closed" size={20} color={Colors.light.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter current password"
                    placeholderTextColor={Colors.light.textSecondary}
                    value={emailData.currentPassword}
                    onChangeText={(text) => updateEmailData('currentPassword', text)}
                    secureTextEntry
                    autoCorrect={false}
                  />
                </View>
                {formErrors.currentPassword && <Text style={styles.errorText}>{formErrors.currentPassword}</Text>}
              </View>

              {/* New Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>New Email Address</Text>
                <View style={[styles.inputWrapper, formErrors.newEmail && styles.inputError]}>
                  <Ionicons name="mail" size={20} color={Colors.light.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new email address"
                    placeholderTextColor={Colors.light.textSecondary}
                    value={emailData.newEmail}
                    onChangeText={(text) => updateEmailData('newEmail', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {formErrors.newEmail && <Text style={styles.errorText}>{formErrors.newEmail}</Text>}
              </View>

              {/* Change Email Button */}
              <TouchableOpacity
                style={[styles.actionButton, styles.changeEmailButton]}
                onPress={handleChangeEmail}
                disabled={loading}
              >
                <Text style={styles.actionButtonText}>Change Email</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Save Profile Button */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSaveProfile}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    height: 40,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: Colors.light.error,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 12,
  },
  readOnlyInput: {
    backgroundColor: '#f8f9fa',
    borderColor: Colors.light.border,
  },
  readOnlyText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginLeft: 12,
  },
  helperText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 12,
    marginTop: 4,
  },
  saveButtonContainer: {
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 40,
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.light.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  passwordSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  emailSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  changePasswordButton: {
    backgroundColor: Colors.light.success,
  },
  changeEmailButton: {
    backgroundColor: Colors.light.error,
  },
  forgotPasswordButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.light.text,
  },
}); 