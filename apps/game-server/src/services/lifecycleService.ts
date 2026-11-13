import { db } from '../db/dbClient';
import { EMPTY_GRACE_PERIOD_MS, WorldMetadata } from '@townhall/shared';

export class LifecycleService {
  /**
   * Called when the final participant leaves a world room.
   * Sets empty_since to now and delete_after to now + 10 minutes (ADR-07).
   */
  static async handleWorldEmpty(worldId: string): Promise<void> {
    const world = await db.getWorld(worldId);
    if (!world || world.status === 'deleted') return;

    const now = new Date();
    const deleteAfter = new Date(now.getTime() + EMPTY_GRACE_PERIOD_MS);

    await db.updateWorldStatus(
      worldId,
      'empty_grace',
      now.toISOString(),
      deleteAfter.toISOString()
    );

    console.log(
      `[Lifecycle] World "${worldId}" entered 10-minute grace period. Scheduled deletion after: ${deleteAfter.toISOString()}`
    );
  }

  /**
   * Called when a participant joins a world room.
   * Cancels any pending empty-world deletion and restores 'active' status.
   */
  static async handleWorldActive(worldId: string): Promise<void> {
    const world = await db.getWorld(worldId);
    if (!world || world.status === 'deleted') return;

    if (world.status === 'empty_grace') {
      console.log(`[Lifecycle] Participant returned to world "${worldId}". Canceling pending grace-period deletion.`);
    }

    await db.updateWorldStatus(worldId, 'active', null, null);
  }

  /**
   * Sweeps eligible expired worlds and performs durable deletion.
   * Double-checks with in-memory room occupancy to avoid deleting rejoined rooms.
   */
  static async sweepExpiredWorlds(
    isRoomActiveFn?: (worldId: string) => boolean
  ): Promise<WorldMetadata[]> {
    const expiredWorlds = await db.getExpiredGraceWorlds();
    const deleted: WorldMetadata[] = [];

    for (const world of expiredWorlds) {
      // Re-verify that world is still empty right before deleting
      if (isRoomActiveFn && isRoomActiveFn(world.id)) {
        console.log(`[Lifecycle] World "${world.id}" has active live participants; skipping cleanup.`);
        continue;
      }

      console.log(`[Lifecycle] World "${world.id}" grace period expired at ${world.deleteAfter}. Performing deletion.`);
      await db.deleteWorld(world.id);
      deleted.push(world);
    }

    return deleted;
  }

  /**
   * Starts periodic background lifecycle cleanup worker.
   */
  static startLifecycleWorker(
    isRoomActiveFn?: (worldId: string) => boolean,
    intervalMs: number = 15000
  ): NodeJS.Timeout {
    console.log(`[Lifecycle] Background cleanup worker active (interval: ${intervalMs}ms).`);
    return setInterval(() => {
      this.sweepExpiredWorlds(isRoomActiveFn).catch((err) => {
        console.error('[Lifecycle] Error during expiration sweep:', err);
      });
    }, intervalMs);
  }
}

