# Development Plan --- Private Pixel-Art Social World

**Document:** `DEVELOPMENT_PLAN.md`\
**Version:** 1.0 --- Approved development plan\
**Status:** Approved (aligned with `DECISIONS.md`)\
**Product:** Private, invite-only, browser-based 2D multiplayer social
world\
**Depends on:** `PROJECT_CONTEXT.md`, `SRS.md`, `PRD.md`,
`DECISIONS.md`, `ARCHITECTURE.md`, `GAME_DESIGN.md`

------------------------------------------------------------------------

## 1. Purpose

This document defines how the project should be implemented in small,
reviewable milestones. It is designed for a developer or AI coding agent
(Google Antigravity) to follow without attempting to build the entire
application in one step.

The development approach is deliberately incremental:

1.  Plan one milestone.
2.  Review and approve its implementation plan.
3.  Implement only that milestone.
4.  Run its required tests.
5.  Inspect the result in a real browser.
6.  Fix issues and refine the experience.
7.  Demonstrate the milestone.
8.  Obtain owner approval before moving forward.
9.  Commit the approved work to Git.

**This document is a proposed execution plan. It is not permission to
begin implementation.** First, Antigravity must review it together with
the other project documents. The project owner must approve the plan and
the persistent agent instructions before implementation starts.

## 2. Project Goals

Build a polished, browser-based, invite-only 2D multiplayer social world
with five connected areas:

-   Town Hall / Community Hall.
-   Coding Room.
-   Learning Room.
-   Chill Room.
-   Focus Room.

Users should be able to authenticate, create a private world, invite
others, choose a predefined avatar, walk around the connected map, see
other participants and communicate through proximity-based voice where
permitted.

### 2.1 Confirmed capacity requirement

A world supports **up to 20 concurrent connected users**.

This means: - A world may contain 1 user. - It may contain any number
from 1 through 20. - 20 is the maximum capacity, not a required number
of participants. - A 21st user must be rejected while 20 users are
connected. - The limit applies to the entire world across all five
areas, not separately to each area.

### 2.2 Approved technical/game decisions

The development plan must preserve these decisions:

  -----------------------------------------------------------------------
  Decision                            Requirement
  ----------------------------------- -----------------------------------
  Tile size                           32 × 32 logical pixels

  Voice proximity                     Initially 160 world pixels,
                                      center-to-center Euclidean distance

  Account sessions                    One active session per account;
                                      newest session replaces previous

  Focus Room voice                    Toggle-to-Talk, disabled by default

  World ownership                     One active world per creator,
                                      including grace-period worlds

  Voice authorization                 Server determines eligibility;
                                      voice service/SFU enforces
                                      permissions

  Empty-world lifecycle               PostgreSQL timestamps and durable
                                      cleanup processing

  World capacity                      Up to 20 concurrent users per world
  -----------------------------------------------------------------------

Do not change these decisions without explicit owner approval.

## 3. Development Principles

### 3.1 One milestone at a time

Do not ask the coding agent to build the complete application in one
prompt. Each milestone must have: - A clear scope. - Explicit tasks. -
Acceptance criteria. - Tests. - A browser demonstration where
applicable. - Known limitations. - A completion report.

### 3.2 Visual-first development

The project owner wants to see and approve the map before implementing
character movement.

The initial sequence must therefore be:

1.  Design and refine the static map.
2.  Create and approve character/avatar assets.
3.  Add one playable character and movement.
4.  Test movement and collision.
5.  Add multiplayer synchronization.
6.  Add authentication and world management as required for secure
    end-to-end use.
7.  Add voice.
8.  Harden and deploy.

Antigravity may recommend moving foundational setup tasks earlier where
technically necessary, but must explain why and must not skip the visual
approval gate.

### 3.3 Test before progressing

A milestone is not complete just because code has been generated or a
development server starts.

Each milestone must be tested against its acceptance criteria. The owner
should be able to inspect a working demonstration before approving the
next milestone.

### 3.4 Avoid premature complexity

-   Do not introduce microservices for V1.
-   Do not add Redis, Kafka, Kubernetes or additional databases without
    a concrete requirement.
