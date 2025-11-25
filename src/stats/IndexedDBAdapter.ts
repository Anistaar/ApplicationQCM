/**
 * IndexedDBAdapter — Persistent storage for QStat with 500MB capacity
 * Replaces localStorage (limited to 5-10MB)
 * 
 * Migration strategy: Auto-import from localStorage on first run
 */

import type { QStat } from '../scheduling';

const DB_NAME = 't2q_stats';
const DB_VERSION = 1;
const STORE_NAME = 'qstats';

class IndexedDBAdapter {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize database (idempotent)
   */
  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store with qId as keyPath
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'qId' });
          
          // Indexes for efficient queries
          store.createIndex('next', 'next'); // For isDue queries
          store.createIndex('box', 'box');   // For box-based filtering
          store.createIndex('strength', 'strength'); // For mastery queries
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Save single QStat
   */
  async saveStat(qId: string, stat: QStat): Promise<void> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ qId, ...stat });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get single QStat
   */
  async getStat(qId: string): Promise<QStat | null> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(qId);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
        } else {
          // Remove qId from result (it's in the key, not the value)
          const { qId: _, ...stat } = result;
          resolve(stat as QStat);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all stats as Record<qId, QStat>
   */
  async getAllStats(): Promise<Record<string, QStat>> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result;
        const stats: Record<string, QStat> = {};
        
        for (const item of results) {
          const { qId, ...stat } = item;
          stats[qId] = stat as QStat;
        }
        
        resolve(stats);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all due questions (next <= now)
   */
  async getDueStats(): Promise<Array<{ qId: string; stat: QStat }>> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('next');
      
      const now = Date.now();
      const range = IDBKeyRange.upperBound(now);
      const request = index.getAll(range);

      request.onsuccess = () => {
        const results = request.result.map(item => {
          const { qId, ...stat } = item;
          return { qId, stat: stat as QStat };
        });
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Bulk save stats (efficient for migrations)
   */
  async saveAllStats(stats: Record<string, QStat>): Promise<void> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      for (const [qId, stat] of Object.entries(stats)) {
        store.put({ qId, ...stat });
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Clear all stats
   */
  async clearAll(): Promise<void> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Migrate from localStorage to IndexedDB
   */
  async migrateFromLocalStorage(): Promise<void> {
    const LS_KEY = 't2q_stats_v2';
    const stored = localStorage.getItem(LS_KEY);
    
    if (!stored) return; // Nothing to migrate

    try {
      const stats: Record<string, QStat> = JSON.parse(stored);
      await this.saveAllStats(stats);
      
      // Backup localStorage before clearing (safety)
      localStorage.setItem(`${LS_KEY}_backup`, stored);
      
      console.log(`[IndexedDB] Migrated ${Object.keys(stats).length} stats from localStorage`);
    } catch (error) {
      console.error('[IndexedDB] Migration failed:', error);
      throw error;
    }
  }

  /**
   * Export stats for backup (JSON format)
   */
  async exportStats(): Promise<string> {
    const stats = await this.getAllStats();
    return JSON.stringify(stats, null, 2);
  }

  /**
   * Import stats from backup
   */
  async importStats(json: string): Promise<void> {
    const stats = JSON.parse(json);
    await this.saveAllStats(stats);
  }
}

// Singleton instance
export const idbAdapter = new IndexedDBAdapter();

/**
 * Auto-initialize and migrate on module load
 */
(async () => {
  try {
    await idbAdapter.init();
    
    // Check if migration needed
    const existingStats = await idbAdapter.getAllStats();
    if (Object.keys(existingStats).length === 0) {
      await idbAdapter.migrateFromLocalStorage();
    }
  } catch (error) {
    console.error('[IndexedDB] Initialization failed:', error);
    // Fallback to localStorage handled by scheduling.ts
  }
})();
