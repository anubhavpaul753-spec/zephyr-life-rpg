/**
 * DAILYLIFE (Project Mirror) — Main Controller & Event Bus
 * Orchestrates authentication, Netflix intro effects, AI generator, theme toggles, and modals.
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.AppStore;
  const ui = window.UI;
  const celebrate = window.Celebration;
  const auth = window.Auth;

  // 1. Initial Render & Sound Unlock
  ui.render(store.state);

  // Play Netflix-style intro sound on initial load if user clicks anywhere or hits replay
  const replayBtn = document.getElementById('replay-netflix-intro');
  if (replayBtn) {
    replayBtn.addEventListener('click', triggerNetflixIntro);
  }

  function triggerNetflixIntro() {
    celebrate.playNetflixIntroSound();
    const logo = document.querySelector('.netflix-logo-text');
    if (logo) {
      logo.style.animation = 'none';
      void logo.offsetWidth; // trigger reflow
      logo.style.animation = 'netflixCinematicZoom 2.2s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    }
  }

  // 2. Subscribe UI updates to Central State
  store.subscribe(state => {
    ui.render(state);
  });

  // 3. Central Click Delegator
  document.addEventListener('click', e => {
    // Auth Tab Switch (Login vs Register)
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
      return;
    }

    // Micro Quest in Paralysis Breaker
    const microBtn = e.target.closest('[data-action="do-micro-quest"]');
    if (microBtn) {
      const mId = microBtn.dataset.microId;
      const res = store.completeMicroQuest(mId);
      if (res) {
        celebrate.celebrateQuestCompletion(microBtn, res);
        closeModal('paralysis-modal');
      }
      return;
    }

    // Filter tabs click
    const filterBtn = e.target.closest('.filter-tab');
    if (filterBtn && filterBtn.dataset.filter) {
      ui.setQuestFilter(filterBtn.dataset.filter);
      return;
    }

    // Theme Mode Toggle (Dark vs Light)
    if (e.target.closest('#theme-toggle-btn') || e.target.closest('#auth-theme-toggle')) {
      store.toggleThemeMode();
      return;
    }

    // Sound Toggle
    if (e.target.closest('#sound-toggle-btn')) {
      store.toggleSound();
      return;
    }

    // Logout Button
    if (e.target.closest('#logout-btn')) {
      if (confirm('Log out from your current session? All your progress has been securely saved.')) {
        auth.logout();
        ui.render(null);
      }
      return;
    }

    // Open Paralysis Breaker Modal
    if (e.target.closest('#paralysis-breaker-btn')) {
      ui.renderParalysisModal();
      openModal('paralysis-modal');
      return;
    }

    // Open AI Blueprint Generator Modal
    if (e.target.closest('#ai-generator-btn')) {
      openModal('ai-generator-modal');
      return;
    }

    // Open Custom Quest Modal
    if (e.target.closest('#add-custom-quest-btn')) {
      openModal('custom-quest-modal');
      return;
    }

    // Close Modals
    if (e.target.closest('.modal-close-btn') || e.target.classList.contains('modal-backdrop')) {
      const modal = e.target.closest('.modal-backdrop');
      if (modal) modal.classList.add('hidden');
      return;
    }

    // Dismiss Level Up Modal
    if (e.target.closest('#dismiss-levelup-btn')) {
      closeModal('level-up-modal');
      return;
    }
  });

  // 4. Form Submissions (Auth & Generators)
  document.addEventListener('submit', e => {
    // Login Form Submit
    if (e.target.id === 'login-form') {
      e.preventDefault();
      const u = document.getElementById('login-username').value;
      const p = document.getElementById('login-password').value;
      const res = auth.login(u, p);
      if (res.success) {
        triggerNetflixIntro();
        store.loadActiveUserState();
        ui.render(store.state);
      } else {
        alert(res.message);
      }
      return;
    }

    // Register Form Submit
    if (e.target.id === 'register-form') {
      e.preventDefault();
      const full = document.getElementById('reg-fullname').value;
      const u = document.getElementById('reg-username').value;
      const p = document.getElementById('reg-password').value;
      const c = document.getElementById('reg-careertrack').value;
      const res = auth.register(u, p, full, c);
      if (res.success) {
        triggerNetflixIntro();
        store.loadActiveUserState();
        ui.render(store.state);
      } else {
        alert(res.message);
      }
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
      return;
    }

    // Custom Quest Form Submit
    if (e.target.id === 'custom-quest-form') {
      e.preventDefault();
      const title = document.getElementById('custom-title').value;
      const time = document.getElementById('custom-time').value;
      const pillar = document.getElementById('custom-pillar').value;
      const xp = document.getElementById('custom-xp').value;
      const coins = document.getElementById('custom-coins').value;
      const note = document.getElementById('custom-note').value;

      store.addCustomQuest(title, time, pillar, xp, coins, note);
      celebrate.playChime('quest');
      closeModal('custom-quest-modal');
      return;
    }
  });

  // 5. Keyboard Accessibility
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
    }
  });

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  }
});
