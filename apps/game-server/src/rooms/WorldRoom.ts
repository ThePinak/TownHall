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
} from '@townhall/shared';

// 20 Town Hall safe spawn coordinates from world-v1.tmj
export const TOWN_HALL_SPAWNS = [
  { x: 720, y: 592 }, { x: 755, y: 592 }, { x: 790, y: 592 }, { x: 825, y: 592 }, { x: 860, y: 592 },
  { x: 720, y: 620 }, { x: 755, y: 620 }, { x: 790, y: 620 }, { x: 825, y: 620 }, { x: 860, y: 620 },
  { x: 720, y: 650 }, { x: 755, y: 650 }, { x: 790, y: 650 }, { x: 825, y: 650 }, { x: 860, y: 650 },
  { x: 720, y: 678 }, { x: 755, y: 678 }, { x: 790, y: 678 }, { x: 825, y: 678 }, { x: 860, y: 678 },
];

export class WorldRoom extends Room<WorldState> {
  maxClients = MAX_WORLD_CAPACITY; // 20 concurrent users max (ADR-02 / DEC-10)
  private spawnIndex = 0;

  onCreate(options: { worldId?: string }) {
    this.setState(new WorldState());
    this.state.worldId = options.worldId || 'test-world';

    // 20 Hz authoritative simulation & state patch interval (50ms)
    this.setSimulationInterval((deltaTime) => this.update(deltaTime), 50);

    // Client movement intent message handler
    this.onMessage('move', (client, data: MovePayload) => {
      this.handlePlayerMove(client, data);
    });
  }

  onJoin(client: Client, options?: JoinPayload) {
    if (this.state.players.size >= this.maxClients) {
      throw new Error('World capacity reached (20/20 users)');
    }

    const player = new PlayerState();
    player.sessionId = client.sessionId;
    player.displayName = options?.displayName?.trim().slice(0, 20) || `Player-${client.sessionId.slice(0, 4)}`;

    const requestedAvatar = options?.avatarId as AvatarId;
    player.avatarId = AVATAR_IDS.includes(requestedAvatar) ? requestedAvatar : 'avatar-01';

    // Assign safe spawn position in Town Hall
    const spawn = TOWN_HALL_SPAWNS[this.spawnIndex % TOWN_HALL_SPAWNS.length];
    this.spawnIndex++;
    player.x = spawn.x;
    player.y = spawn.y;
    player.zoneId = 'town-hall';

    this.state.players.set(client.sessionId, player);
    this.state.activeCount = this.state.players.size;

    console.log(`[WorldRoom] Client joined: ${client.sessionId} (${player.displayName}). Total: ${this.state.activeCount}/20`);
  }

  handlePlayerMove(client: Client, data: MovePayload) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    const now = Date.now();
    const dtSeconds = Math.max(0.01, Math.min(0.2, (now - player.lastUpdatedAt) / 1000));
    player.lastUpdatedAt = now;

    // Maximum distance player could move in dtSeconds + 20% network variance buffer
    const maxAllowedDistance = (MOVEMENT_SPEED * dtSeconds) * 1.25 + 8;
    const dx = data.x - player.x;
    const dy = data.y - player.y;
    const distanceMoved = Math.sqrt(dx * dx + dy * dy);

    if (distanceMoved <= maxAllowedDistance) {
      // Validated movement
      player.x = Math.max(16, Math.min(MAP_WIDTH_PX - 16, data.x));
      player.y = Math.max(24, Math.min(MAP_HEIGHT_PX - 24, data.y));
    } else {
      // Exceeded speed threshold / teleport attempt - clamp movement
      const angle = Math.atan2(dy, dx);
      player.x += Math.cos(angle) * maxAllowedDistance;
      player.y += Math.sin(angle) * maxAllowedDistance;
    }

    player.vx = data.vx || 0;
    player.vy = data.vy || 0;
    player.direction = data.direction || player.direction;
    player.movementState = data.movementState || 'idle';

    // Authoritative zone detection
    const zone = getZoneAt(player.x, player.y);
    if (zone && zone.id !== player.zoneId) {
      player.zoneId = zone.id;
    }
  }

  onLeave(client: Client, consented?: boolean) {
    const player = this.state.players.get(client.sessionId);
    this.state.players.delete(client.sessionId);
    this.state.activeCount = this.state.players.size;

    console.log(`[WorldRoom] Client left: ${client.sessionId} (${player?.displayName}). Total: ${this.state.activeCount}/20`);
  }

  update(deltaTime: number) {
    // 20 Hz simulation tick
  }

  onDispose() {
    console.log(`[WorldRoom] Disposed world room ${this.state.worldId}`);
  }
}
