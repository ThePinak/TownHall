import { Schema, type } from '@colyseus/schema';
import { Direction, MovementState, AvatarId, ZoneId } from '@townhall/shared';

export class PlayerState extends Schema {
  @type('string') sessionId: string = '';
  @type('string') displayName: string = 'Alex';
  @type('string') avatarId: AvatarId = 'avatar-01';

  @type('number') x: number = 720;
  @type('number') y: number = 592;
  @type('number') vx: number = 0;
  @type('number') vy: number = 0;

  @type('string') direction: Direction = 'down';
  @type('string') movementState: MovementState = 'idle';
  @type('string') zoneId: ZoneId = 'town-hall';

  lastUpdatedAt: number = Date.now();
}

