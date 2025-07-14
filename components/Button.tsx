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
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };
    
    // Add size styles
    if (size === 'small') {
      Object.assign(baseStyle, {
        paddingVertical: 6,
        paddingHorizontal: 12,
      });
    } else if (size === 'medium') {
      Object.assign(baseStyle, {
        paddingVertical: 10,
        paddingHorizontal: 16,
      });
    } else if (size === 'large') {
      Object.assign(baseStyle, {
        paddingVertical: 14,
        paddingHorizontal: 20,
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
      fontWeight: '600',
    };
    
    // Add size styles
    if (size === 'small') {
      Object.assign(baseStyle, { fontSize: 12 });
    } else if (size === 'medium') {
      Object.assign(baseStyle, { fontSize: 14 });
    } else if (size === 'large') {
      Object.assign(baseStyle, { fontSize: 16 });
    }
    
    // Add variant styles
    if (variant === 'primary') {
      Object.assign(baseStyle, { color: 'white' });
    } else if (variant === 'secondary') {
      Object.assign(baseStyle, { color: 'white' });
    } else if (variant === 'outline') {
      Object.assign(baseStyle, { color: Colors.light.primary });
    } else if (variant === 'text') {
      Object.assign(baseStyle, { color: Colors.light.primary });
    }
    
    if (disabled) {
      Object.assign(baseStyle, { color: '#FFFFFF' });
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
          color={variant === 'primary' ? 'white' : Colors.light.primary} 
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