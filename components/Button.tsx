import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle
} from 'react-native';
import Colors from '@/constants/colors';
import { Typography, TextStyles } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.base,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      ...Shadows.base,
    };
    
    // Add size styles
    if (size === 'small') {
      Object.assign(baseStyle, {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.base,
      });
    } else if (size === 'medium') {
      Object.assign(baseStyle, {
        paddingVertical: Spacing.base,
        paddingHorizontal: Spacing.md,
      });
    } else if (size === 'large') {
      Object.assign(baseStyle, {
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xl,
      });
    }
    
    // Add variant styles
    if (variant === 'primary') {
      Object.assign(baseStyle, {
        backgroundColor: Colors.light.primary,
      });
    } else if (variant === 'secondary') {
      Object.assign(baseStyle, {
        backgroundColor: Colors.light.secondary,
      });
    } else if (variant === 'outline') {
      Object.assign(baseStyle, {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.light.primary,
      });
    } else if (variant === 'text') {
      Object.assign(baseStyle, {
        backgroundColor: 'transparent',
        paddingVertical: 0,
        paddingHorizontal: 0,
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      });
    }
    
    if (disabled) {
      Object.assign(baseStyle, {
        backgroundColor: Colors.light.disabled,
        borderColor: Colors.light.disabled,
      });
    }
    
    if (style) {
      Object.assign(baseStyle, style);
    }
    
    return baseStyle;
  };
  
  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600' as const,
    };
    
    // Add size styles
    if (size === 'small') {
      Object.assign(baseStyle, { fontSize: Typography.sizes.sm });
    } else if (size === 'medium') {
      Object.assign(baseStyle, { fontSize: Typography.sizes.base });
    } else if (size === 'large') {
      Object.assign(baseStyle, { fontSize: Typography.sizes.lg });
    }
    
    // Add variant styles
    if (variant === 'primary') {
      Object.assign(baseStyle, { color: Colors.light.background });
    } else if (variant === 'secondary') {
      Object.assign(baseStyle, { color: Colors.light.background });
    } else if (variant === 'outline') {
      Object.assign(baseStyle, { color: Colors.light.primary });
    } else if (variant === 'text') {
      Object.assign(baseStyle, { color: Colors.light.primary });
    }
    
    if (disabled) {
      Object.assign(baseStyle, { color: Colors.light.background });
    }
    
    if (textStyle) {
      Object.assign(baseStyle, textStyle);
    }
    
    return baseStyle;
  };
  
  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? Colors.light.background : Colors.light.primary} 
          size="small" 
        />
      ) : (
        <>
          {icon}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}