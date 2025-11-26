/**
 * StatsManager — Unified stats interface supporting both localStorage and IndexedDB
 * 
 * Strategy: Try IndexedDB first, fallback to localStorage on error
 * Provides async API with backward compat
 */

import type { Question, UserAnswer } from '../types';
import type { QStat } from '../scheduling';
import { 
  computeSeverity, 
  bucketizeSeverity, 
  requiredFromSeverityBucket 
} from '../scheduling';
import { keyForQuestion } from '../utils';
import { idbAdapter } from './IndexedDBAdapter';
import { eloSystem } from './EloProgressionSystem';

/**
 * Extended QStat with attempt logs
 */
export type QStatExtended = QStat & {
  logs?: Array<{
    ts: number;      // Timestamp
    c: boolean;      // Correct
    t: number;       // TimeMs
    s: number;       // Severity
  }>;
};

const LS_KEY = 't2q_stats_v2';
const MAX_LOGS = 100; // Keep last 100 attempts per question

class StatsManager {
  private useIndexedDB = true; // Auto-disable on error

  /**
   * Load all stats (async)
   */
  async loadStats(): Promise<Record<string, QStatExtended>> {
    if (this.useIndexedDB) {
      try {
        return await idbAdapter.getAllStats() as Record<string, QStatExtended>;
      } catch (error) {
        console.warn('[StatsManager] IndexedDB failed, falling back to localStorage:', error);
        this.useIndexedDB = false;
      }
    }

    // Fallback: localStorage
    return this.loadStatsFromLocalStorage();
  }

  /**
   * Save all stats (async)
   */
  async saveStats(stats: Record<string, QStatExtended>): Promise<void> {
    if (this.useIndexedDB) {
      try {
        await idbAdapter.saveAllStats(stats);
        return;
      } catch (error) {
        console.warn('[StatsManager] IndexedDB save failed, falling back to localStorage:', error);
        this.useIndexedDB = false;
      }
    }

    // Fallback: localStorage
    this.saveStatsToLocalStorage(stats);
  }

  /**
   * Save single stat (optimized)
   */
  async saveStat(qId: string, stat: QStatExtended): Promise<void> {
    if (this.useIndexedDB) {
      try {
        await idbAdapter.saveStat(qId, stat);
        return;
      } catch (error) {
        console.warn('[StatsManager] IndexedDB save failed:', error);
        this.useIndexedDB = false;
      }
    }

    // Fallback: update localStorage
    const stats = this.loadStatsFromLocalStorage();
    stats[qId] = stat;
    this.saveStatsToLocalStorage(stats);
  }

  /**
   * Get single stat
   */
  async getStat(qId: string): Promise<QStatExtended | null> {
    if (this.useIndexedDB) {
      try {
        return await idbAdapter.getStat(qId) as QStatExtended | null;
      } catch (error) {
        console.warn('[StatsManager] IndexedDB get failed:', error);
        this.useIndexedDB = false;
      }
    }

    // Fallback: localStorage
    const stats = this.loadStatsFromLocalStorage();
    return stats[qId] || null;
  }

  /**
   * Update stat after answer (with logs)
   */
  async updateStatAfterAnswer(
    q: Question, 
    correct: boolean, 
    severity: number, 
    timeMs?: number
  ): Promise<void> {
    const id = keyForQuestion(q);
    const stats = await this.loadStats();
    
    const cur: QStatExtended = stats[id] || {
      box: 1,
      streak: 0,
      last: 0,
      next: 0,
      required: 1,
      lastSeverity: undefined,
      seen: 0,
      correct: 0,
      strength: 0,
      avgTimeMs: 0,
      logs: [],
    };

    // Update counters
    cur.seen = (cur.seen || 0) + 1;
    cur.correct = (cur.correct || 0) + (correct ? 1 : 0);
    if (!correct) cur.correct = Math.max(0, (cur.correct || 0) - 0.5);

    // Update average time
    if (typeof timeMs === 'number') {
      const prev = cur.avgTimeMs || 0;
      const alpha = 1 / Math.min(cur.seen, 10);
      cur.avgTimeMs = Math.round(prev * (1 - alpha) + timeMs * alpha);
    }

    // Update Leitner box logic
    if (correct) {
      cur.streak += 1;
      const need = Math.max(1, cur.required || 1);
      if (cur.streak >= need) {
        cur.box = Math.min((cur.box || 1) + 1, 5);
        cur.streak = 0;
        cur.required = 1;
      }
    } else {
      const bucket = bucketizeSeverity(severity);
      const demotion = bucket === 'mild' ? 1 : bucket === 'medium' ? 2 : 3;
      cur.box = Math.max(1, (cur.box || 1) - demotion);
      cur.streak = 0;
      cur.required = requiredFromSeverityBucket(bucket);
    }

    // Update strength
    const required = cur.required || 5;
    const baseStrength = Math.min(1, Math.max(0, (cur.correct || 0) / required));
    const timePenalty = cur.avgTimeMs ? Math.min(0.8, Math.max(0, (cur.avgTimeMs - 3000) / 7000)) : 0;
    cur.strength = Math.min(1, Math.max(0, baseStrength * (1 - timePenalty)));

    // Update metadata
    cur.lastSeverity = severity;
    cur.last = Date.now();
    cur.next = this.scheduleNext(cur);

    // Append log (keep last MAX_LOGS)
    if (!cur.logs) cur.logs = [];
    cur.logs.push({
      ts: Date.now(),
      c: correct,
      t: timeMs || 0,
      s: severity,
    });
    if (cur.logs.length > MAX_LOGS) {
      cur.logs = cur.logs.slice(-MAX_LOGS);
    }

    // Save
    await this.saveStat(id, cur);

    // Mettre à jour le système ELO en parallèle
    try {
      const eloResult = await eloSystem.updateAfterAnswer(q, correct, timeMs || 0);
      
      // Afficher notification de rank-up si changement de rang
      if (eloResult.rankChange && typeof window !== 'undefined') {
        // Import dynamique pour éviter cycle
        const { ProgressionDashboard } = await import('./ProgressionDashboard');
        ProgressionDashboard.showRankUpNotification(eloResult.rankChange.from, eloResult.rankChange.to);
      }
    } catch (error) {
      console.warn('[StatsManager] ELO update failed:', error);
    }
  }

