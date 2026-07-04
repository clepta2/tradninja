// src/core/cache.ts
// Cache LRU com TTL + batch eviction + stats — OTIMIZADO

interface CacheEntry {
  value: string;
  expiresAt: number;
  lastAccessed: number;
}

let store = new Map<string, CacheEntry>();
let maxSize = 5000;
let ttlMs = 3600000;
let hits = 0;
let misses = 0;
let now = 0; // Cache de timestamp — evita Date.now() por chamada

// Hash mais rápido: djb2 + concatenação sem template literal
function hashKey(source: string, target: string, text: string): string {
  let h = 5381;
  const len = source.length;
  for (let i = 0; i < len; i++) h = ((h << 5) + h + source.charCodeAt(i)) | 0;
  h = ((h << 5) + h + 58) | 0; // ':'
  const tLen = target.length;
  for (let i = 0; i < tLen; i++) h = ((h << 5) + h + target.charCodeAt(i)) | 0;
  h = ((h << 5) + h + 58) | 0;
  const txLen = text.length;
  for (let i = 0; i < txLen; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return h.toString(36);
}

// EvictionLazy: só roda quando store > maxSize
function evict(): void {
  if (store.size <= maxSize) return;
  now = Date.now();
  for (const [key, entry] of store) {
    if (entry.expiresAt <= now) store.delete(key);
  }
  if (store.size > maxSize + 50) {
    const entries = Array.from(store.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    const toDelete = Math.min(50, entries.length);
    for (let i = 0; i < toDelete; i++) store.delete(entries[i][0]);
  }
}

export function get(source: string, target: string, text: string): string | null {
  const key = hashKey(source, target, text);
  const entry = store.get(key);
  if (!entry) { misses++; return null; }
  now = Date.now();
  if (entry.expiresAt <= now) { store.delete(key); misses++; return null; }
  entry.lastAccessed = now;
  hits++;
  return entry.value;
}

export function set(source: string, target: string, text: string, value: string): void {
  const key = hashKey(source, target, text);
  now = Date.now();
  store.set(key, { value, expiresAt: now + ttlMs, lastAccessed: now });
  evict();
}

export function clear(): void {
  store.clear();
  hits = 0;
  misses = 0;
}

export function size(): number { return store.size; }

export function configure(opts: { maxSize?: number; ttlMs?: number }): void {
  if (opts.maxSize !== undefined) maxSize = opts.maxSize;
  if (opts.ttlMs !== undefined) ttlMs = opts.ttlMs;
}

export function getStats() {
  const total = hits + misses;
  return { hits, misses, hitRate: total > 0 ? hits / total : 0, size: store.size };
}
