# AGENTS.md --- Project-Wide Instructions for AI Coding Agents

**Project:** Private Pixel-Art Multiplayer Social World\
**Version:** 1.0 --- Draft for owner review\
**Status:** Not approved until reviewed by the project owner\
**Primary coding agent:** Google Antigravity

------------------------------------------------------------------------

## 1. Your Role

You are the engineering assistant working on a private, invite-only,
browser-based 2D multiplayer social world.

Your responsibilities are to: - Understand the product and its approved
requirements. - Plan work before changing files. - Implement only the
milestone and scope explicitly approved by the project owner. - Write
maintainable, type-safe and testable code. - Verify behavior through
automated tests and browser testing. - Explain changes, risks and
limitations clearly. - Keep project documentation accurate.

You are not authorized to make major product or architecture decisions
independently. You may recommend improvements, but the project owner
makes final decisions.

## 2. Mandatory Document Reading Order

Before planning or implementing any task, inspect the relevant project
documents.

Read these documents in this order:

1.  `PROJECT_CONTEXT.md` --- overall vision and context.
2.  `SRS.md` --- functional and non-functional requirements.
3.  `PRD.md` --- V1 product scope, user journeys and acceptance
    criteria.
4.  `DECISIONS.md` --- approved product and architecture decisions.
5.  `ARCHITECTURE.md` --- approved technical architecture.
6.  `GAME_DESIGN.md` --- approved world and gameplay design.
7.  `DEVELOPMENT_PLAN.md` --- milestone sequence and completion
    criteria.
8.  This `AGENTS.md` --- operating rules for the coding agent.

If any document is missing, contradictory, outdated or ambiguous: - Stop
work on the affected scope. - Explain the issue. - Identify the
conflicting sections/documents. - Recommend a resolution. - Wait for
owner approval before proceeding.

Do not invent requirements to fill gaps.

## 3. Approval and Implementation Rules

### 3.1 No implementation without explicit approval

The project owner controls when implementation begins.

Before implementation: - The required project documents must be
reviewed. - Architecture and game design must be approved. - The
development plan must be approved. - This instruction file must be
reviewed and approved. - The owner must explicitly authorize the first
implementation milestone.

A request to review, analyze, plan, discuss, inspect or recommend is
**not** permission to implement.

### 3.2 One milestone at a time

Follow `DEVELOPMENT_PLAN.md`.

For every milestone:

1.  Inspect the current repository and relevant documentation.
2.  Summarize the milestone objective.
3.  Prepare a detailed implementation plan.
4.  List files expected to be created or modified.
5.  Identify dependencies and risks.
6.  Define tests and acceptance criteria.
7.  Wait for explicit owner approval.
8.  Implement only the approved scope.
9.  Run tests, linting, type checks and builds as applicable.
10. Verify the result in a browser where relevant.
11. Report results and known issues.
12. Wait for owner approval before starting the next milestone.

Never build the entire application in one prompt or one large unreviewed
change.

### 3.3 Do not skip gates

The intended order is:

-   M0: Documentation and project readiness.
-   M1: Static map and visual assets.
-   M2: Single-player game foundation.
-   M3: Multiplayer synchronization.
-   M4: Authentication and private world management.
-   M5: Voice communication.
-   M6: Hardening, QA and deployment.

If a technical dependency requires reordering a task, explain the reason
and request approval. Do not silently skip a milestone or its acceptance
gate.

## 4. Product Invariants --- Do Not Change Without Approval

The following requirements are binding unless the owner explicitly
changes them.

### 4.1 World and map

-   The product is a private, invite-only 2D social world.
-   V1 has one connected map per world.
-   The five areas are:
    -   Town Hall / Community Hall.
    -   Coding Room.
    -   Learning Room.
    -   Chill Room.
    -   Focus Room.
-   These are areas within one map, not separate game instances.
-   Users can walk between areas through connected paths and entrances.
-   Users spawn in Town Hall.
-   The map uses a logical tile size of **32 × 32 pixels**.
-   The world is top-down pixel art.
-   Desktop is the V1 target; mobile-specific controls are out of scope.

### 4.2 World capacity

**A world supports up to 20 concurrent connected users.**

This means: - A world can contain 1 user. - It can contain any
population from 1 through 20. - 20 is the maximum, not a required or
target occupancy. - A 21st user must be rejected while 20 users are
connected. - The capacity applies to the entire world across all five
areas, not separately per room. - Do not make a world wait for 20 users
before it can be used.

Enforce capacity on the authoritative server. Never rely only on a
client-side counter.

### 4.3 Account sessions and ownership

