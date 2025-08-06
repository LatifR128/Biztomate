// Typography system for consistent font sizes and weights
export const Typography = {
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
    '6xl': 40,
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  }
};

// Helper functions for common text styles
export const TextStyles = {
  // Headings
  h1: {
    fontSize: Typography.sizes['5xl'],
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.lineHeights.tight,
  },
  h2: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.lineHeights.tight,
  },
  h3: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.lineHeights.normal,
  },
  h4: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.lineHeights.normal,
  },
  h5: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.lineHeights.normal,
  },
  h6: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.lineHeights.normal,
  },
  
  // Body text
  body: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.normal,
    lineHeight: Typography.lineHeights.relaxed,
  },
  bodyLarge: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.normal,
    lineHeight: Typography.lineHeights.relaxed,
  },
  bodySmall: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.normal,
    lineHeight: Typography.lineHeights.relaxed,
  },
  
  // Captions and labels
  caption: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.normal,
    lineHeight: Typography.lineHeights.normal,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    lineHeight: Typography.lineHeights.normal,
  },
  
  // Buttons
  button: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.lineHeights.normal,
  },
  buttonSmall: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.lineHeights.normal,
  },
  buttonLarge: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.lineHeights.normal,
  },
}; 