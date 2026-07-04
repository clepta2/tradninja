// src/core/cache.ts
// Cache LRU com TTL — OTIMIZADO: Map aninhado + evict por intervalo

interface CacheEntry {
  value: string;
  expiresAt: number;
  lastAccessed: number;
}

// source → target → text → entry (3 níveis, O(1) sem hash string)
const store = new Map<string, Map<string, Map<string, CacheEntry>>>();
let maxSize = 5000;
let ttlMs = 3600000;
let hits = 0;
let misses = 0;
let opsSinceEvict = 0;

function evict(): void {
  const now = Date.now();

  // Passo 1: remove entries expiradas
  for (const [sKey, targets] of store) {
    for (const [tKey, texts] of targets) {
      for (const [xKey, entry] of texts) {
        if (entry.expiresAt <= now) texts.delete(xKey);
      }
      if (texts.size === 0) targets.delete(tKey);
    }
    if (targets.size === 0) store.delete(sKey);
  }

  // Passo 2: se ainda exceder, remove 20% das mais antigas
  let total = 0;
  for (const targets of store.values()) for (const texts of targets.values()) total += texts.size;
  if (total <= maxSize) return;

  const entries: { entry: CacheEntry; sKey: string; tKey: string; xKey: string }[] = [];
  for (const [sKey, targets] of store) {
    for (const [tKey, texts] of targets) {
      for (const [xKey, entry] of texts) entries.push({ entry, sKey, tKey, xKey });
    }
  }
  entries.sort((a, b) => a.entry.lastAccessed - b.entry.lastAccessed);
  const removeCount = Math.ceil(total * 0.2);
  for (let i = 0; i < removeCount && i < entries.length; i++) {
    const { sKey, tKey, xKey } = entries[i];
    store.get(sKey)?.get(tKey)?.delete(xKey);
  }
}

export function get(source: string, target: string, text: string): string | null {
  const entry = store.get(source)?.get(target)?.get(text);
  if (!entry) { misses++; return null; }
  const now = Date.now();
  if (entry.expiresAt <= now) {
    store.get(source)?.get(target)?.delete(text);
    misses++;
    return null;
  }
  entry.lastAccessed = now;
  hits++;
  return entry.value;
}

export function set(source: string, target: string, text: string, value: string): void {
  let targetMap = store.get(source);
  if (!targetMap) { targetMap = new Map(); store.set(source, targetMap); }
  let textMap = targetMap.get(target);
  if (!textMap) { textMap = new Map(); targetMap.set(target, textMap); }
  const now = Date.now();
  textMap.set(text, { value, expiresAt: now + ttlMs, lastAccessed: now });
  if (++opsSinceEvict % 100 === 0) evict();
}

export function clear(): void {
  store.clear();
  hits = 0;
  misses = 0;
  opsSinceEvict = 0;
}

export function size(): number {
  let total = 0;
  for (const targets of store.values()) for (const texts of targets.values()) total += texts.size;
  return total;
}

export function configure(opts: { maxSize?: number; ttlMs?: number }): void {
  if (opts.maxSize !== undefined) maxSize = opts.maxSize;
  if (opts.ttlMs !== undefined) ttlMs = opts.ttlMs;
}

export function getStats() {
  const total = hits + misses;
  return { hits, misses, hitRate: total > 0 ? hits / total : 0, size: size() };
}
