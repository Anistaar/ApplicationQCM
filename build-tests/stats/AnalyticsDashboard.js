/**
 * AnalyticsDashboard — Complete analytics visualization with Chart.js
 *
 * Features:
 * - Global dashboard (all subjects)
 * - Subject-specific dashboard
 * - Retention curves (line chart)
 * - Problem questions (horizontal bar chart)
 * - Weak zones (doughnut chart)
 * - Velocity trends
 * - Study streak calendar
 */
import { analyticsFunctions } from './AnalyticsFunctions';
import { statsManager } from './StatsManager';
export class AnalyticsDashboard {
    constructor(config) {
        this.charts = [];
        this.container = config.container;
        this.questions = config.questions;
        this.subject = config.subject;
    }
    /**
     * Render complete dashboard
     */
    async render() {
        // Destroy existing charts
        this.destroyCharts();
        // Clear container
        this.container.innerHTML = '';
        this.container.className = 'analytics-dashboard';
        // Load Chart.js if not already loaded
        await this.loadChartJS();
        // Render sections
        await this.renderHeader();
        await this.renderQuickStats();
        await this.renderRetentionChart();
        await this.renderProblemQuestionsChart();
        await this.renderWeakZonesChart();
        await this.renderVelocitySection();
        await this.renderStreakCalendar();
        await this.renderExportSection();
    }
    /**
     * Load Chart.js from CDN
     */
    async loadChartJS() {
        if (typeof Chart !== 'undefined')
            return;
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Chart.js'));
            document.head.appendChild(script);
        });
    }
    /**
     * Header section
     */
    async renderHeader() {
        const header = document.createElement('div');
        header.className = 'analytics-header';
        const title = this.subject
            ? `📊 Analytics - ${this.subject}`
            : '📊 Analytics Globales';
        header.innerHTML = `
      <h2>${title}</h2>
      <p class="analytics-subtitle">
        ${this.questions.length} questions disponibles
      </p>
    `;
        this.container.appendChild(header);
    }
    /**
     * Quick stats cards
     */
    async renderQuickStats() {
        const stats = await statsManager.loadStats();
        const totalTime = await statsManager.getTotalTimeSpent();
        const streak = await analyticsFunctions.computeStreak();
        const velocity = await analyticsFunctions.computeVelocity();
        const totalAttempts = Object.values(stats).reduce((sum, s) => sum + (s.seen || 0), 0);
        const totalCorrect = Object.values(stats).reduce((sum, s) => sum + (s.correct || 0), 0);
        const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
        const section = document.createElement('div');
        section.className = 'analytics-quick-stats';
        section.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-value">${statsManager.formatDuration(totalTime)}</div>
        <div class="stat-label">Temps total</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-value">${totalAttempts}</div>
        <div class="stat-label">Questions répondues</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-value">${accuracy.toFixed(1)}%</div>
        <div class="stat-label">Précision globale</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-value">${streak.currentStreak}</div>
        <div class="stat-label">Série actuelle (jours)</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-value">${velocity.last7Days.toFixed(1)}</div>
        <div class="stat-label">Questions/jour (7j)</div>
      </div>
    `;
        this.container.appendChild(section);
    }
    /**
     * Retention curve chart (line chart)
     */
    async renderRetentionChart() {
        const section = document.createElement('div');
        section.className = 'chart-section';
        section.innerHTML = `
      <h3>📉 Courbe de Rétention</h3>
      <p class="chart-description">
        Pourcentage de questions retenues après révision (7, 14, 30 jours)
      </p>
      <div class="chart-tabs">
        <button class="chart-tab active" data-days="7">7 jours</button>
        <button class="chart-tab" data-days="14">14 jours</button>
        <button class="chart-tab" data-days="30">30 jours</button>
      </div>
      <div class="chart-container">
        <canvas id="retention-chart"></canvas>
      </div>
    `;
        this.container.appendChild(section);
        // Initial render with 7 days
        await this.renderRetentionChartData(7);
        // Tab switching
        section.querySelectorAll('.chart-tab').forEach(tab => {
            tab.addEventListener('click', async (e) => {
                const days = parseInt(e.target.dataset.days || '7');
                // Update active tab
                section.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                // Re-render chart
                await this.renderRetentionChartData(days);
            });
        });
    }
    /**
     * Render retention chart data
     */
    async renderRetentionChartData(days) {
        const data = await analyticsFunctions.computeRetentionCurve(days);
        const canvas = document.getElementById('retention-chart');
        if (!canvas)
            return;
        // Destroy existing chart
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => `J-${d.day}`),
                datasets: [{
                        label: 'Rétention (%)',
                        data: data.map(d => d.percentage),
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#6366f1',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const point = data[context.dataIndex];
                                return [
                                    `Rétention: ${point.percentage.toFixed(1)}%`,
                                    `${point.retained} / ${point.total} questions`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: (value) => value + '%'
                        }
                    }
                }
            }
        });
        this.charts.push(chart);
    }
    /**
     * Problem questions chart (horizontal bar)
     */
    async renderProblemQuestionsChart() {
        const problems = await analyticsFunctions.computeProblemQuestions(this.questions, 3, 0.5);
        const top10 = problems.slice(0, 10);
        const section = document.createElement('div');
        section.className = 'chart-section';
        if (top10.length === 0) {
            section.innerHTML = `
        <h3>⚠️ Questions Problématiques</h3>
        <p class="empty-state">Aucune question avec taux d'échec > 50% (c'est excellent !)</p>
      `;
            this.container.appendChild(section);
            return;
        }
        section.innerHTML = `
      <h3>⚠️ Top 10 Questions Problématiques</h3>
      <p class="chart-description">
        Questions avec taux d'échec > 50% (${problems.length} total)
      </p>
      <div class="chart-container">
        <canvas id="problems-chart"></canvas>
      </div>
    `;
        this.container.appendChild(section);
        const canvas = document.getElementById('problems-chart');
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: top10.map((p, i) => `Q${i + 1}: ${this.truncateText(p.question.question, 40)}`),
                datasets: [{
                        label: 'Taux d\'échec (%)',
                        data: top10.map(p => p.failRate * 100),
                        backgroundColor: top10.map(p => {
                            if (p.failRate >= 0.75)
                                return '#ef4444';
                            if (p.failRate >= 0.6)
                                return '#f59e0b';
                            return '#eab308';
                        }),
                        borderRadius: 4,
                    }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const problem = top10[context.dataIndex];
                                return [
                                    `Échec: ${(problem.failRate * 100).toFixed(1)}%`,
                                    `Tentatives: ${problem.attempts}`,
                                    `Temps moyen: ${(problem.avgTime / 1000).toFixed(1)}s`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: (value) => value + '%'
                        }
                    }
                }
            }
        });
        this.charts.push(chart);
    }
    /**
     * Weak zones chart (doughnut)
     */
    async renderWeakZonesChart() {
        const weakZones = await analyticsFunctions.computeWeakZones(this.questions, 0.5);
        const top5 = weakZones.slice(0, 5);
        const section = document.createElement('div');
        section.className = 'chart-section';
        if (top5.length === 0) {
            section.innerHTML = `
        <h3>📚 Zones Faibles</h3>
        <p class="empty-state">Aucune zone faible détectée (maîtrise > 50% partout) 🎉</p>
      `;
            this.container.appendChild(section);
            return;
        }
        section.innerHTML = `
      <h3>📚 Top 5 Zones à Renforcer</h3>
      <p class="chart-description">
        Thèmes avec maîtrise < 50% (${weakZones.length} total)
      </p>
      <div class="chart-container" style="max-width: 400px; margin: 0 auto;">
        <canvas id="weak-zones-chart"></canvas>
      </div>
      <div class="weak-zones-list">
        ${top5.map((zone, i) => `
          <div class="weak-zone-item">
            <span class="zone-rank">${i + 1}</span>
            <span class="zone-name">${zone.theme}</span>
            <span class="zone-mastery">${(zone.mastery * 100).toFixed(0)}%</span>
            <span class="zone-count">(${zone.questionsCount} questions)</span>
          </div>
        `).join('')}
      </div>
    `;
        this.container.appendChild(section);
        const canvas = document.getElementById('weak-zones-chart');
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const colors = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#10b981'];
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: top5.map(z => z.theme),
                datasets: [{
                        data: top5.map(z => z.questionsCount),
                        backgroundColor: colors,
                        borderWidth: 2,
                        borderColor: '#fff',
                    }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const zone = top5[context.dataIndex];
                                return [
                                    `${zone.theme}`,
                                    `Maîtrise: ${(zone.mastery * 100).toFixed(0)}%`,
                                    `${zone.questionsCount} questions`,
                                    `Échec moyen: ${(zone.avgFailRate * 100).toFixed(0)}%`
                                ];
                            }
                        }
                    }
                }
            }
        });
        this.charts.push(chart);
    }
    /**
     * Velocity trends section
     */
    async renderVelocitySection() {
        const velocity = await analyticsFunctions.computeVelocity();
        const section = document.createElement('div');
        section.className = 'velocity-section';
        const trendIcon = velocity.trend === 'up' ? '📈' : velocity.trend === 'down' ? '📉' : '➡️';
        const trendText = velocity.trend === 'up' ? 'En hausse' : velocity.trend === 'down' ? 'En baisse' : 'Stable';
        const trendClass = velocity.trend === 'up' ? 'trend-up' : velocity.trend === 'down' ? 'trend-down' : 'trend-stable';
        section.innerHTML = `
      <h3>📊 Vélocité d'Apprentissage</h3>
      <div class="velocity-grid">
        <div class="velocity-card">
          <div class="velocity-label">Moyenne globale</div>
          <div class="velocity-value">${velocity.questionsPerDay.toFixed(1)}</div>
          <div class="velocity-unit">questions/jour</div>
        </div>
        <div class="velocity-card">
          <div class="velocity-label">7 derniers jours</div>
          <div class="velocity-value">${velocity.last7Days.toFixed(1)}</div>
          <div class="velocity-unit">questions/jour</div>
        </div>
        <div class="velocity-card">
          <div class="velocity-label">30 derniers jours</div>
          <div class="velocity-value">${velocity.last30Days.toFixed(1)}</div>
          <div class="velocity-unit">questions/jour</div>
        </div>
        <div class="velocity-card ${trendClass}">
          <div class="velocity-label">Tendance</div>
          <div class="velocity-value">${trendIcon}</div>
          <div class="velocity-unit">${trendText}</div>
        </div>
      </div>
    `;
        this.container.appendChild(section);
    }
    /**
     * Study streak calendar (visual representation)
     */
    async renderStreakCalendar() {
        const streak = await analyticsFunctions.computeStreak();
        const section = document.createElement('div');
        section.className = 'streak-section';
        const lastActivityDate = streak.lastActivity > 0
            ? new Date(streak.lastActivity).toLocaleDateString('fr-FR')
            : 'Jamais';
        section.innerHTML = `
      <h3>🔥 Série d'Apprentissage</h3>
      <div class="streak-cards">
        <div class="streak-card">
          <div class="streak-icon">🔥</div>
          <div class="streak-value">${streak.currentStreak}</div>
          <div class="streak-label">Série actuelle (jours)</div>
        </div>
        <div class="streak-card">
          <div class="streak-icon">⭐</div>
          <div class="streak-value">${streak.longestStreak}</div>
          <div class="streak-label">Record personnel</div>
        </div>
        <div class="streak-card">
          <div class="streak-icon">📅</div>
          <div class="streak-value">${lastActivityDate}</div>
          <div class="streak-label">Dernière activité</div>
        </div>
      </div>
      ${streak.currentStreak > 0 ? `
        <div class="streak-encouragement">
          ${this.getStreakEncouragement(streak.currentStreak)}
        </div>
      ` : `
        <div class="streak-encouragement empty">
          Répondez à des questions aujourd'hui pour commencer une série ! 💪
        </div>
      `}
    `;
        this.container.appendChild(section);
    }
    /**
     * Export section
     */
    async renderExportSection() {
        const section = document.createElement('div');
        section.className = 'export-section';
        section.innerHTML = `
      <h3>💾 Export Analytics</h3>
      <p>Téléchargez vos données analytiques en JSON</p>
      <button class="btn-export" id="btn-export-analytics">
        📥 Télécharger Analytics
      </button>
    `;
        this.container.appendChild(section);
        // Export button handler
        const btnExport = section.querySelector('#btn-export-analytics');
        btnExport?.addEventListener('click', async () => {
            try {
                const json = await analyticsFunctions.exportAnalytics();
                this.downloadJSON(json, `analytics-${Date.now()}.json`);
            }
            catch (error) {
                console.error('Export failed:', error);
                alert('Échec de l\'export des analytics');
            }
        });
    }
    /**
     * Destroy all Chart.js instances
     */
    destroyCharts() {
        this.charts.forEach(chart => {
            try {
                chart.destroy();
            }
            catch (e) {
                // Ignore errors
            }
        });
        this.charts = [];
    }
    /**
     * Helper: Truncate text
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength)
            return text;
        return text.substring(0, maxLength - 3) + '...';
    }
    /**
     * Helper: Get streak encouragement message
     */
    getStreakEncouragement(streak) {
        if (streak >= 30)
            return '🏆 Incroyable ! 30+ jours consécutifs !';
        if (streak >= 14)
            return '🔥 Excellente série ! Continuez !';
        if (streak >= 7)
            return '💪 Super ! Une semaine de suite !';
        if (streak >= 3)
            return '👍 Bon départ ! Continuez !';
        return '🌱 C\'est un début ! Gardez le rythme !';
    }
    /**
     * Helper: Download JSON file
     */
    downloadJSON(json, filename) {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}
