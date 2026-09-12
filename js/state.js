/**
 * DAILYLIFE (Project Mirror) — State Management & Grounded RPG Engine
 * 6 Life Pillars, Career Mastery Trees, AI Life Goal Generator, Relationship Bonds & Multi-User sync.
 */

const XP_PER_LEVEL = 100;

// The 6 Life Pillars & Signature Colors (from Blueprint Image 2)
const PILLARS = {
  Craft: { name: 'Craft & Career Mastery', color: '#6366F1', icon: '💻', key: 'Craft' },
  Resilience: { name: 'Physical Resilience', color: '#10B981', icon: '💪', key: 'Resilience' },
  Calm: { name: 'Emotional Regulation & Calm', color: '#0EA5E9', icon: '💖', key: 'Calm' },
  LovedOnes: { name: 'Loved Ones & Empathy', color: '#F43F5E', icon: '🤝', key: 'LovedOnes' },
  Discipline: { name: 'Discipline & Consistency', color: '#F59E0B', icon: '⏳', key: 'Discipline' },
  Joy: { name: 'Joy, Play & Savoring Life', color: '#FB923C', icon: '☀️', key: 'Joy' }
};

// Available Career Tracks
const CAREER_TRACKS = [
  { id: 'swe', name: 'Software Engineer & Builder', defaultGoal: 'Master full-stack architecture, ship portfolio apps, and land a high-impact engineering role.' },
  { id: 'design', name: 'UI/UX Designer & Product Creator', defaultGoal: 'Craft clean design systems, conduct deep user research, and build beautiful intuitive experiences.' },
  { id: 'founder', name: 'Entrepreneur & Startup Founder', defaultGoal: 'Validate genuine market problems, build an MVP, and create a profitable, mission-driven business.' },
  { id: 'scholar', name: 'Writer & Intellectual Scholar', defaultGoal: 'Deepen domain mastery, write daily with unhurried clarity, and publish foundational work.' },
  { id: 'health', name: 'Health & Athletic Resilience', defaultGoal: 'Build functional strength, master metabolic recovery, and sustain peak physical vitality.' },
  { id: 'family', name: 'Family Guardian & Harmony', defaultGoal: 'Strengthen family bonds, provide steadfast financial and emotional security, and cultivate warmth at home.' },
  { id: 'custom', name: 'Custom Life Ambition', defaultGoal: 'Design a bespoke path of grounded discipline, creative mastery, and authentic living.' }
];

// Initial baseline routine quests
const DEFAULT_ROUTINE = [
  { id: 'q_wake', title: 'Wake up (7:00 AM)', time: '07:00 AM', pillar: 'Discipline', xp: 15, coins: 10, note: 'Rise with morning light and set clear daily intention.', completed: false, category: 'routine' },
  { id: 'q_water', title: 'Drink a glass of water', time: '07:10 AM', pillar: 'Resilience', xp: 5, coins: 5, note: 'Hydrate cells and activate internal organs after rest.', completed: false, category: 'routine' },
  { id: 'q_fresh', title: 'Freshen up', time: '07:15 AM', pillar: 'Discipline', xp: 10, coins: 5, note: 'Morning hygiene, brush teeth, clean baseline.', completed: false, category: 'routine' },
  { id: 'q_shower', title: 'Take a shower', time: '07:30 AM', pillar: 'Resilience', xp: 10, coins: 5, note: 'Invigorate physical senses and refresh alertness.', completed: false, category: 'routine' },
  { id: 'q_meditate', title: 'Meditate / Yoga', time: '08:00 AM', pillar: 'Calm', xp: 25, coins: 15, note: 'Center consciousness, slow breathing, somatic harmony.', completed: false, category: 'routine' },
  { id: 'q_deepwork', title: 'Deep Work Session', time: '09:00 AM', pillar: 'Craft', xp: 45, coins: 30, note: 'High-cognitive flow: uninterrupted focus on core priorities.', completed: false, category: 'routine' },
  { id: 'q_lunch', title: 'Lunch (1:00 PM)', time: '01:00 PM', pillar: 'Resilience', xp: 10, coins: 5, note: 'Mindful nourishment with balanced, wholesome food.', completed: false, category: 'routine' },
  { id: 'q_nap', title: 'Take a nap for 15 mins', time: '01:45 PM', pillar: 'Calm', xp: 10, coins: 5, note: 'Restorative power rest to reset adenosine buildup.', completed: false, category: 'routine' },
  { id: 'q_work', title: 'Work & Communication', time: '02:15 PM', pillar: 'Discipline', xp: 30, coins: 20, note: 'Execution block: meetings, communications, project tasks.', completed: false, category: 'routine' },
  { id: 'q_gym', title: 'Exercise / Hit the gym (5:00 PM)', time: '05:00 PM', pillar: 'Resilience', xp: 40, coins: 25, note: 'Heavy physical exertion, resistance training & cardio.', completed: false, category: 'routine' },
  { id: 'q_protein', title: 'Have a healthy protein (7:00 PM)', time: '07:00 PM', pillar: 'Resilience', xp: 15, coins: 10, note: 'Fuel muscle repair & metabolic recovery.', completed: false, category: 'routine' },
  { id: 'q_morework', title: 'Evening Wrap-Up & Planning', time: '08:00 PM', pillar: 'Craft', xp: 25, coins: 15, note: 'Review progress, prepare tomorrow, tie loose ends.', completed: false, category: 'routine' },
  { id: 'q_sleep', title: 'Sleep by 11:00 PM', time: '11:00 PM', pillar: 'Discipline', xp: 20, coins: 15, note: 'Restorative sleep and neural consolidation for tomorrow.', completed: false, category: 'routine' }
];

