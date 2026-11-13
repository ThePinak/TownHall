import { create } from 'zustand';
import { ZoneId, ZONES, AvatarId, UserProfile } from '@townhall/shared';

export type NetworkStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface GameState {
  // Game & World state
  currentZoneId: ZoneId;
  currentZoneName: string;
  playerPosition: { x: number; y: number };
  avatarId: AvatarId;
  displayName: string;
  isGameLoaded: boolean;

  // Multiplayer & World
  networkStatus: NetworkStatus;
  onlineCount: number;
  sessionId: string;
  worldId: string | null;
  worldName: string | null;
  isOwner: boolean;
  activeInviteToken: string | null;

  // Auth & Session
  user: UserProfile | null;
  authToken: string | null;
  disconnectReason: string | null;

  setCurrentZone: (zoneId: ZoneId) => void;
  setPlayerPosition: (pos: { x: number; y: number }) => void;
  setAvatarId: (avatarId: AvatarId) => void;
  setDisplayName: (name: string) => void;
  setGameLoaded: (loaded: boolean) => void;
  setNetworkStatus: (status: NetworkStatus) => void;
  setOnlineCount: (count: number) => void;
  setSessionId: (id: string) => void;
  setWorld: (worldId: string | null, worldName: string | null, isOwner?: boolean, inviteToken?: string | null) => void;
  setUser: (user: UserProfile | null, token: string | null) => void;
  setDisconnectReason: (reason: string | null) => void;
  logout: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentZoneId: 'town-hall',
  currentZoneName: ZONES['town-hall'].name,
  playerPosition: { x: 720, y: 592 },
  avatarId: 'avatar-01',
  displayName: `Alex`,
  isGameLoaded: false,

  networkStatus: 'disconnected',
  onlineCount: 1,
  sessionId: '',
  worldId: null,
  worldName: null,
  isOwner: false,
  activeInviteToken: null,

  user: null,
  authToken: null,
  disconnectReason: null,

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
  setWorld: (worldId, worldName, isOwner = false, inviteToken = null) =>
    set({
      worldId,
      worldName,
      isOwner,
      activeInviteToken: inviteToken,
    }),
  setUser: (user, token) =>
    set({
      user,
      authToken: token,
      displayName: user?.displayName || 'Player',
      avatarId: user?.avatarId || 'avatar-01',
    }),
  setDisconnectReason: (reason) => set({ disconnectReason: reason }),
  logout: () =>
    set({
      user: null,
      authToken: null,
      worldId: null,
      worldName: null,
      isOwner: false,
      activeInviteToken: null,
      networkStatus: 'disconnected',
    }),
}));
