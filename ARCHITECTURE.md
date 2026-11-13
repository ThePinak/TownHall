# Technical Architecture --- Private Pixel-Art Social World

**Document:** `ARCHITECTURE.md`\
**Version:** 1.0 --- Architecture baseline\
**Status:** Approved by review\
**Product:** Private, invite-only, browser-based 2D multiplayer social
world\
**Prepared for:** Project owner and Google Antigravity review

------------------------------------------------------------------------

## 1. Purpose

This document defines the approved technical architecture for V1 of the
application. It translates the approved product direction and
architecture decisions (`DECISIONS.md`) into a practical system design.

It answers:

-   What technologies are used?
-   What are the main application components?
-   How do users authenticate and join private worlds?
-   How are player movement and multiplayer state synchronized?
-   How does proximity voice work safely across rooms?
-   How do world creation, capacity, inactivity and deletion work?
-   How is the system tested and deployed with minimal cost?

**Note:** Implementation proceeds strictly milestone-by-milestone per `DEVELOPMENT_PLAN.md` and `AGENTS.md` after explicit owner authorization for each milestone.

## 2. Product Context and V1 Scope

The application is a desktop-first web experience in which registered
users can create private worlds or join a world using an invitation link
or code. Each world contains one connected, top-down 2D pixel-art map.

### 2.1 Map areas

The V1 map contains five connected areas:

1.  **Town Hall / Community Hall** --- central social hub and default
    spawn point.
2.  **Coding Room** --- programming discussions and technical
    collaboration.
3.  **Learning Room** --- study, teaching and knowledge sharing.
4.  **Chill Room** --- informal social conversation.
5.  **Focus Room** --- quiet work and study.

These are areas within one map, not separate game instances. Users can
walk between them through connected paths and entrances.

### 2.2 Core V1 capabilities

-   Account registration and login.
-   Create one private world per creator.
-   Join a private world through a valid invite link or room code.
-   One shared map instance per world.
-   Maximum of **20 connected users across the entire world**.
-   Predefined avatars.
-   WASD and arrow-key movement.
-   Walking and idle animations; sitting/basic interactions may be
    staged after core movement.
-   Collision with walls and designated objects.
-   Real-time multiplayer player presence and movement.
-   Proximity-based voice in permitted areas.
-   Mute/unmute controls.
-   Focus Room voice disabled by default and controlled by
    Toggle-to-Talk.
-   World remains available while at least one participant is present.
-   Empty world has a 10-minute grace period before deletion.
-   Desktop-first V1; mobile-specific controls are out of scope.

### 2.3 Explicitly out of scope for V1

Unless the owner later approves a change, do not design V1 around:

-   Public world discovery or public rooms.
-   Multiple maps or map instances within one world.
-   More than 20 users per world.
-   Advanced avatar customization or an avatar marketplace.
-   Text chat, messaging, feeds or social profiles beyond what is
    essential.
-   Screen sharing, video calls, recording or voice moderation tooling
    beyond basic mute controls.
-   Mobile-first controls.
-   Complex economy, inventory, quests or gamification.
-   Microservices, Kubernetes or a distributed event-streaming platform.

## 3. Approved Architecture Decision Records

The following decisions are binding for the V1 design. Any proposed
change must be called out explicitly and approved by the owner.

  -----------------------------------------------------------------------
  ADR                     Approved decision       Implementation
                                                  implication
  ----------------------- ----------------------- -----------------------
  ADR-01                  Voice proximity radius  At 32 pixels per
                          is initially **160      logical tile, this
                          world pixels**.         equals five tiles.
                          Distance is             
                          center-to-center        
                          Euclidean distance.     

  ADR-02                  Logical tile size is    Map, collision and
                          **32 × 32 pixels**.     movement calculations
                                                  use this logical grid.

  ADR-03                  One active session per  A second
                          account. The newest     browser/tab/device
                          session replaces the    session invalidates the
                          previous session.       earlier session's game
                          Enforcement is          access.
                          server-side.            

  ADR-04                  Focus Room voice uses   Voice transmission is
                          **Toggle-to-Talk**.     off by default; a user
                                                  clicks to enable and
                                                  clicks again to
                                                  disable.

  ADR-05                  One active world per    The creator cannot
                          creator. A world in its create another world
                          10-minute grace period  until the existing
                          still counts as active. world is deleted.

  ADR-06                  Voice eligibility is    Client-side filtering
                          determined by the       alone is not an
                          application server and  authorization boundary.
                          enforced by the voice   Subscriptions are
                          service/SFU.            dynamically granted and
                                                  revoked.

  ADR-07                  Empty-world lifecycle   An in-memory timer
                          uses PostgreSQL         alone must not be
                          timestamps and durable  responsible for world
                          cleanup processing.     deletion.
  -----------------------------------------------------------------------

Additional approved constraints:

-   Room boundaries are enforced independently of physical proximity.
-   A user must never hear another user in a different room, even if
    their coordinates are close.
-   Voice access is revoked immediately when eligibility ends.
-   Focus Room Toggle-to-Talk does not bypass room or proximity
    restrictions.
-   Lifecycle state must survive backend restarts.
-   The 20-user limit applies to the whole world, not to each area.
-   The newest session replaces the previous session for the same
    account.

## 4. Approved Technology Stack

