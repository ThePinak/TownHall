# Game Design Document --- Private Pixel-Art Social World

**Document:** `GAME_DESIGN.md`\
**Version:** 1.0 --- Approved game design baseline\
**Status:** Approved (aligned with `DECISIONS.md`)\
**Product:** Private, invite-only, browser-based 2D multiplayer social
world\
**Depends on:** `PROJECT_CONTEXT.md`, `SRS.md`, `PRD.md`,
`DECISIONS.md`, `ARCHITECTURE.md`

------------------------------------------------------------------------

## 1. Purpose

This document defines the visual and gameplay experience of the V1
world: its map, areas, characters, movement, camera, collision, room
detection, interactions and game states.

It is a design specification for review. It is not permission to start
implementation. Google Antigravity must review the document, identify
ambiguities and propose refinements. The project owner approves the
design before map or game implementation begins.

The first implementation milestone should focus on the **map and visual
assets only**. The map should be iterated in SVG and visually approved
before movement or multiplayer features are added.

## 2. Game Design Goals

The world should feel like a welcoming, small virtual place where
friends can meet, study, code, collaborate and relax.

The design should prioritize:

1.  **Clarity:** Users can understand where they are and how to reach
    each area.
2.  **Cohesion:** All five areas feel like parts of one connected
    building/world.
3.  **Comfort:** The environment should feel warm, friendly and
    uncluttered.
4.  **Readability:** Avatars, furniture, walls, entrances and pathways
    must be visually distinguishable.
5.  **Navigation:** Users can move naturally without getting stuck or
    needing complicated controls.
6.  **Social presence:** Other users should be easy to notice without
    overwhelming the screen.
7.  **Performance:** Pixel-art assets and map rendering should remain
    lightweight in a browser.

## 3. V1 Game Scope

### 3.1 Core experience

-   Desktop-first, browser-based 2D game.
-   Top-down pixel-art perspective.
-   One connected map per world.
-   Five areas: Town Hall, Coding Room, Learning Room, Chill Room and
    Focus Room.
-   Users can walk freely between areas through visible, walkable
    connections.
-   All users spawn in Town Hall.
-   Up to **20 concurrent users per world**. A world may contain any
    number from 1 through 20; it is not expected to have exactly 20.
-   Predefined avatars.
-   WASD and arrow-key controls.
-   Idle and walking animation.
-   Basic collision with walls and designated objects.
-   Proximity voice rules are associated with logical room zones, not
    merely visual distance.

### 3.2 Later or optional features

These should not delay the first playable map:

-   Sitting animation and sit interactions.
-   Additional environmental interactions.
-   Emotes.
-   Avatar customization.
-   Avatar switching while inside a world.
-   Mobile-specific controls.
-   Advanced visual effects and decorative animations.

## 4. World Structure

### 4.1 The five areas

  -----------------------------------------------------------------------
  Area              Purpose           Visual identity   Voice rule
  ----------------- ----------------- ----------------- -----------------
  Town Hall         Main social hub   Welcoming central Proximity voice
                    and spawn area    hall, community   
                                      noticeboard,      
                                      seating           

  Coding Room       Programming and   Desks, computers, Proximity voice
                    technical         whiteboards,      
                    collaboration     code-themed       
                                      details           

  Learning Room     Study, teaching   Tables,           Proximity voice
                    and knowledge     bookshelves,      
                    sharing           board or          
                                      presentation wall 

  Chill Room        Casual            Sofas, plants,    Proximity voice
                    conversation and  warm lighting and 
                    relaxation        informal seating  

  Focus Room        Quiet study and   Individual desks, Disabled by
                    deep work         minimal           default;
                                      decoration, calm  Toggle-to-Talk
                                      palette           
  -----------------------------------------------------------------------

### 4.2 Connected-map rule

The five areas must form one continuous walkable map.

-   A user must be able to walk from Town Hall to any other area without
    loading a separate map.