-   Do not add unrelated features.
-   Do not optimize prematurely without evidence.
-   Do not replace approved technologies without explaining the reason
    and obtaining approval.

### 3.5 Keep documentation current

When an approved implementation decision changes: - Update the relevant
document. - Record the reason. - Identify affected milestones. - Ask the
owner to approve scope or architecture changes.

## 4. Proposed Project Milestones

The milestones below are a recommended plan. Antigravity should review
dependencies and suggest adjustments before approval.

```{=html}
<details>
```
```{=html}
<summary>
```
Milestone overview
```{=html}
</summary>
```
  -----------------------------------------------------------------------
  Milestone               Name                    Main outcome
  ----------------------- ----------------------- -----------------------
  M0                      Planning and project    All documents, tools
                          readiness               and implementation
                                                  gates approved

  M1                      Static world map and    Approved connected map
                          visual assets           and initial avatar
                                                  assets

  M2                      Single-player game      One avatar moves
                          foundation              smoothly through the
                                                  map

  M3                      Multiplayer             Multiple players see
                          synchronization         one another in real
                                                  time

  M4                      Authentication and      Users create worlds and
                          private worlds          join through
                                                  invitations

  M5                      Voice communication     Secure room-aware
                                                  proximity voice

  M6                      Hardening and           Tested demo with
                          deployment              documented limitations
  -----------------------------------------------------------------------

```{=html}
</details>
```

------------------------------------------------------------------------

## 5. M0 --- Planning and Project Readiness

**Status:** Must be completed before implementation.

### Objectives

-   Ensure all product and technical requirements are consistent.
-   Obtain Antigravity's reviews.
-   Resolve open decisions.
-   Approve the implementation plan.
-   Establish the agent's persistent instructions.

### Tasks

1.  Review `PROJECT_CONTEXT.md`.
2.  Review `SRS.md`.
3.  Review `PRD.md`.
4.  Review `DECISIONS.md`.
5.  Review `ARCHITECTURE.md`.
6.  Review `GAME_DESIGN.md`.
7.  Review this `DEVELOPMENT_PLAN.md`.
8.  Resolve conflicts and open decisions with the owner.
9.  Prepare `AGENTS.md`.
10. Agree on repository structure, coding conventions, Git workflow and
    test expectations.

### Deliverables

-   Approved project documents.
-   Approved architecture and game design.
-   Approved development plan.
-   `AGENTS.md`.
-   A concise list of implementation assumptions and deferred features.

### Acceptance criteria

-   [ ] All required documents have been reviewed.
-   [ ] No unresolved critical conflict remains.
-   [ ] The seven architecture decisions remain intact.
-   [ ] The up-to-20-user capacity requirement is explicit.
-   [ ] Milestone scope and approval gates are understood.
-   [ ] The owner explicitly approves implementation readiness.

**Gate:** No repository initialization or application implementation
before owner approval.

## 6. M1 --- Static World Map and Visual Assets

`<badge>`{=html}Visual-first milestone`</badge>`{=html}

### Objective

Create the complete static world map and initial character assets. The
owner must approve the map before movement is implemented.

### Phase 1A --- Map layout concept

Tasks: 1. Propose exact map dimensions in 32-pixel tiles. 2. Propose
room dimensions and proportions. 3. Place Town Hall centrally as the
main hub. 4. Position Coding, Learning, Chill and Focus areas. 5. Draw
corridors, doorways and walkable connections. 6. Define the spawn
region. 7. Ensure there is sufficient open space for a population of up
to 20 users. 8. Produce an SVG map preview.

Deliverable: `world-layout-v1.svg` or an equivalent clearly reviewable
SVG.

Review with the owner: - Overall layout. - Room positions and
proportions. - Walkable continuity. - Doorway and corridor widths. -
Spawn location. - Navigation clarity.

Do not continue to detailed decoration until the owner approves the
layout.

### Phase 1B --- Room styling

Tasks: 1. Establish the common pixel-art visual language. 2. Define
exact palette colors. 3. Style Town Hall. 4. Style Coding Room. 5. Style
Learning Room. 6. Style Chill Room. 7. Style Focus Room. 8. Add
furniture, wall details, floor patterns and decorations. 9. Preserve
clear walking paths.

