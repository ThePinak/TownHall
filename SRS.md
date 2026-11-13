# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

## Private Pixel-Art Multiplayer Social World

**Document version:** 1.0
**Status:** Approved baseline (aligned with `DECISIONS.md`)
**Project type:** Web-based multiplayer application
**Development agent:** Google Antigravity

---

# 1. Introduction

## 1.1 Purpose

This document defines the software requirements for a private, invite-only, multiplayer virtual world application.

The application will allow authenticated users to create private virtual worlds, invite other users, and interact inside a shared 2D pixel-art environment.

Users will be able to move their characters around the environment, meet other users, and communicate using proximity-based voice chat.

This SRS establishes the expected system behavior, functional requirements, non-functional requirements, user interactions, constraints, and acceptance conditions.

It will serve as a foundation for preparing the formal V1 Product Requirements Document and technical architecture.

## 1.2 Scope

The software will provide:

- User authentication.
- Private world creation.
- Invitation-based world access.
- A shared 2D multiplayer environment.
- Five interconnected virtual areas.
- Predefined character selection.
- Keyboard-based character movement.
- Collision detection.
- Real-time multiplayer synchronization.
- Room-aware proximity voice communication.
- World administration and lifecycle management.

The application is intended for small groups of friends, students, developers, and collaborators who want to interact in a virtual environment.

## 1.3 Definitions

| Term               | Description                                            |
| ------------------ | ------------------------------------------------------ |
| World              | A private virtual environment created by a user        |
| World Admin        | The user who creates and owns a world                  |
| Player             | An authenticated user currently inside a world         |
| Avatar             | The visual character representing a player             |
| Area / Room        | A physical section of the shared map                   |
| Voice Zone         | A logical area determining which users may communicate |
| Proximity          | The distance between two players in the virtual world  |
| Invitation Code    | A private code used to join a world                    |
| Grace Period       | The 10-minute period before an empty world is deleted  |
| Multiplayer Server | The server responsible for coordinating player state   |
| Tilemap            | A grid-based representation of the game environment    |

## 1.4 Intended Users

**World Creator / Administrator**

- Creates a private world.
- Receives an invitation code or link.
- Shares invitations with other users.
- Has administrative ownership of the world.

**World Participant**

- Joins an existing world using an invitation.
- Selects an avatar.
- Moves around the environment.
- Interacts with other participants.
- Uses voice communication according to room rules.

---

# 2. Overall System Description

## 2.1 Product Perspective

The application consists of several cooperating subsystems:

1. Frontend application.
2. Authentication and account management.
3. World management.
4. 2D game rendering and movement.
5. Multiplayer synchronization.
6. Voice communication.
7. Database and persistent storage.

The frontend will present the interface and render the virtual environment.

The game subsystem will manage player movement, map rendering, collision, and room detection.

The multiplayer subsystem will synchronize players and maintain shared-world state.

The voice subsystem will handle real-time audio communication according to room and proximity rules.

The backend and database will manage users, world information, invitations, and lifecycle information.

## 2.2 High-Level User Workflow

The expected workflow is:

1. A user opens the application.
2. The user registers or logs in.
3. The user reaches the application dashboard.
4. The user chooses to create a world or join an existing world.
5. When creating a world, the user becomes its administrator.
6. The application generates a private invitation code or link.
7. Other authenticated users join through the invitation.
8. The user selects a predefined avatar.
9. The user enters the virtual world.
10. The user spawns inside the Town Hall.
11. The user moves around using the keyboard.
12. The user meets other participants.
13. Voice communication becomes available according to the current room and proximity.
14. The user can leave the world at any time.

Detailed screen layouts and interaction flows will be specified in the PRD.

## 2.3 System Environment

The application is intended to run in modern desktop web browsers.

Initial development and testing should prioritize desktop browsers.

The application should support:

- Modern Chromium-based browsers.
- Firefox.
- Other modern browsers where technically feasible.

Mobile browser support, touch controls, and responsive gameplay behavior are not finalized for V1.

---

# 3. Functional Requirements

Functional requirements define what the application must do.

## 3.1 Authentication and Account Management

**FR-AUTH-01:** The system shall require users to authenticate before accessing private worlds.

**FR-AUTH-02:** The system shall support user registration.

**FR-AUTH-03:** The system shall support user login.

**FR-AUTH-04:** The system shall support user logout.

**FR-AUTH-05:** The system shall maintain authenticated user identity during an active session.