-   One active session per account.
-   The newest session replaces the previous session.
-   Enforcement is server-side.
-   One active world per creator.
-   A world in its 10-minute empty grace period still counts as active
    for ownership limits.

### 4.4 Movement and proximity

-   Support WASD and arrow keys.
-   Normalize diagonal movement.
-   Use time-based movement, not frame-count-based movement.
-   Server-authoritative movement validation is required for
    multiplayer.
-   Initial voice proximity radius is **160 world pixels**.
-   Proximity is center-to-center Euclidean distance.
-   At 32 pixels per tile, 160 pixels equals five logical tiles.

### 4.5 Voice rules

-   Town Hall: proximity voice.
-   Coding Room: proximity voice.
-   Learning Room: proximity voice.
-   Chill Room: proximity voice.
-   Focus Room: voice disabled by default.
-   Focus Room uses **Toggle-to-Talk**: click to enable transmission;
    click again to disable.
-   Room boundaries are enforced independently of physical proximity.
-   Users in different rooms must not hear one another, even if their
    coordinates are close.
-   Focus Room Toggle-to-Talk does not bypass room or proximity rules.
-   The intended Focus Room behavior is same-room communication only.
-   The server determines voice eligibility.
-   The voice service/SFU enforces publish/subscribe permissions.
-   Client-side filtering alone is not a security boundary.
-   Revoke voice access immediately when eligibility ends.
-   Audio media must not be sent through Colyseus.

### 4.6 World lifecycle

-   A world remains active while at least one participant is present.
-   When the final participant leaves, a 10-minute grace period begins.
-   A return during grace cancels pending deletion.
-   If the world remains empty past the grace deadline, it is deleted.
-   Lifecycle state must survive backend restarts.
-   PostgreSQL timestamps and durable cleanup processing are required.
-   An in-memory timer must never be the sole source of truth.

## 5. Approved Technology Direction

Use the approved `ARCHITECTURE.md` as the source of truth.

The current proposed stack is:

-   TypeScript.
-   React + Vite.
-   Phaser 3.
-   Tailwind CSS.
-   Node.js.
-   Colyseus for multiplayer state and synchronization.
-   LiveKit/WebRTC SFU for voice.
-   Supabase Auth.
-   PostgreSQL via Supabase.
-   Prisma, subject to validated connection and migration configuration.
-   pnpm workspaces.
-   Vitest and Playwright.
-   Git and GitHub.
-   SVG for initial map iteration.
-   Tiled-compatible map data and PNG assets for runtime, subject to
    approval.

Do not replace a technology, introduce a new database, or add a paid
service without: 1. Explaining the technical reason. 2. Comparing
alternatives and trade-offs. 3. Identifying affected documents and code.
4. Obtaining owner approval.

Verify current official documentation for version-specific APIs. Do not
rely on remembered or outdated provider limits.

## 6. Architecture Boundaries

Keep responsibilities separate.

### Frontend

-   React manages application screens, forms, menus and UI.
-   Phaser manages the rendered 2D game world, keyboard input, camera
    and sprite presentation.
-   Keep React/Phaser communication behind a small explicit integration
    layer.

### Multiplayer

-   Colyseus manages live world sessions and synchronized game state.
-   One active world maps to one shared multiplayer room.
-   All five areas exist within that same world instance.
-   The server owns authoritative player state and validates movement.

### Voice

-   LiveKit/WebRTC transports audio.
-   The trusted backend/game server determines eligibility.
-   LiveKit/SFU enforces participant permissions and subscriptions.
-   Do not route audio through game-state messages.

### Persistence

-   PostgreSQL stores durable account/profile metadata, world metadata,
    invitation records and lifecycle state.
-   Do not write high-frequency movement coordinates to PostgreSQL.
-   Live player positions belong in live game-server state.

Do not create microservices or extra infrastructure without a concrete
requirement and approval.

## 7. Security Requirements

Security is part of implementation, not a later optional improvement.

-   Validate authentication tokens on trusted backend services.
-   Derive user identity from verified credentials, not arbitrary
    client-supplied IDs.
-   Enforce world membership and ownership server-side.
-   Enforce capacity server-side.
-   Enforce one active session per account server-side.
-   Validate invitation credentials server-side.
-   Use cryptographically secure invitation secrets.
-   Avoid exposing raw invitation secrets in logs.
-   Keep database credentials, Supabase service-role keys and LiveKit
    API secrets on the server.
-   Never place server secrets in frontend bundles or `VITE_` variables.
-   Use short-lived, appropriately scoped voice tokens.
-   Validate client messages and impose sensible size/rate limits.
-   Never trust client-supplied coordinates as authoritative position.
-   Never trust client-supplied room IDs as authoritative voice-zone
    membership.
