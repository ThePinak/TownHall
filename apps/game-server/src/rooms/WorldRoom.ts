import colyseus from 'colyseus';
const { Room } = colyseus;
import type { Client } from 'colyseus';
import { WorldState } from '../schema/WorldState';
import { PlayerState } from '../schema/PlayerState';
import {
  MAX_WORLD_CAPACITY,
  MOVEMENT_SPEED,
  MAP_WIDTH_PX,
  MAP_HEIGHT_PX,
  MovePayload,
  JoinPayload,
  getZoneAt,
  AvatarId,
  AVATAR_IDS,
  DISCONNECT_CODE_NEWER_SESSION,
  DISCONNECT_CODE_CAPACITY_REACHED,
  VOICE_EVALUATION_INTERVAL_MS,
} from '@townhall/shared';
import { verifyAuthToken } from '../services/authService';
import { WorldService } from '../services/worldService';
import { SessionService } from '../services/sessionService';
import { LifecycleService } from '../services/lifecycleService';
import { VoiceService, ParticipantVoiceState } from '../services/voiceService';

// 20 Town Hall safe spawn coordinates from world-v1.tmj
export const TOWN_HALL_SPAWNS = [
  { x: 720, y: 592 }, { x: 755, y: 592 }, { x: 790, y: 592 }, { x: 825, y: 592 }, { x: 860, y: 592 },
  { x: 720, y: 620 }, { x: 755, y: 620 }, { x: 790, y: 620 }, { x: 825, y: 620 }, { x: 860, y: 620 },
  { x: 720, y: 650 }, { x: 755, y: 650 }, { x: 790, y: 650 }, { x: 825, y: 650 }, { x: 860, y: 650 },
  { x: 720, y: 678 }, { x: 755, y: 678 }, { x: 790, y: 678 }, { x: 825, y: 678 }, { x: 860, y: 678 },
];

export interface AuthContext {
  userId: string;
  displayName: string;
  avatarId: AvatarId;
}

export class WorldRoom extends Room<WorldState> {
  maxClients = MAX_WORLD_CAPACITY; // 20 concurrent users max (ADR-02 / DEC-10)
  private spawnIndex = 0;
  private userToClientMap = new Map<string, Client>(); // userId -> active Client socket

