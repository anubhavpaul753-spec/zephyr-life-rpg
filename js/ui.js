/**
 * MIRROR — UI Component Engine
 * Multi-Page Navigation, Reality Mirror, Rotating Wisdom, Specular Cards
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
  { text: "Consistency is not glamorous, but it is the only force that permanently transforms a life.", author: "Grounded Mentor" },
  { text: "Impatience with actions, patience with results. Work hard today, let compounding take months.", author: "Naval Ravikant" },
  { text: "We suffer more often in imagination than in reality. Breathe, clear the desk, and execute.", author: "Seneca" },
  { text: "Holding your peace in an argument is harder than heavy lifting. That is real emotional mastery.", author: "Grounded Mentor" },
  { text: "Don't count the days; make the days count through quiet, unhurried presence.", author: "Muhammad Ali" },
  { text: "Small disciplines repeated with unwavering consistency build unbreakable self-respect.", author: "Grounded Mentor" }
];

class UIManager {
  constructor() {
    this.authTab = 'login';
    this.activePage = 'routine';
    this.currentWisdomIndex = 0;
    this.wisdomInterval = null;
  }

  // Master Render Loop
  render(state) {
    const isAuth = window.Auth && window.Auth.isAuthenticated();
    const landingPage = document.getElementById('landing-page');
    const appDashboard = document.getElementById('app-dashboard');

    // Apply Active Theme Mode ('dark' or 'light')
    const activeTheme = state?.themeMode || 'dark';
    document.documentElement.setAttribute('data-theme', activeTheme);

    if (!isAuth) {
      if (landingPage) landingPage.classList.remove('hidden');
      if (appDashboard) appDashboard.classList.add('hidden');
      this.renderAuthForm();
      this.stopWisdomRotation();
      return;
    }

    if (landingPage) landingPage.classList.add('hidden');
    if (appDashboard) appDashboard.classList.remove('hidden');

    this.renderHeader(state);
    this.startWisdomRotation();
    this.renderActivePage(state);
  }

  // Multi-Page Tab Switching
  switchPage(pageId, state) {
    this.activePage = pageId;
    document.querySelectorAll('.app-nav-tabs .nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === pageId);
    });

    document.querySelectorAll('.page-view').forEach(p => p.classList.add('hidden'));
    const target = document.getElementById(`page-${pageId}`);
    if (target) {
      target.classList.remove('hidden');
      target.scrollTop = 0;
    }

    this.renderActivePage(state || window.AppStore.state);
  }

  renderActivePage(state) {
    switch (this.activePage) {
      case 'routine':
        this.renderRoutinePage(state);
        break;
      case 'mirror':
        this.renderMirrorPage(state);
        break;
      case 'career':
        this.renderCareerPage(state);
        break;
      case 'relationships':
        this.renderRelationshipsPage(state);
        break;
      case 'shop':
        this.renderShopPage(state);
        break;
    }
  }

  // Rotating Wisdom Loop (Cross-fade every 7s, no upper label)
  startWisdomRotation() {
    if (this.wisdomInterval) return;
    this.updateWisdomText();
    this.wisdomInterval = setInterval(() => {
      const textEl = document.getElementById('dynamic-wisdom-text');
      const authorEl = document.getElementById('wisdom-author');
      const stripEl = document.getElementById('dynamic-wisdom-strip');
      if (stripEl) stripEl.style.opacity = '0';

      setTimeout(() => {
        this.currentWisdomIndex = (this.currentWisdomIndex + 1) % ROTATING_WISDOM.length;
        this.updateWisdomText();
        if (stripEl) stripEl.style.opacity = '1';
      }, 500);
    }, 7000);
  }

  stopWisdomRotation() {
    if (this.wisdomInterval) {
      clearInterval(this.wisdomInterval);
      this.wisdomInterval = null;
    }
  }

  updateWisdomText() {
    const quote = ROTATING_WISDOM[this.currentWisdomIndex];
    const textEl = document.getElementById('dynamic-wisdom-text');
    const authorEl = document.getElementById('wisdom-author');
    if (textEl && quote) textEl.textContent = `"${quote.text}"`;
    if (authorEl && quote) authorEl.textContent = `— ${quote.author}`;
  }

  // Auth Card Form (Clean, no pre-filled dummy strings)
  renderAuthForm() {
    const container = document.getElementById('auth-card-body');
    if (!container) return;

    const careerOptions = (window.CAREER_TRACKS || []).map(t => 
      `<option value="${escapeHTML(t.name)}">${escapeHTML(t.name)}</option>`
    ).join('');

    if (this.authTab === 'login') {
      container.innerHTML = `
        <form id="login-form" class="auth-form">
          <div id="auth-error-box" class="auth-error-banner hidden" style="color:#ef4444; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:8px; padding:10px; font-size:0.85rem; margin-bottom:6px; text-align:center;"></div>
          <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" id="login-username" class="form-input" placeholder="Enter your username" required autocomplete="username">
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="login-password" class="form-input" placeholder="Enter your password" required autocomplete="current-password">
          </div>
          <button type="submit" id="login-submit-btn" class="auth-submit-btn">Enter Mirror →</button>
          <p class="auth-hint">New adventurer? Click <strong>Create Account</strong> above to begin.</p>
        </form>
      `;
    } else {
      container.innerHTML = `
        <form id="register-form" class="auth-form">
          <div id="auth-error-box" class="auth-error-banner hidden" style="color:#ef4444; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:8px; padding:10px; font-size:0.85rem; margin-bottom:6px; text-align:center;"></div>
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" id="reg-fullname" class="form-input" placeholder="e.g. Anubhav Paul" required>
          </div>
          <div class="form-group">
            <label class="form-label">Choose Username</label>
            <input type="text" id="reg-username" class="form-input" placeholder="e.g. anubhav" required autocomplete="username">
          </div>
          <div class="form-group">
            <label class="form-label">Choose Password</label>
            <input type="password" id="reg-password" class="form-input" placeholder="At least 3 characters" required autocomplete="new-password">
          </div>
          <div class="form-group">
            <label class="form-label">Dream Career / Ambition</label>
            <select id="reg-careertrack" class="form-select">
              ${careerOptions}
            </select>
          </div>
          <button type="submit" id="register-submit-btn" class="auth-submit-btn">Create Account & Ascend →</button>
          <p class="auth-hint">All your stats, habits, and XP are securely preserved in the database.</p>
        </form>
      `;
    }

    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === this.authTab);
    });
  }

  setAuthTab(tab) {
    this.authTab = tab;
    this.renderAuthForm();
  }

  // Top Header Status
  renderHeader(state) {
    if (!state) return;
    const nameEl = document.getElementById('header-user-name');
    if (nameEl) nameEl.textContent = state.fullName || state.username || 'Adventurer';

    const streakEl = document.getElementById('streak-count');
    if (streakEl) streakEl.textContent = state.streak || 1;

    const currEl = document.getElementById('currency-count');
    if (currEl) currEl.textContent = state.currency || 0;
  }

  // PAGE 1: Routine & Quests
  renderRoutinePage(state) {
    if (!state) return;
    const quests = state.quests || [];
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
      list.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);">No quests in this category.</div>`;
      return;
    }

    list.innerHTML = filtered.map(q => {
      const pillarObj = window.PILLARS[q.pillar] || { color: '#6366F1', name: q.pillar };
      return `
        <div class="quest-item ${q.completed ? 'completed' : ''}" data-quest-id="${q.id}">
          <div class="quest-left">
            <button class="quest-checkbox-btn ${q.completed ? 'checked' : ''}" data-action="toggle-quest" data-quest-id="${q.id}">
              ${q.completed ? '✓' : ''}
            </button>
            <div class="quest-title-row">
              <span class="quest-title-text" style="${q.completed ? 'text-decoration: line-through;' : ''}">${escapeHTML(q.title)}</span>
              ${q.note ? `<span class="quest-note">${escapeHTML(q.note)}</span>` : ''}
            </div>
          </div>
          <div class="quest-badges">
            <span class="quest-pillar-badge" style="background:${pillarObj.color}22; color:${pillarObj.color}; border:1px solid ${pillarObj.color}55;">
              ${escapeHTML(q.pillar)}
            </span>
            <span class="quest-reward-tag">+${q.xp} XP</span>
          </div>
        </div>
      `;
    }).join('');

    // All complete card
    const allComp = document.getElementById('all-complete-banner');
    if (allComp) {
      allComp.classList.toggle('hidden', !(totalCount > 0 && completedCount === totalCount));
    }
  }

  // PAGE 2: Reality Mirror (Character Sheet & 6 Pillars)
  renderMirrorPage(state) {
    if (!state) return;

    const nameEl = document.getElementById('profile-user-fullname');
    if (nameEl) nameEl.textContent = state.fullName || state.username || 'Adventurer';

    const rankEl = document.getElementById('profile-rank-title');
    if (rankEl) rankEl.textContent = state.rankTitle || 'Novice Builder';

    const goalEl = document.getElementById('profile-life-goal-display');
    if (goalEl) goalEl.textContent = `"${state.lifeGoal || 'Master full-stack architecture and build a peaceful life.'}"`;

    // Avatar
    const avatar = document.getElementById('profile-avatar-img');
    if (avatar) avatar.src = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(state.username || 'adventurer')}`;

    // Level & Non-Linear XP
    const lvl = state.level || 1;
    const reqXP = Math.floor(100 * Math.pow(lvl, 1.5));
    const currXP = state.currentXP || 0;
    const pct = Math.min(100, Math.round((currXP / reqXP) * 100));

    const lvlTitle = document.getElementById('profile-level-title');
    if (lvlTitle) lvlTitle.textContent = `Level ${lvl}`;

    const lvlBadge = document.getElementById('profile-avatar-lvl-badge');
    if (lvlBadge) lvlBadge.textContent = `Lv. ${lvl}`;

    const readout = document.getElementById('profile-xp-readout');
    if (readout) readout.textContent = `${currXP} / ${reqXP} XP`;

    const xpFill = document.getElementById('profile-xp-fill');
    if (xpFill) xpFill.style.width = `${pct}%`;

    const xpPct = document.getElementById('profile-xp-percent');
    if (xpPct) xpPct.textContent = `${pct}%`;

    // 6 Pillars HUD
    const hud = document.getElementById('pillars-hud');
    if (hud) {
      hud.innerHTML = Object.keys(window.PILLARS).map(key => {
        const p = window.PILLARS[key];
        const pLevel = state.pillarLevels ? (state.pillarLevels[key] || 1) : 1;
        const pXP = state.pillarXP ? (state.pillarXP[key] || 0) : 0;
        const pPct = Math.min(100, (pXP % 100));

        return `
          <div class="pillar-card specular-card" style="border-left: 3px solid ${p.color};">
            <div class="pillar-top-row">
              <div class="pillar-name-row">
                <span>${p.icon}</span>
                <span>${escapeHTML(p.name)}</span>
              </div>
              <span class="pillar-level-tag mono-bold" style="color:${p.color};">Lv. ${pLevel}</span>
            </div>
            <div class="pillar-track">
              <div class="pillar-bar-fill" style="width: ${pPct}%; background: ${p.color};"></div>
            </div>
            <span class="pillar-xp-text">${pXP} XP accrued</span>
          </div>
        `;
      }).join('');
    }

    // Trajectory Forecast
    const fc30 = document.getElementById('forecast-30-days');
    if (fc30) fc30.textContent = `Level ${lvl + 3}`;
    const fc90 = document.getElementById('forecast-90-days');
    if (fc90) fc90.textContent = `Level ${lvl + 7}`;
    const fc1y = document.getElementById('forecast-1-year');
    if (fc1y) fc1y.textContent = `Level ${lvl + 15}`;
  }

  // PAGE 3: Career Mastery Tree
  renderCareerPage(state) {
    if (!state) return;
    const trackEl = document.getElementById('hero-career-track');
    if (trackEl) trackEl.textContent = state.careerTrack || 'Software Engineer & Builder';

    const goalEl = document.getElementById('hero-life-goal');
    if (goalEl) goalEl.textContent = `"${state.lifeGoal || 'Master full-stack architecture, clean code, and production reliability.'}"`;

    const select = document.getElementById('career-switcher-select');
    if (select && state.careerTrack) select.value = state.careerTrack;

    const treeContainer = document.getElementById('career-milestones-tree');
    if (!treeContainer) return;

    const tree = state.careerTree || [];
    treeContainer.innerHTML = tree.map(tier => {
      return `
        <div class="tree-tier-card specular-card">
          <div class="tier-header-row">
            <div>
              <h4 class="tier-name">${escapeHTML(tier.tierName)}</h4>
              <span class="tier-subtitle">${escapeHTML(tier.subtitle || '')}</span>
            </div>
          </div>
          <div class="milestones-list">
            ${(tier.milestones || []).map(m => `
              <div class="milestone-item">
                <div class="milestone-info">
                  <button class="quest-checkbox-btn ${m.completed ? 'checked' : ''}" data-action="toggle-milestone" data-milestone-id="${m.id}">
                    ${m.completed ? '✓' : ''}
                  </button>
                  <div>
                    <span class="milestone-title" style="${m.completed ? 'text-decoration: line-through;' : ''}">${escapeHTML(m.title)}</span>
                    <p class="milestone-desc">${escapeHTML(m.desc || '')}</p>
                  </div>
                </div>
                <span class="quest-reward-tag">+${m.craftXP || 50} Craft</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  // PAGE 4: Relationships & Loved Ones
  renderRelationshipsPage(state) {
    if (!state) return;
    const container = document.getElementById('bonds-list-container');
    if (!container) return;

    const bonds = state.relationshipBonds || [];
    container.innerHTML = bonds.map(b => {
      return `
        <div class="bond-card specular-card">
          <div class="bond-header">
            <div>
              <h4 class="bond-name">${escapeHTML(b.name)}</h4>
              <span class="bond-role">${escapeHTML(b.role || 'Family')}</span>
            </div>
            <span class="bond-status-pill" style="background:${b.statusColor || '#10B981'}22; color:${b.statusColor || '#10B981'}; border:1px solid ${b.statusColor || '#10B981'}55;">
              ${escapeHTML(b.status || 'Warm')}
            </span>
          </div>
          <div class="bond-trust-row">
            <div class="trust-label-row">
              <span>Trust & Harmony Meter</span>
              <strong class="mono-bold">${b.trust || 50}%</strong>
            </div>
            <div class="trust-track">
              <div class="trust-bar-fill" style="width:${b.trust || 50}%;"></div>
            </div>
          </div>
          <p class="bond-notes">💭 ${escapeHTML(b.note || 'Appreciates calm communication and steady follow-through.')}</p>
          <button class="pill-btn secondary-btn" data-action="log-bond" data-bond-id="${b.id}" style="width:100%;">
            <span>✍️</span> Log Interaction & Reflection
          </button>
        </div>
      `;
    }).join('');
  }

  // PAGE 5: Shop & Economy
  renderShopPage(state) {
    if (!state) return;
    const balEl = document.getElementById('shop-page-balance');
    if (balEl) balEl.textContent = state.currency || 0;

    const container = document.getElementById('shop-page-items');
    if (!container) return;

    const defaultItems = [
      { key: 'shield_freeze', name: 'Streak Freeze Shield', desc: 'Protects consecutive streak when sick, traveling, or needing an earned rest day.', cost: 100, icon: '🛡️' },
      { key: 'coffee_buff', name: 'Artisan Espresso Boost', desc: 'High-energy focus buff for deep work mornings.', cost: 40, icon: '☕' },
      { key: 'game_pass', name: 'Guilt-Free Gaming Pass (2 Hours)', desc: 'Earned leisure time completely free of productivity guilt.', cost: 150, icon: '🎮' },
      { key: 'cheat_meal', name: 'Weekend Feast / Pizza Treat', desc: 'Earned culinary celebration after hitting weekly consistency.', cost: 400, icon: '🍕' }
    ];

    container.innerHTML = defaultItems.map(item => `
      <div class="shop-item-card specular-card">
        <div class="item-top">
          <span class="item-icon">${item.icon}</span>
          <div>
            <h4 class="item-name">${escapeHTML(item.name)}</h4>
            <p class="item-desc">${escapeHTML(item.desc)}</p>
          </div>
        </div>
        <div class="item-buy-row">
          <span class="item-price">🪙 ${item.cost} LC</span>
          <button class="pill-btn primary-btn" data-action="buy-shop-item" data-item-key="${item.key}" data-item-cost="${item.cost}" data-item-name="${escapeHTML(item.name)}">
            Acquire
          </button>
        </div>
      </div>
    `).join('');

    // Inventory
    const invContainer = document.getElementById('user-inventory-container');
    if (invContainer) {
      const inv = state.inventory || [];
      if (inv.length === 0) {
        invContainer.innerHTML = `<div style="grid-column: 1/-1; padding:20px; color:var(--text-muted); text-align:center;">No passes acquired yet. Complete daily quests to earn Life Credits!</div>`;
      } else {
        invContainer.innerHTML = inv.map(i => `
          <div class="inv-item-card specular-card">
            <span>🎁</span>
            <div>
              <strong>${escapeHTML(i.name)}</strong>
              <div style="font-size:0.75rem; color:var(--text-muted);">Active in inventory</div>
            </div>
          </div>
        `).join('');
      }
    }
  }

  // 2-Minute Paralysis Modal
  renderParalysisModal() {
    const list = document.getElementById('paralysis-micro-list');
    if (!list) return;

    const microQuests = window.PARALYSIS_MICRO_QUESTS || [
      { id: 'micro_1', title: 'Open blinds & let morning sunlight in', duration: '30 sec', pillar: 'Calm', xp: 10 },
      { id: 'micro_2', title: 'Drink a cold glass of water right now', duration: '1 min', pillar: 'Resilience', xp: 10 },
      { id: 'micro_3', title: 'Open code editor and write just 1 line', duration: '2 min', pillar: 'Craft', xp: 15 }
    ];

    list.innerHTML = microQuests.map(m => `
      <div class="micro-quest-item specular-card" style="display:flex; justify-content:space-between; align-items:center; padding:14px; margin-bottom:10px;">
        <div>
          <span style="font-size:0.75rem; color:var(--accent); font-weight:700;">⏱️ ${m.duration}</span>
          <h4 style="font-size:0.95rem; margin-top:2px;">${escapeHTML(m.title)}</h4>
        </div>
        <button class="pill-btn primary-btn" data-action="do-micro-habit" data-micro-id="${m.id}" data-micro-xp="${m.xp}">
          Done (+${m.xp} XP)
        </button>
      </div>
    `).join('');
  }
}

window.UI = new UIManager();