Deliverable: refined static SVG map.

### Phase 1C --- Avatar and environment assets

Tasks: 1. Propose a manageable set of predefined avatars. 2. Propose
sprite dimensions and frame layout. 3. Create directional idle and
walking animation assets. 4. Create tiles and furniture assets. 5.
Ensure visual scale consistency. 6. Present an asset preview/sprite
sheet for owner review.

Initial character animation requirements: - Idle: up, down, left,
right. - Walk: up, down, left, right.

Sitting and extra emotes may be deferred.

### Phase 1D --- Runtime map preparation

Only after visual approval: 1. Convert the approved visual design into
runtime-ready assets. 2. Create the Tiled map. 3. Separate visual,
collision, spawn and room-zone layers. 4. Define logical zone geometry.
5. Export map data and tilesets for Phaser. 6. Verify that the exported
map matches the approved design.

### Deliverables

-   Approved SVG map.
-   Palette reference.
-   Initial avatar spritesheets.
-   Environment tiles and furniture assets.
-   Runtime map data.
-   Collision and room-zone object layers.
-   Asset naming and source files.

### Acceptance criteria

-   [ ] All five areas are present.
-   [ ] All areas are connected and walkable.
-   [ ] Town Hall is the central social hub and spawn area.
-   [ ] The map can support up to 20 users without requiring exactly 20.
-   [ ] Tile dimensions follow the approved 32 × 32 grid.
-   [ ] Room identities are visually distinct.
-   [ ] Furniture does not obstruct intended paths.
-   [ ] Avatar scale is consistent with the environment.
-   [ ] Required directional idle/walk assets are available.
-   [ ] Collision and logical zone data are separated from decoration.
-   [ ] The owner approves the static map and asset direction.

**Gate:** Do not start character movement until the owner approves the
map and initial avatar direction.

## 7. M2 --- Single-Player Game Foundation

### Objective

Load the approved map into Phaser and implement a smooth single-player
experience with one controllable avatar.

### Tasks

1.  Create the approved frontend/game project structure.
2.  Load the map and tilesets in Phaser.
3.  Render the complete map.
4.  Render one local avatar.
5.  Implement WASD controls.
6.  Implement arrow-key controls.
7.  Normalize diagonal movement.
8.  Use delta-time-based movement.
9.  Implement idle and directional walking animations.
10. Implement collision with walls and blocking furniture.
11. Implement camera follow and map-boundary clamping.
12. Add a simple room-name indicator if approved.
13. Add a basic leave/exit UI shell if required for testing.
14. Test different desktop viewport sizes.
15. Profile and refine rendering and movement.

### Movement expectations

-   Responsive keyboard input.
-   No faster diagonal movement.
-   No movement through walls.
-   No frame-rate-dependent speed.
-   No unintended movement when typing into UI inputs.
-   Correct idle direction after movement stops.
-   Smooth camera behavior.

### Deliverables

-   A browser-playable single-player map.
-   Working keyboard controls.
-   Collision and camera behavior.
-   Directional avatar animations.
-   Test report and known limitations.

### Acceptance criteria

-   [ ] Map renders correctly in the browser.
-   [ ] Avatar appears at a valid Town Hall spawn point.
-   [ ] WASD works.
-   [ ] Arrow keys work.
-   [ ] Diagonal speed is normalized.
-   [ ] Avatar cannot cross blocking walls or furniture.
-   [ ] Avatar can pass through all intended entrances.
-   [ ] Camera remains inside map boundaries.
-   [ ] Idle and walking animations match movement direction.
-   [ ] No major visual jitter or movement stutter under normal testing.
-   [ ] Owner approves the single-player movement experience.

**Gate:** Do not begin multiplayer until single-player movement and
collision are approved.

## 8. M3 --- Multiplayer Synchronization

### Objective

Allow multiple browser clients to enter the same world and see one
another moving in real time.

