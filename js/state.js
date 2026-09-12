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

// Available Career Tracks (Presets)
const CAREER_TRACKS = [
  { id: 'swe', name: 'Software Engineer & Builder', defaultGoal: 'Master full-stack architecture, ship portfolio apps, and land a high-impact engineering role.' },
  { id: 'design', name: 'Product Designer', defaultGoal: 'Craft clean design systems, conduct deep user research, and build beautiful intuitive experiences.' },
  { id: 'founder', name: 'Founder/Entrepreneur', defaultGoal: 'Validate genuine market problems, build an MVP, and create a profitable, mission-driven business.' },
  { id: 'scholar', name: 'Writer/Scholar', defaultGoal: 'Deepen domain mastery, write daily with unhurried clarity, and publish foundational work.' },
  { id: 'custom', name: 'Custom Ambition', defaultGoal: 'Design a bespoke path of grounded discipline, creative mastery, and authentic living.' }
];

// Visual Progression Tree Presets: 4 Distinct Tiers for each Career Track
const CAREER_TREE_PRESETS = {
  'Software Engineer & Builder': [
    {
      tierId: 1,
      tierName: 'Tier 1: Foundations',
      subtitle: 'Core computer science, syntax, clean code & git hygiene',
      milestones: [
        { id: 'swe_1_1', title: 'Data Structures & Algorithmic Thinking', desc: 'Implement hash maps, trees, graphs, and master space-time complexity analysis.', craftXP: 40, discXP: 15, coins: 25, completed: true },
        { id: 'swe_1_2', title: 'Clean Architecture & Testing Discipline', desc: 'Write testable modular components, SOLID principles, and CI/CD pipelines.', craftXP: 35, discXP: 15, coins: 20, completed: false }
      ]
    },
    {
      tierId: 2,
      tierName: 'Tier 2: Portfolio Builder',
      subtitle: 'Full-stack apps, scalable API design & modern state models',
      milestones: [
        { id: 'swe_2_1', title: 'Ship 2 Production Full-Stack Applications', desc: 'Deploy complete web services with authentication, database persistence, and CDN hosting.', craftXP: 60, discXP: 25, coins: 40, completed: false },
        { id: 'swe_2_2', title: 'Database Optimization & Schema Mastery', desc: 'Design normalized relational schemas, indexing strategies, and resilient queries.', craftXP: 50, discXP: 20, coins: 30, completed: false }
      ]
    },
    {
      tierId: 3,
      tierName: 'Tier 3: Industry Ready',
      subtitle: 'System design, real-world concurrency & technical storytelling',
      milestones: [
        { id: 'swe_3_1', title: 'High-Availability System Design', desc: 'Design microservices, caching layers (Redis), load balancing, and asynchronous queues.', craftXP: 75, discXP: 30, coins: 50, completed: false },
        { id: 'swe_3_2', title: 'Open Source Contribution & Tech Deep Dives', desc: 'Contribute bug fixes to active repositories and write in-depth engineering breakdowns.', craftXP: 70, discXP: 30, coins: 45, completed: false }
      ]
    },
    {
      tierId: 4,
      tierName: 'Tier 4: Dream Career Offer',
      subtitle: 'Onsite interview triumph, negotiation & family celebration',
      milestones: [
        { id: 'swe_4_1', title: 'Ace Technical Onsites & Negotiate Dream Offer', desc: 'Pass rigorous architectural interviews and secure the high-impact software role.', craftXP: 150, discXP: 50, coins: 100, completed: false },
        { id: 'swe_4_2', title: 'Ship First Live Production Impact & Celebrate', desc: 'Push signature code to hundreds of thousands of users and share success with loved ones.', craftXP: 100, discXP: 40, coins: 80, completed: false }
      ]
    }
  ],
  'Product Designer': [
    {
      tierId: 1,
      tierName: 'Tier 1: Foundations',
      subtitle: 'Figma mastery, visual hierarchy, typography & color science',
      milestones: [
        { id: 'des_1_1', title: 'Design System & Component Token Mastery', desc: 'Construct scalable design tokens, responsive auto-layout frames, and atomic UI libraries.', craftXP: 40, discXP: 15, coins: 25, completed: true },
        { id: 'des_1_2', title: 'User Research & Heuristic Evaluation', desc: 'Conduct usability tests, synthesize user personas, and map frictionless user journeys.', craftXP: 35, discXP: 15, coins: 20, completed: false }
      ]
    },
    {
      tierId: 2,
      tierName: 'Tier 2: Portfolio Builder',
      subtitle: 'High-fidelity case studies & interactive micro-interactions',
      milestones: [
        { id: 'des_2_1', title: '2 In-Depth End-to-End Product Case Studies', desc: 'Document problem validation, wireframing, edge cases, iterations, and business outcomes.', craftXP: 60, discXP: 25, coins: 40, completed: false },
        { id: 'des_2_2', title: 'Micro-Interactions & Motion Prototyping', desc: 'Prototype delightful physics-based animations in Figma to communicate UI intent.', craftXP: 50, discXP: 20, coins: 30, completed: false }
      ]
    },
    {
      tierId: 3,
      tierName: 'Tier 3: Industry Ready',
      subtitle: 'Design leadership, cross-functional handoff & critique',
      milestones: [
        { id: 'des_3_1', title: 'Developer Handoff & Design Systems Governance', desc: 'Collaborate with frontend engineers to guarantee pixel-perfect production fidelity.', craftXP: 75, discXP: 30, coins: 50, completed: false },
        { id: 'des_3_2', title: 'Executive Presentation & Strategic Storytelling', desc: 'Defend design decisions articulately using qualitative metrics and conversion data.', craftXP: 70, discXP: 30, coins: 45, completed: false }
      ]
    },
    {
      tierId: 4,
      tierName: 'Tier 4: Dream Career Offer',
      subtitle: 'Lead Product Designer appointment & impactful product launch',
      milestones: [
        { id: 'des_4_1', title: 'Land Lead / Senior Product Designer Position', desc: 'Deliver an inspiring portfolio walkthrough and receive top-tier design offer.', craftXP: 150, discXP: 50, coins: 100, completed: false },
        { id: 'des_4_2', title: 'Launch Flagship Experience to Acclaim', desc: 'Release an experience loved by thousands of daily users and celebrate with loved ones.', craftXP: 100, discXP: 40, coins: 80, completed: false }
      ]
    }
  ],
  'Founder/Entrepreneur': [
    {
      tierId: 1,
      tierName: 'Tier 1: Foundations',
      subtitle: 'Problem validation, unit economics & customer discovery',
      milestones: [
        { id: 'fnd_1_1', title: '30 Deep Customer Discovery Interviews', desc: 'Validate painful user problems, willingness to pay, and market demand.', craftXP: 45, discXP: 20, coins: 25, completed: true },
        { id: 'fnd_1_2', title: 'Financial Modeling & Runway Projections', desc: 'Calculate CAC, LTV, gross margins, and stress-test unit economics.', craftXP: 40, discXP: 15, coins: 20, completed: false }
      ]
    },
    {
      tierId: 2,
      tierName: 'Tier 2: Portfolio Builder',
      subtitle: 'MVP launch, rapid iteration & first paying customers',
      milestones: [
        { id: 'fnd_2_1', title: 'Build & Ship Functional Minimum Viable Product', desc: 'Launch MVP to the world in under 30 days and onboard the first 50 early adopters.', craftXP: 65, discXP: 30, coins: 45, completed: false },
        { id: 'fnd_2_2', title: 'Generate First $1,000 in Organic Revenue', desc: 'Prove real market value with paying, enthusiastic customers who refer peers.', craftXP: 60, discXP: 25, coins: 40, completed: false }
      ]
    },
    {
      tierId: 3,
      tierName: 'Tier 3: Industry Ready',
      subtitle: 'Product-market fit signals, scaling channels & team culture',
      milestones: [
        { id: 'fnd_3_1', title: 'Scale to $10,000 Monthly Recurring Revenue', desc: 'Establish a reliable acquisition engine with low churn and strong retention cohorts.', craftXP: 85, discXP: 35, coins: 60, completed: false },
        { id: 'fnd_3_2', title: 'Build High-Caliber Founding Team & Culture', desc: 'Hire first key collaborators aligned with mission, craftsmanship, and speed.', craftXP: 75, discXP: 30, coins: 50, completed: false }
      ]
    },
    {
      tierId: 4,
      tierName: 'Tier 4: Dream Career Offer',
      subtitle: 'Venture backing / profitable independence & family security',
      milestones: [
        { id: 'fnd_4_1', title: 'Achieve Sustainable High Growth or Funding', desc: 'Close a milestone funding round or reach profitable sovereign independence.', craftXP: 160, discXP: 50, coins: 120, completed: false },
        { id: 'fnd_4_2', title: 'Bring Lasting Financial Security to Loved Ones', desc: 'Share fruits of company success with parents, family, and early team members.', craftXP: 120, discXP: 50, coins: 100, completed: false }
      ]
    }
  ],
  'Writer/Scholar': [
    {
      tierId: 1,
      tierName: 'Tier 1: Foundations',
      subtitle: 'Daily prose practice, second brain & rigorous research habits',
      milestones: [
        { id: 'wri_1_1', title: 'Daily 1,000-Word Uninterrupted Writing Ritual', desc: 'Establish an unwavering morning writing block focused on clarity, rhythm, and depth.', craftXP: 40, discXP: 20, coins: 25, completed: true },
        { id: 'wri_1_2', title: 'Curate a Second Brain / Zettelkasten Knowledge Vault', desc: 'Organize literature notes, primary citations, and cross-disciplinary concepts.', craftXP: 35, discXP: 15, coins: 20, completed: false }
      ]
    },
    {
      tierId: 2,
      tierName: 'Tier 2: Portfolio Builder',
      subtitle: 'Publication cadence, newsletter expansion & long-form essays',
      milestones: [
        { id: 'wri_2_1', title: 'Publish 10 Foundational Long-Form Essays', desc: 'Write deeply researched pieces exploring technology, sociology, and human flourishing.', craftXP: 60, discXP: 25, coins: 40, completed: false },
        { id: 'wri_2_2', title: 'Cultivate 1,000+ Engaged Weekly Readers', desc: 'Build an authentic newsletter community with open discussions and reader feedback.', craftXP: 50, discXP: 20, coins: 30, completed: false }
      ]
    },
    {
      tierId: 3,
      tierName: 'Tier 3: Industry Ready',
      subtitle: 'Monograph proposal, peer dialogues & intellectual influence',
      milestones: [
        { id: 'wri_3_1', title: 'Draft Complete Book Proposal / Dissertation Chapter', desc: 'Structure chapter outlines, market differentiation, and rigorous intellectual arguments.', craftXP: 75, discXP: 30, coins: 50, completed: false },
        { id: 'wri_3_2', title: 'Host Public Lectures & Literary Roundtables', desc: 'Present thought leadership at conferences and inspire the next cohort of thinkers.', craftXP: 70, discXP: 30, coins: 45, completed: false }
      ]
    },
    {
      tierId: 4,
      tierName: 'Tier 4: Dream Career Offer',
      subtitle: 'Acclaimed publication, literary award & lifetime intellectual freedom',
      milestones: [
        { id: 'wri_4_1', title: 'Secure Major Publishing Contract or Fellowship', desc: 'Ink publishing deal or secure prestigious research residency.', craftXP: 150, discXP: 50, coins: 100, completed: false },
        { id: 'wri_4_2', title: 'Dedicate Published Work to Family & Mentors', desc: 'Hold printed first edition dedicated to parents and mentors who believed in the craft.', craftXP: 100, discXP: 40, coins: 80, completed: false }
      ]
    }
  ],
  'Custom Ambition': [
    {
      tierId: 1,
      tierName: 'Tier 1: Foundations',
      subtitle: 'Clear self-definition, essentialist focus & habit consistency',
      milestones: [
        { id: 'cst_1_1', title: 'Codify Personal Philosophy & Daily Non-Negotiables', desc: 'Articulate core values, morning alignment ritual, and clear life ambition goals.', craftXP: 40, discXP: 20, coins: 25, completed: true },
        { id: 'cst_1_2', title: 'Dopamine Detox & High-Focus Environment Setup', desc: 'Eliminate digital distraction traps and design a sanctuary for focused creativity.', craftXP: 35, discXP: 15, coins: 20, completed: false }
      ]
    },
    {
      tierId: 2,
      tierName: 'Tier 2: Portfolio Builder',
      subtitle: 'Proof of concept, 30-day consistency sprint & real artifacts',
      milestones: [
        { id: 'cst_2_1', title: 'Ship First Milestone Artifact to the Public', desc: 'Translate aspiration into a tangible, observable creation that adds value to others.', craftXP: 60, discXP: 25, coins: 40, completed: false },
        { id: 'cst_2_2', title: 'Achieve 30-Day Unbroken Habit Streak', desc: 'Execute core discipline for 30 consecutive days without relying on fleeting motivation.', craftXP: 50, discXP: 25, coins: 30, completed: false }
      ]
    },
    {
      tierId: 3,
      tierName: 'Tier 3: Industry Ready',
      subtitle: 'Peer recognition, leadership by example & community impact',
      milestones: [
        { id: 'cst_3_1', title: 'Attain Recognized Competence in Chosen Domain', desc: 'Gain genuine validation from respected peers and industry practitioners.', craftXP: 75, discXP: 30, coins: 50, completed: false },
        { id: 'cst_3_2', title: 'Give Back: Mentor Another Aspiring Practitioner', desc: 'Share hard-won insights and lift someone else starting on their personal journey.', craftXP: 70, discXP: 30, coins: 45, completed: false }
      ]
    },
    {
      tierId: 4,
      tierName: 'Tier 4: Dream Career Offer',
      subtitle: 'Sovereign lifestyle, profound personal peace & legacy victory',
      milestones: [
        { id: 'cst_4_1', title: 'Fully Realize Ultimate Life Ambition Milestone', desc: 'Reach the pinnacle goal set when embarking on this Life RPG adventure.', craftXP: 150, discXP: 50, coins: 100, completed: false },
        { id: 'cst_4_2', title: 'Celebrate Transformed Life with Family & Loved Ones', desc: 'Honor the journey, express lifelong gratitude, and live with grounded joy.', craftXP: 100, discXP: 40, coins: 80, completed: false }
      ]
    }
  ]
};

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

