/**
 * DAILYLIFE (Project Mirror) — Celebrations, Netflix Cinematic Intro & Audio Synthesis
 * Web Audio API cinematic "Ta-Dum" intro, quest chimes, confetti bursts, and motivational quotes.
 */

class CelebrationSystem {
  constructor() {
    this.audioCtx = null;
    this.isAudioUnlocked = false;

    // Grounded motivational quotes library (Grounded Mentor voice)
    this.motivationalQuotes = [
      { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius" },
      { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
      { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
      { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
      { text: "Small disciplines repeated with consistency lead to monumental inner clarity.", author: "Seneca" },
      { text: "Action isn't just the effect of motivation; it's also the cause of it.", author: "Mark Manson" },
      { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
      { text: "Knowing is not enough, we must apply. Willing is not enough, we must do.", author: "Bruce Lee" },
      { text: "Focus is a muscle. Today, you strengthened it with steady presence.", author: "Project Mirror" },
      { text: "Personal leveling up is not selfish; your growth protects and uplifts those you love.", author: "Marcus Aurelius" }
    ];

    this.pillarColors = [
      '#6366F1', // Craft & Career (Electric Indigo)
      '#10B981', // Physical Resilience (Emerald Jade)
      '#0EA5E9', // Emotional Calm (Azure Sky)
      '#F43F5E', // Loved Ones (Rose Pink)
      '#F59E0B', // Discipline (Radiant Gold)
      '#FB923C'  // Joy of Living (Sunset Coral)
    ];

    this.initAudioUnlock();
  }

  // Pre-unlock AudioContext on first user touch/click/key
  initAudioUnlock() {
    const unlock = () => {
      this.getAudioContext();
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      this.isAudioUnlocked = true;
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('touchstart', unlock);
    };

    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Synthesize Netflix-style "Ta-Dum" Cinematic Intro Sound
   * Deep resonant sub-bass punch + rich acoustic cello-like chord + shimmering high harmonic tail
   */
  playNetflixIntroSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // 1. Deep Sub-Bass Impact (The "Ta" - punchy low sweep)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(95, now);
      subOsc.frequency.exponentialRampToValueAtTime(38, now + 0.35); // Dive to deep bass

      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.exponentialRampToValueAtTime(0.45, now + 0.04);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 1.2);

      // 2. The Resonant Cinematic Cello/Piano Body (The "Dum" - rich harmonic swell)
      const tones = [
        { freq: 73.42, delay: 0.08, dur: 2.2, gainVal: 0.35 }, // D2
        { freq: 110.0, delay: 0.12, dur: 2.3, gainVal: 0.28 }, // A2
        { freq: 146.8, delay: 0.15, dur: 2.4, gainVal: 0.22 }, // D3
        { freq: 220.0, delay: 0.18, dur: 2.5, gainVal: 0.18 }, // A3
        { freq: 277.2, delay: 0.22, dur: 2.4, gainVal: 0.15 }, // C#4 (rich cinematic minor/major tension)
        { freq: 370.0, delay: 0.26, dur: 2.6, gainVal: 0.12 }, // F#4
        { freq: 587.3, delay: 0.32, dur: 2.8, gainVal: 0.09 }  // D5 shimmer
      ];

      tones.forEach(t => {
        const startT = now + t.delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';

        // Low-pass filter to give it that warm, velvety cinematic acoustic warmth
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, startT);
        filter.frequency.exponentialRampToValueAtTime(1400, startT + 0.4);
        filter.frequency.exponentialRampToValueAtTime(300, startT + t.dur);

        osc.frequency.setValueAtTime(t.freq, startT);

        gain.gain.setValueAtTime(0.0001, startT);
        gain.gain.exponentialRampToValueAtTime(t.gainVal, startT + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, startT + t.dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startT);
        osc.stop(startT + t.dur);
      });
    } catch (err) {
      console.warn('Could not play Netflix intro sound:', err);
    }
  }

  /**
   * Synthesize soothing harmonic quest chime
   */
  playChime(type = 'quest') {
    if (window.AppStore && !window.AppStore.state.soundEnabled) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === 'quest') {
        // Two-note arpeggio (E5 -> B5)
        const notes = [
          { freq: 659.25, time: now, duration: 0.5 },
          { freq: 987.77, time: now + 0.08, duration: 0.65 }
        ];

        notes.forEach(({ freq, time, duration }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, time);

          gain.gain.setValueAtTime(0.0001, time);
          gain.gain.exponentialRampToValueAtTime(0.2, time + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(time);
          osc.stop(time + duration);
        });
      } else if (type === 'levelup') {
        // Celestial fanfare: C5 -> E5 -> G5 -> C6
        const chord = [
          { freq: 523.25, time: now, duration: 0.8 },
          { freq: 659.25, time: now + 0.09, duration: 0.9 },
          { freq: 783.99, time: now + 0.18, duration: 1.1 },
          { freq: 1046.50, time: now + 0.28, duration: 1.4 }
        ];

        chord.forEach(({ freq, time, duration }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, time);

          gain.gain.setValueAtTime(0.0001, time);
          gain.gain.exponentialRampToValueAtTime(0.25, time + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(time);
          osc.stop(time + duration);
        });
      }
    } catch (e) {
      console.warn('Chime sound could not play:', e);
    }
  }