**FR-AUTH-06:** The system shall prevent unauthenticated users from accessing private world content.

**FR-AUTH-07:** The system shall associate each created world with its creator.

**FR-AUTH-08:** The system shall handle expired or invalid authentication sessions appropriately.

Account recovery, social login, email verification, and profile customization require further product decisions.

## 3.2 Dashboard and Navigation

**FR-DASH-01:** After successful authentication, users shall be able to access the main dashboard.

**FR-DASH-02:** The dashboard shall provide an option to create a new private world.

**FR-DASH-03:** The dashboard shall provide an option to join an existing world.

**FR-DASH-04:** The application shall provide a way to enter an invitation code or follow an invitation link.

**FR-DASH-05:** The interface shall communicate relevant errors, such as invalid invitations or full worlds.

**FR-DASH-06:** Users shall be able to leave an active world and return to the application.

## 3.3 World Creation and Management

**FR-WORLD-01:** Every authenticated user shall be allowed to create a private world.

**FR-WORLD-02:** The user creating a world shall automatically become its administrator.

**FR-WORLD-03:** The system shall generate a unique world identifier.

**FR-WORLD-04:** The system shall generate a private invitation code or invitation link.

**FR-WORLD-05:** The administrator shall be able to share the invitation with other users.

**FR-WORLD-06:** The system shall allow authenticated users with a valid invitation to join the corresponding world.

**FR-WORLD-07:** The system shall reject invalid invitations.

**FR-WORLD-08:** The system shall reject attempts to join a world that has reached its maximum capacity.

**FR-WORLD-09:** The system shall enforce a maximum of 20 concurrent users in one world.

**FR-WORLD-10:** The capacity limit shall apply across all five areas collectively.

**FR-WORLD-11:** The system shall prevent unauthorized users from entering a private world.

**FR-WORLD-12:** The system shall track the number of active participants.

**FR-WORLD-13:** The system shall update world presence when users join or leave.

**FR-WORLD-14:** The system shall maintain the world while at least one participant remains connected.

**FR-WORLD-15:** When the final participant leaves, the system shall initiate a 10-minute grace period.

**FR-WORLD-16:** If a participant rejoins during the grace period, the pending deletion shall be cancelled.

**FR-WORLD-17:** If no participant rejoins before the grace period expires, the system shall delete the world according to the approved lifecycle policy.

**FR-WORLD-18:** The lifecycle mechanism shall account for server restarts and temporary service unavailability.

The exact treatment of world metadata, invitation expiry, and whether a user can own multiple worlds will be finalized later.

## 3.4 Avatar Selection

**FR-AVATAR-01:** The system shall provide a collection of predefined avatars.

**FR-AVATAR-02:** Users shall be able to select an avatar before entering a world.

**FR-AVATAR-03:** The selected avatar shall represent the user inside the virtual environment.

**FR-AVATAR-04:** Other participants shall see the selected avatar.

**FR-AVATAR-05:** The system shall support idle and walking animations.

**FR-AVATAR-06:** The system should support sitting animations.

**FR-AVATAR-07:** The system should support basic interaction animations where appropriate.

**FR-AVATAR-08:** The selected avatar shall remain consistent during the active world session.

Advanced avatar customization is outside the initial scope.

## 3.5 Map and Environment

**FR-MAP-01:** Each world shall contain one shared 2D map.

**FR-MAP-02:** The map shall use a top-down pixel-art visual style.

**FR-MAP-03:** The map shall contain five distinct areas:

- Town Hall.
- Coding Room.
- Learning Room.
- Chill Room.
- Focus Room.

**FR-MAP-04:** All five areas shall be connected through walkable pathways, corridors, or entrances.

**FR-MAP-05:** Users shall be able to move freely between areas.

**FR-MAP-06:** Moving between areas shall not require loading a separate map.

**FR-MAP-07:** Each area shall have a distinct visual identity.

**FR-MAP-08:** The environment shall contain appropriate furniture and decorations.

**FR-MAP-09:** Walls and furniture designated as solid objects shall block player movement.

**FR-MAP-10:** The system shall identify the area occupied by each player.

**FR-MAP-11:** The Town Hall shall be the default spawn location.

**FR-MAP-12:** Newly joined users shall spawn at an appropriate unoccupied or safe position in the Town Hall.

**FR-MAP-13:** The map shall support collision boundaries and designated interaction objects.

**FR-MAP-14:** The map design shall be maintainable and editable without rewriting the entire game system.

