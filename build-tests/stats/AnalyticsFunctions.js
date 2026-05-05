/**
 * AnalyticsFunctions — Advanced analytics computations
 *
 * Features:
 * - Retention curves (7, 14, 30 days)
 * - Problem questions detection (fail rate > 50%)
 * - Weak zones identification (mastery < 50%)
 * - Study streak tracking
 * - Velocity metrics (questions/day)
 * - Simple ML prediction (linear regression)
 */
import { statsManager } from './StatsManager';
import { keyForQuestion } from '../utils';
export class AnalyticsFunctions {
    /**
     * Compute retention curve over time
     * Shows how many questions are retained after N days
     */
    async computeRetentionCurve(days) {
        const stats = await statsManager.loadStats();
        const now = Date.now();
        const msPerDay = 24 * 3600 * 1000;
        const dataPoints = [];
        for (let day = 0; day <= days; day++) {
            const targetTime = now - (day * msPerDay);
            let total = 0;
            let retained = 0;
            Object.values(stats).forEach(stat => {
                // Questions learned before this day
                if (stat.last && stat.last <= targetTime) {
                    total++;
                    // Still retained if next review is in the future or high strength
                    if (stat.next > targetTime || (stat.strength ?? 0) > 0.7) {
                        retained++;
                    }
                }
            });
            const percentage = total > 0 ? (retained / total) * 100 : 0;
            dataPoints.push({
                day,
                retained,
                total,
                percentage,
            });
        }
        return dataPoints.reverse();
    }
    /**
     * Identify problem questions with high fail rates
     */
    async computeProblemQuestions(allQuestions, minAttempts = 3, failRateThreshold = 0.5) {
        const stats = await statsManager.loadStats();
        const problems = [];
        for (const question of allQuestions) {
            const key = keyForQuestion(question);
            const stat = stats[key];
            if (!stat || (stat.seen || 0) < minAttempts)
                continue;
            const attempts = stat.seen || 0;
            const correct = stat.correct || 0;
            const failRate = attempts > 0 ? 1 - (correct / attempts) : 0;
            if (failRate >= failRateThreshold) {
                problems.push({
                    question,
                    failRate,
                    attempts,
                    avgTime: stat.avgTimeMs || 0,
                });
            }
        }
        // Sort by fail rate DESC
        return problems.sort((a, b) => b.failRate - a.failRate);
    }
    /**
     * Identify weak zones (themes with low mastery)
     */
    async computeWeakZones(allQuestions, masteryThreshold = 0.5) {
        const stats = await statsManager.loadStats();
        const themeStats = new Map();
        // Aggregate by theme
        for (const question of allQuestions) {
            const themes = question.tags || question.topics || [];
            const key = keyForQuestion(question);
            const stat = stats[key];
            for (const theme of themes) {
                if (!themeStats.has(theme)) {
                    themeStats.set(theme, { total: 0, seen: 0, correct: 0, attempts: 0 });
                }
                const ts = themeStats.get(theme);
                ts.total++;
                if (stat) {
                    const attempts = stat.seen || 0;
                    const correct = stat.correct || 0;
                    if (attempts > 0) {
                        ts.seen++;
                        ts.correct += correct;
                        ts.attempts += attempts;
                    }
                }
            }
        }
        // Compute mastery and filter weak zones
        const weakZones = [];
        themeStats.forEach((stats, theme) => {
            if (stats.total === 0)
                return;
            const mastery = stats.seen / stats.total;
            if (mastery < masteryThreshold && stats.total >= 3) {
                const avgFailRate = stats.attempts > 0
                    ? 1 - (stats.correct / stats.attempts)
                    : 1;
                weakZones.push({
                    theme,
                    mastery,
                    questionsCount: stats.total,
                    avgFailRate,
                });
            }
        });
        // Sort by mastery ASC (weakest first)
        return weakZones.sort((a, b) => a.mastery - b.mastery);
    }
    /**
     * Compute study streak (consecutive days with activity)
     */
    async computeStreak() {
        const stats = await statsManager.loadStats();
        const msPerDay = 24 * 3600 * 1000;
        const now = Date.now();
        // Get all activity timestamps
        const timestamps = [];
        Object.values(stats).forEach(stat => {
            if (stat.logs) {
                stat.logs.forEach(log => timestamps.push(log.ts));
            }
        });
        if (timestamps.length === 0) {
            return { currentStreak: 0, longestStreak: 0, lastActivity: 0 };
        }
        // Sort timestamps
        timestamps.sort((a, b) => b - a);
        const lastActivity = timestamps[0];
        // Compute streaks
        const daySet = new Set();
        timestamps.forEach(ts => {
            const day = Math.floor(ts / msPerDay);
            daySet.add(day);
        });
        const days = Array.from(daySet).sort((a, b) => b - a);
        const today = Math.floor(now / msPerDay);
        // Current streak
        let currentStreak = 0;
        for (let i = 0; i < days.length; i++) {
            const expectedDay = today - i;
            if (days[i] === expectedDay || days[i] === expectedDay - 1) {
                currentStreak++;
            }
            else {
                break;
            }
        }
        // Longest streak
        let longestStreak = 0;
        let tempStreak = 1;
        for (let i = 1; i < days.length; i++) {
            if (days[i - 1] - days[i] === 1) {
                tempStreak++;
            }
            else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
        return { currentStreak, longestStreak, lastActivity };
    }
    /**
     * Compute velocity (questions answered per day)
     */
    async computeVelocity() {
        const stats = await statsManager.loadStats();
        const msPerDay = 24 * 3600 * 1000;
        const now = Date.now();
        // Count questions per day
        const dayCounts = new Map();
        Object.values(stats).forEach(stat => {
            if (stat.logs) {
                stat.logs.forEach(log => {
                    const day = Math.floor(log.ts / msPerDay);
                    dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
                });
            }
        });
        if (dayCounts.size === 0) {
            return {
                questionsPerDay: 0,
                last7Days: 0,
                last30Days: 0,
                trend: 'stable'
            };
        }
        // Overall average
        const totalQuestions = Array.from(dayCounts.values()).reduce((sum, c) => sum + c, 0);
        const totalDays = dayCounts.size;
        const questionsPerDay = totalQuestions / totalDays;
        // Last 7 days
        const last7DaysStart = Math.floor((now - 7 * msPerDay) / msPerDay);
        let last7Days = 0;
        dayCounts.forEach((count, day) => {
            if (day >= last7DaysStart) {
                last7Days += count;
            }
        });
        last7Days = last7Days / 7;
        // Last 30 days
        const last30DaysStart = Math.floor((now - 30 * msPerDay) / msPerDay);
        let last30Days = 0;
        dayCounts.forEach((count, day) => {
            if (day >= last30DaysStart) {
                last30Days += count;
            }
        });
        last30Days = last30Days / 30;
        // Trend detection
        let trend = 'stable';
        if (last7Days > last30Days * 1.2) {
            trend = 'up';
        }
        else if (last7Days < last30Days * 0.8) {
            trend = 'down';
        }
        return { questionsPerDay, last7Days, last30Days, trend };
    }
    /**
     * Predict mastery progression (simple linear regression)
     */
    async predictMastery(theme, allQuestions) {
        const stats = await statsManager.loadStats();
        const themeQuestions = allQuestions.filter(q => (q.tags || q.topics || []).includes(theme));
        if (themeQuestions.length === 0)
            return null;
        // Collect mastery history
        const masteryPoints = [];
        const msPerDay = 24 * 3600 * 1000;
        const now = Date.now();
        // Sample mastery every day for last 30 days
        for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
            const targetTime = now - (daysAgo * msPerDay);
            let seen = 0;
            themeQuestions.forEach(q => {
                const key = keyForQuestion(q);
                const stat = stats[key];
                if (stat && stat.last && stat.last <= targetTime) {
                    seen++;
                }
            });
            const mastery = seen / themeQuestions.length;
            masteryPoints.push({ day: 30 - daysAgo, mastery });
        }
        // Linear regression: y = mx + b
        const n = masteryPoints.length;
        if (n < 2)
            return null;
        const sumX = masteryPoints.reduce((sum, p) => sum + p.day, 0);
        const sumY = masteryPoints.reduce((sum, p) => sum + p.mastery, 0);
        const sumXY = masteryPoints.reduce((sum, p) => sum + p.day * p.mastery, 0);
        const sumX2 = masteryPoints.reduce((sum, p) => sum + p.day * p.day, 0);
        const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const b = (sumY - m * sumX) / n;
        // Predict
        const currentMastery = masteryPoints[masteryPoints.length - 1].mastery;
        const predictedIn7Days = Math.min(1, Math.max(0, m * (30 + 7) + b));
        const predictedIn30Days = Math.min(1, Math.max(0, m * (30 + 30) + b));
        // Confidence based on R²
        const yMean = sumY / n;
        const ssTotal = masteryPoints.reduce((sum, p) => sum + (p.mastery - yMean) ** 2, 0);
        const ssResidual = masteryPoints.reduce((sum, p) => {
            const predicted = m * p.day + b;
            return sum + (p.mastery - predicted) ** 2;
        }, 0);
        const rSquared = ssTotal > 0 ? 1 - (ssResidual / ssTotal) : 0;
        const confidence = Math.max(0, Math.min(1, rSquared));
        return {
            theme,
            currentMastery,
            predictedIn7Days,
            predictedIn30Days,
            confidence,
        };
    }
    /**
     * Export all analytics data
     */
    async exportAnalytics() {
        const stats = await statsManager.loadStats();
        const retention7 = await this.computeRetentionCurve(7);
        const retention14 = await this.computeRetentionCurve(14);
        const retention30 = await this.computeRetentionCurve(30);
        const streak = await this.computeStreak();
        const velocity = await this.computeVelocity();
        const totalTime = await statsManager.getTotalTimeSpent();
        const analytics = {
            exportDate: new Date().toISOString(),
            totalQuestions: Object.keys(stats).length,
            totalTime: statsManager.formatDuration(totalTime),
            streak,
            velocity,
            retention: {
                '7days': retention7,
                '14days': retention14,
                '30days': retention30,
            },
        };
        return JSON.stringify(analytics, null, 2);
    }
}
// Singleton instance
export const analyticsFunctions = new AnalyticsFunctions();