> **M3 Test Harness Scope:** Because authentication and private world creation are implemented in M4, M3 uses a **temporary unauthenticated local/test Colyseus room** (`test-world`) with mock client identifiers to validate 1–20 player synchronization, collision, and capacity enforcement in isolation. M4 retrofits Supabase JWT verification, invitation validation, and ADR-03 session replacement onto Colyseus `onAuth`/`onJoin`.

### Dependencies

-   M2 approved.
-   Colyseus version and hosting approach validated.
-   Shared player-state contracts reviewed.

### Tasks

1.  Add the Colyseus game server.
2.  Create one game room per world instance.
3.  Connect the browser client to the game server.
4.  Implement player join and leave.
5.  Assign unique session/player identifiers.
6.  Synchronize player positions and directions.
7.  Synchronize animation state.
8.  Implement server-authoritative movement validation.
9.  Add client-side prediction only where justified.
10. Add interpolation for remote players.
11. Enforce map bounds and collision on the server.
12. Enforce a maximum of 20 connected users across the world.
13. Reject the 21st connection while 20 users are present.
14. Handle disconnect and reconnect.
15. Remove stale player entities.
16. Test with multiple browser contexts and separate devices if
    available.

### Important capacity behavior

The room must allow any population from 1 to 20. Do not wait for 20
users before creating or starting a world. A world is usable with a
single participant.

Capacity is checked by the authoritative server. A client-side count is
not sufficient.

### Deliverables

-   Multiple users can join the same world.
-   Players see each other's position and movement.
-   Player join/leave state is consistent.
-   Server-enforced capacity.
-   Reconnect behavior.
-   Multiplayer test report.

### Acceptance criteria

-   [ ] Two users can join the same world.
-   [ ] Each sees the other avatar.
-   [ ] Movement updates are synchronized.
-   [ ] Direction and animation states are synchronized.
-   [ ] A player leaving is removed from other clients.
-   [ ] A reconnect does not create duplicate player entities.
-   [ ] One world supports 1--20 users.
-   [ ] A 21st user is rejected when 20 are connected.
-   [ ] Capacity becomes available when a participant leaves.
-   [ ] Client-supplied arbitrary coordinates cannot teleport a player.
-   [ ] The owner approves multiplayer behavior.

**Gate:** Do not integrate voice until multiplayer presence and movement
are stable.

## 9. M4 --- Authentication and Private World Management

### Objective

Implement secure user access, private world creation, invitations,
ownership and durable world lifecycle.

This milestone may be moved earlier in the implementation sequence if
authenticated identities are needed for secure multiplayer testing. If
moved, Antigravity must explain the dependency and obtain owner approval
for the revised order.

### Tasks

#### 4A --- Authentication

1.  Integrate Supabase Auth.
2.  Implement registration.
3.  Implement login.
4.  Implement logout.
5.  Validate access tokens on trusted backend services.
6.  Handle expired or invalid sessions.

#### 4B --- Account session uniqueness

1.  Implement one active session per account.
2.  Make the newest session replace the previous one.
3.  Enforce the policy server-side.
4.  Disconnect the old game session.
5.  Revoke the old session's voice access.
6.  Test simultaneous login/session replacement races.

#### 4C --- World management

1.  Implement world creation.
2.  Make the creator the world owner/admin.
3.  Enforce one active world per creator.
4.  Treat an empty world in its grace period as active.
5.  Store world metadata in PostgreSQL.
6.  Create private hashed invitation credentials (`secret_hash` stored in DB; raw token displayed once).
7.  Implement invite-link/room-code joining and creator revoke/regenerate actions (`DEC-09`).
8.  Validate invitations on the server.
9.  Enforce world access and capacity.
10. Handle invalid or revoked invitations with rate limiting and generic errors.

#### 4D --- World lifecycle

1.  Detect when the last participant leaves.
2.  Set `empty_since`.
3.  Set `delete_after` to 10 minutes after the empty timestamp.
4.  Allow a return during grace period to cancel deletion.
5.  Implement durable cleanup processing (periodic worker, startup sweep, and lazy on-demand expiration during world creation/join/lookup).
6.  Re-check occupancy and lifecycle state before deletion.
7.  Handle cleanup retries and server restarts.
8.  Delete or invalidate invitation records consistently.

