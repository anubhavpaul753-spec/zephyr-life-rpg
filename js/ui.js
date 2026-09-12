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
    this.activeSectionId = 'sec-hero';
    this.currentWisdomIndex = 0;
    this.wisdomInterval = null;
  }

  // Master Render Loop
  render(state) {
    const isAuth = window.Auth && window.Auth.isAuthenticated();

    // Apply Active Theme Mode ('dark' or 'light')
    const activeTheme = state?.themeMode || 'dark';
    document.documentElement.setAttribute('data-theme', activeTheme);

    // Update Top Navigation Bar Status
    this.renderHeader(state, isAuth);

    // Render Hero / Auth Gateway
    this.renderHeroGateway(state, isAuth);

    // Render All Sections Concurrently for Continuous Scroll
    this.renderRoutineSection(state);
    this.renderMirrorSection(state);
    this.renderCareerSection(state);
    this.renderLovedOnesSection(state);
    this.renderShopSection(state);

    // Dynamic Rotating Wisdom Loop
    this.startWisdomRotation();

    // Sync Active Slider Pill
    this.updateActiveSliderPill(this.activeSectionId);
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

  // Top Nav Status Indicators
  renderHeader(state, isAuth) {
    const streakEl = document.getElementById('streak-count');
    if (streakEl) streakEl.textContent = state?.streak || 1;

    const currEl = document.getElementById('currency-count');
    if (currEl) currEl.textContent = state?.currency || 0;

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      if (isAuth) {
        logoutBtn.classList.remove('hidden');
        logoutBtn.title = 'Logout session';
      } else {
        logoutBtn.classList.add('hidden');
      }
    }
  }

  // Hero Section Gateway (Auth Box or Authenticated Command Center)
  renderHeroGateway(state, isAuth) {
    const gatewayBox = document.getElementById('hero-gateway-box');
    if (!gatewayBox) return;

    if (!isAuth) {
      gatewayBox.innerHTML = `
        <div class="auth-card raycast-card specular-card" id="auth-card-container">
          <div class="auth-tabs" id="auth-tab-switches">
            <button class="auth-tab-btn ${this.authTab === 'login' ? 'active' : ''}" data-tab="login">Sign In</button>
            <button class="auth-tab-btn ${this.authTab === 'register' ? 'active' : ''}" data-tab="register">Create Account</button>
          </div>
          <div id="auth-card-body"></div>
        </div>
      `;
      this.renderAuthForm();
    } else {
      const rank = this.computeRankTitle(state?.level || 1);
      const name = state?.fullName || state?.username || 'Adventurer';
      const track = state?.careerTrack || 'Software Engineer & Builder';

      gatewayBox.innerHTML = `
        <div class="hero-command-card raycast-card specular-card">
          <div class="command-card-top">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(state?.username || 'adventurer')}" class="command-card-avatar" alt="Avatar">
            <div>
              <div class="command-card-badge">LEVEL ${state?.level || 1} • ${escapeHTML(rank)}</div>
              <h3 class="command-card-title">Welcome back, ${escapeHTML(name)}</h3>
              <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:2px;">
                Path: <strong>${escapeHTML(track)}</strong> • Streak: <strong>🔥 ${state?.streak || 1}d</strong> • Balance: <strong>🪙 ${state?.currency || 0} LC</strong>
              </p>
            </div>
          </div>
          <div class="command-card-actions">
            <button class="pill-btn primary-btn" onclick="document.getElementById('sec-routine').scrollIntoView({behavior:'smooth'})">
              <span>📜</span> Execute Daily Routine
            </button>
            <button class="pill-btn secondary-btn" onclick="document.getElementById('sec-mirror').scrollIntoView({behavior:'smooth'})">
              <span>🪞</span> Audit Reality Mirror
            </button>
            <button class="pill-btn secondary-btn" onclick="document.getElementById('sec-career').scrollIntoView({behavior:'smooth'})">
              <span>🎯</span> Career Skill Tree
            </button>
          </div>
        </div>
      `;
    }
  }

  // Auth Forms (Sign In & Create Account — Clean, no dummy strings)
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

  // SECTION 2: Daily Routine
  renderRoutineSection(state) {
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
                <span style="color:var(--text-muted); font-size:0.75rem;">${escapeHTML(q.friction || 'Medium Friction')}</span>
              </div>
            </div>
          </div>
          <div class="quest-rewards">
            <span class="reward-xp">+${q.xp || 20} XP</span>
            <span class="reward-coins">+${q.coins || 5} 🪙</span>
            <!-- Hidden crossroads trigger when user considers abandoning a habit -->
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
    const lvl = state?.level || 1;
    const xp = state?.xp || 0;
    const reqXP = state?.xpToNextLevel || (100 * Math.pow(lvl, 1.5));
    const xpPct = Math.min(100, Math.round((xp / reqXP) * 100));

    const avatarImg = document.getElementById('profile-avatar-img');
    if (avatarImg) {
      avatarImg.src = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(state?.username || 'adventurer')}`;
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
    if (xpReadout) xpReadout.textContent = `${xp} / ${Math.round(reqXP)} XP`;

    const xpFill = document.getElementById('profile-xp-fill');
    if (xpFill) xpFill.style.width = `${xpPct}%`;

    const xpPctEl = document.getElementById('profile-xp-percent');
    if (xpPctEl) xpPctEl.textContent = `${xpPct}%`;

    // 6 Pillars HUD
    const pillarsContainer = document.getElementById('pillars-hud');
    if (pillarsContainer && window.PILLARS) {
      const userPillars = state?.pillars || {};
      pillarsContainer.innerHTML = Object.keys(window.PILLARS).map(key => {
        const pDef = window.PILLARS[key];
        const pState = userPillars[key] || { level: 1, xp: 0, metric: 'Consistent' };
        const pLevel = pState.level || 1;
        const pProgress = Math.min(100, (pState.xp % 100));

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
              <span>Metric: <strong>${escapeHTML(pState.metric || 'Groundwork Established')}</strong></span>
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

  // SECTION 4: Career Skill Tree
  renderCareerSection(state) {
    const track = state?.careerTrack || 'Software Engineer & Builder';
    const goal = state?.lifeGoal || 'Master full-stack architecture, clean code, and production reliability.';

    const trackNameEl = document.getElementById('hero-career-track');
    if (trackNameEl) trackNameEl.textContent = track;

    const goalEl = document.getElementById('hero-life-goal');
    if (goalEl) goalEl.textContent = `"${goal}"`;

    const selectEl = document.getElementById('career-switcher-select');
    if (selectEl && selectEl.value !== track) {
      selectEl.value = track;
    }

    const treeContainer = document.getElementById('career-milestones-tree');
    if (!treeContainer) return;

    // Get preset or user-defined tree
    const tiers = (state?.careerTree && state.careerTree.length > 0)
      ? state.careerTree
      : (window.CAREER_TREE_PRESETS ? (window.CAREER_TREE_PRESETS[track] || window.CAREER_TREE_PRESETS['Software Engineer & Builder']) : []);

    if (!tiers || tiers.length === 0) {
      treeContainer.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted);">No career milestones loaded yet. Click <strong>AI Blueprint Generator</strong> to generate one!</div>`;
      return;
    }

    treeContainer.innerHTML = tiers.map(tier => {
      const milestonesHtml = (tier.milestones || []).map(m => {
        const isCompleted = !!m.completed;
        return `
          <div class="milestone-item ${isCompleted ? 'completed' : ''}">
            <button class="quest-checkbox ${isCompleted ? 'checked' : ''}" 
                    data-action="toggle-milestone" 
                    data-milestone-id="${m.id}" 
                    aria-label="Toggle milestone: ${escapeHTML(m.title)}">
              ${isCompleted ? '✓' : ''}
            </button>
            <div class="milestone-info">
              <span class="milestone-title">${escapeHTML(m.title)}</span>
              <p class="milestone-desc">${escapeHTML(m.desc)}</p>
            </div>
            <div class="milestone-rewards">
              <span class="reward-xp">+${m.craftXP || 50} Craft XP</span>
              <span class="reward-coins">+${m.coins || 25} 🪙</span>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="career-tier-block raycast-card specular-card">
          <div class="tier-header">
            <div class="tier-title-wrap">
              <span class="tier-tag">${escapeHTML(tier.tierName || `Tier ${tier.tierId}`)}</span>
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
    const bondsContainer = document.getElementById('bonds-list-container');
    if (!bondsContainer) return;

    const bonds = state?.bonds || [];
    if (bonds.length === 0) {
      bondsContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding:40px; color:var(--text-muted); background:var(--bg-subtle); border-radius:var(--radius-lg);">No loved ones registered yet. Click <strong>+ Add Loved One</strong> to prioritize human connections.</div>`;
      return;
    }

    bondsContainer.innerHTML = bonds.map(b => {
      const trust = b.trustMeter || 50;
      const streak = b.patienceStreak || 0;
      const lastAction = b.lastAction || 'Active unhurried listening during family conversation.';

      return `
        <div class="bond-card raycast-card specular-card">
          <div class="bond-card-header">
            <div class="bond-identity">
              <span class="bond-avatar">${b.avatar || '🤝'}</span>
              <div>
                <h4 class="bond-name">${escapeHTML(b.name)}</h4>
                <span class="bond-role">${escapeHTML(b.relation)}</span>
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

  // SECTION 6: Guild Shop & Economy
  renderShopSection(state) {
    const balEl = document.getElementById('shop-page-balance');
    if (balEl) balEl.textContent = state?.currency || 0;

    const itemsContainer = document.getElementById('shop-page-items');
    if (itemsContainer) {
      const shopItems = [
        { key: 'streak_freeze', name: 'Streak Freeze Shield', cost: 40, icon: '🛡️', desc: 'Protects your habit streak when illness or urgent emergencies happen.' },
        { key: 'protein_feast', name: 'High-Protein Feast Pass', cost: 35, icon: '🥩', desc: 'Earned guilt-free dinner at your favorite restaurant after 5 days of consistency.' },
        { key: 'gaming_pass', name: 'Guilt-Free Gaming Pass', cost: 50, icon: '🎮', desc: '2 hours of unhurried gaming with zero guilt after hitting daily high-leverage milestones.' },
        { key: 'nature_walk', name: 'Deep Nature Walk Pass', cost: 25, icon: '🌲', desc: 'A serene afternoon walk in the forest/park to decompress and recharge mental stamina.' },
        { key: 'espresso_book', name: 'Espresso & Quiet Book Pass', cost: 20, icon: '☕', desc: '90 minutes in a quiet cafe reading foundational non-fiction without checking phone.' }
      ];

      itemsContainer.innerHTML = shopItems.map(item => `
        <div class="shop-item-card raycast-card specular-card">
          <div class="shop-item-header">
            <span class="shop-item-icon">${item.icon}</span>
            <div>
              <h4 class="shop-item-name">${escapeHTML(item.name)}</h4>
              <p class="shop-item-desc">${escapeHTML(item.desc)}</p>
            </div>
          </div>
          <div class="shop-item-footer">
            <span class="shop-item-cost">🪙 ${item.cost} LC</span>
            <button class="pill-btn primary-btn" 
                    data-action="buy-shop-item" 
                    data-item-key="${item.key}" 
                    data-item-name="${escapeHTML(item.name)}" 
                    data-item-cost="${item.cost}">
              Purchase
            </button>
          </div>
        </div>
      `).join('');
    }

    // Acquired Inventory
    const invContainer = document.getElementById('user-inventory-container');
    if (invContainer) {
      const inv = state?.inventory || [];
      if (inv.length === 0) {
        invContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding:24px; color:var(--text-muted); background:var(--bg-subtle); border-radius:var(--radius-md);">No purchased rewards in inventory yet. Complete daily quests to earn Life Credits!</div>`;
      } else {
        invContainer.innerHTML = inv.map(it => `
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

  // Paralysis Breaker Micro-Habits Modal
  renderParalysisModal() {
    const list = document.getElementById('paralysis-micro-list');
    if (!list) return;

    const microHabits = [
      { id: 'water', title: 'Drink one tall glass of water', icon: '💧', xp: 10 },
      { id: 'breathe', title: 'Take 5 deep box breaths (4s in, 4s hold, 4s out)', icon: '🫁', xp: 15 },
      { id: 'shoes', title: 'Put on walking shoes and step outside for 60 seconds', icon: '👟', xp: 20 },
      { id: 'clean', title: 'Clear 3 items off your desk or bed', icon: '🧹', xp: 15 },
      { id: 'editor', title: 'Open code editor and write just 1 line of comments', icon: '💻', xp: 20 }
    ];

    list.innerHTML = microHabits.map(m => `
      <div style="display:flex; align-items:center; justify-content:space-between; padding:14px; background:var(--bg-subtle); border-radius:var(--radius-md); margin-bottom:10px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:1.3rem;">${m.icon}</span>
          <span style="font-size:0.9rem; font-weight:600;">${escapeHTML(m.title)}</span>
        </div>
        <button class="pill-btn primary-btn" data-action="do-micro-habit" data-micro-xp="${m.xp}">
          Do Now (+${m.xp} XP)
        </button>
      </div>
    `).join('');
  }

  // Rotating Wisdom Loop (Unhurried cross-fade every 7s)
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

  updateWisdomText() {
    const quote = ROTATING_WISDOM[this.currentWisdomIndex];
    const textEl = document.getElementById('dynamic-wisdom-text');
    const authorEl = document.getElementById('wisdom-author');
    if (textEl && quote) textEl.textContent = `"${quote.text}"`;
    if (authorEl && quote) authorEl.textContent = `— ${quote.author}`;
  }
}

window.UI = new UIManager();
