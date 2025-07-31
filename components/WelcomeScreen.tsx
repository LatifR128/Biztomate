import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  userName?: string;
  onComplete?: () => void;
}

export default function WelcomeScreen({ userName, onComplete }: WelcomeScreenProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [iconScale] = useState(new Animated.Value(0));

  const steps = [
    {
      iconName: 'checkmark-circle',
      title: 'Account Created! 🎉',
              subtitle: `Welcome to Biztomate, ${userName || 'there'}!`,
      description: 'Your account has been successfully created and secured.'
    },
    {
      iconName: 'shield-checkmark',
      title: 'Your Data is Secure',
      subtitle: 'Enterprise-grade security',
      description: 'All your information is encrypted and stored securely on your device.'
    },
    {
      iconName: 'flash',
      title: 'Ready to Scan!',
      subtitle: 'Start your journey',
      description: 'You\'re all set to start scanning business cards and building your network.'
    }
  ];

  useEffect(() => {
    animateIn();
  }, []);

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          // Final step - wait a bit then complete
          setTimeout(() => {
            if (onComplete) {
              onComplete();
            } else {
              router.replace('/(tabs)' as any);
            }
          }, 1500);
        }
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const animateIn = () => {
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
      Animated.spring(iconScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const currentStepData = steps[currentStep];

  const handleSkip = () => {
    if (onComplete) {
      onComplete();
    } else {
      router.replace('/(tabs)' as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.iconContainer,
            { 
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: iconScale }
              ]
            }
          ]}
        >
          <View style={styles.iconBackground}>
            <Ionicons name={currentStepData.iconName as any} size={48} color={Colors.light.primary} />
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.textContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.title}>{currentStepData.title}</Text>
          <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
          <Text style={styles.description}>{currentStepData.description}</Text>
        </Animated.View>

        <View style={styles.progressContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentStep && styles.progressDotActive,
                index < currentStep && styles.progressDotCompleted
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.light.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  progressContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.border,
    marginHorizontal: 6,
  },
  progressDotActive: {
    backgroundColor: Colors.light.primary,
    transform: [{ scale: 1.2 }],
  },
  progressDotCompleted: {
    backgroundColor: Colors.light.success,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginRight: 8,
    fontWeight: '500',
  },
}); 