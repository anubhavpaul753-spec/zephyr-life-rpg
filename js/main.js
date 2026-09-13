/**
 * MIRROR — Main Controller & Event Bus (Linear + Raycast Aesthetic + FastAPI Backend)
 * Handles Onboarding Gating, 1-Click Demos, Real-Time Interactivity & Modal Dialogs
 */

document.addEventListener('DOMContentLoaded', async () => {
  const store = window.AppStore;
  const ui = window.UI;
  const celebrate = window.Celebration;
  const auth = window.Auth;
  const api = window.API;

  let selectedSetupPhotoBase64 = null;
  let selectedModalPhotoBase64 = null;

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

    // Prune excessive simultaneous toasts
    while (portal.children.length >= 4) {
      portal.firstChild.remove();
    }

    const item = document.createElement('div');
    item.className = 'toast-item';
    item.setAttribute('role', 'alert');
    item.setAttribute('title', 'Click to dismiss');
    item.innerHTML = `<span class="toast-icon">${icon}</span> <span class="toast-msg">${msg}</span>`;
    portal.appendChild(item);

    const dismissTimer = setTimeout(() => {
      item.classList.add('toast-leaving');
      setTimeout(() => item.remove(), 350);
    }, 2800);

    item.addEventListener('click', () => {
      clearTimeout(dismissTimer);
      item.classList.add('toast-leaving');
      setTimeout(() => item.remove(), 200);
    });
  }

  // -------------------------------------------------------------------------
  // 3. LINEAR SCROLL-SPY & SLIDER PILL CONTROLLER
  // -------------------------------------------------------------------------
  let isSmoothScrolling = false;

  function updateScrollSpy() {
    if (isSmoothScrolling) return;
    if (!auth || !auth.isAuthenticated()) return;

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
      if (el && !el.classList.contains('locked-section') && !el.classList.contains('hidden')) {
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
    if (auth && auth.isAuthenticated()) {
      ui.updateActiveSliderPill(ui.activeSectionId);
    }
  }, { passive: true });

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
  // 5. CENTRAL CLICK DISPATCHER (All Clickable Actions)
  // -------------------------------------------------------------------------
  document.addEventListener('click', async e => {
    try {
      // 5.1 Auth Tab Switcher (Create Account vs Sign In)
      const authTabBtn = e.target.closest('.auth-tab-btn');
      if (authTabBtn && authTabBtn.dataset.tab) {
        ui.renderSetupAndAuthCard(authTabBtn.dataset.tab);
        return;
      }

      // 5.2 Hackathon Judge Quick Demo Buttons
      const demoBtn = e.target.closest('[data-action="quick-demo"]');
      if (demoBtn && demoBtn.dataset.user) {
        const username = demoBtn.dataset.user;
        const res = await auth.login(username, '123');
        if (res.success) {
          store.loadActiveUserState();
          if (celebrate) {
            celebrate.playChime('levelup');
            celebrate.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 28, true);
          }
          ui.render(store.state);
          showToast(`Logged in as ${res.user.fullName}! Mirror progression unlocked.`);
        } else {
          showToast(res.message || 'Demo login failed.', '⚠️');
        }
        return;
      }

      // 5.3 Navigation Tab Click (Smooth Scroll + Pill Slide)
      const navBtn = e.target.closest('.nav-tab-btn');
      if (navBtn && navBtn.dataset.target) {
        const targetId = navBtn.dataset.target;
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          if (targetSection.classList.contains('locked-section')) {
            showToast('Character details required! Please complete character setup or sign in to unlock this section.', '🔒');
            const heroSec = document.getElementById('sec-hero');
            if (heroSec) heroSec.scrollIntoView({ behavior: 'smooth' });
          } else {
            isSmoothScrolling = true;
            ui.updateActiveSliderPill(targetId);
            targetSection.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => { isSmoothScrolling = false; }, 600);
          }
        }
        return;
      }

      // 5.4 Quick Jump Buttons
      const jumpBtn = e.target.closest('[data-action="nav-jump"]');
      if (jumpBtn && jumpBtn.dataset.target) {
        const targetId = jumpBtn.dataset.target;
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          if (targetSection.classList.contains('locked-section')) {
            showToast('Character details required! Please complete character setup or sign in to unlock this section.', '🔒');
            const heroSec = document.getElementById('sec-hero');
            if (heroSec) heroSec.scrollIntoView({ behavior: 'smooth' });
          } else {
            isSmoothScrolling = true;
            ui.updateActiveSliderPill(targetId);
            targetSection.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => { isSmoothScrolling = false; }, 600);
          }
        }
        return;
      }

      // 5.5 Open Profile Customization Modal
      if (e.target.closest('[data-action="open-profile-customization"]')) {
        ui.populateProfileCustomizationModal(store.state);
        openModal('profile-customization-modal');
        return;
      }

      // 5.7 Sound Toggle
      if (e.target.closest('#sound-toggle-btn')) {
        store.toggleSound();
        showToast(store.state.soundEnabled ? 'Audio feedback enabled 🔔' : 'Audio muted 🔕');
        return;
      }

      // 5.8 Logout Session
      if (e.target.closest('#logout-btn')) {
        if (confirm('Log out from session? All your progress has been securely saved.')) {
          auth.logout();
          store.loadActiveUserState();
          ui.render(store.state);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          showToast('Logged out successfully. Character gated.');
        }
        return;
      }

      // 5.9 Quest Checkbox Toggle
      const toggleBtn = e.target.closest('[data-action="toggle-quest"]');
      if (toggleBtn) {
        const qId = toggleBtn.dataset.questId;
        const res = store.toggleQuest(qId);
        
        if (api) api.completeQuest(qId);

        if (res && res.isCompleted && celebrate) {
          celebrate.celebrateQuestCompletion(toggleBtn, res);
        }
        ui.renderRoutineSection(store.state);
        ui.renderMirrorSection(store.state);
        ui.renderHeader(store.state, true);
        return;
      }

      // 5.10 Abandon Quest Trigger (Hidden Crossroads circuit-breaker)
      if (e.target.closest('[data-action="abandon-quest-trigger"]') || e.target.closest('#abandon-career-trigger')) {
        openModal('crossroads-modal');
        return;
      }

      // 5.11 Crossroads Decisions
      if (e.target.id === 'crossroads-choose-stay') {
        store.stayTheCourseCrossroads();
        if (api) api.resolveCrossroads('stay', 'Stayed the course with discipline.');
        closeModal('crossroads-modal');
        if (celebrate) celebrate.playChime('success');
        showToast('Respect for persisting through resistance. +30 Discipline XP.');
        ui.renderMirrorSection(store.state);
        return;
      }

      if (e.target.id === 'crossroads-choose-pivot') {
        store.resolveCrossroadsPivot(store.state.careerTrack, 'Graceful values pivot.');
        if (api) api.resolveCrossroads('pivot', 'Graceful pivot to optimize bandwidth.');
        closeModal('crossroads-modal');
        if (celebrate) celebrate.playChime('success');
        showToast('Track safely archived. +50 Wisdom XP converted.');
        ui.renderMirrorSection(store.state);
        return;
      }

      // 5.12 Milestone Checkbox Toggle
      const mBtn = e.target.closest('[data-action="toggle-milestone"]');
      if (mBtn) {
        const mId = mBtn.dataset.milestoneId;
        store.toggleMilestone(mId);
        if (celebrate) {
          celebrate.playChime('levelup');
          celebrate.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 24, true);
        }
        ui.renderCareerSection(store.state);
        ui.renderMirrorSection(store.state);
        ui.renderHeader(store.state, true);
        showToast('Milestone achieved! Craft XP awarded.');
        return;
      }

      // 5.13 New Day Reset
      if (e.target.closest('#reset-day-btn')) {
        if (confirm('Reset daily checklist for a fresh day? Completed habits will be unchecked.')) {
          store.resetDailyRoutine();
          if (api) api.resetRoutine();
          ui.renderRoutineSection(store.state);
          showToast('Daily checklist reset. Time to execute!');
        }
        return;
      }

      // 5.14 Routine Filter Tabs
      const fTab = e.target.closest('.filter-tab');
      if (fTab && fTab.dataset.filter) {
        store.setFilter(fTab.dataset.filter);
        document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
        fTab.classList.add('active');
        ui.renderRoutineSection(store.state);
        return;
      }

      // 5.15 Open Paralysis Breaker Modal
      if (e.target.closest('#paralysis-breaker-btn')) {
        ui.renderParalysisModal();
        openModal('paralysis-modal');
        return;
      }

      // 5.16 Execute Micro-Habit
      const microBtn = e.target.closest('[data-action="do-micro-habit"]');
      if (microBtn) {
        const xp = parseInt(microBtn.dataset.microXp || '10', 10);
        store.addXP(xp, 'Calm');
        if (celebrate) celebrate.playChime('success');
        showToast(`Paralysis broken! +${xp} XP awarded.`);
        closeModal('paralysis-modal');
        ui.renderMirrorSection(store.state);
        return;
      }

      // 5.17 Open AI Generator Modal
      if (e.target.closest('#ai-generator-btn')) {
        openModal('ai-generator-modal');
        return;
      }

      // 5.17b Open Add Loved One Modal
      if (e.target.closest('#add-bond-btn') || e.target.closest('#empty-add-bond-btn')) {
        openModal('add-bond-modal');
        return;
      }

      // 5.18 Log Bond Interaction Modal
      const logBondBtn = e.target.closest('[data-action="log-bond"]');
      if (logBondBtn) {
        const bId = logBondBtn.dataset.bondId;
        const bInput = document.getElementById('rel-bond-id');
        if (bInput) bInput.value = bId;
        openModal('relationship-log-modal');
        return;
      }

      // 5.19 Shop Item Purchase
      const buyBtn = e.target.closest('[data-action="buy-shop-item"]');
      if (buyBtn) {
        const cost = parseInt(buyBtn.dataset.itemCost || '0', 10);
        const name = buyBtn.dataset.itemName;
        const key = buyBtn.dataset.itemKey;

        if ((store.state.currency || 0) < cost) {
          showToast(`Insufficient Life Coins. Need ${cost} Coins.`, '⚠️');
          return;
        }

        store.state.currency -= cost;
        if (!store.state.inventory) store.state.inventory = [];
        store.state.inventory.push({ key, name, acquiredAt: new Date().toISOString() });
        store.saveState();
        if (api) api.buyShopItem(key);

        if (celebrate) celebrate.playChime('levelup');
        ui.renderShopSection(store.state);
        ui.renderHeader(store.state, true);
        showToast(`Acquired ${name}! Enjoy your earned reward.`);
        return;
      }

      // 5.20 Equip Theme Palette
      const equipBtn = e.target.closest('[data-action="equip-palette"]');
      if (equipBtn) {
        const paletteKey = equipBtn.dataset.paletteKey;
        const paletteName = equipBtn.dataset.paletteName || 'Theme';
        store.equipPalette(paletteKey);
        if (celebrate) celebrate.playChime('levelup');
        ui.renderShopSection(store.state);
        ui.renderHeader(store.state, true);
        showToast(`Equipped ${paletteName}! Interface transformed. 🎨`);
        return;
      }

      // 5.20b Revert to Default Raycast Midnight UI
      const revertBtn = e.target.closest('[data-action="revert-palette"]');
      if (revertBtn) {
        store.equipPalette('default');
        if (celebrate) celebrate.playChime('neutral');
        ui.renderShopSection(store.state);
        ui.renderHeader(store.state, true);
        showToast('Reverted to Default Raycast Midnight UI! 🌌');
        return;
      }

      // 5.21 Shop Category Filter Tabs
      const shopFilterTab = e.target.closest('.shop-filter-tab');
      if (shopFilterTab && shopFilterTab.dataset.filter) {
        ui.shopFilter = shopFilterTab.dataset.filter;
        ui.renderShopSection(store.state);
        return;
      }

      // 5.20 Dismiss Level Up Modal
      if (e.target.id === 'dismiss-levelup-btn') {
        closeModal('level-up-modal');
        return;
      }

      // 5.21 Generic Modal Close Buttons
      const closeBtn = e.target.closest('[data-close]');
      if (closeBtn) {
        closeModal(closeBtn.dataset.close);
        return;
      }

      // 5.22 Close Modal on backdrop click
      if (e.target.classList.contains('modal-backdrop')) {
        e.target.classList.add('hidden');
        return;
      }
    } catch (err) {
      console.error('[Dispatcher Error]', err);
    }
  });

  // -------------------------------------------------------------------------
  // 6. FORM SUBMISSIONS (Character Setup, Sign In, Profile Update)
  // -------------------------------------------------------------------------
  document.addEventListener('submit', async e => {
    try {
      // 6.1 Character Creation & Onboarding Setup Form Submit
      if (e.target.id === 'onboarding-setup-form') {
        e.preventDefault();
        const fullName = document.getElementById('setup-fullname')?.value || '';
        const dob = document.getElementById('setup-dob')?.value || '';
        const username = document.getElementById('setup-username')?.value || '';
        const password = document.getElementById('setup-password')?.value || '';
        const currentProfession = document.getElementById('setup-current-profession')?.value || 'Student & Academic Learner';
        const dreamCareer = document.getElementById('setup-dream-career')?.value || 'Software Engineer & Full-Stack Developer';
        const lifeGoal = document.getElementById('setup-life-goal')?.value || '';
        const skipRelationships = document.getElementById('setup-skip-relationships')?.checked || false;

        let relationshipBonds = [];
        if (!skipRelationships) {
          const fatherTrust = document.getElementById('setup-rel-father')?.value || 'Good';
          const motherTrust = document.getElementById('setup-rel-mother')?.value || 'Harmonious';
          const partnerTrust = document.getElementById('setup-rel-partner')?.value || 'Harmonious';
          const friendTrust = document.getElementById('setup-rel-friend')?.value || 'Harmonious';

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
              id: 'bond_partner', name: 'Partner', role: 'Spouse/Partner', icon: '💖', trust: trustMap[partnerTrust] || 90, patienceStreak: 4, lastAction: 'Deep presence and emotional calibration'
            });
          }
          if (friendTrust !== 'None') {
            relationshipBonds.push({
              id: 'bond_friend', name: 'Best Friend', role: 'Companion', icon: '🤝', trust: trustMap[friendTrust] || 85, patienceStreak: 2, lastAction: 'Supportive conversation and honesty'
            });
          }
        }

        const res = await auth.register(username, password, fullName, dreamCareer, {
          dob,
          photoUrl: selectedSetupPhotoBase64,
          currentProfession,
          dreamCareer,
          lifeGoal,
          skipRelationships,
          relationshipBonds
        });

        if (res.success) {
          store.loadActiveUserState();
          store.updateProfile({
            fullName,
            dob,
            photoUrl: selectedSetupPhotoBase64,
            currentProfession,
            dreamCareer,
            lifeGoal,
            skipRelationships,
            relationshipBonds
          });

          if (api) {
            api.selectCareer(dreamCareer, lifeGoal);
          }

          if (celebrate) {
            celebrate.playChime('levelup');
            celebrate.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 35, true);
          }

          ui.render(store.state);
          showToast(`Welcome to Mirror, ${fullName}! Your progression engine is active.`);
        } else {
          showToast(res.message || 'Setup failed. Please check your fields.', '⚠️');
        }
        return;
      }

      // 6.2 Sign In Form Submit
      if (e.target.id === 'gateway-login-form') {
        e.preventDefault();
        const username = document.getElementById('login-username')?.value || '';
        const password = document.getElementById('login-password')?.value || '';

        const res = await auth.login(username, password);
        if (res.success) {
          store.loadActiveUserState();
          if (celebrate) celebrate.playChime('success');
          ui.render(store.state);
          showToast(`Welcome back, ${res.user.fullName}!`);
        } else {
          showToast(res.message || 'Invalid username or password.', '⚠️');
        }
        return;
      }

      // 6.3 Profile Customization Form Submit (from Modal)
      if (e.target.id === 'profile-customization-form') {
        e.preventDefault();
        const fullName = document.getElementById('cust-fullname')?.value || '';
        const dob = document.getElementById('cust-dob')?.value || '';
        const currentProfession = document.getElementById('cust-current-profession')?.value || '';
        const dreamCareer = document.getElementById('cust-dream-career')?.value || '';
        const lifeGoal = document.getElementById('cust-life-goal')?.value || '';
        const skipRelationships = document.getElementById('cust-skip-relationships')?.checked || false;

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
          photoUrl: selectedModalPhotoBase64 || store.state.photoUrl,
          currentProfession,
          dreamCareer,
          lifeGoal,
          skipRelationships,
          relationshipBonds
        });

        if (api) {
          api.selectCareer(dreamCareer, lifeGoal);
        }

        if (celebrate) celebrate.playChime('levelup');
        closeModal('profile-customization-modal');
        ui.render(store.state);
        showToast('Profile & Life Setup successfully updated!');
        return;
      }

      // 6.4 Relationship Log Form Submit
      if (e.target.id === 'relationship-log-form') {
        e.preventDefault();
        const bId = document.getElementById('rel-bond-id').value;
        const action = document.getElementById('rel-action-input').value;
        const reflection = document.getElementById('rel-reflection-input').value;

        store.logRelationshipInteraction(bId, action, reflection);
        closeModal('relationship-log-modal');
        if (celebrate) celebrate.playChime('success');
        ui.renderLovedOnesSection(store.state);
        ui.renderMirrorSection(store.state);
        showToast('Interaction logged! +25 Empathy XP.');
        return;
      }

      // 6.4b Add Loved One Form Submit
      if (e.target.id === 'add-bond-form') {
        e.preventDefault();
        const nameInput = document.getElementById('add-bond-name');
        const roleInput = document.getElementById('add-bond-role');
        const iconInput = document.getElementById('add-bond-icon');
        const trustInput = document.getElementById('add-bond-trust');
        const dynamicInput = document.getElementById('add-bond-dynamic');

        const name = nameInput ? nameInput.value.trim() : '';
        const role = roleInput ? roleInput.value : 'Companion';
        const icon = iconInput ? iconInput.value : '🤝';
        const trust = trustInput ? parseInt(trustInput.value, 10) : 75;
        const dynamic = dynamicInput && dynamicInput.value.trim() ? dynamicInput.value.trim() : 'Values mutual presence, patient listening, and shared growth.';

        if (!name) {
          showToast('Please provide a name or relationship label.', '⚠️');
          return;
        }

        store.addCustomBond(name, role, dynamic, trust, 'Warm', icon);
        store.addXP(30, 'LovedOnes');

        closeModal('add-bond-modal');
        const addBondForm = document.getElementById('add-bond-form');
        if (addBondForm) addBondForm.reset();
        const trustValEl = document.getElementById('add-bond-trust-val');
        if (trustValEl) trustValEl.textContent = '75%';

        if (celebrate) {
          celebrate.playChime('levelup');
          celebrate.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 28, true);
        }

        ui.renderLovedOnesSection(store.state);
        ui.renderMirrorSection(store.state);
        ui.renderHeader(store.state, true);
        showToast(`Added ${name} to your Loved Ones circle! +30 Empathy XP 🤝`);
        return;
      }

      // 6.5 AI Blueprint Generator Submit
      if (e.target.id === 'ai-blueprint-form') {
        e.preventDefault();
        const track = document.getElementById('ai-career-input').value;
        const goal = document.getElementById('ai-goal-input').value;
        store.generateAIBlueprint(track, goal);
        if (celebrate) {
          celebrate.playChime('levelup');
          celebrate.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 28, true);
        }
        closeModal('ai-generator-modal');
        ui.renderCareerSection(store.state);
        showToast('AI Blueprint synthesized! Check your updated skill tree.');
        return;
      }
    } catch (err) {
      console.error('[Form Error]', err);
    }
  });

  // -------------------------------------------------------------------------
  // 7. FILE UPLOAD EVENT LISTENERS (Instant Base64 Readers)
  // -------------------------------------------------------------------------
  document.addEventListener('change', e => {
    // 7.1 Setup Card Photo Upload
    if (e.target.id === 'setup-photo-input') {
      const file = e.target.files && e.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          showToast('Image size exceeds 2MB. Please select a smaller photo.', '⚠️');
          return;
        }
        const reader = new FileReader();
        reader.onload = ev => {
          selectedSetupPhotoBase64 = ev.target.result;
          const previewImg = document.getElementById('setup-photo-preview');
          if (previewImg) previewImg.src = selectedSetupPhotoBase64;
          showToast('Photo uploaded!');
        };
        reader.readAsDataURL(file);
      }
      return;
    }

    // 7.2 Modal Profile Photo Upload
    if (e.target.id === 'profile-photo-input') {
      const file = e.target.files && e.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          showToast('Image size exceeds 2MB. Please select a smaller photo.', '⚠️');
          return;
        }
        const reader = new FileReader();
        reader.onload = ev => {
          selectedModalPhotoBase64 = ev.target.result;
          const previewImg = document.getElementById('profile-modal-photo-preview');
          if (previewImg) previewImg.src = selectedModalPhotoBase64;
          showToast('Photo uploaded! Click Save to apply.');
        };
        reader.readAsDataURL(file);
      }
      return;
    }

    // 7.3 Career Switcher Change (Updates both Career Tree and Daily Missions!)
    if (e.target.id === 'career-switcher-select') {
      const newTrack = e.target.value;
      store.switchCareerTrack(newTrack);
      ui.renderCareerSection(store.state);
      ui.renderRoutineSection(store.state);
      ui.renderMirrorSection(store.state);
      ui.renderHeroGateway(store.state, true);
      ui.renderHeader(store.state, true);
      if (celebrate) celebrate.playChime('success');
      showToast(`Career switched to ${newTrack}! Daily routine & milestones updated. 🎯`);
      return;
    }
  });

  // -------------------------------------------------------------------------
  // 8. RANGE SLIDER REAL-TIME DISPLAY LISTENERS
  // -------------------------------------------------------------------------
  document.addEventListener('input', e => {
    if (e.target.id === 'add-bond-trust') {
      const valEl = document.getElementById('add-bond-trust-val');
      if (valEl) valEl.textContent = `${e.target.value}%`;
    }
  });
});
