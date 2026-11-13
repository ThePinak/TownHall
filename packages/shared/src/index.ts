export const TILE_SIZE = 32;
export const MAP_WIDTH_TILES = 50;
export const MAP_HEIGHT_TILES = 40;
export const MAP_WIDTH_PX = MAP_WIDTH_TILES * TILE_SIZE;   // 1600
export const MAP_HEIGHT_PX = MAP_HEIGHT_TILES * TILE_SIZE; // 1280

export const MOVEMENT_SPEED = 140; // px / second (DEC-05)
export const PROXIMITY_RADIUS_PX = 160; // ADR-01

export const SPRITE_WIDTH = 32;
export const SPRITE_HEIGHT = 48;
export const COLLISION_BODY_WIDTH = 20;
export const COLLISION_BODY_HEIGHT = 12;
export const COLLISION_OFFSET_X = 6;
export const COLLISION_OFFSET_Y = 36;

export type Direction = 'down' | 'left' | 'right' | 'up';
export type MovementState = 'idle' | 'walking';

export type ZoneId = 'town-hall' | 'coding' | 'learning' | 'chill' | 'focus';

export interface ZoneDefinition {
  id: ZoneId;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const ZONES: Record<ZoneId, ZoneDefinition> = {
  'learning': { id: 'learning', name: 'Learning Room', x: 480, y: 0, width: 640, height: 384 },
  'focus': { id: 'focus', name: 'Focus Room', x: 480, y: 896, width: 640, height: 384 },
  'coding': { id: 'coding', name: 'Coding Room', x: 0, y: 352, width: 480, height: 576 },
  'chill': { id: 'chill', name: 'Chill Room', x: 1120, y: 352, width: 480, height: 576 },
  'town-hall': { id: 'town-hall', name: 'Town Hall', x: 480, y: 384, width: 640, height: 512 },
};

export const AVATAR_IDS = ['avatar-01', 'avatar-02', 'avatar-03', 'avatar-04'] as const;
export type AvatarId = (typeof AVATAR_IDS)[number];

export const MAX_WORLD_CAPACITY = 20;

export interface MovePayload {
  x: number;
  y: number;
  vx: number;
  vy: number;
  direction: Direction;
  movementState: MovementState;
}

export interface JoinPayload {
  displayName: string;
  avatarId: AvatarId;
  authToken?: string;
  inviteToken?: string;
  worldId?: string;
  userId?: string;
}

export * from './auth';
export * from './voice';

export function normalizeVelocity(vx: number, vy: number, speed: number = MOVEMENT_SPEED): { vx: number; vy: number } {
  if (vx !== 0 && vy !== 0) {
    const factor = Math.SQRT1_2; // 1 / Math.sqrt(2) ≈ 0.7071
    return { vx: vx * factor * speed, vy: vy * factor * speed };
  }
  return { vx: vx * speed, vy: vy * speed };
}

export function getZoneAt(x: number, y: number): ZoneDefinition | null {
  for (const zone of Object.values(ZONES)) {
    if (x >= zone.x && x < zone.x + zone.width && y >= zone.y && y < zone.y + zone.height) {
      return zone;
    }
  }
  return null;
}

