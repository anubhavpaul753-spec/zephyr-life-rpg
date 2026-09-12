# ⚔️ Life RPG - Level Up Your Life

<div align="center">

![Life RPG Banner](https://img.shields.io/badge/Tech%20Zephyr-Round%201%20Submission-6366f1?style=for-the-badge&logo=target&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active%20Development-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

<p align="center">
  <strong>Transform your mundane daily chores and habits into an epic virtual progression journey.</strong>
  <br />
  Gain XP, collect Gold, upgrade attributes, maintain streaks, and level up in real life!
</p>

[Live Demo (Coming Soon)](#-live-demo--deliverables) • [Features](#-core-systems--features) • [RPG Engine](#-rpg-progression-engine) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started-locally) • [Team](#-the-team)

</div>

---

## 🌟 Overview

Traditional habit trackers and to-do lists fail because they suffer from **delayed gratification** — going to the gym, studying algorithms, or reading books takes months to yield tangible results.

**Life RPG** bridges this psychological gap by introducing high-engagement video game feedback loops to daily life:
- ⚡ **Instant Gratification:** Complete a quest to immediately earn Experience Points (XP) and Gold.
- 📈 **Non-Linear Progression:** A mathematically tuned leveling curve where higher tiers demand greater commitment.
- 🧬 **RPG Attribute Growth:** Categorized tasks directly advance core character stats (**Strength**, **Intellect**, **Vitality**, **Charisma**).
- 🔥 **Streak Multipliers:** Maintain consecutive days of habit completion to unlock bonus rewards.
- 🏪 **Guild Economy:** Spend in-game currency on avatar badges, cosmetics, and self-reward unlocks.

---

## 🎯 Core Systems & Features

| System | Description |
| :--- | :--- |
| 🛡️ **User Auth & Multi-Tenancy** | Secure authentication ensuring every adventurer's quests, inventory, and stats are completely private and isolated. |
| 📜 **Quest Board (Task CRUD)** | Full management of daily habits, one-time quests, and boss challenges with difficulty tiers. |
| 📊 **Character Sheet & Attributes** | Dynamic visual stats reflecting real-world habits: <br>• **Intellect**: Coding, reading, study <br>• **Strength**: Fitness, sports, physical labor <br>• **Vitality**: Sleep, nutrition, hydration <br>• **Charisma**: Networking, socializing, community |
| 📈 **Non-Linear Leveling** | Exponential XP requirements per level to provide sustained long-term motivation. |
| 💎 **Guild Shop & Economy** | Virtual marketplace to purchase badges, customize interface themes, or redeem custom real-life rewards. |
| 📱 **Responsive & Accessible** | Designed for mobile and desktop screens with full keyboard navigation support (`Tab`, `Enter`, `Space`). |

---

## 📐 RPG Progression Engine

The progression system implements a progressive XP scaling curve to prevent stat inflation while rewarding continuous dedication:

$$\text{Required XP}(L) = 100 \times L^{1.5}$$

- **Level 1 → 2:** `100 XP`
- **Level 2 → 3:** `283 XP`
- **Level 3 → 4:** `520 XP`
- **Level 5 → 6:** `1,118 XP`

*Every quest completed awards XP and Gold scaled by its difficulty tier (Trivial, Easy, Medium, Hard, Epic).*

---

## 🚀 Live Demo & Deliverables

- 🌐 **Live Web Application:** *Deployment URL will be linked here upon final build.*
- 🎥 **Walkthrough Video:** *Strict 90–180s demonstration showing signup, task completion, stat leveling, and page refresh persistence (hosted under 100MB).*
- 📂 **GitHub Repository:** [https://github.com/anubhavpaul753-spec/zephyr-life-rpg](https://github.com/anubhavpaul753-spec/zephyr-life-rpg)

---

## 🛠️ Tech Stack

- **Frontend:** Next.js / React, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend & APIs:** Next.js Server Actions & REST API Endpoints
- **Database:** PostgreSQL (via Supabase) with Row-Level Security (RLS)
- **Authentication:** Supabase Auth / Session Management
- **Deployment:** Vercel

---

## ⚡ Getting Started Locally

### 1. Clone the Repository
```bash
git clone https://github.com/anubhavpaul753-spec/zephyr-life-rpg.git
cd zephyr-life-rpg
```

### 2. Configure Environment Variables
Copy the template file to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your database and auth credentials inside `.env.local`.

### 3. Install Dependencies
```bash
npm install
```

### 4. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```text
zephyr-life-rpg/
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore configuration
├── README.md             # Project documentation & overview
├── app/                  # Application routing & pages
│   ├── (auth)/           # Login & registration routes
│   ├── dashboard/        # Main adventurer quest board
│   ├── shop/             # Guild rewards & cosmetics
│   └── api/              # Secure backend API endpoints
├── components/           # UI and tactile gamified components
│   ├── character/        # XP bars, stats, avatar
│   ├── quests/           # Quest cards, creation modals
│   └── ui/               # Reusable buttons, badges, modals
├── lib/                  # Database clients & math helpers
└── types/                # TypeScript interface definitions
```

---

## 👥 The Team

- **Anubhav Paul** — [@anubhavpaul753-spec](https://github.com/anubhavpaul753-spec)
- **Arpita Sengupta** — [@senguptaarpita295-code](https://github.com/senguptaarpita295-code)

---

<div align="center">
  <sub>Built with passion for Tech Zephyr Web Hackathon 2026.</sub>
</div>
