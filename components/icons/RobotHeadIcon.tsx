import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

interface RobotHeadIconProps {
  size?: number;
  color?: string;
}

export default function RobotHeadIcon({ size = 40, color = Colors.light.primary }: RobotHeadIconProps) {
  const winkAnim = useRef(new Animated.Value(1)).current;
  const eyeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const winkAnimation = () => {
      Animated.sequence([
        Animated.timing(winkAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(winkAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Repeat the wink every 3 seconds
        setTimeout(winkAnimation, 3000);
      });
    };

    // Start winking after 1 second
    setTimeout(winkAnimation, 1000);

    return () => {
      winkAnim.stopAnimation();
      eyeAnim.stopAnimation();
    };
  }, [winkAnim, eyeAnim]);

  return (
    <View style={styles.container}>
      {/* Robot Head Base */}
      <View style={[styles.robotHead, { width: size, height: size }]}>
        {/* Left Eye */}
        <View style={[styles.eyeContainer, styles.leftEye]}>
          <Ionicons name="radio-button-on" size={size * 0.2} color={color} />
        </View>
        
        {/* Right Eye - Winking */}
        <View style={[styles.eyeContainer, styles.rightEye]}>
          <Animated.View style={{ opacity: winkAnim }}>
            <Ionicons name="radio-button-on" size={size * 0.2} color={color} />
          </Animated.View>
        </View>
        
        {/* Mouth */}
        <View style={styles.mouthContainer}>
          <Ionicons name="remove" size={size * 0.25} color={color} />
        </View>
        
        {/* Antenna */}
        <View style={styles.antennaContainer}>
          <Ionicons name="radio" size={size * 0.15} color={color} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  robotHead: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  eyeContainer: {
    position: 'absolute',
    top: '30%',
    alignItems: 'center',
  },
  leftEye: {
    left: '25%',
  },
  rightEye: {
    right: '25%',
  },
  mouthContainer: {
    position: 'absolute',
    bottom: '25%',
    alignItems: 'center',
  },
  antennaContainer: {
    position: 'absolute',
    top: '-15%',
    alignItems: 'center',
  },
});