The initial map will be designed and reviewed independently before full gameplay implementation.

## 3.6 Character Movement

**FR-MOVE-01:** Users shall control their characters using WASD keys.

**FR-MOVE-02:** Users shall also be able to use arrow keys.

**FR-MOVE-03:** The system shall support movement in the four cardinal directions.

**FR-MOVE-04:** Movement shall be smooth and responsive.

**FR-MOVE-05:** The character shall display the appropriate walking animation while moving.

**FR-MOVE-06:** The character shall display the idle animation when stationary.

**FR-MOVE-07:** The character shall not move through walls or solid furniture.

**FR-MOVE-08:** The system shall maintain valid player coordinates within the map boundaries.

**FR-MOVE-09:** The system shall update the player's current area when the player crosses an area boundary.

**FR-MOVE-10:** The game shall provide a suitable camera view of the environment.

**FR-MOVE-11:** Movement shall remain responsive when multiple users are present.

**FR-MOVE-12:** The system shall handle simultaneous or conflicting keyboard inputs safely.

**FR-MOVE-13:** The system shall prevent invalid movement states caused by malformed or unauthorized client updates.

Movement speed, diagonal movement behavior, collision dimensions, and camera settings will be specified during game design.

## 3.7 Multiplayer Synchronization

**FR-MULTI-01:** Multiple authenticated users shall be able to join the same world.

**FR-MULTI-02:** The system shall support up to 20 concurrent participants in a world.

**FR-MULTI-03:** All participants shall share the same map instance.

**FR-MULTI-04:** Each participant shall have an independently controlled character.

**FR-MULTI-05:** The system shall synchronize player positions between participants.

**FR-MULTI-06:** The system shall synchronize player movement and relevant character states.

**FR-MULTI-07:** A participant shall be able to see other participants moving in real time.

**FR-MULTI-08:** The system shall register new participants when they join.

**FR-MULTI-09:** The system shall remove participants from active presence when they leave or disconnect.

**FR-MULTI-10:** The system shall handle temporary network disconnections.

**FR-MULTI-11:** The system shall prevent one client from directly overriding another player's authoritative state.

**FR-MULTI-12:** The server shall validate player movement and world capacity.

**FR-MULTI-13:** The system shall provide appropriate behavior when a participant reconnects.

**FR-MULTI-14:** Participants in different areas shall still belong to the same world and multiplayer instance.

**FR-MULTI-15:** Player state shall remain consistent across the world.

The implementation should prioritize smooth movement, low latency, and reliable state synchronization.

## 3.8 Voice Communication

**FR-VOICE-01:** The application shall provide real-time voice communication.

**FR-VOICE-02:** Users shall be able to grant microphone access through the browser.

**FR-VOICE-03:** Users shall be able to mute and unmute their microphones.

**FR-VOICE-04:** The system shall determine voice eligibility based on the user's current area.

**FR-VOICE-05:** The system shall determine voice eligibility based on the distance between players.

**FR-VOICE-06:** Users shall hear eligible nearby participants in the same voice zone.

**FR-VOICE-07:** Users shall not hear participants in other rooms.

**FR-VOICE-08:** Moving outside the permitted proximity range shall immediately disconnect the corresponding voice relationship.

**FR-VOICE-09:** The voice system shall update when users move between areas.

**FR-VOICE-10:** Voice communication shall not be transmitted through the game-state synchronization channel.

**FR-VOICE-11:** The system shall provide appropriate feedback when microphone permission is unavailable or denied.

**FR-VOICE-12:** The system shall handle voice connection and disconnection events gracefully.

### Room-specific voice requirements

| Area          | Requirement                                           |
| ------------- | ----------------------------------------------------- |
| Town Hall     | One shared proximity voice zone                       |
| Coding Room   | Proximity voice enabled                               |
| Learning Room | Proximity voice enabled                               |
| Chill Room    | Proximity voice enabled                               |
| Focus Room    | Voice disabled by default; temporary opt-in available |

**FR-VOICE-13:** Town Hall shall operate as one logical voice zone with proximity-based communication within that zone.

**FR-VOICE-14:** Coding Room, Learning Room, and Chill Room shall each enforce their own room boundaries for voice communication.

**FR-VOICE-15:** Focus Room users shall not automatically participate in voice communication.

**FR-VOICE-16:** A user in the Focus Room shall be able to temporarily enable voice.

**FR-VOICE-17:** Voice participation shall remain subject to room and proximity rules.

