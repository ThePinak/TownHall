import { create } from 'zustand';
import { ZoneId, ZONES, AvatarId } from '@townhall/shared';

export type NetworkStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface GameState {
  currentZoneId: ZoneId;
  currentZoneName: string;
  playerPosition: { x: number; y: number };
  avatarId: AvatarId;
  displayName: string;
  isGameLoaded: boolean;

  networkStatus: NetworkStatus;
  onlineCount: number;
  sessionId: string;

  setCurrentZone: (zoneId: ZoneId) => void;
  setPlayerPosition: (pos: { x: number; y: number }) => void;
  setAvatarId: (avatarId: AvatarId) => void;
  setDisplayName: (name: string) => void;
  setGameLoaded: (loaded: boolean) => void;
  setNetworkStatus: (status: NetworkStatus) => void;
  setOnlineCount: (count: number) => void;
  setSessionId: (id: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentZoneId: 'town-hall',
  currentZoneName: ZONES['town-hall'].name,
  playerPosition: { x: 720, y: 592 },
  avatarId: 'avatar-01',
  displayName: `Guest-${Math.floor(1000 + Math.random() * 9000)}`,
  isGameLoaded: false,

  networkStatus: 'disconnected',
  onlineCount: 1,
  sessionId: '',

  setCurrentZone: (zoneId: ZoneId) =>
    set({
      currentZoneId: zoneId,
      currentZoneName: ZONES[zoneId]?.name || 'Unknown Area',
    }),
  setPlayerPosition: (pos) => set({ playerPosition: pos }),
  setAvatarId: (avatarId) => set({ avatarId }),
  setDisplayName: (name) => set({ displayName: name }),
  setGameLoaded: (loaded) => set({ isGameLoaded: loaded }),
  setNetworkStatus: (status) => set({ networkStatus: status }),
  setOnlineCount: (count) => set({ onlineCount: count }),
  setSessionId: (id) => set({ sessionId: id }),
}));

