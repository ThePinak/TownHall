# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# Private Pixel-Art Multiplayer Social World

**Document:** PRD.md  
**Version:** 1.0  
**Product Version:** V1  
**Status:** Approved V1 baseline (aligned with `DECISIONS.md`)  
**Development Agent:** Google Antigravity  
**Primary Objective:** Build a private, multiplayer, pixel-art virtual world for social interaction and collaboration.

---

# 1. Product Overview

## 1.1 Product Vision

Build a virtual environment where friends, students, developers, and collaborators can meet, move around, communicate, study, work, and socialize.

The application should provide a shared 2D pixel-art world where every user is represented by a character.

Unlike traditional video conferencing applications, users will not simply join a meeting and remain in front of a camera.

Instead, they will enter a virtual environment, walk around, visit different areas, encounter other users, and communicate naturally through proximity-based voice chat.

The experience should feel like entering a small virtual campus or community space.

## 1.2 Product Goal

The primary goal of V1 is to deliver a functional and visually polished multiplayer social world with five connected areas and real-time proximity-based voice communication.

The product should demonstrate the following experience:

1. A user creates a private world.
2. The user invites friends.
3. Friends join the same environment.
4. Everyone appears as a character inside the world.
5. Users move freely around the map.
6. Users enter different areas according to their activities.
7. Nearby users can communicate through voice.
8. Users can leave and return according to the world lifecycle rules.

## 1.3 Product Principles

The following principles should guide every product and design decision.

1. **One shared world:** All five areas must belong to one connected environment.
2. **Natural interaction:** Users should interact through movement and proximity rather than complicated menus.
3. **Simplicity:** The application should be easy to understand.
4. **Visual quality:** The environment should feel like an actual pixel-art game.
5. **Smoothness:** Movement, rendering, and multiplayer synchronization should feel responsive.
6. **Privacy:** Worlds should be private and invitation-based.
7. **Reliability:** Voice failure should not make the entire game unusable.
8. **Focused V1:** Build the essential experience before introducing advanced features.

---

# 2. Target Users and Use Cases

## 2.1 Target Audience

The initial target audience includes:

- Friends who want to meet in a virtual environment.
- Students who want to study together.
- Developers who want to discuss programming.
- Small teams who want a virtual collaboration space.
- Communities that want a private online hangout.

## 2.2 Primary User Personas

### Persona A: World Creator

A person who wants to create a private virtual space and invite others.

Primary needs:

- Quickly create a world.
- Receive an invitation link or code.
- Invite friends.
- Enter and manage the world.

### Persona B: Participant

A person invited by another user.

Primary needs:

- Join a world easily.
- Choose an avatar.
- Explore the map.
- Find other participants.
- Communicate with nearby people.

### Persona C: Focused User

A participant who wants to work or study without unnecessary conversation.

Primary needs:

- Enter the Focus Room.
- Work in a quiet environment.
- Enable voice temporarily if necessary.

---

# 3. V1 Product Scope

## 3.1 Features Included in V1

V1 must include the following capabilities.

| Feature | Priority |
|---|---|
| User registration and login | P0 |
| Private world creation | P0 |
| Invitation code or link | P0 |
| Invitation-based joining | P0 |
| Maximum 20 participants per world | P0 |
| Five connected map areas | P0 |
| Pixel-art environment | P0 |
| Predefined avatar selection | P0 |
| WASD and arrow-key movement | P0 |
| Collision detection | P0 |
| Character animations | P0 |
| Real-time multiplayer synchronization | P0 |
| Room and area detection | P0 |
| Proximity-based voice communication | P0 |
| Room-aware voice restrictions | P0 |
| Focus Room voice disabled by default | P0 |
| Mute and unmute | P0 |
| World empty-state grace period | P0 |
| Responsive connection/error feedback | P0 |
| Advanced avatar customization | Out of scope |
| Public world discovery | Out of scope |
| Video calling | Out of scope |
| Text messaging | Out of scope |
| Screen sharing | Out of scope |
| Mobile-specific gameplay controls | Out of scope |

**P0:** Essential for V1 release.

## 3.2 V1 Definition of Done

V1 is complete only when a group of users can:

