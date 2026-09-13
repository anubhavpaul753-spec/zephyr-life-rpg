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
// Comprehensive 24-Domain Career Taxonomy
const CAREER_TRACKS = [
  { id: 'student', name: 'Student & Academic Learner', defaultGoal: 'Excel in academic foundations, build deep learning habits, and unlock high-potential opportunities.' },
  { id: 'swe', name: 'Software Engineer & Full-Stack Developer', defaultGoal: 'Master system design, build production web/mobile apps, and deliver scalable software.' },
  { id: 'hardware', name: 'Hardware & Electronics Engineer', defaultGoal: 'Design embedded circuits, master firmware development, and build tangible electronic devices.' },
  { id: 'mech', name: 'Mechanical & Robotics Engineer', defaultGoal: 'Master CAD modeling, physical prototyping, robotics automation, and structural mechanics.' },
  { id: 'civil', name: 'Civil & Structural Engineer', defaultGoal: 'Design resilient public infrastructure, master sustainable materials, and manage urban projects.' },
  { id: 'doctor', name: 'Doctor & Healthcare Practitioner', defaultGoal: 'Excel in clinical diagnostics, empathetic patient care, and continuous medical advancement.' },
  { id: 'nurse', name: 'Nurse & Clinical Specialist', defaultGoal: 'Deliver compassionate bedside care, master emergency triage, and support patient healing.' },
  { id: 'pilot', name: 'Commercial Aviator & Pilot', defaultGoal: 'Master flight aerodynamics, rigorous safety protocols, and cross-continental navigation.' },
  { id: 'astronaut', name: 'Astronaut & Aerospace Researcher', defaultGoal: 'Push propulsion engineering, orbital mechanics, and extraterrestrial scientific inquiry.' },
  { id: 'musician', name: 'Musician, Composer & Audio Producer', defaultGoal: 'Master music theory, instrumental craft, acoustic arrangement, and emotional sonic resonance.' },
  { id: 'dancer', name: 'Dancer & Choreographer', defaultGoal: 'Cultivate extraordinary somatic grace, physical discipline, and expressive performance art.' },
  { id: 'artist', name: 'Visual Artist, Illustrator & Painter', defaultGoal: 'Master color harmony, visual composition, concept illustration, and evocative gallery exhibits.' },
  { id: 'design', name: 'UI/UX & Product Designer', defaultGoal: 'Craft intuitive design systems, frictionless interfaces, and humane digital experiences.' },
  { id: 'founder', name: 'Entrepreneur & Startup Founder', defaultGoal: 'Validate genuine market problems, achieve profitable product-market fit, and build lasting freedom.' },
  { id: 'teacher', name: 'Teacher, Professor & Educator', defaultGoal: 'Ignite intellectual curiosity, mentor future generations, and simplify complex wisdom.' },
  { id: 'writer', name: 'Writer, Journalist & Author', defaultGoal: 'Master prose precision, investigate deep human stories, and publish resonant foundational books.' },
  { id: 'lawyer', name: 'Lawyer & Legal Advocate', defaultGoal: 'Master jurisprudence, defend human rights, craft watertight contracts, and champion justice.' },
  { id: 'chef', name: 'Chef & Culinary Arts Professional', defaultGoal: 'Master gastronomy, kitchen leadership, exquisite flavors, and hospitality excellence.' },
  { id: 'civil_services', name: 'Civil Services & Public Policy Leader', defaultGoal: 'Execute ethical public governance, optimize community welfare, and lead policy reforms.' },
  { id: 'trades', name: 'Trades, Craftsman & Artisan', defaultGoal: 'Master hands-on craftsmanship, carpentry, electrical mastery, and enduring physical builds.' },
  { id: 'athlete', name: 'Athlete, Coach & Fitness Specialist', defaultGoal: 'Reach peak physiological resilience, inspire athletic excellence, and coach transformative health.' },
  { id: 'scientist', name: 'Research Scientist & Mathematician', defaultGoal: 'Conduct peer-reviewed research, discover physical principles, and solve mathematical conjectures.' },
  { id: 'finance', name: 'Finance, Banking & Investment Analyst', defaultGoal: 'Master capital allocation, risk modeling, market dynamics, and ethical wealth stewardship.' },
  { id: 'filmmaker', name: 'Filmmaker, Director & Cinematographer', defaultGoal: 'Master visual storytelling, cinematic lighting, directorial vision, and poignant filmmaking.' }
];
if (typeof window !== "undefined") window.CAREER_TRACKS = CAREER_TRACKS;

