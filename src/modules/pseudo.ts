/**
 * Pseudo-Localization Module
 *
 * Expands translated text with visual markers to detect layout breaks
 * during development. Run app in 'pseudo' locale to catch buttons
 * that overflow when text gets longer in other languages.
 */

const VOWELS = 'aeiouáéíóúâêîôûãõ';
const ACCENT_MAP: Record<string, string> = {
  a: 'â', e: 'ê', i: 'î', o: 'ô', u: 'û',
  A: 'Â', E: 'Ê', I: 'Î', O: 'Ô', U: 'Û',
};

function extendVowel(char: string): string {
  const lower = char.toLowerCase();
  const isVowel = VOWELS.includes(lower);
  if (!isVowel) return char;

  const accented = ACCENT_MAP[lower] || char;
  return char === char.toUpperCase()
    ? accented.toUpperCase() + accented + accented
    : accented + accented + accented;
}

function addAccents(text: string): string {
  let result = '';
  let i = 0;
  while (i < text.length) {
    const char = text[i];
    if (VOWELS.includes(char.toLowerCase())) {
      result += extendVowel(char);
    } else if (char === ' ') {
      result += ' ';
    } else {
      result += char;
    }
    i++;
  }
  return result;
}

export function pseudoLocalize(text: string): string {
  if (!text || text.trim().length === 0) return text;

  const expanded = addAccents(text);
  return `[!!! ${expanded} !!!]`;
}

export function generatePseudoLanguage(
  sourceJson: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(sourceJson)) {
    if (typeof value === 'string') {
      result[key] = pseudoLocalize(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = generatePseudoLanguage(
        value as Record<string, unknown>
      );
    } else {
      result[key] = value;
    }
  }

  return result;
}

export function getPseudoLocale(): string {
  return 'pseudo';
}

export function isPseudoLocale(lang: string): boolean {
  return lang === 'pseudo';
}