- Create a private world.
- Invite other authenticated users.
- Join the same world.
- Select predefined avatars.
- See one another inside the map.
- Move naturally through all five areas.
- Communicate with nearby participants through voice.
- Experience correct voice isolation between areas.
- Use the Focus Room with voice disabled by default.
- Leave and rejoin during the grace period.
- Use the application reliably with up to 20 participants in one world under the supported test conditions.

A visually complete map without working multiplayer and voice is not a complete V1.

Likewise, a functional multiplayer system with an unfinished or placeholder environment is not the intended final product.

---

# 4. Core Product Experience

## 4.1 Main User Journey

The complete user journey should be:

**Open Application → Register/Login → Dashboard → Create or Join World → Select Avatar → Enter Town Hall → Explore World → Interact and Communicate → Leave World**

### Step 1: Open Application

The user visits the application URL.

The application presents a welcoming landing or authentication experience.

### Step 2: Authentication

The user registers or logs in.

Unauthenticated users cannot access private worlds.

### Step 3: Dashboard

After authentication, the user reaches the main dashboard.

The dashboard provides two primary actions:

- Create a World.
- Join a World.

The dashboard should remain simple and uncluttered.

### Step 4A: Create a World

The user selects Create World.

The system:

1. Creates a private world.
2. Assigns the creator as administrator.
3. Generates a private invitation code and/or link.
4. Displays the invitation.
5. Allows the creator to copy and share it.
6. Allows the creator to enter the world.

### Step 4B: Join a World

The user can either:

- Open an invitation link.
- Enter an invitation code manually.

The system validates the invitation and checks world capacity.

If valid, the user proceeds to avatar selection.

If invalid, expired, deleted, or full, the system displays an understandable error.

### Step 5: Avatar Selection

The user selects one predefined character.

The selection interface should display available avatars clearly.

Advanced character customization is not part of V1.

### Step 6: Enter World

The user enters the shared map.

Every newly joined participant spawns inside the Town Hall at a valid spawn position.

### Step 7: Explore and Interact

The user can move using WASD or arrow keys.

The user can visit all five areas without changing maps or loading separate game instances.

### Step 8: Voice Communication

Voice behavior automatically follows the user's current area, proximity, and voice settings.

The user can mute or unmute their microphone.

### Step 9: Leave

The user can leave the world through a visible control.

The system updates participant presence and applies the world lifecycle rules.

---

# 5. World and Map Requirements

## 5.1 Map Concept

Each world shall contain one predefined, interconnected, top-down 2D map.

The map must contain five areas:

1. Town Hall.
2. Coding Room.
3. Learning Room.
4. Chill Room.
5. Focus Room.

The map should resemble a small virtual campus or community building.

All areas must be physically connected using corridors, entrances, or walkable pathways.

Users must be able to move freely between them.

## 5.2 Town Hall

**Purpose:** Main community hub and spawn area.

Expected experience:

- Welcoming central hall.
- Main gathering area.
- Suitable furniture and decorations.
- Clear entrances to other areas.
- Space for multiple participants.
- One shared proximity voice zone.

Town Hall should be the most recognizable area in the world.

All newly joined users spawn here.

The proposed initial map arrangement places Town Hall in the center.

## 5.3 Coding Room

**Purpose:** Programming and technical collaboration.

Expected activities:

- Discuss programming problems.
- Debug code.
- Discuss projects.
- Pair programming.
- Share technical knowledge.

Visual elements may include:

- Computer desks.
- Monitors.
- Chairs.
- Whiteboards.
- Technical decorations.

Voice is enabled with room-aware proximity rules.

## 5.4 Learning Room

**Purpose:** Study, learning, and teaching.

Expected activities:

- Group study.
- Teaching.
- Explaining concepts.
- Academic discussions.
- Knowledge sharing.

Visual elements may include:

- Classroom desks.
- Chairs.
- Blackboard or whiteboard.
- Bookshelves.
- Learning-related decorations.

Voice is enabled with room-aware proximity rules.

## 5.5 Chill Room

**Purpose:** Casual conversations and social interaction.

Expected activities:

- Relaxed discussions.
- Socializing.
- Meeting friends.
- Taking breaks.

Visual elements may include:

- Sofas.
- Comfortable chairs.
- Tables.
- Plants.
- Relaxed decorations.

