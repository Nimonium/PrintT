// PrintT Design System - Q4 (Alert + Serious) - Trustworthy Blue
export const theme = {
  // Primary Colors - Trustworthy Blue System
  primary: '#0D47A1',
  primaryLight: '#1976D2',
  primaryDark: '#01579B',
  
  // Secondary/Accent - Teal
  secondary: '#1EA4B8',
  secondaryLight: '#4FC3F7',
  secondaryDark: '#0277BD',
  
  // Semantic Colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  surface: '#FFFFFF',
  
  // Dark Mode
  backgroundDark: '#0F172A',
  backgroundSecondaryDark: '#1E293B',
  surfaceDark: '#1F1F1F',
  
  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  // Dark Mode Text
  textPrimaryDark: '#FFFFFF',
  textSecondaryDark: '#9CA3AF',
  textTertiaryDark: '#6B7280',
  
  // Borders
  border: '#E5E7EB',
  borderDark: '#374151',
  
  // Shadows
  shadow: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 8,
    },
  },
  
  // Border Radius
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    xl: 20,
    full: 9999,
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  
  // Typography - Dashboard Archetype
  typography: {
    heroData: { fontSize: 48, fontWeight: '700' as const },
    heroLabel: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 1, textTransform: 'uppercase' as const },
    pageTitle: { fontSize: 28, fontWeight: '700' as const },
    sectionTitle: { fontSize: 20, fontWeight: '600' as const },
    cardTitle: { fontSize: 16, fontWeight: '600' as const },
    cardValue: { fontSize: 24, fontWeight: '700' as const },
    body: { fontSize: 15, fontWeight: '400' as const },
    caption: { fontSize: 13, fontWeight: '400' as const },
    small: { fontSize: 11, fontWeight: '500' as const },
    button: { fontSize: 16, fontWeight: '600' as const },
  },
};