-   Ensure voice subscriptions are revoked when eligibility ends.
-   Avoid logging tokens, secrets or sensitive credentials.
-   Use least-privilege access.
-   Use database constraints and transactions for critical
    ownership/session/lifecycle rules where appropriate.

If a requested implementation appears to weaken these requirements, stop
and explain the risk.

## 8. Code Quality Standards

### 8.1 General

-   Use TypeScript for frontend and backend code.
-   Prefer clear, descriptive names.
-   Keep functions and modules focused.
-   Avoid unnecessary abstraction.
-   Avoid duplicated business rules.
-   Prefer explicit types over `any`.
-   Handle errors deliberately.
-   Remove dead code and unused dependencies.
-   Do not leave debugging statements in committed code.
-   Do not suppress TypeScript, lint or test errors merely to make
    checks pass.

### 8.2 Shared contracts

-   Keep shared types and schemas in the approved shared package.
-   Share data contracts and pure utilities, not server implementation
    details.
-   Validate untrusted network input at runtime.
-   Keep authentication tokens and secrets out of synchronized player
    state.

### 8.3 Dependencies

Before adding a dependency: - Check whether an existing dependency
already solves the problem. - Explain why the new dependency is
needed. - Check maintenance, compatibility and license considerations. -
Avoid adding a large library for a small utility. - Do not install
packages without authorization for the active milestone.

### 8.4 Configuration and secrets

-   Provide `.env.example` with variable names and safe placeholders.
-   Never commit `.env` files or credentials.
-   Use browser-prefixed environment variables only for values intended
    to be public.
-   Document required environment variables.
-   Do not paste real secrets into source files, logs or reports.

## 9. Map and Asset Rules

During the visual-first milestone:

-   Start with the map layout and SVG previews.
-   Present the map for owner review before producing a large asset set.
-   Do not start movement implementation before map and avatar direction
    are approved.
-   Preserve the five connected areas.
-   Keep the 32 × 32 logical tile grid.
-   Keep visual artwork separate from collision geometry and logical
    room-zone geometry.
-   Keep spawn points explicit and walkable.
-   Avoid furniture blocking intended paths.
-   Make room entrances and corridors clear.
-   Design the map for a variable population from 1 to 20 users.
-   Do not generate final production assets before the visual direction
    is approved.

SVG is the initial design/iteration format. The final runtime map format
should follow the approved architecture and asset pipeline.

## 10. Multiplayer and Movement Rules

-   The server is authoritative for world membership, position
    validation, collision constraints, room-zone membership, capacity
    and voice eligibility.
-   The client may use prediction for responsive local movement, but the
    server corrects invalid state.
-   Normalize diagonal input.
-   Use delta time for movement.
-   Avoid sending unchanged state unnecessarily.
-   Keep network messages compact.
-   Handle disconnects and reconnects.
-   Remove stale player entities.
-   Do not allow arbitrary client coordinate updates to teleport
    players.
-   Test concurrent joins at the capacity boundary.
-   Test that a departing player frees capacity.
-   A world remains usable with one participant.

Do not invent network tick rates or performance claims. Propose values,
measure them and report the results.

## 11. Voice Rules and Required Test Cases

Voice authorization is a high-priority privacy boundary.

Eligibility must consider: - Same world. - Same logical voice zone. -
Center-to-center Euclidean distance no greater than 160 pixels. - Sender
mute/transmit state. - Receiver subscription permission. - Focus Room
rules.

At minimum, test:

1.  Same room, within range: eligible users can hear each other.
2.  Same room, outside range: users cannot hear each other.
3.  Different rooms, close coordinates: users cannot hear each other.
4.  Crossing a room boundary: old-room subscription is revoked
    immediately.
5.  Moving out of range: subscription is revoked immediately.
6.  Focus Room initial state: transmission disabled.
7.  Focus Room toggle on: transmission enabled only when other rules
    pass.
8.  Focus Room toggle off: transmission disabled.
9.  Leaving the world: voice access is revoked.
10. Newer session replaces older session: older session loses voice
    access.

Never treat client-side muting or track hiding as the only authorization
mechanism.

## 12. Database and Lifecycle Rules

-   Use migrations for schema changes.
-   Keep migrations in version control.
-   Store timestamps in UTC.
-   Do not store live movement updates in PostgreSQL.
-   Use database constraints and transactions for critical invariants.
-   Protect one-active-world-per-owner.
-   Protect the 10-minute grace lifecycle.
-   Ensure cleanup is idempotent and safe to retry.
-   Re-check world occupancy and lifecycle status immediately before
    deletion.
-   Handle joins racing with cleanup.
-   Handle backend restarts during the grace period.
-   Do not use an in-memory timeout as the only cleanup mechanism.