-   Entrances and connecting corridors must be visually obvious.
-   The map must not contain disconnected decorative areas that appear
    walkable but are not.
-   Walls and furniture define physical boundaries.
-   Logical room/voice-zone boundaries are separate data from visual
    walls and collision.

### 4.3 Proposed spatial arrangement

The following arrangement is a starting concept, not final geometry:

``` text
                  ┌──────────────────┐
                  │   LEARNING ROOM  │
                  └────────┬─────────┘
                           │
┌──────────────────┐  ┌────┴─────────┐  ┌──────────────────┐
│   CODING ROOM    ├──┤  TOWN HALL   ├──┤    CHILL ROOM    │
└──────────────────┘  │  MAIN HUB    │  └──────────────────┘
                     └────┬─────────┘
                          │
                  ┌───────┴──────────┐
                  │    FOCUS ROOM    │
                  └──────────────────┘
```

The final layout may use corridors, doorways, arches or open
transitions. Do not treat the ASCII diagram as a pixel-perfect map.

### 4.4 Town Hall

Town Hall is the central shared hub.

It should: - Be large enough to accommodate a gathering of users. -
Contain the default spawn area. - Provide clear paths to the other four
areas. - Include a few seating arrangements and a central visual feature
such as a rug, fountain-like decoration, community board or central
table. - Avoid placing furniture in the main walking routes. - Make it
easy to orient oneself after joining or reconnecting.

The spawn points should be distributed around a safe spawn region rather
than placing every user on exactly the same coordinate. The server must
avoid overlapping spawn positions.

### 4.5 Coding Room

Visual elements may include: - Workstations or computer desks. -
Monitors with simple abstract code-like patterns. - Whiteboard or
planning board. - A shared collaboration table. - Subtle
technology-themed decoration.

Keep enough open floor space for users to walk and gather. Do not fill
the room with dense desk rows that make movement awkward.

### 4.6 Learning Room

Visual elements may include: - Bookshelves. - Study tables. - A
teaching/presentation board. - Chairs. - A small presentation area.

The room should feel suitable for a small group learning session. Keep
the board visible and avoid obstructing the main path.

### 4.7 Chill Room

Visual elements may include: - Sofas and armchairs. - Plants. - Rugs. -
Small tables. - Warm lamps or ambient decorative elements.

The room should feel informal and comfortable, while preserving enough
walkable floor space.

### 4.8 Focus Room

Visual elements may include: - Individual desks. - Minimal furniture. -
Books, lamps or subtle productivity details. - A calm and visually
quieter palette. - Clear separation from noisier social areas through
walls or a distinct entrance.

The room's quiet identity should be communicated visually. Voice is
disabled by default and can be temporarily enabled through
Toggle-to-Talk.

## 5. Map Scale and Tile System

### 5.1 Approved tile dimensions

-   Logical tile size: **32 × 32 world pixels**.
-   This is an approved architecture decision.
-   Use this grid consistently for map placement, collision authoring
    and logical coordinate calculations.

### 5.2 Approved Map Dimensions

- **Total map size:** **50 × 40 tiles** (**1600 × 1280 world pixels**) (`DEC-01`).
- **Corridor and doorway widths:** **4 tiles** (**128 world pixels**) (`DEC-02`) to prevent bottlenecking and collision snagging for up to 20 users.
- **Proposed area footprints:**
  - **Town Hall (Center):** ~22 × 18 tiles (704 × 576 px), including a central safe spawn region.
  - **Coding Room (West):** ~18 × 16 tiles (576 × 512 px).
  - **Learning Room (North):** ~20 × 14 tiles (640 × 448 px).
  - **Chill Room (East):** ~18 × 16 tiles (576 × 512 px).
  - **Focus Room (South):** ~20 × 12 tiles (640 × 384 px).

### 5.3 Grid alignment

-   Major walls and room boundaries should align to the 32-pixel logical
    grid where practical.
-   Furniture should use consistent footprints.
-   Entrances should be wide enough for smooth movement and passing.
-   Avoid narrow dead ends and decorative objects that create confusing
    collision shapes.
