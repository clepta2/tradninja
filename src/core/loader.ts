// src/core/loader.ts
// Carregamento inteligente de dicionários — 3 camadas de cache

import type { Language } from './types';
import { AsyncStorageBackend, IndexedDBBackend, MemoryBackend, type CacheBackend } from './backends';

type LangMap = Record<string, string>;

// ── Detecção automática ─────────────────────────────────────
let _backend: CacheBackend | null = null;

function getBackend(): CacheBackend {
  if (_backend) return _backend;
  try { const AS = require('@react-native-async-storage/async-storage').default; _backend = new AsyncStorageBackend(AS); return _backend; } catch {}
  if (typeof indexedDB !== 'undefined') { try { _backend = new IndexedDBBackend(); return _backend; } catch {} }
  _backend = new MemoryBackend();
  return _backend;
}

export function setCacheBackend(backend: CacheBackend): void { _backend = backend; }

// ── Cache layers ────────────────────────────────────────────
const MEMORY = new Map<string, LangMap>();
const LOADING = new Map<string, Promise<LangMap>>();
const PREFIX = 'tn_dict_v3_';

export async function loadLanguageCached(lang: string): Promise<LangMap> {
  if (MEMORY.has(lang)) return MEMORY.get(lang)!;
  if (LOADING.has(lang)) return LOADING.get(lang)!;
  const p = _loadInner(lang);
  LOADING.set(lang, p);
  try { return await p; } finally { LOADING.delete(lang); }
}

async function _loadInner(lang: string): Promise<LangMap> {
  const backend = getBackend();
  const key = `${PREFIX}${lang}`;

  try {
    const cached = await backend.getItem(key);
    if (cached) { const flat = JSON.parse(cached) as LangMap; MEMORY.set(lang, flat); return flat; }
  } catch {}

  let flat: LangMap;
  try { const mod = await import(`../i18n/${lang}.json`); flat = (mod.default || mod) as unknown as LangMap; } catch { flat = {}; }

  MEMORY.set(lang, flat);
  try { await backend.setItem(key, JSON.stringify(flat)); } catch {}
  return flat;
}

export function preloadLanguage(lang: string): void {
  if (MEMORY.has(lang)) return;
  const schedule = typeof requestIdleCallback !== 'undefined' ? requestIdleCallback : (cb: () => void) => setTimeout(cb, 0);
  schedule(() => { loadLanguageCached(lang).catch(() => {}); });
}

export function preloadLanguages(langs: Language[]): void {
  const batch = langs.slice(0, 3);
  const rest = langs.slice(3);
  batch.forEach(lang => preloadLanguage(lang));
  if (rest.length > 0) {
    const schedule = typeof requestIdleCallback !== 'undefined' ? requestIdleCallback : (cb: () => void) => setTimeout(cb, 100);
    schedule(() => preloadLanguages(rest));
  }
}

export async function clearAllCache(): Promise<void> {
  MEMORY.clear();
  LOADING.clear();
  try { await getBackend().clear?.(); } catch {}
}

export function getCacheStats() {
  return { memoryCached: MEMORY.size, loading: LOADING.size, backend: _backend?.constructor.name || 'unknown' };
}
