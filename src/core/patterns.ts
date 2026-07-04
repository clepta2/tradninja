// src/core/patterns.ts
// Patterns — lookup e interpolação de templates

import type { PatternTemplate, Language } from './types';
import { PATTERNS } from './patterns-data';

function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`
  );
}

export function interpolatePattern(key: string, params: Record<string, string | number>, target: Language = 'en'): string {
  const pattern = PATTERNS[key];
  if (!pattern) return key;
  return interpolate(pattern[target], params);
}

export function getPattern(key: string): PatternTemplate | undefined {
  return PATTERNS[key];
}

export { PATTERNS };
