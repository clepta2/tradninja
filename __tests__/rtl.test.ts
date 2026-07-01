import {
  isRTLLanguage,
  getRTLConfig,
  applyRTLLayout,
  getRTLanguages,
  mirrorIfNeeded,
} from '../src/modules/rtl';

describe('RTL Support Module', () => {
  describe('isRTLLanguage', () => {
    it('identifies Arabic as RTL', () => {
      expect(isRTLLanguage('ar')).toBe(true);
    });

    it('identifies Hebrew as RTL', () => {
      expect(isRTLLanguage('he')).toBe(true);
    });

    it('identifies Persian as RTL', () => {
      expect(isRTLLanguage('fa')).toBe(true);
    });

    it('identifies Urdu as RTL', () => {
      expect(isRTLLanguage('ur')).toBe(true);
    });

    it('handles language codes with region', () => {
      expect(isRTLLanguage('ar-SA')).toBe(true);
      expect(isRTLLanguage('he-IL')).toBe(true);
    });

    it('rejects LTR languages', () => {
      expect(isRTLLanguage('pt')).toBe(false);
      expect(isRTLLanguage('en')).toBe(false);
      expect(isRTLLanguage('es')).toBe(false);
      expect(isRTLLanguage('fr')).toBe(false);
    });

    it('is case-insensitive', () => {
      expect(isRTLLanguage('AR')).toBe(true);
      expect(isRTLLanguage('He')).toBe(true);
    });
  });

  describe('getRTLConfig', () => {
    it('returns RTL config for Arabic', () => {
      const config = getRTLConfig('ar');
      expect(config).toEqual({
        isRTL: true,
        textAlign: 'right',
        flexDirection: 'row-reverse',
      });
    });

    it('returns LTR config for English', () => {
      const config = getRTLConfig('en');
      expect(config).toEqual({
        isRTL: false,
        textAlign: 'left',
        flexDirection: 'row',
      });
    });

    it('returns RTL config for Hebrew', () => {
      const config = getRTLConfig('he');
      expect(config.isRTL).toBe(true);
      expect(config.textAlign).toBe('right');
    });
  });

  describe('applyRTLLayout', () => {
    it('applies RTL direction to style', () => {
      const style = { padding: 10 };
      const result = applyRTLLayout(style, 'ar');
      expect(result.direction).toBe('rtl');
      expect(result.textAlign).toBe('right');
    });

    it('reverses flexDirection for RTL', () => {
      const style = { flexDirection: 'row' as const };
      const result = applyRTLLayout(style, 'he');
      expect(result.flexDirection).toBe('row-reverse');
    });

    it('swaps marginLeft to marginRight for RTL', () => {
      const style = { marginLeft: 16 };
      const result = applyRTLLayout(style, 'ar');
      expect(result).toHaveProperty('marginRight', 16);
      expect(result).not.toHaveProperty('marginLeft');
    });

    it('swaps paddingLeft to paddingRight for RTL', () => {
      const style = { paddingLeft: 12 };
      const result = applyRTLLayout(style, 'fa');
      expect(result).toHaveProperty('paddingRight', 12);
      expect(result).not.toHaveProperty('paddingLeft');
    });

    it('does not modify LTR styles', () => {
      const style = { flexDirection: 'row' as const, marginLeft: 16 };
      const result = applyRTLLayout(style, 'en');
      expect(result.direction).toBe('ltr');
      expect(result.flexDirection).toBe('row');
      expect(result.marginLeft).toBe(16);
    });

    it('preserves original style object', () => {
      const style = { marginLeft: 16 };
      applyRTLLayout(style, 'ar');
      expect(style).toHaveProperty('marginLeft', 16);
    });
  });

  describe('getRTLanguages', () => {
    it('returns all RTL language codes', () => {
      const langs = getRTLanguages();
      expect(langs).toContain('ar');
      expect(langs).toContain('he');
      expect(langs).toContain('fa');
      expect(langs).toContain('ur');
      expect(langs.length).toBe(7);
    });
  });

  describe('mirrorIfNeeded', () => {
    it('adds RTL mark for RTL languages', () => {
      const result = mirrorIfNeeded('مرحبا', 'ar');
      expect(result).toContain('\u200F');
    });

    it('returns unchanged for LTR languages', () => {
      const result = mirrorIfNeeded('Hello', 'en');
      expect(result).toBe('Hello');
    });
  });
});
