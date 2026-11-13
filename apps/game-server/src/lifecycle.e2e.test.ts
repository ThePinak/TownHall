import { test } from 'node:test';
import assert from 'node:assert';
import { Client } from 'colyseus.js';
import { DISCONNECT_CODE_NEWER_SESSION } from '@townhall/shared';

const SERVER_URL = 'ws://localhost:2567';
const API_URL = 'http://localhost:2567/api';

test('M4 E2E: Private world creation, invite token validation, newest-session-wins, and lifecycle grace', async () => {
  // 1. Create a private world via Server REST API
  const ownerId = `user-owner-e2e-${Date.now()}`;
  const ownerAuthToken = `dev-token:${ownerId}:OwnerE2E:avatar-01`;
  const createResp = await fetch(`${API_URL}/worlds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ownerAuthToken}`,
    },
    body: JSON.stringify({ name: 'E2E Secret World' }),
  });

  assert.strictEqual(createResp.status, 201, 'World creation should succeed with 201');
  const createData: any = await createResp.json();
  const worldId = createData.world.id;
  const inviteToken = createData.inviteToken;

  assert.ok(worldId, 'Created world must have an ID');
  assert.ok(inviteToken, 'Created world must have a 32-char invite secret');
  assert.strictEqual(inviteToken.length, 32);

  // 2. Validate invite token via Server REST API
  const valResp = await fetch(`${API_URL}/invitations/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inviteToken }),
  });
  const valData: any = await valResp.json();
  assert.strictEqual(valData.valid, true);
  assert.strictEqual(valData.worldId, worldId);

  // 3. Connect client 1 with valid auth and invite
  const client1 = new Client(SERVER_URL);
  const room1 = await client1.joinOrCreate('world_room', {
    worldId,
    displayName: 'InvitedPlayer',
    avatarId: 'avatar-02',
    authToken: `dev-token:guest-user-01:InvitedPlayer:avatar-02`,
    inviteToken,
  });

  assert.ok(room1.sessionId);
  await new Promise((r) => setTimeout(r, 150));

  // Query server for world status
  const worldQuery1 = await fetch(`${API_URL}/worlds/${worldId}`);
  const worldData1: any = await worldQuery1.json();
  assert.strictEqual(worldData1.world.status, 'active');

  // 4. Test ADR-03: Newest Session Wins
  // Connect a 2nd client using the EXACT SAME user identity (guest-user-01)
  let client1DisconnectedWith4001 = false;
  room1.onLeave((code) => {
    if (code === DISCONNECT_CODE_NEWER_SESSION) {
      client1DisconnectedWith4001 = true;
    }
  });

  const client2 = new Client(SERVER_URL);
  const room2 = await client2.joinOrCreate('world_room', {
    worldId,
    displayName: 'InvitedPlayerNew',
    avatarId: 'avatar-02',
    authToken: `dev-token:guest-user-01:InvitedPlayerNew:avatar-02`,
    inviteToken,
  });

  assert.ok(room2.sessionId);
  await new Promise((r) => setTimeout(r, 200));

  assert.strictEqual(
    client1DisconnectedWith4001,
    true,
    'Client 1 socket should be closed with code 4001 (DISCONNECT_CODE_NEWER_SESSION)'
  );

  // 5. Test ADR-07: Empty-World 10-Minute Grace Period
  // Client 2 leaves the world so it becomes empty
  await room2.leave();
  await new Promise((r) => setTimeout(r, 250));

  const worldQuery2 = await fetch(`${API_URL}/worlds/${worldId}`);
  const worldData2: any = await worldQuery2.json();
  assert.strictEqual(worldData2.world.status, 'empty_grace');
  assert.ok(worldData2.world.emptySince);
  assert.ok(worldData2.world.deleteAfter);

  // 6. Test ADR-07: Rejoining during grace cancels pending deletion
  const client3 = new Client(SERVER_URL);
  const room3 = await client3.joinOrCreate('world_room', {
    worldId,
    displayName: 'ReturningPlayer',
    avatarId: 'avatar-01',
    authToken: `dev-token:guest-user-02:ReturningPlayer:avatar-01`,
    inviteToken,
  });

  await new Promise((r) => setTimeout(r, 200));

  const worldQuery3 = await fetch(`${API_URL}/worlds/${worldId}`);
  const worldData3: any = await worldQuery3.json();
  assert.strictEqual(worldData3.world.status, 'active');
  assert.strictEqual(worldData3.world.emptySince, null);
  assert.strictEqual(worldData3.world.deleteAfter, null);

  // Clean up
  await room3.leave();
  setTimeout(() => process.exit(0), 100);
});
