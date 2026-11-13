import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { networkManager } from '../network/colyseusClient';
import { voiceManager } from '../voice/voiceManager';

interface Occupant {
  sessionId: string;
  userId: string;
  displayName: string;
  avatarId: string;
  isSelf: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
}

export const RoomOccupants: React.FC = () => {
  const currentZoneId = useGameStore((state) => state.currentZoneId);
  const currentZoneName = useGameStore((state) => state.currentZoneName);
  const user = useGameStore((state) => state.user);
  const displayName = useGameStore((state) => state.displayName);
  const avatarId = useGameStore((state) => state.avatarId);
  const isSpeaking = useGameStore((state) => state.isSpeaking);
  const isMicMuted = useGameStore((state) => state.isMicMuted);
  const mutedPlayerIds = useGameStore((state) => state.mutedPlayerIds);

  const [occupants, setOccupants] = useState<Occupant[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const updateList = () => {
      const room = networkManager.getRoom();
      const list: Occupant[] = [];

      // 1. Add local player (You)
      list.push({
        sessionId: room?.sessionId || 'local',
        userId: user?.userId || 'local-user',
        displayName: `${displayName} (You)`,
        avatarId: avatarId || 'avatar-01',
        isSelf: true,
        isSpeaking: isSpeaking,
        isMuted: isMicMuted,
      });

      // 2. Add remote players who are physically present in the same zone
      if (room && room.state && room.state.players) {
        room.state.players.forEach((player: any, sessionId: string) => {
          if (sessionId === room.sessionId) return;
          if (player.zoneId === currentZoneId) {
            list.push({
              sessionId,
              userId: player.userId || sessionId,
              displayName: player.displayName || 'Player',
              avatarId: player.avatarId || 'avatar-01',
              isSelf: false,
              isSpeaking: !!player.isSpeaking,
              isMuted: !!player.isMuted,
            });
          }
        });
      }

      setOccupants(list);
    };

    updateList();
    const interval = setInterval(updateList, 200); // 5 Hz refresh to capture live room transitions
    return () => clearInterval(interval);
  }, [currentZoneId, currentZoneName, user, displayName, avatarId, isSpeaking, isMicMuted, mutedPlayerIds]);

  return (
    <div className="pointer-events-auto flex flex-col gap-1 w-64 select-none">
      {/* Header / Room Occupancy Badge */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-3 py-2 bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 rounded-xl shadow-lg backdrop-blur-md cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-200">
            {currentZoneName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
            {occupants.length} {occupants.length === 1 ? 'Present' : 'Present'}
          </span>
          <span className="text-slate-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Dropdown list of occupants */}
      {isExpanded && (
        <div className="flex flex-col gap-1 p-1.5 bg-slate-950/85 border border-slate-800/90 rounded-xl shadow-2xl backdrop-blur-md max-h-56 overflow-y-auto">
          {occupants.map((occ) => {
            const isLocallyMuted = mutedPlayerIds.includes(occ.userId);
            return (
              <div
                key={occ.sessionId}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  occ.isSelf
                    ? 'bg-slate-800/60 border border-slate-700/60 text-emerald-300'
                    : 'hover:bg-slate-800/40 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {/* Speaking indicator dot */}
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      occ.isSpeaking
                        ? 'bg-emerald-400 ring-2 ring-emerald-400/40 animate-pulse'
                        : occ.isMuted
                        ? 'bg-rose-500/60'
                        : 'bg-slate-600'
                    }`}
                    title={
                      occ.isSpeaking
                        ? 'Speaking'
                        : occ.isMuted
                        ? 'Mic muted'
                        : 'Silent'
                    }
                  />

                  {/* Player Name */}
                  <span className="truncate font-medium text-[11px]">
                    {occ.displayName}
                  </span>
                </div>

                {/* Individual Mute Control Button */}
                <div className="flex items-center gap-1">
                  {occ.isSelf ? (
                    <span className="text-[10px] text-slate-500 px-1 py-0.5 font-mono">
                      {occ.isMuted ? 'MUTED' : 'LIVE'}
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        voiceManager.togglePlayerMute(occ.userId);
                      }}
                      className={`p-1 px-1.5 rounded text-[11px] font-bold transition-all ${
                        isLocallyMuted
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-600/60 hover:bg-rose-900'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                      title={
                        isLocallyMuted
                          ? `Unmute ${occ.displayName}`
                          : `Mute ${occ.displayName} for you`
                      }
                    >
                      {isLocallyMuted ? '🔇 Muted' : '🔊 Mute'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

