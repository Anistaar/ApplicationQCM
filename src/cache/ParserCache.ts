/**
 * ParserCache — Memoization layer for parseQuestions
 * Eliminates re-parsing overhead (23ms → 0.1ms cache hit)
 * Sprint 2 Phase 1 enhancements: requestIdleCallback, preload, file hash
 */

import { parseQuestions } from '../parser';
import { dedupeQuestions } from '../utils';
import type { Question } from '../types';

type CacheEntry = {
  questions: Question[];
  fileHash: string;
  timestamp: number;
};

class ParserCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxAge: number = 30 * 60 * 1000; // 30 minutes (increased from 5)
  private maxSize: number = 50; // Max 50 files cached
  private pendingParsing: Map<string, Promise<Question[]>> = new Map();

  /**
   * Compute simple hash for cache invalidation
   */
  private computeFileHash(content: string): string {
    const sample = content.substring(0, 100);
    let hash = 0;
    for (let i = 0; i < sample.length; i++) {
      const char = sample.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `${content.length}_${hash.toString(36)}`;
  }

  /**
   * Parse with requestIdleCallback for non-blocking
   */
  private parseWithIdleCallback(content: string): Promise<Question[]> {
    if (typeof requestIdleCallback === 'undefined') {
      return Promise.resolve(parseQuestions(content));
    }

    return new Promise((resolve) => {
      requestIdleCallback(() => {
        const questions = parseQuestions(content);
        resolve(questions);
      }, { timeout: 2000 });
    });
  }

  /**
   * Get parsed questions with deduplication, using cache when available
   */
  getParsedQuestions(filePath: string, content: string, useIdleCallback: boolean = false): Question[] {
    const fileHash = this.computeFileHash(content);
    const cached = this.cache.get(filePath);
    const now = Date.now();

    // Return cached if valid and hash matches
    if (cached && now - cached.timestamp < this.maxAge && cached.fileHash === fileHash) {
      return cached.questions;
    }

    // Parse and cache
    const parsed = parseQuestions(content);
    const unique = dedupeQuestions(parsed);
    
    // Evict oldest if cache full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(filePath, {
      questions: unique,
      fileHash,
      timestamp: now,
    });

    return unique;
  }

  /**
   * Async version with requestIdleCallback support
   */
  async getParsedQuestionsAsync(filePath: string, content: string, useIdleCallback: boolean = true): Promise<Question[]> {
    const fileHash = this.computeFileHash(content);
    const cached = this.cache.get(filePath);
    const now = Date.now();

    // Return cached if valid
    if (cached && now - cached.timestamp < this.maxAge && cached.fileHash === fileHash) {
      return cached.questions;
    }

    // Check if already parsing
    if (this.pendingParsing.has(filePath)) {
      return this.pendingParsing.get(filePath)!;
    }

    // Parse with idle callback if requested
    const parsePromise = (async () => {
      const parsed = useIdleCallback
        ? await this.parseWithIdleCallback(content)
        : parseQuestions(content);
      
      const unique = dedupeQuestions(parsed);

      // Evict oldest if cache full
      if (this.cache.size >= this.maxSize) {
        const oldestKey = this.cache.keys().next().value;
        this.cache.delete(oldestKey);
      }

      this.cache.set(filePath, {
        questions: unique,
        fileHash,
        timestamp: now,
      });

      return unique;
    })();

    this.pendingParsing.set(filePath, parsePromise);
    
    try {
      const result = await parsePromise;
      return result;
    } finally {
      this.pendingParsing.delete(filePath);
    }
  }

  /**
   * Preload multiple courses in background (optional optimization)
   */
  async preloadCourses(courses: Array<{ path: string; content: string }>) {
    const promises = courses.map(({ path, content }) =>
      this.getParsedQuestionsAsync(path, content, true)
    );
    
    await Promise.all(promises);
  }

  /**
   * Invalidate specific file cache
   */
  invalidate(filePath: string): void {
    this.cache.delete(filePath);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.pendingParsing.clear();
  }

  /**
   * Get cache stats
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Legacy method for backwards compatibility
   */
  async preloadCoursesLegacy(courses: Array<{ path: string; content: string }>) {
    for (const course of courses) {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          this.getParsedQuestions(course.path, course.content);
        }, { timeout: 2000 });
      }
    }
  }
}

// Singleton instance
export const parserCache = new ParserCache();