  /**
   * Spawns CSS jewel-tone particle burst around coordinates (x, y)
   */
  spawnBurst(x, y, count = 20, isLevelUp = false) {
    const container = document.createElement('div');
    container.className = 'burst-container';
    container.style.left = `${x}px`;
    container.style.top = `${y}px`;

    const colors = isLevelUp 
      ? ['#F59E0B', '#6366F1', '#10B981', '#F43F5E', '#FB923C', '#ffffff'] 
      : this.pillarColors;

    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.className = 'burst-dot';

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
      const distance = isLevelUp 
        ? Math.floor(Math.random() * 90 + 55) 
        : Math.floor(Math.random() * 60 + 25);

      const dx = Math.round(Math.cos(angle) * distance);
      const dy = Math.round(Math.sin(angle) * distance);
      const size = isLevelUp ? Math.floor(Math.random() * 7 + 5) : Math.floor(Math.random() * 5 + 4);
      const color = colors[Math.floor(Math.random() * colors.length)];

      dot.style.setProperty('--dx', `${dx}px`);
      dot.style.setProperty('--dy', `${dy}px`);
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.backgroundColor = color;
      dot.style.boxShadow = `0 0 8px ${color}`;
      dot.style.animationDelay = `${Math.random() * 40}ms`;

      container.appendChild(dot);
    }

    document.body.appendChild(container);
    setTimeout(() => {
      if (container.parentNode) container.parentNode.removeChild(container);
    }, 950);
  }

  /**
   * Get random motivational quote for cracking a quest
   */
  getRandomQuote() {
    return this.motivationalQuotes[Math.floor(Math.random() * this.motivationalQuotes.length)];
  }

  /**
   * Displays floating +XP / +Credits toast + motivational quote card on completion
   */
  showToast(x, y, xp, coins, quote) {
    const portal = document.getElementById('toast-container');
    if (!portal) return;

    const toast = document.createElement('div');
    toast.className = 'celebration-toast';

    const clampedX = Math.max(140, Math.min(window.innerWidth - 140, x));
    const clampedY = Math.max(90, Math.min(window.innerHeight - 50, y));

    toast.style.left = `${clampedX}px`;
    toast.style.top = `${clampedY}px`;

    toast.innerHTML = `
      <span class="toast-main">⚡ Cracked!</span>
      <span class="toast-xp">+${xp} XP</span>
      <span class="toast-coin">+${coins} 🪙 Credits</span>
    `;

    portal.appendChild(toast);

    toast.addEventListener('animationend', () => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    });

    // Update or show grounded motivational banner on dashboard
    this.displayMotivationalBanner(quote);
  }

  /**
   * Displays grounded quote in the persistent banner on screen
   */
  displayMotivationalBanner(quote) {
    const banner = document.getElementById('motivational-quote-banner');
    const textEl = document.getElementById('quote-banner-text');
    const authorEl = document.getElementById('quote-banner-author');

    if (banner && textEl && authorEl) {
      textEl.textContent = `"${quote.text}"`;
      authorEl.textContent = `— ${quote.author}`;
      banner.classList.remove('hidden');
      banner.classList.add('quote-pop-anim');
      setTimeout(() => banner.classList.remove('quote-pop-anim'), 600);
    }
  }

  /**
   * Full quest celebration sequence
   */
  celebrateQuestCompletion(targetElement, result) {
    if (!result || !result.isCompleted) return;

    const rect = targetElement.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    const quote = this.getRandomQuote();

    this.playChime('quest');
    this.spawnBurst(originX, originY, 20, false);
    this.showToast(originX, rect.top - 12, result.xpGained, result.coinsGained, quote);

    if (result.didLevelUp) {
      setTimeout(() => {
        this.triggerLevelUpCelebration(result.newLevel, result.careerTrack);
      }, 500);
    }
  }

  /**
   * Triumphant Level-Up modal celebration
   */
  triggerLevelUpCelebration(newLevel, careerTrack = 'Full-Stack Builder') {
    const modal = document.getElementById('level-up-modal');
    const levelNumSpan = document.getElementById('levelup-level-num');
    const careerTierSpan = document.getElementById('levelup-career-tier');

    if (levelNumSpan) levelNumSpan.textContent = `Level ${newLevel}`;
    if (careerTierSpan) careerTierSpan.textContent = `Milestone: Level ${newLevel} ${careerTrack} Unlocked`;

    this.playChime('levelup');

    if (modal) modal.classList.remove('hidden');

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    this.spawnBurst(centerX, centerY, 40, true);

    const sr = document.getElementById('sr-announcements');
    if (sr) {
      sr.textContent = `Ascension! You reached Level ${newLevel}. Career milestone achieved. 20 Life Credits awarded.`;
    }
  }
}

window.Celebration = new CelebrationSystem();