-   Decorative art may extend beyond a tile visually, but its collision
    footprint must be deliberate.

## 6. Visual Style and Art Direction

### 6.1 Overall style

Use a polished, friendly, top-down pixel-art style.

Desired qualities: - Warm and inviting. - Modern but not overly
futuristic. - Clean silhouettes. - Consistent pixel scale. - Carefully
limited color palettes. - Enough detail to make rooms distinct without
clutter. - Readable avatars against the floor and furniture.

Avoid: - Photorealistic assets. - Excessive gradients or blur that
conflict with pixel art. - Inconsistent sprite scales. - Tiny unreadable
decorative details. - Overly dark environments. - Heavy visual effects
that reduce performance or readability.

### 6.2 Palette direction

Use a distinct but coordinated palette for each area:

  -----------------------------------------------------------------------
  Area                                Suggested palette direction
  ----------------------------------- -----------------------------------
  Town Hall                           Warm wood, cream, muted orange and
                                      welcoming accent colors

  Coding Room                         Cool blue, slate, teal and
                                      restrained neon accents

  Learning Room                       Soft green, beige, muted yellow and
                                      book-inspired colors

  Chill Room                          Warm peach, terracotta, soft purple
                                      and natural green

  Focus Room                          Desaturated blue, sage, cream and
                                      low-contrast neutrals
  -----------------------------------------------------------------------

These are palette directions, not final hex values. The art pass should
produce a shared palette sheet with exact colors.

### 6.3 Lighting and shadows

-   Use consistent light direction across the map.
-   Keep shadows subtle and pixel-consistent.
-   Use lighting to add depth, not to obscure walkable areas.
-   Ensure avatars remain visible in every room.
-   Do not use expensive real-time lighting unless performance testing
    demonstrates it is suitable.

## 7. Character and Avatar Design

### 7.1 V1 avatar system

-   Provide **4 predefined avatars** for V1 (`DEC-04`).
-   Users choose an avatar before entering the world; selection persists to `profiles.avatar_id`.
-   Avatars should be visually distinct and easy to recognize.
-   Advanced customization and in-world avatar switching are deferred post-V1.

### 7.2 Approved sprite scale

-   **Sprite frame dimensions:** **32 × 48 pixels** (`DEC-03`), allowing head and shoulders to overlap the tile above for natural top-down depth.
-   **Feet collision hitbox:** **20 × 12 pixels** (offset `x: 6, y: 36`).
-   **Spritesheet layout:** 4-directional rows (down, left, right, up) with idle and walking frames.

### 7.3 Required animation states

**Required for initial playable character:** - Idle facing up. - Idle
facing down. - Idle facing left. - Idle facing right. - Walking up. -
Walking down. - Walking left. - Walking right.

**Optional later:** - Sitting. - Interaction. - Wave or simple emote. -
Other social animations.

### 7.4 Animation consistency

-   All avatars should use consistent frame dimensions.
-   Directional animations should have consistent timing.
-   The idle animation should not look like walking.
-   Walking animation should correspond to actual movement direction.
-   When movement stops, transition to the appropriate directional idle
    state.
-   Avoid changing the avatar's visual scale between frames.

### 7.5 Character labels and indicators

Approved for V1 (`DEC-06`):
-   Display the user's display name above the avatar using lightweight bitmap/canvas text.
-   Show a subtle speaking indicator (e.g., green ring/halo) while transmitting voice.
-   Show a mute or voice-disabled state cleanly without clutter.

## 8. Player Movement

### 8.1 Controls

  Input        Action
  ------------ ---------------------------------
  W            Move up
  A            Move left
  S            Move down
  D            Move right
  Arrow keys   Equivalent directional movement

Controls should be active when the game world has focus. Typing into a
form or text input must not move the avatar.

### 8.2 Movement behavior

-   Movement should feel immediate and smooth.
-   Diagonal movement must be normalized so it is not faster than
    straight movement.