The following is the approved V1 stack:

  -----------------------------------------------------------------------
  Layer                   Proposed technology     Responsibility
  ----------------------- ----------------------- -----------------------
  Language                TypeScript              Shared language across
                                                  frontend and backend

  Frontend                React + Vite            Application shell,
                                                  login, world UI and
                                                  menus

  2D game runtime         Phaser 3                Rendering, camera,
                                                  input, animation and
                                                  client-side collision
                                                  presentation

  Styling                 Tailwind CSS            Menus, forms, overlays
                                                  and responsive UI

  Map authoring           SVG initially; Tiled    Visual map iteration,
                          for runtime tilemaps    tile layers, collision
                                                  and room-zone object
                                                  layers

  Pixel-art editing       Pixelorama or           Tiles, sprites and
                          Aseprite-compatible     animation frames
                          workflow                

  Backend runtime         Node.js + TypeScript    Authoritative game
                                                  server and application
                                                  services

  Multiplayer framework   Colyseus                World sessions, player
                                                  state and real-time
                                                  state synchronization

  Voice                   LiveKit Cloud / WebRTC  Real-time voice
                          SFU                     transport and
                                                  participant
                                                  subscriptions

  Authentication          Supabase Auth           Account registration,
                                                  login and session
                                                  identity

  Database                PostgreSQL via Supabase Users/profile metadata,
                                                  worlds, invitations and
                                                  lifecycle state

  Database access         Prisma (proposed)       Typed database access
                                                  and migrations

  Package manager         pnpm                    Workspace and
                                                  dependency management

  Monorepo                pnpm workspaces         Shared types and
                                                  coordinated packages

  Unit tests              Vitest                  Pure logic, services
                                                  and shared utilities

  Browser tests           Playwright              User flows and
                                                  multi-browser
                                                  interaction

  Code quality            ESLint + Prettier       Linting and consistent
                                                  formatting

  Version control         Git + GitHub            Source control and
                                                  milestone history
  -----------------------------------------------------------------------

### 4.1 Stack rationale

-   **React + Vite** provides a straightforward web application shell.
-   **Zustand** is recommended as the lightweight external state bridge between Phaser 3 and React, allowing the game loop to communicate player state, current room, and voice indicators to the UI without causing unnecessary React component re-renders.
-   **Phaser** is suitable for a 2D top-down world with keyboard input,
    camera handling, sprite animation and tilemap support.
-   **Colyseus** provides room-based multiplayer state synchronization
    without requiring the team to build a low-level WebSocket protocol
    from scratch.
-   **LiveKit/WebRTC** handles audio media. Audio must not be sent
    through Colyseus state messages.
-   **Supabase Auth + PostgreSQL** provides managed authentication and
    durable relational storage.
-   **TypeScript** allows frontend, server and shared data contracts to
    use the same language.
-   A **monorepo** keeps shared types and contracts consistent.

### 4.2 Important technology validation

Before approval, Antigravity must check current official documentation
and verify:

1.  The currently supported Node.js and TypeScript versions for the
    chosen Colyseus release.
2.  Colyseus deployment requirements and whether the selected host
    supports its networking and WebSocket behavior.
3.  LiveKit token generation, room permissions, participant permissions
    and subscription control APIs.
4.  Supabase Auth JWT verification and the recommended server-side
    validation approach.
5.  Prisma compatibility with the chosen Supabase PostgreSQL connection
    method, including pooled versus direct connections and migration
    behavior.
6.  Whether the proposed free hosting tiers currently support the
    required runtime and usage.

Do not assume that a free-tier limit or product feature mentioned in an
earlier discussion is still current.

## 5. High-Level System Architecture

### 5.1 Logical components

``` mermaid
flowchart TB
    U[User's Browser]
    UI[React Application]
    GAME[Phaser 2D World]
    AUTH[Supabase Auth]
    API[Node.js Application Services]
    COLY[Colyseus Game Server]
    DB[(Supabase PostgreSQL)]
    LK[LiveKit SFU]

    U --> UI
    UI --> AUTH
    UI --> API
    UI --> GAME
    GAME <--> COLY
    API --> AUTH
    API --> DB
    COLY --> DB
    API --> LK
    COLY --> API
    GAME <--> LK
```

The diagram is logical. For V1 free-tier deployment, `API` (REST endpoints, LiveKit token/permission control, and lifecycle cleanup) and `COLY` (Colyseus WebSocket server) run together in **one unified Node.js process** (`apps/game-server`).

### 5.2 Component responsibilities

**Browser application** - Displays the login and world-management
experience. - Hosts the Phaser game canvas. - Captures keyboard input. -
Displays local and remote avatars. - Presents room, mute, Focus Room
voice and connection controls. - Connects to the game server and voice
service.

**Application services** - Validates user identity. - Creates worlds and
invitation credentials. - Validates invite links/codes. - Enforces one
active world per creator. - Enforces one active account session. -
Issues short-lived LiveKit access tokens. - Coordinates world lifecycle
operations.

**Colyseus game server** - Hosts one authoritative game room per active
world. - Tracks connected players and their game state. - Validates
movement and collision constraints. - Enforces the 20-user capacity. -
Publishes synchronized state to connected clients. - Calculates room
membership and voice eligibility. - Triggers voice permission changes
when eligibility changes.

**Supabase Auth** - Handles registration, login and authentication
sessions. - Supplies identity tokens that backend services validate. -
Does not replace application-level authorization checks.

**PostgreSQL** - Stores durable world and invitation records. - Stores
the lifecycle timestamps needed for reliable cleanup. - Stores user
profile metadata and selected avatar, if persistence is approved. - Is
not used as the transport for high-frequency player movement.

**LiveKit** - Carries voice media. - Enforces who may publish and
subscribe. - Receives permissions/tokens from trusted backend
services. - Does not decide application room membership independently of
the game server.

## 6. Application Structure and Monorepo Proposal

A possible workspace layout:

