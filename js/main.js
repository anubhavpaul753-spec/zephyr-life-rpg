/**
 * MIRROR — Main Controller & Event Bus (Linear + Raycast Aesthetic + FastAPI Backend)
 */

document.addEventListener('DOMContentLoaded', async () => {
  const store = window.AppStore;
  const ui = window.UI;
  const celebrate = window.Celebration;
  const auth = window.Auth;
  const api = window.API;

  // 1. Initial State Render
  ui.render(store.state);

  // 2. Subscribe UI updates to state changes
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
  // 3. LINEAR SCROLL-SPY & SLIDER PILL CONTROLLER
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

    const scrollPosition = window.scrollY + 140;
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
      if (rect.bottom < 0 || rect.top > windowH) continue;

      const x = clientX - rect.left;
      const y = clientY - rect.top;

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

    // Quick Jump Buttons
    const jumpBtn = e.target.closest('[data-action="nav-jump"]');
    if (jumpBtn && jumpBtn.dataset.target) {
      const targetId = jumpBtn.dataset.target;
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        isSmoothScrolling = true;
        ui.updateActiveSliderPill(targetId);
        targetSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => { isSmoothScrolling = false; }, 600);
      }
      return;
    }

    // Open Profile Customization Modal
    if (e.target.closest('[data-action="open-profile-customization"]')) {
      ui.populateProfileCustomizationModal(store.state);
      openModal('profile-customization-modal');
      return;
    }

    // Theme Toggle
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
      if (confirm('Log out from session? All your progress has been securely saved.')) {
        auth.logout();
        store.state = null;
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
      
      // Async notify FastAPI backend in background
      if (api) {
        api.completeQuest(qId);
      }

      if (res && res.isCompleted) {
        celebrate.celebrateQuestCompletion(toggleBtn, res);
      }
      ui.renderRoutineSection(store.state);
      ui.renderMirrorSection(store.state);
      ui.renderHeader(store.state, true);
      return;
    }

    // Abandon Quest Trigger (Hidden Crossroads circuit-breaker)
    if (e.target.closest('[data-action="abandon-quest-trigger"]') || e.target.closest('#abandon-career-trigger')) {
      openModal('crossroads-modal');
      return;
    }

    // Crossroads Decisions
    if (e.target.id === 'crossroads-choose-stay') {
      store.stayTheCourseCrossroads();
      if (api) api.resolveCrossroads('stay', 'Stayed the course with discipline.');
      closeModal('crossroads-modal');
      celebrate.playChime('success');
      showToast('Respect for persisting through resistance. +30 Discipline XP.');
      ui.renderMirrorSection(store.state);
      return;
    }

    if (e.target.id === 'crossroads-choose-pivot') {
      store.resolveCrossroadsPivot(store.state.careerTrack, 'Graceful values pivot.');
      if (api) api.resolveCrossroads('pivot', 'Graceful pivot to optimize bandwidth.');
      closeModal('crossroads-modal');
      celebrate.playChime('success');
      showToast('Track safely archived. +50 Wisdom XP converted.');
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
      ui.renderHeader(store.state, true);
      showToast('Milestone achieved! Craft XP awarded.');
      return;
    }

    // New Day Reset
    if (e.target.closest('#reset-day-btn')) {
      if (confirm('Reset daily checklist for a fresh day? Completed habits will be unchecked.')) {
        store.resetDailyRoutine();
        if (api) api.resetRoutine();
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
      const name = prompt("Enter loved one's name (e.g. Mom, Maya, Sarah):");
      if (name && name.trim()) {
        const relation = prompt('Enter relationship (e.g. Mother, Partner, Mentor, Sibling):') || 'Loved One';
        if (!store.state.relationshipBonds) store.state.relationshipBonds = [];
        store.state.relationshipBonds.push({
          id: 'bond_' + Date.now(),
          name: name.trim(),
          role: relation.trim(),
          icon: '🤝',
          trust: 65,
          patienceStreak: 1,
          lastAction: 'Registered bond in Mirror'
        });
        store.saveState();
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
        showToast(`Insufficient Life Credits. Need ${cost} Coins.`, '⚠️');
        return;
      }

      store.state.currency -= cost;
      if (!store.state.inventory) store.state.inventory = [];
      store.state.inventory.push({ key, name, acquiredAt: new Date().toISOString() });
      store.saveState();
      if (api) api.buyShopItem(key);

      celebrate.playChime('levelup');
      ui.renderShopSection(store.state);
      ui.renderHeader(store.state, true);
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


  // Profile Photo File Upload Handler
  const photoInput = document.getElementById('profile-photo-input');
  let selectedPhotoBase64 = null;

  if (photoInput) {
    photoInput.addEventListener('change', e => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          showToast('Image size exceeds 2MB. Please select a smaller photo.', '⚠️');
          return;
        }
        const reader = new FileReader();
        reader.onload = ev => {
          selectedPhotoBase64 = ev.target.result;
          const previewImg = document.getElementById('profile-modal-photo-preview');
          if (previewImg) previewImg.src = selectedPhotoBase64;
          showToast('Photo uploaded! Click Save to apply.');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Profile Customization Form Submit
  const profileForm = document.getElementById('profile-customization-form');
  if (profileForm) {
    profileForm.addEventListener('submit', e => {
      e.preventDefault();
      const fullName = document.getElementById('cust-fullname')?.value || '';
      const dob = document.getElementById('cust-dob')?.value || '';
      const currentProfession = document.getElementById('cust-current-profession')?.value || '';
      const dreamCareer = document.getElementById('cust-dream-career')?.value || '';
      const lifeGoal = document.getElementById('cust-life-goal')?.value || '';
      const skipRelationships = document.getElementById('cust-skip-relationships')?.checked || false;

      // Construct relationship bonds if not skipped
      let relationshipBonds = [];
      if (!skipRelationships) {
        const fatherTrust = document.getElementById('rel-status-father')?.value || 'Good';
        const motherTrust = document.getElementById('rel-status-mother')?.value || 'Harmonious';
        const partnerTrust = document.getElementById('rel-status-partner')?.value || 'Harmonious';
        const friendTrust = document.getElementById('rel-status-friend')?.value || 'Harmonious';

        const trustMap = {
          'Harmonious': 90,
          'Good': 75,
          'Neutral': 60,
          'Sensitive': 40,
          'Distant': 25
        };

        relationshipBonds = [
          { id: 'bond_dad', name: 'Dad', role: 'Father', icon: '👨‍💼', trust: trustMap[fatherTrust] || 75, patienceStreak: 3, lastAction: 'Configured bond in Mirror' },
          { id: 'bond_mom', name: 'Mom', role: 'Mother', icon: '👩‍💼', trust: trustMap[motherTrust] || 90, patienceStreak: 5, lastAction: 'Configured bond in Mirror' }
        ];

        if (partnerTrust !== 'None') {
          relationshipBonds.push({
            id: 'bond_partner', name: 'Partner', role: 'Spouse/Partner', icon: '💖', trust: trustMap[partnerTrust] || 90, patienceStreak: 4, lastAction: 'Deep presence and communication'
          });
        }
        if (friendTrust !== 'None') {
          relationshipBonds.push({
            id: 'bond_friend', name: 'Best Friend', role: 'Companion', icon: '🤝', trust: trustMap[friendTrust] || 85, patienceStreak: 2, lastAction: 'Supportive conversation'
          });
        }
      }

      store.updateProfile({
        fullName,
        dob,
        photoUrl: selectedPhotoBase64 || store.state.photoUrl,
        currentProfession,
        dreamCareer,
        lifeGoal,
        skipRelationships,
        relationshipBonds
      });

      if (api) {
        api.selectCareer(dreamCareer, lifeGoal);
      }

      celebrate.playChime('levelup');
      closeModal('profile-customization-modal');
      ui.render(store.state);
      showToast('Profile & Life Setup successfully updated!');
    });
  }

  // Career Switcher Change Listener
  document.addEventListener('change', e => {
    if (e.target.id === 'career-switcher-select') {
      store.switchCareerTrack(e.target.value);
      ui.renderCareerSection(store.state);
      showToast(`Active career switched to ${e.target.value}.`);
    }
  });
});
