# TownHall 🏛️

**TownHall** is a private, invite-only 2D pixel-art multiplayer social world built with Phaser 3, React, Colyseus, Supabase, and LiveKit.

---

## 🌟 Key Features

- **Continuous 5-Room World Map:**
  - **Town Hall / Community Hall:** Main spawn hub.
  - **Coding Room:** Technical discussion and collaboration.
  - **Learning Room:** Knowledge sharing and studying.
  - **Chill Room:** Casual social conversations.
  - **Focus Room:** Quiet work zone with Toggle-to-Talk.
- **Real-Time Multiplayer Presence:** Authoritative 20 Hz movement synchronization and collision detection powered by Colyseus (max 20 concurrent participants per world).
- **Acoustic Proximity Voice:**
  - Spatial volume attenuation within 160 px (5 tiles) based on Euclidean distance.
  - Strict room boundary isolation — no audio leakage across doorways.
  - Focus Room default audio mute with on-demand Toggle-to-Talk.
- **Room Occupants & Individual Mute:**
  - Real-time HUD showing who is present in your current room with active speaking indicators.
  - Individual per-player mute controls.
- **Private Worlds & Secure Authentication:**
  - Secure authentication and profile management via Supabase.
  - Cryptographic invitation links for private worlds.
  - Single active session per account enforcement and 10-minute empty world grace lifecycle.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS |
| **Game Engine** | Phaser 3 (Arcade Physics, Tilemaps) |
| **Multiplayer Server** | Node.js, Colyseus (WebSockets) |
| **Voice SFU** | LiveKit WebRTC Cloud |
| **Database & Auth** | PostgreSQL via Supabase Auth |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v20+)
- pnpm (`npm install -g pnpm`)

### 2. Installation
```bash
git clone https://github.com/ThePinak/TownHall.git
cd TownHall
pnpm install
```

### 3. Environment Setup
Copy `.env.example` to `.env` and fill in your Supabase and LiveKit credentials:
```bash
cp .env.example .env
```

### 4. Running Locally
Run the game server and frontend in separate terminals:

```bash
# Terminal 1: Game Server (port 2567)
cd apps/game-server
pnpm dev

# Terminal 2: Web Client (port 5173)
cd apps/web
pnpm dev
```

Visit `http://localhost:5173` to explore the world!

---

*A comprehensive documentation and deployment guide will be published upon final release.*

