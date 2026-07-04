// src/core/loader.ts
// Carregamento inteligente de dicionários com cache persistente
// Suporta: AsyncStorage (RN), IndexedDB (Web), Memory (Node)

import type { Language } from './types';

type LangMap = Record<string, string>;

// ── Backend abstrato ───────────────────────────────────────
interface CacheBackend {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// AsyncStorage adapter (React Native)
class AsyncStorageAdapter implements CacheBackend {
  private storage: any;
  constructor(storage: any) { this.storage = storage; }
  async getItem(key: string) { try { return await this.storage.getItem(key); } catch { return null; } }
  async setItem(key: string, value: string) { try { await this.storage.setItem(key, value); } catch {} }
  async removeItem(key: string) { try { await this.storage.removeItem(key); } catch {} }
}

// IndexedDB adapter (Web)
class IndexedDBAdapter implements CacheBackend {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase>;
  constructor() {
    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') { reject(new Error('No IndexedDB')); return; }
      const req = indexedDB.open('tradninja-dict', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('dicts');
      req.onsuccess = () => { this.db = req.result; resolve(req.result); };
      req.onerror = () => reject(req.error);
    });
  }
  async getItem(key: string) {
    try {
      const db = await this.dbPromise;
      return await new Promise<string | null>((resolve) => {
        const tx = db.transaction('dicts', 'readonly');
        const req = tx.objectStore('dicts').get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch { return null; }
  }
  async setItem(key: string, value: string) {
    try {
      const db = await this.dbPromise;
      await new Promise<void>((resolve) => {
        const tx = db.transaction('dicts', 'readwrite');
        tx.objectStore('dicts').put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {}
  }
  async removeItem(key: string) { try {
    const db = await this.dbPromise;
    await new Promise<void>((resolve) => {
      const tx = db.transaction('dicts', 'readwrite');
      tx.objectStore('dicts').delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {} }
}

// Memory adapter (fallback)
class MemoryAdapter implements CacheBackend {
  private store = new Map<string, string>();
  async getItem(key: string) { return this.store.get(key) || null; }
  async setItem(key: string, value: string) { this.store.set(key, value); }
  async removeItem(key: string) { this.store.delete(key); }
}

// ── Detecção automática de backend ──────────────────────────
let _backend: CacheBackend | null = null;

function getBackend(): CacheBackend {
  if (_backend) return _backend;

  // 1. Tenta AsyncStorage (React Native)
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    _backend = new AsyncStorageAdapter(AsyncStorage);
    return _backend;
  } catch {}

  // 2. Tenta IndexedDB (Web)
  if (typeof indexedDB !== 'undefined') {
    try {
      _backend = new IndexedDBAdapter();
      return _backend;
    } catch {}
  }

  // 3. Fallback: memória (Node.js / SSR)
  _backend = new MemoryAdapter();
  return _backend;
}

export function setCacheBackend(backend: CacheBackend): void {
  _backend = backend;
}

// ── Carregamento com cache ──────────────────────────────────
const MEMORY_CACHE = new Map<string, LangMap>();
const LOADING_PROMISES = new Map<string, Promise<LangMap>>();
const CACHE_PREFIX = 'tn_dict_v2_';

/**
 * Carrega dicionário com cache em 3 camadas:
 * 1. Memory (instantâneo)
 * 2. AsyncStorage/IndexedDB (persistente, ~5ms)
 * 3. JSON import (lento, ~20-50ms)
 *
 * Após carregar, salva nas camadas inferiores para próximos loads.
 */
export async function loadLanguageCached(lang: string): Promise<LangMap> {
  // 1. Memory cache — instantâneo
  if (MEMORY_CACHE.has(lang)) return MEMORY_CACHE.get(lang)!;

  // 2. Evita double-load
  if (LOADING_PROMISES.has(lang)) return LOADING_PROMISES.get(lang)!;

  const promise = _loadLanguageInner(lang);
  LOADING_PROMISES.set(lang, promise);
  try {
    const result = await promise;
    return result;
  } finally {
    LOADING_PROMISES.delete(lang);
  }
}

async function _loadLanguageInner(lang: string): Promise<LangMap> {
  const backend = getBackend();
  const cacheKey = `${CACHE_PREFIX}${lang}`;

  // 2. Storage cache (AsyncStorage/IndexedDB)
  try {
    const cached = await backend.getItem(cacheKey);
    if (cached) {
      const flat = JSON.parse(cached) as LangMap;
      MEMORY_CACHE.set(lang, flat);
      return flat;
    }
  } catch {}

  // 3. Import do JSON (único caminho para fonte)
  let flat: LangMap;
  try {
    const mod = await import(`../i18n/${lang}.json`);
    flat = (mod.default || mod) as unknown as LangMap;
  } catch {
    flat = {};
  }

  // Salva nas camadas inferiores
  MEMORY_CACHE.set(lang, flat);
  try {
    await backend.setItem(cacheKey, JSON.stringify(flat));
  } catch {}

  return flat;
}

/**
 * Pré-carrega idioma em background (não bloqueia).
 * Usa requestIdleCallback quando disponível, fallback para setTimeout.
 */
export function preloadLanguage(lang: string): void {
  if (MEMORY_CACHE.has(lang)) return;
  const schedule = typeof requestIdleCallback !== 'undefined'
    ? requestIdleCallback
    : (cb: () => void) => setTimeout(cb, 0);
  schedule(() => { loadLanguageCached(lang).catch(() => {}); });
}

/**
 * Pré-carrega múltiplos idiomas em paralelo.
 */
export function preloadLanguages(langs: Language[]): void {
  // Carrega em batches de 3 para não sobrecarregar
  const batch = langs.slice(0, 3);
  const rest = langs.slice(3);

  batch.forEach(lang => preloadLanguage(lang));

  if (rest.length > 0) {
    const schedule = typeof requestIdleCallback !== 'undefined'
      ? requestIdleCallback
      : (cb: () => void) => setTimeout(cb, 100);
    schedule(() => preloadLanguages(rest));
  }
}

/**
 * Limpa todo o cache (memória + storage).
 */
export async function clearAllCache(): Promise<void> {
  MEMORY_CACHE.clear();
  LOADING_PROMISES.clear();
  const backend = getBackend();
  // Limpa apenas chaves do tradninja
  try {
    if (backend instanceof AsyncStorageAdapter) {
      const keys = await backend.storage.getAllKeys();
      const tnKeys = keys.filter((k: string) => k.startsWith(CACHE_PREFIX));
      if (tnKeys.length > 0) await backend.storage.multiRemove(tnKeys);
    }
  } catch {}
}

/**
 * Retorna estatísticas do cache.
 */
export function getCacheStats() {
  return {
    memoryCached: MEMORY_CACHE.size,
    loading: LOADING_PROMISES.size,
    backend: _backend?.constructor.name || 'unknown',
  };
}
