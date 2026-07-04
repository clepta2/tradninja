// src/core/rules.ts
// Regras gramaticais com regex pré-compilados

import type { GrammarRule, Language } from './types';

// ── Artigos PT→EN/ES ──────────────────────────────────────
const ARTICLES_PT_EN = [
  { pt: /\bo\b/gi, en: 'the', es: 'el' },
  { pt: /\ba\b/gi, en: 'the', es: 'la' },
  { pt: /\bum\b/gi, en: 'a', es: 'un' },
  { pt: /\buma\b/gi, en: 'a', es: 'una' },
  { pt: /\bos\b/gi, en: 'the', es: 'los' },
  { pt: /\bas\b/gi, en: 'the', es: 'las' },
  { pt: /\bums\b/gi, en: 'some', es: 'unos' },
  { pt: /\bumas\b/gi, en: 'some', es: 'unas' },
];

// ── Possessivos ────────────────────────────────────────────
const POSSESSIVES: Record<string, { en: string; es: string }> = {
  meu: { en: 'my', es: 'mi' }, minha: { en: 'my', es: 'mi' },
  teu: { en: 'your', es: 'tu' }, tua: { en: 'your', es: 'tu' },
  seu: { en: 'your', es: 'su' }, sua: { en: 'your', es: 'su' },
  nosso: { en: 'our', es: 'nuestro' }, nossa: { en: 'our', es: 'nuestra' },
  deles: { en: 'their', es: 'su' }, delas: { en: 'their', es: 'su' },
};

// ── Negação ────────────────────────────────────────────────
const NEGATION: Record<string, { en: string; es: string }> = {
  nenhum: { en: 'no', es: 'ningún' }, nenhuma: { en: 'no', es: 'ninguna' },
  ningueem: { en: 'nobody', es: 'nadie' }, nada: { en: 'nothing', es: 'nada' },
  nunca: { en: 'never', es: 'nunca' }, nem: { en: 'neither', es: 'ni' },
};

// ── RegExp pré-compilados (uma vez no init) ─────────────────
const POSSESSIVE_EN = Object.entries(POSSESSIVES).map(([pt, m]) => ({
  regex: new RegExp(`\\b${pt}\\b`, 'gi'), replacement: m.en,
}));
const POSSESSIVE_ES = Object.entries(POSSESSIVES).map(([pt, m]) => ({
  regex: new RegExp(`\\b${pt}\\b`, 'gi'), replacement: m.es,
}));
const NEGATION_EN = Object.entries(NEGATION).map(([pt, m]) => ({
  regex: new RegExp(`\\b${pt}\\b`, 'gi'), replacement: m.en,
}));
const NEGATION_ES = Object.entries(NEGATION).map(([pt, m]) => ({
  regex: new RegExp(`\\b${pt}\\b`, 'gi'), replacement: m.es,
}));

// ── Regras de gramática (pré-compiladas) ───────────────────
export const GRAMMAR_RULES: GrammarRule[] = [
  ...ARTICLES_PT_EN.map((a, i) => ({
    id: `article-${i}`, source: 'pt' as Language, target: 'en' as Language,
    match: a.pt, replace: () => a.en, description: `PT article → EN ${a.en}`,
  })),
  ...ARTICLES_PT_EN.map((a, i) => ({
    id: `article-es-${i}`, source: 'pt' as Language, target: 'es' as Language,
    match: a.pt, replace: () => a.es, description: `PT article → ES ${a.es}`,
  })),
];

// ── Aplicação de regras (regex pré-compilados) ──────────────
export function applyRules(text: string, source: Language, target: Language): string {
  if (source === 'pt' && target === 'en') {
    let r = text;
    for (const { regex, replacement } of POSSESSIVE_EN) r = r.replace(regex, replacement);
    for (const { regex, replacement } of NEGATION_EN) r = r.replace(regex, replacement);
    return r;
  }
  if (source === 'pt' && target === 'es') {
    let r = text;
    for (const { regex, replacement } of POSSESSIVE_ES) r = r.replace(regex, replacement);
    for (const { regex, replacement } of NEGATION_ES) r = r.replace(regex, replacement);
    return r;
  }
  return text;
}

// ── Formatação de números ──────────────────────────────────
const NUMBER_FORMATS = {
  pt: { decimal: ',', thousands: '.', currency: 'R$ ' },
  en: { decimal: '.', thousands: ',', currency: '$' },
  es: { decimal: ',', thousands: '.', currency: '$' },
} as const;

export function formatNumber(value: number, target: Language, decimals = 0): string {
  const fmt = NUMBER_FORMATS[target];
  const parts = value.toFixed(decimals).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, fmt.thousands);
  return parts[1] ? intPart + fmt.decimal + parts[1] : intPart;
}

export function formatCurrency(value: number, target: Language, decimals = 2): string {
  return NUMBER_FORMATS[target].currency + formatNumber(value, target, decimals);
}

// ── Mapa de gêneros (memoizado) ────────────────────────────
const GENDER_MAP: Record<string, Record<Language, string>> = {
  masculino: { pt: 'masculino', en: 'male', es: 'masculino' },
  feminino: { pt: 'feminino', en: 'female', es: 'femenino' },
  forte: { pt: 'forte', en: 'strong', es: 'fuerte' },
  bom: { pt: 'bom', en: 'good', es: 'bueno' },
  otimo: { pt: 'ótimo', en: 'great', es: 'genial' },
};

export function getGenderMap(): Record<string, Record<Language, string>> {
  return GENDER_MAP;
}