-   Movement should be based on elapsed frame time, not a fixed number
    of pixels per frame.
-   The player should stop when no movement input is active.
-   The player should not pass through walls or blocking furniture.
-   Movement should remain consistent across common desktop refresh
    rates.

### 8.3 Movement model

A simple constant-speed model is approved for V1 (`DEC-05`):

-   **Base movement speed:** **140 pixels per second** (~4.375 tiles/sec).
-   **Diagonal normalization:** Scale diagonal input vector by `1 / Math.SQRT2` (~0.7071) so diagonal speed remains 140 px/s.
-   **Collision body:** **20 × 12 pixels** at the avatar's feet (offset `x: 6, y: 36`) with axis-separated collision resolution so avatars slide smoothly along walls.
-   **Client prediction & server validation:** Client predicts local movement; server validates speed, bounds, and collision.

The initial design avoids unnecessary complexity such as momentum or acceleration curves unless playtesting demonstrates a clear benefit.

### 8.4 Authoritative movement

The client reads keyboard input and may predict local movement for
responsiveness. The server validates movement and owns the authoritative
position.

The client must not be allowed to teleport by sending arbitrary
coordinates.

The server should validate: - Maximum movement speed. - Map bounds. -
Collision constraints. - Valid movement input. - Current world
membership and active session.

## 9. Camera and Viewport

### 9.1 Proposed camera behavior

-   Camera follows the local player.
-   Camera remains within map boundaries.
-   The player should remain comfortably visible.
-   Camera motion should be smooth but not introduce noticeable input
    lag.
-   The camera should not reveal large empty areas outside the map.

### 9.2 Open camera decisions

Antigravity should propose: - Logical viewport dimensions. - Camera
zoom. - Scaling mode for different desktop resolutions. - Whether the
camera is centered on the player or slightly offset. - Camera smoothing
parameters. - Behavior when the map is smaller than the viewport.

The final settings must be tested in a browser at common desktop window
sizes.

## 10. Collision and Walkability

### 10.1 Walkable surfaces

Examples: - Floors. - Corridors. - Doorways. - Open areas. - Designated
walkable paths.

### 10.2 Blocking surfaces

Examples: - Outer walls. - Internal walls. - Desks. - Bookshelves. -
Sofas. - Large plants. - Tables. - Decorative objects intended to block
movement.

Not every decorative object needs collision. Small floor decorations may
be walkable.

### 10.3 Collision principles

-   Collision should be predictable and forgiving.
-   Do not allow a character to become stuck against corners.
-   The collision body should generally be smaller than the full visible
    sprite.
-   Use simple shapes where possible.
-   Separate collision data from decorative artwork.
-   Test doorways and furniture arrangements with multiple players.

### 10.4 Collision layers

The runtime map should have explicit collision data, for example: -
`collision` tile layer or object layer. - Optional per-object collision
rectangles. - Spawn and interaction objects on separate object layers.

The precise Tiled layer format should be chosen during asset-pipeline
design.

## 11. Room and Zone Detection

### 11.1 Logical zones

Each player must belong to exactly one logical voice zone at a time:

-   `town-hall`
-   `coding`
-   `learning`
-   `chill`
-   `focus`

The map's visual walls and logical room zones are related but separate
concepts.

### 11.2 Zone boundaries

-   Define explicit zone polygons or rectangles in map data.
-   Corridors and doorways need deliberate zone ownership.
-   Avoid ambiguous overlapping zone boundaries.
-   The server determines the player's current zone from authoritative
    coordinates.
-   The client may display room labels or visual feedback, but cannot
    decide voice authorization.

### 11.3 Transition behavior

When a player crosses into another area: 1. Server updates the player's
logical zone. 2. Voice eligibility is recalculated. 3. Any
now-ineligible subscriptions are revoked immediately. 4. Newly eligible
subscriptions may be granted. 5. The client may show a small room-name
indicator.

A player standing in a doorway must not accidentally hear users from
both rooms unless a future approved design explicitly supports a shared
transition zone.

