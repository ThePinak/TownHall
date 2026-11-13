import React from 'react';
import { GameCanvas } from './components/GameCanvas';
import { UIOverlay } from './components/UIOverlay';

export const App: React.FC = () => {
  return (
    <div className="w-screen h-screen relative bg-slate-950 overflow-hidden">
      <GameCanvas />
      <UIOverlay />
    </div>
  );
};

