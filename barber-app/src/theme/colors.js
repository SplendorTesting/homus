// ============================================================
//  TRIMMER — Premium Design System
// ============================================================

export const colors = {
  // Base — warm near-black with subtle depth layers
  background: '#0A0A0B',
  backgroundAlt: '#0E0E10',
  surface: '#141416',
  surfaceLight: '#1C1C1F',
  surfaceElevated: '#222226',
  surfaceHover: '#2A2A2F',

  // Champagne gold accent — warm, refined, not garish
  primary: '#C8A864',
  primaryLight: '#E2C98B',
  primaryDark: '#A8893F',
  primaryFaded: 'rgba(200, 168, 100, 0.12)',
  primaryGlow: 'rgba(200, 168, 100, 0.25)',

  // Text — high contrast hierarchy
  text: '#F5F3EF',
  textSecondary: '#9B998F',
  textMuted: '#5C5A55',
  textOnGold: '#1A1408',

  // Status
  success: '#5FB88A',
  warning: '#E0A458',
  danger: '#D9716B',
  info: '#6FA8C9',

  // Structure
  border: '#26262A',
  borderLight: '#34343A',
  borderGold: 'rgba(200, 168, 100, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.75)',

  // Contact brand colors (muted to fit theme)
  whatsapp: '#4CC568',
  telegram: '#5CA9D9',
  phone: '#6FB37A',
};

// Gradients (use with expo-linear-gradient)
export const gradients = {
  gold: ['#E2C98B', '#C8A864', '#A8893F'],
  goldSubtle: ['rgba(200,168,100,0.18)', 'rgba(200,168,100,0.04)'],
  surface: ['#1C1C1F', '#141416'],
  surfaceElevated: ['#26262B', '#19191C'],
  dark: ['#141416', '#0A0A0B'],
  hero: ['#1E1B14', '#121110', '#0A0A0B'],
  card: ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.01)'],
  fadeBottom: ['transparent', '#0A0A0B'],
};

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
  },
  gold: {
    shadowColor: '#C8A864',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  goldStrong: {
    shadowColor: '#C8A864',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 36,
  full: 9999,
};

// Backwards-compat alias
export const borderRadius = radius;

// Font families (loaded via expo-font in App.js)
export const fonts = {
  display: 'PlayfairDisplay_600SemiBold',
  displayBold: 'PlayfairDisplay_700Bold',
  heading: 'Manrope_700Bold',
  semibold: 'Manrope_600SemiBold',
  medium: 'Manrope_500Medium',
  body: 'Manrope_400Regular',
};

export const typography = {
  // Serif display — for brand & hero numbers
  display: {
    fontFamily: fonts.displayBold,
    fontSize: 34,
    color: colors.text,
    letterSpacing: 0.3,
  },
  h1: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.text,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.text,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    color: colors.text,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
  bodyRegular: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
  },
  bodySecondary: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  caption: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  button: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: colors.textOnGold,
    letterSpacing: 0.2,
  },
};
