/**
 * DAILYLIFE (Project Mirror) — UI Rendering & View Router
 * Authentication gateway, Netflix intro animation trigger, 6 Life Pillars HUD, and Career Tree.
 */

class UIRenderer {
  constructor() {
    this.currentQuestFilter = 'all';
    this.authTab = 'login'; // 'login' or 'register'
  }

  // Master Render Loop
  render(state) {
    const isAuth = window.Auth && window.Auth.isAuthenticated();
    const authGateway = document.getElementById('auth-gateway');
    const appDashboard = document.getElementById('app-dashboard');

    // Apply Active Theme Mode ('dark' or 'light')
    const activeTheme = state?.themeMode || 'dark';
    document.documentElement.setAttribute('data-theme', activeTheme);

    if (!isAuth) {
      if (authGateway) authGateway.classList.remove('hidden');
      if (appDashboard) appDashboard.classList.add('hidden');
      this.renderAuthGateway();
      return;
    }

    if (authGateway) authGateway.classList.add('hidden');
    if (appDashboard) appDashboard.classList.remove('hidden');

    this.renderHeader(state);
    this.renderCareerHero(state);
    this.renderPillarsHUD(state);
    this.renderProfileSidebar(state);
    this.renderQuestsFeed(state);
    this.renderParalysisModal();
  }