// Pre-populated Relationship Bonds & Loved Ones (Relational Harmony & De-escalation)
const DEFAULT_RELATIONSHIP_BONDS = [
  {
    id: 'bond_dad',
    name: 'Dad',
    role: 'Father',
    icon: '👨‍💼',
    status: 'Sensitive',
    statusBadge: 'Sensitive',
    statusColor: '#F59E0B',
    dynamic: 'Quick to worry; values emotional steadiness, calm listening, and unprompted reassurance.',
    trust: 65,
    patienceStreak: 3,
    deescalationQuest: {
      id: 'deesc_dad',
      title: 'Active Listening & Grounded Reassurance',
      desc: 'Listen to his concerns for 10 minutes without defensive remarks or unsolicited counter-arguments.',
      completed: false,
      xp: 25,
      coins: 15
    },
    reflections: [
      { id: 'ref_dad_1', date: 'Yesterday', text: 'Spoke gently about my career progression. Held ground calmly without getting defensive when he voiced anxiety.', tag: 'Active Listening' }
    ]
  },
  {
    id: 'bond_mom',
    name: 'Mom',
    role: 'Mother',
    icon: '👩‍👧',
    status: 'Warm',
    statusBadge: 'Warm',
    statusColor: '#10B981',
    dynamic: 'Appreciates regular check-ins, genuine appreciation, and peaceful shared moments.',
    trust: 85,
    patienceStreak: 5,
    deescalationQuest: {
      id: 'deesc_mom',
      title: 'Plan Weekend Tea or Shared Walk',
      desc: 'Invite Mom for weekend tea or an unhurried walk with zero phone distractions.',
      completed: false,
      xp: 25,
      coins: 15
    },
    reflections: [
      { id: 'ref_mom_1', date: '2 days ago', text: 'Called her just to ask about her day. Listened with complete presence and shared gratitude.', tag: 'Regular Check-In' }
    ]
  },
  {
    id: 'bond_partner',
    name: 'Partner / Best Friend',
    role: 'Companion',
    icon: '🤝',
    status: 'Distant',
    statusBadge: 'Distant',
    statusColor: '#F43F5E',
    dynamic: 'Needs dedicated quality time, undistracted presence, and active emotional validation.',
    trust: 70,
    patienceStreak: 2,
    deescalationQuest: {
      id: 'deesc_partner',
      title: '30-Minute Undivided Attention Block',
      desc: 'Put devices in another room and engage in genuine conversation or a shared meal.',
      completed: false,
      xp: 25,
      coins: 15
    },
    reflections: [
      { id: 'ref_partner_1', date: '3 days ago', text: 'Put phone away during dinner and gave undivided focus to their thoughts.', tag: 'Quality Time' }
    ]
  }
];

