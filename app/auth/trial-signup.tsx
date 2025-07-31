import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useTrialStore } from '@/store/trialStore';
import { sanitizeInput, validateField } from '@/utils/validationUtils';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TrialSignUpScreen() {
  const router = useRouter();
  const { signUp, isLoading, error } = useAuthStore();
  const { startTrial } = useTrialStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ 
    name?: string; 
    email?: string; 
    phone?: string;
    password?: string; 
    confirmPassword?: string; 
  }>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Initialize animations
  useEffect(() => {
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
    ]).start();
  }, []);

  // Enhanced validation with phone number support
  const validateFieldWithPhone = (field: string, value: string): string | null => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (value.trim().length > 50) return 'Name must be less than 50 characters';
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'Name can only contain letters and spaces';
        return null;
      
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Please enter a valid email address';
        if (value.trim().length > 100) return 'Email is too long';
        return null;
      
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        const cleanedPhone = value.replace(/\D/g, '');
        if (cleanedPhone.length < 10) return 'Please enter a valid phone number';
        if (cleanedPhone.length > 15) return 'Phone number is too long';
        return null;
      
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
        if (!/(?=.*[@$!%*?&])/.test(value)) return 'Password must contain at least one special character';
        return null;
      
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (password !== value) return 'Passwords do not match';
        return null;
      
      default:
        return null;
    }
  };

  const validateForm = (): boolean => {
    const errors: { 
      name?: string; 
      email?: string; 
      phone?: string;
      password?: string; 
      confirmPassword?: string; 
    } = {};

    const nameError = validateFieldWithPhone('name', name);
    const emailError = validateFieldWithPhone('email', email);
    const phoneError = validateFieldWithPhone('phone', phone);
    const passwordError = validateFieldWithPhone('password', password);
    const confirmPasswordError = validateFieldWithPhone('confirmPassword', confirmPassword);

    if (nameError) errors.name = nameError;
    if (emailError) errors.email = emailError;
    if (phoneError) errors.phone = phoneError;
    if (passwordError) errors.password = passwordError;
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Real-time validation
  const handleFieldChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    
    switch (field) {
      case 'name':
        setName(sanitizedValue);
        break;
      case 'email':
        setEmail(sanitizedValue.toLowerCase());
        break;
      case 'phone':
        setPhone(formatPhoneNumber(value));
        break;
      case 'password':
        setPassword(value); // Don't sanitize password
        break;
      case 'confirmPassword':
        setConfirmPassword(value); // Don't sanitize password
        break;
    }

    // Clear error when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Phone number formatting
  const formatPhoneNumber = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      const parts = [match[1], match[2], match[3]].filter(Boolean);
      return parts.join('-');
    }
    return cleaned;
  };

  const hashPassword = async (password: string): Promise<string> => {
    try {
      const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password + 'biztomate_salt_2024',
        { encoding: Crypto.CryptoEncoding.HEX }
      );
      return digest;
    } catch (error) {
      console.error('Password hashing error:', error);
      throw new Error('Failed to process password securely');
    }
  };

  const storeUserLocally = async (uid: string, email: string, name: string, phone: string, passwordHash: string) => {
    try {
      const userData = {
        uid,
        email,
        name,
        phone,
        passwordHash,
        trialStartDate: new Date().toISOString(),
        trialEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
        subscriptionPlan: 'free',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(`user_${uid}`, JSON.stringify(userData));
    } catch (error) {
      console.error('Local storage error:', error);
      throw new Error('Failed to store user data locally');
    }
  };

  const handleTrialSignUp = async () => {
    if (!validateForm()) return;

    try {
      // Hash password before storing
      const passwordHash = await hashPassword(password);
      
      // Sign up with Firebase
      await signUp(email.trim(), password, name.trim(), phone.trim());
      
      // Store user data locally with hashed password and phone
      const user = useAuthStore.getState().user;
      if (user) {
        await storeUserLocally(user.uid, email.trim(), name.trim(), phone.trim(), passwordHash);
        
        // Start the trial
        await startTrial({
          uid: user.uid,
          email: email.trim(),
          name: name.trim(),
          phone: phone.trim(),
        });
      }
      
      // Show success state
      setIsSuccess(true);
      
      // Navigate to dashboard after a brief delay
      setTimeout(() => {
        router.replace('/(tabs)' as any);
      }, 3000);
      
    } catch (error: any) {
      // Error is already handled in the store
      console.log('Trial sign up error:', error.message);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isSuccess) {
    return (
      <View style={styles.successContainer}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.light.primary} />
        <Animated.View style={[styles.successContent, { opacity: fadeAnim }]}>
          <Ionicons name="checkmark-circle" size={80} color="white" style={styles.successIcon} />
          <Text style={styles.successTitle}>Welcome to Your Free Trial! 🎉</Text>
          <Text style={styles.successSubtitle}>
            Your 3-day free trial has started! You now have access to all premium features.
          </Text>
          <ActivityIndicator color="white" size="large" style={styles.loadingSpinner} />
          <Text style={styles.redirectText}>Setting up your account...</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Ionicons name="flash" size={32} color={Colors.light.primary} />
            </View>
            <Text style={styles.appName}>Biztomate</Text>
          </View>

          <Text style={styles.title}>Start Your Free Trial! 🚀</Text>
          <Text style={styles.subtitle}>Get 3 days of premium access - no credit card required</Text>

          <View style={styles.trialInfo}>
            <Ionicons name="star" size={20} color={Colors.light.warning} />
            <Text style={styles.trialInfoText}>
              Full access to all features for 3 days
            </Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, formErrors.name && styles.inputError]}
                placeholder="Full name"
                placeholderTextColor={Colors.light.textSecondary}
                value={name}
                onChangeText={(value) => handleFieldChange('name', value)}
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="name"
              />
            </View>
            {formErrors.name && (
              <Text style={styles.errorText}>{formErrors.name}</Text>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, formErrors.email && styles.inputError]}
                placeholder="Email address"
                placeholderTextColor={Colors.light.textSecondary}
                value={email}
                onChangeText={(value) => handleFieldChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
            </View>
            {formErrors.email && (
              <Text style={styles.errorText}>{formErrors.email}</Text>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="call" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, formErrors.phone && styles.inputError]}
                placeholder="Phone number"
                placeholderTextColor={Colors.light.textSecondary}
                value={phone}
                onChangeText={(value) => handleFieldChange('phone', value)}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            </View>
            {formErrors.phone && (
              <Text style={styles.errorText}>{formErrors.phone}</Text>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, formErrors.password && styles.inputError]}
                placeholder="Password"
                placeholderTextColor={Colors.light.textSecondary}
                value={password}
                onChangeText={(value) => handleFieldChange('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? (
                  <Ionicons name="eye-off" size={20} color={Colors.light.textSecondary} />
                ) : (
                  <Ionicons name="eye" size={20} color={Colors.light.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            {formErrors.password && (
              <Text style={styles.errorText}>{formErrors.password}</Text>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, formErrors.confirmPassword && styles.inputError]}
                placeholder="Confirm password"
                placeholderTextColor={Colors.light.textSecondary}
                value={confirmPassword}
                onChangeText={(value) => handleFieldChange('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                {showConfirmPassword ? (
                  <Ionicons name="eye-off" size={20} color={Colors.light.textSecondary} />
                ) : (
                  <Ionicons name="eye" size={20} color={Colors.light.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            {formErrors.confirmPassword && (
              <Text style={styles.errorText}>{formErrors.confirmPassword}</Text>
            )}

            <View style={styles.securityNote}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.light.info} />
              <Text style={styles.securityText}>
                Your data is encrypted and stored securely. No credit card required for trial.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.signUpButton, isLoading && styles.disabledButton]}
              onPress={handleTrialSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.signUpButtonText}>Start Free Trial</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/signin' as any)}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  trialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.highlight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  trialInfoText: {
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
  },
  inputError: {
    borderColor: Colors.light.error,
    borderWidth: 2,
  },
  eyeButton: {
    padding: 8,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.highlight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  securityText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  signUpButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  linkText: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successContent: {
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  successSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  redirectText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
}); 