**FR-VOICE-18:** Voice eligibility shall be enforced by trusted server-side or appropriately trusted voice-access logic, not merely by hiding audio controls in the frontend.

**FR-VOICE-19:** The system shall not allow users in different rooms to communicate simply because their map coordinates are close.

The following details remain to be finalized:

- Exact proximity radius.
- Whether distance is measured in tiles, pixels, or world units.
- How temporary Focus Room voice works.
- Whether enabling Focus Room voice creates a separate voice zone or permits temporary room-level interaction.
- Whether users receive visual indicators when another participant is speaking.

## 3.9 Room and Area Management

**FR-ROOM-01:** Each player shall have a current area identifier.

**FR-ROOM-02:** Area identification shall update when a player crosses a room boundary.

**FR-ROOM-03:** Area transitions shall not create a new world instance.

**FR-ROOM-04:** Area detection shall be independent of purely visual map decorations.

**FR-ROOM-05:** The system shall use logical area boundaries to enforce voice rules.

**FR-ROOM-06:** A player shall be able to move freely between all five areas.

**FR-ROOM-07:** Area membership shall be synchronized sufficiently for multiplayer and voice behavior.

## 3.10 User Interface and Controls

**FR-UI-01:** The application shall provide a clear registration and login interface.

**FR-UI-02:** The application shall provide a dashboard for world creation and joining.

**FR-UI-03:** The application shall provide an avatar selection interface.

**FR-UI-04:** The game interface shall display the shared environment and player characters.

**FR-UI-05:** The interface shall provide microphone mute/unmute controls.

**FR-UI-06:** The interface shall provide a way to leave the world.

**FR-UI-07:** The interface shall provide relevant feedback for connection and permission errors.

**FR-UI-08:** Important controls shall be easy to identify and use.

**FR-UI-09:** The game interface should avoid unnecessary visual clutter.

Exact interface layouts and additional controls will be defined in the PRD.

---

# 4. Non-Functional Requirements

## 4.1 Performance

**NFR-PERF-01:** Character movement should feel smooth and responsive.

**NFR-PERF-02:** The application should maintain stable rendering performance with 20 participants in a world under supported test conditions.

**NFR-PERF-03:** Multiplayer updates should avoid unnecessary network traffic.

**NFR-PERF-04:** Voice communication should have low latency under normal network conditions.

**NFR-PERF-05:** The application should load the game environment efficiently.

**NFR-PERF-06:** Asset loading should be optimized to avoid unnecessary delays.

**NFR-PERF-07:** The application should avoid memory leaks and unnecessary resource consumption during extended sessions.

Quantitative performance targets, such as frame rate, network update frequency, and latency thresholds, will be finalized in the PRD and architecture.

## 4.2 Reliability

**NFR-REL-01:** The system should handle unexpected client disconnections.

**NFR-REL-02:** A temporary client disconnection should not corrupt world state.

**NFR-REL-03:** World lifecycle management should remain reliable across backend restarts.

**NFR-REL-04:** Failed voice connections should not interrupt the rest of the application.

**NFR-REL-05:** A participant should receive appropriate feedback when the world server is unavailable.

## 4.3 Security

**NFR-SEC-01:** Authentication shall be required for private world access.

**NFR-SEC-02:** Invitation codes shall be sufficiently unpredictable to prevent easy guessing.

**NFR-SEC-03:** The server shall validate invitations.

**NFR-SEC-04:** The server shall enforce world membership and capacity restrictions.

**NFR-SEC-05:** Users shall not be allowed to modify another participant's authoritative player state.

**NFR-SEC-06:** Sensitive credentials and tokens shall not be exposed to unauthorized clients.

**NFR-SEC-07:** Database access shall follow appropriate authorization policies.

**NFR-SEC-08:** Microphone access shall follow browser permission rules.

**NFR-SEC-09:** The system shall not allow users to bypass room-aware voice restrictions through client-side manipulation.

**NFR-SEC-10:** Administrative operations shall be restricted to authorized administrators.

## 4.4 Usability

**NFR-USE-01:** The application should be easy to understand without extensive instructions.

**NFR-USE-02:** The process of creating or joining a world should be straightforward.

**NFR-USE-03:** Keyboard controls should behave consistently.

**NFR-USE-04:** Rooms should be visually distinguishable.

**NFR-USE-05:** Voice controls should be accessible and understandable.

**NFR-USE-06:** Error messages should explain the problem and, where possible, suggest a solution.