// Visual Progression Tree Presets: 4 Distinct Tiers for each Career Track
// Visual Progression Tree Presets: 4 Distinct Tiers for prominent career tracks
const CAREER_TREE_PRESETS = {
  'Software Engineer & Full-Stack Developer': [
    {
      tierId: 1,
      tierName: 'Foundations & Algorithmic Thinking',
      subtitle: 'Core computer science, data structures, clean code & git hygiene',
      milestones: [
        { id: 'swe_1_1', title: 'Data Structures & Algorithmic Thinking', desc: 'Implement hash maps, trees, graphs, and master space-time complexity analysis.', craftXP: 40, discXP: 15, coins: 25, completed: true },
        { id: 'swe_1_2', title: 'Clean Architecture & Testing Discipline', desc: 'Write testable modular components, SOLID principles, and CI/CD pipelines.', craftXP: 35, discXP: 15, coins: 20, completed: false }
      ]
    },
    {
      tierId: 2,
      tierName: 'Portfolio Builder & Full-Stack Mastery',
      subtitle: 'Full-stack web services, scalable API design & resilient state models',
      milestones: [
        { id: 'swe_2_1', title: 'Ship 2 Production Full-Stack Applications', desc: 'Deploy complete web services with authentication, database persistence, and CDN hosting.', craftXP: 60, discXP: 25, coins: 40, completed: false },
        { id: 'swe_2_2', title: 'Database Optimization & Schema Mastery', desc: 'Design normalized relational schemas, indexing strategies, and resilient queries.', craftXP: 50, discXP: 20, coins: 30, completed: false }
      ]
    },
    {
      tierId: 3,
      tierName: 'Industry Ready & Systems Architecture',
      subtitle: 'High-availability microservices, asynchronous queues & technical storytelling',
      milestones: [
        { id: 'swe_3_1', title: 'High-Availability System Design', desc: 'Design microservices, caching layers (Redis), load balancing, and asynchronous queues.', craftXP: 75, discXP: 30, coins: 50, completed: false },
        { id: 'swe_3_2', title: 'Open Source Contribution & Tech Deep Dives', desc: 'Contribute bug fixes to active repositories and write in-depth engineering breakdowns.', craftXP: 70, discXP: 30, coins: 45, completed: false }
      ]
    },
    {
      tierId: 4,
      tierName: 'Dream Career Offer & Scaled Impact',
      subtitle: 'Onsite interview triumph, architectural leadership & family celebration',
      milestones: [
        { id: 'swe_4_1', title: 'Ace Technical Onsites & Negotiate Dream Offer', desc: 'Pass rigorous architectural interviews and secure the high-impact software role.', craftXP: 150, discXP: 50, coins: 100, completed: false },
        { id: 'swe_4_2', title: 'Ship Production Code to 100k+ Users & Celebrate', desc: 'Push signature code to hundreds of thousands of users and share success with loved ones.', craftXP: 100, discXP: 40, coins: 80, completed: false }
      ]
    }
  ],
  'Software Engineer & Builder': [
    {
      tierId: 1,
      tierName: 'Foundations & Algorithmic Thinking',
      subtitle: 'Core computer science, data structures, clean code & git hygiene',
      milestones: [
        { id: 'swe_1_1', title: 'Data Structures & Algorithmic Thinking', desc: 'Implement hash maps, trees, graphs, and master space-time complexity analysis.', craftXP: 40, discXP: 15, coins: 25, completed: true },
        { id: 'swe_1_2', title: 'Clean Architecture & Testing Discipline', desc: 'Write testable modular components, SOLID principles, and CI/CD pipelines.', craftXP: 35, discXP: 15, coins: 20, completed: false }
      ]
    },
    {
      tierId: 2,
      tierName: 'Portfolio Builder & Full-Stack Mastery',
      subtitle: 'Full-stack web services, scalable API design & resilient state models',
      milestones: [
        { id: 'swe_2_1', title: 'Ship 2 Production Full-Stack Applications', desc: 'Deploy complete web services with authentication, database persistence, and CDN hosting.', craftXP: 60, discXP: 25, coins: 40, completed: false },
        { id: 'swe_2_2', title: 'Database Optimization & Schema Mastery', desc: 'Design normalized relational schemas, indexing strategies, and resilient queries.', craftXP: 50, discXP: 20, coins: 30, completed: false }
      ]
    },
    {
      tierId: 3,
      tierName: 'Industry Ready & Systems Architecture',
      subtitle: 'High-availability microservices, asynchronous queues & technical storytelling',
      milestones: [
        { id: 'swe_3_1', title: 'High-Availability System Design', desc: 'Design microservices, caching layers (Redis), load balancing, and asynchronous queues.', craftXP: 75, discXP: 30, coins: 50, completed: false },
        { id: 'swe_3_2', title: 'Open Source Contribution & Tech Deep Dives', desc: 'Contribute bug fixes to active repositories and write in-depth engineering breakdowns.', craftXP: 70, discXP: 30, coins: 45, completed: false }
      ]
    },
    {
      tierId: 4,
      tierName: 'Dream Career Offer & Scaled Impact',
      subtitle: 'Onsite interview triumph, architectural leadership & family celebration',
      milestones: [
        { id: 'swe_4_1', title: 'Ace Technical Onsites & Negotiate Dream Offer', desc: 'Pass rigorous architectural interviews and secure the high-impact software role.', craftXP: 150, discXP: 50, coins: 100, completed: false },
        { id: 'swe_4_2', title: 'Ship Production Code to 100k+ Users & Celebrate', desc: 'Push signature code to hundreds of thousands of users and share success with loved ones.', craftXP: 100, discXP: 40, coins: 80, completed: false }
      ]
    }
  ],
  'Student & Academic Learner': [
    {
      tierId: 1,
      tierName: 'Cognitive Foundations & Study Systems',
      subtitle: 'Active recall, spaced repetition, Cornell notes & deep work blocks',
      milestones: [
        { id: 'stu_1_1', title: 'Establish 45-Min Daily Spaced Repetition Habit', desc: 'Build an unbroken Anki/flashcard review ritual across core subjects.', craftXP: 40, discXP: 20, coins: 25, completed: true },
        { id: 'stu_1_2', title: 'Synthesize Complete Course Cornell Notes Repository', desc: 'Structure lecture concepts, core formulas, and weekly summaries into clean notes.', craftXP: 35, discXP: 15, coins: 20, completed: false }
      ]
    },
    {
      tierId: 2,
      tierName: 'Examination Mastery & Problem Sprints',
      subtitle: 'Timed mock exams, error log analysis & Feynman technique workshops',
      milestones: [
        { id: 'stu_2_1', title: 'Solve 10 Complete Past Exam Papers Under Timed Conditions', desc: 'Simulate high-stakes exam conditions and build unflappable testing stamina.', craftXP: 60, discXP: 25, coins: 40, completed: false },
        { id: 'stu_2_2', title: 'Master Error Log Post-Mortems', desc: 'Catalog every missed problem, identify root misunderstanding, and re-solve without hints.', craftXP: 50, discXP: 20, coins: 30, completed: false }
      ]
    },
    {
      tierId: 3,
      tierName: 'Honors Research & Academic Recognition',
      subtitle: 'Undergraduate thesis, faculty mentorship & seminar presentations',
      milestones: [
        { id: 'stu_3_1', title: 'Publish Academic Paper or Complete Capstone Thesis', desc: 'Conduct original research, synthesize literature review, and submit for faculty review.', craftXP: 80, discXP: 30, coins: 55, completed: false },
        { id: 'stu_3_2', title: 'Lead Peer Study Circles & Faculty Teaching Assistantship', desc: 'Teach complex syllabus modules to junior cohorts using the Feynman method.', craftXP: 70, discXP: 30, coins: 45, completed: false }
      ]
    },
    {
      tierId: 4,
      tierName: 'Summa Cum Laude & Fellowship Victory',
      subtitle: 'Top-percentile graduation, scholarship admission & family joy',
      milestones: [
        { id: 'stu_4_1', title: 'Secure Prestigious Graduate Fellowship / Top Degree Honors', desc: 'Graduate in the top percentile and earn prestigious scholarship or career offer.', craftXP: 150, discXP: 50, coins: 100, completed: false },
        { id: 'stu_4_2', title: 'Honor Parents & Mentors at Convocation', desc: 'Celebrate academic milestone with family, expressing heartfelt gratitude for their sacrifices.', craftXP: 100, discXP: 40, coins: 80, completed: false }
      ]
    }
  ],
  'Doctor & Healthcare Practitioner': [
    {
      tierId: 1,
      tierName: 'Pre-Clinical Science & Diagnostic Rigor',
      subtitle: 'Human anatomy, pathology, clinical pharmacology & diagnostic reasoning',
      milestones: [
        { id: 'doc_1_1', title: 'Master Clinical Anatomy & Physiological Systems', desc: 'Synthesize organic pathology, cardiovascular systems, and diagnostic criteria.', craftXP: 45, discXP: 20, coins: 25, completed: true },
        { id: 'doc_1_2', title: 'Emergency Triage & Patient History Taking', desc: 'Conduct systematic patient examinations with grounded composure and precision.', craftXP: 40, discXP: 15, coins: 20, completed: false }
      ]
    },
    {
      tierId: 2,
      tierName: 'Clinical Rotations & Bedside Empathy',
      subtitle: 'Ward rounds, diagnostic investigations & compassionate bedside communication',
      milestones: [
        { id: 'doc_2_1', title: 'Execute 100+ Bedside Rounds with Deep Empathy', desc: 'Deliver patient-centered consultations, balancing medical precision with warm reassurance.', craftXP: 65, discXP: 25, coins: 40, completed: false },
        { id: 'doc_2_2', title: 'Differential Diagnosis Mastery Under Pressure', desc: 'Analyze complex multi-symptom case studies and formulate optimal treatment plans.', craftXP: 55, discXP: 20, coins: 30, completed: false }
      ]
    },
    {
      tierId: 3,
      tierName: 'Residency Specialization & Surgical/Clinical Leadership',
      subtitle: 'Specialty board exams, trauma care & clinical trial contribution',
      milestones: [
        { id: 'doc_3_1', title: 'Pass Specialty Board Examinations with Distinction', desc: 'Attain board certification in chosen medical specialty with top evaluations.', craftXP: 85, discXP: 35, coins: 60, completed: false },
        { id: 'doc_3_2', title: 'Publish Clinical Case Study in Peer-Reviewed Journal', desc: 'Document novel diagnostic discoveries and therapeutic outcomes in medical literature.', craftXP: 75, discXP: 30, coins: 50, completed: false }
      ]
    },
    {
      tierId: 4,
      tierName: 'Consultant Appointment & Lifesaving Impact',
      subtitle: 'Attending physician leadership, community healthcare & personal peace',
      milestones: [
        { id: 'doc_4_1', title: 'Appointed Consultant / Attending Specialist Physician', desc: 'Lead clinical teams, mentor junior residents, and oversee complex inpatient care.', craftXP: 160, discXP: 50, coins: 110, completed: false },
        { id: 'doc_4_2', title: 'Restore Countless Lives While Maintaining Inner Equilibrium', desc: 'Practice empathetic, world-class medicine while sustaining deep emotional balance at home.', craftXP: 100, discXP: 40, coins: 85, completed: false }
      ]
    }
  ],
  'Entrepreneur & Startup Founder': [
    {
      tierId: 1,
      tierName: 'Problem Validation & Zero-to-One Sprint',
      subtitle: 'User interviews, painful problem discovery, lean prototyping & landing test',
      milestones: [
        { id: 'fnd_1_1', title: 'Conduct 50 Problem Discovery Customer Interviews', desc: 'Uncover hair-on-fire problems without pitching solutions; isolate true willingness to pay.', craftXP: 45, discXP: 20, coins: 25, completed: true },
        { id: 'fnd_1_2', title: 'Launch High-Conversion MVP Prototype in 14 Days', desc: 'Build and deploy a functional minimum viable product to test core value hypothesis.', craftXP: 40, discXP: 20, coins: 20, completed: false }
      ]
    },
    {
      tierId: 2,
      tierName: 'Product-Market Fit & Repeatable Revenue',
      subtitle: 'First 100 paying customers, unit economics & churn reduction',
      milestones: [
        { id: 'fnd_2_1', title: 'Acquire First 50 Paying Customers Organically', desc: 'Demonstrate real value proposition with positive organic retention and customer delight.', craftXP: 70, discXP: 30, coins: 50, completed: false },
        { id: 'fnd_2_2', title: 'Achieve Healthy Unit Economics & Positive Net Margins', desc: 'Optimize customer acquisition cost (CAC) and lifetime value (LTV) for scalability.', craftXP: 60, discXP: 25, coins: 40, completed: false }
      ]
    },
    {
      tierId: 3,
      tierName: 'Growth Engine & Operational Excellence',
      subtitle: 'High-performing team hiring, distribution channels & institutional scaling',
      milestones: [
        { id: 'fnd_3_1', title: 'Scale to $10,000+ Monthly Recurring Revenue (MRR)', desc: 'Build scalable inbound loops, content flywheels, and automated onboarding.', craftXP: 90, discXP: 40, coins: 65, completed: false },
        { id: 'fnd_3_2', title: 'Recruit Elite Core Team Aligned with Craft & Speed', desc: 'Hire first essential operators and foster an ownership culture with shared equity.', craftXP: 75, discXP: 30, coins: 50, completed: false }
      ]
    },
    {
      tierId: 4,
      tierName: 'Sovereign Independence & Family Legacy',
      subtitle: 'Profitable sovereignty or milestone exit & lifelong freedom',
      milestones: [
        { id: 'fnd_4_1', title: 'Achieve True Financial Sovereignty & Scaled Impact', desc: 'Generate multi-million dollar enterprise value while solving real human problems.', craftXP: 170, discXP: 60, coins: 125, completed: false },
        { id: 'fnd_4_2', title: 'Provide Lasting Generational Security for Loved Ones', desc: 'Share the fruits of enterprise with parents, family, and community pillars.', craftXP: 120, discXP: 50, coins: 100, completed: false }
      ]
    }
  ],
  'UI/UX & Product Designer': [
    {
      tierId: 1,
      tierName: 'Design Systems & Heuristic Foundations',
      subtitle: 'Figma auto-layout, design tokens, typography scales & user research',
      milestones: [
        { id: 'des_1_1', title: 'Architect Comprehensive Design System in Figma', desc: 'Construct scalable design tokens, responsive auto-layout components, and atomic styles.', craftXP: 40, discXP: 15, coins: 25, completed: true },
        { id: 'des_1_2', title: 'Conduct Usability Audits & Heuristic Evaluation', desc: 'Perform usability testing, identify interaction friction, and map clean user journeys.', craftXP: 35, discXP: 15, coins: 20, completed: false }
      ]
    },
    {
      tierId: 2,
      tierName: 'High-Fidelity Case Studies & Micro-Interactions',
      subtitle: 'Interactive prototypes, motion curves, user testing & design critique',
      milestones: [
        { id: 'des_2_1', title: 'Publish 2 Comprehensive End-to-End Product Case Studies', desc: 'Document discovery, wireframes, user testing data, and high-fidelity polished prototypes.', craftXP: 65, discXP: 25, coins: 40, completed: false },
        { id: 'des_2_2', title: 'Master Micro-Interactions & Motion Choreography', desc: 'Design delightful state transitions, haptic responses, and spring physics in prototypes.', craftXP: 50, discXP: 20, coins: 30, completed: false }
      ]
    },
    {
      tierId: 3,
      tierName: 'Product Strategy & Cross-Functional Influence',
      subtitle: 'Product vision, engineering handoff precision & business metric impact',
      milestones: [
        { id: 'des_3_1', title: 'Design Product Feature that Moves Core Retention Metric', desc: 'Partner with engineering and product management to ship a high-converting experience.', craftXP: 80, discXP: 30, coins: 50, completed: false },
        { id: 'des_3_2', title: 'Contribute to Open Source Design Community & Mentor', desc: 'Share free Figma community kits and mentor junior designers entering the craft.', craftXP: 70, discXP: 25, coins: 40, completed: false }
      ]
    },
    {
      tierId: 4,
      tierName: 'Lead Staff Designer & Aesthetic Mastery',
      subtitle: 'Design leadership at top-tier product studio & international recognition',
      milestones: [
        { id: 'des_4_1', title: 'Attain Principal / Staff Product Designer Title', desc: 'Direct end-to-end design language for an iconic digital application used by millions.', craftXP: 150, discXP: 50, coins: 100, completed: false },
        { id: 'des_4_2', title: 'Design a Humane World & Celebrate with Loved Ones', desc: 'Craft software that respects human attention, creating peace for yourself and family.', craftXP: 100, discXP: 40, coins: 80, completed: false }
      ]
    }
  ],
  'Athlete, Coach & Fitness Specialist': [
    {
      tierId: 1,
      tierName: 'Physiological Base & Movement Mechanics',
      subtitle: 'Compound movement mastery, aerobic base, nutrition & sleep tracking',
      milestones: [
        { id: 'ath_1_1', title: 'Master Big 4 Compound Lifts with Impeccable Form', desc: 'Establish safe, deep neural biomechanics in squat, hinge, push, and pull patterns.', craftXP: 45, discXP: 20, coins: 25, completed: true },
        { id: 'ath_1_2', title: '60 Consecutive Days of Consistent Macro & Protein Fueling', desc: 'Track daily nutrition diligently to support muscular recovery and cellular vitality.', craftXP: 40, discXP: 25, coins: 25, completed: false }
      ]
    },
    {
      tierId: 2,
      tierName: 'Athletic Conditioning & Peak Performance',
      subtitle: 'Zone 2 cardio stamina, periodized strength cycle & mobility longevity',
      milestones: [
        { id: 'ath_2_1', title: 'Complete 12-Week Periodized Strength/Conditioning Block', desc: 'Surpass personal athletic records in VO2 max and relative strength benchmarks.', craftXP: 65, discXP: 30, coins: 45, completed: false },
        { id: 'ath_2_2', title: 'Master Cold/Sauna Nervous System Recovery Protocols', desc: 'Optimize heart rate variability (HRV) and deep sleep architecture for rapid repair.', craftXP: 50, discXP: 20, coins: 30, completed: false }
      ]
    },
    {
      tierId: 3,
      tierName: 'Competition Triumph & Transformative Coaching',
      subtitle: 'Podium placement, coaching methodology & inspiring hundreds to health',
      milestones: [
        { id: 'ath_3_1', title: 'Compete in Sanctioned Athletic Championship', desc: 'Test physical and mental fortitude on the competition floor with unwavering focus.', craftXP: 85, discXP: 35, coins: 60, completed: false },
        { id: 'ath_3_2', title: 'Coach 25+ Clients to Life-Altering Health Transformations', desc: 'Guide individuals to reverse metabolic disease, gain strength, and discover self-worth.', craftXP: 75, discXP: 30, coins: 50, completed: false }
      ]
    },
    {
      tierId: 4,
      tierName: 'Elite Mastery & Lifelong Somatic Freedom',
      subtitle: 'Peak physical sovereignty, recognized sports leadership & vibrant vitality',
      milestones: [
        { id: 'ath_4_1', title: 'Achieve Master Coach / Elite Competitor Status', desc: 'Reach pinnacle conditioning and establish a celebrated athletic training facility or academy.', craftXP: 160, discXP: 50, coins: 110, completed: false },
        { id: 'ath_4_2', title: 'Live as a Beacon of Vitality for Family and Community', desc: 'Maintain extraordinary physical stamina into your golden years alongside loved ones.', craftXP: 100, discXP: 40, coins: 85, completed: false }
      ]
    }
  ],
  'Writer, Journalist & Author': [
    {
      tierId: 1,
      tierName: 'Prose Craft & Daily Writing Discipline',
      subtitle: 'Daily 1,000-word uninterrupted block, reading masters & research vault',
      milestones: [
        { id: 'wri_1_1', title: 'Establish Unbroken 30-Day Morning Writing Ritual', desc: 'Write 1,000 words every sunrise with complete focus on clarity, rhythm, and truth.', craftXP: 40, discXP: 20, coins: 25, completed: true },
        { id: 'wri_1_2', title: 'Curate a Second Brain Knowledge & Citation Vault', desc: 'Catalog deep non-fiction insights, historical quotes, and cross-disciplinary analogies.', craftXP: 35, discXP: 15, coins: 20, completed: false }
      ]
    },
    {
      tierId: 2,
      tierName: 'Long-Form Essays & Audience Resonance',
      subtitle: 'Publishing cadence, substantive reporting & essay circulation',
      milestones: [
        { id: 'wri_2_1', title: 'Publish 10 Foundational Investigative Essays', desc: 'Release deeply researched treatises exploring human nature, science, and ethics.', craftXP: 65, discXP: 25, coins: 40, completed: false },
        { id: 'wri_2_2', title: 'Grow Dedicated Readership of 1,500+ Thinkers', desc: 'Foster thoughtful dialogues and intellectual exchanges through an independent newsletter.', craftXP: 50, discXP: 20, coins: 30, completed: false }
      ]
    },
    {
      tierId: 3,
      tierName: 'Monograph Proposal & Literary Recognition',
      subtitle: 'Manuscript drafting, structural line editing & literary representation',
      milestones: [
        { id: 'wri_3_1', title: 'Complete Full 80,000-Word Non-Fiction Book Manuscript', desc: 'Craft a profound, cohesive volume that challenges conventional wisdom and illuminates truth.', craftXP: 85, discXP: 35, coins: 60, completed: false },
        { id: 'wri_3_2', title: 'Secure Acclaimed Literary Agent & Publisher Offer', desc: 'Partner with a premier publishing house to bring your book to readers worldwide.', craftXP: 75, discXP: 30, coins: 50, completed: false }
      ]
    },
    {
      tierId: 4,
      tierName: 'Published Book & Cultural Legacy',
      subtitle: 'International distribution, bestselling influence & family pride',
      milestones: [
        { id: 'wri_4_1', title: 'Hold First Hardcover Edition of Your Published Book', desc: 'Release work that enters libraries, bookstores, and inspires readers across continents.', craftXP: 160, discXP: 50, coins: 110, completed: false },
        { id: 'wri_4_2', title: 'Dedicate Published Book to Parents & Loved Ones', desc: 'Honor the people whose quiet love and faith made the written word possible.', craftXP: 100, discXP: 40, coins: 85, completed: false }
      ]
    }
  ]
};

