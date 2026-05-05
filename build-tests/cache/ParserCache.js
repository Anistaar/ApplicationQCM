/**
 * ParserCache — Memoization layer for parseQuestions
 * Eliminates re-parsing overhead (23ms → 0.1ms cache hit)
 * Sprint 2 Phase 1 enhancements: requestIdleCallback, preload, file hash
 */
import { parseQuestions } from '../parser';
import { dedupeQuestions } from '../utils';
class ParserCache {
    constructor() {
        this.cache = new Map();
        this.maxAge = 30 * 60 * 1000; // 30 minutes (increased from 5)
        this.maxSize = 50; // Max 50 files cached
        this.pendingParsing = new Map();
    }
    /**
     * Compute simple hash for cache invalidation
     */
    computeFileHash(content) {
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
    parseWithIdleCallback(content) {
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
    getParsedQuestions(filePath, content, useIdleCallback = false) {
        const fileHash = this.computeFileHash(content);
        const cached = this.cache.get(filePath);
        const now = Date.now();
        // Return cached if valid and hash matches
        if (cached && now - cached.timestamp < this.maxAge && cached.fileHash === fileHash) {
            console.log(`[ParserCache] HIT: ${filePath}`);
            return cached.questions;
        }
        console.log(`[ParserCache] MISS: ${filePath} - Parsing...`);
        // Parse and cache
        const parsed = parseQuestions(content);
        const unique = dedupeQuestions(parsed);
        // Evict oldest if cache full
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
            console.log(`[ParserCache] Evicted: ${oldestKey}`);
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
    async getParsedQuestionsAsync(filePath, content, useIdleCallback = true) {
        const fileHash = this.computeFileHash(content);
        const cached = this.cache.get(filePath);
        const now = Date.now();
        // Return cached if valid
        if (cached && now - cached.timestamp < this.maxAge && cached.fileHash === fileHash) {
            console.log(`[ParserCache] HIT (async): ${filePath}`);
            return cached.questions;
        }
        // Check if already parsing
        if (this.pendingParsing.has(filePath)) {
            console.log(`[ParserCache] Awaiting pending: ${filePath}`);
            return this.pendingParsing.get(filePath);
        }
        console.log(`[ParserCache] MISS (async): ${filePath} - Parsing...`);
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
        }
        finally {
            this.pendingParsing.delete(filePath);
        }
    }
    /**
     * Preload multiple courses in background (optional optimization)
     */
    async preloadCourses(courses) {
        console.log(`[ParserCache] Preloading ${courses.length} courses...`);
        const promises = courses.map(({ path, content }) => this.getParsedQuestionsAsync(path, content, true));
        await Promise.all(promises);
        console.log(`[ParserCache] Preload complete`);
    }
    /**
     * Invalidate specific file cache
     */
    invalidate(filePath) {
        this.cache.delete(filePath);
        console.log(`[ParserCache] Invalidated: ${filePath}`);
    }
    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
        this.pendingParsing.clear();
        console.log(`[ParserCache] Cleared all cache`);
    }
    /**
     * Get cache stats
     */
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
    /**
     * Legacy method for backwards compatibility
     */
    async preloadCoursesLegacy(courses) {
        for (const course of courses) {
            // Parse in idle callback to avoid blocking main thread
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    this.getParsedQuestions(course.path, course.content);
                }, 0);
            }
        }
    }
    /**
     * Clear cache (useful for testing or when courses update)
     */
    clear() {
        this.cache.clear();
    }
    /**
     * Get cache statistics
     */
    getStats() {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.entries()).map(([path, entry]) => ({
                path,
                age: Date.now() - entry.timestamp,
                questionCount: entry.questions.length,
            })),
        };
    }
}
// Singleton instance
export const parserCache = new ParserCache();
