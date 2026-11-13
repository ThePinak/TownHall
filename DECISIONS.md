# Architecture & Product Decision Record (`DECISIONS.md`)

**Project:** Private Pixel-Art Multiplayer Social World  
**Version:** 1.0  
**Status:** Approved Baseline  

This document is the single source of truth for all approved V1 product, architecture, and game design decisions. Do not alter these decisions without explicit project owner approval.

---

## 1. Approved Architecture Decision Records (ADRs)

| ADR | Decision | Approved Value | Enforcement & Implementation Notes |
| :--- | :--- | :--- | :--- |
| **ADR-01** | Voice proximity radius | **160 world pixels**, center-to-center Euclidean distance | At 32 px/tile, 160 px = 5 logical tiles. Server computes `dx*dx + dy*dy <= 160*160`. |
| **ADR-02** | Logical tile dimensions | **32 × 32 pixels** | Used consistently for map layout, collision grid, and coordinate math. |
| **ADR-03** | Concurrent sessions | **One active session per account**; newest session replaces previous session | Server-enforced via `account_sessions` generation tracking. Old Colyseus socket closed with code `4001` and voice access revoked immediately. |
| **ADR-04** | Focus Room voice | **Toggle-to-Talk**, disabled by default | Click to enable transmission; click again to disable. Does not bypass room or 160 px proximity rules. Leaving Focus Room resets/revokes transmission. |
| **ADR-05** | World ownership | **One active world per creator**, including grace-period worlds | Enforced in PostgreSQL via partial unique index `idx_one_active_world_per_owner` (`WHERE status IN ('active', 'empty_grace')`). |
| **ADR-06** | Voice authorization | **Server-enforced eligibility** and dynamic SFU subscription permissions | Colyseus/application server computes eligibility; LiveKit `RoomServiceClient.updateParticipant()` and `updateSubscriptions()` enforce publish/subscribe permissions. |
| **ADR-07** | Empty-world lifecycle | **PostgreSQL timestamps** with durable + lazy cleanup processing | `empty_since` and `delete_after` (10-minute grace) stored in UTC. Cleanup runs on schedule, on server boot, and lazily on world creation/join/lookup to survive free-tier server sleep. |

---

## 2. Approved Product & Game Design Decisions (V1)

| ID | Topic | Approved Decision | Notes |
| :--- | :--- | :--- | :--- |
| **DEC-01** | Map dimensions | **50 × 40 tiles** (1600 × 1280 world pixels) | Single continuous map housing Town Hall (center), Learning (north), Coding (west), Chill (east), Focus (south). |
| **DEC-02** | Corridor & doorway width | **4 tiles** (128 world pixels) | Prevents avatar bottlenecking and collision snagging between areas. |
| **DEC-03** | Character sprite size | **32 × 48 pixels** | Feet-based collision hitbox of **20 × 12 pixels** (offset `x: 6, y: 36`) for natural Y-depth overlap. |
| **DEC-04** | Initial avatar set | **4 predefined avatars** | Distinct silhouettes and palettes; idle and walk animations in 4 cardinal directions. Sitting deferred post-V1. |
| **DEC-05** | Movement speed | **140 pixels/second** | Delta-time-based constant speed; diagonal input normalized by `1 / Math.SQRT2`. |
| **DEC-06** | Nameplates & speaking UI | **Included in V1 (P0)** | Lightweight floating display name above avatar and visual speaking indicator while transmitting. |
| **DEC-07** | Reconnect spawn location | **Town Hall** | Reconnecting/rejoining users spawn at an unoccupied position in Town Hall's safe spawn region. |
| **DEC-08** | Focus Room reception | **Nearby users can hear opted-in speakers** | Within Focus Room, users within 160 px can hear another Focus Room user who has enabled Toggle-to-Talk. Cross-room audio remains strictly blocked. |
| **DEC-09** | Invitations & security | **Secure hashed tokens** with **revoke/regenerate** | Cryptographically random invite secrets; only `secret_hash` is persisted in PostgreSQL. Raw token/link is displayed once at creation/regeneration; creators can revoke and regenerate to invalidate prior invites. |
| **DEC-10** | World capacity | **1 to 20 concurrent users** per world | 20 is the strict server-enforced ceiling across all 5 areas combined, not a required minimum. |
| **DEC-11** | Town Hall voice mode | **Shared logical zone with 160 px proximity** | Town Hall is acoustically isolated from other rooms, and uses 160 px proximity inside the hall. |
| **DEC-12** | Server & DB boundary | **Single Node.js process** (`apps/game-server`) + server-only privileged DB writes | REST API, Colyseus WebSocket, LiveKit control, and cleanup run in one process for free-tier viability. No direct browser writes to `worlds`, `invitations`, or `account_sessions`. |