// Special Family Gratitude & Joy Quests
const SPECIAL_QUESTS = [
  { id: 'q_mom', title: 'Call Mom or plan weekend tea', time: 'Flexible', pillar: 'LovedOnes', xp: 25, coins: 20, note: 'Gratitude quest: Check in with genuine presence and listening.', completed: false, category: 'family' },
  { id: 'q_walk', title: 'Evening walk with no headphones', time: '06:30 PM', pillar: 'Joy', xp: 20, coins: 15, note: 'Joy of living: Observe the sky and environment guilt-free.', completed: false, category: 'joy' }
];

// 2-Minute Paralysis Breaker Micro-Habits
const PARALYSIS_MICRO_QUESTS = [
  { id: 'micro_1', title: 'Open blinds & let morning sunlight in', duration: '30 sec', pillar: 'Calm', xp: 10, coins: 5, note: 'Resets circadian clock and breaks mental fog.' },
  { id: 'micro_2', title: 'Drink a cold glass of water right now', duration: '1 min', pillar: 'Resilience', xp: 10, coins: 5, note: 'Hydrates neurons and interrupts spiral thinking.' },
  { id: 'micro_3', title: 'Open code editor and write just 1 single line', duration: '2 min', pillar: 'Craft', xp: 15, coins: 10, note: 'Lowers activation energy to conquer resistance.' }
];

class StateManager {
  constructor() {
    this.listeners = [];
    this.state = this.getInitialState();
  }

