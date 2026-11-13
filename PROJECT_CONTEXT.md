# PROJECT CONTEXT — PRIVATE PIXEL-ART MULTIPLAYER SOCIAL WORLD

## 1. Important Instruction: Understand First, Do Not Build Yet

You are joining an ongoing project as the primary AI development agent.

Your first responsibility is to understand the complete product vision, intended user experience, major features, constraints, and development philosophy.

**Do not start coding. Do not create the application. Do not install dependencies. Do not generate implementation files. Do not make architectural decisions independently yet.**

At this stage, your task is only to understand the project and provide feedback on your understanding.

After reviewing this brief:

1. Explain the project in your own words.
2. Describe the intended user experience from login to entering and interacting inside a world.
3. Summarize the five areas of the map and how they should work.
4. Explain the multiplayer and proximity-based voice requirements.
5. Identify the major technical challenges you anticipate.
6. Highlight unclear requirements, contradictions, and decisions that still need confirmation.
7. Suggest what should be covered in the formal V1 PRD.

Wait for further instructions before creating files or writing code.

---

## 2. Project Overview

We want to build a web-based, private, invite-only, 2D multiplayer social world with a pixel-art aesthetic.

The experience should feel like entering a small virtual community or workspace where people can see one another, move around, meet, and communicate naturally.

Users should be able to:

- Log in to the application.
- Create their own private virtual world.
- Invite friends or teammates through a room code or invitation link.
- Join another person's world using an invitation.
- Choose a predefined character/avatar.
- Enter a shared 2D pixel-art environment.
- Move around using their keyboard.
- Meet other users in different areas.
- Communicate through proximity-based voice chat.
- Collaborate, study, discuss programming, or casually socialize.

The application should combine the feeling of a small multiplayer game with the functionality of a virtual social and collaboration space.

This is not intended to be a traditional video-conferencing application with separate meeting rooms. The central experience is a shared virtual world where people move around and interact.

The goal is to make the experience simple, smooth, interactive, visually appealing, and easy to use.

## 3. Core Product Concept

Every user should be able to create a private world.

The person creating the world becomes its administrator. Other people can join through a private invitation link or room code.

Each world contains one interconnected 2D map.

The map has five distinct areas:

1. Town Hall
2. Coding Room
3. Learning Room
4. Chill Room
5. Focus Room

These are not independent game instances or separate screens. They are different physical areas within the same shared map.

Users should be able to walk naturally between them using corridors, doors, and pathways.

For example, a user should be able to enter the Town Hall, walk through a corridor, and enter the Coding Room without loading an entirely different map.

The entire world is one continuous environment.

## 4. The Five Areas of the World

### 4.1 Town Hall — Main Community Hub

The Town Hall is the central area of the world.

It is the primary meeting and social space.

Requirements and intended behavior:

- Everyone entering the world initially spawns here.
- It should feel like a welcoming community hall.
- Users can meet, interact, and talk.
- It should have suitable furniture and decorations.
- It should connect naturally to the other four areas.
- It should be visually recognizable as the main hub.

Voice behavior:

- Town Hall has one shared proximity voice zone.
- Users can hear nearby users within the applicable proximity range.
- Voice should not be shared with users in other rooms.

### 4.2 Coding Room

A dedicated space for programming-related collaboration.

Intended activities:

- Discuss programming problems.
- Debug code together.
- Discuss development projects.
- Pair programming.
- Share technical knowledge.

Visual direction:

- Desks, computers, monitors, chairs, whiteboards, and other programming-related decorations.

Voice behavior:

- Proximity-based voice communication is enabled.
- Users should hear nearby people in this room.
- Users outside the room should not hear its conversations.

### 4.3 Learning Room

A dedicated space for learning and teaching.

Intended activities:

- Group study sessions.
- Explaining concepts.
- Teaching and mentoring.
- Discussing academic topics.
- Sharing knowledge.

Visual direction:

- Classroom-style furniture, desks, a board, bookshelves, and learning-related decorations.

Voice behavior:

- Proximity-based voice communication is enabled.
- Users should only communicate with people in the same voice zone and within proximity.

### 4.4 Chill Room

A casual social area.

Intended activities:

- Relaxed conversations.
- Socializing with friends.
- Casual discussions.
- Meeting people.
- Taking breaks.

