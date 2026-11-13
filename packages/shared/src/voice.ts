import { ZoneId } from './index';

export const VOICE_PROXIMITY_RADIUS_PX = 160; // ADR-01: 160 world pixels (5 logical 32px tiles)
export const VOICE_EVALUATION_INTERVAL_MS = 100; // 10 Hz authoritative eligibility tick

export interface VoiceTokenRequest {
  worldId: string;
}

export interface VoiceTokenResponse {
  token: string;
  url: string;
  roomName: string;
  participantIdentity: string;
}

export interface VoiceParticipantInfo {
  userId: string;
  sessionId: string;
  displayName: string;
  zoneId: ZoneId;
  x: number;
  y: number;
  isMuted: boolean;
  focusTalkEnabled: boolean;
}

export interface VoiceEligibilityCheck {
  canHear: boolean;
  distance: number;
  reason?: string;
}

/**
 * Computes whether listener can hear speaker based on approved invariants:
 * 1. Same world
 * 2. Same room / zone (acoustic boundary isolation)
 * 3. Center-to-center Euclidean distance <= 160 pixels
 * 4. Speaker not muted
 * 5. If in Focus Room: speaker has Toggle-to-Talk active (DEC-07)
 */
export function evaluateVoiceEligibility(
  listener: { zoneId: ZoneId; x: number; y: number },
  speaker: { zoneId: ZoneId; x: number; y: number; isMuted?: boolean; focusTalkEnabled?: boolean },
  maxRadius: number = VOICE_PROXIMITY_RADIUS_PX
): VoiceEligibilityCheck {
  // Rule 2: Acoustic boundary isolation - must be in the same room
  if (listener.zoneId !== speaker.zoneId) {
    return {
      canHear: false,
      distance: Infinity,
      reason: `Different rooms (${listener.zoneId} vs ${speaker.zoneId})`,
    };
  }

  // Rule 3: Center-to-center Euclidean distance
  const dx = listener.x - speaker.x;
  const dy = listener.y - speaker.y;
  const distance = Math.hypot(dx, dy);

  if (distance > maxRadius) {
    return {
      canHear: false,
      distance,
      reason: `Distance ${Math.round(distance)}px exceeds ${maxRadius}px limit`,
    };
  }

  // Rule 4: Speaker mute state
  if (speaker.isMuted) {
    return {
      canHear: false,
      distance,
      reason: 'Speaker is muted',
    };
  }

  // Rule 5: Focus Room specific rules (DEC-07)
  if (speaker.zoneId === 'focus' && !speaker.focusTalkEnabled) {
    return {
      canHear: false,
      distance,
      reason: 'Focus Room transmission disabled (Toggle-to-Talk inactive)',
    };
  }

  return {
    canHear: true,
    distance,
  };
}

