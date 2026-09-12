# âš”ï¸ Life RPG - Level Up Your Life

> **Tech Zephyr Web Hackathon (Round 1) Project Submission**  
> A full-stack gamified productivity application that transforms mundane real-world tasks and daily habits into an engaging RPG progression system.

---

## ðŸŒŸ Overview

Traditional habit trackers and to-do lists suffer from the **"delayed gratification"** trapâ€”working out, reading books, or studying takes months to show noticeable results. **Life RPG** bridges this gap by introducing instant gratification mechanics from video games:
- **Instant dopamine loops**: Gain XP and collect Gold for completing Quests.
- **Dynamic Character Progression**: Non-linear leveling system where higher levels require progressively more effort.
- **Attributes System**: Tasks feed directly into core stats (**Strength**, **Intellect**, **Vitality**, **Charisma**).
- **Streak Multipliers**: Maintain consecutive active days to earn bonus rewards and XP multipliers.
- **In-Game Economy**: Spend earned currency in the Guild Shop on titles, cosmetics, and custom rewards.

---

## ðŸš€ Live Demo & Deliverables

- ðŸŒ **Live Deployed App**: *[Coming Soon - Deployed on Vercel]*
- ðŸŽ¥ **Illustration Video**: *[Coming Soon - 90-180s screen recording showing signup, quest completion, leveling, and database persistence]*
- ðŸ“‚ **GitHub Repository**: [https://github.com/anubhavpaul753-spec/zephyr-life-rpg](https://github.com/anubhavpaul753-spec/zephyr-life-rpg)

---

## ðŸ› ï¸ Tech Stack

- **Frontend**: Next.js 14 / React, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend & API**: Next.js Server Actions & REST API
- **Database & Auth**: PostgreSQL via Supabase (Row Level Security enabled for strict multi-tenant isolation)
- **Deployment**: Vercel

---

## ðŸ—ï¸ Architecture & Database Schema

The application enforces strict data security where authenticated users can only view and mutate their own records:
- `users`: Core profile, level, current XP, gold currency, active streak, and stat points.
- `quests / tasks`: User-defined tasks with difficulty tier, associated attribute category, deadline, and completion status.
- `quest_logs`: Historical audit log of completed quests and awarded XP.
- `inventory`: Badges, virtual gear, and themes purchased from the rewards shop.

---

## âš¡ Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/anubhavpaul753-spec/zephyr-life-rpg.git
cd zephyr-life-rpg
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your credentials:
```bash
cp .env.example .env.local
```

### 3. Install Dependencies
```bash
npm install
# or
pnpm install
# or
yarn install
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

---

## ðŸ‘¥ Team
- **Anubhav Paul** ([@anubhavpaul753-spec](https://github.com/anubhavpaul753-spec))
- **Arpita Sengupta** ([@senguptaarpita295-code](https://github.com/senguptaarpita295-code))