  // Generate initial or load per-user state from AuthManager
  getInitialState() {
    const user = window.Auth ? window.Auth.getCurrentUser() : null;

    if (user && user.userData) {
      return {
        ...user.userData,
        username: user.username,
        fullName: user.fullName || user.username,
        careerTrack: user.careerTrack || 'Software Engineer & Builder',
        lifeGoal: user.lifeGoal || 'Master full-stack engineering and bring security to loved ones.',
        themeMode: user.themeMode || 'dark'
      };
    }

    // Default clean state
    return {
      username: user ? user.username : 'arpita',
      fullName: user ? user.fullName : 'Arpita',
      totalXP: 0,
      currency: 20, // Initial starter Life Credits
      streak: 1,
      themeMode: user?.themeMode || 'dark', // 'dark' (Obsidian Cyber-HUD) or 'light' (Mindful Ivory)
      soundEnabled: true,
      careerTrack: user ? user.careerTrack : 'Software Engineer & Builder',
      lifeGoal: user ? user.lifeGoal : 'Master full-stack engineering, ship real tools, and cultivate calm presence.',
      careerMilestones: [
        { id: 'tier_1', title: 'Tier 1: Foundations', desc: 'Core syntax, data models, clean modular architecture.', completed: true, xp: 50 },
        { id: 'tier_2', title: 'Tier 2: Builder', desc: 'Build 2 full-stack projects, responsive HUD, deploy live.', completed: false, xp: 100 },
        { id: 'tier_3', title: 'Tier 3: Industry Ready', desc: 'System design, portfolio showcase, technical storytelling.', completed: false, xp: 150 },
        { id: 'tier_dream', title: 'Dream Milestone: Offer Landed', desc: 'Secure the dream offer & celebrate with family!', completed: false, xp: 300 }
      ],
      relationshipBonds: [
        { id: 'bond_mom', name: 'Mom', role: 'Mother', status: 'Warm', statusColor: '#10B981', trust: 90, note: 'Values consistent check-ins and shared peaceful meals.' },
        { id: 'bond_dad', name: 'Dad', role: 'Father', status: 'Neutral', statusColor: '#6B7280', trust: 70, note: 'Appreciates quiet demonstrations of career competence.' },
        { id: 'bond_partner', name: 'Partner / Best Friend', role: 'Companion', status: 'Warm', statusColor: '#F43F5E', trust: 85, note: 'Deep mutual encouragement and shared aspirations.' }
      ],
      quests: [...JSON.parse(JSON.stringify(DEFAULT_ROUTINE)), ...JSON.parse(JSON.stringify(SPECIAL_QUESTS))],
      history: []
    };
  }

  // Reload state when user logs in or switches
  loadActiveUserState() {
    this.state = this.getInitialState();
    this.notify();
  }

