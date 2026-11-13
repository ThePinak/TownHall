import { Client, Room } from 'colyseus.js';
import { useGameStore } from '../store/gameStore';
import { MovePayload, JoinPayload } from '@townhall/shared';

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

  sendMove(payload: MovePayload) {
    if (this.room) {
      this.room.send('move', payload);
    }
  }

  getRoom(): Room | null {
    return this.room;
  }

  leave() {
    if (this.room) {
      this.room.leave();
      this.room = null;
    }
  }
}

export const networkManager = new ColyseusNetworkManager();
