import type { Language } from '../core/types';
import { createTranslator } from '../core/engine';

interface ContentResult {
  text: string;
  matched: boolean;
  confidence: number;
}

interface ContentOptions {
  source?: Language;
  target: Language;
  fallback?: string;
  maxLength?: number;
}

const translator = createTranslator({ cacheEnabled: true });

const CONTENT_RULES: Array<{
  pattern: RegExp;
  replacement: (match: string, num: string, target: Language) => string;
}> = [
  {
    pattern: /(\d+)\s*(?:séries?|sets?|series?)/gi,
    replacement: (_, num, target) => {
      const map: Partial<Record<Language, string>> = {
        pt: `${num} séries`,
        en: `${num} sets`,
        es: `${num} series`,
      };
      return map[target] || `${num} sets`;
    },
  },
  {
    pattern: /(\d+)\s*(?:reps?|repetições?|repeticiones?)/gi,
    replacement: (_, num, target) => {
      const map: Partial<Record<Language, string>> = {
        pt: `${num} reps`,
        en: `${num} reps`,
        es: `${num} reps`,
      };
      return map[target] || `${num} reps`;
    },
  },
  {
    pattern: /(\d+)\s*(?:minutos?|min\.?)/gi,
    replacement: (_, num, target) => {
      const map: Partial<Record<Language, string>> = {
        pt: `${num} minutos`,
        en: `${num} min`,
        es: `${num} minutos`,
      };
      return map[target] || `${num} min`;
    },
  },
  {
    pattern: /(\d+)\s*(?:segundos?|seg\.?|s)/gi,
    replacement: (_, num, target) => {
      const map: Partial<Record<Language, string>> = {
        pt: `${num} segundos`,
        en: `${num} seconds`,
        es: `${num} segundos`,
      };
      return map[target] || `${num} s`;
    },
  },
];

export function translateContent(
  text: string,
  options: ContentOptions
): ContentResult {
  const source = options.source || 'pt';
  const target = options.target;

  if (source === target) {
    return { text, matched: true, confidence: 1 };
  }

  // Try pattern rules first
  let result = text;
  let patternMatched = false;
  for (const rule of CONTENT_RULES) {
    if (rule.pattern.test(text)) {
      rule.pattern.lastIndex = 0;
      result = text.replace(rule.pattern, (match, num) =>
        rule.replacement(match, num, target)
      );
      patternMatched = true;
    }
  }

  if (patternMatched) {
    return { text: result, matched: true, confidence: 0.8 };
  }

  // Try translator engine (dictionary + patterns + rules)
  const translated = translator.translate(text, {
    source,
    target,
    fallback: options.fallback,
  });

  if (translated.matched) {
    return {
      text: translated.text,
      matched: true,
      confidence: 0.95,
    };
  }

  // Fallback chain: return original or fallback
  const fallbackText = options.fallback || text;
  return {
    text: fallbackText,
    matched: false,
    confidence: 0,
  };
}

export function translateDynamicContent(
  content: string[],
  target: Language
): ContentResult[] {
  return content.map((item) =>
    translateContent(item, { target })
  );
}

export function translateWithVariables(
  template: string,
  vars: Record<string, string | number>,
  target: Language
): ContentResult {
  let interpolated = template;
  for (const [key, value] of Object.entries(vars)) {
    interpolated = interpolated.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }

  return translateContent(interpolated, { target });
}