  // Persist state to active user's record
  saveState() {
    if (window.Auth) {
      window.Auth.saveCurrentUserData(this.state);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  // Exactly 100 XP per level formula
  getLevel() {
    return Math.floor(this.state.totalXP / XP_PER_LEVEL) + 1;
  }

  getLevelProgressXP() {
    return this.state.totalXP % XP_PER_LEVEL;
  }

  getLevelProgressPercent() {
    return (this.getLevelProgressXP() / XP_PER_LEVEL) * 100;
  }

  // Get current career title based on level and track
  getRankTitle() {
    const lvl = this.getLevel();
    const track = this.state.careerTrack || 'Builder';
    if (lvl === 1) return `Novice ${track}`;
    if (lvl === 2) return `Apprentice ${track}`;
    if (lvl === 3) return `Practitioner of ${track}`;
    if (lvl === 4) return `Senior ${track}`;
    if (lvl >= 5) return `Master ${track}`;
    return track;
  }

  // Compute points accumulated for each of the 6 pillars
  getPillarStats() {
    const points = {
      Craft: 0,
      Resilience: 0,
      Calm: 0,
      LovedOnes: 0,
      Discipline: 0,
      Joy: 0
    };

    this.state.quests.forEach(q => {
      if (q.completed && points.hasOwnProperty(q.pillar)) {
        points[q.pillar] += q.xp;
      }
    });

    const maxTargets = {
      Craft: 70,
      Resilience: 80,
      Calm: 45,
      LovedOnes: 50,
      Discipline: 75,
      Joy: 40
    };

    return { points, maxTargets };
  }

  // Toggle quest completion
  toggleQuest(questId) {
    const quest = this.state.quests.find(q => q.id === questId);
    if (!quest) return null;

    const oldLevel = this.getLevel();

    if (!quest.completed) {
      quest.completed = true;
      quest.completedAt = new Date().toISOString();
      this.state.totalXP += quest.xp;
      this.state.currency += quest.coins;

      const newLevel = this.getLevel();
      const didLevelUp = newLevel > oldLevel;

      if (didLevelUp) {
        this.state.currency += 20; // 20 bonus Life Credits on leveling up!
      }

      this.saveState();
      this.notify();

      return {
        quest,
        isCompleted: true,
        xpGained: quest.xp,
        coinsGained: quest.coins,
        oldLevel,
        newLevel,
        careerTrack: this.state.careerTrack,
        didLevelUp
      };
    } else {
      // Undo completion
      quest.completed = false;
      quest.completedAt = null;
      this.state.totalXP = Math.max(0, this.state.totalXP - quest.xp);
      this.state.currency = Math.max(0, this.state.currency - quest.coins);

      this.saveState();
      this.notify();

      return {
        quest,
        isCompleted: false,
        xpGained: -quest.xp,
        coinsGained: -quest.coins,
        oldLevel,
        newLevel: this.getLevel(),
        didLevelUp: false
      };
    }
  }

  // Complete a 2-minute paralysis breaker micro-quest
  completeMicroQuest(microId) {
    const micro = PARALYSIS_MICRO_QUESTS.find(m => m.id === microId);
    if (!micro) return null;

    const oldLevel = this.getLevel();
    this.state.totalXP += micro.xp;
    this.state.currency += micro.coins;

    const newLevel = this.getLevel();
    const didLevelUp = newLevel > oldLevel;

    this.saveState();
    this.notify();

    return {
      quest: micro,
      isCompleted: true,
      xpGained: micro.xp,
      coinsGained: micro.coins,
      oldLevel,
      newLevel,
      careerTrack: this.state.careerTrack,
      didLevelUp
    };
  }

  // Toggle theme mode (dark vs light)
  setThemeMode(mode) {
    this.state.themeMode = mode;
    this.saveState();
    this.notify();
  }

  toggleThemeMode() {
    const next = this.state.themeMode === 'dark' ? 'light' : 'dark';
    this.setThemeMode(next);
    return next;
  }

  toggleSound() {
    this.state.soundEnabled = !this.state.soundEnabled;
    this.saveState();
    this.notify();
    return this.state.soundEnabled;
  }

  // Add a user-defined custom quest
  addCustomQuest(title, time, pillar, xp = 20, coins = 15, note = '') {
    const newQuest = {
      id: `custom_${Date.now()}`,
      title: title.trim(),
      time: time || 'Flexible',
      pillar: pillar || 'Craft',
      xp: parseInt(xp) || 20,
      coins: parseInt(coins) || 15,
      note: note.trim() || 'Custom life ambition quest.',
      completed: false,
      category: 'custom'
    };

    this.state.quests.push(newQuest);
    this.saveState();
    this.notify();
    return newQuest;
  }

  // AI Daily Routine & Career Blueprint Generator
  generateAIBlueprint(careerTrackName, lifeGoalPrompt) {
    this.state.careerTrack = careerTrackName;
    this.state.lifeGoal = lifeGoalPrompt;

    // Craft custom AI tailored quests based on user goal & career
    const generatedQuests = [
      {
        id: `ai_career_${Date.now()}`,
        title: `Deep Practice: ${careerTrackName} Project Architecture`,
        time: '10:00 AM',
        pillar: 'Craft',
        xp: 45,
        coins: 30,
        note: `Targeted milestone towards: "${lifeGoalPrompt.slice(0, 50)}..."`,
        completed: false,
        category: 'career'
      },
      {
        id: `ai_mind_${Date.now()}`,
        title: 'Cognitive Review & Learning Journal',
        time: '04:00 PM',
        pillar: 'Calm',
        xp: 25,
        coins: 15,
        note: 'Document breakthrough learnings and eliminate cognitive drag.',
        completed: false,
        category: 'career'
      },
      {
        id: `ai_loved_${Date.now()}`,
        title: 'Share a proud win with your family or partner',
        time: '07:30 PM',
        pillar: 'LovedOnes',
        xp: 20,
        coins: 15,
        note: 'Shared flourishing: Let your loved ones share in your progress.',
        completed: false,
        category: 'family'
      }
    ];

    // Filter out old AI-generated items and prepend new ones
    const preservedQuests = this.state.quests.filter(q => !q.id.startsWith('ai_'));
    this.state.quests = [...preservedQuests, ...generatedQuests];

    this.saveState();
    this.notify();
    return generatedQuests;
  }

  // Reset daily routine for a fresh day
  resetRoutine() {
    const completedAny = this.state.quests.some(q => q.completed);
    if (completedAny) {
      this.state.streak += 1;
    }
    this.state.quests.forEach(q => {
      q.completed = false;
      q.completedAt = null;
    });
    this.saveState();
    this.notify();
  }
}

window.AppStore = new StateManager();
window.PILLARS = PILLARS;
window.CAREER_TRACKS = CAREER_TRACKS;
window.PARALYSIS_MICRO_QUESTS = PARALYSIS_MICRO_QUESTS;
window.XP_PER_LEVEL = XP_PER_LEVEL;
