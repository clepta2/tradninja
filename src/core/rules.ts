// src/core/rules.ts
// Regras gramaticais PT → EN/ES/FR/DE — artigos, possessivos, negação, gênero, número

import type { Language } from './types';

// ── Artigos PT→EN/ES/FR/DE ──────────────────────────────
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

// ── Adjetivos (gênero/número) ─────────────────────────────
const ADJECTIVES: Record<string, { m: Record<string, string>; f: Record<string, string>; mp: Record<string, string>; fp: Record<string, string> }> = {
  bom:   { m: { en:'good', es:'bueno', fr:'bon', de:'gut' }, f: { en:'good', es:'buena', fr:'bonne', de:'gut' }, mp: { en:'good', es:'buenos', fr:'bons', de:'gute' }, fp: { en:'good', es:'buenas', fr:'bonnes', de:'gute' } },
  mau:   { m: { en:'bad', es:'malo', fr:'mauvais', de:'schlecht' }, f: { en:'bad', es:'mala', fr:'mauvaise', de:'schlecht' }, mp: { en:'bad', es:'malos', fr:'mauvais', de:'schlechte' }, fp: { en:'bad', es:'malas', fr:'mauvaises', de:'schlechte' } },
  grande:{ m: { en:'big', es:'grande', fr:'grand', de:'groß' }, f: { en:'big', es:'grande', fr:'grande', de:'groß' }, mp: { en:'big', es:'grandes', fr:'grands', de:'große' }, fp: { en:'big', es:'grandes', fr:'grandes', de:'große' } },
  pequeno:{ m: { en:'small', es:'pequeño', fr:'petit', de:'klein' }, f: { en:'small', es:'pequeña', fr:'petite', de:'kleine' }, mp: { en:'small', es:'pequeños', fr:'petits', de:'kleine' }, fp: { en:'small', es:'pequeñas', fr:'petites', de:'kleine' } },
  forte: { m: { en:'strong', es:'fuerte', fr:'fort', de:'stark' }, f: { en:'strong', es:'fuerte', fr:'forte', de:'stark' }, mp: { en:'strong', es:'fuertes', fr:'forts', de:'starke' }, fp: { en:'strong', es:'fuertes', fr:'fortes', de:'starke' } },
  rápido:{ m: { en:'fast', es:'rápido', fr:'rapide', de:'schnell' }, f: { en:'fast', es:'rápida', fr:'rapide', de:'schnell' }, mp: { en:'fast', es:'rápidos', fr:'rapides', de:'schnelle' }, fp: { en:'fast', es:'rápidas', fr:'rapides', de:'schnelle' } },
  novo:  { m: { en:'new', es:'nuevo', fr:'nouveau', de:'neu' }, f: { en:'new', es:'nueva', fr:'nouvelle', de:'neue' }, mp: { en:'new', es:'nuevos', fr:'nouveaux', de:'neue' }, fp: { en:'new', es:'nuevas', fr:'nouvelles', de:'neue' } },
  bom:   { m: { en:'good', es:'bueno', fr:'bon', de:'gut' }, f: { en:'good', es:'buena', fr:'bonne', de:'gut' }, mp: { en:'good', es:'buenos', fr:'bons', de:'gute' }, fp: { en:'good', es:'buenas', fr:'bonnes', de:'gute' } },
};