Visual direction:

- Comfortable sofas, tables, plants, decorations, and a relaxed atmosphere.

Voice behavior:

- Proximity-based voice communication is enabled.
- Users should only hear nearby users in this room.

### 4.5 Focus Room

A quiet environment designed for concentration and productivity.

Intended activities:

- Individual work.
- Silent study.
- Deep focus sessions.
- Quiet productivity.

Visual direction:

- Minimal furniture, individual desks, comfortable chairs, and a calm environment.

Voice behavior:

- Voice communication is disabled by default.
- A user can temporarily enable voice when needed.
- Users should have control over their microphone.
- The room should preserve its quiet-work identity.

## 5. Map and Visual Experience

The application should use a top-down, 2D pixel-art visual style.

The map should feel like a small, thoughtfully designed virtual environment rather than a basic diagram.

Important visual requirements:

- One continuous map.
- Five clearly identifiable areas.
- Natural walkable connections between areas.
- Clear entrances and exits.
- Walls and furniture that create a believable environment.
- Furniture and decorations appropriate to each area.
- Consistent pixel-art style.
- Distinct visual identity for every room.
- A clear and welcoming Town Hall as the central hub.

A possible initial spatial arrangement is:

- Town Hall in the center.
- Learning Room toward the north.
- Coding Room toward the west.
- Chill Room toward the east.
- Focus Room toward the south.

This is only a starting proposal, not a finalized map design.

The actual map layout, dimensions, proportions, tile sizes, camera behavior, color palette, and furniture placement will be refined separately.

We want to create a visually appealing environment that feels like a small virtual campus or community building.

We should first focus on the map itself and refine it until the visual design is satisfactory.

The initial map can be explored and refined using SVG. Eventually, the runtime environment should use suitable game-ready assets, such as tilemaps and sprite sheets.

## 6. Characters and Movement

Users should enter the world as visible 2D pixel-art characters.

For V1:

- Provide a collection of predefined avatars.
- Users can select an avatar before entering the world.
- Advanced avatar customization is not required initially.

The characters should support:

- Idle animation.
- Walking animation.
- Sitting animation.
- Basic interaction animations where appropriate.

Movement controls:

- WASD keys.
- Arrow keys.

Movement should feel smooth and responsive.

The application should support:

- Collision detection.
- Walls and furniture blocking movement.
- Character positioning.
- Appropriate movement animations.
- Camera behavior suitable for the map.
- Multiple characters appearing simultaneously.

The movement experience should not feel delayed, jittery, or unnatural.

## 7. Multiplayer Experience

The world is a shared multiplayer environment.

Multiple users should be able to enter the same world and see one another moving in real time.

V1 capacity:

**Maximum 20 users in one world across the entire map.**

This is a world-wide limit, not a limit of 20 users per area.

Expected behavior:

- Multiple users can join the same world.
- Every connected user can see other connected users.
- Character movement is synchronized.
- Users can walk around independently.
- Users can enter different areas.
- Users can meet one another naturally.
- Users should appear and disappear appropriately when joining or leaving.
- The server should enforce the 20-user limit.

The multiplayer experience should be reliable and smooth.

The application should eventually handle movement synchronization, player presence, joining, leaving, and reconnection.

## 8. Proximity-Based Voice Communication

Voice communication is one of the most important features of the project.

We want users to communicate naturally based on their position inside the virtual world.

This should resemble proximity voice chat in multiplayer games.

Expected behavior:

- Users can speak through their microphones.
- Nearby users can hear one another.
- Moving away from another user should end the voice connection once they leave the proximity range.
- Disconnection should happen immediately, not through a gradual volume fade.
- Users should have mute/unmute controls.
- Users in different rooms must not hear each other, even if their coordinates appear close.
- Voice behavior must respect room boundaries and voice zones.

Room-specific behavior:

| Area | Voice behavior |
|---|---|
| Town Hall | One shared proximity voice zone |
| Coding Room | Proximity voice enabled |
| Learning Room | Proximity voice enabled |
| Chill Room | Proximity voice enabled |
| Focus Room | Disabled by default; users may temporarily enable it |

The proximity range and exact voice interaction rules will be finalized in the PRD.

The system should use a dedicated real-time audio solution rather than sending audio data through the game-state synchronization system.