  /**
   * Render Auth Gateway (Login / Register View)
   */
  renderAuthGateway() {
    const container = document.getElementById('auth-card-body');
    if (!container) return;

    const careerOptions = window.CAREER_TRACKS.map(t => 
      `<option value="${escapeHTML(t.name)}">${escapeHTML(t.name)}</option>`
    ).join('');

    if (this.authTab === 'login') {
      container.innerHTML = `
        <form id="login-form" class="auth-form">
          <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" id="login-username" class="form-input" placeholder="e.g. arpita" required autocomplete="username" value="arpita">
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="login-password" class="form-input" placeholder="Enter password" required autocomplete="current-password" value="123">
          </div>
          <button type="submit" class="auth-submit-btn">Enter Reality Mirror →</button>
          <p class="auth-hint">Demo account pre-filled. New user? Click <strong>Create Account</strong> above.</p>
        </form>
      `;
    } else {
      container.innerHTML = `
        <form id="register-form" class="auth-form">
          <div class="form-group">
            <label class="form-label">Your Name</label>
            <input type="text" id="reg-fullname" class="form-input" placeholder="e.g. Arpita" required>
          </div>
          <div class="form-group">
            <label class="form-label">Choose Username</label>
            <input type="text" id="reg-username" class="form-input" placeholder="e.g. arpita" required autocomplete="username">
          </div>
          <div class="form-group">
            <label class="form-label">Choose Password</label>
            <input type="password" id="reg-password" class="form-input" placeholder="At least 3 characters" required autocomplete="new-password">
          </div>
          <div class="form-group">
            <label class="form-label">Dream Career / Life Ambition</label>
            <select id="reg-careertrack" class="form-select">
              ${careerOptions}
            </select>
          </div>
          <button type="submit" class="auth-submit-btn">Begin Life RPG Journey →</button>
          <p class="auth-hint">All your progress, habits, and XP are securely preserved per-account.</p>
        </form>
      `;
    }

    // Update Tab styling
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === this.authTab);
    });
  }

  /**
   * Render Top Header
   */
  renderHeader(state) {
    const user = window.Auth.getCurrentUser();
    const nameEl = document.getElementById('header-user-name');
    const streakEl = document.getElementById('streak-count');
    const currencyEl = document.getElementById('currency-count');
    const themeIconDark = document.getElementById('theme-icon-dark');
    const themeIconLight = document.getElementById('theme-icon-light');
    const soundOnIcon = document.getElementById('sound-icon-on');
    const soundOffIcon = document.getElementById('sound-icon-off');

    if (nameEl && user) nameEl.textContent = user.fullName || user.username;
    if (streakEl) streakEl.textContent = state.streak;
    if (currencyEl) currencyEl.textContent = state.currency;

    // Theme icon toggle
    if (themeIconDark && themeIconLight) {
      if (state.themeMode === 'dark') {
        themeIconDark.classList.add('hidden');
        themeIconLight.classList.remove('hidden');
      } else {
        themeIconDark.classList.remove('hidden');
        themeIconLight.classList.add('hidden');
      }
    }

    // Sound icon toggle
    if (soundOnIcon && soundOffIcon) {
      if (state.soundEnabled) {
        soundOnIcon.classList.remove('hidden');
        soundOffIcon.classList.add('hidden');
      } else {
        soundOnIcon.classList.add('hidden');
        soundOffIcon.classList.remove('hidden');
      }
    }
  }

  /**
   * Render Career Track & Life Ambition Hero Banner
   */
  renderCareerHero(state) {
    const trackBadge = document.getElementById('hero-career-track');
    const goalQuote = document.getElementById('hero-life-goal');

    if (trackBadge) trackBadge.textContent = state.careerTrack || 'Software Engineer & Builder';
    const goalText = (state.lifeGoal && state.lifeGoal !== 'undefined')
      ? state.lifeGoal 
      : 'Master full-stack engineering, ship real-world tools, and cultivate calm presence.';
    if (goalQuote) goalQuote.textContent = `"${goalText}"`;
  }

  /**
   * Render The 6 Life Pillars HUD
   */
  renderPillarsHUD(state) {
    const container = document.getElementById('pillars-hud');
    if (!container) return;

    const { points, maxTargets } = window.AppStore.getPillarStats();
    const pillarList = Object.values(window.PILLARS);

    container.innerHTML = pillarList.map(p => {
      const earned = points[p.key] || 0;
      const target = maxTargets[p.key] || 50;
      const percent = Math.min(100, Math.round((earned / target) * 100));
      const fillClass = `fill-${p.key.toLowerCase()}`;

      return `
        <div class="pillar-card" title="${p.name}: ${earned} / ${target} Points">
          <div class="pillar-top-row">
            <span class="pillar-icon">${p.icon}</span>
            <span class="pillar-points">${earned}</span>
          </div>
          <span class="pillar-name">${p.name}</span>
          <div class="pillar-bar-track">
            <div class="pillar-bar-fill ${fillClass}" style="width: ${percent}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Render Profile Sidebar: Reality Mirror & Career Progression Tree
   */
  renderProfileSidebar(state) {
    if (!state) return;

    const level = window.AppStore.getLevel();
    const progressXP = window.AppStore.getLevelProgressXP();
    const reqXP = window.AppStore.getLevelReqXP();
    const progressPercent = window.AppStore.getLevelProgressPercent();
    const rankTitle = window.AppStore.getRankTitle();

    // 1. Reality Mirror Avatar & Identity
    const avatarImg = document.getElementById('profile-avatar-img');
    const userFullname = document.getElementById('profile-user-fullname');
    const rankEl = document.getElementById('profile-rank-title');
    const streakTag = document.getElementById('profile-streak-tag');
    const coinsTag = document.getElementById('profile-coins-tag');
    const avatarLvlBadge = document.getElementById('profile-avatar-lvl-badge');

    const username = state.username || 'arpita';
    if (avatarImg) {
      avatarImg.src = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(username)}`;
      avatarImg.alt = `${escapeHTML(state.fullName || username)} Avatar`;
      avatarImg.onerror = function() {
        this.onerror = null;
        this.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%236366f1"/><text x="50" y="58" font-size="34" font-family="sans-serif" text-anchor="middle" fill="white">🪞</text></svg>`;
      };
    }
    if (avatarLvlBadge) avatarLvlBadge.textContent = `Lv. ${level}`;
    if (userFullname) userFullname.textContent = state.fullName || username;
    if (rankEl) rankEl.textContent = rankTitle;
    if (streakTag) streakTag.textContent = state.streak || 1;
    if (coinsTag) coinsTag.textContent = state.currency || 20;

    // 2. Non-Linear XP Bar ($XP_{req} = 100 \times L^{1.5}$)
    const levelTitle = document.getElementById('profile-level-title');
    const xpReadout = document.getElementById('profile-xp-readout');
    const xpFill = document.getElementById('profile-xp-fill');
    const xpPercent = document.getElementById('profile-xp-percent');

    if (levelTitle) levelTitle.textContent = `Level ${level}`;
    if (xpReadout) xpReadout.textContent = `${progressXP} / ${reqXP} XP`;
    if (xpFill) xpFill.style.width = `${progressPercent}%`;
    if (xpPercent) xpPercent.textContent = `${progressPercent}%`;

    // 3. Interactive 6 Pillar Stat Matrix
    const pillarGrid = document.getElementById('profile-pillar-stat-grid');
    if (pillarGrid) {
      const { points, pillarLevels, pillarProgress } = window.AppStore.getPillarStats();
      const pillars = Object.values(window.PILLARS);

      pillarGrid.innerHTML = pillars.map(p => {
        const pts = points[p.key] || 0;
        const lvl = (pillarLevels && pillarLevels[p.key]) || 1;
        const prog = (pillarProgress && pillarProgress[p.key]) || 0;

        return `
          <div class="pillar-mini-card" 
               style="--pillar-accent:${p.color};" 
               data-pillar="${p.key}" 
               title="${p.name}: ${pts} Points • Level ${lvl}"
               role="button"
               tabindex="0"
          >
            <div class="pillar-mini-top">
              <span class="pillar-mini-icon">${p.icon}</span>
              <span class="pillar-mini-lvl">Lv. ${lvl}</span>
            </div>
            <div class="pillar-mini-name">${p.name.split('&')[0].trim()}</div>
            <div class="pillar-mini-bar-track">
              <div class="pillar-mini-bar-fill" style="width:${prog}%; background:${p.color};"></div>
            </div>
            <div class="pillar-mini-pts">${pts} pts</div>
          </div>
        `;
      }).join('');
    }

    // 4. Dream Career & Skill Mastery Trees
    const trackSelect = document.getElementById('career-track-select');
    if (trackSelect && state.careerTrack) {
      trackSelect.value = state.careerTrack;
    }

    const careerTreeContainer = document.getElementById('career-tree-container');
    const completedBadge = document.getElementById('career-completed-badge');
    const careerTree = state.careerTree || [];

    let totalMilestones = 0;
    let completedMilestones = 0;

    careerTree.forEach(tier => {
      (tier.milestones || []).forEach(m => {
        totalMilestones++;
        if (m.completed) completedMilestones++;
      });
    });

    if (completedBadge) {
      completedBadge.textContent = `${completedMilestones}/${totalMilestones} Done`;
    }

    if (careerTreeContainer) {
      careerTreeContainer.innerHTML = careerTree.map(tier => {
        const tierCompleted = (tier.milestones || []).length > 0 && (tier.milestones || []).every(m => m.completed);
        const tierDoneCount = (tier.milestones || []).filter(m => m.completed).length;

        return `
          <div class="tree-tier-card ${tierCompleted ? 'is-tier-completed' : ''}" data-tier-id="${tier.tierId}">
            <div class="tier-card-header">
              <div class="tier-title-row">
                <span class="tier-number-badge">T${tier.tierId}</span>
                <div>
                  <h4 class="tier-name">${escapeHTML(tier.tierName)}</h4>
                  <p class="tier-subtitle">${escapeHTML(tier.subtitle)}</p>
                </div>
              </div>
              <span class="tier-status-pill ${tierCompleted ? 'pill-completed' : ''}">${tierDoneCount}/${(tier.milestones || []).length}</span>
            </div>

            <div class="tier-milestones-list">
              ${(tier.milestones || []).map(m => {
                const isDone = m.completed;
                return `
                  <div class="milestone-item ${isDone ? 'is-completed' : ''}" data-milestone-id="${m.id}">
                    <button 
                      type="button" 
                      class="milestone-checkbox ${isDone ? 'checked' : ''}" 
                      role="checkbox" 
                      aria-checked="${isDone}" 
                      data-action="toggle-career-milestone" 
                      data-milestone-id="${m.id}"
                      aria-label="Mark milestone ${escapeHTML(m.title)} as ${isDone ? 'incomplete' : 'complete'}"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </button>

                    <div class="milestone-content">
                      <h5 class="milestone-title">${escapeHTML(m.title)}</h5>
                      <p class="milestone-desc">${escapeHTML(m.desc)}</p>
                      <div class="milestone-rewards">
                        <span class="reward-chip chip-craft">+${m.craftXP || 0} Craft</span>
                        <span class="reward-chip chip-disc">+${m.discXP || 0} Disc</span>
                        <span class="reward-chip chip-coin">+${m.coins || 0} 🪙</span>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }).join('');
    }

    // 5. Relationship Bonds System (Mom, Dad, Partner)
    const bondsContainer = document.getElementById('relationship-bonds-list');
    if (bondsContainer && state.relationshipBonds) {
      bondsContainer.innerHTML = state.relationshipBonds.map(b => `
        <div class="bond-card" title="${escapeHTML(b.note)}">
          <div class="bond-header">
            <span class="bond-name">${escapeHTML(b.name)} <small style="color:var(--text-muted);">(${escapeHTML(b.role)})</small></span>
            <span class="bond-status" style="color:${b.statusColor}; border:1px solid ${b.statusColor};">${b.status} (${b.trust}%)</span>
          </div>
          <div class="bond-trust-track">
            <div class="bond-trust-fill" style="width:${b.trust}%;"></div>
          </div>
        </div>
      `).join('');
    }
  }

  /**
   * Render Quests Feed with filters
   */
  renderQuestsFeed(state) {
    const container = document.getElementById('quests-feed-container');
    const countAll = document.getElementById('filter-count-all');
    const countRoutine = document.getElementById('filter-count-routine');
    const countCareer = document.getElementById('filter-count-career');
    const countFamily = document.getElementById('filter-count-family');
    const countJoy = document.getElementById('filter-count-joy');
    const countCompleted = document.getElementById('filter-count-completed');

    if (!container) return;

    const quests = state.quests || [];
    if (countAll) countAll.textContent = quests.length;
    if (countRoutine) countRoutine.textContent = quests.filter(q => q.category === 'routine').length;
    if (countCareer) countCareer.textContent = quests.filter(q => q.category === 'career').length;
    if (countFamily) countFamily.textContent = quests.filter(q => q.category === 'family').length;
    if (countJoy) countJoy.textContent = quests.filter(q => q.category === 'joy').length;
    if (countCompleted) countCompleted.textContent = quests.filter(q => q.completed).length;

    // Filter quests
    let filtered = quests;
    if (this.currentQuestFilter === 'routine') filtered = quests.filter(q => q.category === 'routine');
    else if (this.currentQuestFilter === 'career') filtered = quests.filter(q => q.category === 'career');
    else if (this.currentQuestFilter === 'family') filtered = quests.filter(q => q.category === 'family');
    else if (this.currentQuestFilter === 'joy') filtered = quests.filter(q => q.category === 'joy');
    else if (this.currentQuestFilter === 'completed') filtered = quests.filter(q => q.completed);

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
          <p>No quests in this section right now. Add one or generate an AI blueprint!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(q => this.buildQuestCardHtml(q)).join('');
  }

  buildQuestCardHtml(quest) {
    const isDone = quest.completed;
    const pillarData = window.PILLARS[quest.pillar] || window.PILLARS.Craft;
    const badgeClass = `badge-${quest.pillar.toLowerCase()}`;

    return `
      <article class="quest-card ${isDone ? 'is-completed' : ''}" data-quest-id="${quest.id}">
        <div class="quest-left-flow">
          <button 
            type="button" 
            class="quest-checkbox" 
            role="checkbox" 
            aria-checked="${isDone}" 
            data-action="toggle-quest" 
            data-quest-id="${quest.id}"
            aria-label="Mark ${escapeHTML(quest.title)} as ${isDone ? 'incomplete' : 'complete'}"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
          
          <div>
            <div class="quest-meta-row">
              <span class="quest-time-tag">${escapeHTML(quest.time)}</span>
              <span class="pillar-badge ${badgeClass}">${pillarData.icon} ${pillarData.name}</span>
            </div>
            <h3 class="quest-title">${escapeHTML(quest.title)}</h3>
            <p class="quest-note">${escapeHTML(quest.note)}</p>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:8px;">
          <span class="reward-chip chip-xp">+${quest.xp} XP</span>
          <span class="reward-chip chip-coin">+${quest.coins} 🪙</span>
        </div>
      </article>
    `;
  }

  // Render 2-minute Paralysis Breaker micro-quests modal
  renderParalysisModal() {
    const container = document.getElementById('paralysis-items-container');
    if (!container) return;

    container.innerHTML = window.PARALYSIS_MICRO_QUESTS.map(m => `
      <div class="micro-quest-item">
        <div>
          <span style="font-size:0.75rem; color:var(--pillar-craft); font-weight:700;">⏱️ ${m.duration} • 2-Minute Rule</span>
          <h4 style="font-size:0.95rem; font-weight:600; margin:3px 0;">${escapeHTML(m.title)}</h4>
          <p style="font-size:0.775rem; color:var(--text-secondary);">${escapeHTML(m.note)}</p>
        </div>
        <button class="pill-btn primary-btn" data-action="do-micro-quest" data-micro-id="${m.id}">Crack It (+${m.xp} XP)</button>
      </div>
    `).join('');
  }

  setQuestFilter(filterKey) {
    this.currentQuestFilter = filterKey;
    document.querySelectorAll('.filter-tab').forEach(b => {
      b.classList.toggle('active', b.dataset.filter === filterKey);
    });
    this.renderQuestsFeed(window.AppStore.state);
  }

  setAuthTab(tab) {
    this.authTab = tab;
    this.renderAuthGateway();
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.UI = new UIRenderer();