### Deliverables

-   Working registration/login.
-   Private world creation.
-   Invite-link/code join flow.
-   One-world-per-creator enforcement.
-   Newest-session-wins enforcement.
-   Durable 10-minute world lifecycle.
-   Database migrations and tests.

### Acceptance criteria

-   [ ] Unauthenticated users cannot enter a private world.
-   [ ] A registered user can create a world.
-   [ ] The creator is the owner/admin.
-   [ ] A valid invitation allows another user to join.
-   [ ] Invalid invitations are rejected.
-   [ ] A creator cannot create a second active/grace-period world.
-   [ ] A world can be used with 1--20 connected users.
-   [ ] A newer account session replaces the older one.
-   [ ] An empty world enters the 10-minute grace period.
-   [ ] A user returning during grace cancels deletion.
-   [ ] An eligible world is deleted after the grace deadline.
-   [ ] Lifecycle remains correct after a backend restart.
-   [ ] Cleanup cannot delete a world that has been rejoined.
-   [ ] Owner approves world-management behavior.

## 10. M5 --- Voice Communication

### Objective

Integrate proximity-based voice with strict room separation and
server-enforced authorization.

### Dependencies

-   Multiplayer state and player identity are stable.
-   Logical room-zone geometry is approved.
-   LiveKit integration and current plan limits are validated.

### Tasks

#### 5A --- Basic voice connection

1.  Create a trusted backend path for LiveKit token generation.
2.  Keep LiveKit API secrets on the server.
3.  Connect authenticated users to the appropriate voice room/session.
4.  Implement microphone permission handling.
5.  Implement mute/unmute.
6.  Show voice connection status.
7.  Handle microphone and network failures.

#### 5B --- Voice zones and proximity

1.  Determine each player's logical room zone on the server.
2.  Calculate center-to-center distance.
3.  Apply the approved 160-pixel radius.
4.  Require same-world membership.
5.  Require same logical room/zone.
6.  Compute eligible audio relationships.
7.  Grant eligible subscriptions.
8.  Revoke subscriptions immediately when eligibility ends.
9.  Ensure LiveKit/SFU enforces permissions.
10. Optimize relationship recalculation without changing approved
    behavior.

#### 5C --- Focus Room

1.  Keep Focus Room transmission disabled by default.
2.  Implement Toggle-to-Talk.
3.  Clicking enables transmission.
4.  Clicking again disables transmission.
5.  Keep room and proximity rules active.
6.  Disable/revoke transmission appropriately when leaving Focus Room.
7.  Verify that Focus Room cannot communicate across other room
    boundaries.

#### 5D --- Voice UI and testing

1.  Add clear mute/unmute controls.
2.  Add Focus Room toggle in the appropriate context.
3.  Add microphone permission/error feedback.
4.  Add optional speaking indicator if approved.
5.  Test all room and distance combinations.
6.  Test disconnect, reconnect and session replacement.

### Voice eligibility rule

Two participants may communicate only if all required conditions are
met:

-   They are in the same world.
-   They are in the same logical voice zone.
-   Their center-to-center distance is no more than 160 world pixels.
-   The sender is permitted to transmit and is not muted.
-   The receiver is permitted to subscribe.
-   Focus Room-specific transmission rules are satisfied.

### Deliverables

-   LiveKit integration.
-   Server-side voice eligibility service.
-   SFU-enforced publish/subscribe permissions.
-   Mute/unmute.
-   Focus Room Toggle-to-Talk.
-   Voice test report.

### Acceptance criteria

-   [ ] Users can connect to voice after granting microphone permission.
-   [ ] Mute/unmute works.
-   [ ] Users in different rooms cannot hear each other.
-   [ ] Users in the same room but outside 160 pixels cannot hear each
    other.
-   [ ] Eligible users in the same room and within 160 pixels can hear
    each other.
-   [ ] Focus Room transmission is disabled by default.
-   [ ] Toggle-to-Talk enables and disables Focus Room transmission.
-   [ ] Toggle-to-Talk cannot bypass proximity or room restrictions.
-   [ ] Moving out of range revokes the relevant subscription
    immediately.