We need to keep game networking and voice communication conceptually separate:

- Game networking handles player positions, movement, and presence.
- Voice infrastructure handles real-time audio communication.

The voice system must be aware of the user's current room and proximity to other users.

## 9. World Creation, Invitations, and Lifecycle

The application should be private and invite-only in V1.

There should be no public world discovery or publicly accessible rooms initially.

Expected workflow:

1. A user logs in.
2. The user creates a private world.
3. The creator becomes the world administrator.
4. The application generates a private invitation code or link.
5. The creator shares it with friends or teammates.
6. Other users use the invitation to join.
7. Everyone enters the same shared map.
8. Users can interact until they leave the world.

World lifecycle:

- A world remains active while users are present.
- When the last user leaves, the world enters a 10-minute grace period.
- If someone rejoins during this period, the deletion process is cancelled.
- If nobody returns before the grace period ends, the world is deleted.

The lifecycle should be implemented reliably, including cases where the multiplayer server temporarily goes offline or sleeps.

The exact persistence model and cleanup mechanism will be decided during technical architecture.

## 10. Authentication and User Management

Login is required to use the application.

Users should have accounts.

The authentication system should support:

- Registration.
- Login.
- Logout.
- Authenticated access to the application.
- Secure world creation.
- Secure invitation-based joining.

World ownership and administrative permissions should be associated with the user who created the world.

The system must not allow users to bypass invitation requirements or exceed the world capacity.

Detailed authentication flows, account recovery, profile management, and permissions will be finalized in the V1 PRD.

## 11. Product Design Philosophy

The application should prioritize:

1. Simplicity.
2. Smooth performance.
3. A visually appealing pixel-art environment.
4. Natural movement.
5. Reliable multiplayer synchronization.
6. High-quality voice communication.
7. A clean and intuitive user interface.
8. Private and secure world access.

We do not want to overcomplicate V1 with unnecessary features.

The main goal is to build a polished and functional virtual world where people can naturally meet, move, talk, learn, collaborate, and work.

The product should feel like a real interactive environment, not a static website with a few avatars.

## 12. Proposed Technology Direction

The following is our current proposed technology direction. It is not yet a finalized architecture.

We want to use TypeScript as the primary programming language.

Potential stack:

| Layer | Proposed technology |
|---|---|
| Frontend | React + Vite |
| Language | TypeScript |
| Game engine | Phaser 3 |
| UI styling | Tailwind CSS |
| Map design | SVG initially, then Tiled Map Editor |
| Pixel-art assets | Pixelorama |
| SVG editing | Inkscape |
| Multiplayer state | Colyseus |
| Backend | Node.js |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| Database hosting | Supabase |
| ORM | Prisma, subject to architectural evaluation |
| Voice | LiveKit + WebRTC |
| Package manager | pnpm |
| Version control | Git + GitHub |
| Unit testing | Vitest |
| Browser testing | Playwright |

The architecture should separate:

- Frontend user interface.
- Game rendering and movement.
- Multiplayer synchronization.
- Backend business logic.
- Authentication and database.
- Real-time voice communication.

We prefer PostgreSQL over MongoDB.

We want to avoid unnecessary infrastructure and services.

The proposed technologies should be evaluated before final selection. Do not assume every item is mandatory.

## 13. Budget and Deployment Constraints

A major project constraint is that we want to build and initially deploy the application with a zero-cost approach wherever possible.

We want to investigate free-tier services for:

- Frontend hosting.
- Backend hosting.
- Database.
- Authentication.
- Voice communication.

Potential services include:

- Cloudflare Pages.
- Render.
- Supabase.
- LiveKit Cloud.

These are candidates, not finalized choices.

Important considerations:

- Free tiers may have usage limits.
- Backend services may sleep when inactive.
- Voice services may have participant-minute or bandwidth limits.
- Database services may have inactivity restrictions.
- A free deployment may not guarantee production-grade availability.

Do not assume that a free tier will support unlimited usage or 24/7 availability.

Our target is to minimize cost while keeping the application technically sound.

We should identify potential limitations before committing to a deployment architecture.

## 14. Development Approach

We will build the application in small, independently testable stages.

We do not want to generate the entire application in one large implementation.

The preferred development sequence is:

### Stage 1 — Map and Visual Assets

