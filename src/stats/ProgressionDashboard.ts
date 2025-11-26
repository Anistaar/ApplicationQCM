/**
 * ProgressionDashboard — Interface de visualisation de la progression ELO
 * 
 * Affiche:
 * - Rang actuel avec icône
 * - Progression par thème (radar chart)
 * - Top 3 thèmes forts/faibles
 * - Achievements débloqués
 * - Prédiction de réussite
 */

import { eloSystem, ELO_RANKS, type ThemeElo, type UserProgress } from './EloProgressionSystem';
import type { Question } from '../types';

export class ProgressionDashboard {
  /**
   * Rendre le dashboard complet
   */
  async render(container: HTMLElement, allQuestions: Question[]): Promise<void> {
    const progress = await eloSystem.loadProgress();

    container.innerHTML = '';
    container.className = 'progression-dashboard';

    // Header avec rang global
    const header = this.renderHeader(progress);
    container.appendChild(header);

    // Stats rapides
    const quickStats = this.renderQuickStats(progress);
    container.appendChild(quickStats);

    // Graphique radar par thème
    const radarSection = await this.renderThemeRadar(progress);
    container.appendChild(radarSection);

    // Top thèmes forts/faibles
    const themesSection = await this.renderTopThemes();
    container.appendChild(themesSection);

    // Prédiction de réussite
    const predictionSection = await this.renderPredictions(progress);
    container.appendChild(predictionSection);

    // Achievements
    const achievementsSection = this.renderAchievements(progress);
    container.appendChild(achievementsSection);

    // Recommandations
    const recoSection = await this.renderRecommendations(progress, allQuestions);
    container.appendChild(recoSection);
  }

  /**
   * Header avec rang et ELO global
   */
  private renderHeader(progress: UserProgress): HTMLElement {
    const header = document.createElement('div');
    header.className = 'dashboard-header';

    const rank = eloSystem.getRank(progress.globalElo);
    const nextRank = ELO_RANKS.find(r => r.min > progress.globalElo);

    const eloToNext = nextRank ? nextRank.min - progress.globalElo : 0;
    const progressPct = nextRank 
      ? ((progress.globalElo - rank.min) / (nextRank.min - rank.min)) * 100 
      : 100;

    header.innerHTML = `
      <div class="rank-badge" style="background: linear-gradient(135deg, ${rank.color}22, ${rank.color}44);">
        <div class="rank-icon">${rank.icon}</div>
        <div class="rank-info">
          <h2 class="rank-name">${rank.name}</h2>
          <div class="elo-value">${Math.round(progress.globalElo)} ELO</div>
        </div>
      </div>
      ${nextRank ? `
        <div class="rank-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPct}%; background: ${rank.color};"></div>
          </div>
          <div class="progress-text">
            ${eloToNext > 0 ? `+${eloToNext} ELO jusqu'à ${nextRank.name} ${nextRank.icon}` : 'Maximum atteint !'}
          </div>
        </div>
      ` : '<div class="rank-maxed">🏆 Rang maximum atteint !</div>'}
    `;

    return header;
  }

