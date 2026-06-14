/**
 * The Game Hour design tokens (source of truth for v2).
 * Claymorphism (SKILL.md) + brand #032A5D + Violet accent.
 * Sync CSS variables in tokens.css when values change.
 */

export const colors = {
  primary: '#032A5D',
  primary700: '#04397D',
  primary600: '#0A4D9A',
  primary500: '#1E67B8',
  dark: '#021D40',
  light: '#EEF3F9',
  lightSoft: '#F7F9FC',

  secondary: '#8B5CF6',
  secondaryHover: '#7C3AED',
  secondaryLight: '#A78BFA',
  secondaryDark: '#7C3AED',
  secondaryForeground: '#FFFFFF',
  secondaryEmphasis: '#6D28D9',
  accentLight: '#F3EEFF',
  accentSoft: '#EDE9FE',

  /** Semantic foreground — sync with tokens.css contrast rules */
  onPrimary: '#FFFFFF',
  onAccent: '#FFFFFF',
  onDark: '#FFFFFF',
  onLight: '#032A5D',
  onAccentSubtle: '#6D28D9',
  onDisabled: 'rgba(107, 114, 128, 0.72)',

  neutral: {
    white: '#FFFFFF',
    warmWhite: '#FAFAFA',
    lightGrey: '#F8F8F8',
    mutedGrey: '#6B7280',
    text: '#444444',
    darkGrey: '#333333',
  },

  surface: {
    base: '#F5F8FC',
    muted: '#E8EEF6',
    elevated: '#FFFFFF',
    clay: '#FFFFFF',
    clayMuted: '#F3F6FB',
  },

  semantic: {
    success: '#22C55E',
    warning: '#F59E0B',
    whatsapp: '#25D366',
    error: '#EF4444',
  },

  overlay: {
    hero: 'rgba(0, 0, 0, 0.6)',
    slider: 'rgba(3, 42, 93, 0.55)',
    navGlass: 'rgba(3, 42, 93, 0.12)',
  },
} as const

/** SKILL.md spacing scale: 4 / 8 / 12 / 16 / 24 / 32 (px) */
export const spacing = {
  0: '0',
  1: '0.25rem', // 4
  2: '0.5rem', // 8
  3: '0.75rem', // 12
  4: '1rem', // 16
  5: '1.25rem', // 20, container padding mobile
  6: '1.5rem', // 24
  8: '2rem', // 32
  10: '2.5rem', // 40
  12: '3rem', // 48
  16: '4rem', // 64
  20: '5rem', // 80, section padding
  24: '6rem', // 96
  30: '7.5rem', // 120, hero offset
} as const

export const radius = {
  none: '0',
  sm: '4px',
  DEFAULT: '14px',
  md: '18px',
  lg: '22px',
  xl: '28px',
  '2xl': '36px',
  '3xl': '44px',
  full: '9999px',
} as const

/** Claymorphism, soft dual shadows (highlight + depth) */
export const shadow = {
  none: 'none',
  header: '0 4px 20px rgba(3, 42, 93, 0.15)',
  sm: '0 2px 8px rgba(3, 42, 93, 0.06)',
  card: '0 12px 32px rgba(3, 42, 93, 0.07), 0 2px 0 rgba(255, 255, 255, 0.95) inset',
  cardHover:
    '0 20px 48px rgba(3, 42, 93, 0.11), 0 2px 0 rgba(255, 255, 255, 1) inset',
  clay: '0 14px 36px rgba(3, 42, 93, 0.08), 0 3px 8px rgba(255, 255, 255, 0.85) inset',
  clayPressed: '0 6px 16px rgba(3, 42, 93, 0.1) inset',
  float: '0 24px 56px rgba(3, 42, 93, 0.09), 0 4px 12px rgba(255, 255, 255, 0.9) inset',
  image: '0 20px 48px rgba(3, 42, 93, 0.14), 0 2px 0 rgba(255, 255, 255, 0.2) inset',
  glowAccent: '0 10px 28px rgba(139, 92, 246, 0.28)',
  glowOrange: '0 10px 28px rgba(139, 92, 246, 0.28)',
  fab: '0 8px 20px rgba(3, 42, 93, 0.2), 0 2px 0 rgba(255, 255, 255, 0.25) inset',
} as const

export const typography = {
  fontFamily: {
    /** SKILL: display = Poppins */
    heading: "'Poppins', system-ui, -apple-system, 'Segoe UI', sans-serif",
    /** SKILL: primary = Montserrat */
    body: "'Montserrat', system-ui, -apple-system, 'Segoe UI', sans-serif",
    sans: "'Montserrat', system-ui, -apple-system, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  fontSize: {
    xs: '0.875rem',
    sm: '0.9375rem',
    base: '1rem',
    md: '1.0625rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.375rem',
    '3xl': '1.5rem',
    '4xl': '1.875rem',
    '5xl': '2.5rem',
    '6xl': '3.25rem',
    '7xl': '3.75rem',
  },
  lineHeight: {
    tight: 1.12,
    snug: 1.25,
    normal: 1.6,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: '-0.02em',
    wide: '0.04em',
  },
} as const

export const motion = {
  duration: {
    fast: '150ms',
    DEFAULT: '300ms',
    slow: '400ms',
    reveal: '800ms',
  },
  easing: {
    DEFAULT: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    out: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
} as const

export const layout = {
  containerMax: '1200px',
  containerWide: '1440px',
  containerUltra: '1536px',
  proseMax: '48rem',
  containerPadding: spacing[5],
  containerPaddingLg: spacing[6],
  containerPaddingWide: spacing[8],
  containerPaddingUltra: spacing[10],
  headerHeight: '4.5rem',
  sectionPaddingY: spacing[24],
  sectionPaddingYSm: spacing[12],
  sectionGap: spacing[6],
} as const

export const designTokens = {
  colors,
  spacing,
  radius,
  shadow,
  typography,
  motion,
  layout,
} as const

export type DesignTokens = typeof designTokens

export type BrandColor = keyof typeof colors
