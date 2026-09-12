/**
 * MIRROR — Main Controller & Event Bus
 * Multi-Page Navigation, Crossroads Trigger, Auth Handlers, Toast Engine
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

  // Helper: Open / Close Modals
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

  // 3. Central Click Delegator
  document.addEventListener('click', async e => {
    // Landing Page CTAs
    if (e.target.id === 'landing-signin-btn') {
      const authBox = document.querySelector('.landing-auth-center');
      if (authBox) authBox.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Landing Theme Toggle
    if (e.target.id === 'landing-theme-toggle' || e.target.closest('#theme-toggle-btn')) {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      store.setThemeMode(next);
      return;
    }

    // Auth Tab Switch (Sign In vs Create Account)
    const authTabBtn = e.target.closest('.auth-tab-btn');
    if (authTabBtn && authTabBtn.dataset.tab) {
      ui.setAuthTab(authTabBtn.dataset.tab);
      return;
    }

    // Multi-Page Navigation Tabs
    const navBtn = e.target.closest('.nav-tab-btn');
    if (navBtn && navBtn.dataset.page) {
      ui.switchPage(navBtn.dataset.page, store.state);
      return;
    }

    // Sound Toggle
    if (e.target.closest('#sound-toggle-btn')) {
      store.toggleSound();
      showToast(store.state.soundEnabled ? 'Audio feedback enabled' : 'Audio muted');
      return;
    }

    // Logout Button
    if (e.target.closest('#logout-btn')) {
      if (confirm('Log out from your current session? All your progress has been securely saved.')) {
        auth.logout();
        ui.render(null);
        showToast('Logged out successfully.');
      }
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
      ui.renderRoutinePage(store.state);
      return;
    }

    // Milestone Checkbox Toggle
    const mBtn = e.target.closest('[data-action="toggle-milestone"]');
    if (mBtn) {
      const mId = mBtn.dataset.milestoneId;
      store.toggleMilestone(mId);
      celebrate.playChime('levelup');
      celebrate.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 24, true);
      ui.renderCareerPage(store.state);
      showToast('Milestone achieved! Craft XP awarded.');
      return;
    }

    // New Day Reset
    if (e.target.closest('#reset-day-btn')) {
      if (confirm('Reset daily checklist for a fresh day? Completed habits will be unchecked.')) {
        store.resetDailyRoutine();
        ui.renderRoutinePage(store.state);
        showToast('Daily routine reset. Time to execute!');
      }
      return;
    }

    // Filter Tabs
    const fTab = e.target.closest('.filter-tab');
    if (fTab && fTab.dataset.filter) {
      store.setFilter(fTab.dataset.filter);
      document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      fTab.classList.add('active');
      ui.renderRoutinePage(store.state);
      return;
    }

    // Open Paralysis Breaker Modal
    if (e.target.closest('#paralysis-breaker-btn')) {
      ui.renderParalysisModal();
      openModal('paralysis-modal');
      return;
    }

    // Do Micro Habit
    const microBtn = e.target.closest('[data-action="do-micro-habit"]');
    if (microBtn) {
      const xp = parseInt(microBtn.dataset.microXp || '10', 10);
      store.addXP(xp, 'Calm');
      celebrate.playChime('success');
      showToast(`Momentum broken! +${xp} XP awarded.`);
      closeModal('paralysis-modal');
      return;
    }

    // Trigger Hidden Crossroads Modal (Interception Circuit-Breaker)
    if (e.target.closest('#abandon-career-trigger')) {
      openModal('crossroads-modal');
      return;
    }

    // Crossroads Decisions
    if (e.target.id === 'crossroads-choose-stay') {
      store.addXP(25, 'Discipline');
      closeModal('crossroads-modal');
      showToast('Respect for persisting through friction. +25 Discipline XP.');
      return;
    }

    if (e.target.id === 'crossroads-choose-pivot') {
      store.addXP(60, 'Calm');
      closeModal('crossroads-modal');
      showToast('Goal safely archived. +60 Wisdom XP converted.');
      return;
    }

    // Open AI Generator Modal
    if (e.target.closest('#ai-generator-btn')) {
      openModal('ai-generator-modal');
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
      ui.renderShopPage(store.state);
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

    // Close on backdrop click
    if (e.target.classList.contains('modal-backdrop')) {
      e.target.classList.add('hidden');
      return;
    }
  });

  // 4. Form Submissions (Auth & Generators)
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
      ui.renderRelationshipsPage(store.state);
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
      ui.renderCareerPage(store.state);
      showToast('AI Blueprint synthesized! Check your updated skill tree.');
      return;
    }
  });

  // Career Switcher Change Listener
  document.addEventListener('change', e => {
    if (e.target.id === 'career-switcher-select') {
      store.switchCareerTrack(e.target.value);
      ui.renderCareerPage(store.state);
      showToast(`Active career switched to ${e.target.value}.`);
    }
  });
});
