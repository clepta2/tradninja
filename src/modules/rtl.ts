/**
 * RTL Support Module
 *
 * Provides right-to-left layout configuration for languages
 * like Arabic, Hebrew, Persian, and Urdu. Integrates with
 * Expo I18nManager for React Native layout mirroring.
 */

const RTL_LANGUAGES = new Set([
  'ar', // Arabic
  'he', // Hebrew
  'fa', // Persian
  'ur', // Urdu
  'ps', // Pashto
  'sd', // Sindhi
  'yi', // Yiddish
]);

export function isRTLLanguage(lang: string): boolean {
  const code = lang.split('-')[0].toLowerCase();
  return RTL_LANGUAGES.has(code);
}

export interface RTLConfig {
  isRTL: boolean;
  textAlign: 'left' | 'right';
  flexDirection: 'row' | 'row-reverse';
}

export function getRTLConfig(lang: string): RTLConfig {
  const rtl = isRTLLanguage(lang);
  return {
    isRTL: rtl,
    textAlign: rtl ? 'right' : 'left',
    flexDirection: rtl ? 'row-reverse' : 'row',
  };
}

export function applyRTLLayout<T extends Record<string, unknown>>(
  style: T,
  lang: string
): T {
  const config = getRTLConfig(lang);

  if (!config.isRTL) {
    return { ...style, direction: 'ltr' as const };
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(style)) {
    if (key === 'marginLeft' && config.isRTL) {
      result.marginRight = value;
    } else if (key === 'marginRight' && config.isRTL && !('marginLeft' in style)) {
      result.marginLeft = value;
    } else if (key === 'paddingLeft' && config.isRTL) {
      result.paddingRight = value;
    } else {
      result[key] = value;
    }
  }

  result.textAlign = config.textAlign;
  result.direction = 'rtl';
  if ('flexDirection' in style) {
    result.flexDirection = config.flexDirection;
  }

  return result as T;
}

export function getRTLanguages(): string[] {
  return Array.from(RTL_LANGUAGES);
}

export function mirrorIfNeeded(
  value: string,
  lang: string
): string {
  if (!isRTLLanguage(lang)) return value;
  return `\u200F${value}`;
}
