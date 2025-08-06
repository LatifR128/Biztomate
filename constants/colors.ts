// Comprehensive color system with brand colors
export default {
  light: {
    // Primary brand colors
    primary: '#007AFF',
    secondary: '#5856D6',
    
    // Background colors
    background: '#FFFFFF',
    card: '#F2F2F7',
    
    // Text colors
    text: '#000000',
    textSecondary: '#8E8E93',
    
    // Border and divider colors
    border: '#C6C6C8',
    
    // Semantic colors
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
    info: '#42A5F5',
    disabled: '#BDBDBD',
    highlight: '#F5F8FF',
    
    // Brand-specific colors
    google: {
      blue: '#4285F4',
      red: '#DB4437',
      green: '#0F9D58',
      yellow: '#F4B400',
    },
    
    // Gradient colors
    gradients: {
      primary: ['#007AFF', '#5856D6'],
      secondary: ['#4F46E5', '#7C3AED'],
      success: ['#34C759', '#30D158'],
      error: ['#FF3B30', '#FF453A'],
    },
    
    // Overlay colors
    overlay: {
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.2)',
      dark: 'rgba(0, 0, 0, 0.5)',
      error: 'rgba(255, 59, 48, 0.1)',
      success: 'rgba(52, 199, 89, 0.1)',
      warning: 'rgba(255, 149, 0, 0.1)',
    },
    
    // Status colors
    status: {
      online: '#34C759',
      offline: '#8E8E93',
      busy: '#FF3B30',
      away: '#FF9500',
    },
  },
  
  // Dark theme support (for future use)
  dark: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    success: '#30D158',
    error: '#FF453A',
    warning: '#FF9F0A',
    info: '#64D2FF',
    disabled: '#3A3A3C',
    highlight: '#1C1C1E',
  }
};