Voice is enabled with room-aware proximity rules.

## 5.6 Focus Room

**Purpose:** Quiet work and concentration.

Expected activities:

- Individual work.
- Silent study.
- Deep focus.
- Quiet productivity.

Visual elements may include:

- Individual desks.
- Comfortable chairs.
- Minimal decorations.
- A calm environment.

Voice is disabled by default.

Users may temporarily enable voice, subject to the finalized Focus Room voice interaction rules.

## 5.7 Initial Layout Proposal

The initial layout proposal is:

| Direction | Area |
|---|---|
| Center | Town Hall |
| North | Learning Room |
| West | Coding Room |
| East | Chill Room |
| South | Focus Room |

This is a proposed arrangement, not a fixed geometry.

The final design should prioritize:

- Natural movement.
- Visually clear room entrances.
- Good space distribution.
- Walkable corridors.
- A cohesive overall environment.
- Enough space for 20 characters.
- Clear separation of voice zones.

## 5.8 Map Design Acceptance Criteria

The map is accepted when:

- All five areas are present.
- Every area is visually distinguishable.
- All areas are connected.
- There are no inaccessible or disconnected sections.
- Characters can navigate between areas.
- Walls and solid furniture block movement.
- Room boundaries can be detected reliably.
- The map supports 20 participants.
- The visual design has been reviewed and approved.

The map must be an actual playable environment, not merely a diagram or static illustration.

---

# 6. Character and Avatar Requirements

## 6.1 Avatar Selection

V1 shall provide predefined pixel-art characters.

Users must be able to select one avatar before entering the world.

The avatar selection should be visually clear and straightforward.

## 6.2 Character Behavior

Every avatar should support:

- Idle state.
- Walking state.
- Directional movement.
- Appropriate animation transitions.

Sitting and basic interaction animations should be included where feasible without delaying essential movement and multiplayer functionality.

## 6.3 Character Visibility

Every participant should be represented by a visible character.

Other participants should see the correct selected avatar.

Characters should not overlap in a way that makes the environment difficult to understand.

## 6.4 Character Acceptance Criteria

- User can select an avatar.
- The avatar appears inside the world.
- The avatar faces the appropriate direction.
- Walking animation plays during movement.
- Idle animation plays when stationary.
- Other participants see the correct avatar.
- Characters cannot move through solid obstacles.

---

# 7. Movement and Game Interaction

## 7.1 Controls

The application shall support:

| Action | Control |
|---|---|
| Move up | W / Arrow Up |
| Move down | S / Arrow Down |
| Move left | A / Arrow Left |
| Move right | D / Arrow Right |

## 7.2 Movement Experience

Movement must be smooth, responsive, and predictable.

The system should prevent:

- Walking through walls.
- Walking through solid furniture.
- Leaving map boundaries.
- Invalid positions.
- Unintended movement after keyboard focus is lost.

Diagonal movement behavior should be consistent and should not provide an unintended speed advantage.

## 7.3 Camera

The game should use a camera that presents a comfortable view of the environment.

The camera should not make navigation confusing.

The exact camera-follow behavior, zoom level, and viewport size will be finalized during game design.

## 7.4 Movement Acceptance Criteria

- Both keyboard control schemes work.
- Movement responds consistently.
- Character animations match movement.
- Collision detection works.
- Room transitions are detected.
- The character remains inside valid map boundaries.
- Movement remains usable during multiplayer sessions.

---

# 8. Multiplayer Requirements

## 8.1 Shared World

All users joining the same invitation must enter the same multiplayer world.

Every participant must see the same environment.

The map must not be duplicated into independent room instances for each area.

## 8.2 Capacity

The maximum capacity is:

**20 concurrent users per world.**

This includes all five areas collectively.

For example:

- Town Hall: 5 users.
- Coding Room: 4 users.
- Learning Room: 3 users.
- Chill Room: 6 users.
- Focus Room: 2 users.

Total: 20 users.

The system must reject the next joining participant until a slot becomes available.

Capacity enforcement must happen on the trusted server side.

## 8.3 Synchronization

The system must synchronize:

- Player presence.
- Player position.
- Movement state.
- Character direction.
- Selected avatar.
- Current area.