## 4.5 Maintainability

**NFR-MAIN-01:** The application should use a modular codebase.

**NFR-MAIN-02:** Game logic, UI logic, multiplayer logic, and voice logic should be separated.

**NFR-MAIN-03:** Shared data structures should have consistent TypeScript definitions.

**NFR-MAIN-04:** The codebase should be documented.

**NFR-MAIN-05:** New rooms and visual assets should be addable without redesigning the complete application.

**NFR-MAIN-06:** The system should support automated testing.

## 4.6 Compatibility

**NFR-COMP-01:** The initial application should prioritize desktop browser compatibility.

**NFR-COMP-02:** Keyboard input shall work in supported browsers.

**NFR-COMP-03:** Voice communication shall use browser-supported microphone and audio capabilities.

**NFR-COMP-04:** Unsupported browser capabilities should be communicated clearly.

## 4.7 Scalability

**NFR-SCALE-01:** The system shall support multiple independent private worlds.

**NFR-SCALE-02:** The 20-user limit shall apply independently to each world.

**NFR-SCALE-03:** The system should be structured so that future capacity improvements do not require a complete redesign.

**NFR-SCALE-04:** The system should avoid unnecessary coupling between world instances.

---

# 5. Use Cases

## UC-01: Register an Account

**Actor:** New user

**Precondition:** User is not authenticated.

**Main flow:**

1. User opens the application.
2. User selects registration.
3. User provides the required registration information.
4. System validates the information.
5. System creates the account.
6. User is authenticated or redirected to login, depending on the authentication flow.

**Alternative flow:** Invalid or already-used registration information is rejected with an appropriate message.

**Postcondition:** User has an account.

## UC-02: Log In

**Actor:** Registered user

**Precondition:** User has an account.

**Main flow:**

1. User opens the login page.
2. User enters credentials.
3. System validates credentials.
4. System establishes an authenticated session.
5. User reaches the dashboard.

**Postcondition:** User is authenticated.

## UC-03: Create a World

**Actor:** Authenticated user

**Precondition:** User is logged in.

**Main flow:**

1. User selects Create World.
2. System creates a private world.
3. System assigns the creator as administrator.
4. System generates an invitation code or link.
5. System presents the invitation to the creator.
6. Creator enters the world.

**Postcondition:** A private world exists and its creator is the administrator.

## UC-04: Join a World

**Actor:** Authenticated user

**Precondition:** User has a valid invitation.

**Main flow:**

1. User enters an invitation code or opens an invitation link.
2. System validates the invitation.
3. System checks world availability.
4. System checks the capacity limit.
5. System registers the participant.
6. User selects an avatar if one has not already been selected.
7. User enters the Town Hall.

**Alternative flows:**

- Invalid invitation: joining is rejected.
- Full world: joining is rejected with a clear message.
- Expired or deleted world: joining is rejected.
- Temporary connection failure: user receives an error and can retry.

**Postcondition:** User becomes an active participant.

## UC-05: Move Around the World

**Actor:** Active participant

**Precondition:** User is inside a world.

**Main flow:**

1. User presses WASD or an arrow key.
2. The character moves in the corresponding direction.
3. The game checks collision boundaries.
4. The character's position is updated.
5. The appropriate animation is displayed.
6. Other participants receive the updated position.
7. The system updates area membership when the player enters another area.

**Postcondition:** The character occupies a valid position in the shared map.

## UC-06: Communicate With Nearby Participants

**Actor:** Active participant

**Precondition:** Microphone permission has been granted and voice is enabled.

**Main flow:**

1. User enters a voice-enabled area.
2. System identifies eligible participants in the same voice zone.
3. System checks proximity.
4. Eligible participants can communicate.
5. When the user moves outside the permitted range, the voice relationship is disconnected.

**Alternative flows:**

- Microphone permission denied: voice cannot start.
- User muted: microphone audio is not transmitted.
- User enters another room: previous room voice relationships are removed.
- Voice service unavailable: game remains usable without voice.

**Postcondition:** Only eligible participants can communicate.

## UC-07: Use the Focus Room

**Actor:** Active participant

**Precondition:** User is inside the Focus Room.

**Main flow:**

1. User enters the Focus Room.
2. Voice is disabled by default.
3. User works silently.
4. If needed, user explicitly enables temporary voice.
5. Voice behavior follows the finalized Focus Room voice rules.
6. User disables voice or leaves the room.

