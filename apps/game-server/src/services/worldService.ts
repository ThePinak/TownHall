import {
  CreateWorldResponse,
  InviteValidationResponse,
  RegenerateInviteResponse,
  WorldMetadata,
} from '@townhall/shared';
import { db } from '../db/dbClient';
import { generateInviteSecret, hashSecret } from './authService';

export class WorldService {
  /**
   * Creates a private world.
   * Enforces ADR-05: Exactly one active or grace-period world per creator.
   * Generates a cryptographic invite secret, stores secret_hash, and returns plaintext token once.
   */
  static async createWorld(ownerUserId: string, name: string): Promise<CreateWorldResponse> {
    // 1. Verify owner doesn't already have an active/grace-period world (ADR-05)
    const existingWorld = await db.getActiveWorldByOwner(ownerUserId);
    if (existingWorld) {
      throw new Error(
        `You already own an active world ("${existingWorld.name}"). Only 1 active world per creator is permitted.`
      );
    }

    // 2. Create the world in database
    const world = await db.createWorld(ownerUserId, name);

    // 3. Generate initial cryptographic invite secret (DEC-09)
    const inviteToken = generateInviteSecret();
    const secretHash = hashSecret(inviteToken);
    await db.createInvitation(world.id, secretHash, ownerUserId);

    return {
      world,
      inviteToken,
    };
  }

  /**
   * Validates an invite token/code against active invitation hashes.
   */
  static async validateInvite(inviteToken: string): Promise<InviteValidationResponse> {
    if (!inviteToken || !inviteToken.trim()) {
      return { valid: false, error: 'Invitation token is required' };
    }

    const secretHash = hashSecret(inviteToken);
    const invite = await db.getInvitationByHash(secretHash);

    if (!invite) {
      return { valid: false, error: 'Invalid or revoked invitation code' };
    }

    // Check expiration if set
    if (invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now()) {
      return { valid: false, error: 'Invitation has expired' };
    }

    // Check world status
    const world = await db.getWorld(invite.worldId);
    if (!world || world.status === 'deleted') {
      return { valid: false, error: 'World no longer exists' };
    }

    return {
      valid: true,
      worldId: world.id,
      worldName: world.name,
    };
  }

  /**
   * Regenerates invitation for a world.
   * Revokes all prior active invitations and issues a new secret (DEC-09).
   */
  static async regenerateInvite(
    worldId: string,
    requestingUserId: string
  ): Promise<RegenerateInviteResponse> {
    const world = await db.getWorld(worldId);
    if (!world) {
      throw new Error('World not found');
    }

    if (world.ownerUserId !== requestingUserId) {
      throw new Error('Only the world owner can regenerate invitation links');
    }

    // Revoke prior invites
    const revokedCount = await db.revokeInvitationsForWorld(worldId);

    // Issue new invite token
    const newInviteToken = generateInviteSecret();
    const secretHash = hashSecret(newInviteToken);
    await db.createInvitation(worldId, secretHash, requestingUserId);

    return {
      worldId,
      newInviteToken,
      revokedCount,
    };
  }

  static async getWorld(worldId: string): Promise<WorldMetadata | null> {
    return db.getWorld(worldId);
  }

  static async getActiveWorldByOwner(ownerUserId: string): Promise<WorldMetadata | null> {
    return db.getActiveWorldByOwner(ownerUserId);
  }
}

