import React, { useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { UIOverlay } from './components/UIOverlay';
import { AuthModal } from './components/AuthModal';
import { WorldLobby } from './components/WorldLobby';
import { useGameStore } from './store/gameStore';

export const App: React.FC = () => {
  const user = useGameStore((state) => state.user);
  const worldId = useGameStore((state) => state.worldId);
  const setWorld = useGameStore((state) => state.setWorld);
  const setUser = useGameStore((state) => state.setUser);
  const logout = useGameStore((state) => state.logout);

  // Restore authenticated session from localStorage on initial load
  useEffect(() => {
    const savedToken = localStorage.getItem('townhall_auth_token');
    const savedProfile = localStorage.getItem('townhall_auth_profile');
    if (savedToken && savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setUser(profile, savedToken);
      } catch (err) {
        localStorage.removeItem('townhall_auth_token');
        localStorage.removeItem('townhall_auth_profile');
      }
    }
  }, [setUser]);

  const handleSignOut = () => {
    localStorage.removeItem('townhall_auth_token');
    localStorage.removeItem('townhall_auth_profile');
    logout();
  };

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
        onSignOut={handleSignOut}
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
