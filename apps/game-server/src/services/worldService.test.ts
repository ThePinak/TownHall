import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { WorldService } from './worldService';
import { LifecycleService } from './lifecycleService';
import { SessionService } from './sessionService';
import { db } from '../db/dbClient';

describe('World & Invitation Service Unit Tests (M4)', () => {
  beforeEach(() => {
    db.reset();
  });

  it('creates a private world and generates a cryptographic invite secret', async () => {
    const ownerId = 'user-owner-01';
    const result = await WorldService.createWorld(ownerId, 'Pinak Town');

    assert.ok(result.world.id, 'World should have an ID');
    assert.strictEqual(result.world.name, 'Pinak Town');
    assert.strictEqual(result.world.ownerUserId, ownerId);
    assert.strictEqual(result.world.status, 'active');
    assert.strictEqual(result.inviteToken.length, 32, 'Invite token should be 32 hex chars (DEC-09)');

    // Verify raw token is NOT stored in DB
    const directLookup = await (db as any).invitations.get(result.inviteToken);
    assert.strictEqual(directLookup, undefined, 'Raw secret must not be stored in DB');
  });

  it('enforces ADR-05: Creator cannot create a second active world', async () => {
    const ownerId = 'user-owner-multi';
    await WorldService.createWorld(ownerId, 'First World');

    await assert.rejects(async () => {
      await WorldService.createWorld(ownerId, 'Second World');
    }, /already own an active world/);
  });

  it('enforces ADR-05: Empty world in grace period still counts as active ownership', async () => {
    const ownerId = 'user-owner-grace';
    const { world } = await WorldService.createWorld(ownerId, 'Grace World');

    // Transition to empty_grace
    await LifecycleService.handleWorldEmpty(world.id);
    const updated = await db.getWorld(world.id);
    assert.strictEqual(updated?.status, 'empty_grace');
    assert.ok(updated?.deleteAfter);

    // Attempting to create another world while in grace period MUST be rejected
    await assert.rejects(async () => {
      await WorldService.createWorld(ownerId, 'New World During Grace');
    }, /already own an active world/);
  });

  it('validates authentic invite tokens and rejects invalid or malformed tokens', async () => {
    const ownerId = 'user-owner-validate';
    const { world, inviteToken } = await WorldService.createWorld(ownerId, 'Invite Test World');

    // Valid token
    const validRes = await WorldService.validateInvite(inviteToken);
    assert.strictEqual(validRes.valid, true);
    assert.strictEqual(validRes.worldId, world.id);
    assert.strictEqual(validRes.worldName, 'Invite Test World');

    // Bogus token
    const bogusRes = await WorldService.validateInvite('bogus-invalid-token-1234567890');
    assert.strictEqual(bogusRes.valid, false);
    assert.ok(bogusRes.error);
  });

  it('supports invite revocation and regeneration (DEC-09)', async () => {
    const ownerId = 'user-owner-regen';
    const { world, inviteToken: initialToken } = await WorldService.createWorld(ownerId, 'Regen Town');

    // Non-owner cannot regenerate
    await assert.rejects(async () => {
      await WorldService.regenerateInvite(world.id, 'intruder-user');
    }, /Only the world owner can regenerate/);

    // Owner regenerates
    const regenRes = await WorldService.regenerateInvite(world.id, ownerId);
    assert.strictEqual(regenRes.worldId, world.id);
    assert.ok(regenRes.newInviteToken);
    assert.notStrictEqual(regenRes.newInviteToken, initialToken);
    assert.strictEqual(regenRes.revokedCount, 1);

    // Initial token MUST now be invalid/revoked
    const oldValidate = await WorldService.validateInvite(initialToken);
    assert.strictEqual(oldValidate.valid, false, 'Prior invite must be revoked');

    // New token MUST be valid
    const newValidate = await WorldService.validateInvite(regenRes.newInviteToken);
    assert.strictEqual(newValidate.valid, true);
    assert.strictEqual(newValidate.worldId, world.id);
  });

  it('cancels pending grace deletion when a participant returns (ADR-07)', async () => {
    const ownerId = 'user-owner-lifecycle';
    const { world } = await WorldService.createWorld(ownerId, 'Lifecycle Town');

    // Final participant leaves
    await LifecycleService.handleWorldEmpty(world.id);
    let current = await db.getWorld(world.id);
    assert.strictEqual(current?.status, 'empty_grace');
    assert.ok(current?.deleteAfter);

    // Participant returns during grace
    await LifecycleService.handleWorldActive(world.id);
    current = await db.getWorld(world.id);
    assert.strictEqual(current?.status, 'active');
    assert.strictEqual(current?.emptySince, null);
    assert.strictEqual(current?.deleteAfter, null);
  });

  it('enforces ADR-03 session generation replacement (newest session wins)', async () => {
    const userId = 'user-session-test';

    const gen1 = await SessionService.claimSession(userId, 'client-socket-1');
    assert.strictEqual(gen1, 1);
    assert.strictEqual(await SessionService.isSessionActive(userId, 'client-socket-1', gen1), true);

    const gen2 = await SessionService.claimSession(userId, 'client-socket-2');
    assert.strictEqual(gen2, 2);

    // Old socket is now obsolete
    assert.strictEqual(await SessionService.isSessionActive(userId, 'client-socket-1', gen1), false);
    // New socket is valid
    assert.strictEqual(await SessionService.isSessionActive(userId, 'client-socket-2', gen2), true);
  });
});

