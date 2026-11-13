import { create } from 'zustand';
import { ZoneId, ZONES, AvatarId, UserProfile } from '@townhall/shared';

export type NetworkStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type VoiceStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

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

  // Voice State (M5)
  voiceStatus: VoiceStatus;
  isMicMuted: boolean;
  isSpeaking: boolean;
  focusTalkEnabled: boolean;
  voiceError: string | null;
  mutedPlayerIds: string[]; // List of userIds locally muted by the user

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
  setVoiceStatus: (status: VoiceStatus) => void;
  setIsMicMuted: (muted: boolean) => void;
  setIsSpeaking: (speaking: boolean) => void;
  setFocusTalkEnabled: (enabled: boolean) => void;
  setVoiceError: (error: string | null) => void;
  toggleMutePlayer: (userId: string) => void;
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

  voiceStatus: 'disconnected',
  isMicMuted: false,
  isSpeaking: false,
  focusTalkEnabled: false,
  voiceError: null,
  mutedPlayerIds: [],

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
  setVoiceStatus: (status) => set({ voiceStatus: status }),
  setIsMicMuted: (muted) => set({ isMicMuted: muted }),
  setIsSpeaking: (speaking) => set({ isSpeaking: speaking }),
  setFocusTalkEnabled: (enabled) => set({ focusTalkEnabled: enabled }),
  setVoiceError: (error) => set({ voiceError: error }),
  toggleMutePlayer: (userId: string) =>
    set((state) => {
      const exists = state.mutedPlayerIds.includes(userId);
      return {
        mutedPlayerIds: exists
          ? state.mutedPlayerIds.filter((id) => id !== userId)
          : [...state.mutedPlayerIds, userId],
      };
    }),
  logout: () =>
    set({
      user: null,
      authToken: null,
      worldId: null,
      worldName: null,
      isOwner: false,
      activeInviteToken: null,
      networkStatus: 'disconnected',
      voiceStatus: 'disconnected',
      isMicMuted: false,
      isSpeaking: false,
      focusTalkEnabled: false,
      voiceError: null,
      mutedPlayerIds: [],
    }),
}));
