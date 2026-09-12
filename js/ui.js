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
    this.renderBondsDashboard(state);
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

    // Honorable Archive Drawer
    this.renderHonorableArchive(state);

    // 5. Relationship Bonds System (Mom, Dad, Partner)
    const bondsContainer = document.getElementById('relationship-bonds-list');
    if (bondsContainer && state.relationshipBonds) {
      bondsContainer.innerHTML = state.relationshipBonds.map(b => `
        <div class="bond-card" title="${escapeHTML(b.dynamic || b.note || '')}" data-bond-id="${b.id}">
          <div class="bond-header">
            <span class="bond-name">${escapeHTML(b.name)} <small style="color:var(--text-muted);">(${escapeHTML(b.role)})</small></span>
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="patience-streak-mini" title="Patience Streak">🔥 ${b.patienceStreak || 0}d</span>
              <span class="bond-status" style="color:${b.statusColor || '#10B981'}; border:1px solid ${b.statusColor || '#10B981'};">${b.status} (${b.trust}%)</span>
            </div>
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
    if (countFamily) countFamily.textContent = (state.relationshipBonds && state.relationshipBonds.length > 0) ? state.relationshipBonds.length : quests.filter(q => q.category === 'family').length;
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

    const microQuests = window.PARALYSIS_MICRO_QUESTS || [];
    const completedIds = (window.AppStore?.state?.completedMicroQuests || []).map(m => m.id);

    container.innerHTML = `
      <div class="paralysis-modal-intro">
        <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.45;">
          When executive function feels blocked, do not force a massive sprint. 
          Pick <strong>just one</strong> micro-action below to lower activation energy to zero and break the freeze state.
        </p>
      </div>

      <div class="micro-quests-stack">
        ${microQuests.map(m => {
          const isDone = completedIds.includes(m.id);
          const pillarData = (window.PILLARS && window.PILLARS[m.pillar]) || { name: m.pillar, color: '#6366F1', icon: '⚡' };
          return `
            <div class="micro-quest-card ${isDone ? 'is-completed' : ''}" data-micro-id="${m.id}">
              <div class="micro-quest-left">
                <span class="micro-quest-icon">${m.icon || '⚡'}</span>
                <div>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span class="micro-duration-badge">⏱️ ${m.duration}</span>
                    <span class="micro-pillar-badge" style="color:${pillarData.color}; border-color:${pillarData.color};">${pillarData.icon} +10 ${m.pillar} XP</span>
                  </div>
                  <h4 class="micro-quest-title">${escapeHTML(m.title)}</h4>
                  <p class="micro-quest-note">${escapeHTML(m.note)}</p>
                </div>
              </div>
              <button 
                type="button" 
                class="pill-btn primary-btn micro-action-btn" 
                data-action="do-micro-quest" 
                data-micro-id="${m.id}"
                style="background:${pillarData.color}; border-color:${pillarData.color};"
              >
                ${isDone ? '✓ Completed' : 'Crack It (+10 XP) →'}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // Render The Crossroads Decision Matrix (3-Stage Life Fork)
  renderCrossroadsModal(stage = 1) {
    this.crossroadsStage = stage;
    const container = document.getElementById('crossroads-stage-container');
    if (!container) return;

    // Update Stepper
    for (let i = 1; i <= 3; i++) {
      const ind = document.getElementById(`step-ind-${i}`);
      if (ind) {
        ind.classList.toggle('active', i === stage);
        ind.classList.toggle('completed', i < stage);
      }
    }

    const state = window.AppStore.state;
    const currentTrack = state.careerTrack || 'Software Engineer & Builder';

    if (stage === 1) {
      // Stage 1: Compassionate Pause
      container.innerHTML = `
        <div class="crossroads-stage-view" data-stage="1">
          <div class="compassionate-pause-card">
            <div style="display:flex; align-items:center; gap:14px;">
              <span class="pause-icon-badge">🛑</span>
              <div>
                <h4 style="font-family:var(--font-serif); font-size:1.25rem; font-weight:700;">Never Quit on a Bad Day</h4>
                <p style="font-size:0.825rem; color:var(--text-secondary); margin-top:3px; line-height:1.4;">
                  Low sleep, high stress, and temporary dopamine depletion distort reality. Before an irreversible decision, honor your physiological needs first.
                </p>
              </div>
            </div>
            <div class="pause-question-box">
              <span class="pause-question-label">Honest Self-Inquiry</span>
              <p class="pause-question-text">
                "Is this desire to quit caused by <strong>temporary nervous system exhaustion</strong>, or is it a true, foundational <strong>values mismatch</strong>?"
              </p>
            </div>
          </div>

          <div class="crossroads-stage-actions">
            <button type="button" class="pill-btn rest-day-btn" data-action="take-rest-day">
              <span>🛌</span> Take an Earned Rest Day (+15 Calm XP)
            </button>
            <button type="button" class="pill-btn primary-btn" data-action="crossroads-goto-stage" data-stage="2">
              Examine Trade-Off Matrix ➔
            </button>
          </div>
        </div>
      `;
    } else if (stage === 2) {
      // Stage 2: Realistic Trade-Off Matrix
      container.innerHTML = `
        <div class="crossroads-stage-view" data-stage="2">
          <div class="tradeoff-matrix-grid">
            
            <!-- Path A: Stay the Course -->
            <div class="tradeoff-card path-stay">
              <div class="tradeoff-card-header">
                <span class="tradeoff-path-tag tag-stay">Path A</span>
                <span class="tradeoff-prob-badge">65% – 80% Breakthrough Rate</span>
              </div>
              <h4 class="tradeoff-title">🧗‍♂️ Stay the Course</h4>
              <p class="tradeoff-subtitle">Continue on: <strong>${escapeHTML(currentTrack)}</strong></p>
              
              <ul class="tradeoff-bullet-list">
                <li>
                  <strong>Neuroplasticity Friction:</strong> The dip before mastery feels painful, but it is the physical rewiring of neural circuits.
                </li>
                <li>
                  <strong>Statistical Reality:</strong> 6 more weeks of small, consistent effort yields exponential compounding and unexpected momentum.
                </li>
                <li>
                  <strong>Low-Friction Compromise:</strong> Lower your daily minimum bar to 20 minutes instead of abandoning the tree.
                </li>
              </ul>

              <div class="tradeoff-cost-box">
                <small>Short-Term Friction:</small>
                <span>Enduring discomfort & protecting focus boundaries against distractions.</span>
              </div>
            </div>

            <!-- Path B: Pivot to a New Path -->
            <div class="tradeoff-card path-pivot">
              <div class="tradeoff-card-header">
                <span class="tradeoff-path-tag tag-pivot">Path B</span>
                <span class="tradeoff-prob-badge badge-pivot">Frees ~8 Hours / Week</span>
              </div>
              <h4 class="tradeoff-title">🧭 Pivot with Honor</h4>
              <p class="tradeoff-subtitle">Choose a new, more aligned life ambition</p>
              
              <ul class="tradeoff-bullet-list">
                <li>
                  <strong>Sunk Cost Honored:</strong> Zero shame. Sunk cost fallacy drains life energy. Pivoting with conscious intention is wisdom, not failure.
                </li>
                <li>
                  <strong>Wisdom Conversion:</strong> Past effort is permanently converted into <strong>Wisdom & Self-Awareness XP</strong>.
                </li>
                <li>
                  <strong>Honorable Archive:</strong> Your journey in ${escapeHTML(currentTrack)} is enshrined with dignity in your personal archive.
                </li>
              </ul>

              <div class="tradeoff-cost-box">
                <small>Short-Term Friction:</small>
                <span>Starting anew on Tier 1 foundations of a different craft.</span>
              </div>
            </div>

          </div>

          <div class="crossroads-stage-actions" style="justify-content:space-between;">
            <button type="button" class="pill-btn" data-action="crossroads-goto-stage" data-stage="1">
              ⬅ Back to Pause
            </button>
            <button type="button" class="pill-btn primary-btn" data-action="crossroads-goto-stage" data-stage="3">
              Make Honest Autonomy Choice ➔
            </button>
          </div>
        </div>
      `;
    } else if (stage === 3) {
      // Stage 3: Autonomy & Honorable Decision
      const otherTracks = (window.CAREER_TRACKS || []).filter(t => t.name !== currentTrack);

      container.innerHTML = `
        <div class="crossroads-stage-view" data-stage="3">
          <div class="autonomy-intro">
            <h4 style="font-family:var(--font-serif); font-size:1.25rem; font-weight:700;">Stage 3: Honest Sovereign Autonomy</h4>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:3px;">
              You are the sovereign author of your life. Neither path is wrong. Make your choice with grounded calm.
            </p>
          </div>

          <div class="autonomy-choices-grid">
            <!-- Choice 1: Stay the Course -->
            <div class="autonomy-choice-box choice-stay">
              <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:2rem;">🧗‍♂️</span>
                <div>
                  <h5 style="font-size:1.05rem; font-weight:700;">I Will Stay the Course</h5>
                  <p style="font-size:0.775rem; color:var(--text-secondary); margin-top:2px;">Renew commitment, lower friction, and push through the dip.</p>
                </div>
              </div>
              <div class="choice-rewards-preview">
                <span class="reward-chip chip-disc">+30 Discipline XP</span>
                <span class="reward-chip chip-coin">+15 🪙 Life Credits</span>
              </div>
              <button type="button" class="pill-btn primary-btn stay-course-btn" data-action="stay-the-course">
                Confirm: Stay the Course ➔
              </button>
            </div>

            <!-- Choice 2: Pivot with Honor -->
            <div class="autonomy-choice-box choice-pivot">
              <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:2rem;">🧭</span>
                <div>
                  <h5 style="font-size:1.05rem; font-weight:700;">Pivot with Honor (Zero Shame)</h5>
                  <p style="font-size:0.775rem; color:var(--text-secondary); margin-top:2px;">Convert past effort to permanent Wisdom XP and archive ambition.</p>
                </div>
              </div>

              <form id="crossroads-pivot-form" style="display:flex; flex-direction:column; gap:10px; margin-top:10px;">
                <div class="form-group">
                  <label class="form-label" style="font-size:0.75rem;">Select New Career Ambition</label>
                  <select id="pivot-new-track" class="form-select" style="font-size:0.825rem; padding:8px 12px;">
                    ${otherTracks.map(t => `<option value="${escapeHTML(t.name)}">${escapeHTML(t.name)}</option>`).join('')}
                    <option value="Custom Ambition">Custom Ambition</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" style="font-size:0.75rem;">Personal Reflection Note</label>
                  <textarea id="pivot-reflection-note" class="form-textarea" rows="2" style="font-size:0.8rem;" placeholder="e.g. Learned deeply about my true strengths; shifting to where my genuine curiosity lives."></textarea>
                </div>

                <div class="choice-rewards-preview">
                  <span class="reward-chip chip-craft">+50+ Wisdom & Self-Awareness XP</span>
                  <span class="reward-chip chip-calm">🏛️ Honorable Archive Enshrined</span>
                </div>

                <button type="submit" class="pill-btn pivot-confirm-btn">
                  Enshrine Archive & Pivot ➔
                </button>
              </form>
            </div>
          </div>

          <div style="margin-top:12px; text-align:left;">
            <button type="button" class="pill-btn" data-action="crossroads-goto-stage" data-stage="2">
              ⬅ Back to Trade-Off Matrix
            </button>
          </div>
        </div>
      `;
    }
  }

  // Render Honorable Archive in Career Ambition section
  renderHonorableArchive(state) {
    const container = document.getElementById('honorable-archive-container');
    if (!container) return;

    const archive = state?.honorableArchive || [];
    if (archive.length === 0) {
      container.classList.add('hidden');
      container.innerHTML = '';
      return;
    }

    container.classList.remove('hidden');
    container.innerHTML = `
      <div class="honorable-archive-card">
        <div class="archive-card-header">
          <div style="display:flex; align-items:center; gap:6px;">
            <span>🏛️</span>
            <span style="font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-secondary);">Honorable Archive</span>
          </div>
          <span class="archive-count-pill">${archive.length} Pivots (Zero Shame)</span>
        </div>
        <div class="archive-items-list">
          ${archive.map(a => `
            <div class="archive-entry">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <h6 style="font-size:0.825rem; font-weight:700; color:var(--text-primary);">${escapeHTML(a.previousTrack)}</h6>
                <span class="wisdom-chip">+${a.wisdomXPAwarded} Wisdom XP</span>
              </div>
              <p style="font-size:0.725rem; font-style:italic; color:var(--text-secondary); margin-top:2px;">"${escapeHTML(a.note)}"</p>
              <div style="font-size:0.65rem; color:var(--text-muted); margin-top:3px;">Archived on ${escapeHTML(a.archivedAt || 'Recently')} • ${a.milestonesCompleted || 0} milestones honored</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render Dedicated Relationship Bonds & Loved Ones Feature Dashboard
   */
  renderBondsDashboard(state) {
    const bondsContainer = document.getElementById('bonds-dashboard-view');
    const addBondBtn = document.getElementById('add-bond-btn');
    const isFamilyFilter = this.currentQuestFilter === 'family';

    if (!bondsContainer) return;

    if (addBondBtn) {
      addBondBtn.classList.toggle('hidden', !isFamilyFilter);
    }

    if (!isFamilyFilter) {
      bondsContainer.classList.add('hidden');
      return;
    }

    bondsContainer.classList.remove('hidden');
    const bonds = (state && state.relationshipBonds) ? state.relationshipBonds : [];

    bondsContainer.innerHTML = `
      <div class="bonds-intro-card">
        <div style="display:flex; align-items:center; gap:14px;">
          <span class="bonds-intro-icon">🤝</span>
          <div>
            <h3 class="bonds-intro-title">Loved Ones & Relational Harmony</h3>
            <p class="bonds-intro-desc">
              Personal growth is not selfish. Leveling up your daily consistency should bring stability, quiet pride, and peace to those you love.
            </p>
          </div>
        </div>
      </div>

      <div class="bonds-grid">
        ${bonds.map(b => {
          const quest = b.deescalationQuest || {
            id: `deesc_${b.id}`,
            title: 'Active Listening & Grounded Empathy',
            desc: 'Offer 15 minutes of uninterrupted, patient attention.',
            completed: false,
            xp: 25,
            coins: 15
          };
          const isQuestDone = quest.completed;
          const recentReflection = (b.reflections && b.reflections.length > 0) ? b.reflections[0] : null;

          return `
            <article class="bond-feature-card" data-bond-id="${b.id}">
              <div class="bond-feature-top">
                <div class="bond-title-group">
                  <span class="bond-avatar-icon">${b.icon || '🤝'}</span>
                  <div>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <h4 class="bond-feature-name">${escapeHTML(b.name)}</h4>
                      <span class="bond-role-badge">${escapeHTML(b.role)}</span>
                    </div>
                    <p class="bond-dynamic-text">"${escapeHTML(b.dynamic)}"</p>
                  </div>
                </div>

                <div class="bond-badges-col">
                  <span class="patience-streak-badge" title="Consecutive days of patient, grounded interaction">
                    <span>🔥</span>
                    <strong>${b.patienceStreak || 0}</strong>
                    <small>day streak</small>
                  </span>
                  <span class="bond-status-chip" style="color:${b.statusColor || '#10B981'}; border-color:${b.statusColor || '#10B981'};">
                    ${escapeHTML(b.status)}
                  </span>
                </div>
              </div>

              <!-- Trust & Harmony Meter (0% to 100%) -->
              <div class="harmony-meter-box">
                <div class="harmony-meter-header">
                  <span class="harmony-label">Trust & Harmony Meter</span>
                  <span class="harmony-percent-readout">${b.trust || 0}%</span>
                </div>
                <div class="harmony-track">
                  <div class="harmony-fill" style="width: ${b.trust || 0}%;"></div>
                </div>
              </div>

              <!-- Actionable De-escalation Quest -->
              <div class="deescalation-box ${isQuestDone ? 'is-completed' : ''}">
                <div class="deescalation-header">
                  <span class="deescalation-tag">⚡ Actionable De-escalation Quest</span>
                  <div style="display:flex; gap:6px;">
                    <span class="reward-chip chip-loved">+${quest.xp || 25} Loved Ones XP</span>
                    <span class="reward-chip chip-coin">+${quest.coins || 15} 🪙</span>
                  </div>
                </div>
                
                <div class="deescalation-flow">
                  <button 
                    type="button" 
                    class="deescalation-checkbox ${isQuestDone ? 'checked' : ''}" 
                    role="checkbox" 
                    aria-checked="${isQuestDone}" 
                    data-action="toggle-deescalation-quest" 
                    data-bond-id="${b.id}"
                    aria-label="Mark de-escalation quest as ${isQuestDone ? 'incomplete' : 'complete'}"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </button>
                  <div style="flex-grow:1;">
                    <h5 class="deescalation-title">${escapeHTML(quest.title)}</h5>
                    <p class="deescalation-desc">${escapeHTML(quest.desc)}</p>
                  </div>
                </div>
              </div>

              <!-- Recent Honest Reflection Log -->
              ${recentReflection ? `
                <div class="recent-reflection-box">
                  <div class="reflection-meta">
                    <span class="reflection-tag">✍️ ${escapeHTML(recentReflection.tag)}</span>
                    <span class="reflection-date">${escapeHTML(recentReflection.date)}</span>
                  </div>
                  <p class="reflection-quote">"${escapeHTML(recentReflection.text)}"</p>
                </div>
              ` : ''}

              <!-- Log Honest Interaction Button -->
              <div class="bond-actions-row">
                <button 
                  type="button" 
                  class="pill-btn primary-btn log-interaction-open-btn" 
                  data-action="open-interaction-modal" 
                  data-bond-id="${b.id}"
                  style="background:var(--pillar-lovedones); border-color:var(--pillar-lovedones);"
                >
                  <span>✍️</span> Log Honest Interaction (+25 XP)
                </button>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    `;
  }

  // Open "Log Honest Interaction" Modal for specific bond
  openInteractionModal(bondId) {
    const bond = (window.AppStore.state.relationshipBonds || []).find(b => b.id === bondId);
    if (!bond) return;

    const modal = document.getElementById('log-interaction-modal');
    const banner = document.getElementById('interaction-target-banner');
    const inputId = document.getElementById('interaction-bond-id');
    const textarea = document.getElementById('interaction-reflection');

    if (inputId) inputId.value = bond.id;
    if (textarea) textarea.value = '';

    if (banner) {
      banner.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; width:100%;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:1.8rem;">${bond.icon || '🤝'}</span>
            <div>
              <h4 style="font-size:1.05rem; font-weight:700;">${escapeHTML(bond.name)} <small style="color:var(--text-secondary); font-size:0.75rem;">(${escapeHTML(bond.role)})</small></h4>
              <p style="font-size:0.775rem; color:var(--text-secondary);">${escapeHTML(bond.dynamic || '')}</p>
            </div>
          </div>
          <div style="text-align:right;">
            <span class="bond-status-chip" style="color:${bond.statusColor || '#10B981'}; border-color:${bond.statusColor || '#10B981'};">${bond.status}</span>
            <div style="font-size:0.75rem; font-weight:700; color:var(--pillar-lovedones); margin-top:3px;">${bond.trust}% Harmony</div>
          </div>
        </div>
      `;
    }

    if (modal) modal.classList.remove('hidden');
  }

  setQuestFilter(filterKey) {
    this.currentQuestFilter = filterKey;
    document.querySelectorAll('.filter-tab').forEach(b => {
      b.classList.toggle('active', b.dataset.filter === filterKey);
    });
    this.renderBondsDashboard(window.AppStore.state);
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
