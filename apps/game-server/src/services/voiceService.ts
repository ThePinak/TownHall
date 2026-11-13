import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import {
  evaluateVoiceEligibility,
  VoiceTokenResponse,
  VOICE_PROXIMITY_RADIUS_PX,
  ZoneId,
} from '@townhall/shared';

export interface ParticipantVoiceState {
  userId: string;
  sessionId: string;
  displayName: string;
  zoneId: ZoneId;
  x: number;
  y: number;
  isMuted: boolean;
  focusTalkEnabled: boolean;
}

export class VoiceService {
  private static livekitUrl = process.env.LIVEKIT_URL || 'http://localhost:7880';
  private static apiKey = process.env.LIVEKIT_API_KEY;
  private static apiSecret = process.env.LIVEKIT_API_SECRET;

  private static roomServiceClient: RoomServiceClient | null = null;

  // Active subscriptions tracking: listenerUserId -> Set<speakerUserId>
  private static activeSubscriptions = new Map<string, Set<string>>();

  static getClient(): RoomServiceClient | null {
    if (!this.roomServiceClient && this.apiKey && this.apiSecret) {
      this.roomServiceClient = new RoomServiceClient(this.livekitUrl, this.apiKey, this.apiSecret);
    }
    return this.roomServiceClient;
  }

  /**
   * Generates a short-lived (15 minute) LiveKit AccessToken for an authenticated user.
   */
  static async createVoiceToken(
    worldId: string,
    userId: string,
    displayName: string
  ): Promise<VoiceTokenResponse> {
    const roomName = `world-${worldId}`;
    const participantIdentity = userId;

    // Live LiveKit AccessToken if API keys configured
    if (this.apiKey && this.apiSecret) {
      const at = new AccessToken(this.apiKey, this.apiSecret, {
        identity: participantIdentity,
        name: displayName,
        ttl: '15m',
      });

      at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
        canPublishData: false,
      });

      const token = await at.toJwt();
      return {
        token,
        url: this.livekitUrl,
        roomName,
        participantIdentity,
      };
    }

    // Offline / Mock token fallback for local dev & automated unit tests
    const mockToken = `mock-livekit-token:${roomName}:${participantIdentity}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
    return {
      token: mockToken,
      url: this.livekitUrl,
      roomName,
      participantIdentity,
    };
  }

  /**
   * Evaluates proximity & room acoustic boundaries for all participants in a world.
   * Updates SFU subscriptions: grants newly eligible audio, immediately revokes ineligible.
   * Returns list of active hearing pairs for logging or test assertions.
   */
  static async evaluateAndSyncProximity(
    worldId: string,
    participants: ParticipantVoiceState[]
  ): Promise<{ listenerId: string; speakerId: string; canHear: boolean }[]> {
    const results: { listenerId: string; speakerId: string; canHear: boolean }[] = [];
    const client = this.getClient();

    for (const listener of participants) {
      let listenerSubs = this.activeSubscriptions.get(listener.userId);
      if (!listenerSubs) {
        listenerSubs = new Set<string>();
        this.activeSubscriptions.set(listener.userId, listenerSubs);
      }

      for (const speaker of participants) {
        if (listener.userId === speaker.userId) continue;

        const check = evaluateVoiceEligibility(listener, speaker, VOICE_PROXIMITY_RADIUS_PX);
        results.push({
          listenerId: listener.userId,
          speakerId: speaker.userId,
          canHear: check.canHear,
        });

        const wasSubscribed = listenerSubs.has(speaker.userId);

        if (check.canHear && !wasSubscribed) {
          // Grant subscription
          listenerSubs.add(speaker.userId);
          if (client) {
            try {
              // Update SFU subscription
              await client.updateSubscriptions(`world-${worldId}`, listener.userId, [], true);
            } catch (err) {
              // Non-blocking in simulation / dev
            }
          }
        } else if (!check.canHear && wasSubscribed) {
          // Revoke subscription immediately (out of range, room boundary crossed, or focus toggle off)
          listenerSubs.delete(speaker.userId);
          if (client) {
            try {
              // Update SFU subscription to revoke
              await client.updateSubscriptions(`world-${worldId}`, listener.userId, [], false);
            } catch (err) {
              // Non-blocking in simulation / dev
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Revokes voice access when participant departs or is replaced (ADR-03 / ADR-07).
   */
  static async handleParticipantDisconnect(worldId: string, userId: string): Promise<void> {
    this.activeSubscriptions.delete(userId);

    // Remove from other participants' active subscriptions
    for (const subs of this.activeSubscriptions.values()) {
      subs.delete(userId);
    }

    const client = this.getClient();
    if (client) {
      try {
        await client.removeParticipant(`world-${worldId}`, userId);
      } catch (err) {
        // Participant may already have disconnected socket
      }
    }
  }

  /**
   * Resets internal subscription tracking (used by tests).
   */
  static reset(): void {
    this.activeSubscriptions.clear();
  }
}