**Postcondition:** The default experience remains quiet.

## UC-08: Leave a World

**Actor:** Active participant

**Main flow:**

1. User selects Leave World or disconnects.
2. System removes the participant from active presence.
3. System updates the world participant count.
4. If other participants remain, the world continues.
5. If the user was the last participant, the 10-minute grace period begins.

**Postcondition:** User is no longer an active participant.

## UC-09: Rejoin During the Grace Period

**Actor:** Previously connected user or another invited participant

**Precondition:** World is within its 10-minute grace period and remains joinable.

**Main flow:**

1. User attempts to join.
2. System validates access.
3. System cancels pending deletion.
4. User joins the world.

**Postcondition:** The world continues instead of being deleted.

## UC-10: Delete an Empty World

**Actor:** System

**Precondition:** World has remained empty for the entire grace period.

**Main flow:**

1. System identifies an empty world.
2. System verifies that its grace period has expired.
3. System confirms that no participant has rejoined.
4. System deletes the world according to the approved cleanup policy.

**Postcondition:** The expired world is removed.

---

# 6. Data Requirements

The following is an initial logical data model, not a finalized database schema.

## 6.1 User

Represents an authenticated application user.

Potential attributes:

- User ID.
- Display name.
- Email or authentication identifier.
- Avatar selection.
- Account creation timestamp.

## 6.2 World

Represents an independently created private virtual world.

Potential attributes:

- World ID.
- World name, if supported.
- Creator / administrator user ID.
- Invitation code or invitation reference.
- World status.
- Creation timestamp.
- Last active timestamp.
- Empty timestamp.
- Scheduled deletion timestamp.

## 6.3 World Membership

Represents the relationship between users and worlds.

Potential attributes:

- Membership ID.
- World ID.
- User ID.
- Membership role.
- Join timestamp.
- Leave timestamp.

## 6.4 Player Session

Represents an active player's session inside a world.

Potential attributes:

- Session ID.
- User ID.
- World ID.
- Selected avatar.
- Current position.
- Current area.
- Connection status.
- Last activity timestamp.

Active movement and player state should not automatically be treated as permanent database records. The architecture will determine which information belongs in real-time memory and which needs persistence.

## 6.5 Room / Area Configuration

Represents the logical areas of a map.

Potential attributes:

- Area ID.
- Area name.
- World or map reference.
- Boundary information.
- Voice configuration.
- Spawn or interaction metadata.

## 6.6 Voice State

Voice state may be represented as transient session information rather than permanent database data.

Potential attributes:

- Participant ID.
- Current voice zone.
- Microphone enabled status.
- Mute status.
- Temporary voice permission status.

Voice recordings are not part of the initial requirements.

---

# 7. External Interface Requirements

## 7.1 User Interface

The application should provide the following major interfaces:

1. Registration page.
2. Login page.
3. Main dashboard.
4. World creation interface.
5. World joining interface.
6. Invitation sharing interface.
7. Avatar selection interface.
8. Main multiplayer game interface.
9. Voice controls.
10. Leave-world interaction.

## 7.2 Hardware Interfaces

The application requires:

- A supported computer or device.
- A keyboard for initial movement controls.
- A microphone for voice communication.
- Speakers or headphones for audio output.

## 7.3 Software Interfaces

The application will integrate with:

- Authentication service.
- Database service.
- Multiplayer communication service.
- Real-time voice communication service.
- Browser audio and microphone APIs.

The exact provider interfaces will be specified in the technical architecture.

## 7.4 Communication Interfaces

The system will require secure communication between:

- Browser and application backend.
- Browser and multiplayer server.
- Browser and real-time voice service.
- Backend and database.

The architecture should use appropriate secure transport protocols and authenticated communication.

---

# 8. Constraints and Assumptions

## 8.1 Product Constraints

1. The application is private and invite-only in V1.
2. There are five predefined areas.
3. All five areas belong to one interconnected map.
4. One world supports a maximum of 20 concurrent users.
5. Users spawn in Town Hall.
6. Users move with WASD or arrow keys.
7. Predefined avatars are used initially.
8. Voice is proximity-based and room-aware.
9. Focus Room voice is disabled by default.
10. An empty world has a 10-minute grace period.
11. The initial experience prioritizes desktop browsers.

## 8.2 Technical Constraints

