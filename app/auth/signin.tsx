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
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { sanitizeInput } from '@/utils/validationUtils';

const { width, height } = Dimensions.get('window');

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, isLoading, error, sendPasswordReset } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [rememberMe, setRememberMe] = useState(false);

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

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm() || loading) return;

    try {
      setLoading(true);
      
      await signIn(formData.email.trim(), formData.password);
      
      // Show success message
      Alert.alert(
        'Welcome Back! 🎉',
        'You have successfully signed in to your account.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(tabs)' as any)
          }
        ]
      );
      
    } catch (error: any) {
      if (__DEV__) {
        console.log("Sign in error:", error.message);
      }
      
      // Show error message to user
      let errorMessage = "Sign in failed. Please try again.";
      
      if (error.message === "auth/user-not-found" || error.message === "auth/wrong-password") {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (error.message.includes("network")) {
        errorMessage = "Network error. Please check your internet connection.";
      } else {
        errorMessage = error.message;
      }
      
      Alert.alert("Sign In Failed", errorMessage, [{ text: "OK" }]);
    } finally {      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('/auth/signup' as any);
  };

  const handleForgotPassword = async () => {
    Alert.prompt(
      "Reset Password",
      "Enter your email address to receive a password reset link:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Reset Link",
          onPress: async (email) => {
            if (!email || !/\S+@\S+\.\S+/.test(email)) {
              Alert.alert("Invalid Email", "Please enter a valid email address.");
              return;
            }

            setLoading(true);
            
            try {
              await sendPasswordReset(email);
              
              Alert.alert(
                "Reset Link Sent",
                "A password reset link has been sent to your email address.",
                [{ text: "OK" }]
              );
    } catch (error: any) {
      if (__DEV__) {
        console.log("Sign in error:", error.message);
      }
      
      // Show error message to user
      let errorMessage = "Sign in failed. Please try again.";
      
      if (error.message === "auth/user-not-found" || error.message === "auth/wrong-password") {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (error.message.includes("network")) {
        errorMessage = "Network error. Please check your internet connection.";
      } else {
        errorMessage = error.message;
      }
      
      Alert.alert("Sign In Failed", errorMessage, [{ text: "OK" }]);
    } finally {              setLoading(false);
            }
          }
        }
      ],
      "plain-text",
      formData.email || ""
    );
  };
  const handleBack = () => {
    router.back();
  };

  const handleSocialSignIn = (provider: string) => {
    Alert.alert(
      'Coming Soon',
      `${provider} sign in will be available soon!`,
      [{ text: 'OK' }]
    );
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
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sign In</Text>
          <View style={styles.placeholder} />
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Ionicons name="flash" size={32} color={Colors.light.primary} />
            </View>
            <Text style={styles.appName}>Biztomate</Text>
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue scanning business cards</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={Colors.light.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[styles.inputContainer, formErrors.email && styles.inputError]}>
                <Ionicons name="mail" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value.toLowerCase())}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>
              {formErrors.email && (
                <Text style={styles.errorText}>{formErrors.email}</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputContainer, formErrors.password && styles.inputError]}>
                <Ionicons name="lock-closed" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={Colors.light.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
              {formErrors.password && (
                <Text style={styles.errorText}>{formErrors.password}</Text>
              )}
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Ionicons name="checkmark" size={16} color={Colors.light.primary} />}
                </View>
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInButton, (loading || isLoading) && styles.disabledButton]}
              onPress={handleSignIn}
              disabled={loading || isLoading}
            >
              <LinearGradient
                colors={[Colors.light.primary, Colors.light.secondary]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {(loading || isLoading) ? (
                  <ActivityIndicator color={Colors.light.primary} />
                ) : (
                  <Text style={styles.signInButtonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.divider} />
            </View>

            {/* Social Sign In Buttons */}
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => handleSocialSignIn('Google')}
              >
                <Ionicons name="logo-google" size={24} color={Colors.light.google.red} />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.linkText}>Sign Up</Text>
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
    marginBottom: 40,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderColor: 'rgba(220, 38, 38, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  inputContainer: {
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  eyeButton: {
    padding: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.light.border,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  rememberMeText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  signInButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  signInButtonText: {
    color: Colors.light.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  dividerText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginHorizontal: 16,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 8,
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
    color: Colors.light.primary,
    fontWeight: '600',
  },
}); 