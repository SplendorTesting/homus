export const colors = {
  // Main palette - Premium dark theme with gold accents
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceLight: '#252525',
  surfaceElevated: '#2A2A2A',
  
  // Gold accent
  primary: '#D4AF37',
  primaryLight: '#E8CC6B',
  primaryDark: '#B8960C',
  primaryFaded: 'rgba(212, 175, 55, 0.15)',
  
  // Text
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#666666',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  
  // Misc
  border: '#333333',
  borderLight: '#444444',
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Contact brand colors
  whatsapp: '#25D366',
  telegram: '#0088CC',
  phone: '#4CAF50',
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  gold: {
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  bodySecondary: {
    fontSize: 14,
    fontWeight: '400',
    color: '#A0A0A0',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666666',
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
};