``` text
pixel-world/
├── apps/
│   ├── web/                 # React, Vite and Phaser client
│   └── game-server/         # Node.js and Colyseus server
├── packages/
│   ├── shared/              # Shared types, constants and schemas
│   ├── game-config/         # Map metadata and game configuration
│   └── validation/          # Shared validation schemas, if appropriate
├── assets/
│   ├── tilesets/
│   ├── characters/
│   ├── maps/
│   └── audio/
├── docs/
│   ├── PROJECT_CONTEXT.md
│   ├── SRS.md
│   ├── PRD.md
│   ├── DECISIONS.md
│   ├── ARCHITECTURE.md
│   ├── GAME_DESIGN.md
│   └── DEVELOPMENT_PLAN.md
├── AGENTS.md
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

This is a proposed structure, not a command to initialize the repository
now. The exact folders may be refined after the game design and
development plan are approved.

### 6.1 Shared contracts

The shared package should contain stable, serializable contracts such
as:

-   Player identifier and display name.
-   World identifier.
-   Position and direction.
-   Animation state.
-   Logical room/zone identifier.
-   Avatar identifier.
-   Connection/presence status.
-   Constants such as tile size, map bounds and proximity radius.
-   Validation schemas for client requests.

Avoid sharing server implementation code with the browser. Shared
packages should contain contracts and pure utilities only.

## 7. Frontend and Game Client Architecture

### 7.1 React and Phaser separation

React should manage the application interface. Phaser should manage the
real-time game world.

**React responsibilities** - Registration and login screens. -
Create-world and join-world forms. - Invite link/code display. -
Settings and avatar selection. - Connection status. - Voice controls and
permission feedback. - Error and loading states.

**Phaser responsibilities** - Rendering the tilemap and sprites. -
Keyboard input. - Local player presentation. - Remote player
presentation. - Camera tracking. - Client-side visual collision. -
Animation playback. - Visual room/area cues.

React and Phaser should communicate through a small, explicit
integration layer rather than tightly coupling their internal state.

### 7.2 Rendering and map assets

-   Use 32 × 32 logical pixels per tile.
-   Begin with SVG for rapid visual design and iteration.
-   Once the layout is approved, create/export runtime-ready tilemap
    assets.
-   Use Tiled-compatible JSON data for map layers and object layers.
-   Use PNG spritesheets or other Phaser-supported image assets for
    tiles and characters.
-   Keep visual layers separate from collision and logical room-zone
    data.

Recommended map layers:

1.  Ground/base.
2.  Ground decoration.
3.  Walkable paths.
4.  Furniture and foreground objects.
5.  Collision objects.
6.  Room/voice-zone objects.
7.  Spawn points and interaction points.
8.  Optional foreground overlay.

The final layer names and map geometry belong in `GAME_DESIGN.md`.

### 7.3 Camera and viewport

Proposed behavior:

-   Follow the local player.
-   Clamp the camera to map boundaries.
-   Keep the local player readable and near the visual center where
    practical.
-   Avoid camera movement that makes the map disorienting.
-   Use a fixed logical resolution or a carefully tested scaling
    strategy.

Exact viewport dimensions, zoom, scaling mode and camera smoothing
remain open decisions for the game design review.

### 7.4 Input and movement

-   Support WASD and arrow keys.
-   Normalize diagonal movement so it is not faster than
    horizontal/vertical movement.
-   Use delta-time-based movement to avoid frame-rate-dependent speed.
-   Do not let the client authoritatively set arbitrary player
    coordinates.
-   Client prediction may be used for responsive local movement.
-   The server validates and corrects authoritative position.
-   Prevent movement through walls and blocked objects.

The exact movement speed, acceleration model, collision shape and
reconciliation tolerance must be selected and tested during the movement
milestone.

## 8. Multiplayer Architecture

### 8.1 World-to-server-room mapping

Recommended model:

-   One active world corresponds to one Colyseus room instance.
-   All five map areas exist inside that one game room.
-   Moving between areas does not leave and rejoin a Colyseus room.
-   A world has a maximum of 20 connected players in total.
-   The game server owns the authoritative player list and positions.

This avoids treating each physical area as a separate multiplayer
instance and makes movement across room entrances seamless.

### 8.2 Authoritative state

The server should be authoritative for:

-   World membership.
-   Player identity and active session.
-   Player position and movement validation.
-   Collision constraints that affect authoritative movement.
-   Current logical room/zone.
-   Capacity.
-   Voice eligibility.
-   World empty/occupied state.

The client may predict local movement for responsiveness, but it must
not be trusted to grant itself access, exceed capacity or decide who can
hear whom.

### 8.3 Suggested player state

A conceptual player state:

``` ts
type PlayerState = {
  sessionId: string;
  userId: string;
  displayName: string;
  avatarId: string;

  x: number;
  y: number;
  direction: "up" | "down" | "left" | "right";
  movementState: "idle" | "walking" | "sitting";

  zoneId: "town-hall" | "coding" | "learning" | "chill" | "focus";
};
```

This is illustrative, not a final schema. Colyseus schema types and
serialization constraints must be checked against the selected version.

Do not expose authentication tokens, invite secrets, LiveKit secrets or
private database fields in synchronized game state.

### 8.4 Movement update flow

1.  Browser captures keyboard input.
2.  Client computes a movement intent.
3.  Client sends a compact input/update message to the game server.
4.  Server validates the input, speed, bounds and collision.
5.  Server updates authoritative position.
6.  Colyseus synchronizes state to the room's clients.
7.  Clients render remote players and reconcile their local prediction.

The protocol should send movement intent or validated input state rather
than accepting arbitrary client coordinates as truth.

### 8.5 Network behavior

-   Use the Colyseus-supported WebSocket transport.
-   Keep messages compact and avoid sending unchanged values.
-   Do not send audio data through the game server.
-   Handle reconnects and stale sessions explicitly.
-   Display connection state to the user.
-   Rejoin should revalidate account session, world existence and
    invitation/access status.
-   The default reconnect spawn behavior is proposed to be Town Hall
    unless a later product decision approves restoring the last
    position.

The tick rate, input send rate, state patch behavior and interpolation
settings must be benchmarked rather than guessed.

## 9. Authentication, Sessions and Private World Access

### 9.1 Authentication

Proposed flow:

1.  User registers or logs in through Supabase Auth.
2.  Browser receives an authentication session/token.
3.  Browser sends the token to application services and the game-server
    connection.
4.  Backend verifies the token using the supported Supabase/JWT
    verification method.
5.  Backend derives the user identity from the verified token.
6.  Backend performs application-level authorization before allowing
    world actions.

Never trust a user ID supplied in an arbitrary request body when a
verified token can provide the identity.

### 9.2 One active session per account

The approved policy is newest session wins.

Recommended enforcement concept:

-   Store a server-recognized active session identifier or session
    generation for each account.
-   When a new login/game session is established, replace the previous
    active session marker.
-   Game-server connections periodically or event-wise validate that
    their session is still current.
-   When an older session is superseded, disconnect it from the game
    room and revoke its voice permissions.
-   Ensure race conditions are handled transactionally or with an
    equivalent atomic mechanism.

The exact source of truth for session generation needs to be selected
after reviewing Supabase Auth token/session semantics. Do not assume
that a client-side logout alone enforces this rule.

### 9.3 Private invitation access

-   Worlds are private by default.
-   Joining requires a valid invitation link or room code.
-   Invitation secrets must be generated with cryptographically secure
    randomness.
-   Store only a cryptographic hash (`secret_hash`) of the invitation secret in PostgreSQL, never the raw secret. The raw token/link is returned once upon world creation or invite regeneration.
-   World creators can revoke an active invitation and regenerate a new one (which sets `revoked_at` on prior active invitations for that world).
-   Do not expose invitation secrets in public logs or analytics.
-   Validate invitation status and world status on the server.
-   Apply reasonable rate limits to code guessing and repeated join
    attempts.
-   Return generic errors where revealing whether a world code exists
    would create an enumeration risk.

## 10. World Management and Database Design

### 10.1 Database principles

-   PostgreSQL is the durable source of truth for world metadata and
    lifecycle.
-   Use relational constraints and transactions for ownership and
    capacity-related operations where appropriate.
-   Do not write high-frequency movement coordinates to PostgreSQL.
-   Keep transient player positions in the live game-server state.
-   Use migrations under version control.
-   Store timestamps in UTC.
-   Use database constraints/indexes to support ownership and cleanup
    rules.

### 10.2 Proposed concrete database schema

The following concrete schema defines the relational structure, constraints, and indexes required for V1:

```sql
-- 1. User Profiles (Linked to Supabase Auth UUID)
CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(32) NOT NULL,
    avatar_id VARCHAR(32) NOT NULL DEFAULT 'avatar_1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Worlds Table with Partial Unique Index for ADR-05