Participants should see other users moving naturally.

The system should avoid excessive network traffic and unnecessary rendering work.

## 8.4 Joining and Leaving

When a participant joins:

- The system registers the participant.
- The participant receives the current world state.
- Other participants become aware of the new player.
- The new player spawns in Town Hall.

When a participant leaves:

- Their active presence is removed.
- Other participants stop seeing their active character.
- World capacity is updated.

## 8.5 Multiplayer Acceptance Criteria

- Two users can join the same world.
- Both users can see each other.
- Both can move simultaneously.
- Movement is synchronized.
- Users can enter different areas.
- Players in different areas remain in the same world.
- Disconnections are handled.
- Capacity is enforced at 20.
- One client cannot directly manipulate another user's authoritative player state.

---

# 9. Voice Communication Requirements

## 9.1 Core Experience

Voice should feel like proximity chat in a multiplayer game.

Users should naturally hear nearby participants without having to join separate calls manually.

The system should evaluate:

1. Whether the users belong to the same eligible voice zone.
2. Whether they are within the permitted proximity range.
3. Whether their voice settings allow communication.

All conditions must be satisfied before audio is shared.

## 9.2 Voice Rules

| Area | Default behavior | Communication rule |
|---|---|---|
| Town Hall | Enabled | Same shared voice zone and proximity |
| Coding Room | Enabled | Same room and proximity |
| Learning Room | Enabled | Same room and proximity |
| Chill Room | Enabled | Same room and proximity |
| Focus Room | Disabled | Toggle-to-Talk (`ADR-04`); nearby Focus Room users hear (`DEC-08`) |

## 9.3 Voice Connection Behavior

When two users become eligible to communicate:

- Their voice connection becomes available.
- The microphone and audio permission state is respected.
- The user can mute or unmute.

When users become ineligible:

- Their voice relationship is disconnected immediately.
- They must not continue hearing each other outside the permitted area or range.

A gradual volume fade is not required.

## 9.4 Room Isolation

Voice zones must be independent of visual proximity alone.

For example:

If a Coding Room participant and a Learning Room participant are standing near each other on the map, they must not hear each other.

The system must enforce logical room boundaries.

## 9.5 Town Hall

Town Hall uses one shared logical voice zone.

However, communication within that zone is still proximity-based.

Being in Town Hall does not automatically mean hearing every participant regardless of distance.

## 9.6 Focus Room

Focus Room is silent by default.

The exact interaction when a user temporarily enables voice is an open product decision.

The implementation must not assume that this permission allows unrestricted communication with every room.

## 9.7 Voice Interface

The game interface should include:

- Microphone permission handling.
- Mute/unmute control.
- Current microphone state.
- Connection status feedback.
- Clear feedback when voice is unavailable.

Speaking indicators and participant voice-status indicators are recommended, with final UI behavior to be confirmed.

## 9.8 Voice Acceptance Criteria

- Two nearby users in the same eligible room can communicate.
- Users outside the proximity range cannot hear one another.
- Users in different rooms cannot hear one another.
- Moving out of range disconnects the voice relationship immediately.
- Moving into another room updates voice eligibility.
- Mute/unmute works.
- Microphone denial is handled gracefully.
- Focus Room does not automatically enable voice.
- Voice service failure does not stop movement or multiplayer gameplay.

---

# 10. World Creation and Invitation Experience

## 10.1 Create World

Every authenticated user should be able to create a private world.

The creator automatically becomes administrator.

The creation process should be short and simple.

A world name is optional for V1 and remains to be finalized.

## 10.2 Invitation

The system must generate a private invitation code or link.

The invitation must be:

- Unique.
- Difficult to guess.
- Validated by the server.
- Associated with the correct world.

The creator should be able to copy the invitation.

## 10.3 Join World

A participant should be able to join through:

- An invitation link.
- A manually entered invitation code.

The system must check:

- Whether the invitation is valid.
- Whether the world still exists.
- Whether the world is joinable.
- Whether the world has available capacity.

## 10.4 Invitation Acceptance Criteria

- Creator can generate an invitation.
- Creator can copy it.
- A valid invitation joins the correct world.
- Invalid invitations are rejected.
- Full worlds reject new participants.
- Deleted worlds cannot be joined.
- Unauthorized users cannot bypass invitation validation.

