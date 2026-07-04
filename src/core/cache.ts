// src/core/cache.ts
// Cache LRU com TTL + batch eviction + stats

interface CacheEntry {
  value: string;
  expiresAt: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
}

let store = new Map<string, CacheEntry>();
let maxSize = 5000;
let ttlMs = 3600000;
let stats: CacheStats = { hits: 0, misses: 0, hitRate: 0 };

// ── Hash key (djb2) ────────────────────────────────────────
function hashKey(source: string, target: string, text: string): string {
  let h = 0;
  const raw = `${source}:${target}:${text}`;
  for (let i = 0; i < raw.length; i++) {
    h = ((h << 5) - h + raw.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

// ── Eviction LRU (batch de 50) ─────────────────────────────
const EVICT_BATCH = 50;

function evict(): void {
  if (store.size <= maxSize) return;

  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.expiresAt <= now) store.delete(key);
  }

  if (store.size > maxSize + EVICT_BATCH) {
    const entries = Array.from(store.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    for (let i = 0; i < EVICT_BATCH && i < entries.length; i++) {
      store.delete(entries[i][0]);
    }
  }
}

// ── Get com LRU tracking ───────────────────────────────────
export function get(source: string, target: string, text: string): string | null {
  const key = hashKey(source, target, text);
  const entry = store.get(key);
  if (!entry) { stats.misses++; updateHitRate(); return null; }
  if (entry.expiresAt <= Date.now()) { store.delete(key); stats.misses++; updateHitRate(); return null; }
  entry.lastAccessed = Date.now();
  stats.hits++;
  updateHitRate();
  return entry.value;
}

// ── Set com batch eviction ─────────────────────────────────
export function set(source: string, target: string, text: string, value: string): void {
  const key = hashKey(source, target, text);
  store.set(key, { value, expiresAt: Date.now() + ttlMs, lastAccessed: Date.now() });
  evict();
}

// ── Hit rate ───────────────────────────────────────────────
function updateHitRate(): void {
  const total = stats.hits + stats.misses;
  stats.hitRate = total > 0 ? stats.hits / total : 0;
}

export function clear(): void {
  store.clear();
  stats = { hits: 0, misses: 0, hitRate: 0 };
}

export function size(): number {
  return store.size;
}

export function configure(opts: { maxSize?: number; ttlMs?: number }): void {
  if (opts.maxSize !== undefined) maxSize = opts.maxSize;
  if (opts.ttlMs !== undefined) ttlMs = opts.ttlMs;
}

export function getStats(): CacheStats & { size: number } {
  return { ...stats, size: store.size };
}
