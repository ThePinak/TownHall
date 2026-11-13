import React from 'react';
import { useGameStore } from '../store/gameStore';

export const UIOverlay: React.FC = () => {
  const currentZoneName = useGameStore((state) => state.currentZoneName);
  const currentZoneId = useGameStore((state) => state.currentZoneId);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const displayName = useGameStore((state) => state.displayName);
  const isGameLoaded = useGameStore((state) => state.isGameLoaded);

  const getZoneBadgeColor = (zoneId: string) => {
    switch (zoneId) {
      case 'town-hall': return 'bg-amber-900/80 text-amber-200 border-amber-600/50';
      case 'coding': return 'bg-cyan-950/80 text-cyan-200 border-cyan-600/50';
      case 'learning': return 'bg-emerald-950/80 text-emerald-200 border-emerald-600/50';
      case 'chill': return 'bg-purple-950/80 text-purple-200 border-purple-600/50';
      case 'focus': return 'bg-slate-900/80 text-slate-200 border-slate-600/50';
      default: return 'bg-slate-900/80 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 font-mono select-none">
      {/* Top Bar: Room Banner & World Presence */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3.5 py-1.5 rounded-lg shadow-lg backdrop-blur-sm pointer-events-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-200">TownHall V1</span>
            <span className="text-slate-500 text-xs">|</span>
            <span className="text-xs text-slate-400">1 Player (Local)</span>
          </div>

          {/* Current Room Indicator (Animated on room transition) */}
          <div
            className={`px-3.5 py-1.5 rounded-lg border shadow-lg text-xs font-bold transition-all duration-300 backdrop-blur-sm pointer-events-auto ${getZoneBadgeColor(
              currentZoneId
            )}`}
          >
            📍 {currentZoneName}
          </div>
        </div>

        {/* Player Profile / Coordinates */}
        <div className="bg-slate-900/90 border border-slate-700/80 px-3.5 py-1.5 rounded-lg shadow-lg text-xs text-slate-300 flex items-center gap-3 backdrop-blur-sm pointer-events-auto">
          <span className="text-emerald-400 font-semibold">{displayName}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">
            x: {playerPosition.x}, y: {playerPosition.y}
          </span>
        </div>
      </div>

      {/* Bottom Bar: Keyboard Controls & Status */}
      <div className="flex items-end justify-between w-full">
        <div className="bg-slate-900/85 border border-slate-800 px-3 py-2 rounded-lg text-[11px] text-slate-400 space-y-1 shadow-md backdrop-blur-sm pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="bg-slate-800 border border-slate-700 text-slate-200 px-1.5 py-0.5 rounded text-[10px] font-bold">W A S D</span>
            <span>or</span>
            <span className="bg-slate-800 border border-slate-700 text-slate-200 px-1.5 py-0.5 rounded text-[10px] font-bold">↑ ← ↓ →</span>
            <span>to Move</span>
          </div>
          <div className="text-slate-500 text-[10px]">Speed: 140 px/s (normalized) | Collision: Active</div>
        </div>

        {isGameLoaded && (
          <div className="text-[11px] text-slate-500 bg-slate-950/60 px-2 py-1 rounded border border-slate-800/60 pointer-events-auto">
            M2 Single-Player Engine Ready
          </div>
        )}
      </div>
    </div>
  );
};