  onCreate(options: { worldId?: string }) {
    this.setState(new WorldState());
    this.state.worldId = options.worldId || 'test-world';

    // 20 Hz authoritative simulation & state patch interval (50ms)
    this.setSimulationInterval((deltaTime) => this.update(deltaTime), 50);

    // Client movement intent message handler
    this.onMessage('move', (client, data: MovePayload) => {
      this.handlePlayerMove(client, data);
    });

    // Voice state message handlers
    this.onMessage('voice:mute', (client, data: { isMuted: boolean }) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.isMuted = !!data.isMuted;
      }
    });

    this.onMessage('voice:speaking', (client, data: { isSpeaking: boolean }) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.isSpeaking = !!data.isSpeaking;
      }
    });

    this.onMessage('voice:focus-talk', (client, data: { enabled: boolean }) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        // Toggle-to-Talk only permissible while physically inside the Focus Room (DEC-07)
        player.focusTalkEnabled = player.zoneId === 'focus' ? !!data.enabled : false;
      }
    });

    // 10 Hz authoritative voice proximity & acoustic isolation evaluation loop (100ms)
    this.clock.setInterval(() => this.evaluateVoiceProximity(), VOICE_EVALUATION_INTERVAL_MS);
  }

  async onAuth(client: Client, options?: JoinPayload): Promise<AuthContext> {
    const worldId = this.state.worldId;

    // 1. Verify user authentication token
    let profile = await verifyAuthToken(options?.authToken);

    const userId = profile?.userId || options?.userId || `guest-${client.sessionId}`;
    const displayName = profile?.displayName || options?.displayName?.trim().slice(0, 20) || `Player-${client.sessionId.slice(0, 4)}`;
    const requestedAvatar = (profile?.avatarId || options?.avatarId) as AvatarId;
    const avatarId = AVATAR_IDS.includes(requestedAvatar) ? requestedAvatar : 'avatar-01';

    // 2. Access verification if world exists in DB
    const dbWorld = await WorldService.getWorld(worldId);
    if (dbWorld) {
      if (dbWorld.status === 'deleted') {
        throw new Error('This world has expired and no longer exists');
      }

      // If user is not the owner, validate invitation token
      if (dbWorld.ownerUserId !== userId) {
        if (!options?.inviteToken) {
          throw new Error('Private world: an invitation code or link is required to join');
        }
        const inviteValidation = await WorldService.validateInvite(options.inviteToken);
        if (!inviteValidation.valid || inviteValidation.worldId !== worldId) {
          throw new Error(inviteValidation.error || 'Invalid or expired invitation');
        }
      }
    }

    // 3. ADR-03: Single active session per account, newest session replaces previous
    const existingClient = this.userToClientMap.get(userId);
    if (existingClient && existingClient.sessionId !== client.sessionId) {
      console.log(`[ADR-03] Replacing existing session for user "${userId}". Disconnecting old socket ${existingClient.sessionId}`);
      try {
        existingClient.leave(DISCONNECT_CODE_NEWER_SESSION);
      } catch (err) {
        // Ignore if already disconnected
      }
      // Instantly revoke LiveKit voice permissions for the old session
      VoiceService.handleParticipantDisconnect(worldId, userId).catch(() => {});
    }

    // Record new active session
    await SessionService.claimSession(userId, client.sessionId);
    this.userToClientMap.set(userId, client);

    return {
      userId,
      displayName,
      avatarId,
    };
  }

  async onJoin(client: Client, options?: JoinPayload, auth?: AuthContext) {
    if (this.state.players.size >= this.maxClients) {
      throw new Error('World capacity reached (20/20 users)');
    }

    const player = new PlayerState();
    player.sessionId = client.sessionId;
    player.userId = auth?.userId || options?.userId || `user-${client.sessionId}`;
    player.displayName = auth?.displayName || options?.displayName?.trim().slice(0, 20) || `Player-${client.sessionId.slice(0, 4)}`;
    player.avatarId = auth?.avatarId || options?.avatarId || 'avatar-01';

    // Assign safe spawn position in Town Hall
    const spawn = TOWN_HALL_SPAWNS[this.spawnIndex % TOWN_HALL_SPAWNS.length];
    this.spawnIndex++;
    player.x = spawn.x;
    player.y = spawn.y;
    player.zoneId = 'town-hall';

    this.state.players.set(client.sessionId, player);
    this.state.activeCount = this.state.players.size;

    // ADR-07: When a participant joins, cancel any empty-world grace period
    if (this.state.worldId && this.state.worldId !== 'test-world') {
      await LifecycleService.handleWorldActive(this.state.worldId);
    }

    console.log(`[WorldRoom] Client joined: ${client.sessionId} (${player.displayName}, User: ${player.userId}). Total: ${this.state.activeCount}/20`);
  }

  handlePlayerMove(client: Client, data: MovePayload) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    const now = Date.now();
    const dtSeconds = Math.max(0.01, Math.min(0.2, (now - player.lastUpdatedAt) / 1000));
    player.lastUpdatedAt = now;

    const maxAllowedDist = MOVEMENT_SPEED * dtSeconds * 1.5;
    const dx = data.x - player.x;
    const dy = data.y - player.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= maxAllowedDist) {
      player.x = Math.max(16, Math.min(MAP_WIDTH_PX - 16, data.x));
      player.y = Math.max(24, Math.min(MAP_HEIGHT_PX - 24, data.y));
    } else {
      const angle = Math.atan2(dy, dx);
      player.x += Math.cos(angle) * maxAllowedDist;
      player.y += Math.sin(angle) * maxAllowedDist;
    }

    player.vx = data.vx;
    player.vy = data.vy;
    player.direction = data.direction;
    player.movementState = data.movementState;

    const zone = getZoneAt(player.x, player.y);
    if (zone && zone.id !== player.zoneId) {
      player.zoneId = zone.id;
      // Leaving Focus Room automatically disables transmission
      if (player.zoneId !== 'focus') {
        player.focusTalkEnabled = false;
      }
    }
  }

  async onLeave(client: Client, consented?: boolean) {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      // Instantly revoke LiveKit voice subscriptions and remove participant
      VoiceService.handleParticipantDisconnect(this.state.worldId, player.userId).catch(() => {});
    }

    if (player && this.userToClientMap.get(player.userId)?.sessionId === client.sessionId) {
      this.userToClientMap.delete(player.userId);
    }

    this.state.players.delete(client.sessionId);
    this.state.activeCount = this.state.players.size;

    console.log(`[WorldRoom] Client left: ${client.sessionId} (${player?.displayName}). Total: ${this.state.activeCount}/20`);

    // ADR-07: If last participant left, start 10-minute grace period
    if (this.state.players.size === 0 && this.state.worldId && this.state.worldId !== 'test-world') {
      await LifecycleService.handleWorldEmpty(this.state.worldId);
    }
  }

  update(deltaTime: number) {
    // 20 Hz simulation tick
  }

  /**
   * 10 Hz authoritative voice proximity & acoustic isolation evaluation
   */
  private async evaluateVoiceProximity() {
    if (this.state.players.size < 2) return;

    const participants: ParticipantVoiceState[] = [];
    this.state.players.forEach((player) => {
      participants.push({
        userId: player.userId,
        sessionId: player.sessionId,
        displayName: player.displayName,
        zoneId: player.zoneId,
        x: player.x,
        y: player.y,
        isMuted: player.isMuted,
        focusTalkEnabled: player.focusTalkEnabled,
      });
    });

    await VoiceService.evaluateAndSyncProximity(this.state.worldId, participants);
  }

  onDispose() {
    console.log(`[WorldRoom] Disposed world room ${this.state.worldId}`);
  }
}
