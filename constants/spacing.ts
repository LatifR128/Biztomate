// Spacing system for consistent padding and margins
export const Spacing = {
  xs: 4,
  sm: 8,
  base: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

// Common spacing patterns
export const SpacingPatterns = {
  // Component spacing
  component: {
    padding: Spacing.md,
    margin: Spacing.md,
    gap: Spacing.base,
  },
  
  // Section spacing
  section: {
    padding: Spacing.xl,
    margin: Spacing.xl,
    gap: Spacing.lg,
  },
  
  // Card spacing
  card: {
    padding: Spacing.md,
    margin: Spacing.base,
    gap: Spacing.base,
  },
  
  // Form spacing
  form: {
    padding: Spacing.xl,
    margin: Spacing.xl,
    gap: Spacing.lg,
    fieldGap: Spacing.md,
  },
  
  // Button spacing
  button: {
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.md,
    margin: Spacing.base,
    gap: Spacing.sm,
  },
  
  // List spacing
  list: {
    padding: Spacing.md,
    itemGap: Spacing.base,
    sectionGap: Spacing.lg,
  },
  
  // Modal spacing
  modal: {
    padding: Spacing.xl,
    margin: Spacing.xl,
    gap: Spacing.lg,
  },
  
  // Header spacing
  header: {
    padding: Spacing.md,
    margin: Spacing.base,
    gap: Spacing.base,
  },
  
  // Footer spacing
  footer: {
    padding: Spacing.md,
    margin: Spacing.base,
    gap: Spacing.base,
  },
};

// Border radius system
export const BorderRadius = {
  xs: 4,
  sm: 8,
  base: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// Shadow system
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
}; 