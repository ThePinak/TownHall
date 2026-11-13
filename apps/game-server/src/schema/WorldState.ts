import { Schema, MapSchema, type } from '@colyseus/schema';
import { PlayerState } from './PlayerState';

export class WorldState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type('string') worldId: string = 'test-world';
  @type('number') activeCount: number = 0;
}

