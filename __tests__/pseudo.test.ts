import {
  pseudoLocalize,
  generatePseudoLanguage,
  getPseudoLocale,
  isPseudoLocale,
} from '../src/modules/pseudo';

describe('Pseudo-Localization Module', () => {
  describe('pseudoLocalize', () => {
    it('wraps text with bracket markers', () => {
      const result = pseudoLocalize('Save');
      expect(result).toMatch(/^\[!!! .+ !!!\]$/);
    });

    it('extends vowels with accents', () => {
      const result = pseudoLocalize('Save');
      expect(result).toContain('â');
    });

    it('handles Portuguese text', () => {
      const result = pseudoLocalize('Salvar');
      expect(result).toMatch(/^\[!!! .+ !!!\]$/);
      expect(result.length).toBeGreaterThan('Salvar'.length);
    });

    it('returns empty string for empty input', () => {
      expect(pseudoLocalize('')).toBe('');
    });

    it('returns whitespace for whitespace-only input', () => {
      expect(pseudoLocalize('   ')).toBe('   ');
    });

    it('preserves non-vowel characters', () => {
      const result = pseudoLocalize('bc');
      expect(result).toContain('b');
      expect(result).toContain('c');
    });
  });

  describe('generatePseudoLanguage', () => {
    it('transforms flat JSON', () => {
      const input = { hello: 'Hello', world: 'World' };
      const result = generatePseudoLanguage(input);

      expect(result.hello).not.toBe('Hello');
      expect(result.world).not.toBe('World');
      expect(String(result.hello)).toMatch(/^\[!!! .+ !!!\]$/);
    });

    it('transforms nested JSON', () => {
      const input = {
        nav: { home: 'Home', about: 'About' },
      };
      const result = generatePseudoLanguage(input);

      const nav = result.nav as Record<string, unknown>;
      expect(String(nav.home)).toMatch(/^\[!!! .+ !!!\]$/);
      expect(String(nav.about)).toMatch(/^\[!!! .+ !!!\]$/);
    });

    it('preserves non-string values', () => {
      const input = { count: 42, active: true, label: 'Test' };
      const result = generatePseudoLanguage(input);

      expect(result.count).toBe(42);
      expect(result.active).toBe(true);
      expect(String(result.label)).toMatch(/^\[!!! .+ !!!\]$/);
    });
  });

  describe('getPseudoLocale / isPseudoLocale', () => {
    it('returns pseudo as locale name', () => {
      expect(getPseudoLocale()).toBe('pseudo');
    });

    it('identifies pseudo locale', () => {
      expect(isPseudoLocale('pseudo')).toBe(true);
    });

    it('rejects non-pseudo locales', () => {
      expect(isPseudoLocale('pt')).toBe(false);
      expect(isPseudoLocale('en')).toBe(false);
    });
  });
});
