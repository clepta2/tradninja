import type { TranslationKey } from '../src/core/types';

// TranslationKey should accept dot-notation strings
const validKey: TranslationKey = 'common.ok';
const nestedKey: TranslationKey = 'auth.login';

// TranslationKey should accept any string (compatibility)
const anyString: TranslationKey = 'some arbitrary text';

// Compile-time type test: verify TranslationKey is assignable from string literals
function assertKey(_key: TranslationKey): void {}

describe('TranslationKey type', () => {
  it('accepts valid dot-notation keys', () => {
    expect(() => assertKey('common.ok')).not.toThrow();
    expect(() => assertKey('auth.login')).not.toThrow();
  });

  it('accepts plain strings for backward compatibility', () => {
    expect(() => assertKey('OK')).not.toThrow();
    expect(() => assertKey('Entrar')).not.toThrow();
  });
});
