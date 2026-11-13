import { db } from '../db/dbClient';
import { AccountSessionRecord } from '@townhall/shared';

export class SessionService {
  /**
   * Claims an active session for a user.
   * Increments session generation and records the new active sessionId (ADR-03).
   */
  static async claimSession(userId: string, sessionId: string): Promise<number> {
    return db.claimSession(userId, sessionId);
  }

  static async getActiveSession(userId: string): Promise<AccountSessionRecord | null> {
    return db.getActiveSession(userId);
  }

  /**
   * Verifies if a given session is still the newest active session.
   */
  static async isSessionActive(
    userId: string,
    sessionId: string,
    expectedGeneration: number
  ): Promise<boolean> {
    const session = await db.getActiveSession(userId);
    if (!session) return false;
    return (
      session.activeSessionId === sessionId &&
      session.sessionGeneration === expectedGeneration
    );
  }
}

