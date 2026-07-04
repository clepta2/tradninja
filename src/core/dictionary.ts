// src/core/dictionary.ts
// Dicionário ultra-otimizado — lazy loading por idioma + índices

import ptData from '../i18n/pt.json';
import type { Language } from './types';

type LangMap = Record<string, string>;

// ── Cache de idiomas carregados ─────────────────────────────
const LOADED_LANGUAGES = new Map<string, LangMap>();
const DICTIONARY = new Map<string, { pt: string; en?: string; es?: string }>();
const LOOKUP_BY_TEXT = new Map<string, { pt: string; en?: string; es?: string }>();

// ── Lazy load de idioma ─────────────────────────────────────
async function loadLanguage(lang: string): Promise<LangMap> {
  if (LOADED_LANGUAGES.has(lang)) return LOADED_LANGUAGES.get(lang)!;

  let data: Record<string, unknown>;
  try {
    data = await import(`../i18n/${lang}.json`);
  } catch {
    return {};
  }

  const flat = flattenJson(data as Record<string, unknown>);
  LOADED_LANGUAGES.set(lang, flat);
  return flat;
}

// ── Flatten JSON ────────────────────────────────────────────
function flattenJson(obj: Record<string, unknown>, prefix = ''): LangMap {
  const result: LangMap = {};
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof val === 'object' && val !== null) {
      Object.assign(result, flattenJson(val as Record<string, unknown>, path));
    } else if (val !== null && val !== undefined) {
      result[path] = String(val);
    }
  }
  return result;
}

// ── Build dictionary (lazy init) ───────────────────────────
let built = false;

async function buildDictionary(target: Language): Promise<void> {
  if (built && DICTIONARY.size > 0) return;

  const ptFlat = flattenJson(ptData as Record<string, unknown>);
  const targetFlat = await loadLanguage(target);

  for (const [key, ptVal] of Object.entries(ptFlat)) {
    if (ptVal && typeof ptVal === 'string' && ptVal.trim()) {
      const entry = { pt: ptVal, en: targetFlat[key], es: targetFlat[key] };
      DICTIONARY.set(key, entry);
      if (!DICTIONARY.has(ptVal)) DICTIONARY.set(ptVal, entry);
      LOOKUP_BY_TEXT.set(ptVal, entry);
    }
  }

  // Extras
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

// ── Lookup por texto (O(1)) ────────────────────────────────
export function lookupByText(text: string, target: Language): string | null {
  buildDictionary(target);
  const entry = LOOKUP_BY_TEXT.get(text);
  return entry ? entry[target] || null : null;
}

// ── Lookup por chave ────────────────────────────────────────
export function lookupByKey(key: string, target: Language): string | null {
  buildDictionary(target);
  const entry = DICTIONARY.get(key);
  return entry ? entry[target] || null : null;
}

// ── Batch translate ─────────────────────────────────────────
const TRANSLATION_BUFFER: Array<{
  text: string;
  target: Language;
  resolve: (value: string) => void;
}> = [];
let bufferTimer: ReturnType<typeof setTimeout> | null = null;

export function translateBatch(texts: string[], target: Language): Promise<string[]> {
  return new Promise((resolve) => {
    buildDictionary(target);
    const results: string[] = new Array(texts.length);
    let pending = texts.length;

    texts.forEach((text, i) => {
      TRANSLATION_BUFFER.push({
        text,
        target,
        resolve: (value) => {
          results[i] = value;
          pending--;
          if (pending === 0) resolve(results);
        },
      });
    });

    if (!bufferTimer) bufferTimer = setTimeout(processBuffer, 16);
  });
}

function processBuffer(): void {
  bufferTimer = null;
  const batch = [...TRANSLATION_BUFFER];
  TRANSLATION_BUFFER.length = 0;

  for (const item of batch) {
    const entry = LOOKUP_BY_TEXT.get(item.text);
    item.resolve(entry ? entry[item.target] || item.text : item.text);
  }
}

export function dictionarySize(): number {
  return DICTIONARY.size;
}