class StateManager {
  constructor() {
    this.listeners = [];
    this.state = this.getInitialState();
  }

  // Generate initial or load per-user state from AuthManager
  getInitialState() {
    const user = window.Auth ? window.Auth.getCurrentUser() : null;
    const defaultTrack = (user && user.careerTrack) ? user.careerTrack : 'Software Engineer & Builder';
    const fallbackTree = CAREER_TREE_PRESETS[defaultTrack] || CAREER_TREE_PRESETS['Software Engineer & Builder'];

    // Enrich bonds with complete schema (trust, patienceStreak, deescalationQuest, reflections)
    const enrichBonds = (existingBonds) => {
      const source = (existingBonds && existingBonds.length > 0) ? existingBonds : DEFAULT_RELATIONSHIP_BONDS;
      return source.map(b => {
        const def = DEFAULT_RELATIONSHIP_BONDS.find(d => d.id === b.id) || {};
        return {
          ...def,
          ...b,
          trust: typeof b.trust === 'number' ? b.trust : (def.trust || 70),
          patienceStreak: typeof b.patienceStreak === 'number' ? b.patienceStreak : (def.patienceStreak || 1),
          deescalationQuest: b.deescalationQuest || (def.deescalationQuest ? JSON.parse(JSON.stringify(def.deescalationQuest)) : {
            id: `deesc_${b.id}`,
            title: 'Active Listening & Grounded Empathy',
            desc: 'Offer 15 minutes of calm, uninterrupted presence and validation.',
            completed: false,
            xp: 25,
            coins: 15
          }),
          reflections: (b.reflections && b.reflections.length > 0) ? b.reflections : (def.reflections ? JSON.parse(JSON.stringify(def.reflections)) : [])
        };
      });
    };

    if (user && user.userData) {
      const uTrack = user.userData.careerTrack || user.careerTrack || 'Software Engineer & Builder';
      const tree = (user.userData.careerTree && Array.isArray(user.userData.careerTree) && user.userData.careerTree.length > 0)
        ? user.userData.careerTree
        : JSON.parse(JSON.stringify(CAREER_TREE_PRESETS[uTrack] || CAREER_TREE_PRESETS['Software Engineer & Builder']));

      return {
        ...user.userData,
        username: user.username,
        fullName: user.fullName || user.username,
        careerTrack: uTrack,
        careerTree: tree,
        lifeGoal: (user.userData.lifeGoal && user.userData.lifeGoal !== 'undefined') ? user.userData.lifeGoal : (user.lifeGoal || 'Master full-stack engineering and bring security to loved ones.'),
        themeMode: user.userData.themeMode || user.themeMode || 'dark',
        quests: (user.userData.quests && user.userData.quests.length > 0) 
          ? user.userData.quests 
          : [...JSON.parse(JSON.stringify(DEFAULT_ROUTINE)), ...JSON.parse(JSON.stringify(SPECIAL_QUESTS))],
        relationshipBonds: enrichBonds(user.userData.relationshipBonds)
      };
    }

    // Default clean state
    return {
      username: user ? user.username : 'arpita',
      fullName: user ? user.fullName : 'Arpita',
      totalXP: 0,
      currency: 20, // Initial starter Life Credits
      streak: 1,
      themeMode: user?.themeMode || 'dark',
      soundEnabled: true,
      careerTrack: defaultTrack,
      careerTree: JSON.parse(JSON.stringify(fallbackTree)),
      lifeGoal: user ? user.lifeGoal : 'Master full-stack engineering, ship real tools, and cultivate calm presence.',
      relationshipBonds: JSON.parse(JSON.stringify(DEFAULT_RELATIONSHIP_BONDS)),
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

  // Non-linear XP formula: XP_req = 100 * L^1.5
  getXPReqForLevel(level) {
    return Math.round(100 * Math.pow(level, 1.5));
  }

  // Calculate Level, progress XP, and required XP under the non-linear formula
  getLevelInfo() {
    let level = 1;
    let xpRemaining = Math.max(0, this.state.totalXP || 0);
    let req = this.getXPReqForLevel(level);

    while (xpRemaining >= req) {
      xpRemaining -= req;
      level++;
      req = this.getXPReqForLevel(level);
    }

    const percent = Math.min(100, Math.max(0, Math.round((xpRemaining / req) * 100)));

    return {
      level,
      currentXP: xpRemaining,
      reqXP: req,
      percent
    };
  }

  getLevel() {
    return this.getLevelInfo().level;
  }

  getLevelProgressXP() {
    return this.getLevelInfo().currentXP;
  }

  getLevelReqXP() {
    return this.getLevelInfo().reqXP;
  }

  getLevelProgressPercent() {
    return this.getLevelInfo().percent;
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

  // Compute points and level for each of the 6 pillars
  getPillarStats() {
    const points = {
      Craft: 0,
      Resilience: 0,
      Calm: 0,
      LovedOnes: 0,
      Discipline: 0,
      Joy: 0
    };

    // Points from completed quests
    (this.state.quests || []).forEach(q => {
      if (q.completed && points.hasOwnProperty(q.pillar)) {
        points[q.pillar] += (q.xp || 0);
      }
    });

    // Points from completed career milestones (awards Craft and Discipline)
    if (this.state.careerTree && Array.isArray(this.state.careerTree)) {
      this.state.careerTree.forEach(tier => {
        (tier.milestones || []).forEach(m => {
          if (m.completed) {
            points.Craft += (m.craftXP || 0);
            points.Discipline += (m.discXP || 0);
          }
        });
      });
    }

    // Points from relationship bonds (completed de-escalation quests)
    if (this.state.relationshipBonds && Array.isArray(this.state.relationshipBonds)) {
      this.state.relationshipBonds.forEach(b => {
        if (b.deescalationQuest && b.deescalationQuest.completed) {
          points.LovedOnes += (b.deescalationQuest.xp || 25);
        }
      });
    }

    const pillarLevels = {};
    const pillarProgress = {};
    const maxTargets = {
      Craft: 100,
      Resilience: 100,
      Calm: 100,
      LovedOnes: 100,
      Discipline: 100,
      Joy: 100
    };

    Object.keys(points).forEach(k => {
      pillarLevels[k] = Math.floor(points[k] / 30) + 1;
      pillarProgress[k] = Math.min(100, Math.round(((points[k] % 30) / 30) * 100));
    });

    return { points, pillarLevels, pillarProgress, maxTargets };
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

  // Toggle Career Progression Tree milestone
  toggleCareerMilestone(milestoneId) {
    if (!this.state.careerTree || !Array.isArray(this.state.careerTree)) return null;

    let targetMilestone = null;
    let targetTier = null;

    for (const tier of this.state.careerTree) {
      const found = (tier.milestones || []).find(m => m.id === milestoneId);
      if (found) {
        targetMilestone = found;
        targetTier = tier;
        break;
      }
    }

    if (!targetMilestone) return null;

    const oldLevel = this.getLevel();
    const earnedXP = (targetMilestone.craftXP || 0) + (targetMilestone.discXP || 0);
    const earnedCoins = targetMilestone.coins || 0;

    if (!targetMilestone.completed) {
      targetMilestone.completed = true;
      targetMilestone.completedAt = new Date().toISOString();
      this.state.totalXP = (this.state.totalXP || 0) + earnedXP;
      this.state.currency = (this.state.currency || 0) + earnedCoins;

      const newLevel = this.getLevel();
      const didLevelUp = newLevel > oldLevel;
      if (didLevelUp) {
        this.state.currency += 20; // 20 bonus Life Credits on leveling up!
      }

      this.saveState();
      this.notify();

      return {
        milestone: targetMilestone,
        tier: targetTier,
        isCompleted: true,
        xpGained: earnedXP,
        craftXP: targetMilestone.craftXP || 0,
        discXP: targetMilestone.discXP || 0,
        coinsGained: earnedCoins,
        oldLevel,
        newLevel,
        careerTrack: this.state.careerTrack,
        didLevelUp
      };
    } else {
      targetMilestone.completed = false;
      targetMilestone.completedAt = null;
      this.state.totalXP = Math.max(0, (this.state.totalXP || 0) - earnedXP);
      this.state.currency = Math.max(0, (this.state.currency || 0) - earnedCoins);

      this.saveState();
      this.notify();

      return {
        milestone: targetMilestone,
        tier: targetTier,
        isCompleted: false,
        xpGained: -earnedXP,
        coinsGained: -earnedCoins,
        oldLevel,
        newLevel: this.getLevel(),
        didLevelUp: false
      };
    }
  }

  // Change Career Track & load appropriate progression tree
  setCareerTrack(trackName) {
    const validTrack = CAREER_TREE_PRESETS[trackName] ? trackName : 'Software Engineer & Builder';
    this.state.careerTrack = validTrack;
    this.state.careerTree = JSON.parse(JSON.stringify(CAREER_TREE_PRESETS[validTrack]));
    this.saveState();
    this.notify();
  }

  // Log an honest personal reflection / interaction for a bond
  logBondInteraction(bondId, reflectionText, tag = 'Active Listening') {
    const bond = (this.state.relationshipBonds || []).find(b => b.id === bondId);
    if (!bond) return null;

    const oldLevel = this.getLevel();
    const earnedXP = 25;
    const earnedCoins = 15;

    // 1. Add LovedOnes XP and starter Life Credits
    this.state.totalXP = (this.state.totalXP || 0) + earnedXP;
    this.state.currency = (this.state.currency || 0) + earnedCoins;

    // 2. Increase Trust meter by 5% (capped at 100%)
    bond.trust = Math.min(100, (bond.trust || 65) + 5);

    // 3. Increment Patience Streak
    bond.patienceStreak = (bond.patienceStreak || 0) + 1;

    // 4. Update status tier dynamically
    if (bond.trust >= 90) {
      bond.status = 'Harmonious';
      bond.statusColor = '#10B981';
    } else if (bond.trust >= 75) {
      bond.status = 'Warm';
      bond.statusColor = '#10B981';
    } else if (bond.trust >= 60) {
      bond.status = 'Sensitive';
      bond.statusColor = '#F59E0B';
    }

    // 5. Append reflection entry
    if (!Array.isArray(bond.reflections)) {
      bond.reflections = [];
    }
    const newReflection = {
      id: `ref_${Date.now()}`,
      date: 'Just now',
      text: (reflectionText && reflectionText.trim()) || 'Maintained calm presence and genuine listening.',
      tag: tag || 'Active Listening'
    };
    bond.reflections.unshift(newReflection);

    const newLevel = this.getLevel();
    const didLevelUp = newLevel > oldLevel;
    if (didLevelUp) {
      this.state.currency += 20;
    }

    this.saveState();
    this.notify();

    return {
      bond,
      reflection: newReflection,
      xpGained: earnedXP,
      coinsGained: earnedCoins,
      newTrust: bond.trust,
      newStreak: bond.patienceStreak,
      oldLevel,
      newLevel,
      didLevelUp,
      leveledUp: didLevelUp
    };
  }

  // Toggle De-escalation Quest for a bond
  toggleBondDeescalationQuest(bondId) {
    const bond = (this.state.relationshipBonds || []).find(b => b.id === bondId);
    if (!bond || !bond.deescalationQuest) return null;

    const quest = bond.deescalationQuest;
    const oldLevel = this.getLevel();
    const earnedXP = quest.xp || 25;
    const earnedCoins = quest.coins || 15;

    if (!quest.completed) {
      quest.completed = true;
      quest.completedAt = new Date().toISOString();
      this.state.totalXP = (this.state.totalXP || 0) + earnedXP;
      this.state.currency = (this.state.currency || 0) + earnedCoins;
      bond.trust = Math.min(100, (bond.trust || 70) + 3);

      const newLevel = this.getLevel();
      const didLevelUp = newLevel > oldLevel;
      if (didLevelUp) {
        this.state.currency += 20;
      }

      this.saveState();
      this.notify();

      return {
        bond,
        quest,
        isCompleted: true,
        completed: true,
        xpGained: earnedXP,
        coinsGained: earnedCoins,
        oldLevel,
        newLevel,
        didLevelUp,
        leveledUp: didLevelUp
      };
    } else {
      quest.completed = false;
      quest.completedAt = null;
      this.state.totalXP = Math.max(0, (this.state.totalXP || 0) - earnedXP);
      this.state.currency = Math.max(0, (this.state.currency || 0) - earnedCoins);
      bond.trust = Math.max(0, (bond.trust || 70) - 3);

      this.saveState();
      this.notify();

      return {
        bond,
        quest,
        isCompleted: false,
        completed: false,
        xpGained: -earnedXP,
        coinsGained: -earnedCoins,
        oldLevel,
        newLevel: this.getLevel(),
        didLevelUp: false,
        leveledUp: false
      };
    }
  }

  // Add a customizable bond
  addCustomBond(name, role, dynamic, initialTrust = 75, status = 'Warm') {
    const newBond = {
      id: `bond_${Date.now()}`,
      name: name.trim(),
      role: role.trim() || 'Companion',
      icon: '🤝',
      status: status || 'Warm',
      statusBadge: status || 'Warm',
      statusColor: status === 'Warm' ? '#10B981' : (status === 'Distant' ? '#F43F5E' : '#F59E0B'),
      dynamic: dynamic.trim() || 'Values mutual care, trust, and shared flourishing.',
      trust: parseInt(initialTrust) || 75,
      patienceStreak: 1,
      deescalationQuest: {
        id: `deesc_${Date.now()}`,
        title: 'Check-In & Active Presence',
        desc: 'Reach out with genuine, unhurried curiosity and zero agenda.',
        completed: false,
        xp: 25,
        coins: 15
      },
      reflections: [
        { id: `ref_${Date.now()}`, date: 'Today', text: 'Initiated relationship tracking to cultivate intentional care.', tag: 'Initiated Bond' }
      ]
    };

    if (!Array.isArray(this.state.relationshipBonds)) {
      this.state.relationshipBonds = [];
    }
    this.state.relationshipBonds.push(newBond);
    this.saveState();
    this.notify();
    return newBond;
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
window.CAREER_TREE_PRESETS = CAREER_TREE_PRESETS;
window.DEFAULT_RELATIONSHIP_BONDS = DEFAULT_RELATIONSHIP_BONDS;
window.XP_PER_LEVEL = XP_PER_LEVEL;
