import React from 'react';
import { GameCanvas } from './components/GameCanvas';
import { UIOverlay } from './components/UIOverlay';
import { AuthModal } from './components/AuthModal';
import { WorldLobby } from './components/WorldLobby';
import { useGameStore } from './store/gameStore';

export const App: React.FC = () => {
  const user = useGameStore((state) => state.user);
  const worldId = useGameStore((state) => state.worldId);
  const setWorld = useGameStore((state) => state.setWorld);
  const logout = useGameStore((state) => state.logout);

  // 1. If not logged in, prompt Auth modal
  if (!user) {
    return <AuthModal onSuccess={() => {}} />;
  }

  // 2. If authenticated but not in a world, prompt World Lobby
  if (!worldId) {
    return (
      <WorldLobby
        onEnterWorld={(selectedWorldId, inviteToken, isOwner) => {
          setWorld(selectedWorldId, 'TownHall World', isOwner, inviteToken);
        }}
        onSignOut={() => logout()}
      />
    );
  }

  // 3. In world: Render 2D Phaser game canvas and React UI overlay
  return (
    <div className="w-screen h-screen relative bg-slate-950 overflow-hidden">
      <GameCanvas />
      <UIOverlay />
    </div>
  );
};
