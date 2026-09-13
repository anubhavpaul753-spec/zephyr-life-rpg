/**
 * MIRROR — UI Component Engine (Linear + Raycast Aesthetic)
 * Continuous Scroll Sections, Top Navigation Slider Pill, Rotating Wisdom, Specular Cards
 */

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const ROTATING_WISDOM = [
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant (on Aristotle)" },
  { text: "Impatience with actions, patience with results. Work hard today, let compounding take months.", author: "Naval Ravikant" },
  { text: "We suffer more often in imagination than in reality. Breathe, clear the desk, and execute.", author: "Seneca" },
  { text: "Holding your peace in an argument is harder than heavy lifting. That is real emotional mastery.", author: "Epictetus" },
  { text: "He who has a why to live can bear almost any how.", author: "Viktor Frankl" },
  { text: "Knowing is not enough, we must apply. Willing is not enough, we must do.", author: "Bruce Lee" },
  { text: "Discipline equals freedom. Show up every day regardless of feelings.", author: "Jocko Willink" }
];

class UIManager {
  constructor() {
    this.authTab = 'register';
    this.activeSectionId = 'sec-hero';
    this.currentWisdomIndex = 0;
    this.wisdomInterval = null;
    this.shopFilter = 'all';
  }

  // Master Render Loop
  render(state) {
    const isAuth = !!(window.Auth && window.Auth.isAuthenticated());

    // Toggle body class for locking / hiding sections and top bar items
    if (!isAuth) {
      document.body.classList.add('app-unauthenticated');
    } else {
      document.body.classList.remove('app-unauthenticated');
    }

    // Permanently enforce Raycast Midnight Obsidian Dark Mode
    document.documentElement.setAttribute('data-theme', 'dark');
    if (document.body) document.body.setAttribute('data-theme', 'dark');

    // Apply Active Equipped Palette (cleanly set or remove data-palette)
    const activePalette = state?.activePalette || 'default';
    if (activePalette && activePalette !== 'default') {
      document.documentElement.setAttribute('data-palette', activePalette);
      if (document.body) document.body.setAttribute('data-palette', activePalette);
    } else {
      document.documentElement.removeAttribute('data-palette');
      if (document.body) document.body.removeAttribute('data-palette');
    }

    // Apply Golden Avatar Aura if unlocked
    const hasAura = (state?.inventory || []).some(it => it.key === 'golden_aura' || it.key === 'accessory_aura');
    const avatarImg = document.getElementById('profile-avatar-img');
    if (avatarImg) {
      avatarImg.classList.toggle('golden-aura', hasAura);
    }

    // Update Top Navigation Bar Status (Streak, Coins, Tabs, Logout)
    this.renderHeader(state, isAuth);

    // Render Hero / Auth Gateway
    this.renderHeroGateway(state, isAuth);

    // Control downstream sections visibility (Gating: no scrolling down until setup complete!)
    this.setSectionsVisibility(isAuth, state?.skipRelationships);

    if (isAuth) {
      // Render All Sections Concurrently for Continuous Scroll
      this.renderRoutineSection(state);
      this.renderMirrorSection(state);
      this.renderCareerSection(state);
      this.renderLovedOnesSection(state);
      this.renderShopSection(state);
      this.updateActiveSliderPill(this.activeSectionId);
      this.renderParalysisModal(state);
    }

    // Dynamic Rotating Wisdom Loop
    this.startWisdomRotation();
  }

  // Gating helper: locks or unlocks sections below the hero
  setSectionsVisibility(isAuth, skipRelationships) {
    const downstream = ['sec-routine', 'sec-mirror', 'sec-career', 'sec-lovedones', 'sec-shop'];
    downstream.forEach(id => {
      const sec = document.getElementById(id);
      if (!sec) return;
      if (!isAuth) {
        sec.classList.add('locked-section');
      } else {
        if (id === 'sec-lovedones' && skipRelationships) {
          sec.classList.add('locked-section');
        } else {
          sec.classList.remove('locked-section');
        }
      }
    });

    const lovedNav = document.getElementById('nav-btn-lovedones');
    if (lovedNav) {
      if (!isAuth || skipRelationships) {
        lovedNav.classList.add('hidden');
      } else {
        lovedNav.classList.remove('hidden');
      }
    }
  }