  /**
   * Stats rapides (parties jouées, winrate, temps total)
   */
  private renderQuickStats(progress: UserProgress): HTMLElement {
    const section = document.createElement('div');
    section.className = 'quick-stats';

    const totalWins = Object.values(progress.themes).reduce((sum, t) => sum + t.wins, 0);
    const winRate = progress.totalMatches > 0 ? (totalWins / progress.totalMatches) * 100 : 0;

    const bestStreak = Math.max(...Object.values(progress.themes).map(t => t.bestStreak), 0);
    const currentStreak = Math.max(...Object.values(progress.themes).map(t => t.streak), 0);

    section.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-value">${progress.totalMatches}</div>
        <div class="stat-label">Parties jouées</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-value">${winRate.toFixed(1)}%</div>
        <div class="stat-label">Taux de réussite</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-value">${currentStreak}</div>
        <div class="stat-label">Série actuelle</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-value">${bestStreak}</div>
        <div class="stat-label">Meilleure série</div>
      </div>
    `;

    return section;
  }

  /**
   * Graphique radar des thèmes (version texte pour l'instant)
   */
  private async renderThemeRadar(progress: UserProgress): Promise<HTMLElement> {
    const section = document.createElement('div');
    section.className = 'theme-radar-section';

    const themes = Object.values(progress.themes)
      .filter(t => t.matches >= 3) // Minimum 3 parties
      .sort((a, b) => b.matches - a.matches)
      .slice(0, 8); // Top 8 thèmes

    if (themes.length === 0) {
      section.innerHTML = `
        <h3>📊 Progression par thème</h3>
        <p class="empty-state">Jouez quelques parties pour voir votre progression par thème.</p>
      `;
      return section;
    }

    section.innerHTML = `
      <h3>📊 Progression par thème</h3>
      <div class="theme-bars">
        ${themes.map(theme => {
          const rank = eloSystem.getRank(theme.elo);
          const winRate = (theme.wins / theme.matches) * 100;
          const barWidth = Math.min(100, (theme.elo / 2400) * 100);

          return `
            <div class="theme-bar-row">
              <div class="theme-name">${theme.theme}</div>
              <div class="theme-bar-container">
                <div class="theme-bar" style="width: ${barWidth}%; background: ${rank.color};">
                  <span class="theme-bar-label">${Math.round(theme.elo)} ${rank.icon}</span>
                </div>
              </div>
              <div class="theme-stats">${winRate.toFixed(0)}% (${theme.matches})</div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    return section;
  }

  /**
   * Top 3 thèmes forts et faibles
   */
  private async renderTopThemes(): Promise<HTMLElement> {
    const section = document.createElement('div');
    section.className = 'top-themes-section';

    const strongest = await eloSystem.getStrongestThemes(3);
    const weakest = await eloSystem.getWeakestThemes(3);

    section.innerHTML = `
      <div class="themes-columns">
        <div class="themes-column">
          <h3>💪 Thèmes maîtrisés</h3>
          ${strongest.length > 0 ? `
            <ul class="theme-list">
              ${strongest.map(t => `
                <li class="theme-item theme-strong">
                  <span class="theme-emoji">🏆</span>
                  <span class="theme-name">${t.theme}</span>
                  <span class="theme-elo">${Math.round(t.elo)}</span>
                </li>
              `).join('')}
            </ul>
          ` : '<p class="empty-state">Continuez à jouer pour identifier vos points forts.</p>'}
        </div>
        <div class="themes-column">
          <h3>📚 À renforcer</h3>
          ${weakest.length > 0 ? `
            <ul class="theme-list">
              ${weakest.map(t => `
                <li class="theme-item theme-weak">
                  <span class="theme-emoji">📖</span>
                  <span class="theme-name">${t.theme}</span>
                  <span class="theme-elo">${Math.round(t.elo)}</span>
                </li>
              `).join('')}
            </ul>
          ` : '<p class="empty-state">Aucun point faible détecté !</p>'}
        </div>
      </div>
    `;

    return section;
  }

  /**
   * Prédictions de réussite par thème
   */
  private async renderPredictions(progress: UserProgress): Promise<HTMLElement> {
    const section = document.createElement('div');
    section.className = 'predictions-section';

    const themes = Object.keys(progress.themes).slice(0, 5);
    if (themes.length === 0) {
      section.innerHTML = `
        <h3>🔮 Prédictions</h3>
        <p class="empty-state">Pas encore de données pour prédiction.</p>
      `;
      return section;
    }

    const predictions = await Promise.all(
      themes.map(async theme => ({
        theme,
        probability: await eloSystem.predictSuccessRate(theme),
      }))
    );

    section.innerHTML = `
      <h3>🔮 Probabilité de réussite</h3>
      <div class="prediction-list">
        ${predictions.map(pred => {
          const pct = pred.probability * 100;
          const color = pct >= 75 ? '#4CAF50' : pct >= 50 ? '#FF9800' : '#f44336';
          
          return `
            <div class="prediction-item">
              <div class="prediction-theme">${pred.theme}</div>
              <div class="prediction-bar-container">
                <div class="prediction-bar" style="width: ${pct}%; background: ${color};">
                  <span class="prediction-pct">${pct.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    return section;
  }

  /**
   * Achievements débloqués
   */
  private renderAchievements(progress: UserProgress): HTMLElement {
    const section = document.createElement('div');
    section.className = 'achievements-section';

    const achievementLabels: Record<string, { icon: string; name: string }> = {
      'first_steps': { icon: '🌱', name: 'Premiers pas (10 parties)' },
      'centurion': { icon: '💯', name: 'Centurion (100 parties)' },
    };

    const unlocked = progress.achievements.map(a => achievementLabels[a]).filter(Boolean);

    section.innerHTML = `
      <h3>🏅 Achievements</h3>
      ${unlocked.length > 0 ? `
        <div class="achievement-list">
          ${unlocked.map(ach => `
            <div class="achievement-badge">
              <div class="achievement-icon">${ach.icon}</div>
              <div class="achievement-name">${ach.name}</div>
            </div>
          `).join('')}
        </div>
      ` : '<p class="empty-state">Jouez pour débloquer des achievements.</p>'}
    `;

    return section;
  }

  /**
   * Recommandations personnalisées
   */
  private async renderRecommendations(progress: UserProgress, allQuestions: Question[]): Promise<HTMLElement> {
    const section = document.createElement('div');
    section.className = 'recommendations-section';

    const weakest = await eloSystem.getWeakestThemes(1);
    
    if (weakest.length === 0 || progress.totalMatches < 10) {
      section.innerHTML = `
        <h3>💡 Recommandations</h3>
        <p class="empty-state">Jouez au moins 10 parties pour obtenir des recommandations personnalisées.</p>
      `;
      return section;
    }

    const weakTheme = weakest[0];
    const successRate = await eloSystem.predictSuccessRate(weakTheme.theme);
    const questionsRemaining = allQuestions.filter(q => 
      (q.tags || q.topics || []).includes(weakTheme.theme)
    ).length;

    const hoursNeeded = Math.ceil((2000 - weakTheme.elo) / 50); // ~50 ELO/heure estimé

    section.innerHTML = `
      <h3>💡 Recommandations</h3>
      <div class="recommendation-card">
        <div class="reco-icon">🎯</div>
        <div class="reco-content">
          <h4>Focus sur : ${weakTheme.theme}</h4>
          <p>Votre niveau actuel : ${Math.round(weakTheme.elo)} ELO (${(successRate * 100).toFixed(0)}% réussite)</p>
          <p>Objectif maîtrise : 2000 ELO</p>
          <p>📚 ${questionsRemaining} questions disponibles</p>
          <p>⏱️ Temps estimé : ~${hoursNeeded}h de pratique</p>
          <button class="start-practice-btn" data-theme="${weakTheme.theme}">
            Commencer l'entraînement
          </button>
        </div>
      </div>
    `;

    // Ajouter event listener
    const btn = section.querySelector('.start-practice-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        const theme = (e.target as HTMLElement).dataset.theme;
        this.startThemePractice(theme!, allQuestions);
      });
    }

    return section;
  }

  /**
   * Lancer pratique ciblée sur un thème
   */
  private async startThemePractice(theme: string, allQuestions: Question[]): Promise<void> {
    // Trouver les questions du thème
    const themeQuestions = allQuestions.filter(q => 
      (q.tags || q.topics || []).includes(theme)
    );

    if (themeQuestions.length === 0) {
      alert(`Aucune question trouvée pour le thème "${theme}".`);
      return;
    }

    // Sélectionner une question adaptée au niveau
    const selected = await eloSystem.selectMatchedQuestion(themeQuestions, theme);
    
    if (selected) {
      // Déclencher l'événement pour charger la question
      window.dispatchEvent(new CustomEvent('startThemePractice', {
        detail: { theme, questions: themeQuestions, selectedQuestion: selected }
      }));
    }
  }

  /**
   * Afficher notification de changement de rang
   */
  static showRankUpNotification(from: string, to: string): void {
    const notification = document.createElement('div');
    notification.className = 'rank-notification';
    
    const toRank = ELO_RANKS.find(r => r.name === to);
    
    notification.innerHTML = `
      <div class="rank-notification-content" style="background: ${toRank?.color}22; border-color: ${toRank?.color};">
        <div class="rank-notification-icon">${toRank?.icon}</div>
        <div class="rank-notification-text">
          <h3>Promotion !</h3>
          <p>Vous êtes maintenant <strong>${to}</strong> !</p>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Animation et suppression
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }
}