- Design the complete 2D world.
- Create and refine the five connected areas.
- Develop the pixel-art visual direction.
- Create initial character/avatar assets.
- Review and improve the map until it is visually approved.

At this stage, the focus is on the visual environment, not full multiplayer functionality.

### Stage 2 — Single-Player Game Mechanics

- Render the map in the game engine.
- Add one character.
- Implement WASD and arrow-key movement.
- Implement smooth movement.
- Add collision detection.
- Add character animations.
- Add camera behavior.
- Detect which area the character is currently inside.

Test and optimize before proceeding.

### Stage 3 — Multiplayer Synchronization

- Add multiple characters.
- Implement real-time player synchronization.
- Synchronize movement and positions.
- Handle joining and leaving.
- Implement world capacity.
- Test with multiple browser sessions.

### Stage 4 — Authentication and World Management

- Implement login and registration.
- Add world creation.
- Add private invitations.
- Add joining through invitation links or codes.
- Add administrator ownership.
- Implement the world lifecycle and cleanup rules.

The exact timing of authentication integration can be adjusted in the final development plan, but it must be completed before the product is considered usable.

### Stage 5 — Voice Communication

- Integrate the real-time voice system.
- Implement proximity-based communication.
- Enforce room boundaries.
- Implement microphone controls.
- Implement Focus Room voice behavior.
- Test voice behavior with multiple users.

### Stage 6 — Optimization and Deployment

- Test the complete application.
- Fix performance and synchronization issues.
- Test edge cases.
- Improve the user interface.
- Verify security and access controls.
- Deploy the application.
- Document the deployment and operating limitations.

Each stage must be tested and reviewed before moving to the next stage.

The exact order and scope will be finalized in the development plan.

## 15. How We Want You to Work

You are the primary AI coding agent for this project.

We are using Google Antigravity for development.

We want an iterative, review-driven workflow.

For every development milestone:

1. We explain the required milestone.
2. You inspect the existing project and relevant documentation.
3. You analyze the requirements.
4. You propose an implementation plan.
5. You explain the files and components that will be affected.
6. You identify risks and dependencies.
7. You wait for approval.
8. Only after approval, implement the milestone.
9. Test the implementation.
10. Report the results and any remaining issues.
11. Refine the work based on feedback.
12. Once approved, prepare it for a Git commit.

Do not independently jump to future stages.

Do not make major product or architecture decisions without discussing them first.

Prefer clean, modular, maintainable code.

Keep documentation updated as the project evolves.

We expect you to help with:

- Product and technical planning.
- Code implementation.
- Debugging.
- Browser-based testing.
- Performance optimization.
- Refactoring.
- Documentation.
- Deployment.

## 16. Documentation We Intend to Maintain

We plan to maintain the following project documentation:

- `AGENTS.md` — Persistent instructions and development rules for the AI agent.
- `PROJECT_CONTEXT.md` — Overall product vision and background.
- `PRD.md` — Formal V1 Product Requirements Document.
- `ARCHITECTURE.md` — Technical architecture and system design.
- `GAME_DESIGN.md` — Map, movement, character, and game interaction specifications.
- `DEVELOPMENT_PLAN.md` — Development milestones and implementation order.
- `DECISIONS.md` — Important technical and product decisions.

These documents should become the source of truth for development.

Do not create these files yet. We will prepare and approve them step by step.

---

## 17. What We Expect From You Right Now

For this first interaction, do not write code or create the application.

We want you to demonstrate that you understand the project.

Please respond with:

1. **Your understanding:** Explain what we are building in your own words.
2. **User journey:** Describe how a user will experience the application from login to interacting with friends.
3. **World design:** Explain how the five areas connect and how users move between them.
4. **Multiplayer design:** Explain the intended shared-world behavior and 20-user limit.
5. **Voice design:** Explain the room-aware proximity voice requirements.
6. **Technical challenges:** Identify the most important challenges we will need to solve.
7. **Potential risks:** Identify possible performance, networking, voice, hosting, and lifecycle problems.
8. **Missing decisions:** List the requirements that are not yet precise enough to implement.
9. **PRD preparation:** Recommend the sections that should be included in our formal V1 PRD.

Do not start implementation.

We will review your understanding and then provide the next instruction.

**The immediate goal is understanding and alignment, not coding.**