## 12. Voice-Aware Game Design

The game design must reflect these approved voice rules:

  -----------------------------------------------------------------------
  Area                                Voice transmission
  ----------------------------------- -----------------------------------
  Town Hall                           Enabled when proximity and mute
                                      rules permit

  Coding Room                         Enabled when proximity and mute
                                      rules permit

  Learning Room                       Enabled when proximity and mute
                                      rules permit

  Chill Room                          Enabled when proximity and mute
                                      rules permit

  Focus Room                          Disabled by default; Toggle-to-Talk
                                      enables transmission
  -----------------------------------------------------------------------

### 12.1 Proximity radius

-   Approved initial radius: **160 world pixels**.
-   Distance is center-to-center Euclidean distance.
-   At 32 pixels per tile, 160 pixels equals five logical tiles.
-   The same logical room/zone check must also pass.
-   Different rooms remain isolated even when physically close.

### 12.2 Focus Room Toggle-to-Talk

-   Voice transmission starts disabled.
-   User clicks the control to enable transmission.
-   User clicks again to disable transmission.
-   Leaving Focus Room must not leave the microphone transmitting under
    Focus Room permissions.
-   The toggle does not bypass proximity or room restrictions.
-   **Same-room reception (`DEC-08`):** Nearby Focus Room users (within 160 world pixels) can hear a Focus Room user who has enabled Toggle-to-Talk. Cross-room voice is never allowed.

### 12.3 Voice UI

Proposed controls: - Mute/unmute. - Focus Room voice toggle, visible or
enabled only in Focus Room. - Microphone permission/error state. - Voice
connection status. - Optional speaking indicator.

The exact visual placement and appearance should be designed with the
application UI.

## 13. Spawn and Reconnect

### 13.1 Initial spawn

-   All users spawn in Town Hall.
-   Use a designated spawn region with multiple safe positions.
-   Avoid spawning two users on top of one another where practical.
-   Spawn points must be walkable and outside collision objects.

### 13.2 Reconnect

Approved V1 behavior (`DEC-07`): - A reconnecting or returning user spawns in Town Hall's safe spawn region. - The
server validates the account session and world access before restoring
the player. - A stale player entity must be removed before or as the new
session is admitted. - Voice permissions are re-established from current
server state; they must not be restored blindly from stale client state.

## 14. Interactions

### 14.1 V1 priority

Core movement and navigation take priority over environmental
interactions.

Potential interactions: - Sit on designated chairs or sofas. - Stand
up. - Use a simple emote. - Interact with a noticeboard or room object.

These are optional after the map, movement and multiplayer foundations
are stable.

### 14.2 Interaction design rules

-   Interactions should be discoverable.
-   Do not require complex key combinations.
-   Do not block normal movement unnecessarily.
-   Interaction points should be defined as map objects.
-   The server should validate interactions that affect shared state.

Antigravity should recommend a simple interaction key (for example, `E`)
only if interactions are included in V1 scope.

## 15. User Interface Within the Game

The game interface should remain minimal and not cover important map
areas.

Proposed elements: - Small player/connection status area. - Mute/unmute
control. - Focus Room Toggle-to-Talk control when relevant. - Optional
room name indicator. - Optional speaking indicator. - A clear
leave-world action, outside the movement area where possible.

Do not add a large dashboard over the game canvas. The world itself
should remain the primary experience.

## 16. Map Asset Pipeline

### 16.1 Design and production stages

1.  Create the first map concept in SVG.
2.  Review room layout, entrances, pathways and visual hierarchy.
3.  Refine the SVG until the owner approves the map.
4.  Establish the final palette and pixel-art visual references.
5.  Create tile and furniture assets.
6.  Create avatar spritesheets.
7.  Import approved assets into Tiled or an equivalent map-authoring
    workflow.
8.  Export runtime-compatible map data and image assets.
9.  Load the map into Phaser.
10. Verify collision, room zones and spawn points against the rendered
    map.