// Specialized Daily Mission Sets tailored to specific career paths
const CAREER_ROUTINES = {
  'Student & Academic Learner': [
    { id: 'q_wake', title: 'Rise with sunlight & hydrate (07:00 AM)', time: '07:00 AM', pillar: 'Resilience', xp: 15, coins: 10, note: 'Signal wakefulness and hydrate neural pathways.', completed: false },
    { id: 'q_anki', title: 'Active Recall & Spaced Repetition (45 mins)', time: '08:30 AM', pillar: 'Craft', xp: 35, coins: 20, note: 'Strengthen memory consolidation before cognitive fatigue sets in.', completed: false },
    { id: 'q_lecture', title: 'Deep Study Sprint: Problem Set Mastery', time: '10:00 AM', pillar: 'Craft', xp: 45, coins: 30, note: 'Solve challenging syllabus problems with zero phone interruptions.', completed: false },
    { id: 'q_lunch', title: 'Nutritious lunch & outdoor campus stroll', time: '01:00 PM', pillar: 'Resilience', xp: 10, coins: 5, note: 'Wholesome fuel and daylight for circadian reset.', completed: false },
    { id: 'q_notes', title: 'Cornell Note Synthesis & Lecture Review', time: '02:30 PM', pillar: 'Discipline', xp: 25, coins: 15, note: 'Distill lecture concepts into concise summaries and question prompts.', completed: false },
    { id: 'q_feynman', title: 'Feynman Technique: Explain 1 Concept Simply', time: '04:30 PM', pillar: 'Craft', xp: 30, coins: 20, note: 'Teach a complex topic to an imaginary peer in simple, plain language.', completed: false },
    { id: 'q_exercise', title: 'Physical workout or outdoor sport (05:30 PM)', time: '05:30 PM', pillar: 'Resilience', xp: 40, coins: 25, note: 'Elevate BDNF (Brain-Derived Neurotrophic Factor) for neuroplasticity.', completed: false },
    { id: 'q_plan_study', title: 'Review exam roadmap & organize tomorrow', time: '08:30 PM', pillar: 'Discipline', xp: 20, coins: 15, note: 'Set tomorrow’s 3 study priorities so you wake up ready to execute.', completed: false },
    { id: 'q_mom', title: 'Call parents / check in with family', time: 'Flexible', pillar: 'LovedOnes', xp: 25, coins: 20, note: 'Emotional connection and appreciation with loved ones.', completed: false },
    { id: 'q_sleep', title: 'Sleep by 11:00 PM (8 hours rest)', time: '11:00 PM', pillar: 'Discipline', xp: 20, coins: 15, note: 'Crucial for synaptic pruning and memory consolidation.', completed: false }
  ],
  'Software Engineer & Full-Stack Developer': [
    { id: 'q_wake', title: 'Rise & drink glass of water (07:00 AM)', time: '07:00 AM', pillar: 'Resilience', xp: 15, coins: 10, note: 'Clean start, hydrate cells, morning sunlight.', completed: false },
    { id: 'q_algo', title: 'Algorithmic Problem Solving / LeetCode Sprint', time: '08:30 AM', pillar: 'Craft', xp: 35, coins: 25, note: '1 medium problem: master space-time complexity analysis.', completed: false },
    { id: 'q_deepcode', title: 'Deep Code Architecture & Feature Building', time: '10:00 AM', pillar: 'Craft', xp: 50, coins: 35, note: '90-min uninterrupted flow on core API / frontend service.', completed: false },
    { id: 'q_lunch', title: 'Mindful lunch & 15-min screen rest', time: '01:00 PM', pillar: 'Resilience', xp: 10, coins: 5, note: 'Rest ocular muscles and recharge dopamine baseline.', completed: false },
    { id: 'q_pr_review', title: 'Clean Git Commits, PR Review & Documentation', time: '02:30 PM', pillar: 'Discipline', xp: 25, coins: 15, note: 'Modular diffs, thorough unit tests, readable commit messages.', completed: false },
    { id: 'q_techradar', title: 'System Design & High-Availability Architecture', time: '04:30 PM', pillar: 'Craft', xp: 35, coins: 20, note: 'Study caching layers, Redis, distributed queues, or DB indexing.', completed: false },
    { id: 'q_gym', title: 'Heavy gym session / resistance training (05:30 PM)', time: '05:30 PM', pillar: 'Resilience', xp: 40, coins: 25, note: 'Counteract desk posture with deadlifts, pulls, and conditioning.', completed: false },
    { id: 'q_retrospective', title: 'Evening Wrap-up & Tomorrow’s Code Objectives', time: '08:30 PM', pillar: 'Discipline', xp: 20, coins: 15, note: 'Clear terminal, commit working WIP, list 2 priority tasks.', completed: false },
    { id: 'q_mom', title: 'Call Mom or connect with partner/friend', time: 'Flexible', pillar: 'LovedOnes', xp: 25, coins: 20, note: 'Undivided presence without phone distractions.', completed: false },
    { id: 'q_sleep', title: 'Sleep by 11:00 PM for deep recovery', time: '11:00 PM', pillar: 'Discipline', xp: 20, coins: 15, note: 'Neural recovery for sharp next-day analytical thinking.', completed: false }
  ],
  'Doctor & Healthcare Practitioner': [
    { id: 'q_wake', title: 'Rise & morning hydration (06:30 AM)', time: '06:30 AM', pillar: 'Resilience', xp: 15, coins: 10, note: 'Early morning physiological awakening.', completed: false },
    { id: 'q_diagnostic', title: 'Clinical Case Study & Diagnostic Synthesis', time: '08:00 AM', pillar: 'Craft', xp: 40, coins: 25, note: 'Review differential diagnoses and patient pathology reports.', completed: false },
    { id: 'q_bedside', title: 'Compassionate Patient Presence & Bedside Empathy', time: '10:30 AM', pillar: 'LovedOnes', xp: 35, coins: 25, note: 'Listen intently to patient concerns and build reassurance.', completed: false },
    { id: 'q_pharma', title: 'Pharmacology Refresher & Drug Interaction Check', time: '02:00 PM', pillar: 'Discipline', xp: 30, coins: 20, note: 'Refresh therapeutic mechanisms and safety dosages.', completed: false },
    { id: 'q_journal_read', title: 'Medical Literature Review (NEJM / Lancet)', time: '04:30 PM', pillar: 'Craft', xp: 30, coins: 20, note: 'Stay ahead of cutting-edge clinical trials and therapeutics.', completed: false },
    { id: 'q_gym', title: 'Brisk cardio or functional mobility (06:00 PM)', time: '06:00 PM', pillar: 'Resilience', xp: 35, coins: 25, note: 'Shed mental hospital stress through physical movement.', completed: false },
    { id: 'q_decompression', title: 'Compassion Fatigue Reset & Mindfulness', time: '08:30 PM', pillar: 'Calm', xp: 25, coins: 20, note: 'Release patient grief and clear emotional load.', completed: false },
    { id: 'q_mom', title: 'Family dinner or quiet phone call with parents', time: 'Flexible', pillar: 'LovedOnes', xp: 25, coins: 20, note: 'Anchor personal life outside the hospital wards.', completed: false },
    { id: 'q_sleep', title: 'Sleep by 10:30 PM (essential recovery)', time: '10:30 PM', pillar: 'Discipline', xp: 20, coins: 15, note: 'Recharge diagnostic acuity and cognitive resilience.', completed: false }
  ],
  'Entrepreneur & Startup Founder': [
    { id: 'q_wake', title: 'Rise early & cold shower (06:30 AM)', time: '06:30 AM', pillar: 'Resilience', xp: 15, coins: 10, note: 'Mental toughness and instant alert state.', completed: false },
    { id: 'q_customer', title: 'Founder Focus: 3 Customer Discovery Calls', time: '08:30 AM', pillar: 'Craft', xp: 45, coins: 30, note: 'Talk directly to active users to understand pain points.', completed: false },
    { id: 'q_product', title: 'Product Velocity: Ship 1 Meaningful Iteration', time: '11:00 AM', pillar: 'Craft', xp: 50, coins: 35, note: 'Deploy a high-leverage feature or conversion optimization.', completed: false },
    { id: 'q_cashflow', title: 'Unit Economics & Runway Metric Audit', time: '02:30 PM', pillar: 'Discipline', xp: 30, coins: 20, note: 'Review CAC, LTV, churn rate, and monthly burn rate.', completed: false },
    { id: 'q_distribution', title: 'Distribution Sprint: Content & Outbound Loops', time: '04:30 PM', pillar: 'Craft', xp: 35, coins: 25, note: 'Write a high-value thread, newsletter, or enterprise outreach.', completed: false },
    { id: 'q_gym', title: 'High-intensity workout to release cortisol', time: '06:00 PM', pillar: 'Resilience', xp: 40, coins: 25, note: 'Build stamina to endure founder pressure.', completed: false },
    { id: 'q_founder_reflect', title: 'Strategic Reflection & Tomorrow’s 3 Levers', time: '08:30 PM', pillar: 'Discipline', xp: 20, coins: 15, note: 'Eliminate fake work and double down on true leverage.', completed: false },
    { id: 'q_mom', title: 'Unplugged evening with family / loved ones', time: 'Flexible', pillar: 'LovedOnes', xp: 25, coins: 20, note: 'Protect personal relationships through startup intensity.', completed: false },
    { id: 'q_sleep', title: 'Sleep by 11:00 PM with phone outside bedroom', time: '11:00 PM', pillar: 'Discipline', xp: 20, coins: 15, note: 'Preserve vision and strategic clarity.', completed: false }
  ],
  'UI/UX & Product Designer': [
    { id: 'q_wake', title: 'Rise, hydrate & morning light (07:00 AM)', time: '07:00 AM', pillar: 'Resilience', xp: 15, coins: 10, note: 'Fresh sensory alertness for visual work.', completed: false },
    { id: 'q_mobbin', title: 'Visual Design Study: Deconstruct 3 World-Class Apps', time: '08:30 AM', pillar: 'Craft', xp: 30, coins: 20, note: 'Analyze layout hierarchy, typography contrast, and microcopy.', completed: false },
    { id: 'q_figma_system', title: 'Figma Design System & Auto-Layout Sprint', time: '10:30 AM', pillar: 'Craft', xp: 45, coins: 30, note: 'Build clean responsive component variants and token libraries.', completed: false },
    { id: 'q_usability', title: 'User Testing Insights & Flow Prototyping', time: '02:30 PM', pillar: 'Craft', xp: 35, coins: 25, note: 'Map friction points and refine navigation pathways.', completed: false },
    { id: 'q_interaction', title: 'Micro-Interactions, Spring Curves & Visual Polish', time: '04:30 PM', pillar: 'Joy', xp: 30, coins: 20, note: 'Add subtle haptic delight and fluid motion animations.', completed: false },
    { id: 'q_gym', title: 'Evening walk or gym workout (06:00 PM)', time: '06:00 PM', pillar: 'Resilience', xp: 35, coins: 20, note: 'Refresh physical stamina and step away from canvas.', completed: false },
    { id: 'q_design_archive', title: 'Curate Design Artifacts & Document Decisions', time: '08:30 PM', pillar: 'Discipline', xp: 20, coins: 15, note: 'Archive design iterations for portfolio storytelling.', completed: false },
    { id: 'q_mom', title: 'Connect with loved ones / shared dinner', time: 'Flexible', pillar: 'LovedOnes', xp: 25, coins: 20, note: 'Cultivate empathy that informs human-centric design.', completed: false },
    { id: 'q_sleep', title: 'Sleep by 11:00 PM (visual rest)', time: '11:00 PM', pillar: 'Discipline', xp: 20, coins: 15, note: 'Rest eyes and mind for creative synthesis.', completed: false }
  ]
};

