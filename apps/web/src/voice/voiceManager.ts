import { Room, RoomEvent, Track, RemoteTrack, RemoteParticipant, RemoteTrackPublication } from 'livekit-client';
import { useGameStore } from '../store/gameStore';
import { networkManager } from '../network/colyseusClient';

class VoiceManager {
  private room: Room | null = null;
  private attachedElements = new Map<string, HTMLMediaElement>();
  private participantElements = new Map<string, HTMLMediaElement>(); // userId -> audio element
  private mutedUserIds = new Set<string>(); // Locally muted users

  /**
   * Initializes LiveKit connection using a backend-issued voice token.
   */
  async connect(worldId: string, authToken: string): Promise<void> {
    const store = useGameStore.getState();
    store.setVoiceStatus('connecting');
    store.setVoiceError(null);

    try {
      // 1. Request voice token from authoritative backend
      const serverUrl = import.meta.env.VITE_GAME_SERVER_URL || '';
      const httpUrl = serverUrl ? serverUrl.replace(/^ws/, 'http') : '';

      const resp = await fetch(`${httpUrl}/api/voice/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ worldId }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to acquire voice token');
      }

      const { token, url } = await resp.json();

      // If mock token returned (no live LiveKit server configured), establish simulated connected state
      if (token.startsWith('mock-livekit-token:')) {
        console.log('[VoiceManager] Running in simulated voice mode (offline/dev fallback)');
        store.setVoiceStatus('connected');
        return;
      }

      // 2. Initialize LiveKit Room
      this.room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      // Handle incoming remote audio tracks
      this.room.on(
        RoomEvent.TrackSubscribed,
        (track: RemoteTrack, _pub: RemoteTrackPublication, participant: RemoteParticipant) => {
          if (track.kind === Track.Kind.Audio) {
            const element = track.attach();
            if (participant?.identity) {
              this.participantElements.set(participant.identity, element);
            }
            this.attachedElements.set(track.sid || Math.random().toString(), element);
          }
        }
      );

      this.room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        track.detach();
      });

      // Handle active speakers
      this.room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const localSpeaker = speakers.find((s) => s.isLocal);
        const isSpeaking = !!localSpeaker;
        store.setIsSpeaking(isSpeaking);

        // Notify Colyseus state
        const colyseusRoom = networkManager.getRoom();
        if (colyseusRoom) {
          colyseusRoom.send('voice:speaking', { isSpeaking });
        }
      });

      this.room.on(RoomEvent.Disconnected, () => {
        useGameStore.getState().setVoiceStatus('disconnected');
      });

      // Connect to LiveKit SFU
      await this.room.connect(url, token);
      store.setVoiceStatus('connected');

      // Handle browser audio autoplay policy
      if (!this.room.canPlaybackAudio) {
        this.room.startAudio().catch(() => {});
      }

      // Enable microphone by default unless muted
      try {
        await this.room.localParticipant.setMicrophoneEnabled(true);
        store.setIsMicMuted(false);
      } catch (micErr: any) {
        console.warn('[VoiceManager] Microphone access rejected or not found:', micErr.message);
        store.setIsMicMuted(true);
        store.setVoiceError('Microphone permission not granted. You can listen, but others will not hear you.');
      }
    } catch (err: any) {
      console.error('[VoiceManager] Voice connection failed:', err);
      store.setVoiceStatus('error');
      store.setVoiceError(err.message || 'Could not connect to voice server');
    }
  }

  /**
   * Toggles microphone mute state.
   */
  async toggleMute(): Promise<void> {
    const store = useGameStore.getState();
    const newMuted = !store.isMicMuted;

    if (this.room && !this.room.canPlaybackAudio) {
      this.room.startAudio().catch(() => {});
    }

    if (this.room?.localParticipant) {
      try {
        await this.room.localParticipant.setMicrophoneEnabled(!newMuted);
      } catch (err) {
        // Fallback for simulation
      }
    }

    store.setIsMicMuted(newMuted);

    // Notify Colyseus room
    const colyseusRoom = networkManager.getRoom();
    if (colyseusRoom) {
      colyseusRoom.send('voice:mute', { isMuted: newMuted });
    }
  }

  /**
   * Toggles Focus Room transmission (Toggle-to-Talk, DEC-07).
   */
  toggleFocusTalk(): void {
    const store = useGameStore.getState();
    const newFocusTalk = !store.focusTalkEnabled;
    store.setFocusTalkEnabled(newFocusTalk);

    // Notify Colyseus room
    const colyseusRoom = networkManager.getRoom();
    if (colyseusRoom) {
      colyseusRoom.send('voice:focus-talk', { enabled: newFocusTalk });
    }
  }

  /**
   * Toggles local mute for a specific user (does not affect others).
   */
  togglePlayerMute(userId: string): boolean {
    const isMuted = this.mutedUserIds.has(userId);
    if (isMuted) {
      this.mutedUserIds.delete(userId);
    } else {
      this.mutedUserIds.add(userId);
      const el = this.participantElements.get(userId);
      if (el) el.volume = 0;
    }
    useGameStore.getState().toggleMutePlayer(userId);
    return !isMuted;
  }

  isPlayerMuted(userId: string): boolean {
    return this.mutedUserIds.has(userId);
  }

  /**
   * Smooth distance-based proximity volume attenuation (ADR-01)
   * When in same room and within 160 px: volume scales inversely with distance.
   * When outside 160 px or in different room or locally muted: volume is 0.
   */
  updateProximity(userId: string, distance: number, isSameRoom: boolean): void {
    const el = this.participantElements.get(userId);
    if (!el) return;

    if (!isSameRoom || distance > 160 || this.mutedUserIds.has(userId)) {
      if (el.volume !== 0) el.volume = 0;
    } else {
      // Linear falloff: 1.0 (at distance 0) down to 0.0 (at distance 160)
      const ratio = Math.max(0, Math.min(1, 1 - distance / 160));
      // Ease-out curve for natural acoustics
      const targetVolume = Math.round(ratio * ratio * 100) / 100;
      if (Math.abs(el.volume - targetVolume) > 0.02) {
        el.volume = targetVolume;
      }
    }
  }

  /**
   * Disconnects LiveKit room and cleans up audio elements.
   */
  disconnect(): void {
    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }

    for (const el of this.attachedElements.values()) {
      el.remove();
    }
    this.attachedElements.clear();
    this.participantElements.clear();

    const store = useGameStore.getState();
    store.setVoiceStatus('disconnected');
    store.setIsSpeaking(false);
    store.setFocusTalkEnabled(false);
  }
}

export const voiceManager = new VoiceManager();