### 16.2 SVG role

SVG is the initial visual design and iteration format. It is not
necessarily the final runtime representation.

The final game should use assets and map data that Phaser can load
efficiently. Tiled JSON with PNG tilesets/spritesheets is the proposed
runtime path.

### 16.3 Asset naming

Use clear, consistent names, for example:

``` text
assets/
├── maps/
│   ├── world-v1.svg
│   └── world-v1.tmj
├── tilesets/
│   ├── environment.png
│   └── furniture.png
├── characters/
│   ├── avatar-01.png
│   ├── avatar-02.png
│   └── ...
└── ui/
    ├── microphone.svg
    └── ...
```

This is a naming proposal. The final asset pipeline and file formats
should be confirmed before asset production.

## 17. Accessibility and Usability

V1 is desktop-first, but should still consider:

-   Keyboard controls must be consistent.
-   Interactive controls should have visible focus states.
-   Important controls should have text labels or accessible names.
-   Voice state must not be communicated by color alone.
-   Room transitions should be visually understandable.
-   Avoid flashing effects.
-   Ensure avatar contrast against floor tiles.
-   Provide a way to mute and leave the world quickly.

Mobile-specific movement controls are out of scope for V1, but the UI
should avoid unnecessary assumptions that make future adaptation
impossible.

## 18. Performance and Visual Quality

Design for a maximum of **20 concurrent users per world**, with any
population from 1 to 20.

Performance considerations: - Keep tilesets consolidated where
practical. - Avoid unnecessarily large transparent spritesheets. - Avoid
excessive animated decorative objects. - Use simple collision
geometry. - Avoid expensive per-frame calculations that can be
event-driven. - Render only the visual detail needed at the current
camera scale. - Keep name labels and speaking indicators lightweight. -
Test the game at the maximum supported world population.

The exact frame-rate and latency targets should be specified in the
development/QA plan after the test environment is defined.

## 19. Visual Approval Milestones

The map should be reviewed in stages rather than generated once and
accepted without iteration.

### Map review A --- Layout

Review: - Overall map shape. - Position of all five areas. - Entrances
and corridors. - Town Hall centrality. - Walkable continuity. - Space
for up to 20 users.

### Map review B --- Room identity

Review: - Furniture placement. - Room-specific visual themes. - Color
palette. - Wall and floor treatments. - Visual consistency.

### Map review C --- Character scale

Review: - Avatar size relative to tiles and furniture. - Directional
readability. - Visibility against each room's palette. - Spawn
arrangement.

### Map review D --- Gameplay readiness

Review: - Collision boundaries. - Doorway widths. - Spawn positions. -
Logical room-zone boundaries. - Voice-zone geometry.

The owner must approve the map and character direction before movement
implementation begins.

## 20. Design Decisions Status (Synced with `DECISIONS.md`)

| Topic | Status | Approved V1 Value |
| :--- | :--- | :--- |
| Total map dimensions | **Approved (`DEC-01`)** | **50 × 40 tiles** (1600 × 1280 px) |
| Exact room dimensions | **Approved baseline** | Town Hall ~22×18, Coding ~18×16, Learning ~20×14, Chill ~18×16, Focus ~20×12 (refined visually in M1A) |
| Corridor and doorway widths | **Approved (`DEC-02`)** | **4 tiles** (128 px) |
| Exact palette | **Approved direction** | Room-specific palettes in Sec 6.2; exact hex sheet locked in M1B |
| Sprite dimensions | **Approved (`DEC-03`)** | **32 × 48 px** |
| Number of initial avatars | **Approved (`DEC-04`)** | **4 predefined avatars** |
| Camera viewport and zoom | **Approved baseline** | Follow local player, clamp to map bounds, `Phaser.Scale.FIT` |
| Movement speed | **Approved (`DEC-05`)** | **140 px/second** (diagonal normalized) |
| Collision body | **Approved (`DEC-03`)** | **20 × 12 px** at feet (offset `x: 6, y: 36`) |
| Name labels | **Approved (`DEC-06`)** | Included in V1 (P0) |
| Speaking indicator | **Approved (`DEC-06`)** | Included in V1 (P0) |
| Sitting interactions | **Deferred post-V1** | Focus on walking/idle and core navigation in V1 |
| Interaction key | **Deferred post-V1** | Not needed while sitting is deferred |
| Reconnect spawn | **Approved (`DEC-07`)** | Town Hall safe spawn region |
| Focus Room receive behavior | **Approved (`DEC-08`)** | Nearby Focus Room users (≤ 160 px) can hear opted-in Focus Room speakers |
| Avatar persistence | **Approved** | Save `avatar_id` to `profiles` |

