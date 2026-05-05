// src/database/SimpleProgress.ts
// Progression simple stockée en localStorage (pas de BDD)
const STORAGE_KEY = 'text2quiz_progress';
class SimpleProgressStore {
    getProgress() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            }
            catch (e) {
                console.warn('Progression corrompue, reset');
            }
        }
        return { subjects: {}, lastUpdate: new Date().toISOString() };
    }
    saveProgress(progress) {
        progress.lastUpdate = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
    getNotionProgress(subject, notionId) {
        const progress = this.getProgress();
        return progress.subjects[subject]?.[notionId] || null;
    }
    updateNotionProgress(subject, notionId, correct) {
        const progress = this.getProgress();
        if (!progress.subjects[subject]) {
            progress.subjects[subject] = {};
        }
        const notion = progress.subjects[subject][notionId] || {
            notionId,
            score: 0,
            totalSeen: 0,
            correct: 0,
            wrong: 0,
            lastSeen: new Date().toISOString()
        };
        notion.totalSeen++;
        if (correct) {
            notion.correct++;
            notion.score = Math.min(100, notion.score + 10);
        }
        else {
            notion.wrong++;
            notion.score = Math.max(0, notion.score - 15);
        }
        notion.lastSeen = new Date().toISOString();
        progress.subjects[subject][notionId] = notion;
        this.saveProgress(progress);
    }
    getNotionsByScore(subject) {
        const progress = this.getProgress();
        const subjectProgress = progress.subjects[subject] || {};
        return Object.values(subjectProgress).sort((a, b) => a.score - b.score);
    }
    exportProgress() {
        return localStorage.getItem(STORAGE_KEY) || '{}';
    }
    importProgress(jsonData) {
        try {
            const parsed = JSON.parse(jsonData);
            localStorage.setItem(STORAGE_KEY, jsonData);
        }
        catch (e) {
            throw new Error('Format JSON invalide');
        }
    }
    clearProgress(subject) {
        if (subject) {
            const progress = this.getProgress();
            delete progress.subjects[subject];
            this.saveProgress(progress);
        }
        else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }
}
export const simpleProgress = new SimpleProgressStore();
