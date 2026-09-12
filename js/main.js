/**
 * MIRROR — Main Controller & Event Bus (Linear + Raycast Aesthetic)
 * Continuous Scroll Navigation, Active Slider Pill Spy, Raycast Mouse Spotlight, Modal Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.AppStore;
  const ui = window.UI;
  const celebrate = window.Celebration;
  const auth = window.Auth;

  // 1. Initial Render
  ui.render(store.state);

  // 2. Subscribe UI updates
  store.subscribe(state => {
    ui.render(state);
  });

  // Modal Helpers
  function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('hidden');
  }

  function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('hidden');
  }

  function showToast(msg, icon = '✦') {
    const portal = document.getElementById('toast-container');
    if (!portal) return;
    const item = document.createElement('div');
    item.className = 'toast-item';
    item.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
    portal.appendChild(item);
    setTimeout(() => item.remove(), 4000);
  }

  // -------------------------------------------------------------------------
  // 3. LINEAR SCROLL-SPY & ACTIVE SLIDER PILL CONTROLLER
  // -------------------------------------------------------------------------
  let isSmoothScrolling = false;

  function updateScrollSpy() {
    if (isSmoothScrolling) return;

    const sections = [
      'sec-hero',
      'sec-routine',
      'sec-mirror',
      'sec-career',
      'sec-lovedones',
      'sec-shop'
    ];

    const scrollPosition = window.scrollY + 140; // Offset for sticky navbar
    let currentActive = sections[0];

    for (const secId of sections) {
      const el = document.getElementById(secId);
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollPosition >= top && scrollPosition < top + height) {
          currentActive = secId;
          break;
        }
      }
    }

    // Edge check: near bottom of page
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 80)) {
      currentActive = 'sec-shop';
    }

    if (currentActive !== ui.activeSectionId) {
      ui.updateActiveSliderPill(currentActive);
    }
  }

  window.addEventListener('scroll', updateScrollSpy, { passive: true });
  window.addEventListener('resize', () => {
    ui.updateActiveSliderPill(ui.activeSectionId);
  }, { passive: true });

  // Initial pill placement after styles compute
  setTimeout(() => {
    ui.updateActiveSliderPill('sec-hero');
  }, 100);

  // -------------------------------------------------------------------------
  // 4. RAYCAST MOUSE SPOTLIGHT / CORNER REFLECTION
  // -------------------------------------------------------------------------
  document.addEventListener('mousemove', e => {
    const cards = document.querySelectorAll('.raycast-card, .specular-card');
    const clientX = e.clientX;
    const clientY = e.clientY;
    const windowH = window.innerHeight;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const rect = card.getBoundingClientRect();
      
      // Skip offscreen elements
      if (rect.bottom < 0 || rect.top > windowH) continue;

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Update if within interactive radius
      if (x >= -60 && x <= rect.width + 60 && y >= -60 && y <= rect.height + 60) {
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      }
    }
  }, { passive: true });

  // -------------------------------------------------------------------------
  // 5. CENTRAL CLICK DISPATCHER
  // -------------------------------------------------------------------------
  document.addEventListener('click', async e => {
    // Navigation Tab Click (Smooth Scroll + Pill Slide)
    const navBtn = e.target.closest('.nav-tab-btn');
    if (navBtn && navBtn.dataset.target) {
      const targetId = navBtn.dataset.target;
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        isSmoothScrolling = true;
        ui.updateActiveSliderPill(targetId);
        targetSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => { isSmoothScrolling = false; }, 600);
      }
      return;
    }

    // Theme Toggle (Dark Midnight vs Warm Autumn Light)
    if (e.target.closest('#theme-toggle-btn')) {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      store.setThemeMode(next);
      showToast(next === 'light' ? 'Autumn Golden Sanctuary activated 🍂' : 'Raycast Midnight Engine activated 🌌');
      return;
    }

    // Sound Toggle
    if (e.target.closest('#sound-toggle-btn')) {
      store.toggleSound();
      showToast(store.state.soundEnabled ? 'Audio feedback enabled 🔔' : 'Audio muted 🔕');
      return;
    }

    // Logout
    if (e.target.closest('#logout-btn')) {
      if (confirm('Log out from your current session? All your progress has been securely saved.')) {
        auth.logout();
        store.state = null;
        ui.render(null);
        showToast('Logged out successfully.');
      }
      return;
    }

    // Auth Tab Switch (Sign In vs Create Account)
    const authTabBtn = e.target.closest('.auth-tab-btn');
    if (authTabBtn && authTabBtn.dataset.tab) {
      ui.setAuthTab(authTabBtn.dataset.tab);
      return;
    }

    // Quest Checkbox Toggle
    const toggleBtn = e.target.closest('[data-action="toggle-quest"]');
    if (toggleBtn) {
      const qId = toggleBtn.dataset.questId;
      const res = store.toggleQuest(qId);
      if (res && res.isCompleted) {
        celebrate.celebrateQuestCompletion(toggleBtn, res);
      }
      ui.renderRoutineSection(store.state);
      ui.renderMirrorSection(store.state);
      ui.renderHeader(store.state, auth.isAuthenticated());
      return;
    }

    // Abandon Quest Trigger (Hidden Crossroads circuit-breaker)
    if (e.target.closest('[data-action="abandon-quest-trigger"]') || e.target.closest('#abandon-career-trigger')) {
      openModal('crossroads-modal');
      return;
    }

    // Crossroads Decisions
    if (e.target.id === 'crossroads-choose-stay') {
      store.addXP(25, 'Discipline');
      closeModal('crossroads-modal');
      celebrate.playChime('success');
      showToast('Respect for persisting through resistance. +25 Discipline XP.');
      ui.renderMirrorSection(store.state);
      return;
    }

    if (e.target.id === 'crossroads-choose-pivot') {
      store.addXP(60, 'Calm');
      closeModal('crossroads-modal');
      celebrate.playChime('success');
      showToast('Track safely archived. +60 Wisdom XP converted.');
      ui.renderMirrorSection(store.state);
      return;
    }

    // Milestone Checkbox Toggle
    const mBtn = e.target.closest('[data-action="toggle-milestone"]');
    if (mBtn) {
      const mId = mBtn.dataset.milestoneId;
      store.toggleMilestone(mId);
      celebrate.playChime('levelup');
      celebrate.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 24, true);
      ui.renderCareerSection(store.state);
      ui.renderMirrorSection(store.state);
      ui.renderHeader(store.state, auth.isAuthenticated());
      showToast('Milestone achieved! Craft XP & Coins awarded.');
      return;
    }

    // New Day Reset
    if (e.target.closest('#reset-day-btn')) {
      if (confirm('Reset daily checklist for a fresh day? Completed habits will be unchecked.')) {
        store.resetDailyRoutine();
        ui.renderRoutineSection(store.state);
        showToast('Daily checklist reset. Time to execute!');
      }
      return;
    }

    // Routine Filter Tabs
    const fTab = e.target.closest('.filter-tab');
    if (fTab && fTab.dataset.filter) {
      store.setFilter(fTab.dataset.filter);
      document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      fTab.classList.add('active');
      ui.renderRoutineSection(store.state);
      return;
    }

    // Open Paralysis Breaker Modal
    if (e.target.closest('#paralysis-breaker-btn')) {
      ui.renderParalysisModal();
      openModal('paralysis-modal');
      return;
    }

    // Execute Micro-Habit
    const microBtn = e.target.closest('[data-action="do-micro-habit"]');
    if (microBtn) {
      const xp = parseInt(microBtn.dataset.microXp || '10', 10);
      store.addXP(xp, 'Calm');
      celebrate.playChime('success');
      showToast(`Paralysis broken! +${xp} XP awarded.`);
      closeModal('paralysis-modal');
      ui.renderMirrorSection(store.state);
      return;
    }

    // Open AI Generator Modal
    if (e.target.closest('#ai-generator-btn')) {
      openModal('ai-generator-modal');
      return;
    }

    // Add Loved One Bond Button
    if (e.target.closest('#add-bond-btn')) {
      const name = prompt('Enter loved one's name (e.g. Mom, Maya, Sarah):');
      if (name && name.trim()) {
        const relation = prompt('Enter relationship (e.g. Mother, Partner, Mentor, Sibling):') || 'Loved One';
        if (!store.state.bonds) store.state.bonds = [];
        store.state.bonds.push({
          id: 'bond_' + Date.now(),
          name: name.trim(),
          relation: relation.trim(),
          avatar: '🤝',
          trustMeter: 65,
          patienceStreak: 1,
          lastAction: 'Registered bond in Mirror'
        });
        store.save();
        ui.renderLovedOnesSection(store.state);
        showToast(`Bond with ${name.trim()} added!`);
      }
      return;
    }

    // Log Bond Interaction Modal
    const logBondBtn = e.target.closest('[data-action="log-bond"]');
    if (logBondBtn) {
      const bId = logBondBtn.dataset.bondId;
      const bInput = document.getElementById('rel-bond-id');
      if (bInput) bInput.value = bId;
      openModal('relationship-log-modal');
      return;
    }

    // Shop Item Purchase
    const buyBtn = e.target.closest('[data-action="buy-shop-item"]');
    if (buyBtn) {
      const cost = parseInt(buyBtn.dataset.itemCost || '0', 10);
      const name = buyBtn.dataset.itemName;
      const key = buyBtn.dataset.itemKey;

      if ((store.state.currency || 0) < cost) {
        showToast(`Insufficient Life Credits. Need ${cost} LC.`, '⚠️');
        return;
      }

      store.state.currency -= cost;
      if (!store.state.inventory) store.state.inventory = [];
      store.state.inventory.push({ key, name, acquiredAt: new Date().toISOString() });
      store.save();
      celebrate.playChime('levelup');
      ui.renderShopSection(store.state);
      ui.renderHeader(store.state, auth.isAuthenticated());
      showToast(`Acquired ${name}! Enjoy your earned reward.`);
      return;
    }

    // Dismiss Level Up Modal
    if (e.target.id === 'dismiss-levelup-btn') {
      closeModal('level-up-modal');
      return;
    }

    // Generic Modal Close Buttons
    const closeBtn = e.target.closest('[data-close]');
    if (closeBtn) {
      closeModal(closeBtn.dataset.close);
      return;
    }

    // Close Modal on backdrop click
    if (e.target.classList.contains('modal-backdrop')) {
      e.target.classList.add('hidden');
      return;
    }
  });

  // -------------------------------------------------------------------------
  // 6. FORM SUBMISSIONS
  // -------------------------------------------------------------------------
  document.addEventListener('submit', async e => {
    // Login Form Submit
    if (e.target.id === 'login-form') {
      e.preventDefault();
      const submitBtn = document.getElementById('login-submit-btn');
      const errBox = document.getElementById('auth-error-box');
      if (errBox) errBox.classList.add('hidden');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Authenticating...'; }

      const u = document.getElementById('login-username').value;
      const p = document.getElementById('login-password').value;
      const res = await auth.login(u, p);

      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Enter Mirror →'; }

      if (res.success) {
        store.loadActiveUserState();
        ui.render(store.state);
        showToast(`Welcome back, ${store.state.fullName || u}!`);
      } else {
        if (errBox) {
          errBox.textContent = res.message;
          errBox.classList.remove('hidden');
        } else {
          alert(res.message);
        }
      }
      return;
    }

    // Register Form Submit
    if (e.target.id === 'register-form') {
      e.preventDefault();
      const submitBtn = document.getElementById('register-submit-btn');
      const errBox = document.getElementById('auth-error-box');
      if (errBox) errBox.classList.add('hidden');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Creating Account...'; }

      const full = document.getElementById('reg-fullname').value;
      const u = document.getElementById('reg-username').value;
      const p = document.getElementById('reg-password').value;
      const c = document.getElementById('reg-careertrack').value;
      const res = await auth.register(u, p, full, c);

      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Create Account & Ascend →'; }

      if (res.success) {
        store.loadActiveUserState();
        ui.render(store.state);
        showToast(`Welcome to Mirror, ${full || u}!`);
      } else {
        if (errBox) {
          errBox.textContent = res.message;
          errBox.classList.remove('hidden');
        } else {
          alert(res.message);
        }
      }
      return;
    }

    // Relationship Log Form Submit
    if (e.target.id === 'relationship-log-form') {
      e.preventDefault();
      const bId = document.getElementById('rel-bond-id').value;
      const action = document.getElementById('rel-action-input').value;
      const reflection = document.getElementById('rel-reflection-input').value;

      store.logRelationshipInteraction(bId, action, reflection);
      closeModal('relationship-log-modal');
      celebrate.playChime('success');
      ui.renderLovedOnesSection(store.state);
      ui.renderMirrorSection(store.state);
      showToast('Interaction logged! +25 Empathy XP.');
      return;
    }

    // AI Blueprint Generator Submit
    if (e.target.id === 'ai-blueprint-form') {
      e.preventDefault();
      const track = document.getElementById('ai-career-input').value;
      const goal = document.getElementById('ai-goal-input').value;
      store.generateAIBlueprint(track, goal);
      celebrate.playChime('levelup');
      celebrate.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 28, true);
      closeModal('ai-generator-modal');
      ui.renderCareerSection(store.state);
      showToast('AI Blueprint synthesized! Check your updated skill tree.');
      return;
    }
  });

  // Career Switcher Change Listener
  document.addEventListener('change', e => {
    if (e.target.id === 'career-switcher-select') {
      store.switchCareerTrack(e.target.value);
      ui.renderCareerSection(store.state);
      showToast(`Active career switched to ${e.target.value}.`);
    }
  });
});
