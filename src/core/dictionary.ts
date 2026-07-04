// src/core/dictionary.ts
// Dicionário TradNinja — lazy loading, índices, batching, helpers

import ptData from '../i18n/pt.json';
import type { Language } from './types';

type LangMap = Record<string, string>;

const LOADED_LANGUAGES = new Map<string, LangMap>();
const DICTIONARY = new Map<string, Record<string, string>>();
const LOOKUP_BY_TEXT = new Map<string, Record<string, string>>();

async function loadLanguage(lang: string): Promise<LangMap> {
  if (LOADED_LANGUAGES.has(lang)) return LOADED_LANGUAGES.get(lang)!;
  let data: Record<string, unknown>;
  try { data = await import(`../i18n/${lang}.json`); } catch { return {}; }
  const flat = flattenJson(data as Record<string, unknown>);
  LOADED_LANGUAGES.set(lang, flat);
  return flat;
}

function flattenJson(obj: Record<string, unknown>, prefix = ''): LangMap {
  const result: LangMap = {};
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof val === 'object' && val !== null) Object.assign(result, flattenJson(val as Record<string, unknown>, path));
    else if (val !== null && val !== undefined) result[path] = String(val);
  }
  return result;
}

let built = false;

async function buildDictionary(target: Language): Promise<void> {
  if (built && DICTIONARY.size > 0) return;
  const ptFlat = flattenJson(ptData as Record<string, unknown>);
  const targetFlat = await loadLanguage(target);

  for (const [key, ptVal] of Object.entries(ptFlat)) {
    if (ptVal && typeof ptVal === 'string' && ptVal.trim()) {
      const entry: Record<string, string> = { pt: ptVal };
      entry[target] = targetFlat[key] || ptVal;
      DICTIONARY.set(key, entry);
      if (!DICTIONARY.has(ptVal)) DICTIONARY.set(ptVal, entry);
      LOOKUP_BY_TEXT.set(ptVal, entry);
    }
  }

  const extras: [string, string, string][] = [
    ['Salvar', 'Save', 'Guardar'], ['Excluir', 'Delete', 'Eliminar'],
    ['Editar', 'Edit', 'Editar'], ['Confirmar', 'Confirm', 'Confirmar'],
    ['Cancelar', 'Cancel', 'Cancelar'], ['Enviar', 'Send', 'Enviar'],
  ];
  for (const [pt, en, es] of extras) {
    if (!DICTIONARY.has(pt)) {
      const entry = { pt, en, es };
      DICTIONARY.set(pt, entry);
      LOOKUP_BY_TEXT.set(pt, entry);
    }
  }
  built = true;
}

export function lookupByText(text: string, target: Language): string | null {
  buildDictionary(target);
  const entry = LOOKUP_BY_TEXT.get(text);
  return entry ? entry[target] || null : null;
}

export function lookupByKey(key: string, target: Language): string | null {
  buildDictionary(target);
  const entry = DICTIONARY.get(key);
  return entry ? entry[target] || null : null;
}

export function hasTranslation(text: string, target: Language): boolean {
  buildDictionary(target);
  return LOOKUP_BY_TEXT.has(text);
}

export function getTranslations(text: string, target: Language): Record<string, string> | null {
  buildDictionary(target);
  const entry = LOOKUP_BY_TEXT.get(text);
  if (!entry) return null;
  return Object.fromEntries(Object.entries(entry).filter(([, v]) => v));
}

export async function crossTranslate(text: string, source: Language, target: Language, pivot: Language = 'en'): Promise<string> {
  if (source === target) return text;
  const direct = lookupByText(text, target);
  if (direct) return direct;
  if (pivot !== source && pivot !== target) {
    const viaPivot = lookupByText(text, pivot);
    if (viaPivot) { const final = lookupByText(viaPivot, target); if (final) return final; }
  }
  return text;
}

export function getAvailableLanguages(text: string): Language[] {
  const langs: Language[] = [];
  const allLangs: Language[] = ['pt', 'en', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh', 'ar', 'ru', 'hi'];
  for (const lang of allLangs) { const entry = LOOKUP_BY_TEXT.get(text); if (entry && entry[lang]) langs.push(lang); }
  return langs;
}

export function dictionarySize(): number { return DICTIONARY.size; }
export function loadedLanguages(): string[] { return Array.from(LOADED_LANGUAGES.keys()); }
export function clearLanguageCache(): void { LOADED_LANGUAGES.clear(); built = false; }
export function getDictionaryStats() {
  return { totalTerms: DICTIONARY.size, loadedLanguages: Array.from(LOADED_LANGUAGES.keys()), cachedTranslations: LOOKUP_BY_TEXT.size };
}

const TRANSLATION_BUFFER: Array<{ text: string; target: Language; resolve: (v: string) => void }> = [];
let bufferTimer: ReturnType<typeof setTimeout> | null = null;

export function translateBatch(texts: string[], target: Language): Promise<string[]> {
  return new Promise((resolve) => {
    buildDictionary(target);
    const results: string[] = new Array(texts.length);
    let pending = texts.length;
    texts.forEach((text, i) => {
      TRANSLATION_BUFFER.push({ text, target, resolve: (v) => { results[i] = v; pending--; if (pending === 0) resolve(results); } });
    });
    if (!bufferTimer) bufferTimer = setTimeout(processBuffer, 16);
  });
}

function processBuffer(): void {
  bufferTimer = null;
  const batch = [...TRANSLATION_BUFFER]; TRANSLATION_BUFFER.length = 0;
  for (const item of batch) { const entry = LOOKUP_BY_TEXT.get(item.text); item.resolve(entry ? entry[item.target] || item.text : item.text); }
}
