import { create } from 'zustand';
import { ZoneId, ZONES, AvatarId } from '@townhall/shared';

interface GameState {
  currentZoneId: ZoneId;
  currentZoneName: string;
  playerPosition: { x: number; y: number };
  avatarId: AvatarId;
  displayName: string;
  isGameLoaded: boolean;

  setCurrentZone: (zoneId: ZoneId) => void;
  setPlayerPosition: (pos: { x: number; y: number }) => void;
  setAvatarId: (avatarId: AvatarId) => void;
  setDisplayName: (name: string) => void;
  setGameLoaded: (loaded: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentZoneId: 'town-hall',
  currentZoneName: ZONES['town-hall'].name,
  playerPosition: { x: 720, y: 592 },
  avatarId: 'avatar-01',
  displayName: 'Alex',
  isGameLoaded: false,

  setCurrentZone: (zoneId: ZoneId) =>
    set({
      currentZoneId: zoneId,
      currentZoneName: ZONES[zoneId]?.name || 'Unknown Area',
    }),
  setPlayerPosition: (pos) => set({ playerPosition: pos }),
  setAvatarId: (avatarId) => set({ avatarId }),
  setDisplayName: (name) => set({ displayName: name }),
  setGameLoaded: (loaded) => set({ isGameLoaded: loaded }),
}));