  /**
   * Check if question is due
   */
  async isDue(q: Question): Promise<boolean> {
    const id = keyForQuestion(q);
    const stat = await this.getStat(id);
    return !stat || stat.next <= Date.now();
  }

  /**
   * Get all due questions
   */
  async getDueQuestions(allQuestions: Question[]): Promise<Question[]> {
    const stats = await this.loadStats();
    const now = Date.now();
    
    return allQuestions.filter(q => {
      const id = keyForQuestion(q);
      const stat = stats[id];
      return !stat || stat.next <= now;
    });
  }

  /**
   * Schedule next review timestamp
   */
  private scheduleNext(qstat: QStatExtended): number {
    const BASE_INTERVALS_DAYS = [0, 1, 3, 7, 14, 30];
    const now = Date.now();
    const strength = qstat.strength ?? 0;

    if (strength >= 1) {
      const days = 30 * Math.max(1, qstat.box || 1);
      return now + days * 24 * 3600 * 1000;
    }

    const idx = Math.round(strength * (BASE_INTERVALS_DAYS.length - 1));
    const days = BASE_INTERVALS_DAYS[idx] || 1;
    const severity = qstat.lastSeverity ?? 1;
    const severityFactor = severity > 0.6 ? 0.5 : severity > 0.3 ? 0.75 : 1;
    const nextMs = now + Math.max(0.1, days * severityFactor) * 24 * 3600 * 1000;
    
    return Math.round(nextMs);
  }

  /**
   * Export stats for backup
   */
  async exportStats(): Promise<string> {
    if (this.useIndexedDB) {
      return await idbAdapter.exportStats();
    }
    const stats = this.loadStatsFromLocalStorage();
    return JSON.stringify(stats, null, 2);
  }

  /**
   * Import stats from backup
   */
  async importStats(json: string): Promise<void> {
    const stats = JSON.parse(json);
    await this.saveStats(stats);
  }

  /**
   * Clear all stats
   */
  async clearAllStats(): Promise<void> {
    if (this.useIndexedDB) {
      await idbAdapter.clearAll();
    }
    localStorage.removeItem(LS_KEY);
  }

  /**
   * Compute total time spent answering questions (from logs)
   */
  async getTotalTimeSpent(): Promise<number> {
    const stats = await this.loadStats();
    let totalMs = 0;

    Object.values(stats).forEach(stat => {
      if (stat.logs && stat.logs.length > 0) {
        // Sum all time from logs
        totalMs += stat.logs.reduce((sum, log) => sum + (log.t || 0), 0);
      }
    });

    return totalMs;
  }

  /**
   * Format time duration (ms → human readable)
   */
  formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      const m = minutes % 60;
      return `${hours}h${m > 0 ? ` ${m}min` : ''}`;
    }
    if (minutes > 0) {
      const s = seconds % 60;
      return `${minutes}min${s > 0 ? ` ${s}s` : ''}`;
    }
    return `${seconds}s`;
  }

  // ----- Private helpers -----

  private loadStatsFromLocalStorage(): Record<string, QStatExtended> {
    try {
      const stored = localStorage.getItem(LS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private saveStatsToLocalStorage(stats: Record<string, QStatExtended>): void {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('[StatsManager] localStorage save failed (quota exceeded?):', error);
    }
  }
}

// Singleton instance
export const statsManager = new StatsManager();
