// src/core/dictionary.ts
// Dicionário TradNinja — lazy loading, batch, cross-translate
// OTIMIZADO: JSONs flat, batch Map, 3-layer cache (memory→storage→import)

import ptData from '../i18n/pt.json';
import type { Language } from './types';
import { loadLanguageCached, preloadLanguage, preloadLanguages } from './loader';

type LangMap = Record<string, string>;

const LOADED_LANGUAGES = new Map<string, LangMap>();
const DICTIONARY = new Map<string, Record<string, string>>();
const LOOKUP_BY_TEXT = new Map<string, Record<string, string>>();
const ALL_LANGUAGES: Language[] = [
  'pt', 'en', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh', 'ar', 'ru', 'hi',
  'nl', 'pl', 'sv', 'da', 'no', 'fi', 'cs', 'el', 'hu', 'ro', 'uk', 'id',
  'ms', 'th', 'tr', 'he', 'bn', 'sw',
];

// JSONs já são flat key→value
const PT_FLAT = ptData as unknown as LangMap;
const PT_KEYS = Object.keys(PT_FLAT);
const PIVOT_LANGUAGES: Language[] = ['en', 'pt', 'es', 'fr', 'de'];

async function loadLanguage(lang: string): Promise<LangMap> {
  if (LOADED_LANGUAGES.has(lang)) return LOADED_LANGUAGES.get(lang)!;
  const flat = await loadLanguageCached(lang);
  LOADED_LANGUAGES.set(lang, flat);
  return flat;
}

/**
 * Inicializa o dicionário PT + target em batch.
 * Pré-carrega pivot languages em background para cross-translate rápido.
 */
export async function initDictionary(target: Language): Promise<void> {
  if (DICTIONARY.size > 0 && LOADED_LANGUAGES.has(target)) return;

  const targetFlat = await loadLanguage(target);

  // Batch construction
  const entries: [string, Record<string, string>][] = new Array(PT_KEYS.length);
  let count = 0;

  for (const key of PT_KEYS) {
    const ptVal = PT_FLAT[key];
    if (ptVal && ptVal.trim()) {
      const entry: Record<string, string> = { pt: ptVal };
      if (targetFlat[key]) entry[target] = targetFlat[key];
      entries[count++] = [ptVal, entry];
    }
  }

  entries.length = count;

  DICTIONARY.clear();
  LOOKUP_BY_TEXT.clear();
  for (let i = 0; i < count; i++) {
    const [ptVal, entry] = entries[i];
    DICTIONARY.set(ptVal, entry);
    LOOKUP_BY_TEXT.set(ptVal, entry);
  }

  // Pré-carrega pivot languages em background para cross-translate
  const pivots = PIVOT_LANGUAGES.filter(p => p !== target);
  preloadLanguages(pivots);
}

/** Lazy init síncrono — carrega PT instantaneamente, target em background */
let buildScheduled = false;

function ensureBuilt(target: Language): void {
  if (DICTIONARY.size > 0 && LOADED_LANGUAGES.has(target)) return;

  // Primeira chamada: constrói do PT imediatamente
  if (DICTIONARY.size === 0) {
    for (const key of PT_KEYS) {
      const ptVal = PT_FLAT[key];
      if (ptVal && ptVal.trim()) {
        const entry: Record<string, string> = { pt: ptVal };
        DICTIONARY.set(ptVal, entry);
        LOOKUP_BY_TEXT.set(ptVal, entry);
      }
    }
  }

  // Target async em background — não bloqueia
  if (!LOADED_LANGUAGES.has(target) && !buildScheduled) {
    buildScheduled = true;
    loadLanguage(target).then((targetFlat) => {
      buildScheduled = false;
      for (const [, entry] of DICTIONARY) {
        if (!entry[target] && targetFlat[entry.pt]) {
          entry[target] = targetFlat[entry.pt];
        }
      }
    }).catch(() => { buildScheduled = false; });
  }
}

export function lookupByText(text: string, target: Language): string | null {
  ensureBuilt(target);
  return LOOKUP_BY_TEXT.get(text)?.[target] || null;
}

export function lookupByKey(key: string, target: Language): string | null {
  ensureBuilt(target);
  return DICTIONARY.get(key)?.[target] || null;
}

export function hasTranslation(text: string, target: Language): boolean {
  ensureBuilt(target);
  const entry = LOOKUP_BY_TEXT.get(text);
  return !!(entry && entry[target]);
}

export function getTranslations(text: string): Record<string, string> | null {
  const entry = LOOKUP_BY_TEXT.get(text);
  if (!entry) return null;
  return Object.fromEntries(Object.entries(entry).filter(([, v]) => v));
}

export function getAvailableLanguages(text: string): Language[] {
  const entry = LOOKUP_BY_TEXT.get(text);
  if (!entry) return [];
  return ALL_LANGUAGES.filter(lang => entry[lang]);
}

export async function crossTranslate(
  text: string, source: Language, target: Language, pivot: Language = 'en'
): Promise<string> {
  if (source === target) return text;

  const direct = lookupByText(text, target);
  if (direct) return direct;

  // Tenta pivô principal
  if (pivot !== source && pivot !== target) {
    const viaPivot = lookupByText(text, pivot);
    if (viaPivot) {
      const final = lookupByText(viaPivot, target);
      if (final) return final;
    }
  }

  // Tenta outros pivôs
  for (const altPivot of ALL_LANGUAGES) {
    if (altPivot === source || altPivot === target || altPivot === pivot) continue;
    const viaAlt = lookupByText(text, altPivot);
    if (viaAlt) {
      const final = lookupByText(viaAlt, target);
      if (final) return final;
    }
  }

  return text;
}

export function dictionarySize(): number { return DICTIONARY.size; }
export function loadedLanguages(): string[] { return Array.from(LOADED_LANGUAGES.keys()); }
export function clearLanguageCache(): void { LOADED_LANGUAGES.clear(); DICTIONARY.clear(); LOOKUP_BY_TEXT.clear(); }
export function getDictionaryStats() {
  return {
    totalTerms: DICTIONARY.size,
    loadedLanguages: Array.from(LOADED_LANGUAGES.keys()),
    cachedTranslations: LOOKUP_BY_TEXT.size,
    supportedLanguages: ALL_LANGUAGES,
  };
}

// ── Batch translate ─────────────────────────────────────────
const TRANSLATION_BUFFER: Array<{ text: string; target: Language; resolve: (v: string) => void }> = [];
let bufferTimer: ReturnType<typeof setTimeout> | null = null;

export function translateBatch(texts: string[], target: Language): Promise<string[]> {
  ensureBuilt(target);
  return new Promise((resolve) => {
    const results: string[] = new Array(texts.length);
    let pending = texts.length;
    texts.forEach((text, i) => {
      const entry = LOOKUP_BY_TEXT.get(text);
      if (entry?.[target]) { results[i] = entry[target]; pending--; }
      else { TRANSLATION_BUFFER.push({ text, target, resolve: (v) => { results[i] = v; pending--; if (pending === 0) resolve(results); } }); }
    });
    if (pending === 0) { resolve(results); return; }
    if (!bufferTimer) bufferTimer = setTimeout(processBuffer, 16);
  });
}

function processBuffer(): void {
  bufferTimer = null;
  const batch = [...TRANSLATION_BUFFER]; TRANSLATION_BUFFER.length = 0;
  for (const item of batch) { const entry = LOOKUP_BY_TEXT.get(item.text); item.resolve(entry?.[item.target] || item.text); }
}

export { ALL_LANGUAGES };