-   [ ] Moving into another room revokes the previous-room subscription
    immediately.
-   [ ] Leaving the world revokes voice access.
-   [ ] Replaced sessions lose voice access.
-   [ ] Client-side filtering is not the only authorization mechanism.
-   [ ] Owner approves voice behavior.

**Gate:** Do not declare voice complete until cross-room leakage and
boundary tests pass.

## 11. M6 --- Hardening, QA and Deployment

### Objective

Prepare a reliable demo deployment and document limitations.

### Tasks

#### 6A --- End-to-end testing

Test the complete flow:

1.  Register.
2.  Log in.
3.  Create a private world.
4.  Copy/share invite link or code.
5.  Join from another account/browser.
6.  Select avatar.
7.  Spawn in Town Hall.
8.  Walk through all five areas.
9.  See other players move.
10. Test mute and proximity voice.
11. Test Focus Room Toggle-to-Talk.
12. Leave the world.
13. Test empty-world grace period.
14. Rejoin during grace.
15. Test deletion after grace expiry.
16. Test newest-session-wins.

#### 6B --- Load and performance testing

-   Test one user.
-   Test a small group.
-   Test the maximum of 20 concurrent users.
-   Test movement and voice together.
-   Measure CPU, memory, network and browser performance.
-   Identify server bottlenecks.
-   Verify that capacity enforcement remains correct under simultaneous
    joins.

Do not claim 20-user readiness based only on a test with two browser
tabs.

#### 6C --- Security testing

-   Test invalid and expired tokens.
-   Test invalid invitation codes.
-   Test unauthorized world access.
-   Test session replacement.
-   Test voice subscription revocation.
-   Test client attempts to spoof position or zone.
-   Verify that secrets are not exposed in frontend bundles or logs.

#### 6D --- Deployment

1.  Verify current provider capabilities and pricing.
2.  Configure production environment variables.
3.  Deploy frontend.
4.  Deploy game server.
5.  Configure database and migrations.
6.  Configure LiveKit.
7.  Configure allowed origins and secure connections.
8.  Run end-to-end smoke tests.
9.  Document sleep/restart limitations of free hosting.
10. Document rollback and recovery steps.

### Deliverables

-   Tested demo deployment.
-   End-to-end test report.
-   Performance test report.
-   Security checklist.
-   Deployment/setup documentation.
-   Known limitations and future improvements.

### Acceptance criteria

-   [ ] Main user journey works end to end.
-   [ ] 1--20 concurrent-user behavior is validated.
-   [ ] Voice rules pass cross-room and proximity tests.
-   [ ] No known critical security issue remains.
-   [ ] World lifecycle works after restart.
-   [ ] Deployment can be reproduced from documentation.
-   [ ] Secrets are configured safely.
-   [ ] Free-tier constraints and costs are documented.
-   [ ] Owner approves the demo release.

------------------------------------------------------------------------

## 12. Testing Strategy Across Milestones

Every milestone must include relevant tests. Testing is continuous, not
a final activity.

  -----------------------------------------------------------------------
  Test type               When                    Purpose
  ----------------------- ----------------------- -----------------------
  Unit tests              Every milestone         Validate pure logic and
                                                  calculations

  Integration tests       M3 onward               Validate services and
                                                  database interactions

  Browser tests           M1 onward               Validate actual user
                                                  experience

  Multiplayer tests       M3 onward               Validate multiple
                                                  connected clients (including Playwright multi-context tests in M3 & M5)

  Voice tests             M5 onward               Validate proximity and
                                                  authorization

  Security tests          M4 onward               Validate identity,
                                                  invitation and
                                                  permission boundaries

  Load tests              M6                      Validate maximum
                                                  supported population

  Manual playtests        Every visual/gameplay   Evaluate feel, clarity
                          milestone               and usability
  -----------------------------------------------------------------------

### 12.1 Required automated test areas

-   Diagonal movement normalization.
-   Map bounds and collision.
-   Room-zone determination.
-   160-pixel proximity.
-   Same-room voice eligibility.
-   Focus Room Toggle-to-Talk.
-   World capacity 1--20.
-   Rejection of the 21st user when 20 are connected.
-   One active world per creator.
-   One active account session.
-   Invitation validation.
-   Grace-period cancellation.
-   Durable cleanup and retry safety.