CREATE TYPE world_status AS ENUM ('active', 'empty_grace', 'deleted');

CREATE TABLE worlds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    name VARCHAR(64) DEFAULT 'My Town',
    status world_status NOT NULL DEFAULT 'active',
    empty_since TIMESTAMPTZ,
    delete_after TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforces ADR-05: Exactly one active or grace-period world per creator
CREATE UNIQUE INDEX idx_one_active_world_per_owner 
ON worlds (owner_user_id) 
WHERE status IN ('active', 'empty_grace');

-- Index for efficient lifecycle cleanup polling
CREATE INDEX idx_worlds_cleanup_eligible 
ON worlds (delete_after) 
WHERE status = 'empty_grace';

-- 3. Invitations Table (Hashed secrets with revoke/regenerate support)
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
    secret_hash VARCHAR(64) NOT NULL UNIQUE,
    created_by UUID NOT NULL REFERENCES profiles(user_id),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invitations_lookup ON invitations (secret_hash) WHERE revoked_at IS NULL;

-- 4. Account Sessions (Enforces ADR-03: Newest Session Wins)
CREATE TABLE account_sessions (
    user_id UUID PRIMARY KEY REFERENCES profiles(user_id) ON DELETE CASCADE,
    active_session_id VARCHAR(64) NOT NULL,
    session_generation INT NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 10.3 Key relationship rules

-   One profile corresponds to one authenticated user.
-   One user may own at most one active world.
-   A world has one creator/owner.
-   A world may have multiple invitation records over time.
-   An invitation belongs to one world.
-   A world in its grace period is still active for the
    one-world-per-owner constraint.
-   Expired or revoked invitations cannot authorize new joins.

### 10.4 Ownership uniqueness

The database and backend should both protect the
one-active-world-per-owner rule.

A possible implementation is a partial unique index on `owner_user_id`
for world statuses considered active, including the empty/grace state.
The final status model and SQL expression must be specified by
Antigravity and reviewed before migration creation.

### 10.5 Capacity enforcement

The server must atomically prevent more than 20 connected users from
entering a world. Do not rely on a client-side count or a stale database
count.

Because live membership is held by the game server, the Colyseus room's
authoritative membership is the immediate capacity check. Reconnection
and duplicate-session cases must be accounted for.

## 11. Voice Architecture

### 11.1 Separation of responsibilities

-   Colyseus handles game state, player position and presence.
-   The application/game server determines voice eligibility.
-   LiveKit/WebRTC transports audio.
-   LiveKit enforces publish/subscribe permissions.
-   No raw audio is sent through Colyseus.

### 11.2 Voice zones

  -----------------------------------------------------------------------
  Area                                Voice behavior
  ----------------------------------- -----------------------------------
  Town Hall                           Proximity voice enabled

  Coding Room                         Proximity voice enabled

  Learning Room                       Proximity voice enabled

  Chill Room                          Proximity voice enabled

  Focus Room                          Disabled by default; user may
                                      enable transmission using
                                      Toggle-to-Talk
  -----------------------------------------------------------------------

Town Hall is one shared logical voice zone, but it remains
proximity-based. It does not mean every person in Town Hall can hear
everyone else regardless of distance.

### 11.3 Eligibility rule

A participant may receive another participant's audio only when all
required conditions are true:

1.  Both participants are connected to the same world.
2.  Both are in the same logical voice zone.
3.  The center-to-center Euclidean distance is no greater than 160 world
    pixels.
4.  The transmitting participant is not muted and is permitted to
    publish.
5.  The receiving participant is permitted to subscribe.
6.  Any zone-specific rule is satisfied.

The room/zone equality check is independent of distance. Two players in
different areas must not hear each other merely because their
coordinates are close.

For Focus Room: - Voice transmission is off by default. - Toggle-to-Talk
enables/disables the user's ability to transmit. - Enabling the toggle
does not grant cross-room access. - The user remains subject to the same
proximity and subscription rules. - The intended V1 interpretation is
that Focus Room users can communicate with other eligible Focus Room
users only. Cross-room Focus Room voice is not allowed unless the owner
explicitly changes this rule.

### 11.4 Proximity calculation

For player A and player B:

``` ts
const dx = A.x - B.x;
const dy = A.y - B.y;
const distanceSquared = dx * dx + dy * dy;

const isWithinRange = distanceSquared <= 160 * 160;
```

The server should use squared distance to avoid unnecessary square-root
calculations.

The distance is measured between player centers in world coordinates.
The radius is initially 160 pixels and may be tuned after playtesting,
but changing it requires an explicit decision update.

### 11.5 Voice authorization flow

``` mermaid
sequenceDiagram
    participant C as Game Client
    participant G as Colyseus/Game Server
    participant A as Application Service
    participant L as LiveKit SFU

    C->>A: Request voice access with authenticated session
    A->>G: Verify world membership and current player state
    G-->>A: Eligibility context
    A->>L: Create/authorize participant with restricted permissions
    A-->>C: Short-lived LiveKit token
    C->>L: Connect to voice room
    G->>A: Eligibility changed (zone, distance, mute/toggle, disconnect)
    A->>L: Update publish/subscribe permissions
    L-->>C: Apply permission/subscription changes
```

This is a conceptual sequence. The final implementation directly uses LiveKit's official `@livekit/server-sdk` methods to enforce ADR-06:
- `RoomServiceClient.updateParticipant()`: Dynamically toggles participant permissions such as `canPublish` (used for mic mute/unmute and Focus Room Toggle-to-Talk).
- `RoomServiceClient.updateSubscriptions()`: Commands the SFU to force-subscribe or force-unsubscribe a receiving participant to/from specific track IDs (`track_sids`), guaranteeing that media packets are never routed across room boundaries or beyond the 160-pixel radius.

### 11.6 Dynamic subscription management

The server must maintain the set of eligible audio relationships.

When a player moves, changes zone, mutes, disables Focus Room
transmission, disconnects or is replaced by a newer session:

1.  Recalculate affected voice relationships.
2.  Identify subscriptions that are no longer allowed.
3.  Revoke those subscriptions immediately.
4.  Grant newly eligible subscriptions.
5.  Ensure the SFU enforces the resulting permissions.

Do not rely on hiding audio elements or filtering tracks only in the
browser. Client UI controls are not security controls.

### 11.7 Voice performance

A 20-person world can create many possible pairwise relationships. Avoid
blindly recalculating every pair on every tiny movement update if a more
efficient spatial-neighbor strategy is practical.

To avoid redundant LiveKit SFU API calls and boundary oscillation:
- Maintain a server-side per-pair eligibility cache in the room state.
- Only invoke `RoomServiceClient.updateSubscriptions()` when a pair's boolean eligibility actually changes (edge-triggered diffing).
- Batch permission updates per tick where supported.
- Preserve immediate revocation when `zoneId` changes or distance exceeds `160` world pixels.

Any optimization must preserve the approved 160-pixel rule and immediate
revocation when eligibility ends.

## 12. World Lifecycle and Cleanup

### 12.1 Required behavior

-   A world is active while at least one participant is present.
-   When the last participant leaves, the world enters a 10-minute grace
    period.
-   A participant returning during the grace period cancels pending
    deletion.
-   If the grace period expires with no participants, the world is
    deleted.
-   The creator cannot create a second world while the original world is
    active or in grace.
-   Lifecycle state must survive server restarts.

### 12.2 Durable timestamp model

Use PostgreSQL fields such as:

-   `empty_since` --- when the world became empty.
-   `delete_after` --- the earliest time at which deletion may occur.
-   `status` --- a constrained lifecycle state, for example active,
    empty_grace, deleting.

When the final participant leaves: 1. The game server reports the world
as empty. 2. A trusted backend service updates `empty_since` and
`delete_after = empty_since + 10 minutes`. 3. The world is retained
during the grace period.

When a participant returns: 1. The server verifies the world is still
joinable. 2. The backend clears `empty_since` and `delete_after`. 3. The
world returns to active status.

### 12.3 Cleanup worker and lazy expiration

A durable cleanup process runs:
1. **Periodically** (when `apps/game-server` is awake) to expire worlds where `status = 'empty_grace'` and `delete_after <= NOW()`.
2. **On server startup** to catch any worlds that expired while the server was restarted or asleep.
3. **Lazily on-demand** inside world creation, join, and active-world lookup transactions (`UPDATE worlds SET status = 'deleted' WHERE status = 'empty_grace' AND delete_after <= NOW()`), ensuring that a sleeping free-tier host never blocks a creator from creating a new world under `idx_one_active_world_per_owner`.

Before deletion it must re-check: - The world is still in the grace
state. - The deadline has passed. - The world has no connected
participants. - No concurrent join is in progress.

Deletion should be transactional where possible. Invitations and other
world-owned records should be removed or invalidated consistently. The
worker must be safe to run more than once.

Do not depend on a `setTimeout` in the game-server process as the only
deletion mechanism. An in-memory timer may be used as an optimization,
never as the source of truth.

### 12.4 Race conditions

The design must handle: - A user joining at the exact time the cleanup
worker runs. - A user disconnecting while a reconnect is being
processed. - The game server restarting during the grace period. - A
cleanup worker retrying after a partial failure. - Two backend instances
trying to process the same world.

Antigravity should specify the locking/transaction strategy and the
order of operations for these cases.

## 13. Security and Privacy

Security requirements for V1:

-   All application traffic uses HTTPS/WSS in deployed environments.
-   Validate Supabase Auth tokens on trusted backend services.
-   Enforce world membership and permissions server-side.
-   Never trust client-supplied user identity, world ownership, position
    or voice eligibility.
-   Keep Supabase service-role keys, database credentials and LiveKit
    API secrets on the server only.
-   Do not bundle secrets into frontend environment variables.
-   Use short-lived, scoped LiveKit tokens.
-   Enforce private invitation validation and rate limits.
-   Protect against invite-code enumeration.
-   Validate all client messages and impose reasonable size/rate limits.
-   Enforce one active account session server-side.
-   Enforce the 20-user world capacity server-side.
-   Use secure cookie/session practices according to the selected auth
    integration.
-   Avoid logging access tokens, invite secrets or voice credentials.
-   Apply least-privilege permissions to database and voice operations.
-   Use Supabase Row Level Security where client-side database access is
    enabled; privileged server access must still apply application
    authorization.
-   Provide a clear way to leave a world and disconnect voice.

**Browser vs. Server Database Access Policy:**
- **Zero direct browser writes** to `worlds`, `invitations`, or `account_sessions`. Enforce Supabase Row Level Security (RLS) denying direct client mutations on these tables; all world creation, invite validation/revocation, session enforcement, and LiveKit token minting must route exclusively through the trusted `apps/game-server` backend.
- The browser may read/update only the authenticated user's own `profiles` row (or route profile updates through `apps/game-server` as well) under strict `auth.uid() = user_id` RLS.

## 14. Error Handling and Resilience

The application should handle:

-   Authentication expiry.
-   Invalid, expired or revoked invitation.
-   Full world.
-   World deleted or in grace period.
-   Replaced account session (The game server sends WebSocket close code `4001` with reason `"Session superseded by newer tab"`, triggering a dedicated warning modal in React).
-   Game-server disconnection.
-   Voice-service disconnection.
-   Microphone permission denied.
-   Microphone unavailable or already in use.
-   Browser tab refresh.
-   Backend restart.
-   Database temporary failure.

Expected user-facing behavior: - Show understandable messages instead of
raw stack traces. - Distinguish game connection status from voice
connection status. - If voice fails, keep the user in the world when
possible. - If the game server disconnects, show a reconnecting state
and prevent duplicate local player representations. - Do not silently
leave a microphone transmitting after the user has left the world or
lost authorization.

## 15. Performance and Observability

### 15.1 Performance priorities

-   Smooth local movement.
-   Stable remote-player movement.
-   Responsive camera.
-   Low-latency voice.
-   No audio leakage across room boundaries.
-   No duplicate sessions for the same account.
-   Reliable 20-user capacity.
-   No database writes for every movement tick.

### 15.2 Initial measurable targets to validate

These are proposed targets for testing, not guaranteed service-level
commitments:

  -----------------------------------------------------------------------
  Area                                Proposed target
  ----------------------------------- -----------------------------------
  World capacity                      20 concurrent users in one world

  Local movement                      Responsive and visually smooth on a
                                      typical modern desktop

  Remote movement                     No persistent jitter or large
                                      position divergence under normal
                                      test conditions

  Voice eligibility                   Permission changes applied promptly
                                      after zone/proximity changes

  World cleanup                       Eligible empty worlds deleted after
                                      the 10-minute grace period, subject
                                      to worker polling interval

  Session uniqueness                  Previous session loses game/voice
                                      access after a newer session is
                                      established

  Browser support                     Current stable desktop Chrome;
                                      other browsers assessed during QA
  -----------------------------------------------------------------------

Antigravity should propose numeric latency, frame-rate, reconnect and
server-resource targets after defining a repeatable test environment. Do
not invent precision that has not been measured.

### 15.3 Observability

Use structured server logs for: - Authentication failures. - World
creation and deletion. - Join/leave events. - Capacity rejections. -
Session replacement. - Game-server errors and reconnects. - Voice
authorization changes. - Cleanup worker outcomes.

Never log secrets or raw access tokens. Keep logging minimal on free
tiers and avoid adding a paid observability dependency to V1 unless
justified.

## 16. Testing Strategy

### 16.1 Unit tests

Test pure logic and service rules:

-   Euclidean proximity calculation.
-   Room/zone eligibility.
-   Focus Room Toggle-to-Talk rules.
-   Movement speed normalization.
-   Map bounds and collision helpers.
-   Invitation validation.
-   One-world-per-owner rule.
-   Grace-period calculations.
-   Cleanup eligibility.
-   Session replacement logic.

### 16.2 Integration tests

Test: - Supabase token validation by backend. - World creation and
ownership. - Invitation join validation. - World capacity enforcement. -
Colyseus room lifecycle. - Database lifecycle transitions. - LiveKit
token and permission management. - Voice subscription grant/revoke
behavior.

### 16.3 Browser and multiplayer tests

Use separate browser contexts or browser instances to test:

1.  Two users join the same world.
2.  Both users see each other's movement.
3.  A third user joins.
4.  The 20-user limit is enforced.
5.  A 21st user is rejected.
6.  Users move between all five areas without changing game instances.
7.  Users in different areas cannot hear each other.
8.  Users in the same area but outside 160 pixels cannot hear each
    other.
9.  Users in the same area and within 160 pixels can hear each other
    when permitted.
10. Focus Room voice starts disabled.
11. Focus Room Toggle-to-Talk enables and disables transmission.
12. Moving out of range revokes the relevant subscription.
13. Leaving the world removes the user from voice.
14. A newer account session replaces the older one.
15. Empty-world grace period is cancelled by a return.
16. A world is cleaned up after the grace deadline.
17. Cleanup remains correct after a server restart.

### 16.4 Manual playtesting

Before advancing a milestone, manually test: - Map readability and
navigation. - Collision feel. - Avatar scale and animation. - Camera
behavior. - Voice clarity and permission feedback. - Browser performance
with multiple players.

## 17. Deployment Proposal and Cost Constraints

The goal is to develop and test with minimal or zero recurring cost. A
free-tier deployment is a constraint, not a guarantee of
production-grade availability.

Possible initial deployment arrangement:

  ------------------------------------------------------------------------
  Component               Candidate                Important caveat
  ----------------------- ------------------------ -----------------------
  Frontend                Cloudflare Pages         Verify build/runtime
                                                   requirements

  Game server             Render or another        Free services may
                          Node/WebSocket-capable   sleep, restart or have
                          host                     usage limits; this can
                                                   harm real-time
                                                   multiplayer

  Database and auth       Supabase Free            Free-tier limits,
                                                   inactivity policies and
                                                   project pausing can
                                                   change

  Voice                   LiveKit Cloud free       Participant-minute,
                          allowance, if currently  bandwidth and
                          available                concurrent-user limits
                                                   must be checked

  Source control          GitHub                   Keep secrets out of the
                                                   repository
  ------------------------------------------------------------------------

### 17.1 Cost policy

-   Do not add a paid service without owner approval.
-   Do not enable automatic paid upgrades.
-   Check current official pricing and limits before deployment.
-   Estimate voice usage for 20 participants.
-   Confirm whether the free game-server host supports persistent
    WebSocket connections and required networking.
-   Document sleep/wake behavior and expected downtime.
-   Keep a local development path that does not depend on public
    deployment.

**Important:** A free-tier stack may be appropriate for development,
demos and limited testing, but it may not support a continuously
available multiplayer experience. The architecture should make this
limitation explicit.

## 18. Environments and Configuration

Proposed environments:

-   **Local:** developer machine; local game server and local or
    development Supabase project.
-   **Preview:** temporary frontend preview and a suitable test backend,
    if feasible without incurring cost.
-   **Production/demo:** deployed services with separate credentials and
    data.

Use environment variables for configuration. Maintain an `.env.example`
containing variable names and safe placeholder values only.

Potential variables include:

``` text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=

LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

GAME_SERVER_URL=
APP_ORIGIN=
```

Only variables intended for browser use should use the `VITE_` prefix.
Never expose service-role keys, database credentials or LiveKit API
secrets to the browser.

The final environment variable list depends on the chosen Supabase and
Prisma connection approach.

## 19. Decisions Status (Synced with `DECISIONS.md`)

All core V1 architectural and product decisions have been finalized in `DECISIONS.md` and `GAME_DESIGN.md`:

- **Avatar persistence:** Save selected `avatar_id` to `profiles`.
- **Avatar switching inside world:** Deferred post-V1.
- **Display names & speaking indicators:** Included in V1 (`DEC-06`).
- **Invitation security:** Hashed tokens (`secret_hash`) with revoke/regenerate support (`DEC-09`).
- **Reconnect position:** Town Hall safe spawn region (`DEC-07`).
- **Map & movement specs:** 50 × 40 tiles, 4-tile corridors, 32 × 48 px sprites, 140 px/s speed (`DEC-01`–`DEC-05`).
- **Focus Room receive behavior:** Nearby Focus Room users (within 160 px) can hear someone who has enabled Toggle-to-Talk (`DEC-08`).
- **Performance & browser targets:** Desktop Chrome baseline; numeric latency/FPS thresholds benchmarked during M2/M3/M6 QA.

## 20. Architecture Risks and Mitigations

  ------------------------------------------------------------------------
  Risk                    Why it matters          Mitigation
  ----------------------- ----------------------- ------------------------
  Free game host sleeps   WebSocket sessions may  Validate host behavior
                          be interrupted and      early; treat free
                          users experience wake   hosting as demo-only if
                          latency                 necessary

  Voice subscription      Incorrect permissions   Server-authorized
  complexity              can cause privacy leaks eligibility and
                                                  SFU-enforced
                                                  subscription permissions

  Proximity recalculation Movement can trigger    Spatial partitioning and
  load                    many potential pair     change-based permission
                          checks                  updates

  Session race conditions Two simultaneous        Atomic session
                          sessions may both       generation/replacement
                          appear valid briefly    and server-side checks

  Cleanup race conditions A returning user could  Transactional re-check
                          race with deletion      and durable lifecycle
                                                  timestamps

  Supabase/Prisma         Pooling and migrations  Validate connection
  connection setup        can be misconfigured    strategy before schema
                                                  implementation

  Client/server movement  Players may jitter or   Authoritative server
  disagreement            pass through obstacles  validation with
                                                  controlled client
                                                  prediction

  Map and voice zone      Visual room boundaries  Author room zones as
  mismatch                may differ from logical explicit map objects and
                          voice boundaries        test boundary cases

  Voice API rate/latency  Too many permission     Efficient neighbor
                          updates can delay       tracking and batched
                          enforcement             updates where supported
  ------------------------------------------------------------------------

## 21. Recommended Implementation Boundaries

Keep the initial system modular without introducing unnecessary
microservices.

Suggested backend modules:

-   `auth` --- token verification and account identity.
-   `worlds` --- world creation, ownership and metadata.
-   `invitations` --- code/link generation and validation.
-   `sessions` --- active-session policy.
-   `game` --- Colyseus room and authoritative player state.
-   `movement` --- movement validation and collision rules.
-   `zones` --- logical room membership.
-   `voice` --- eligibility calculation and LiveKit integration.
-   `lifecycle` --- empty-world grace period and cleanup.
-   `database` --- Prisma client, migrations and repositories.

Suggested frontend modules:

-   `auth-ui`
-   `world-lobby`
-   `game-canvas`
-   `game-input`
-   `player-rendering`
-   `map-rendering`
-   `voice-controls`
-   `connection-status`
-   `shared-ui`

These are logical boundaries. They do not imply that each module must be
a separate package or service.

## 22. Recommended Build Order

This order reflects the user's preference for visual-first development
while preserving architectural dependencies.

### Phase 0 --- Documentation and design approval

-   Review project context, SRS and PRD.
-   Review and approve this architecture.
-   Complete `GAME_DESIGN.md`.
-   Complete `DEVELOPMENT_PLAN.md`.
-   Prepare `AGENTS.md`.
-   No implementation before approval.

### Phase 1 --- Visual map and art assets

-   Iterate the connected map in SVG.
-   Establish the five room identities and walkable connections.
-   Create initial avatar and tile assets.
-   Review and approve the visual result.
-   Convert approved design into runtime map assets.

### Phase 2 --- Single-player game foundation

-   Render the map in Phaser.
-   Add one avatar.
-   Implement WASD and arrow-key movement.
-   Add camera, collision and basic animation.
-   Test and refine movement before multiplayer.

### Phase 3 --- Multiplayer synchronization

-   Add Colyseus.
-   Connect multiple clients to one world.
-   Synchronize authoritative player state.
-   Test movement, capacity, reconnect and session replacement.

### Phase 4 --- Authentication and world management

-   Integrate Supabase Auth.
-   Implement private world creation and invitation joins.
-   Enforce one active world per creator and one active session per
    account.
-   Implement durable world lifecycle and cleanup.

Authentication and world access may need to be brought forward for a
deployable multiplayer test environment; the detailed milestone plan
should resolve the exact sequencing.

### Phase 5 --- Voice

-   Integrate LiveKit.
-   Implement voice zones and 160-pixel proximity.
-   Enforce server-side subscription eligibility.
-   Add mute/unmute and Focus Room Toggle-to-Talk.
-   Test all cross-room and boundary cases.

### Phase 6 --- Hardening and deployment

-   Run full browser and multiplayer tests.
-   Optimize performance.
-   Verify free-tier constraints.
-   Deploy a demo environment.
-   Document setup, operations and known limitations.

## 23. Instructions for Google Antigravity --- Architecture Review Only

You are reviewing the proposed architecture for an invite-only 2D
multiplayer social world application.

**Do not write code. Do not initialize the repository. Do not install
dependencies. Do not create application files. Do not begin
implementation.**

Read this document together with: - `PROJECT_CONTEXT.md` - `SRS.md` -
`PRD.md` - `DECISIONS.md`

Return a structured review with these sections:

1.  **Understanding:** Summarize the system and its core constraints.
2.  **Consistency check:** Identify conflicts between this architecture
    and the context, SRS, PRD or approved ADRs.
3.  **Technology validation:** Evaluate each major technology choice and
    verify current compatibility using official documentation.
4.  **Alternative recommendations:** Suggest a better option only where
    there is a concrete technical reason. Explain trade-offs.
5.  **Multiplayer design:** Review Colyseus room mapping, authoritative
    movement, synchronization and the 20-user limit.
6.  **Voice security:** Carefully validate room boundaries, proximity,
    Focus Room Toggle-to-Talk and SFU-enforced subscriptions. Identify
    any possible audio leakage.
7.  **Database design:** Recommend a concrete relational schema,
    constraints, indexes and migration strategy.
8.  **Authentication and session uniqueness:** Explain how
    newest-session-wins can be enforced reliably with the selected auth
    provider.
9.  **World lifecycle:** Review the 10-minute grace period, rejoin race
    conditions, restart recovery and cleanup worker.
10. **Deployment and cost:** Verify current free-tier constraints and
    identify likely blockers for WebSockets and voice.
11. **Risks and missing decisions:** List unresolved choices and risks
    in priority order.
12. **Recommended revisions:** Provide precise proposed edits to this
    architecture.
13. **Approval assessment:** Classify the architecture as ready for
    owner approval, ready after revisions, or not ready.

For every claim about a current product feature, version compatibility
or free-tier limit, include an official documentation/pricing link and
the date checked. Do not rely on outdated remembered limits.

Treat the seven ADRs as approved constraints. If you believe one should
change, explain why and request owner approval; do not silently override
it.

Do not implement anything. Wait for the project owner's explicit
approval after the review.

## 24. Approval Checklist

The architecture is approved when:

-   [x] It is consistent with the approved SRS and PRD.
-   [x] The seven approved ADRs are preserved.
-   [x] The frontend/game-engine boundary is clear.
-   [x] The server-authoritative movement model is clear.
-   [x] One world maps to one shared multiplayer instance.
-   [x] The 20-user world-wide capacity is enforced server-side.
-   [x] Authentication and newest-session-wins behavior are technically
    credible.
-   [x] Private invitations are validated server-side.
-   [x] Voice rules prevent cross-room audio leakage.
-   [x] Focus Room Toggle-to-Talk behavior is unambiguous.
-   [x] SFU subscription permissions are enforced server-side.
-   [x] The 10-minute lifecycle is durable across restarts.
-   [x] Database entities and ownership constraints are defined.
-   [x] Hosting and free-tier limitations are understood.
-   [x] Open decisions are visible and resolved in `DECISIONS.md`.
-   [x] Antigravity has completed its review.
-   [x] The project owner has approved the final version.

------------------------------------------------------------------------

**End of architecture proposal.**\
**Next document after architecture approval:** `GAME_DESIGN.md`.