---

# 11. World Lifecycle

## 11.1 Active World

A world is active while at least one participant is present.

## 11.2 Empty World

When the last participant leaves:

1. The system detects that the world is empty.
2. The world enters a 10-minute grace period.
3. The deletion deadline is recorded.
4. The world remains temporarily joinable by authorized invitees.

## 11.3 Rejoining

If a valid participant joins during the grace period:

- The pending deletion is cancelled.
- The world returns to active status.
- The participant enters the world.

## 11.4 Deletion

If nobody rejoins before the grace period expires:

- The world is deleted.
- Its invitation is no longer valid.
- Further attempts to join are rejected.

The deletion mechanism must remain reliable even if the server restarts or temporarily becomes unavailable.

## 11.5 Lifecycle Acceptance Criteria

- World remains active while participants are present.
- Grace period starts after the last participant leaves.
- Rejoining cancels deletion.
- Deletion occurs after the full 10-minute grace period.
- Server restarts do not accidentally reset or bypass the deadline.
- Simultaneous join and deletion attempts are handled safely.

---

# 12. User Interface and Experience

## 12.1 Overall Visual Direction

The application should have a cohesive pixel-art identity.

The UI outside the game world should complement the game environment without overwhelming it.

The game should be the main visual focus once the user enters a world.

## 12.2 Required Screens

### Screen 1: Landing / Authentication

Purpose:

- Introduce the application.
- Allow registration and login.
- Provide a clear entry point.

### Screen 2: Dashboard

Purpose:

- Create a world.
- Join an existing world.
- Enter an invitation code.

The dashboard should avoid unnecessary features.

### Screen 3: World Creation / Invitation

Purpose:

- Confirm world creation.
- Display invitation details.
- Copy and share invitation.

### Screen 4: Avatar Selection

Purpose:

- Display available avatars.
- Allow selection.
- Confirm and enter the world.

### Screen 5: Multiplayer World

Purpose:

- Display the entire map.
- Render all connected characters.
- Support movement and interaction.
- Provide voice controls.
- Provide leave-world functionality.

## 12.3 In-Game Interface

The in-game interface should prioritize the environment.

Recommended elements:

- Main game viewport.
- Character and player rendering.
- Microphone mute/unmute control.
- Voice status.
- Leave-world control.
- Optional participant information.

Avoid excessive menus, panels, and overlays that cover the map.

## 12.4 Error and Feedback States

The application should communicate:

- Invalid invitation.
- Full world.
- Connection lost.
- Reconnecting.
- World unavailable.
- Microphone permission denied.
- Voice service unavailable.
- Authentication expired.

Error messages should be understandable and actionable.

---

# 13. Non-Functional Product Expectations

## 13.1 Performance

The product should feel responsive.

Initial target expectations:

- Aim for 60 FPS on supported desktop hardware under normal gameplay conditions.
- Maintain stable rendering with 20 participants under defined test conditions.
- Avoid noticeable movement jitter.
- Keep local movement responsive.
- Keep voice latency low under normal network conditions.

The final quantitative network and performance thresholds will be agreed during architecture and testing.

## 13.2 Reliability

- Multiplayer should recover from temporary network interruption where feasible.
- Voice failure should not interrupt the game.
- World lifecycle state must remain consistent.
- Users should receive feedback when services become unavailable.

## 13.3 Security and Privacy

- Private worlds require authenticated access.
- Invitation validation must be server-side.
- World capacity must be server-enforced.
- Player state must be protected against unauthorized modification.
- Microphone access must follow browser permissions.
- Voice access must respect room and proximity restrictions.
- No voice recording is required in V1.

## 13.4 Compatibility

V1 should prioritize desktop browsers.

Keyboard controls and browser microphone support are essential.

Mobile-specific gameplay controls are not included in the initial release.

---

# 14. Explicitly Out of Scope

The following must not be included in V1 unless separately approved.

## Social Features

- Public user discovery.
- Friends and followers.
- Direct messaging.
- Persistent text chat.
- Public profiles.
- Social feeds.

## Communication Features

- Video calling.
- Screen sharing.
- Voice recording.
- File sharing.
- Persistent conversation history.