## 13. Git and Version-Control Workflow

Use Git from the beginning of repository implementation.

### 13.1 Branching

Recommended simple workflow:

-   `main` --- stable, approved milestones.
-   `feature/<short-name>` --- one feature or milestone task.
-   Optional `fix/<short-name>` --- isolated bug fixes.

Avoid a complicated GitFlow process for a small V1 project.

### 13.2 Commit practices

-   Commit after a meaningful, tested unit of work.
-   Use descriptive commit messages.
-   Do not commit secrets, `.env` files, generated credentials or local
    database dumps.
-   Keep the project buildable at approved milestone boundaries.
-   Tag major milestones if useful.

Example commit messages:

``` text
chore: initialize approved project structure
feat: add static world map rendering
feat: implement player keyboard movement
feat: add collision handling
feat: synchronize player movement with Colyseus
feat: add private world invitations
feat: integrate proximity voice permissions
test: add 20-player capacity coverage
```

### 13.3 Milestone approval

Before merging a milestone into `main`: 1. Run required tests. 2. Review
the diff. 3. Inspect the browser result. 4. Fix critical issues. 5.
Present a completion report. 6. Obtain owner approval.

## 14. Antigravity Execution Protocol

Antigravity is the primary coding agent. It should work as a careful
engineering partner, not as an autonomous agent that decides to build
everything.

For each milestone:

### Step 1 --- Inspect

Read the relevant project documents and current repository state.

### Step 2 --- Plan

Return: - Understanding of the milestone. - Files expected to be created
or changed. - Implementation steps. - Dependencies. - Risks. - Tests. -
Acceptance criteria.

Do not change files yet.

### Step 3 --- Wait for approval

The owner reviews the plan and explicitly authorizes implementation.

### Step 4 --- Implement only the approved scope

-   Do not add unrelated features.
-   Do not skip ahead to later milestones.
-   Do not silently change architecture.
-   Keep code readable and modular.
-   Add tests with the feature.
-   Keep documentation updated.

### Step 5 --- Verify

Run tests, linting, type checking and build checks that are configured
for the project. Open the app in a browser and test the actual behavior.

### Step 6 --- Report

Provide: - What was implemented. - Files created/changed. - Tests
executed and their results. - Browser verification performed. - Known
issues. - Deviations from the approved plan. - Suggested next milestone.

### Step 7 --- Wait

Do not start the next milestone until the owner approves the current
one.

## 15. Definition of Done

A task or milestone is done only when:

-   Implementation matches approved scope.
-   Code is readable and reasonably modular.
-   Relevant tests pass.
-   Type checking and build succeed where configured.
-   Browser behavior has been verified where applicable.
-   No known critical defect remains.
-   Documentation is updated.
-   No secrets are committed.
-   The owner has reviewed the demonstration and approved the milestone.

A generated code file, a successful build or an agent's claim of
completion is not by itself sufficient.

## 16. Scope and Change Control

If Antigravity discovers a requirement that conflicts with the
architecture or game design:

1.  Stop work on the affected part.
2.  Explain the conflict.
3.  Describe the options and trade-offs.
4.  Identify affected documents and milestones.
5.  Recommend one approach.
6.  Wait for owner approval.
7.  Update the relevant decision/document before implementation.

Do not silently: - Replace Colyseus or LiveKit. - Change the 32-pixel
tile size. - Change the 160-pixel proximity radius. - Change the 20-user
maximum. - Allow cross-room voice. - Remove the 10-minute grace
period. - Change newest-session-wins behavior. - Add paid services.

