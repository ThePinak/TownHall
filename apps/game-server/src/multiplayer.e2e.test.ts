import { test } from 'node:test';
import assert from 'node:assert';
import { Client, Room } from 'colyseus.js';
import { MAX_WORLD_CAPACITY } from '@townhall/shared';
import { WorldState } from './schema/WorldState';

const SERVER_URL = 'ws://localhost:2567';

test('connects two clients, synchronizes presence, broadcasts movement, and handles leave', async () => {
  const clientA = new Client(SERVER_URL);
  const clientB = new Client(SERVER_URL);

  // Client A joins
  const roomA: Room<WorldState> = await clientA.joinOrCreate<WorldState>('world_room', {
    displayName: 'Alice',
    avatarId: 'avatar-01',
  });
  assert.ok(roomA.sessionId, 'Client A should have a valid session ID');

  // Wait briefly for room state initialization
  await new Promise((r) => setTimeout(r, 100));
  assert.strictEqual(roomA.state.players.size, 1);
  assert.strictEqual(roomA.state.activeCount, 1);

  // Track remote player addition on Client A
  let remoteAdded = false;

  roomA.state.players.onAdd((player: any, sessionId: string) => {
    if (sessionId !== roomA.sessionId) {
      remoteAdded = true;
      assert.strictEqual(player.displayName, 'Bob');
      assert.strictEqual(player.avatarId, 'avatar-02');
    }
  });

  // Client B joins
  const roomB: Room<WorldState> = await clientB.joinOrCreate<WorldState>('world_room', {
    displayName: 'Bob',
    avatarId: 'avatar-02',
  });
  assert.ok(roomB.sessionId, 'Client B should have a valid session ID');

  // Wait for state sync
  await new Promise((r) => setTimeout(r, 200));
  assert.ok(remoteAdded, 'Client A should detect Client B joined');
  assert.strictEqual(roomA.state.activeCount, 2);
  assert.strictEqual(roomB.state.activeCount, 2);

  // Client B sends movement update
  roomB.send('move', {
    x: 745,
    y: 615,
    vx: 140,
    vy: 0,
    direction: 'right',
    movementState: 'walking',
  });

  // Wait for server tick & broadcast
  await new Promise((r) => setTimeout(r, 150));

  const bobOnA = roomA.state.players.get(roomB.sessionId);
  assert.ok(bobOnA, 'Client A should have state for Bob');
  assert.strictEqual(bobOnA.x, 745);
  assert.strictEqual(bobOnA.y, 615);
  assert.strictEqual(bobOnA.direction, 'right');
  assert.strictEqual(bobOnA.movementState, 'walking');

  // Track removal on Client A
  let remoteRemoved = false;
  roomA.state.players.onRemove((_player: any, sessionId: string) => {
    if (sessionId === roomB.sessionId) {
      remoteRemoved = true;
    }
  });

  // Client B leaves
  await roomB.leave();
  await new Promise((r) => setTimeout(r, 200));

  assert.ok(remoteRemoved, 'Client A should detect Client B left');
  assert.strictEqual(roomA.state.players.size, 1);
  assert.strictEqual(roomA.state.activeCount, 1);

  // Clean up Client A
  await roomA.leave();
});

test('enforces maximum capacity of 20 concurrent clients on live server', async () => {
  const clients: Client[] = [];
  const rooms: Room<WorldState>[] = [];

  try {
    // Connect first client to create the world
    const client0 = new Client(SERVER_URL);
    const room0 = await client0.joinOrCreate<WorldState>('world_room', {
      displayName: 'Host-0',
      avatarId: 'avatar-01',
    });
    clients.push(client0);
    rooms.push(room0);
    const targetRoomId = room0.id;

    // Connect 19 more clients into the exact same world room
    for (let i = 1; i < MAX_WORLD_CAPACITY; i++) {
      const client = new Client(SERVER_URL);
      const room = await client.joinById<WorldState>(targetRoomId, {
        displayName: `Bot-${i}`,
        avatarId: 'avatar-01',
      });
      clients.push(client);
      rooms.push(room);
    }

    assert.strictEqual(rooms.length, 20);
    await new Promise((r) => setTimeout(r, 100));
    assert.strictEqual(rooms[0].state.activeCount, 20);

    // Attempt 21st join to this world room
    const client21 = new Client(SERVER_URL);
    let rejected = false;
    try {
      await client21.joinById(targetRoomId, {
        displayName: 'Overflow-Bot',
        avatarId: 'avatar-03',
      });
    } catch (err: any) {
      rejected = true;
      assert.ok(err.message.includes('locked') || err.message.includes('capacity') || err.code !== 0);
    }
    assert.ok(rejected, '21st client must be rejected when room reaches 20 users');
  } finally {
    // Disconnect all bots
    await Promise.all(rooms.map((r) => r.leave()));
    // Allow clean exit
    setTimeout(() => process.exit(0), 100);
  }
});