const PARALYSIS_MICRO_QUESTS = [
  {
    id: 'micro_blinds',
    title: 'Open the blinds and let natural sunlight in',
    duration: '30 sec',
    pillar: 'Calm',
    icon: '🪟',
    xp: 10,
    coins: 5,
    note: 'Let natural photons reset cortisol and signal wakefulness to your circadian rhythm.'
  },
  {
    id: 'micro_water',
    title: 'Drink a tall glass of cold water right now',
    duration: '1 min',
    pillar: 'Resilience',
    icon: '💧',
    xp: 10,
    coins: 5,
    note: 'Hydrate neural synapses and immediately break physical inertia.'
  },
  {
    id: 'micro_workspace',
    title: 'Open your workspace and write just one line of code or notes',
    duration: '2 min',
    pillar: 'Craft',
    icon: '💻',
    xp: 10,
    coins: 5,
    note: 'Lower activation energy to absolute zero. A single line dissolves task dread.'
  }
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
  // Helper to retrieve or procedurally generate 4-tier tree for any career track
  getTreeForCareer(trackName) {
    if (CAREER_TREE_PRESETS[trackName]) {
      return JSON.parse(JSON.stringify(CAREER_TREE_PRESETS[trackName]));
    }
    // Check key aliases
    if (trackName.includes('Software') || trackName.includes('Full-Stack')) {
      return JSON.parse(JSON.stringify(CAREER_TREE_PRESETS['Software Engineer & Full-Stack Developer']));
    }
    if (trackName.includes('Student') || trackName.includes('Academic')) {
      return JSON.parse(JSON.stringify(CAREER_TREE_PRESETS['Student & Academic Learner']));
    }
    if (trackName.includes('Doctor') || trackName.includes('Healthcare')) {
      return JSON.parse(JSON.stringify(CAREER_TREE_PRESETS['Doctor & Healthcare Practitioner']));
    }
    if (trackName.includes('Entrepreneur') || trackName.includes('Founder')) {
      return JSON.parse(JSON.stringify(CAREER_TREE_PRESETS['Entrepreneur & Startup Founder']));
    }
    if (trackName.includes('Designer') || trackName.includes('UI/UX')) {
      return JSON.parse(JSON.stringify(CAREER_TREE_PRESETS['UI/UX & Product Designer']));
    }
    if (trackName.includes('Athlete') || trackName.includes('Fitness')) {
      return JSON.parse(JSON.stringify(CAREER_TREE_PRESETS['Athlete, Coach & Fitness Specialist']));
    }
    if (trackName.includes('Writer') || trackName.includes('Author') || trackName.includes('Journalist')) {
      return JSON.parse(JSON.stringify(CAREER_TREE_PRESETS['Writer, Journalist & Author']));
    }

    // Procedurally generate tailored 4 tiers for any domain in the 24 taxonomy
    return this.generateCareerTreeForTrack(trackName);
  }

  generateCareerTreeForTrack(trackName) {
    const clean = trackName || 'Domain Mastery';
    const slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 15);
    return [
      {
        tierId: 1,
        tierName: 'Foundations & Core Practice',
        subtitle: `Essential mechanics, domain literacy & daily discipline in ${clean}`,
        milestones: [
          { id: `${slug}_t1_m1`, title: `Master Core Foundations of ${clean}`, desc: `Study primary literature, historical principles, and build baseline technical competence.`, craftXP: 40, discXP: 20, coins: 25, completed: true },
          { id: `${slug}_t1_m2`, title: `Establish Unbroken 30-Day Craft Ritual`, desc: `Practice daily deliberate execution in ${clean} without relying on fleeting motivation.`, craftXP: 35, discXP: 20, coins: 20, completed: false }
        ]
      },
      {
        tierId: 2,
        tierName: 'Execution & Practical Portfolio',
        subtitle: `Building observable artifacts, high-leverage projects & testing feedback`,
        milestones: [
          { id: `${slug}_t2_m1`, title: `Ship 2 Signature Projects in ${clean}`, desc: `Produce high-quality work validated by real peers and industry mentors.`, craftXP: 65, discXP: 25, coins: 40, completed: false },
          { id: `${slug}_t2_m2`, title: `Master Workflow Speed & Ergonomic Efficiency`, desc: `Optimize tools, eliminate operational drag, and elevate speed of execution.`, craftXP: 50, discXP: 20, coins: 30, completed: false }
        ]
      },
      {
        tierId: 3,
        tierName: 'Industry Mastery & Leadership',
        subtitle: `Advanced problem solving, public influence & mentoring junior peers`,
        milestones: [
          { id: `${slug}_t3_m1`, title: `Lead Major High-Impact Initiative`, desc: `Direct and deliver complex projects that move tangible outcomes in ${clean}.`, craftXP: 85, discXP: 35, coins: 55, completed: false },
          { id: `${slug}_t3_m2`, title: `Peer Recognition & Thought Leadership`, desc: `Share hard-won insights through public writing, talks, or open source frameworks.`, craftXP: 70, discXP: 30, coins: 45, completed: false }
        ]
      },
      {
        tierId: 4,
        tierName: 'Pinnacle Mastery & Sovereign Legacy',
        subtitle: `Industry pinnacle offer/sovereignty, deep personal peace & family security`,
        milestones: [
          { id: `${slug}_t4_m1`, title: `Attain Pinnacle Milestone in ${clean}`, desc: `Secure the dream appointment, founding sovereign freedom, or prestigious fellowship.`, craftXP: 160, discXP: 50, coins: 110, completed: false },
          { id: `${slug}_t4_m2`, title: `Share Fruits of Success with Loved Ones`, desc: `Honor parents and family who supported the long journey to true mastery.`, craftXP: 100, discXP: 40, coins: 85, completed: false }
        ]
      }
    ];
  }

  // Helper to retrieve or generate tailored daily routine for any career track
  getRoutineForCareer(trackName) {
    if (CAREER_ROUTINES[trackName]) {
      return JSON.parse(JSON.stringify(CAREER_ROUTINES[trackName]));
    }
    // Check aliases
    if (trackName.includes('Student') || trackName.includes('Academic')) {
      return JSON.parse(JSON.stringify(CAREER_ROUTINES['Student & Academic Learner']));
    }
    if (trackName.includes('Software') || trackName.includes('Full-Stack')) {
      return JSON.parse(JSON.stringify(CAREER_ROUTINES['Software Engineer & Full-Stack Developer']));
    }
    if (trackName.includes('Doctor') || trackName.includes('Healthcare')) {
      return JSON.parse(JSON.stringify(CAREER_ROUTINES['Doctor & Healthcare Practitioner']));
    }
    if (trackName.includes('Entrepreneur') || trackName.includes('Founder')) {
      return JSON.parse(JSON.stringify(CAREER_ROUTINES['Entrepreneur & Startup Founder']));
    }
    if (trackName.includes('Designer') || trackName.includes('UI/UX')) {
      return JSON.parse(JSON.stringify(CAREER_ROUTINES['UI/UX & Product Designer']));
    }

    // Procedural tailored daily routine for any domain
    const clean = trackName || 'Craft Mastery';
    return [
      { id: 'q_wake', title: 'Rise & morning hydration (07:00 AM)', time: '07:00 AM', pillar: 'Resilience', xp: 15, coins: 10, note: 'Baseline physical activation and hydration.', completed: false },
      { id: 'q_core_study', title: `Deep Study & Theoretical Foundations in ${clean}`, time: '08:30 AM', pillar: 'Craft', xp: 35, coins: 25, note: 'High-cognitive study of fundamental principles.', completed: false },
      { id: 'q_deep_craft', title: `Core Execution & Project Sprint: ${clean}`, time: '10:30 AM', pillar: 'Craft', xp: 50, coins: 35, note: 'Uninterrupted deep work producing tangible output.', completed: false },
      { id: 'q_lunch', title: 'Mindful lunch & outdoor walk (01:00 PM)', time: '01:00 PM', pillar: 'Resilience', xp: 10, coins: 5, note: 'Wholesome fuel and mental decompression.', completed: false },
      { id: 'q_skill_drill', title: `Technical Skill Drill & Review: ${clean}`, time: '02:30 PM', pillar: 'Discipline', xp: 30, coins: 20, note: 'Deliberate practice isolating weak areas.', completed: false },
      { id: 'q_portfolio', title: `Portfolio Synthesis & Artifact Documentation`, time: '04:30 PM', pillar: 'Craft', xp: 30, coins: 20, note: 'Log key milestones and archive progress.', completed: false },
      { id: 'q_exercise', title: 'Physical exercise & stamina conditioning (05:30 PM)', time: '05:30 PM', pillar: 'Resilience', xp: 40, coins: 25, note: 'Resistance training and cardiovascular endurance.', completed: false },
      { id: 'q_review', title: 'Evening Progress Review & Tomorrow’s Plan', time: '08:30 PM', pillar: 'Discipline', xp: 20, coins: 15, note: 'Set top priorities for the next morning.', completed: false },
      { id: 'q_mom', title: 'Call parents or connect with partner/friend', time: 'Flexible', pillar: 'LovedOnes', xp: 25, coins: 20, note: 'Relational connection and genuine gratitude.', completed: false },
      { id: 'q_sleep', title: 'Restorative sleep by 11:00 PM', time: '11:00 PM', pillar: 'Discipline', xp: 20, coins: 15, note: 'Essential recovery for high-leverage execution.', completed: false }
    ];
  }

  // Upgraded Career Switcher: dynamically updates tree, routine, and north star
  setCareerTrack(trackName) {
    if (!trackName) return;
    this.state.careerTrack = trackName;
    this.state.dreamCareer = trackName;
    this.state.careerTree = this.getTreeForCareer(trackName);
    this.state.quests = this.getRoutineForCareer(trackName);

    const trackDef = CAREER_TRACKS.find(t => t.name === trackName);
    if (trackDef && trackDef.defaultGoal) {
      this.state.lifeGoal = trackDef.defaultGoal;
    }

    this.saveState();
    this.notify();
  }

  // Equip active UI theme palette (Matrix, Synthwave, Amber, Arctic, Crimson, Minimal)
  equipPalette(paletteKey) {
    const pal = paletteKey || 'default';
    this.state.activePalette = pal;

    // Immediately apply or remove data-palette from document
    if (pal && pal !== 'default') {
      document.documentElement.setAttribute('data-palette', pal);
      if (document.body) document.body.setAttribute('data-palette', pal);
    } else {
      document.documentElement.removeAttribute('data-palette');
      if (document.body) document.body.removeAttribute('data-palette');
    }

    // Persist directly into mirror_users in localStorage
    try {
      const activeUser = localStorage.getItem('mirror_active_session');
      if (activeUser) {
        const users = JSON.parse(localStorage.getItem('mirror_users') || '{}');
        if (users[activeUser]) {
          users[activeUser].activePalette = pal;
          if (users[activeUser].userData) {
            users[activeUser].userData.activePalette = pal;
          }
          localStorage.setItem('mirror_users', JSON.stringify(users));
        }
      }
    } catch (e) {
      console.warn('[Storage Error]', e);
    }

    this.saveState();
    this.notify();
  }

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
        themeMode: 'dark',
        activePalette: user.userData.activePalette || user.activePalette || 'default',
        quests: (user.userData.quests && user.userData.quests.length > 0) 
          ? user.userData.quests 
          : this.getRoutineForCareer(uTrack),
        relationshipBonds: enrichBonds(user.userData.relationshipBonds),
        inventory: Array.isArray(user.userData.inventory) ? user.userData.inventory : (user.inventory || []),
        honorableArchive: Array.isArray(user.userData.honorableArchive) ? user.userData.honorableArchive : [],
        completedMicroQuests: Array.isArray(user.userData.completedMicroQuests) ? user.userData.completedMicroQuests : [],
        restDaysTaken: user.userData.restDaysTaken || 0,
        stayTheCourseCount: user.userData.stayTheCourseCount || 0,
        totalWisdomXP: user.userData.totalWisdomXP || 0
      };
    }

    // Default clean state (guest / unauthenticated vs fresh user)
    if (!user) {
      return {
        isAuthenticated: false,
        username: 'guest',
        fullName: 'New Adventurer',
        totalXP: 0,
        currency: 20,
        streak: 1,
        themeMode: 'dark',
        activePalette: 'default',
        soundEnabled: true,
        currentProfession: 'Student & Academic Learner',
        dreamCareer: 'Software Engineer & Full-Stack Developer',
        careerTrack: 'Software Engineer & Builder',
        careerTree: JSON.parse(JSON.stringify(fallbackTree)),
        lifeGoal: 'Master full-stack engineering, ship real tools, and cultivate calm presence.',
        relationshipBonds: JSON.parse(JSON.stringify(DEFAULT_RELATIONSHIP_BONDS)),
        skipRelationships: false,
        quests: this.getRoutineForCareer(defaultTrack),
        inventory: [],
        honorableArchive: [],
        completedMicroQuests: [],
        restDaysTaken: 0,
        stayTheCourseCount: 0,
        totalWisdomXP: 0,
        history: []
      };
    }

    return {
      isAuthenticated: true,
      username: user.username,
      fullName: user.fullName || user.username,
      dob: user.dob || '',
      photoUrl: user.photoUrl || '',
      currentProfession: user.currentProfession || 'Student & Academic Learner',
      dreamCareer: user.dreamCareer || user.careerTrack || 'Software Engineer & Full-Stack Developer',
      careerTrack: user.careerTrack || 'Software Engineer & Builder',
      careerTree: JSON.parse(JSON.stringify(fallbackTree)),
      lifeGoal: user.lifeGoal || 'Master full-stack engineering, ship real tools, and cultivate calm presence.',
      relationshipBonds: (user.relationshipBonds && user.relationshipBonds.length > 0) ? enrichBonds(user.relationshipBonds) : enrichBonds(DEFAULT_RELATIONSHIP_BONDS),
      skipRelationships: !!user.skipRelationships,
      quests: this.getRoutineForCareer(defaultTrack),
      inventory: user.inventory || [],
      totalXP: 0,
      currency: 20,
      streak: 1,
      themeMode: 'dark',
      activePalette: user.activePalette || 'default',
      soundEnabled: true,
      honorableArchive: [],
      completedMicroQuests: [],
      restDaysTaken: 0,
      stayTheCourseCount: 0,
      totalWisdomXP: 0,
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

    // Points from completed micro-quests (Paralysis Breaker)
    if (this.state.completedMicroQuests && Array.isArray(this.state.completedMicroQuests)) {
      this.state.completedMicroQuests.forEach(m => {
        if (points.hasOwnProperty(m.pillar)) {
          points[m.pillar] += (m.xp || 10);
        }
      });
    }

    // Points from Earned Rest Days & Crossroads decisions
    if (this.state.restDaysTaken) {
      points.Calm += (this.state.restDaysTaken * 15);
    }
    if (this.state.stayTheCourseCount) {
      points.Discipline += (this.state.stayTheCourseCount * 30);
    }
    if (this.state.totalWisdomXP) {
      points.Craft += Math.round(this.state.totalWisdomXP * 0.5);
      points.Calm += Math.round(this.state.totalWisdomXP * 0.5);
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
    const earnedXP = micro.xp || 10;
    const earnedCoins = micro.coins || 5;

    this.state.totalXP = (this.state.totalXP || 0) + earnedXP;
    this.state.currency = (this.state.currency || 0) + earnedCoins;

    if (!Array.isArray(this.state.completedMicroQuests)) {
      this.state.completedMicroQuests = [];
    }
    this.state.completedMicroQuests.push({
      id: micro.id,
      title: micro.title,
      pillar: micro.pillar,
      xp: earnedXP,
      completedAt: new Date().toISOString()
    });

    const newLevel = this.getLevel();
    const didLevelUp = newLevel > oldLevel;
    if (didLevelUp) {
      this.state.currency += 20;
    }

    this.saveState();
    this.notify();

    return {
      quest: micro,
      isCompleted: true,
      completed: true,
      xpGained: earnedXP,
      coinsGained: earnedCoins,
      oldLevel,
      newLevel,
      careerTrack: this.state.careerTrack,
      didLevelUp,
      leveledUp: didLevelUp
    };
  }

  // The Crossroads — Stage 1: Take an Earned Rest Day
  takeEarnedRestDay(reason = 'Honoring physiological limits and resetting nervous system.') {
    const oldLevel = this.getLevel();
    const earnedXP = 15;
    this.state.totalXP = (this.state.totalXP || 0) + earnedXP;
    this.state.restDaysTaken = (this.state.restDaysTaken || 0) + 1;

    if (!Array.isArray(this.state.history)) {
      this.state.history = [];
    }
    this.state.history.unshift({
      id: `rest_${Date.now()}`,
      type: 'earned_rest_day',
      title: 'Earned Rest Day Taken',
      desc: reason,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      xp: earnedXP
    });

    const newLevel = this.getLevel();
    const didLevelUp = newLevel > oldLevel;
    if (didLevelUp) {
      this.state.currency += 20;
    }

    this.saveState();
    this.notify();

    return {
      earnedXP,
      restDaysTaken: this.state.restDaysTaken,
      oldLevel,
      newLevel,
      didLevelUp,
      leveledUp: didLevelUp
    };
  }

  // The Crossroads — Stage 3 Option A: Stay the Course
  stayTheCourseCrossroads(commitmentNote = 'Friction is neuroplasticity. Pushing for the 6-week consistency breakthrough.') {
    const oldLevel = this.getLevel();
    const earnedXP = 30;
    const earnedCoins = 15;
    this.state.totalXP = (this.state.totalXP || 0) + earnedXP;
    this.state.currency = (this.state.currency || 0) + earnedCoins;
    this.state.stayTheCourseCount = (this.state.stayTheCourseCount || 0) + 1;

    if (!Array.isArray(this.state.history)) {
      this.state.history = [];
    }
    this.state.history.unshift({
      id: `stay_${Date.now()}`,
      type: 'crossroads_stay',
      title: `Renewed Commitment: ${this.state.careerTrack}`,
      desc: commitmentNote,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      xp: earnedXP
    });

    const newLevel = this.getLevel();
    const didLevelUp = newLevel > oldLevel;
    if (didLevelUp) {
      this.state.currency += 20;
    }

    this.saveState();
    this.notify();

    return {
      earnedXP,
      earnedCoins,
      oldLevel,
      newLevel,
      didLevelUp,
      leveledUp: didLevelUp
    };
  }

  // The Crossroads — Stage 3 Option B: Pivot with Honor & Convert to Wisdom XP
  resolveCrossroadsPivot(newTrackName, reflectionNote) {
    if (!newTrackName) return null;
    const oldLevel = this.getLevel();

    // Calculate completed milestones from current tree to honor past effort
    let completedCount = 0;
    if (this.state.careerTree && Array.isArray(this.state.careerTree)) {
      this.state.careerTree.forEach(tier => {
        (tier.milestones || []).forEach(m => {
          if (m.completed) completedCount++;
        });
      });
    }

    // Convert past effort into permanent Wisdom & Self-Awareness XP
    const wisdomXP = 50 + (completedCount * 25);
    this.state.totalXP = (this.state.totalXP || 0) + wisdomXP;
    this.state.totalWisdomXP = (this.state.totalWisdomXP || 0) + wisdomXP;

    if (!Array.isArray(this.state.honorableArchive)) {
      this.state.honorableArchive = [];
    }

    const archivedEntry = {
      id: `arch_${Date.now()}`,
      previousTrack: this.state.careerTrack,
      newTrack: newTrackName,
      milestonesCompleted: completedCount,
      wisdomXPAwarded: wisdomXP,
      note: reflectionNote || 'Pivoted with intention and zero shame. All past effort converted to self-awareness.',
      archivedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    this.state.honorableArchive.unshift(archivedEntry);

    // Switch career track and load clean progression tree
    const validTrack = CAREER_TREE_PRESETS[newTrackName] ? newTrackName : 'Software Engineer & Builder';
    this.state.careerTrack = validTrack;
    this.state.careerTree = JSON.parse(JSON.stringify(CAREER_TREE_PRESETS[validTrack]));

    const newLevel = this.getLevel();
    const didLevelUp = newLevel > oldLevel;
    if (didLevelUp) {
      this.state.currency += 20;
    }

    this.saveState();
    this.notify();

    return {
      archivedEntry,
      wisdomXP,
      oldLevel,
      newLevel,
      didLevelUp,
      leveledUp: didLevelUp
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
  addCustomBond(name, role, dynamic, initialTrust = 75, status = 'Warm', icon = '🤝') {
    const newBond = {
      id: `bond_${Date.now()}`,
      name: name.trim(),
      role: role.trim() || 'Companion',
      icon: icon || '🤝',
      status: status || 'Warm',
      statusBadge: status || 'Warm',
      statusColor: status === 'Warm' ? '#10B981' : (status === 'Distant' ? '#F43F5E' : '#F59E0B'),
      dynamic: dynamic.trim() || 'Values mutual care, trust, and shared flourishing.',
      trust: parseInt(initialTrust, 10) || 75,
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
    this.state.skipRelationships = false;
    this.saveState();
    this.notify();
    return newBond;
  }

  // Theme mode is locked to pure Raycast Midnight Obsidian dark mode
  setThemeMode(mode) {
    this.state.themeMode = 'dark';
    this.saveState();
    this.notify();
  }

  toggleThemeMode() {
    return 'dark';
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



  // Update Profile Customization
  updateProfile(profileData) {
    if (!this.state) this.state = this.getInitialState();

    if (profileData.fullName) this.state.fullName = profileData.fullName;
    if (profileData.photoUrl !== undefined) this.state.photoUrl = profileData.photoUrl;
    if (profileData.dob) this.state.dob = profileData.dob;
    if (profileData.age) this.state.age = profileData.age;
    if (profileData.currentProfession) this.state.currentProfession = profileData.currentProfession;
    if (profileData.dreamCareer) {
      this.state.dreamCareer = profileData.dreamCareer;
      this.state.careerTrack = profileData.dreamCareer;
      this.state.careerTree = this.getTreeForCareer(profileData.dreamCareer);
      this.state.quests = this.getRoutineForCareer(profileData.dreamCareer);
      const trackDef = (CAREER_TRACKS || []).find(t => t.name === profileData.dreamCareer);
      if (trackDef && trackDef.defaultGoal && (!profileData.lifeGoal || profileData.lifeGoal === '')) {
        this.state.lifeGoal = trackDef.defaultGoal;
      }
    }
    if (profileData.lifeGoal) this.state.lifeGoal = profileData.lifeGoal;
    if (profileData.skipRelationships !== undefined) {
      this.state.skipRelationships = !!profileData.skipRelationships;
    }
    if (profileData.relationshipBonds) {
      this.state.relationshipBonds = profileData.relationshipBonds;
    }

    this.saveState();
    this.notify();
  }

  // Aliases for bulletproof controller compatibility
  toggleMilestone(milestoneId) {
    return this.toggleCareerMilestone(milestoneId);
  }

  resetDailyRoutine() {
    return this.resetRoutine();
  }

  switchCareerTrack(trackName) {
    if (typeof window !== 'undefined' && window.API && typeof window.API.selectCareer === 'function') {
      window.API.selectCareer(trackName, this.state.lifeGoal).catch(() => {});
    }
    return this.setCareerTrack(trackName);
  }

  logRelationshipInteraction(bondId, action, reflection) {
    if (window.API) window.API.logRelationship(bondId, action, reflection);
    return this.logBondInteraction(bondId, reflection, action);
  }

  setFilter(filterName) {
    this.filter = filterName;
    this.notify();
  }

  addXP(xpAmount, pillarName = 'Calm') {
    const oldLevel = this.getLevel();
    this.state.totalXP = (this.state.totalXP || 0) + xpAmount;
    const newLevel = this.getLevel();
    if (newLevel > oldLevel) {
      this.state.currency = (this.state.currency || 0) + 20;
    }
    this.saveState();
    this.notify();
    return { xpGained: xpAmount, oldLevel, newLevel, leveledUp: newLevel > oldLevel };
  }

  save() {
    this.saveState();
  }

  setThemeMode(mode) {
    this.state.themeMode = 'dark';
    try {
      localStorage.setItem('mirror_theme', 'dark');
    } catch (e) {}
    document.documentElement.setAttribute('data-theme', 'dark');
    if (document.body) document.body.setAttribute('data-theme', 'dark');
    this.saveState();
    this.notify();
  }

  toggleSound() {
    this.state.soundEnabled = !this.state.soundEnabled;
    this.saveState();
    this.notify();
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