## 17. Risks and Mitigation Plan

  -----------------------------------------------------------------------
  Risk                    Impact                  Mitigation
  ----------------------- ----------------------- -----------------------
  Map design changes late Rework to collision,    Approve layout and
                          zones and assets        visual design before
                                                  movement

  Movement feels poor     Core experience suffers Test and tune
                                                  single-player movement
                                                  before multiplayer

  Multiplayer jitter      Users see inconsistent  Authoritative server
                          positions               state, interpolation
                                                  and measured tuning

  Free host sleeps        Reconnects and downtime Validate provider
                                                  behavior; document demo
                                                  limitations

  Voice permissions are   Privacy and trust issue Server eligibility plus
  incorrect                                       SFU enforcement;
                                                  boundary tests

  20-user load not tested Capacity claim is       Test with a controlled
                          unreliable              multi-client load setup

  Session replacement     Duplicate account       Atomic server-side
  race                    sessions                session policy

  Cleanup race            Active world may be     Durable timestamps and
                          deleted                 transactional re-check

  Scope creep             Delayed delivery        Strict milestone scope
                                                  and owner approval

  AI agent changes too    Hard-to-review code     Small plans, narrow
  much at once                                    changes and milestone
                                                  gates
  -----------------------------------------------------------------------

## 18. Proposed Milestone Completion Report Format

Antigravity should use this structure after each milestone:

``` text
MILESTONE COMPLETION REPORT

Milestone:
Status: Complete / Partially complete / Blocked

1. Summary
2. Implemented features
3. Files created or modified
4. Tests executed
5. Test results
6. Browser/manual verification
7. Screenshots or short demo evidence
8. Known issues
9. Deviations from approved plan
10. Security/performance considerations
11. Suggested next milestone
12. Approval requested
```

## 19. Instructions for Google Antigravity --- Development Plan Review Only

Review this plan together with: - `PROJECT_CONTEXT.md` - `SRS.md` -
`PRD.md` - `DECISIONS.md` - `ARCHITECTURE.md` - `GAME_DESIGN.md`

**Do not initialize the repository. Do not create files. Do not install
dependencies. Do not write application code. Do not start
implementation.**

Return a structured review:

1.  **Understanding:** Summarize the proposed delivery strategy.
2.  **Dependency review:** Identify missing prerequisites and incorrect
    milestone ordering.
3.  **Scope review:** Check that each milestone is small enough to
    implement and verify.
4.  **Visual-first review:** Confirm that map and avatar approval
    precede movement implementation.
5.  **Architecture alignment:** Check that the plan preserves the
    approved stack and seven ADRs.
6.  **Capacity validation:** Confirm that the plan treats 20 as a
    maximum, supporting populations from 1 to 20.
7.  **Multiplayer review:** Identify how to validate synchronization and
    the 20-user limit.
8.  **Voice review:** Identify all tests needed for room isolation,
    proximity and Focus Room Toggle-to-Talk.
9.  **Authentication/lifecycle review:** Validate session uniqueness,
    private invitations and durable cleanup.
10. **Testing review:** Identify missing automated, browser, security
    and load tests.
11. **Deployment review:** Identify infrastructure dependencies and
    free-tier risks.
12. **Recommended revisions:** Suggest precise changes to milestone
    order, tasks or acceptance criteria.
13. **Approval assessment:** State whether the plan is ready for owner
    approval, ready after revisions or not ready.

Treat approved architecture decisions as constraints. If you recommend
changing one, explain why and request owner approval.

Do not implement anything. Wait for explicit owner approval.

## 20. Owner Approval Checklist

-   [ ] All project documents have been reviewed.
-   [ ] Milestone order and dependencies are understood.
-   [ ] Visual map and avatar approval precede movement implementation.
-   [ ] Single-player movement is approved before multiplayer.
-   [ ] Multiplayer is stable before voice integration.
-   [ ] Authentication/world management dependencies are resolved.
-   [ ] The 1--20 user capacity is explicit.
-   [ ] Voice security and test coverage are adequate.
-   [ ] Session uniqueness and world lifecycle are covered.
-   [ ] Each milestone has measurable acceptance criteria.
-   [ ] Git workflow and review gates are agreed.
-   [ ] `AGENTS.md` is prepared and approved.
-   [ ] Antigravity has completed its review.
-   [ ] The project owner has approved implementation readiness.

------------------------------------------------------------------------

**End of development plan proposal.**\
**Next planning artifact:** `AGENTS.md`.\
**Implementation begins only after explicit owner approval.**
