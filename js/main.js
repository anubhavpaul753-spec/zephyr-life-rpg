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
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('demo') === 'true' && !auth.isAuthenticated()) {
    auth.login('arpita', '123');
    store.loadActiveUserState();
  }
  if (urlParams.get('theme')) {
    store.setThemeMode(urlParams.get('theme'));
  }

  ui.render(store.state);

  if (urlParams.get('tab')) {
    ui.setQuestFilter(urlParams.get('tab'));
  }
  if (urlParams.get('openBondModal')) {
    ui.openInteractionModal(urlParams.get('openBondModal'));
  }
  if (urlParams.get('openParalysisModal')) {
    ui.renderParalysisModal();
    openModal('paralysis-modal');
  }
  if (urlParams.get('openCrossroadsModal')) {
    ui.renderCrossroadsModal(parseInt(urlParams.get('crossroadsStage') || '1', 10));
    openModal('crossroads-modal');
  }

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

    // Career Milestone Toggle
    const milestoneBtn = e.target.closest('[data-action="toggle-career-milestone"]');
    if (milestoneBtn) {
      const mId = milestoneBtn.dataset.milestoneId;
      const res = store.toggleCareerMilestone(mId);
      if (res && res.isCompleted) {
        celebrate.playChime(res.didLevelUp ? 'levelup' : 'quest');
        const rect = milestoneBtn.getBoundingClientRect();
        celebrate.spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 24);
        celebrate.showQuoteToast(`Milestone Achieved: ${res.milestone.title}! (+${res.xpGained} XP, +${res.coinsGained} 🪙)`);
        if (res.didLevelUp) {
          setTimeout(() => {
            const lvlEl = document.getElementById('modal-new-level');
            const bonusEl = document.getElementById('modal-level-bonus');
            if (lvlEl) lvlEl.textContent = `Level ${res.newLevel}!`;
            if (bonusEl) bonusEl.textContent = `You unlocked +20 Life Credits & advanced your ${res.careerTrack} mastery!`;
            openModal('level-up-modal');
            celebrate.playChime('levelup');
          }, 350);
        }
      }
      return;
    }

    // Pillar Mini Card Click (Filter / Highlight)
    const pillarCard = e.target.closest('.pillar-mini-card');
    if (pillarCard && pillarCard.dataset.pillar) {
      const pKey = pillarCard.dataset.pillar;
      celebrate.playChime('quest');
      const rect = pillarCard.getBoundingClientRect();
      celebrate.spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 16);
      celebrate.showQuoteToast(`Pillar Focused: ${pKey} Matrix Active.`);
      return;
    }

    // Micro Quest in Paralysis Breaker
    const microBtn = e.target.closest('[data-action="do-micro-quest"]');
    if (microBtn) {
      const mId = microBtn.dataset.microId;
      const res = store.completeMicroQuest(mId);
      if (res) {
        celebrate.playChime('quest');
        const rect = microBtn.getBoundingClientRect();
        celebrate.spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 22);
        celebrate.showQuoteToast(`Micro-Habit Complete: ${res.quest.title}! +${res.xpGained} ${res.quest.pillar} XP awarded.`);
        ui.renderParalysisModal();
        if (res.leveledUp) {
          setTimeout(() => {
            const bonusEl = document.getElementById('levelup-bonuses');
            if (bonusEl) bonusEl.textContent = `You broke paralysis and ascended to Level ${res.newLevel}!`;
            openModal('level-up-modal');
            celebrate.playChime('levelup');
          }, 350);
        }
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

    // Open Paralysis Breaker Modal (Hero button or Routine banner button)
    if (e.target.closest('#paralysis-breaker-btn') || e.target.closest('#open-paralysis-routine-btn') || e.target.closest('[data-action="open-paralysis-modal"]')) {
      ui.renderParalysisModal();
      openModal('paralysis-modal');
      return;
    }

    // Open The Crossroads Decision Matrix Modal
    if (e.target.closest('#crossroads-btn') || e.target.closest('#career-crossroads-btn') || e.target.closest('[data-action="open-crossroads-modal"]')) {
      ui.renderCrossroadsModal(1);
      openModal('crossroads-modal');
      return;
    }

    // Navigate Crossroads Stages (Stage 1 -> 2 -> 3)
    const stageBtn = e.target.closest('[data-action="crossroads-goto-stage"]');
    if (stageBtn && stageBtn.dataset.stage) {
      ui.renderCrossroadsModal(parseInt(stageBtn.dataset.stage, 10));
      return;
    }

    // Crossroads Action: Take Earned Rest Day
    if (e.target.closest('[data-action="take-rest-day"]')) {
      const res = store.takeEarnedRestDay();
      celebrate.playChime('quest');
      celebrate.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 20);
      celebrate.showQuoteToast("Earned Rest Day activated (+15 Calm XP). Honor your physiological baseline.");
      closeModal('crossroads-modal');
      return;
    }

    // Crossroads Action: Stay the Course
    if (e.target.closest('[data-action="stay-the-course"]')) {
      const res = store.stayTheCourseCrossroads();
      celebrate.playChime('levelup');
      celebrate.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 28, true);
      celebrate.showQuoteToast(`Commitment Renewed! +30 Discipline XP, +15 Life Credits.`);
      if (res.leveledUp) {
        setTimeout(() => {
          const bonusEl = document.getElementById('levelup-bonuses');
          if (bonusEl) bonusEl.textContent = `Ascended in Level through sheer fortitude and discipline!`;
          openModal('level-up-modal');
          celebrate.playChime('levelup');
        }, 350);
      }
      closeModal('crossroads-modal');
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

    // Open Add Bond Modal
    if (e.target.closest('#add-bond-btn')) {
      openModal('add-bond-modal');
      return;
    }

    // Open Log Interaction Modal
    const openInterBtn = e.target.closest('[data-action="open-interaction-modal"]');
    if (openInterBtn) {
      const bondId = openInterBtn.dataset.bondId;
      ui.openInteractionModal(bondId);
      return;
    }

    // Toggle Bond De-escalation Quest
    const deescalateBtn = e.target.closest('[data-action="toggle-deescalation-quest"]');
    if (deescalateBtn) {
      const bondId = deescalateBtn.dataset.bondId;
      const res = store.toggleBondDeescalationQuest(bondId);
      if (res && res.completed) {
        celebrate.playChime('quest');
        const rect = deescalateBtn.getBoundingClientRect();
        celebrate.spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
        celebrate.showQuoteToast(`De-escalation Quest Completed! +25 Loved Ones XP, +15 Life Credits.`);
        if (res.leveledUp) {
          setTimeout(() => {
            const bonusEl = document.getElementById('levelup-bonuses');
            if (bonusEl) bonusEl.textContent = `You leveled up through family empathy & de-escalation!`;
            openModal('level-up-modal');
            celebrate.playChime('levelup');
          }, 350);
        }
      }
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

    // Log Honest Interaction Submit
    if (e.target.id === 'interaction-form') {
      e.preventDefault();
      const bondId = document.getElementById('interaction-bond-id').value;
      const refText = document.getElementById('interaction-reflection').value;
      const tag = document.getElementById('interaction-tag').value;
      const res = store.logBondInteraction(bondId, refText, tag);
      if (res) {
        celebrate.playChime('quest');
        celebrate.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 24, true);
        celebrate.showQuoteToast(`Interaction Logged! +25 Loved Ones XP, +5% Harmony with ${res.bond.name}.`);
        if (res.leveledUp) {
          setTimeout(() => {
            const bonusEl = document.getElementById('levelup-bonuses');
            if (bonusEl) bonusEl.textContent = `You ascended in Level through interpersonal harmony & empathy!`;
            openModal('level-up-modal');
            celebrate.playChime('levelup');
          }, 350);
        }
        closeModal('log-interaction-modal');
        document.getElementById('interaction-reflection').value = '';
      }
      return;
    }

    // Add Custom Bond Submit
    if (e.target.id === 'add-bond-form') {
      e.preventDefault();
      const name = document.getElementById('add-bond-name').value;
      const role = document.getElementById('add-bond-role').value;
      const dynamic = document.getElementById('add-bond-dynamic').value;
      const status = document.getElementById('add-bond-status').value;

      const bond = store.addCustomBond(name, role, dynamic, 50, status);
      if (bond) {
        celebrate.playChime('quest');
        celebrate.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 20);
        celebrate.showQuoteToast(`Bond with ${name} (${role}) added to your inner circle.`);
        closeModal('add-bond-modal');
        e.target.reset();
      }
      return;
    }

    // Crossroads Pivot Form Submit
    if (e.target.id === 'crossroads-pivot-form') {
      e.preventDefault();
      const newTrack = document.getElementById('pivot-new-track').value;
      const note = document.getElementById('pivot-reflection-note').value;
      const res = store.resolveCrossroadsPivot(newTrack, note);
      if (res) {
        celebrate.playChime('levelup');
        celebrate.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 32, true);
        celebrate.showQuoteToast(`Pivoted with honor to: ${newTrack}! +${res.wisdomXP} Wisdom XP converted.`);
        if (res.leveledUp) {
          setTimeout(() => {
            const bonusEl = document.getElementById('levelup-bonuses');
            if (bonusEl) bonusEl.textContent = `Ascended in Level through self-awareness and wisdom!`;
            openModal('level-up-modal');
            celebrate.playChime('levelup');
          }, 350);
        }
        closeModal('crossroads-modal');
      }
      return;
    }
  });

  // 5. Career Track Dropdown Selector Change
  document.addEventListener('change', e => {
    if (e.target && e.target.id === 'career-track-select') {
      const newTrack = e.target.value;
      store.setCareerTrack(newTrack);
      celebrate.playChime('quest');
      celebrate.showQuoteToast(`Switched career ambition to: ${newTrack}`);
    }
  });

  // 6. Keyboard Accessibility
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