## 21. Instructions for Google Antigravity --- Game Design Review Only

Review this document together with: - `PROJECT_CONTEXT.md` - `SRS.md` -
`PRD.md` - `DECISIONS.md` - `ARCHITECTURE.md`

**Do not write code. Do not initialize the repository. Do not install
packages. Do not generate final production assets yet. Do not begin
implementation.**

Return a structured review containing:

1.  **Understanding:** Summarize the intended world and gameplay.
2.  **Consistency:** Identify conflicts with the product requirements
    and approved architecture decisions.
3.  **Map proposal:** Recommend exact initial map dimensions, room
    dimensions, entrances, corridor widths and spawn region. Explain the
    reasoning.
4.  **Visual direction:** Recommend a cohesive pixel-art style and
    room-specific palette.
5.  **Avatar proposal:** Recommend sprite dimensions, animation frame
    layout and a manageable number of initial avatars.
6.  **Movement proposal:** Recommend movement speed, diagonal behavior,
    collision body and camera behavior. Explain what must be playtested.
7.  **Collision design:** Describe collision layers and tricky
    doorway/furniture cases.
8.  **Zone geometry:** Explain how to define room zones independently
    from visual walls and how corridor boundaries should work.
9.  **Voice design validation:** Verify 160-pixel center-to-center
    proximity, same-zone restriction, Focus Room Toggle-to-Talk and
    immediate revocation requirements.
10. **Up-to-20-user design:** Check that the map can accommodate a
    population from one to twenty users without requiring exactly
    twenty.
11. **Asset pipeline:** Recommend the SVG-to-Tiled/Phaser workflow and
    identify any risks.
12. **Open decisions:** List unresolved design choices and recommend
    defaults without treating them as approved.
13. **Visual milestone plan:** Propose the smallest useful sequence of
    map and avatar previews for owner approval.
14. **Approval assessment:** State whether the design is ready for owner
    approval, ready after revisions or not ready.

Do not implement anything. Do not create the SVG or final assets as part
of this review. Wait for explicit owner approval before starting the
visual map milestone.

## 22. Owner Approval Checklist

-   [x] All five areas have a clear purpose and visual identity.
-   [x] All areas connect through one continuous walkable map.
-   [x] Town Hall is the default spawn area.
-   [x] The map can comfortably support up to 20 users, not exactly 20.
-   [x] Tile size is 32 × 32 logical pixels.
-   [x] Map dimensions and room proportions are approved.
-   [x] Pixel-art style and palette direction are approved.
-   [x] Avatar design and sprite scale are approved.
-   [x] Keyboard controls are defined.
-   [x] Movement and camera behavior are defined.
-   [x] Collision and walkability are defined.
-   [x] Logical room zones are defined separately from visual geometry.
-   [x] Voice rules preserve the approved room and proximity
    restrictions.
-   [x] Focus Room Toggle-to-Talk behavior is clear.
-   [x] Spawn and reconnect behavior are agreed.
-   [x] Optional interactions are either scoped or explicitly deferred.
-   [x] Antigravity has completed its review.
-   [x] The project owner has approved the final design.

------------------------------------------------------------------------

**End of game design proposal.**\
**Next document after game design approval:** `DEVELOPMENT_PLAN.md`.
