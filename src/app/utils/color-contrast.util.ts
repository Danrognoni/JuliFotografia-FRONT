/**
 * Utility functions for color parsing, WCAG 2.1 relative luminance,
 * and intelligent contrast calculations.
 */

export interface ContrastTheme {
  isLight: boolean;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderColor: string;
  cardBg: string;
  cardBorder: string;
  cardText: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  badgeBg: string;
  badgeText: string;
  pillBg: string;
  pillText: string;
  pillHover: string;
}

/**
 * Parses a HEX string into [R, G, B] values in the 0..255 range.
 * Supports 3-digit (#fff), 4-digit (#ffff), 6-digit (#ffffff), and 8-digit (#ffffffff) hexes.
 */
export function hexToRgb(hex?: string): [number, number, number] {
  if (!hex) return [255, 255, 255];
  let clean = hex.trim().replace(/^#/, '');

  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  } else if (clean.length === 4) {
    clean = clean.slice(0, 3).split('').map(c => c + c).join('');
  } else if (clean.length === 8) {
    clean = clean.slice(0, 6);
  }

  if (clean.length !== 6) {
    return [255, 255, 255]; // fallback safe default
  }

  const num = parseInt(clean, 16);
  if (isNaN(num)) return [255, 255, 255];

  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  return [r, g, b];
}

/**
 * Calculates WCAG 2.1 Relative Luminance (L) from a hex color string.
 * Formula: L = 0.2126 * R_lin + 0.7152 * G_lin + 0.0722 * B_lin
 * where C_lin = C_srgb <= 0.04045 ? C_srgb / 12.92 : ((C_srgb + 0.055) / 1.055)^2.4
 * Return value is in the range [0, 1], where 0 is pure black and 1 is pure white.
 */
export function getRelativeLuminance(hex?: string): number {
  const [r, g, b] = hexToRgb(hex);

  const rSrgb = r / 255;
  const gSrgb = g / 255;
  const bSrgb = b / 255;

  const rLin = rSrgb <= 0.04045 ? rSrgb / 12.92 : Math.pow((rSrgb + 0.055) / 1.055, 2.4);
  const gLin = gSrgb <= 0.04045 ? gSrgb / 12.92 : Math.pow((gSrgb + 0.055) / 1.055, 2.4);
  const bLin = bSrgb <= 0.04045 ? bSrgb / 12.92 : Math.pow((bSrgb + 0.055) / 1.055, 2.4);

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Checks if a color is light using the WCAG relative luminance standard.
 * Default threshold is 0.45.
 */
export function isLightColor(hex?: string, threshold = 0.45): boolean {
  if (!hex) return true;
  return getRelativeLuminance(hex) > threshold;
}

/**
 * Returns comprehensive adaptive contrast tokens for text, cards, borders, and inputs
 * based on the background color luminance.
 * - If background is light: forces text to dark legible `#1a1a1a`
 * - If background is dark: forces text to light legible `#f5f5f5`
 */
export function getContrastTheme(hex?: string): ContrastTheme {
  const isLight = isLightColor(hex);

  if (isLight) {
    return {
      isLight: true,
      textPrimary: '#1a1a1a',
      textSecondary: '#52525b',
      textMuted: '#71717a',
      borderColor: 'rgba(0, 0, 0, 0.1)',
      cardBg: 'rgba(255, 255, 255, 0.85)',
      cardBorder: 'rgba(0, 0, 0, 0.08)',
      cardText: '#1a1a1a',
      inputBg: '#ffffff',
      inputBorder: 'rgba(0, 0, 0, 0.18)',
      inputText: '#1a1a1a',
      badgeBg: 'rgba(0, 0, 0, 0.06)',
      badgeText: '#27272a',
      pillBg: 'rgba(0, 0, 0, 0.06)',
      pillText: '#18181b',
      pillHover: 'rgba(0, 0, 0, 0.12)'
    };
  } else {
    return {
      isLight: false,
      textPrimary: '#f5f5f5',
      textSecondary: '#d4d4d8',
      textMuted: '#a1a1aa',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      cardBg: 'rgba(24, 24, 27, 0.75)',
      cardBorder: 'rgba(255, 255, 255, 0.12)',
      cardText: '#f5f5f5',
      inputBg: 'rgba(39, 39, 42, 0.8)',
      inputBorder: 'rgba(255, 255, 255, 0.2)',
      inputText: '#f5f5f5',
      badgeBg: 'rgba(255, 255, 255, 0.12)',
      badgeText: '#f4f4f5',
      pillBg: 'rgba(255, 255, 255, 0.12)',
      pillText: '#fafafa',
      pillHover: 'rgba(255, 255, 255, 0.22)'
    };
  }
}
