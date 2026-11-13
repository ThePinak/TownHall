import { Client, Room } from 'colyseus.js';
import { useGameStore } from '../store/gameStore';
import { MovePayload, JoinPayload, DISCONNECT_CODE_NEWER_SESSION } from '@townhall/shared';

class ColyseusNetworkManager {
  private client: Client;
  private room: Room | null = null;
  private isConnecting = false;

  constructor() {
    const wsUrl = import.meta.env.VITE_GAME_SERVER_URL || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:2567`;
    this.client = new Client(wsUrl);
  }

  async joinWorld(options: JoinPayload): Promise<Room> {
    if (this.room) return this.room;
    if (this.isConnecting) throw new Error('Connection already in progress');

    this.isConnecting = true;
    useGameStore.getState().setNetworkStatus('connecting');
    useGameStore.getState().setDisconnectReason(null);

    try {
      this.room = await this.client.joinOrCreate('world_room', options);
      useGameStore.getState().setNetworkStatus('connected');
      useGameStore.getState().setSessionId(this.room.sessionId);

      console.log(`[Colyseus] Joined room: ${this.room.id} as sessionId: ${this.room.sessionId}`);

      // Handle room errors & disconnects
      this.room.onError((code: number, message?: string) => {
        console.error(`[Colyseus] Room error (${code}): ${message}`);
        useGameStore.getState().setNetworkStatus('error');
      });

      this.room.onLeave((code: number) => {
        console.log(`[Colyseus] Left room with code: ${code}`);
        useGameStore.getState().setNetworkStatus('disconnected');

        if (code === DISCONNECT_CODE_NEWER_SESSION) {
          useGameStore
            .getState()
            .setDisconnectReason(
              'You were disconnected because a newer session was opened for this account from another window or device (ADR-03).'
            );
        }

        this.room = null;
      });

      return this.room;
    } catch (err: any) {
      console.error('[Colyseus] Failed to join room:', err);
      useGameStore.getState().setNetworkStatus('error');
      this.isConnecting = false;
      throw err;
    } finally {
      this.isConnecting = false;
    }
  }

  async leaveWorld() {
    if (this.room) {
      try {
        await this.room.leave();
      } catch (err) {
        // ignore
      }
      this.room = null;
    }
    useGameStore.getState().setNetworkStatus('disconnected');
  }

  sendMove(payload: MovePayload) {
    if (this.room) {
      this.room.send('move', payload);
    }
  }

  getRoom(): Room | null {
    return this.room;
  }
}

export const networkManager = new ColyseusNetworkManager();