1. TypeScript is the preferred primary language.
2. PostgreSQL is preferred over MongoDB.
3. The project should use modular architecture.
4. The game-state and voice systems should remain separate.
5. The deployment should minimize recurring costs.
6. Free-tier service limitations must be considered.
7. The system should not depend on a single browser session for authoritative multiplayer state.

## 8.3 Assumptions

1. Users have an internet connection.
2. Users have a supported browser.
3. Users grant microphone permission if they want to speak.
4. Users receive invitations from authorized participants.
5. The world map is initially shared and predefined.
6. Users can join a world only while it is available.

---

# 9. Out of Scope for Initial V1

The following features are not required for the initial release unless explicitly added later:

- Public world discovery.
- Publicly accessible worlds.
- Advanced avatar customization.
- User-created maps.
- Map editing by world administrators.
- Text messaging and persistent chat.
- Screen sharing.
- Video calling.
- File sharing.
- Private direct messaging.
- Friends and followers system.
- Virtual currency.
- In-world purchases.
- Complex gaming mechanics.
- Leaderboards and achievements.
- Mobile-specific touch controls.
- Multiple different map themes.
- Recording voice conversations.

These features may be considered for future versions.

---

# 10. Error Handling and Edge Cases

The system should account for the following situations:

1. User attempts to join with an invalid invitation.
2. User attempts to join a full world.
3. World is deleted while a user is attempting to join.
4. User loses internet connectivity.
5. Multiplayer server becomes unavailable.
6. Voice service becomes unavailable.
7. User denies microphone permission.
8. User closes the browser without leaving the world.
9. Two users attempt to join when only one slot remains.
10. User tries to access a world without authorization.
11. The final participant disconnects unexpectedly.
12. A user rejoins during the grace period.
13. The backend restarts during the grace period.
14. The user changes rooms while actively speaking.
15. A player attempts to move through a solid object.
16. A client sends invalid or manipulated movement updates.
17. A voice connection remains active after a user changes rooms.
18. A user tries to exceed the world capacity through multiple connections.

The system should fail safely and preserve consistent world state.

---

# 11. Testing Requirements

Testing should be performed incrementally.

## 11.1 Authentication Testing

- Registration.
- Login.
- Logout.
- Invalid credentials.
- Unauthorized world access.

## 11.2 World Management Testing

- World creation.
- Invitation generation.
- Valid invitation joining.
- Invalid invitation rejection.
- 20-user capacity enforcement.
- Empty-world grace period.
- Rejoining during grace period.
- Deletion after grace period.

## 11.3 Game Testing

- Map rendering.
- Character rendering.
- WASD movement.
- Arrow-key movement.
- Collision detection.
- Walking and idle animations.
- Room detection.
- Movement across connected areas.

## 11.4 Multiplayer Testing

- Two participants in one world.
- Multiple participants moving simultaneously.
- Participants in different rooms.
- Player joining and leaving.
- Network interruption.
- Reconnection.
- Maximum capacity.

## 11.5 Voice Testing

- Microphone permissions.
- Mute and unmute.
- Proximity-based communication.
- Different-room isolation.
- Immediate disconnection outside proximity.
- Focus Room default behavior.
- Temporary Focus Room voice.
- Voice service interruption.

## 11.6 Performance Testing

- Rendering performance with multiple characters.
- Network synchronization under load.
- Voice performance with multiple participants.
- Memory usage during extended sessions.
- Repeated room transitions.

---

# 12. Acceptance Criteria — Initial System-Level Expectations

The application will be considered to satisfy its core requirements when the following outcomes are demonstrated:

1. A user can register and log in.
2. An authenticated user can create a private world.
3. The creator receives an invitation code or link.
4. Another authenticated user can join using a valid invitation.
5. Invalid invitations are rejected.
6. The system prevents more than 20 concurrent participants in one world.
7. Every participant enters the same connected map.
8. Users spawn in Town Hall.
9. Users can move using WASD and arrow keys.
10. Characters cannot pass through solid obstacles.
11. Players can see one another moving in real time.
12. Users can move freely between all five areas.
13. Voice communication follows room boundaries and proximity.
14. Focus Room voice is disabled by default.
15. Voice relationships are disconnected immediately when proximity or room eligibility ends.
16. Leaving the world updates participant presence.
17. An empty world receives a 10-minute grace period.
18. Rejoining during that period prevents deletion.
19. An empty world is deleted after the grace period expires.
20. The application remains usable if the voice subsystem fails.

Quantitative performance thresholds and detailed test procedures will be established in the PRD and technical architecture.

---