## Customization

- Advanced avatar editor.
- User-uploaded character sprites.
- Custom map creation.
- Custom room creation.
- Multiple map themes.

## Gamification

- Leaderboards.
- Achievements.
- Virtual currency.
- Rewards.
- In-world purchases.
- Competitive game modes.

## Platform Expansion

- Dedicated mobile applications.
- Mobile-specific touch gameplay.
- Native desktop applications.

These features can be considered for future versions.

---

# 15. Success Metrics

V1 should be evaluated using measurable product and technical outcomes.

## Functional Metrics

| Metric | V1 Target |
|---|---|
| World capacity | 20 concurrent users |
| Number of connected areas | 5 |
| Successful world creation | 100% in acceptance tests |
| Valid invitation joining | 100% in acceptance tests |
| Invalid invitation rejection | 100% in acceptance tests |
| Movement controls | WASD and arrows |
| Voice room isolation | 100% in defined tests |
| Empty-world grace period | 10 minutes |
| Character synchronization | Verified with 20 test participants |

## Experience Metrics

- Users can understand how to create and join a world without assistance.
- Movement feels natural.
- The map is visually understandable.
- Users can identify the five areas.
- Voice communication behaves predictably.
- The game remains usable when voice is unavailable.

These are release evaluation goals, not claims of guaranteed performance on every device or network.

---

# 16. V1 Release Acceptance Checklist

The product must pass the following checklist before release.

## Authentication and Access

- [ ] Registration works.
- [ ] Login works.
- [ ] Logout works.
- [ ] Private world access requires authentication.

## World Management

- [ ] User can create a world.
- [ ] Creator becomes administrator.
- [ ] Invitation code or link is generated.
- [ ] Invitation can be copied.
- [ ] Valid invitations work.
- [ ] Invalid invitations are rejected.
- [ ] World capacity is limited to 20.

## Map and Gameplay

- [ ] One connected map exists.
- [ ] All five areas are present.
- [ ] All areas are accessible.
- [ ] Pixel-art visual design is approved.
- [ ] Avatar selection works.
- [ ] Users spawn in Town Hall.
- [ ] WASD movement works.
- [ ] Arrow-key movement works.
- [ ] Walking and idle animations work.
- [ ] Collision detection works.

## Multiplayer

- [ ] Multiple users can join one world.
- [ ] Participants can see one another.
- [ ] Movement is synchronized.
- [ ] Users can enter different areas.
- [ ] Join and leave behavior works.
- [ ] Capacity is enforced server-side.
- [ ] Disconnection handling works.

## Voice

- [ ] Microphone permission works.
- [ ] Mute/unmute works.
- [ ] Same-room proximity voice works.
- [ ] Cross-room voice is blocked.
- [ ] Out-of-range voice disconnects immediately.
- [ ] Focus Room is silent by default.
- [ ] Voice failure does not break gameplay.

## World Lifecycle

- [ ] Empty-world detection works.
- [ ] 10-minute grace period works.
- [ ] Rejoining cancels deletion.
- [ ] Expired worlds are deleted.
- [ ] Server restarts do not invalidate lifecycle rules.

## Quality

- [ ] Performance is tested.
- [ ] Security checks are completed.
- [ ] Error states are handled.
- [ ] Browser testing is completed.
- [ ] Deployment is verified.

---

# 17. Product Decisions Status (Synced with `DECISIONS.md`)

All core V1 product decisions have been finalized in `DECISIONS.md`:

