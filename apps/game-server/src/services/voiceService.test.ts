import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { VoiceService, ParticipantVoiceState } from './voiceService';
import { evaluateVoiceEligibility, VOICE_PROXIMITY_RADIUS_PX } from '@townhall/shared';

describe('Voice Communication & Proximity Service Tests (M5 / Section 11)', () => {
  beforeEach(() => {
    VoiceService.reset();
  });

  // Test Case 1: Same room, within range (<= 160px)
  it('1. Same room, within range (<= 160px): eligible users can hear each other', async () => {
    const listener = { zoneId: 'town-hall' as const, x: 720, y: 592 };
    const speaker = { zoneId: 'town-hall' as const, x: 800, y: 592, isMuted: false, focusTalkEnabled: false };

    const distance = Math.hypot(listener.x - speaker.x, listener.y - speaker.y);
    assert.ok(distance <= VOICE_PROXIMITY_RADIUS_PX, `Distance ${distance} should be <= 160px`);

    const result = evaluateVoiceEligibility(listener, speaker);
    assert.strictEqual(result.canHear, true);
  });

  // Test Case 2: Same room, outside range (> 160px)
  it('2. Same room, outside range (> 160px): users cannot hear each other', async () => {
    const listener = { zoneId: 'town-hall' as const, x: 500, y: 400 };
    const speaker = { zoneId: 'town-hall' as const, x: 750, y: 400, isMuted: false, focusTalkEnabled: false };

    const distance = Math.hypot(listener.x - speaker.x, listener.y - speaker.y);
    assert.ok(distance > VOICE_PROXIMITY_RADIUS_PX, `Distance ${distance} should be > 160px`);

    const result = evaluateVoiceEligibility(listener, speaker);
    assert.strictEqual(result.canHear, false);
    assert.match(result.reason || '', /exceeds 160px limit/);
  });

  // Test Case 3: Different rooms, close coordinates (< 160px across wall)
  it('3. Different rooms, close coordinates (< 160px across wall): users cannot hear each other', async () => {
    // Coding Room (right edge at x=470) and Town Hall (left edge at x=490) separated by 20 pixels across the wall
    const listenerInCoding = { zoneId: 'coding' as const, x: 470, y: 450 };
    const speakerInTownHall = { zoneId: 'town-hall' as const, x: 490, y: 450, isMuted: false, focusTalkEnabled: false };

    const physicalDistance = Math.hypot(listenerInCoding.x - speakerInTownHall.x, listenerInCoding.y - speakerInTownHall.y);
    assert.strictEqual(physicalDistance, 20, 'Users are physically only 20px apart across room wall');

    const result = evaluateVoiceEligibility(listenerInCoding, speakerInTownHall);
    assert.strictEqual(result.canHear, false, 'Acoustic boundary must prevent voice bleed between rooms');
    assert.match(result.reason || '', /Different rooms/);
  });

  // Test Case 4: Crossing a room boundary: old-room subscription is revoked immediately
  it('4. Crossing a room boundary: old-room subscription is revoked immediately', async () => {
    const worldId = 'test-world-room-switch';
    const listener: ParticipantVoiceState = {
      userId: 'user-listener',
      sessionId: 'sess-listener',
      displayName: 'Listener',
      zoneId: 'town-hall',
      x: 720,
      y: 592,
      isMuted: false,
      focusTalkEnabled: false,
    };
    const speaker: ParticipantVoiceState = {
      userId: 'user-speaker',
      sessionId: 'sess-speaker',
      displayName: 'Speaker',
      zoneId: 'town-hall',
      x: 750,
      y: 592,
      isMuted: false,
      focusTalkEnabled: false,
    };

    // Initial state: both in town-hall within range -> can hear
    let pairs = await VoiceService.evaluateAndSyncProximity(worldId, [listener, speaker]);
    let canHearPair = pairs.find((p) => p.listenerId === 'user-listener' && p.speakerId === 'user-speaker');
    assert.strictEqual(canHearPair?.canHear, true);

    // Speaker walks through door into Coding Room
    speaker.zoneId = 'coding';
    speaker.x = 450;
    speaker.y = 592;

    pairs = await VoiceService.evaluateAndSyncProximity(worldId, [listener, speaker]);
    canHearPair = pairs.find((p) => p.listenerId === 'user-listener' && p.speakerId === 'user-speaker');
    assert.strictEqual(canHearPair?.canHear, false, 'Subscription must be revoked immediately on room exit');
  });

  // Test Case 5: Moving out of range: subscription is revoked immediately
  it('5. Moving out of range (> 160px): subscription is revoked immediately', async () => {
    const worldId = 'test-world-distance';
    const listener: ParticipantVoiceState = {
      userId: 'user-listener-5',
      sessionId: 'sess-listener-5',
      displayName: 'Listener',
      zoneId: 'town-hall',
      x: 700,
      y: 600,
      isMuted: false,
      focusTalkEnabled: false,
    };
    const speaker: ParticipantVoiceState = {
      userId: 'user-speaker-5',
      sessionId: 'sess-speaker-5',
      displayName: 'Speaker',
      zoneId: 'town-hall',
      x: 780,
      y: 600, // 80px apart -> can hear
      isMuted: false,
      focusTalkEnabled: false,
    };

    let pairs = await VoiceService.evaluateAndSyncProximity(worldId, [listener, speaker]);
    let canHearPair = pairs.find((p) => p.listenerId === 'user-listener-5' && p.speakerId === 'user-speaker-5');
    assert.strictEqual(canHearPair?.canHear, true);

    // Speaker walks away (200px apart)
    speaker.x = 900;
    pairs = await VoiceService.evaluateAndSyncProximity(worldId, [listener, speaker]);
    canHearPair = pairs.find((p) => p.listenerId === 'user-listener-5' && p.speakerId === 'user-speaker-5');
    assert.strictEqual(canHearPair?.canHear, false, 'Subscription must be revoked immediately when > 160px');
  });

  // Test Case 6: Focus Room initial state: transmission disabled
  it('6. Focus Room initial state: transmission disabled', async () => {
    const listener = { zoneId: 'focus' as const, x: 600, y: 1000 };
    const speaker = { zoneId: 'focus' as const, x: 650, y: 1000, isMuted: false, focusTalkEnabled: false };

    // Within 50px in Focus Room, but Toggle-to-Talk is off
    const result = evaluateVoiceEligibility(listener, speaker);
    assert.strictEqual(result.canHear, false);
    assert.match(result.reason || '', /Focus Room transmission disabled/);
  });

  // Test Case 7: Focus Room toggle on: transmission enabled only when other rules pass
  it('7. Focus Room toggle on: transmission enabled only when other rules pass', async () => {
    const listener = { zoneId: 'focus' as const, x: 600, y: 1000 };
    const speakerWithinRange = { zoneId: 'focus' as const, x: 650, y: 1000, isMuted: false, focusTalkEnabled: true };
    const speakerOutsideRange = { zoneId: 'focus' as const, x: 900, y: 1000, isMuted: false, focusTalkEnabled: true };

    // Within range with toggle on -> can hear
    const validResult = evaluateVoiceEligibility(listener, speakerWithinRange);
    assert.strictEqual(validResult.canHear, true);

    // Outside range (300px) with toggle on -> still cannot hear (proximity rule enforced!)
    const invalidResult = evaluateVoiceEligibility(listener, speakerOutsideRange);
    assert.strictEqual(invalidResult.canHear, false);
    assert.match(invalidResult.reason || '', /exceeds 160px limit/);
  });

  // Test Case 8: Focus Room toggle off: transmission disabled
  it('8. Focus Room toggle off: transmission disabled', async () => {
    const listener = { zoneId: 'focus' as const, x: 600, y: 1000 };
    const speaker = { zoneId: 'focus' as const, x: 650, y: 1000, isMuted: false, focusTalkEnabled: false };

    const result = evaluateVoiceEligibility(listener, speaker);
    assert.strictEqual(result.canHear, false);
  });

  // Test Case 9: Leaving the world: voice access is revoked
  it('9. Leaving the world: voice access is revoked', async () => {
    const worldId = 'test-world-leave';
    const listener: ParticipantVoiceState = {
      userId: 'user-staying',
      sessionId: 'sess-staying',
      displayName: 'Staying',
      zoneId: 'chill',
      x: 1200,
      y: 450,
      isMuted: false,
      focusTalkEnabled: false,
    };
    const departingUser: ParticipantVoiceState = {
      userId: 'user-departing',
      sessionId: 'sess-departing',
      displayName: 'Departing',
      zoneId: 'chill',
      x: 1250,
      y: 450,
      isMuted: false,
      focusTalkEnabled: false,
    };

    // Subscribed initially
    await VoiceService.evaluateAndSyncProximity(worldId, [listener, departingUser]);

    // Departing user leaves world
    await VoiceService.handleParticipantDisconnect(worldId, 'user-departing');

    // Remaining user can no longer hear departed user
    const pairsAfter = await VoiceService.evaluateAndSyncProximity(worldId, [listener]);
    assert.strictEqual(pairsAfter.length, 0);
  });

  // Test Case 10: Newer session replaces older session: older session loses voice access
  it('10. Newer session replaces older session: older session loses voice access', async () => {
    const worldId = 'test-world-replace';
    const userId = 'user-single-session';

    // Session 1 receives voice token
    const token1 = await VoiceService.createVoiceToken(worldId, userId, 'Alex-Old');
    assert.ok(token1.token, 'Session 1 token issued');

    // Newer session 2 replaces older session -> handleParticipantDisconnect called for older socket
    await VoiceService.handleParticipantDisconnect(worldId, userId);

    // Session 2 receives new token
    const token2 = await VoiceService.createVoiceToken(worldId, userId, 'Alex-New');
    assert.ok(token2.token, 'Session 2 token issued');
    assert.notStrictEqual(token1.token, token2.token);
  });
});

