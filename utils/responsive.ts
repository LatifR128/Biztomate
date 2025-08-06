import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const isTablet = width >= 768;
export const isLargeScreen = width >= 1024;
export const isSmallScreen = width < 375;

export const getResponsiveValue = (mobile: number, tablet: number, large?: number) => {
  if (isLargeScreen && large !== undefined) return large;
  if (isTablet) return tablet;
  return mobile;
};

export const getResponsiveFontSize = (mobile: number, tablet: number, large?: number) => {
  return getResponsiveValue(mobile, tablet, large);
};

export const getResponsivePadding = (mobile: number, tablet: number, large?: number) => {
  return getResponsiveValue(mobile, tablet, large);
};

export const getResponsiveMargin = (mobile: number, tablet: number, large?: number) => {
  return getResponsiveValue(mobile, tablet, large);
}; 