# 13. Decisions Status and Reference

The previously open questions have been resolved in `DECISIONS.md` and `PRD.md` unless noted as deferred post-V1:

| ID     | Question                                                                          | Current status                                                                 |
| ------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| TBD-01 | What is the exact map size and tile size?                                         | **Approved (`ADR-02`, `DEC-01`):** 50 × 40 tiles at 32 × 32 px                 |
| TBD-02 | What is the exact proximity voice radius?                                         | **Approved (`ADR-01`):** 160 world pixels (center-to-center Euclidean)         |
| TBD-03 | What happens when a user temporarily enables voice in Focus Room?                 | **Approved (`ADR-04`, `DEC-08`):** Toggle-to-Talk; nearby Focus Room users hear |
| TBD-04 | Should Town Hall use proximity between nearby users within its shared voice zone? | **Approved (`DEC-11`):** Yes, 160 px proximity within Town Hall's shared zone  |
| TBD-05 | Should users be able to create multiple worlds?                                   | **Approved (`ADR-05`):** No; one active world per creator (incl. grace period) |
| TBD-06 | Should world administrators be able to remove participants?                       | **Deferred post-V1** (Admin = creator/owner & invite management in V1)         |
| TBD-07 | Should invitation links expire or be revocable?                                   | **Approved (`DEC-09`):** Secure hashed tokens with revoke/regenerate support   |
| TBD-08 | Should users retain their avatar selection between sessions?                      | **Approved (`ARCHITECTURE.md`):** Persist `avatar_id` in `profiles`            |
| TBD-09 | Should users be able to change avatars while inside a world?                      | **Deferred post-V1** (Selected before entering world)                          |
| TBD-10 | Should a returning participant respawn at Town Hall or a previous position?       | **Approved (`DEC-07`):** Town Hall safe spawn region                           |
| TBD-11 | What should happen if the administrator disconnects while others remain?          | **Approved:** World remains active while any participant remains               |
| TBD-12 | Is mobile support required in V1?                                                 | **Approved:** No; desktop-first V1                                             |
| TBD-13 | Should the system display participant names above characters?                     | **Approved (`DEC-06`):** Yes, included in V1                                   |
| TBD-14 | Should there be visual indicators for speaking and mute status?                   | **Approved (`DEC-06`):** Yes, included in V1                                   |
| TBD-15 | What are the exact performance targets?                                           | **Defined in `ARCHITECTURE.md` Sec 15.2 & `GAME_DESIGN.md`** (benchmarked in QA) |
| TBD-16 | What are the rules for simultaneous sessions from one account?                    | **Approved (`ADR-03`):** One active session per account; newest replaces old   |
| TBD-17 | Does world deletion remove all associated metadata and invitations immediately?   | **Approved (`ARCHITECTURE.md` Sec 12.3):** World marked deleted; invites invalid |

Refer to `DECISIONS.md` as the authoritative source of truth.

---

# 14. Future Extensibility

The system should be designed so that future versions can potentially introduce:

- Additional virtual areas.
- Additional avatar collections.
- Custom avatar appearance.
- Customizable worlds.
- More interaction animations.
- Text chat.
- Friends and contacts.
- Group activities.
- Shared study sessions.
- Screen sharing.
- Additional collaboration features.
- Mobile controls.
- More advanced world administration.

Future extensibility should not unnecessarily complicate the first version.

---

# 15. Instructions to the AI Development Agent

This SRS must be considered together with the previously provided Project Context document.

At this stage:

**DO NOT IMPLEMENT ANYTHING.**

Do not generate application code, install packages, create database schemas, or initialize the project.

Instead:

1. Read the complete Project Context.
2. Read this SRS.
3. Identify all functional and non-functional requirements.
4. Check whether the requirements are internally consistent.
5. Identify missing requirements and ambiguous behavior.
6. Highlight technical risks that may affect feasibility.
7. Identify requirements that need measurabl acceptance criteria.
8. Recommend any missing sections that should be included in the final V1 PRD.

Return a structured review with:

- Your understanding of the SRS.
- Functional requirement summary.
- Non-functional requirement summary.
- Requirement conflicts or ambiguities.
- Missing requirements.
- Technical risks.
- Open questions ranked by importance.
- Recommendations for preparing the V1 PRD.

Do not independently change the product vision.

Do not silently convert assumptions into confirmed requirements.

Wait for approval before proceeding to the next stage.

**The objective of this document is requirements alignment, not implementation.**