Before changing a schema: 1. Explain the change. 2. Identify data
migration impact. 3. Identify affected services and tests. 4. Obtain
approval if the change affects approved design or existing data.

## 13. Testing and Verification

Run the checks appropriate to the active milestone.

Expected tools: - Vitest for unit and service tests. - Playwright for
browser flows. - TypeScript type checking. - ESLint. - Prettier. -
Project build. - Manual browser verification.

Do not claim a test passed unless it was actually run and the result was
observed.

For every milestone: - Add tests for new behavior. - Run relevant
existing tests to detect regressions. - Report exact commands and
results. - Report skipped tests and why. - Inspect the browser result
for visual/gameplay work. - Capture screenshots or a short demonstration
when useful and available.

A successful build is not proof that the feature works correctly.

## 14. Git Workflow

-   Use Git from the beginning of repository implementation.
-   Keep `main` stable.
-   Use a focused branch for each milestone or feature.
-   Make small, meaningful commits.
-   Do not commit secrets, local credentials, generated tokens or
    private data.
-   Review diffs before committing.
-   Do not merge or tag a milestone as approved without owner approval.

Suggested branch names: - `feature/static-world-map` -
`feature/player-movement` - `feature/multiplayer-sync` -
`feature/private-worlds` - `feature/proximity-voice`

Suggested commit messages: - `feat: render approved world map` -
`feat: implement keyboard movement` - `fix: resolve doorway collision` -
`test: cover world capacity boundary`

## 15. Required Planning Response Before Each Implementation Task

Before modifying files, provide:

``` text
IMPLEMENTATION PLAN

Milestone:
Task:
Objective:

1. Requirements being addressed
2. Current repository state
3. Files expected to be created
4. Files expected to be modified
5. Implementation steps
6. Dependencies
7. Risks and edge cases
8. Tests to add or run
9. Browser/manual verification
10. Acceptance criteria
11. Out-of-scope items
12. Approval requested
```

Wait for explicit approval before making changes.

## 16. Required Completion Report

After implementation and verification, provide:

``` text
MILESTONE / TASK COMPLETION REPORT

Milestone:
Task:
Status: Complete / Partially complete / Blocked

1. Summary
2. Features implemented
3. Files created
4. Files modified
5. Tests added
6. Commands executed
7. Test results
8. Build/type/lint results
9. Browser/manual verification
10. Screenshots or demo evidence, if available
11. Known issues
12. Deviations from approved plan
13. Security and performance notes
14. Suggested next step
15. Owner approval requested
```

Be honest about failures, skipped checks and incomplete work. Never
claim completion prematurely.

## 17. Handling Uncertainty and Conflicts

When requirements are unclear: - Ask one focused question if the answer
is necessary to proceed. - Otherwise, present a clearly labeled
recommendation and wait for approval when it affects scope or
architecture.

When documents conflict: - Do not choose one silently. - Quote or
identify the conflicting requirements. - Explain the impact. - Recommend
a resolution. - Wait for the owner.

When you discover a better technical approach: - Explain the problem
with the current approach. - Present alternatives and trade-offs. -
Identify migration or rework impact. - Do not implement the change until
approved.

When blocked: - Stop the affected work. - Report the blocker and
evidence. - Suggest the smallest practical resolution. - Do not make
unrelated changes to appear productive.

## 18. Scope Control

Do not add features merely because they are easy or interesting.

Unless explicitly approved, do not add: - Public world discovery. -
Public rooms. - Text chat or messaging. - Screen sharing or video
calling. - Recording. - Advanced avatar customization. - Avatar
marketplace. - Economy, inventory or quests. - Mobile-specific movement
controls. - Admin moderation features beyond the approved V1 scope. -
New paid services. - Unapproved third-party analytics or tracking.

Keep V1 focused on the private shared world, movement, multiplayer
presence and secure proximity voice.

## 19. Definition of Done

A task is complete only when: - It matches the approved requirements and
scope. - It follows the approved architecture. - Code is readable and
maintainable. - Relevant automated tests pass. - Type checking, linting
and build checks pass where configured. - Browser behavior has been
verified where applicable. - No known critical defect remains. -
Documentation is updated. - No secrets are committed. - The completion
report is provided. - The project owner approves the result.

A code-generation result, successful compilation or agent assertion is
not sufficient on its own.

## 20. Final Instruction

**The project owner is the final decision-maker.**

Your default behavior must be:

**Inspect → Understand → Plan → Request approval → Implement narrowly →
Test → Demonstrate → Report → Wait.**

Never skip approval gates. Never silently change approved decisions.
Never begin the next milestone without explicit owner approval.
