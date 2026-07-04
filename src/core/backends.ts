// src/core/backends.ts
// Backends de cache para loader — AsyncStorage, IndexedDB, Memory

interface CacheBackend {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear?(): Promise<void>;
}

class AsyncStorageBackend implements CacheBackend {
  private storage: any;
  constructor(storage: any) { this.storage = storage; }
  async getItem(key: string) { try { return await this.storage.getItem(key); } catch { return null; } }
  async setItem(key: string, value: string) { try { await this.storage.setItem(key, value); } catch {} }
  async removeItem(key: string) { try { await this.storage.removeItem(key); } catch {} }
  async clear() {
    try {
      const keys = await this.storage.getAllKeys();
      const tnKeys = keys.filter((k: string) => k.startsWith('tn_dict_'));
      if (tnKeys.length > 0) await this.storage.multiRemove(tnKeys);
    } catch {}
  }
}

class IndexedDBBackend implements CacheBackend {
  private dbPromise: Promise<IDBDatabase>;
  constructor() {
    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') { reject(new Error('No IndexedDB')); return; }
      const req = indexedDB.open('tradninja-dict', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('dicts');
      req.onsuccess = () => resolve(req.result);
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
  async removeItem(key: string) {
    try {
      const db = await this.dbPromise;
      await new Promise<void>((resolve) => {
        const tx = db.transaction('dicts', 'readwrite');
        tx.objectStore('dicts').delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {}
  }
  async clear() {
    try {
      const db = await this.dbPromise;
      await new Promise<void>((resolve) => {
        const tx = db.transaction('dicts', 'readwrite');
        tx.objectStore('dicts').clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {}
  }
}

class MemoryBackend implements CacheBackend {
  private store = new Map<string, string>();
  async getItem(key: string) { return this.store.get(key) || null; }
  async setItem(key: string, value: string) { this.store.set(key, value); }
  async removeItem(key: string) { this.store.delete(key); }
}

export type { CacheBackend };
export { AsyncStorageBackend, IndexedDBBackend, MemoryBackend };
