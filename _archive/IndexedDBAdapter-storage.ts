/**
 * IndexedDBAdapter.ts
 * Storage adapter avec IndexedDB (500MB) + fallback localStorage (10MB)
 * API async compatible avec StatsManager
 */

import type { QStatExtended } from '../stats/StatsManager';

type StorageBackend = 'indexeddb' | 'localstorage';

export class IndexedDBAdapter {
  private static instance: IndexedDBAdapter;
  private db: IDBDatabase | null = null;
  private backend: StorageBackend = 'indexeddb';
  private readonly DB_NAME = 'text2quiz_storage';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'stats';
  private initPromise: Promise<void> | null = null;

  private constructor() {
    // Singleton
  }

  public static getInstance(): IndexedDBAdapter {
    if (!IndexedDBAdapter.instance) {
      IndexedDBAdapter.instance = new IndexedDBAdapter();
    }
    return IndexedDBAdapter.instance;
  }

  /**
   * Initialize IndexedDB (ou fallback localStorage)
   */
  public async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._init();
    return this.initPromise;
  }

  private async _init(): Promise<void> {
    // Check IndexedDB support
    if (!this.isIndexedDBAvailable()) {
      console.warn('[Storage] IndexedDB not available, falling back to localStorage');
      this.backend = 'localstorage';
      return;
    }

    try {
      this.db = await this.openDatabase();
      this.backend = 'indexeddb';
      console.log('[Storage] IndexedDB initialized successfully');
    } catch (error) {
      console.error('[Storage] IndexedDB init failed, falling back to localStorage:', error);
      this.backend = 'localstorage';
    }
  }

  private isIndexedDBAvailable(): boolean {
    try {
      return typeof indexedDB !== 'undefined';
    } catch {
      return false;
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store if doesn't exist
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const objectStore = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('lastReviewDate', 'lastReviewDate', { unique: false });
          console.log('[Storage] Created object store:', this.STORE_NAME);
        }
      };
    });
  }

  /**
   * Get single stat by question ID
   */
  public async get(questionId: string): Promise<QStatExtended | null> {
    await this.init();

    if (this.backend === 'localstorage') {
      return this.getFromLocalStorage(questionId);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(questionId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all stats (for bulk operations)
   */
  public async getAll(): Promise<Record<string, QStatExtended>> {
    await this.init();

    if (this.backend === 'localstorage') {
      return this.getAllFromLocalStorage();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const stats = request.result as Array<QStatExtended & { id: string }>;
        const result: Record<string, QStatExtended> = {};
        
        stats.forEach((stat) => {
          const { id, ...statData } = stat;
          result[id] = statData;
        });
        
        resolve(result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Set single stat
   */
  public async set(questionId: string, stat: QStatExtended): Promise<void> {
    await this.init();

    if (this.backend === 'localstorage') {
      return this.setToLocalStorage(questionId, stat);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put({ id: questionId, ...stat });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Set multiple stats (batch)
   */
  public async setAll(stats: Record<string, QStatExtended>): Promise<void> {
    await this.init();

    if (this.backend === 'localstorage') {
      return this.setAllToLocalStorage(stats);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      let completed = 0;
      const total = Object.keys(stats).length;
      let hasError = false;

      Object.entries(stats).forEach(([id, stat]) => {
        const request = store.put({ id, ...stat });
        
        request.onsuccess = () => {
          completed++;
          if (completed === total && !hasError) {
            resolve();
          }
        };
        
        request.onerror = () => {
          if (!hasError) {
            hasError = true;
            reject(request.error);
          }
        };
      });
    });
  }

  /**
   * Delete single stat
   */
  public async delete(questionId: string): Promise<void> {
    await this.init();

    if (this.backend === 'localstorage') {
      return this.deleteFromLocalStorage(questionId);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(questionId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all stats
   */
  public async clear(): Promise<void> {
    await this.init();

    if (this.backend === 'localstorage') {
      return this.clearLocalStorage();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get storage info (size estimate)
   */
  public async getStorageInfo(): Promise<{ backend: StorageBackend; estimatedSize?: number }> {
    await this.init();

    if (this.backend === 'localstorage') {
      // Estimate localStorage size
      let size = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          size += localStorage[key].length + key.length;
        }
      }
      return { backend: 'localstorage', estimatedSize: size };
    }

    // IndexedDB estimate (if navigator.storage available)
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          backend: 'indexeddb',
          estimatedSize: estimate.usage,
        };
      } catch (e) {
        console.warn('[Storage] Could not estimate IndexedDB size:', e);
      }
    }

    return { backend: 'indexeddb' };
  }

  // ========== LocalStorage fallback methods ==========

  private getFromLocalStorage(questionId: string): QStatExtended | null {
    const key = `text2quiz_stat_${questionId}`;
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  private getAllFromLocalStorage(): Record<string, QStatExtended> {
    const stats: Record<string, QStatExtended> = {};
    const prefix = 'text2quiz_stat_';
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const questionId = key.substring(prefix.length);
        const value = localStorage.getItem(key);
        if (value) {
          stats[questionId] = JSON.parse(value);
        }
      }
    }
    
    return stats;
  }

  private setToLocalStorage(questionId: string, stat: QStatExtended): void {
    const key = `text2quiz_stat_${questionId}`;
    localStorage.setItem(key, JSON.stringify(stat));
  }

  private setAllToLocalStorage(stats: Record<string, QStatExtended>): void {
    Object.entries(stats).forEach(([id, stat]) => {
      this.setToLocalStorage(id, stat);
    });
  }

  private deleteFromLocalStorage(questionId: string): void {
    const key = `text2quiz_stat_${questionId}`;
    localStorage.removeItem(key);
  }

  private clearLocalStorage(): void {
    const prefix = 'text2quiz_stat_';
    const keysToDelete: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Migrate from old localStorage format to IndexedDB
   */
  public async migrateFromLocalStorage(): Promise<number> {
    if (this.backend !== 'indexeddb') {
      console.warn('[Storage] Cannot migrate: not using IndexedDB');
      return 0;
    }

    const oldStats = this.getAllFromLocalStorage();
    const count = Object.keys(oldStats).length;

    if (count === 0) {
      console.log('[Storage] No stats to migrate');
      return 0;
    }

    console.log(`[Storage] Migrating ${count} stats to IndexedDB...`);
    await this.setAll(oldStats);
    
    // Optionally clear old localStorage after successful migration
    // this.clearLocalStorage();
    
    console.log(`[Storage] Migration complete: ${count} stats`);
    return count;
  }
}

// Export singleton instance
export const storageAdapter = IndexedDBAdapter.getInstance();