  // Linear Top Slider Pill Position Controller
  updateActiveSliderPill(targetId) {
    this.activeSectionId = targetId;
    const targetBtn = document.querySelector(`.nav-tab-btn[data-target="${targetId}"]`);
    const pill = document.getElementById('nav-active-pill');

    // Update active tab buttons
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.target === targetId);
    });

    if (targetBtn && pill) {
      pill.style.transform = `translateX(${targetBtn.offsetLeft}px)`;
      pill.style.width = `${targetBtn.offsetWidth}px`;
      pill.style.opacity = '1';
    }
  }

  // Top Nav Status Indicators (Coins, Streak, Tabs, Logout)
  renderHeader(state, isAuth) {
    const streakEl = document.getElementById('streak-count');
    if (streakEl) streakEl.textContent = state?.streak || 1;

    const currEl = document.getElementById('currency-count');
    if (currEl) currEl.textContent = state?.currency || 20;

    const streakPill = document.querySelector('.streak-pill');
    const currPill = document.querySelector('.currency-pill');
    const navTabs = document.getElementById('nav-tabs-container');
    const logoutBtn = document.getElementById('logout-btn');

    if (isAuth) {
      if (streakPill) streakPill.style.display = '';
      if (currPill) currPill.style.display = '';
      if (navTabs) navTabs.style.display = '';
      if (logoutBtn) logoutBtn.classList.remove('hidden');
    } else {
      if (streakPill) streakPill.style.display = 'none';
      if (currPill) currPill.style.display = 'none';
      if (navTabs) navTabs.style.display = 'none';
      if (logoutBtn) logoutBtn.classList.add('hidden');
    }
  }

  // Hero Section Gateway
  renderHeroGateway(state, isAuth) {
    const gatewayBox = document.getElementById('hero-gateway-box');
    if (!gatewayBox) return;

    if (!isAuth) {
      // Unauthenticated: render setup & account creation card
      this.renderSetupAndAuthCard(this.authTab);
      return;
    }

    // Authenticated: render active Command Center card
    const name = state?.fullName || state?.username || 'Adventurer';
    const levelInfo = window.AppStore ? window.AppStore.getLevelInfo() : { level: 1 };
    const rank = this.computeRankTitle(levelInfo.level);
    const photoSrc = state?.photoUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(state?.username || 'adventurer')}`;
    const curProf = state?.currentProfession || 'Student & Academic Learner';
    const dreamCar = state?.dreamCareer || state?.careerTrack || 'Software Engineer & Full-Stack Developer';

    gatewayBox.innerHTML = `
      <div class="hero-command-card raycast-card specular-card">
        <div class="command-card-top">
          <img src="${photoSrc}" class="command-card-avatar" alt="Avatar">
          <div>
            <div class="command-card-badge">LEVEL ${levelInfo.level} • ${escapeHTML(rank)}</div>
            <h3 class="command-card-title">Welcome back, ${escapeHTML(name)}</h3>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:2px;">
              Current: <strong>${escapeHTML(curProf)}</strong> ➔ Dream: <strong>${escapeHTML(dreamCar)}</strong>
            </p>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-top:1px;">
              Streak: <strong>🔥 ${state?.streak || 1}d</strong> • Balance: <strong>🪙 ${state?.currency || 20} Coins</strong>
            </p>
          </div>
        </div>
        <div class="command-card-actions">
          <button class="pill-btn primary-btn" data-action="nav-jump" data-target="sec-routine">
            <span>📜</span> Daily Routine
          </button>
          <button class="pill-btn secondary-btn" data-action="nav-jump" data-target="sec-mirror">
            <span>🪞</span> Reality Mirror
          </button>
          <button class="pill-btn secondary-btn" data-action="nav-jump" data-target="sec-career">
            <span>🎯</span> Career Tree
          </button>
          <button class="pill-btn secondary-btn" data-action="open-profile-customization">
            <span>⚙️</span> Customize Profile
          </button>
        </div>
      </div>
    `;
  }

  // Render Setup & Authentication Card (First Page Gating)
  renderSetupAndAuthCard(activeTab = 'register') {
    this.authTab = activeTab;
    const gatewayBox = document.getElementById('hero-gateway-box');
    if (!gatewayBox) return;

    const tracks = window.CAREER_TRACKS || [];
    const careerOptions = tracks.map(t => `<option value="${escapeHTML(t.name)}">${escapeHTML(t.name)}</option>`).join('');

    let bodyHtml = '';

    if (activeTab === 'register') {
      bodyHtml = `
        <form id="onboarding-setup-form">
          <div class="profile-form-grid">
            <div class="form-group">
              <label class="form-label">Full Name / Identity *</label>
              <input type="text" id="setup-fullname" class="form-input" placeholder="e.g. Alex Morgan" required>
            </div>
            <div class="form-group">
              <label class="form-label">Date of Birth / Age *</label>
              <input type="date" id="setup-dob" class="form-input" value="2004-05-14" required>
            </div>
          </div>

          <div class="profile-form-grid">
            <div class="form-group">
              <label class="form-label">Username *</label>
              <input type="text" id="setup-username" class="form-input" placeholder="e.g. alex" required>
            </div>
            <div class="form-group">
              <label class="form-label">Password *</label>
              <input type="password" id="setup-password" class="form-input" placeholder="Min 3 characters" value="123" required>
            </div>
          </div>

          <!-- Photo Upload Row -->
          <div class="onboarding-photo-row">
            <img id="setup-photo-preview" class="onboarding-photo-preview" src="https://api.dicebear.com/7.x/notionists/svg?seed=adventurer" alt="Preview">
            <div style="flex:1;">
              <label style="font-size:0.8rem; font-weight:600; display:block; margin-bottom:4px;">Profile Photo (Optional)</label>
              <input type="file" id="setup-photo-input" accept="image/*" style="font-size:0.8rem; color:var(--text-secondary);">
              <span style="font-size:0.72rem; color:var(--text-muted); display:block; margin-top:2px;">Upload from your computer or keep default avatar.</span>
            </div>
          </div>

          <!-- 24 Career Track Options -->
          <div class="profile-form-grid">
            <div class="form-group">
              <label class="form-label">Current Profession / Starting Point *</label>
              <select id="setup-current-profession" class="form-select">
                ${careerOptions}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Dream Career & Mastery Track *</label>
              <select id="setup-dream-career" class="form-select">
                ${careerOptions}
              </select>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">Primary Life Ambition / North Star</label>
            <input type="text" id="setup-life-goal" class="form-input" placeholder="e.g. Master full-stack engineering, ship real tools, and cultivate calm presence." value="Master full-stack engineering, ship real tools, and cultivate calm presence.">
          </div>

          <!-- Relationships Dynamics Setup -->
          <div class="relationships-setup-card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong>Loved Ones & Relationship Dynamics</strong>
              <span style="font-size:0.75rem; color:var(--text-muted);">Calibrate emotional trust</span>
            </div>

            <div class="relationship-row-item">
              <span>👨‍💼 Father</span>
              <select id="setup-rel-father">
                <option value="Harmonious">Harmonious & Warm (90% Trust)</option>
                <option value="Good" selected>Good & Supportive (75% Trust)</option>
                <option value="Neutral">Neutral / Growing (60% Trust)</option>
                <option value="Sensitive">Sensitive / Strained (40% Trust)</option>
                <option value="Distant">Distant / Needs Healing (25% Trust)</option>
              </select>
            </div>

            <div class="relationship-row-item">
              <span>👩‍💼 Mother</span>
              <select id="setup-rel-mother">
                <option value="Harmonious" selected>Harmonious & Warm (90% Trust)</option>
                <option value="Good">Good & Supportive (75% Trust)</option>
                <option value="Neutral">Neutral / Growing (60% Trust)</option>
                <option value="Sensitive">Sensitive / Strained (40% Trust)</option>
                <option value="Distant">Distant / Needs Healing (25% Trust)</option>
              </select>
            </div>

            <div class="relationship-row-item">
              <span>💖 Partner / Spouse</span>
              <select id="setup-rel-partner">
                <option value="Harmonious" selected>Harmonious & Deep Bond (90% Trust)</option>
                <option value="Good">Good & Steadfast (75% Trust)</option>
                <option value="Neutral">Neutral / Busy Season (60% Trust)</option>
                <option value="Sensitive">Sensitive Dynamics (40% Trust)</option>
                <option value="None">Not Applicable / Skip</option>
              </select>
            </div>

            <div class="relationship-row-item">
              <span>🤝 Best Friend / Companion</span>
              <select id="setup-rel-friend">
                <option value="Harmonious" selected>Lifelong & Harmonious (90% Trust)</option>
                <option value="Good">Good & Steady (75% Trust)</option>
                <option value="Neutral">Neutral (60% Trust)</option>
                <option value="None">Not Applicable / Skip</option>
              </select>
            </div>

            <div class="skip-relationships-box">
              <input type="checkbox" id="setup-skip-relationships">
              <label for="setup-skip-relationships" style="cursor:pointer;">
                <strong>Skip Relationships Setup</strong> — Keep personal dynamics private and hide the Loved Ones section completely.
              </label>
            </div>
          </div>

          <button type="submit" class="pill-btn primary-btn" style="width:100%; padding:14px; font-size:0.95rem; font-weight:700;">
            ✦ Complete Setup & Enter Mirror →
          </button>
        </form>
      `;
    } else {
      bodyHtml = `
        <form id="gateway-login-form">
          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">Username</label>
            <input type="text" id="login-username" class="form-input" placeholder="e.g. alex or jordan" required>
          </div>
          <div class="form-group" style="margin-bottom:20px;">
            <label class="form-label">Password</label>
            <input type="password" id="login-password" class="form-input" placeholder="Enter password" value="123" required>
          </div>
          <button type="submit" class="pill-btn primary-btn" style="width:100%; padding:14px; font-size:0.95rem; font-weight:700;">
            Sign In to Mirror →
          </button>
        </form>
      `;
    }

    gatewayBox.innerHTML = `
      <div class="auth-card raycast-card specular-card" id="auth-card-container">
        <div class="auth-header-notice">
          <span class="sparkle">✦</span>
          <strong>Character Initialization & Gate</strong>
          <p style="font-size:0.82rem; color:var(--text-muted); margin-top:4px;">
            Set up your details first to unlock your Daily Routine, Reality Mirror, and Career Tree.
          </p>
        </div>

        <div class="auth-tabs" id="auth-tab-switches">
          <button type="button" class="auth-tab-btn ${activeTab === 'register' ? 'active' : ''}" data-tab="register">
            ✦ Create Account & Setup
          </button>
          <button type="button" class="auth-tab-btn ${activeTab === 'login' ? 'active' : ''}" data-tab="login">
            🔑 Sign In
          </button>
        </div>

        <div id="auth-card-body">
          ${bodyHtml}
        </div>

        <!-- 1-Click Quick Demo Footer for Hackathon Judges -->
        <div class="quick-demo-bar">
          <span class="quick-demo-label">Hackathon Judge Quick-Access:</span>
          <div class="quick-demo-buttons">
            <button type="button" class="mini-btn" data-action="quick-demo" data-user="alex">⚡ Demo: Alex (SWE)</button>
            <button type="button" class="mini-btn" data-action="quick-demo" data-user="jordan">⚡ Demo: Jordan (Designer)</button>
          </div>
        </div>
      </div>
    `;

    // Ensure Dream Career defaults to SWE if register tab
    if (activeTab === 'register') {
      const curSelect = document.getElementById('setup-current-profession');
      const dreamSelect = document.getElementById('setup-dream-career');
      if (curSelect && tracks.length > 0) curSelect.value = tracks[0].name; // Student
      if (dreamSelect && tracks.length > 1) dreamSelect.value = tracks[1].name; // SWE
    }
  }

  // SECTION 2: Daily Routine
  renderRoutineSection(state) {
    const careerBadge = document.getElementById('routine-career-badge');
    if (careerBadge) careerBadge.textContent = state?.careerTrack || 'Core Practice';

    const quests = state?.quests || [];
    const completedCount = quests.filter(q => q.completed).length;
    const totalCount = quests.length;
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const fracEl = document.getElementById('routine-fraction');
    if (fracEl) fracEl.textContent = `${completedCount} / ${totalCount}`;

    const pctEl = document.getElementById('routine-percent');
    if (pctEl) pctEl.textContent = `${pct}%`;

    const barEl = document.getElementById('routine-progress-bar');
    if (barEl) barEl.style.width = `${pct}%`;

    // Counts
    const cAll = document.getElementById('count-all');
    if (cAll) cAll.textContent = totalCount;
    const cPending = document.getElementById('count-pending');
    if (cPending) cPending.textContent = totalCount - completedCount;
    const cComp = document.getElementById('count-completed');
    if (cComp) cComp.textContent = completedCount;

    // Filter quests
    const filter = window.AppStore?.filter || 'all';
    let filtered = quests;
    if (filter === 'pending') filtered = quests.filter(q => !q.completed);
    else if (filter === 'completed') filtered = quests.filter(q => q.completed);
    else if (filter === 'morning') filtered = quests.filter(q => (q.time && q.time.includes('AM')));
    else if (filter === 'midday') filtered = quests.filter(q => (q.time && (q.time.includes('12:') || q.time.includes('01:') || q.time.includes('02:'))));
    else if (filter === 'evening') filtered = quests.filter(q => (q.time && (q.time.includes('PM') && !q.time.includes('12:') && !q.time.includes('01:') && !q.time.includes('02:'))));

    const list = document.getElementById('quests-list');
    if (!list) return;

    if (filtered.length === 0) {
      list.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted); background:var(--bg-subtle); border-radius:var(--radius-lg);">No habits in this filter. Keep showing up!</div>`;
      return;
    }

    list.innerHTML = filtered.map(q => {
      const pillarObj = window.PILLARS ? window.PILLARS[q.pillar] : null;
      const pColor = pillarObj?.color || 'var(--accent)';
      const pName = pillarObj?.name || q.pillar;
      const isDone = !!q.completed;

      return `
        <div class="quest-card raycast-card specular-card ${isDone ? 'completed' : ''}" id="quest-item-${q.id}">
          <div class="quest-left">
            <button class="quest-checkbox ${isDone ? 'checked' : ''}" 
                    data-action="toggle-quest" 
                    data-quest-id="${q.id}" 
                    aria-label="Toggle quest: ${escapeHTML(q.title)}">
              ${isDone ? '✓' : ''}
            </button>
            <div class="quest-content">
              <span class="quest-title">${escapeHTML(q.title)}</span>
              <div class="quest-meta">
                <span class="pillar-tag" style="background:${pColor}18; color:${pColor}; border:1px solid ${pColor}35;">
                  ${escapeHTML(pName)}
                </span>
                <span>⏱️ ${escapeHTML(q.time || 'Daily')}</span>
                <span style="color:var(--text-muted); font-size:0.75rem;">${escapeHTML(q.note || 'High Leverage Habit')}</span>
              </div>
            </div>
          </div>
          <div class="quest-rewards">
            <span class="reward-xp">+${q.xp || 20} XP</span>
            <span class="reward-coins">+${q.coins || 5} 🪙</span>
            <button class="icon-btn" data-action="abandon-quest-trigger" title="Contemplate pivoting or dropping this habit" style="width:28px; height:28px; font-size:0.7rem; border-color:transparent; opacity:0.35;">✕</button>
          </div>
        </div>
      `;
    }).join('');

    const completeBanner = document.getElementById('all-complete-banner');
    if (completeBanner) {
      if (totalCount > 0 && completedCount === totalCount) {
        completeBanner.classList.remove('hidden');
      } else {
        completeBanner.classList.add('hidden');
      }
    }
  }

  // SECTION 3: Reality Mirror
  renderMirrorSection(state) {
    const levelInfo = window.AppStore ? window.AppStore.getLevelInfo() : { level: 1, currentXP: 0, reqXP: 100, percent: 0 };
    const lvl = levelInfo.level;
    const xp = levelInfo.currentXP;
    const reqXP = levelInfo.reqXP;
    const xpPct = levelInfo.percent;

    const photoSrc = state?.photoUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(state?.username || 'adventurer')}`;
    const avatarImg = document.getElementById('profile-avatar-img');
    if (avatarImg) {
      avatarImg.src = photoSrc;
    }

    const lvlBadge = document.getElementById('profile-avatar-lvl-badge');
    if (lvlBadge) lvlBadge.textContent = `Lv. ${lvl}`;

    const fullNameEl = document.getElementById('profile-user-fullname');
    if (fullNameEl) fullNameEl.textContent = state?.fullName || state?.username || 'Adventurer';

    const rankTitle = this.computeRankTitle(lvl);
    const rankEl = document.getElementById('profile-rank-title');
    if (rankEl) rankEl.textContent = rankTitle;

    const goalEl = document.getElementById('profile-life-goal-display');
    if (goalEl) goalEl.textContent = `"${state?.lifeGoal || 'Master full-stack engineering and build a peaceful life.'}"`;

    const lvlTitle = document.getElementById('profile-level-title');
    if (lvlTitle) lvlTitle.textContent = `Level ${lvl}`;

    const xpReadout = document.getElementById('profile-xp-readout');
    if (xpReadout) xpReadout.textContent = `${xp} / ${reqXP} XP`;

    const xpFill = document.getElementById('profile-xp-fill');
    if (xpFill) xpFill.style.width = `${xpPct}%`;

    const xpPctEl = document.getElementById('profile-xp-percent');
    if (xpPctEl) xpPctEl.textContent = `${xpPct}%`;

    // 6 Pillars HUD
    const pillarsContainer = document.getElementById('pillars-hud');
    if (pillarsContainer && window.PILLARS) {
      const stats = window.AppStore ? window.AppStore.getPillarStats() : { points: {}, pillarLevels: {}, pillarProgress: {} };
      
      pillarsContainer.innerHTML = Object.keys(window.PILLARS).map(key => {
        const pDef = window.PILLARS[key];
        const pLevel = stats.pillarLevels[key] || 1;
        const pProgress = stats.pillarProgress[key] || 15;
        const pPoints = stats.points[key] || 0;

        return `
          <div class="pillar-card raycast-card specular-card">
            <div class="pillar-card-header">
              <div class="pillar-title-wrap">
                <span class="pillar-icon">${pDef.icon}</span>
                <span class="pillar-name">${escapeHTML(pDef.name)}</span>
              </div>
              <span class="pillar-level-tag" style="color:${pDef.color};">Lv. ${pLevel}</span>
            </div>
            <div class="pillar-bar-track">
              <div class="pillar-bar-fill" style="width:${pProgress}%; background:${pDef.color};"></div>
            </div>
            <div class="pillar-metric-desc">
              <span>XP Compounded: <strong>${pPoints} pts</strong></span>
            </div>
          </div>
        `;
      }).join('');
    }

    // Trajectory Projections
    const f30 = document.getElementById('forecast-30-days');
    if (f30) f30.textContent = `Level ${lvl + 2}`;

    const f90 = document.getElementById('forecast-90-days');
    if (f90) f90.textContent = `Level ${lvl + 5}`;

    const f1y = document.getElementById('forecast-1-year');
    if (f1y) f1y.textContent = `Level ${lvl + 12}`;
  }

  computeRankTitle(level) {
    if (level < 3) return 'Novice Builder';
    if (level < 6) return 'Disciplined Practitioner';
    if (level < 10) return 'Craft Journeyman';
    if (level < 15) return 'Senior Architect';
    return 'Grandmaster Polymath';
  }

  // SECTION 4: Career Skill Tree (Polished Indentation, Clean Badges & Specular Cards)
  renderCareerSection(state) {
    const track = state?.careerTrack || 'Software Engineer & Full-Stack Developer';
    const goal = state?.lifeGoal || 'Master high-leverage skills and build a peaceful life.';

    const trackNameEl = document.getElementById('hero-career-track');
    if (trackNameEl) trackNameEl.textContent = track;

    const goalEl = document.getElementById('hero-life-goal');
    if (goalEl) goalEl.textContent = `"${goal}"`;

    const selectEl = document.getElementById('career-switcher-select');
    if (selectEl) {
      const tracks = window.CAREER_TRACKS || [];
      if (selectEl.options.length < tracks.length) {
        selectEl.innerHTML = tracks.map(t => `<option value="${escapeHTML(t.name)}">${escapeHTML(t.name)}</option>`).join('');
      }
      selectEl.value = track;
    }

    const treeContainer = document.getElementById('career-milestones-tree');
    if (!treeContainer) return;

    const tiers = (state?.careerTree && state.careerTree.length > 0)
      ? state.careerTree
      : (window.AppStore ? window.AppStore.getTreeForCareer(track) : []);

    if (!tiers || tiers.length === 0) {
      treeContainer.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted);">No career milestones loaded yet. Click <strong>AI Blueprint Generator</strong> to generate one!</div>`;
      return;
    }

    treeContainer.innerHTML = tiers.map(tier => {
      // Clean duplicate Tier prefixes (e.g. "Tier 2: Portfolio Builder" -> "Portfolio Builder")
      const rawName = tier.tierName || 'Foundations';
      const cleanName = rawName.replace(/^Tier\s*\d+\s*:\s*/i, '');

      const milestonesHtml = (tier.milestones || []).map(m => {
        const isDone = !!m.completed;
        return `
          <div class="milestone-item ${isDone ? 'completed' : ''}">
            <button class="milestone-checkbox ${isDone ? 'checked' : ''}" 
                    data-action="toggle-milestone" 
                    data-milestone-id="${m.id}" 
                    aria-label="Toggle milestone: ${escapeHTML(m.title)}">
              ${isDone ? '✓' : ''}
            </button>
            <div class="milestone-body">
              <h5 class="milestone-name">${escapeHTML(m.title)}</h5>
              <p class="milestone-desc">${escapeHTML(m.desc)}</p>
              <div class="milestone-rewards-row">
                <span class="reward-pill craft-pill">+${m.craftXP || 35} Craft XP</span>
                <span class="reward-pill disc-pill">+${m.discXP || 15} Discipline XP</span>
                <span class="reward-pill coin-pill">🪙 ${m.coins || 20} Coins</span>
              </div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="career-tier-card raycast-card specular-card">
          <div class="tier-card-header">
            <div class="tier-badge-pill">Tier ${tier.tierId || 1}</div>
            <div>
              <h4 class="tier-name">${escapeHTML(cleanName)}</h4>
              <span class="tier-subtitle">${escapeHTML(tier.subtitle || '')}</span>
            </div>
          </div>
          <div class="tier-milestones-list">
            ${milestonesHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  // SECTION 5: Loved Ones & Relationships
  renderLovedOnesSection(state) {
    const sectionEl = document.getElementById('sec-lovedones');
    const navBtn = document.getElementById('nav-btn-lovedones');

    // If user chose to skip relationships, hide section & top nav button completely
    if (state?.skipRelationships) {
      if (sectionEl) sectionEl.classList.add('hidden');
      if (navBtn) navBtn.classList.add('hidden');
      return;
    } else {
      if (sectionEl) sectionEl.classList.remove('hidden');
      if (navBtn) navBtn.classList.remove('hidden');
    }

    const bondsContainer = document.getElementById('bonds-list-container');
    if (!bondsContainer) return;

    const bonds = state?.relationshipBonds || state?.bonds || window.DEFAULT_RELATIONSHIP_BONDS || [];
    if (bonds.length === 0) {
      bondsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding:40px 24px; color:var(--text-muted); background:var(--bg-subtle); border-radius:var(--radius-lg); border:1px dashed var(--border-color);">
          <p style="margin-bottom:14px; font-size:0.95rem;">No loved ones registered yet. Prioritize meaningful human connections in your life quest.</p>
          <button id="empty-add-bond-btn" class="pill-btn primary-btn">
            <span>+</span> Add Loved One
          </button>
        </div>
      `;
      return;
    }

    bondsContainer.innerHTML = bonds.map(b => {
      const trust = b.trust || b.trustMeter || 65;
      const streak = b.patienceStreak || 1;
      const lastAction = b.lastAction || (b.reflections && b.reflections[0]?.text) || 'Active unhurried listening during family conversation.';

      return `
        <div class="bond-card raycast-card specular-card">
          <div class="bond-card-header">
            <div class="bond-identity">
              <span class="bond-avatar">${b.icon || b.avatar || '🤝'}</span>
              <div>
                <h4 class="bond-name">${escapeHTML(b.name)}</h4>
                <span class="bond-role">${escapeHTML(b.role || b.relation || 'Family')}</span>
              </div>
            </div>
            <span class="bond-streak-badge">🔥 ${streak}d harmony</span>
          </div>

          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted); margin-bottom:4px;">
              <span>Mutual Trust & Presence</span>
              <span>${trust}%</span>
            </div>
            <div class="bond-trust-bar-track">
              <div class="bond-trust-bar-fill" style="width:${trust}%;"></div>
            </div>
          </div>

          <div class="bond-last-interaction">
            <span>Last touchpoint: <em>"${escapeHTML(lastAction)}"</em></span>
          </div>

          <button class="pill-btn secondary-btn" data-action="log-bond" data-bond-id="${b.id}" style="width:100%; margin-top:4px;">
            <span>🤝</span> Log Quiet Interaction (+25 Empathy XP)
          </button>
        </div>
      `;
    }).join('');
  }

  // SECTION 6: Guild Shop & Economy (Themes, Accessories & Human Rewards)
  renderShopSection(state) {
    const balEl = document.getElementById('shop-page-balance');
    if (balEl) balEl.textContent = state?.currency || 20;

    const itemsContainer = document.getElementById('shop-page-items');
    if (!itemsContainer) return;

    const shopCatalog = [
      // 🎨 UI Themes & Palettes
      {
        key: 'theme_matrix',
        name: 'Cyberpunk Matrix Theme',
        cost: 30,
        icon: '🟢',
        category: 'themes',
        palette: 'matrix',
        desc: 'Neon emerald matrix glow, obsidian background & terminal hacker aesthetic.'
      },
      {
        key: 'theme_synthwave',
        name: 'Tokyo Synthwave Theme',
        cost: 35,
        icon: '🟣',
        category: 'themes',
        palette: 'synthwave',
        desc: 'Electric neon violet & magenta accents on deep midnight indigo.'
      },
      {
        key: 'theme_amber',
        name: 'Sunset Amber Solstice',
        cost: 25,
        icon: '🌅',
        category: 'themes',
        palette: 'amber',
        desc: 'Radiant golden amber and twilight gradients with raycast specular shading.'
      },
      {
        key: 'theme_arctic',
        name: 'Nordic Arctic Frost',
        cost: 25,
        icon: '❄️',
        category: 'themes',
        palette: 'arctic',
        desc: 'Glacial cyan & cool iceberg blues with ultra-crisp contrast.'
      },
      {
        key: 'theme_crimson',
        name: 'Crimson Bloodmoon Theme',
        cost: 30,
        icon: '🩸',
        category: 'themes',
        palette: 'crimson',
        desc: 'Lethal neon crimson red glow, obsidian abyss & high-stakes dark mode aesthetic.'
      },
      {
        key: 'theme_minimal',
        name: 'Monochrome Obsidian',
        cost: 20,
        icon: '🖤',
        category: 'themes',
        palette: 'minimal',
        desc: 'Ultra-distraction-free pure black & stark white high-focus architecture.'
      },

      // 👑 Accessories & Flairs
      {
        key: 'golden_aura',
        name: 'Celestial Golden Avatar Aura',
        cost: 45,
        icon: '👑',
        category: 'accessories',
        desc: 'Unlocks a luminous, pulsating celestial golden border ring around your avatar.'
      },
      {
        key: 'sound_8bit',
        name: '8-Bit Retro Arcade Soundpack',
        cost: 30,
        icon: '🕹️',
        category: 'accessories',
        desc: 'Replaces standard quest chimes with crisp, nostalgic 8-bit game victory jingles.'
      },

      // 🛡️ Habit Shields
      {
        key: 'streak_freeze',
        name: 'Streak Freeze Shield',
        cost: 40,
        icon: '🛡️',
        category: 'shields',
        desc: 'Protects your habit streak when illness or urgent emergencies happen.'
      },

      // 🌿 Grounded Real-Life Human Treats
      {
        key: 'rest_day',
        name: 'Guilt-Free 100% Rest Day Pass',
        cost: 60,
        icon: '🏖️',
        category: 'human',
        desc: 'A complete 24-hour Sabbath with zero work, study, or checklists and total peace.'
      },
      {
        key: 'protein_feast',
        name: 'High-Protein Feast Pass',
        cost: 35,
        icon: '🥩',
        category: 'human',
        desc: 'Earned dinner at your favorite restaurant after days of disciplined consistency.'
      },
      {
        key: 'sleep_sanctuary',
        name: 'Deep Sleep Sanctuary Night',
        cost: 25,
        icon: '🌙',
        category: 'human',
        desc: 'Sleep by 9:30 PM with zero screens, ambient sounds & nervous system recovery.'
      },
      {
        key: 'gaming_pass',
        name: 'Guilt-Free Gaming Pass',
        cost: 50,
        icon: '🎮',
        category: 'human',
        desc: '2 hours of unhurried gaming with zero guilt after hitting daily high-leverage milestones.'
      },
      {
        key: 'espresso_book',
        name: 'Espresso & Quiet Book Pass',
        cost: 20,
        icon: '☕',
        category: 'human',
        desc: '90 minutes in a quiet cafe reading foundational non-fiction without checking phone.'
      },
      {
        key: 'lovedone_dinner',
        name: 'Celebration Dinner with Loved One',
        cost: 75,
        icon: '🥂',
        category: 'human',
        desc: 'Take parents, partner, or best friend out for dinner to celebrate mutual growth.'
      }
    ];

    // Filter items based on active category
    const activeFilter = this.shopFilter || 'all';
    let filtered = shopCatalog;
    if (activeFilter !== 'all') {
      filtered = shopCatalog.filter(it => it.category === activeFilter);
    }

    const inventory = state?.inventory || [];
    const activePalette = state?.activePalette || 'default';

    const paletteNames = {
      default: 'Raycast Midnight (Obsidian)',
      matrix: 'Cyberpunk Matrix (Emerald)',
      synthwave: 'Tokyo Synthwave (Neon Violet)',
      amber: 'Sunset Amber Solstice (Gold)',
      arctic: 'Nordic Arctic Frost (Cyan)',
      crimson: 'Crimson Bloodmoon (Ruby Red)',
      minimal: 'Monochrome Obsidian (Minimal)'
    };
    const currentPaletteName = paletteNames[activePalette] || 'Custom Theme';

    // Active Theme Status Bar with Instant Revert Control
    const activeBarHtml = `
      <div class="active-palette-bar">
        <div class="palette-status-info">
          <span class="palette-status-icon">🎨</span>
          <span>Current Equipped UI: <strong class="palette-name-tag">${escapeHTML(currentPaletteName)}</strong></span>
        </div>
        <div>
          ${activePalette !== 'default' ? `
            <button class="revert-theme-btn" data-action="revert-palette" title="Revert UI to default Raycast Midnight Obsidian">
              ↺ Revert to Default UI (Raycast Midnight)
            </button>
          ` : `
            <span class="active-palette-default-badge">✓ Default Raycast Obsidian Active</span>
          `}
        </div>
      </div>
    `;

    // Inject filter tabs above items
    const tabsHtml = `
      <div class="shop-filter-tabs" style="grid-column: 1 / -1;">
        <button class="shop-filter-tab ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">All Rewards (${shopCatalog.length})</button>
        <button class="shop-filter-tab ${activeFilter === 'themes' ? 'active' : ''}" data-filter="themes">🎨 UI Themes</button>
        <button class="shop-filter-tab ${activeFilter === 'accessories' ? 'active' : ''}" data-filter="accessories">👑 Accessories</button>
        <button class="shop-filter-tab ${activeFilter === 'human' ? 'active' : ''}" data-filter="human">🌿 Human Treats</button>
        <button class="shop-filter-tab ${activeFilter === 'shields' ? 'active' : ''}" data-filter="shields">🛡️ Shields</button>
      </div>
    `;

    const cardsHtml = filtered.map(item => {
      const isOwned = inventory.some(inv => inv.key === item.key);
      const isEquipped = item.palette && activePalette === item.palette;

      let actionButtonHtml = '';
      if (!isOwned) {
        actionButtonHtml = `
          <button class="pill-btn primary-btn" 
                  data-action="buy-shop-item" 
                  data-item-key="${item.key}" 
                  data-item-name="${escapeHTML(item.name)}" 
                  data-item-cost="${item.cost}">
            Purchase
          </button>
        `;
      } else if (item.palette) {
        if (isEquipped) {
          actionButtonHtml = `
            <button class="pill-btn equipped-active-btn" 
                    data-action="revert-palette" 
                    title="Theme is equipped. Click to revert to default Raycast Midnight UI.">
              ✓ Equipped (Click to Revert)
            </button>
          `;
        } else {
          actionButtonHtml = `
            <button class="pill-btn equip-btn" 
                    data-action="equip-palette" 
                    data-palette-key="${item.palette}" 
                    data-palette-name="${escapeHTML(item.name)}">
              ⚡ Equip Theme
            </button>
          `;
        }
      } else {
        actionButtonHtml = `<button class="pill-btn secondary-btn" disabled style="opacity:0.75; font-size:0.8rem;">✓ Owned</button>`;
      }

      const badgeClass = item.category === 'themes' ? 'badge-theme' : (item.category === 'accessories' ? 'badge-accessory' : (item.category === 'shields' ? 'badge-shield' : 'badge-human'));
      const badgeLabel = item.category === 'themes' ? 'Theme' : (item.category === 'accessories' ? 'Accessory' : (item.category === 'shields' ? 'Shield' : 'Human Treat'));

      return `
        <div class="shop-item-card raycast-card specular-card">
          <div class="shop-item-header">
            <span class="shop-item-icon">${item.icon}</span>
            <div style="flex:1;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <h4 class="shop-item-name" style="margin:0;">${escapeHTML(item.name)}</h4>
                <span class="shop-badge ${badgeClass}">${badgeLabel}</span>
              </div>
              <p class="shop-item-desc">${escapeHTML(item.desc)}</p>
            </div>
          </div>
          <div class="shop-item-footer">
            <span class="shop-item-cost">🪙 ${item.cost} Coins</span>
            ${actionButtonHtml}
          </div>
        </div>
      `;
    }).join('');

    itemsContainer.innerHTML = activeBarHtml + tabsHtml + cardsHtml;

    // Acquired Inventory
    const invContainer = document.getElementById('user-inventory-container');
    if (invContainer) {
      if (inventory.length === 0) {
        invContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding:24px; color:var(--text-muted); background:var(--bg-subtle); border-radius:var(--radius-md);">No purchased rewards in inventory yet. Complete daily missions to earn Life Coins!</div>`;
      } else {
        invContainer.innerHTML = inventory.map(it => `
          <div class="inventory-item-card">
            <span>✨</span>
            <div>
              <strong style="font-size:0.9rem; display:block;">${escapeHTML(it.name)}</strong>
              <span style="font-size:0.75rem; color:var(--text-muted);">Acquired: ${new Date(it.acquiredAt).toLocaleDateString()}</span>
            </div>
          </div>
        `).join('');
      }
    }
  }

  // Paralysis Breaker Micro-Habits Modal (Dynamic 5th step tailored to active career)
  renderParalysisModal(state) {
    const list = document.getElementById('paralysis-micro-list');
    if (!list) return;

    const curState = state || (window.AppStore ? window.AppStore.state : null);
    const track = curState?.careerTrack || curState?.dreamCareer || 'Software Engineer & Full-Stack Developer';

    const getHabitFn = window.getCareerMicroHabit || (window.AppStore && window.AppStore.getCareerMicroHabit);
    const careerHabit = getHabitFn 
      ? getHabitFn(track) 
      : { id: 'career_micro', title: 'Open workspace and take just 1 small action step for your craft', icon: '🎯', pillar: 'Craft', xp: 20 };

    const microHabits = [
      { id: 'water', title: 'Drink one tall glass of cold water', icon: '💧', pillar: 'Resilience', xp: 10 },
      { id: 'breathe', title: 'Take 5 deep box breaths (4s in, 4s hold, 4s out)', icon: '🫁', pillar: 'Calm', xp: 15 },
      { id: 'shoes', title: 'Put on walking shoes and step outside for 60 seconds', icon: '👟', pillar: 'Resilience', xp: 20 },
      { id: 'clean', title: 'Clear 3 items off your desk or bed', icon: '🧹', pillar: 'Discipline', xp: 15 },
      careerHabit
    ];

    list.innerHTML = microHabits.map(m => `
      <div style="display:flex; align-items:center; justify-content:space-between; padding:14px; background:var(--bg-subtle); border-radius:var(--radius-md); margin-bottom:10px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:1.3rem;">${m.icon}</span>
          <span style="font-size:0.9rem; font-weight:600;">${escapeHTML(m.title)}</span>
        </div>
        <button class="pill-btn primary-btn" data-action="do-micro-habit" data-micro-xp="${m.xp}" data-micro-pillar="${m.pillar || 'Craft'}" data-micro-title="${escapeHTML(m.title)}">
          Do Now (+${m.xp} XP)
        </button>
      </div>
    `).join('');
  }

  // Populate Profile Customization Modal (inside UIManager class)
  populateProfileCustomizationModal(state) {
    const curSelect = document.getElementById('cust-current-profession');
    const dreamSelect = document.getElementById('cust-dream-career');
    const nameInput = document.getElementById('cust-fullname');
    const dobInput = document.getElementById('cust-dob');
    const goalInput = document.getElementById('cust-life-goal');
    const skipCheckbox = document.getElementById('cust-skip-relationships');
    const photoPreview = document.getElementById('profile-modal-photo-preview');

    if (nameInput) nameInput.value = state?.fullName || state?.username || '';
    if (dobInput && state?.dob) dobInput.value = state.dob;
    if (goalInput) goalInput.value = state?.lifeGoal || '';
    if (skipCheckbox) skipCheckbox.checked = !!state?.skipRelationships;

    const photoSrc = state?.photoUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(state?.username || 'adventurer')}`;
    if (photoPreview) photoPreview.src = photoSrc;

    const tracks = window.CAREER_TRACKS || [];
    const optionsHtml = tracks.map(t => `<option value="${escapeHTML(t.name)}">${escapeHTML(t.name)}</option>`).join('');

    if (curSelect) {
      curSelect.innerHTML = optionsHtml;
      curSelect.value = state?.currentProfession || tracks[0]?.name || '';
    }
    if (dreamSelect) {
      dreamSelect.innerHTML = optionsHtml;
      dreamSelect.value = state?.dreamCareer || state?.careerTrack || tracks[1]?.name || '';
    }
  }

  // Rotating Wisdom Loop
  startWisdomRotation() {
    if (this.wisdomInterval) return;
    this.updateWisdomText();
    this.wisdomInterval = setInterval(() => {
      const stripEl = document.getElementById('dynamic-wisdom-strip');
      if (stripEl) stripEl.style.opacity = '0';

      setTimeout(() => {
        this.currentWisdomIndex = (this.currentWisdomIndex + 1) % ROTATING_WISDOM.length;
        this.updateWisdomText();
        if (stripEl) stripEl.style.opacity = '1';
      }, 500);
    }, 7000);
  }

  updateWisdomText() {
    const quote = ROTATING_WISDOM[this.currentWisdomIndex];
    const textEl = document.getElementById('dynamic-wisdom-text');
    const authorEl = document.getElementById('wisdom-author');
    if (textEl && quote) textEl.textContent = `"${quote.text}"`;
    if (authorEl && quote) authorEl.textContent = `— ${quote.author}`;
  }
}

window.UI = new UIManager();
