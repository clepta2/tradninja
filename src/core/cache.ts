interface CacheEntry {
  value: string;
  expiresAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
}

let store = new Map<string, CacheEntry>();
let maxSize = 5000;
let ttlMs = 3600000;
let stats: CacheStats = { hits: 0, misses: 0 };

function hashKey(source: string, target: string, text: string): string {
  let h = 0;
  const raw = `${source}:${target}:${text}`;
  for (let i = 0; i < raw.length; i++) {
    h = ((h << 5) - h + raw.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

function evict(): void {
  if (store.size <= maxSize) return;
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.expiresAt <= now) {
      store.delete(key);
    }
  }
  if (store.size > maxSize) {
    const first = store.keys().next().value;
    if (first !== undefined) store.delete(first);
  }
}

export function get(
  source: string,
  target: string,
  text: string
): string | null {
  const key = hashKey(source, target, text);
  const entry = store.get(key);
  if (!entry) {
    stats.misses++;
    return null;
  }
  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    stats.misses++;
    return null;
  }
  stats.hits++;
  return entry.value;
}

export function set(
  source: string,
  target: string,
  text: string,
  value: string
): void {
  const key = hashKey(source, target, text);
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  evict();
}

export function clear(): void {
  store.clear();
  stats = { hits: 0, misses: 0 };
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