| ID | Decision | Approved V1 Resolution |
|---|---|---|
| PRD-01 | Exact map dimensions and tile size | **Approved (`ADR-02`, `DEC-01`):** 50 × 40 tiles at 32 × 32 px |
| PRD-02 | Camera behavior | **Approved:** Follow local player, clamped to map boundaries |
| PRD-03 | Proximity voice radius | **Approved (`ADR-01`):** 160 world pixels (center-to-center Euclidean) |
| PRD-04 | Focus Room voice opt-in | **Approved (`ADR-04`, `DEC-08`):** Toggle-to-Talk; nearby Focus Room users hear |
| PRD-05 | World name | **Approved:** Optional for V1; duplicates allowed |
| PRD-06 | Multiple worlds per user | **Approved (`ADR-05`):** One active world per creator (including grace-period worlds) |
| PRD-07 | Avatar persistence | **Approved:** Save `avatar_id` selection to user profile |
| PRD-08 | Avatar switching inside a world | **Deferred post-V1:** Selected prior to entering the world |
| PRD-09 | Player name labels | **Approved (`DEC-06`):** Included in V1 (P0) |
| PRD-10 | Speaking indicator | **Approved (`DEC-06`):** Included in V1 (P0) |
| PRD-11 | Admin participant removal | **Deferred post-V1** (Admin = creator/owner & invite management in V1) |
| PRD-12 | Invitation revocation/expiry | **Approved (`DEC-09`):** Secure hashed tokens with revoke/regenerate support |
| PRD-13 | Return position after reconnect | **Approved (`DEC-07`):** Spawn in Town Hall safe spawn region |
| PRD-14 | Admin disconnect behavior | **Approved:** World remains active while participants remain |
| PRD-15 | Mobile support | **Approved:** Desktop-only V1 |
| PRD-16 | Multiple simultaneous sessions per account | **Approved (`ADR-03`):** One active session per account; newest replaces previous |
| PRD-17 | World metadata deletion | **Approved (`ADR-07`):** Mark world deleted and invalidate associated invitations after expiry |

---

# 18. Product Roadmap

## V1 — Core Multiplayer Social World

The first release focuses on:

- Authentication.
- Private world creation.
- Invitations.
- Five connected areas.
- Pixel-art environment.
- Predefined avatars.
- Smooth movement.
- Collision detection.
- Multiplayer synchronization.
- Proximity-based voice.
- Room-aware voice.
- World lifecycle.
- Basic deployment.

## Future Version Possibilities

### V1.1 — Social Improvements

- Text chat.
- Friends.
- User profiles.
- Improved interaction animations.
- Additional avatar options.

### V1.2 — Collaboration

- Shared whiteboards.
- Screen sharing.
- Group activities.
- Better study and work tools.

### V2 — Customizable Worlds

- Custom maps.
- Additional areas.
- Advanced avatar customization.
- More room interactions.
- Additional world themes.

These are possible future directions, not V1 commitments.

---

# 19. Relationship With Other Project Documents

The project will maintain separate documents for different purposes.

| Document | Responsibility |
|---|---|
| PROJECT_CONTEXT.md | Overall vision and background |
| SRS.md | Software requirements and system behavior |
| PRD.md | Product scope, features, user experience, priorities, and acceptance criteria |
| ARCHITECTURE.md | Technical design and technology decisions |
| GAME_DESIGN.md | Map, movement, character, collision, and game mechanics |
| DEVELOPMENT_PLAN.md | Milestones and implementation sequence |
| DECISIONS.md | Approved product and technical decisions |
| AGENTS.md | Persistent instructions for AI development agents |

The PRD defines what should be built.

The architecture defines how it should be built.

The development plan defines when and in what order it should be built.

---

# 20. Instructions to Google Antigravity

You must read and understand:

1. PROJECT_CONTEXT.md
2. SRS.md
3. PRD.md

The three documents should be treated as complementary sources of project requirements.

## Current Task: PRD Review Only

Do not start implementation.

Do not install dependencies.

Do not initialize a project.

Do not create application components.

Do not create database schemas.

Do not independently modify approved product decisions.

Instead:

1. Review the PRD.
2. Compare it with the Project Context and SRS.
3. Identify inconsistencies.
4. Identify missing acceptance criteria.
5. Identify requirements that are too vague to implement.
6. Highlight dependencies between features.
7. Evaluate whether V1 is feasible as scoped.
8. Identify features that could unnecessarily increase V1 complexity.
9. Identify the most important decisions that need approval.

Return a structured review containing:

- Your understanding of V1.
- Complete feature breakdown.
- Scope and priority assessment.
- User journey validation.
- Map and gameplay requirement review.
- Multiplayer and voice requirement review.
- Security and lifecycle concerns.
- Missing acceptance criteria.
- Open decisions ranked by importance.
- Recommended changes to the PRD.

Wait for explicit approval before proceeding.

**Do not write code until the product requirements, technical architecture, and development plan have been reviewed and approved.**