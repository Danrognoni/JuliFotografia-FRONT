import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  getRelativeLuminance,
  isLightColor,
  getContrastTheme
} from './color-contrast.util';

describe('color-contrast.util', () => {
  describe('hexToRgb', () => {
    it('should parse 6-digit hex strings', () => {
      expect(hexToRgb('#ffffff')).toEqual([255, 255, 255]);
      expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
      expect(hexToRgb('#ff0000')).toEqual([255, 0, 0]);
      expect(hexToRgb('00ff00')).toEqual([0, 255, 0]);
      expect(hexToRgb('#0000ff')).toEqual([0, 0, 255]);
    });

    it('should parse 3-digit shorthand hex strings', () => {
      expect(hexToRgb('#fff')).toEqual([255, 255, 255]);
      expect(hexToRgb('#000')).toEqual([0, 0, 0]);
      expect(hexToRgb('#f00')).toEqual([255, 0, 0]);
    });

    it('should fallback gracefully for invalid or empty inputs', () => {
      expect(hexToRgb('')).toEqual([255, 255, 255]);
      expect(hexToRgb(undefined)).toEqual([255, 255, 255]);
      expect(hexToRgb('invalid')).toEqual([255, 255, 255]);
    });
  });

  describe('getRelativeLuminance', () => {
    it('should compute luminance 1 for pure white', () => {
      const lum = getRelativeLuminance('#ffffff');
      expect(lum).toBeCloseTo(1, 4);
    });

    it('should compute luminance 0 for pure black', () => {
      const lum = getRelativeLuminance('#000000');
      expect(lum).toBeCloseTo(0, 4);
    });

    it('should correctly weight components (G > R > B)', () => {
      const redLum = getRelativeLuminance('#ff0000');
      const greenLum = getRelativeLuminance('#00ff00');
      const blueLum = getRelativeLuminance('#0000ff');

      expect(greenLum).toBeGreaterThan(redLum);
      expect(redLum).toBeGreaterThan(blueLum);
    });
  });

  describe('isLightColor', () => {
    it('should classify typical light backgrounds as light', () => {
      expect(isLightColor('#ffffff')).toBe(true);
      expect(isLightColor('#faf9f6')).toBe(true);
      expect(isLightColor('#edf3f8')).toBe(true);
      expect(isLightColor('#f4f4f5')).toBe(true);
      expect(isLightColor('#feea68')).toBe(true); // yellow
    });

    it('should classify dark backgrounds as not light (dark)', () => {
      expect(isLightColor('#000000')).toBe(false);
      expect(isLightColor('#18181b')).toBe(false);
      expect(isLightColor('#111827')).toBe(false);
      expect(isLightColor('#0f172a')).toBe(false);
      expect(isLightColor('#262626')).toBe(false);
    });
  });

  describe('getContrastTheme', () => {
    it('should return dark text #1a1a1a for light backgrounds', () => {
      const lightTheme = getContrastTheme('#ffffff');
      expect(lightTheme.isLight).toBe(true);
      expect(lightTheme.textPrimary).toBe('#1a1a1a');
      expect(lightTheme.cardBg).toContain('255, 255, 255');
    });

    it('should return light text #f5f5f5 for dark backgrounds', () => {
      const darkTheme = getContrastTheme('#18181b');
      expect(darkTheme.isLight).toBe(false);
      expect(darkTheme.textPrimary).toBe('#f5f5f5');
      expect(darkTheme.cardBg).toContain('24, 24, 27');
    });
  });
});
