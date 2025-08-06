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
  ActivityIndicator,
  Dimensions,
  Animated,
  StatusBar,
  Alert,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useAuthStore } from '@/store/authStore';
import { sanitizeInput, validateField, getPasswordStrength } from '@/utils/validationUtils';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp, signInWithGoogle, isLoading, error } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOAuthLoading] = useState<'google' | null>(null);
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [progressAnim] = useState(new Animated.Value(0));

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const updateFormData = (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Sign up timed out. Please try again.')), 30000); // 30 seconds
    });
    
    try {
      await Promise.race([
        signUp(formData.email, formData.password, formData.name),
        timeoutPromise
      ]);
      
      Alert.alert(
        'Welcome to Biztomate! 🎉',
        'Your account has been created successfully. You can now start scanning business cards.',
        [
          {
            text: 'Get Started',
            onPress: () => router.replace('/(tabs)')
          }
        ]
      );
    } catch (error: any) {
      console.error('Sign up error:', error);
      Alert.alert('Sign Up Failed', error.message || 'Please try again.', [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setOAuthLoading('google');
    try {
      const user = await signInWithGoogle();
      
      if (user) {
        Alert.alert(
          'Welcome to Biztomate! 🎉',
          `Welcome back, ${user.name}! You can now start scanning business cards.`,
          [
            {
              text: 'Get Started',
              onPress: () => router.replace('/(tabs)')
            }
          ]
        );
      } else {
        Alert.alert('Google Sign-In Failed', 'Please try again.', [{ text: 'OK' }]);
      }
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      Alert.alert('Google Sign-In Failed', 'An unexpected error occurred. Please try again.', [{ text: 'OK' }]);
    } finally {
      setOAuthLoading(null);
    }
  };

  const handleSignIn = () => {
    router.push('/auth/signin' as any);
  };

  const handleBack = () => {
    router.back();
  };

  const getPasswordStrengthColor = () => {
    if (!formData.password) return Colors.light.border;
    const strength = getPasswordStrength(formData.password);
    return strength.color;
  };

  const getPasswordStrengthText = () => {
    if (!formData.password) return '';
    const strength = getPasswordStrength(formData.password);
    return strength.strength;
  };

  return (
    <KeyboardAvoidingView 
      style={[
        styles.container,
        { 
          paddingTop: insets.top,
          paddingBottom: insets.bottom 
        }
      ]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#FFFFFF', '#FFFFFF']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Account</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Logo */}
          <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.logoBackground}>
              <Ionicons name="flash" size={32} color={Colors.light.primary} />
            </View>
            <Text style={styles.appName}>Biztomate</Text>
            <Text style={styles.tagline}>Join thousands of professionals</Text>
          </Animated.View>

          {/* OAuth Buttons */}
          <View style={styles.oauthContainer}>
            <Text style={styles.oauthTitle}>Quick Sign Up</Text>
            
            {/* Google Sign-In Button */}
            <TouchableOpacity
              style={[styles.oauthButton, styles.googleButton]}
              onPress={handleGoogleSignIn}
              disabled={oauthLoading !== null}
            >
              {oauthLoading === 'google' ? (
                <ActivityIndicator size="small" color={Colors.light.google.blue} />
              ) : (
                <>
                  <Ionicons name="logo-google" size={20} color={Colors.light.google.blue} />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>
          </View>

          {/* Email Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Sign up with email</Text>
            
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

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[styles.inputWrapper, formErrors.email && styles.inputError]}>
                <Ionicons name="mail" size={20} color={Colors.light.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={formData.email}
                  onChangeText={(text) => updateFormData('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputWrapper, formErrors.password && styles.inputError]}>
                <Ionicons name="lock-closed" size={20} color={Colors.light.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={formData.password}
                  onChangeText={(text) => updateFormData('password', text)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={Colors.light.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
              {formData.password && (
                <View style={styles.passwordStrength}>
                  <View style={[styles.strengthBar, { backgroundColor: getPasswordStrengthColor() }]} />
                  <Text style={[styles.strengthText, { color: getPasswordStrengthColor() }]}>
                    {getPasswordStrengthText()}
                  </Text>
                </View>
              )}
              {formErrors.password && <Text style={styles.errorText}>{formErrors.password}</Text>}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={[styles.inputWrapper, formErrors.confirmPassword && styles.inputError]}>
                <Ionicons name="lock-closed" size={20} color={Colors.light.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateFormData('confirmPassword', text)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={Colors.light.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
              {formErrors.confirmPassword && <Text style={styles.errorText}>{formErrors.confirmPassword}</Text>}
            </View>

            {/* Progress Bar */}
            {loading && (
              <View style={styles.progressContainer}>
                <Animated.View 
                  style={[
                    styles.progressBar, 
                    { width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })}
                  ]} 
                />
              </View>
            )}

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
              onPress={handleSignUp}
              disabled={loading || oauthLoading !== null}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.light.primary} />
              ) : (
                <Text style={styles.signUpButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleSignIn}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms and Privacy */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By signing up, you agree to our{' '}
              <Text style={styles.termsLink} onPress={() => router.push('/terms')}>
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text style={styles.termsLink} onPress={() => router.push('/privacy')}>
                Privacy Policy
              </Text>
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
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
      zIndex: 1,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: Colors.light.text,
      position: 'absolute',
      left: 0,
      right: 0,
      textAlign: 'center',
    },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  oauthContainer: {
    marginBottom: 30,
  },
  oauthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  googleButton: {
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.border,
  },
  googleButtonText: {
    color: Colors.light.google.blue, // Google brand color
    fontSize: Typography.sizes.lg,
    fontWeight: '600' as const,
    marginLeft: Spacing.base,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  dividerText: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    marginHorizontal: 16,
  },
  formContainer: {
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 20,
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
  errorText: {
    color: Colors.light.error,
    fontSize: 12,
    marginTop: 4,
  },
  passwordStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  progressContainer: {
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    marginTop: 20,
    marginBottom: 24,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: Colors.light.primary,
  },
  signUpButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
  },
  signUpButtonDisabled: {
    opacity: 0.6,
  },
  signUpButtonText: {
    color: Colors.light.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signInText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  signInLink: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  termsContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  termsText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
}); 