// ── Preposições PT→target ──────────────────────────────────
const PREPOSITIONS: Record<string, Record<string, string>> = {
  de: { en: 'of', es: 'de', fr: 'de', de: 'von' },
  em: { en: 'in', es: 'en', fr: 'dans', de: 'in' },
  para: { en: 'for', es: 'para', fr: 'pour', de: 'für' },
  com: { en: 'with', es: 'con', fr: 'avec', de: 'mit' },
  sem: { en: 'without', es: 'sin', fr: 'sans', de: 'ohne' },
  por: { en: 'by', es: 'por', fr: 'par', de: 'von' },
  sobre: { en: 'about', es: 'sobre', fr: 'sur', de: 'über' },
  entre: { en: 'between', es: 'entre', fr: 'entre', de: 'zwischen' },
  até: { en: 'until', es: 'hasta', fr: "jusqu'à", de: 'bis' },
  desde: { en: 'from', es: 'desde', fr: 'depuis', de: 'von' },
  contra: { en: 'against', es: 'contra', fr: 'contre', de: 'gegen' },
  sob: { en: 'under', es: 'bajo', fr: 'sous', de: 'unter' },
  após: { en: 'after', es: 'después', fr: 'après', de: 'nach' },
  perante: { en: 'before', es: 'antes', fr: 'avant', de: 'vor' },
};

// ── Construção dos arrays de regras ────────────────────────
const ALL_TARGETS: Language[] = ['en', 'es', 'fr', 'de'];

function buildRegex(map: Record<string, Record<string, string>>): { regex: RegExp; replacement: string; target: Language }[] {
  const rules: { regex: RegExp; replacement: string; target: Language }[] = [];
  for (const [pt, trans] of Object.entries(map)) {
    for (const target of ALL_TARGETS) {
      if (trans[target]) rules.push({ regex: new RegExp(`\\b${pt}\\b`, 'gi'), replacement: trans[target], target });
    }
  }
  return rules;
}

const ARTICLE_RULES = ARTICLES.flatMap(a =>
  ALL_TARGETS.map(target => ({ regex: a.pt, replacement: a[target as keyof typeof a] as string, target }))
).filter(r => r.replacement);

const POSSESSIVE_RULES = buildRegex(POSSESSIVES);
const NEGATION_RULES = buildRegex(NEGATION);
const PREPOSITION_RULES = buildRegex(PREPOSITIONS);

// ── Regras exportadas ──────────────────────────────────────
export const GRAMMAR_RULES = [...ARTICLE_RULES, ...POSSESSIVE_RULES, ...NEGATION_RULES];

export function applyRules(text: string, source: Language, target: Language): string {
  if (source !== 'pt') return text;
  if (!ALL_TARGETS.includes(target)) return text;
  let r = text;
  for (const rule of ARTICLE_RULES) { if (rule.target === target) r = r.replace(rule.regex, rule.replacement); }
  for (const rule of POSSESSIVE_RULES) { if (rule.target === target) r = r.replace(rule.regex, rule.replacement); }
  for (const rule of NEGATION_RULES) { if (rule.target === target) r = r.replace(rule.regex, rule.replacement); }
  for (const rule of PREPOSITION_RULES) { if (rule.target === target) r = r.replace(rule.regex, rule.replacement); }
  return r;
}

export function formatNumber(value: number, target: Language, decimals = 0): string {
  const fmts: Record<string, { d: string; t: string }> = {
    pt: { d: ',', t: '.' }, en: { d: '.', t: ',' }, es: { d: ',', t: '.' },
    fr: { d: ',', t: ' ' }, de: { d: ',', t: '.' },
  };
  const fmt = fmts[target];
  if (!fmt) return value.toFixed(decimals);
  const parts = value.toFixed(decimals).split('.');
  return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, fmt.t) + (parts[1] ? fmt.d + parts[1] : '');
}

export function formatCurrency(value: number, target: Language, decimals = 2): string {
  const sym: Record<string, string> = { pt: 'R$ ', en: '$', es: '$', fr: '€', de: '€' };
  return (sym[target] || '') + formatNumber(value, target, decimals);
}

export function getAdjective(adjective: string, gender: 'm' | 'f', number: 's' | 'p', target: Language): string | null {
  const adj = ADJECTIVES[adjective];
  if (!adj) return null;
  const form = gender === 'm' ? (number === 'p' ? adj.mp : adj.m) : (number === 'p' ? adj.fp : adj.f);
  return form[target] || null;
}

export function getGenderMap() { return ADJECTIVES; }
