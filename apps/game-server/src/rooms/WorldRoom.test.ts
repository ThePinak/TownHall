import { describe, it, beforeEach, afterEach, after } from 'node:test';
import assert from 'node:assert';
import { WorldRoom, TOWN_HALL_SPAWNS } from './WorldRoom';
import type { Client } from 'colyseus';
import { MAX_WORLD_CAPACITY, MOVEMENT_SPEED } from '@townhall/shared';

describe('WorldRoom Unit Tests', () => {
  let room: WorldRoom;

  beforeEach(() => {
    room = new WorldRoom();
    room.autoDispose = false;
    room.presence = {
      subscribe: () => Promise.resolve(),
      unsubscribe: () => Promise.resolve(),
      publish: () => Promise.resolve(),
      del: () => Promise.resolve(),
      sadd: () => Promise.resolve(),
      srem: () => Promise.resolve(),
      smembers: () => Promise.resolve([]),
      hset: () => Promise.resolve(),
      hget: () => Promise.resolve(null),
      hdel: () => Promise.resolve(),
      hlen: () => Promise.resolve(0),
      incr: () => Promise.resolve(0),
      decr: () => Promise.resolve(0),
    } as any;
    room.onCreate({ worldId: 'test-room-unit' });
  });

  afterEach(() => {
    if (room.clock) {
      room.clock.clear();
      room.clock.stop();
    }
  });

  after(() => {
    process.exit(0);
  });

  it('initializes with zero players and maxClients = 20', () => {
    assert.strictEqual(room.maxClients, MAX_WORLD_CAPACITY);
    assert.strictEqual(room.state.players.size, 0);
    assert.strictEqual(room.state.activeCount, 0);
  });

  it('allows clients to join up to 20 users and assigns safe Town Hall spawns', () => {
    for (let i = 0; i < MAX_WORLD_CAPACITY; i++) {
      const mockClient = { sessionId: `client-${i}` } as Client;
      room.onJoin(mockClient, { displayName: `User-${i}`, avatarId: 'avatar-01' });

      const player = room.state.players.get(`client-${i}`);
      assert.ok(player);
      assert.strictEqual(player?.displayName, `User-${i}`);
      assert.strictEqual(player?.zoneId, 'town-hall');

      // Verify spawn matches designated Town Hall spawn grid
      const expectedSpawn = TOWN_HALL_SPAWNS[i % TOWN_HALL_SPAWNS.length];
      assert.strictEqual(player?.x, expectedSpawn.x);
      assert.strictEqual(player?.y, expectedSpawn.y);
    }

    assert.strictEqual(room.state.players.size, 20);
    assert.strictEqual(room.state.activeCount, 20);
  });

  it('rejects the 21st client when room reaches 20 users', () => {
    for (let i = 0; i < MAX_WORLD_CAPACITY; i++) {
      room.onJoin({ sessionId: `client-${i}` } as Client, { displayName: `User-${i}`, avatarId: 'avatar-01' });
    }

    assert.throws(() => {
      room.onJoin({ sessionId: 'client-21' } as Client, { displayName: 'User-21', avatarId: 'avatar-01' });
    }, /World capacity reached/);

    assert.strictEqual(room.state.players.size, 20);
  });

  it('frees capacity when a client leaves', () => {
    const mockClient = { sessionId: 'client-leave' } as Client;
    room.onJoin(mockClient, { displayName: 'Leaver', avatarId: 'avatar-02' });
    assert.strictEqual(room.state.players.size, 1);

    room.onLeave(mockClient);
    assert.strictEqual(room.state.players.size, 0);
    assert.strictEqual(room.state.activeCount, 0);
  });

  it('validates player movement velocity and updates zoneId', () => {
    const client = { sessionId: 'client-move' } as Client;
    room.onJoin(client, { displayName: 'Mover', avatarId: 'avatar-01' });

    const player = room.state.players.get('client-move')!;
    const startX = player.x;
    const startY = player.y;

    // Simulate move within valid speed range
    room.handlePlayerMove(client, {
      x: startX + 5,
      y: startY + 5,
      vx: 100,
      vy: 100,
      direction: 'right',
      movementState: 'walking',
    });

    assert.strictEqual(player.x, startX + 5);
    assert.strictEqual(player.y, startY + 5);
    assert.strictEqual(player.direction, 'right');
    assert.strictEqual(player.movementState, 'walking');
  });

  it('clamps excessive teleportation movement updates exceeding speed threshold', () => {
    const client = { sessionId: 'client-teleport' } as Client;
    room.onJoin(client, { displayName: 'Cheater', avatarId: 'avatar-01' });

    const player = room.state.players.get('client-teleport')!;
    const startX = player.x;

    // Send sudden 500px teleport jump
    room.handlePlayerMove(client, {
      x: startX + 500,
      y: player.y,
      vx: MOVEMENT_SPEED,
      vy: 0,
      direction: 'right',
      movementState: 'walking',
    });

    // Should NOT jump 500px
    assert.ok(player.x < startX + 60);
  });
});
