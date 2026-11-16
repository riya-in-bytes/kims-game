/**
 * Design tokens. Every colour, size and radius in the app comes from here so
 * a future visual refresh (custom fonts, light theme, seasonal packs) is a
 * one-file change.
 */
export const colors = {
  bg: '#0B0F1A',
  gradientTop: '#171E38',
  gradientBottom: '#0B0F1A',
  surface: 'rgba(255,255,255,0.06)',
  surfaceStrong: 'rgba(255,255,255,0.10)',
  border: 'rgba(255,255,255,0.10)',
  text: '#F5F7FF',
  textMuted: '#9AA3BF',
  textFaint: '#5F6886',
  primary: '#7C5CFF',
  success: '#34D399',
  danger: '#FB7185',
  warning: '#FBBF24',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const type = {
  display: { fontSize: 36, fontWeight: '800', letterSpacing: -1, color: colors.text },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5, color: colors.text },
  heading: { fontSize: 18, fontWeight: '700', color: colors.text },
  body: { fontSize: 16, fontWeight: '400', color: colors.text, lineHeight: 22 },
  bodyMuted: { fontSize: 15, fontWeight: '400', color: colors.textMuted, lineHeight: 21 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
} as const;

/** Adds an alpha channel to a hex colour such as #7C5CFF. */
export function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
