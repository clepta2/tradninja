// src/core/rules.ts
// Regras gramaticais com regex pré-compilados — PT→EN/ES/FR/DE

import type { GrammarRule, Language } from './types';

// ── Artigos PT → EN/ES/FR/DE ──────────────────────────────
const ARTICLES = [
  { pt: /\bo\b/gi, en: 'the', es: 'el', fr: 'le', de: 'der' },
  { pt: /\ba\b/gi, en: 'the', es: 'la', fr: 'la', de: 'die' },
  { pt: /\bum\b/gi, en: 'a', es: 'un', fr: 'un', de: 'ein' },
  { pt: /\buma\b/gi, en: 'a', es: 'una', fr: 'une', de: 'eine' },
  { pt: /\bos\b/gi, en: 'the', es: 'los', fr: 'les', de: 'die' },
  { pt: /\bas\b/gi, en: 'the', es: 'las', fr: 'les', de: 'die' },
  { pt: /\bums\b/gi, en: 'some', es: 'unos', fr: 'des', de: 'einige' },
  { pt: /\bumas\b/gi, en: 'some', es: 'unas', fr: 'des', de: 'einige' },
];

// ── Possessivos ────────────────────────────────────────────
const POSSESSIVES: Record<string, Record<string, string>> = {
  meu: { en: 'my', es: 'mi', fr: 'mon', de: 'mein' }, minha: { en: 'my', es: 'mi', fr: 'ma', de: 'meine' },
  teu: { en: 'your', es: 'tu', fr: 'ton', de: 'dein' }, tua: { en: 'your', es: 'tu', fr: 'ta', de: 'deine' },
  seu: { en: 'your', es: 'su', fr: 'votre', de: 'Ihr' }, sua: { en: 'your', es: 'su', fr: 'votre', de: 'Ihre' },
  nosso: { en: 'our', es: 'nuestro', fr: 'notre', de: 'unser' }, nossa: { en: 'our', es: 'nuestra', fr: 'notre', de: 'unsere' },
  deles: { en: 'their', es: 'su', fr: 'leur', de: 'ihr' }, delas: { en: 'their', es: 'su', fr: 'leur', de: 'ihr' },
};

// ── Negação ────────────────────────────────────────────────
const NEGATION: Record<string, Record<string, string>> = {
  nenhum: { en: 'no', es: 'ningún', fr: 'aucun', de: 'kein' }, nenhuma: { en: 'no', es: 'ninguna', fr: 'aucune', de: 'keine' },
  nada: { en: 'nothing', es: 'nada', fr: 'rien', de: 'nichts' },
  nunca: { en: 'never', es: 'nunca', fr: 'jamais', de: 'nie' },
  nem: { en: 'neither', es: 'ni', fr: 'ni', de: 'weder' },
};

// ── RegExp pré-compilados (uma vez no init) ─────────────────
function buildRules(map: Record<string, Record<string, string>>, targets: Language[]) {
  const rules: { regex: RegExp; replacement: string; target: Language }[] = [];
  for (const [pt, translations] of Object.entries(map)) {
    for (const target of targets) {
      if (translations[target]) {
        rules.push({ regex: new RegExp(`\\b${pt}\\b`, 'gi'), replacement: translations[target], target });
      }
    }
  }
  return rules;
}

const ALL_TARGETS: Language[] = ['en', 'es', 'fr', 'de'];
const POSSESSIVE_RULES = buildRules(POSSESSIVES, ALL_TARGETS);
const NEGATION_RULES = buildRules(NEGATION, ALL_TARGETS);

// ── Regras de artigo (exportadas) ───────────────────────────
export const GRAMMAR_RULES: GrammarRule[] = ARTICLES.flatMap((a) =>
  ALL_TARGETS.map((target) => ({
    id: `article-${target}-${a.pt.source}`,
    source: 'pt' as Language,
    target,
    match: a.pt,
    replace: () => a[target as keyof typeof a],
    description: `PT article → ${target}`,
  }))
);

// ── Aplicação de regras ────────────────────────────────────
export function applyRules(text: string, source: Language, target: Language): string {
  if (source !== 'pt') return text;
  if (!ALL_TARGETS.includes(target)) return text;

  let r = text;
  for (const rule of POSSESSIVE_RULES) {
    if (rule.target === target) r = r.replace(rule.regex, rule.replacement);
  }
  for (const rule of NEGATION_RULES) {
    if (rule.target === target) r = r.replace(rule.regex, rule.replacement);
  }
  return r;
}

// ── Formatação de números ──────────────────────────────────
const NUMBER_FORMATS: Record<string, { decimal: string; thousands: string; currency: string }> = {
  pt: { decimal: ',', thousands: '.', currency: 'R$ ' },
  en: { decimal: '.', thousands: ',', currency: '$' },
  es: { decimal: ',', thousands: '.', currency: '$' },
  fr: { decimal: ',', thousands: ' ', currency: '€' },
  de: { decimal: ',', thousands: '.', currency: '€' },
};

export function formatNumber(value: number, target: Language, decimals = 0): string {
  const fmt = NUMBER_FORMATS[target];
  if (!fmt) return value.toFixed(decimals);
  const parts = value.toFixed(decimals).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, fmt.thousands);
  return parts[1] ? intPart + fmt.decimal + parts[1] : intPart;
}

export function formatCurrency(value: number, target: Language, decimals = 2): string {
  const fmt = NUMBER_FORMATS[target];
  if (!fmt) return value.toFixed(decimals);
  return fmt.currency + formatNumber(value, target, decimals);
}

// ── Mapa de gêneros (memoizado) ────────────────────────────
const GENDER_MAP: Record<string, Record<string, string>> = {
  masculino: { pt: 'masculino', en: 'male', es: 'masculino', fr: 'masculin', de: 'männlich' },
  feminino: { pt: 'feminino', en: 'female', es: 'femenino', fr: 'féminin', de: 'weiblich' },
  forte: { pt: 'forte', en: 'strong', es: 'fuerte', fr: 'fort', de: 'stark' },
  bom: { pt: 'bom', en: 'good', es: 'bueno', fr: 'bon', de: 'gut' },
  otimo: { pt: 'ótimo', en: 'great', es: 'genial', fr: 'génial', de: 'großartig' },
};

export function getGenderMap() { return GENDER_MAP; }
