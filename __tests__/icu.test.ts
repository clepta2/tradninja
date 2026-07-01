import {
  resolveICU,
  hasICUMessages,
  extractICUKeys,
} from '../src/modules/icu';

describe('ICU MessageFormat Module', () => {
  describe('resolveICU - plural', () => {
    it('resolves =0 case', () => {
      const msg = '{count, plural, =0 {no items} one {1 item} other {# items}}';
      expect(resolveICU(msg, { count: 0 })).toBe('no items');
    });

    it('resolves =1 case', () => {
      const msg = '{count, plural, =0 {no items} =1 {1 item} other {# items}}';
      expect(resolveICU(msg, { count: 1 })).toBe('1 item');
    });

    it('resolves other case with # replacement', () => {
      const msg = '{count, plural, =0 {no items} one {1 item} other {# items}}';
      expect(resolveICU(msg, { count: 5 })).toBe('5 items');
    });

    it('handles Portuguese plural', () => {
      const msg = '{count, plural, =0 {nenhum treino} =1 {1 treino} other {# treinos}}';
      expect(resolveICU(msg, { count: 3 })).toBe('3 treinos');
    });

    it('handles zero keyword', () => {
      const msg = '{count, plural, zero {none} one {one} other {many}}';
      expect(resolveICU(msg, { count: 0 })).toBe('none');
    });

    it('handles two keyword when present', () => {
      const msg = '{count, plural, one {one} two {two} other {other}}';
      expect(resolveICU(msg, { count: 2 })).toBe('two');
    });
  });

  describe('resolveICU - select', () => {
    it('resolves select by value', () => {
      const msg = '{gender, select, male {he} female {she} other {they}}';
      expect(resolveICU(msg, { gender: 'male' })).toBe('he');
      expect(resolveICU(msg, { gender: 'female' })).toBe('she');
      expect(resolveICU(msg, { gender: 'other' })).toBe('they');
    });

    it('falls back to other for unknown values', () => {
      const msg = '{gender, select, male {he} female {she} other {they}}';
      expect(resolveICU(msg, { gender: 'unknown' })).toBe('they');
    });

    it('handles select with no match falls to other', () => {
      const msg = '{role, select, admin {admin} user {user} other {guest}}';
      expect(resolveICU(msg, { role: 'moderator' })).toBe('guest');
    });
  });

  describe('resolveICU - missing params', () => {
    it('returns original pattern when param missing', () => {
      const msg = '{count, plural, =0 {none} other {# items}}';
      const result = resolveICU(msg, {});
      expect(result).toBe('{count, plural, =0 {none} other {# items}}');
    });
  });

  describe('resolveICU - multiple patterns', () => {
    it('resolves multiple ICU patterns in one string', () => {
      const msg = '{name} has {count, plural, =0 {no items} other {# items}}';
      const result = resolveICU(msg, { name: 'João', count: 3 });
      expect(result).toBe('João has 3 items');
    });
  });

  describe('hasICUMessages', () => {
    it('detects ICU patterns', () => {
      expect(hasICUMessages('{count, plural, other {#}}')).toBe(true);
    });

    it('rejects plain text', () => {
      expect(hasICUMessages('Hello world')).toBe(false);
    });

    it('rejects simple interpolation', () => {
      expect(hasICUMessages('{name} is here')).toBe(false);
    });
  });

  describe('extractICUKeys', () => {
    it('extracts single key', () => {
      const msg = '{count, plural, other {# items}}';
      expect(extractICUKeys(msg)).toEqual(['count']);
    });

    it('extracts multiple unique keys', () => {
      const msg = '{name} has {count, plural, other {#}} of {total, select, other {many}}';
      expect(extractICUKeys(msg)).toEqual(['count', 'total']);
    });

    it('returns empty for no ICU patterns', () => {
      expect(extractICUKeys('plain text')).toEqual([]);
    });
  });
});
