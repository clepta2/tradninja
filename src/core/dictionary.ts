// src/core/dictionary.ts
// Dicionário TradNinja — qualquer idioma → qualquer idioma
// Reverse index: cada texto em qualquer idioma mapeia de volta à entry

import ptData from '../i18n/pt.json';
import type { Language } from './types';
import { loadLanguageCached, preloadLanguage, preloadLanguages } from './loader';

type LangMap = Record<string, string>;
type Entry = Record<string, string>;

const LOADED_LANGUAGES = new Map<string, LangMap>();
const DICTIONARY = new Map<string, Entry>();          // key → entry (PT text)
const REVERSE = new Map<string, Entry>();              // any text → entry (reverse index)
const ALL_LANGUAGES: Language[] = [
  'pt', 'en', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh', 'ar', 'ru', 'hi',
  'nl', 'pl', 'sv', 'da', 'no', 'fi', 'cs', 'el', 'hu', 'ro', 'uk', 'id',
  'ms', 'th', 'tr', 'he', 'bn', 'sw',
];

const PT_FLAT = ptData as unknown as LangMap;
const PT_KEYS = Object.keys(PT_FLAT);
const PIVOT_LANGUAGES: Language[] = ['en', 'es', 'fr', 'de', 'it'];

async function loadLanguage(lang: string): Promise<LangMap> {
  if (LOADED_LANGUAGES.has(lang)) return LOADED_LANGUAGES.get(lang)!;
  const flat = await loadLanguageCached(lang);
  LOADED_LANGUAGES.set(lang, flat);
  return flat;
}

/** Indexa todos os textos de uma entry no reverse index */
function indexEntry(entry: Entry): void {
  for (const val of Object.values(entry)) {
    if (val && val.trim()) REVERSE.set(val, entry);
  }
}

/**
 * Inicializa dicionário PT + target + reverse index.
 * Após init, QUALQUER texto em QUALQUER idioma pode ser traduzido.
 */
export async function initDictionary(target: Language): Promise<void> {
  if (DICTIONARY.size > 0 && REVERSE.size > 0 && LOADED_LANGUAGES.has(target)) return;

  const targetFlat = await loadLanguage(target);

  DICTIONARY.clear();
  REVERSE.clear();

  for (let i = 0; i < PT_KEYS.length; i++) {
    const key = PT_KEYS[i];
    const ptVal = PT_FLAT[key];
    if (!ptVal || !ptVal.trim()) continue;

    const entry: Entry = { pt: ptVal };
    if (targetFlat[key]) entry[target] = targetFlat[key];
    DICTIONARY.set(ptVal, entry);
    indexEntry(entry);
  }

  preloadLanguages(PIVOT_LANGUAGES.filter(p => p !== target));
}

/** Lazy init — PT imediatamente, target em background */
let buildScheduled = false;

function ensureBuilt(target: Language): void {
  if (DICTIONARY.size > 0 && LOADED_LANGUAGES.has(target)) return;

  if (DICTIONARY.size === 0) {
    for (let i = 0; i < PT_KEYS.length; i++) {
      const ptVal = PT_FLAT[PT_KEYS[i]];
      if (!ptVal || !ptVal.trim()) continue;
      const entry: Entry = { pt: ptVal };
      DICTIONARY.set(ptVal, entry);
      indexEntry(entry);
    }
  }

  if (!LOADED_LANGUAGES.has(target) && !buildScheduled) {
    buildScheduled = true;
    loadLanguage(target).then((targetFlat) => {
      buildScheduled = false;
      for (const [, entry] of DICTIONARY) {
        if (!entry[target] && targetFlat[entry.pt]) {
          entry[target] = targetFlat[entry.pt];
        }
      }
      // Re-indexa entries que ganharam tradução nova
      for (const entry of DICTIONARY.values()) {
        if (entry[target]) indexEntry(entry);
      }
    }).catch(() => { buildScheduled = false; });
  }
}

// ── Lookups: qualquer idioma → qualquer idioma ──────────────

export function lookupByText(text: string, target: Language): string | null {
  ensureBuilt(target);
  return REVERSE.get(text)?.[target] || null;
}

export function lookupByKey(key: string, target: Language): string | null {
  ensureBuilt(target);
  return DICTIONARY.get(key)?.[target] || null;
}

export function hasTranslation(text: string, target: Language): boolean {
  ensureBuilt(target);
  return !!(REVERSE.get(text)?.[target]);
}

export function getTranslations(text: string): Record<string, string> | null {
  const entry = REVERSE.get(text);
  if (!entry) return null;
  return Object.fromEntries(Object.entries(entry).filter(([, v]) => v));
}

export function getAvailableLanguages(text: string): Language[] {
  const entry = REVERSE.get(text);
  if (!entry) return [];
  const result: Language[] = [];
  for (const lang of ALL_LANGUAGES) {
    if (entry[lang]) result.push(lang);
  }
  return result;
}

/**
 * Cross-translate QUALQUER idioma → QUALQUER idioma.
 * Se source="ja" e target="de", busca texto JA no reverse index,
 * pega a entry completa, e retorna o campo DE.
 */
export async function crossTranslate(
  text: string, source: Language, target: Language, pivot: Language = 'en'
): Promise<string> {
  if (source === target) return text;

  // 1. Busca direta no reverse index (funciona entre quaisquer idiomas)
  const direct = REVERSE.get(text)?.[target];
  if (direct) return direct;

  // 2. Via pivô principal
  if (pivot !== source && pivot !== target) {
    const viaPivot = REVERSE.get(text)?.[pivot];
    if (viaPivot) {
      const final = REVERSE.get(viaPivot)?.[target];
      if (final) return final;
    }
  }

  // 3. Via outros pivôs
  for (const altPivot of PIVOT_LANGUAGES) {
    if (altPivot === source || altPivot === target || altPivot === pivot) continue;
    const viaAlt = REVERSE.get(text)?.[altPivot];
    if (viaAlt) {
      const final = REVERSE.get(viaAlt)?.[target];
      if (final) return final;
    }
  }

  return text;
}

export function dictionarySize(): number { return DICTIONARY.size; }
export function loadedLanguages(): string[] { return Array.from(LOADED_LANGUAGES.keys()); }

export function clearLanguageCache(): void {
  LOADED_LANGUAGES.clear();
  DICTIONARY.clear();
  REVERSE.clear();
}

export function getDictionaryStats() {
  return {
    totalTerms: DICTIONARY.size,
    reverseIndexSize: REVERSE.size,
    loadedLanguages: Array.from(LOADED_LANGUAGES.keys()),
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
      const hit = REVERSE.get(text)?.[target];
      if (hit) { results[i] = hit; pending--; }
      else { TRANSLATION_BUFFER.push({ text, target, resolve: (v) => { results[i] = v; pending--; if (pending === 0) resolve(results); } }); }
    });
    if (pending === 0) { resolve(results); return; }
    if (!bufferTimer) bufferTimer = setTimeout(processBuffer, 16);
  });
}

function processBuffer(): void {
  bufferTimer = null;
  const batch = [...TRANSLATION_BUFFER]; TRANSLATION_BUFFER.length = 0;
  for (const item of batch) { item.resolve(REVERSE.get(item.text)?.[item.target] || item.text); }
}

export { ALL_LANGUAGES };
