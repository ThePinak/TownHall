import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { networkManager } from '../network/colyseusClient';
import { VoiceControls } from './VoiceControls';
import { RoomOccupants } from './RoomOccupants';

export const UIOverlay: React.FC = () => {
  const currentZoneName = useGameStore((state) => state.currentZoneName);
  const currentZoneId = useGameStore((state) => state.currentZoneId);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const displayName = useGameStore((state) => state.displayName);
  const isGameLoaded = useGameStore((state) => state.isGameLoaded);
  const onlineCount = useGameStore((state) => state.onlineCount);
  const networkStatus = useGameStore((state) => state.networkStatus);

  const worldId = useGameStore((state) => state.worldId);
  const worldName = useGameStore((state) => state.worldName);
  const isOwner = useGameStore((state) => state.isOwner);
  const activeInviteToken = useGameStore((state) => state.activeInviteToken);
  const authToken = useGameStore((state) => state.authToken);
  const disconnectReason = useGameStore((state) => state.disconnectReason);
  const setWorld = useGameStore((state) => state.setWorld);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentInviteToken, setCurrentInviteToken] = useState<string | null>(activeInviteToken);

  const serverUrl = import.meta.env.VITE_GAME_SERVER_URL || 'http://localhost:2567';
  const httpUrl = serverUrl.replace(/^ws/, 'http');

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

  const getStatusDotColor = () => {
    switch (networkStatus) {
      case 'connected': return 'bg-emerald-500 animate-pulse';
      case 'connecting': return 'bg-amber-500 animate-pulse';
      case 'error': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  const handleCopyInvite = () => {
    const token = currentInviteToken || activeInviteToken;
    if (!token) return;
    const url = `${window.location.origin}/?invite=${token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateInvite = async () => {
    if (!worldId || !authToken) return;
    setIsRegenerating(true);
    try {
      const resp = await fetch(`${httpUrl}/api/worlds/${worldId}/invitations/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);

      setCurrentInviteToken(data.newInviteToken);
      setWorld(worldId, worldName, isOwner, data.newInviteToken);
      alert('Previous invite link has been revoked! A new link was generated.');
    } catch (err: any) {
      alert(`Error regenerating invite: ${err.message}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleLeaveWorld = async () => {
    await networkManager.leaveWorld();
    setWorld(null, null, false, null);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 font-mono select-none">
      {/* Top Bar: Room Banner & World Presence */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3.5 py-1.5 rounded-lg shadow-lg backdrop-blur-sm pointer-events-auto">
            <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor()}`}></span>
            <span className="text-xs font-semibold text-slate-200">{worldName || 'TownHall'}</span>
            {isOwner && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-bold">
                OWNER
              </span>
            )}
            <span className="text-slate-500 text-xs">|</span>
            <span className="text-xs text-slate-300 font-bold">
              {onlineCount} / 20 Online
            </span>
          </div>

          {/* Current Room Indicator */}
          <div
            className={`px-3.5 py-1.5 rounded-lg border shadow-lg text-xs font-bold transition-all duration-300 backdrop-blur-sm pointer-events-auto ${getZoneBadgeColor(
              currentZoneId
            )}`}
          >
            📍 {currentZoneName}
          </div>
        </div>

        {/* Right Actions: Owner Controls, Profile, Leave */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {isOwner && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg shadow-lg transition-colors flex items-center gap-1.5"
            >
              ✉ Invite Friends
            </button>
          )}

          <div className="bg-slate-900/90 border border-slate-700/80 px-3.5 py-1.5 rounded-lg shadow-lg text-xs text-slate-300 flex items-center gap-2 backdrop-blur-sm">
            <span className="text-emerald-400 font-semibold">{displayName}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 text-[11px]">
              {playerPosition.x}, {playerPosition.y}
            </span>
          </div>

          <button
            onClick={handleLeaveWorld}
            className="bg-slate-900/90 hover:bg-red-950/80 hover:text-red-300 hover:border-red-600/50 border border-slate-700/80 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg shadow-lg transition-colors"
            title="Leave World and return to Lobby"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Left Widget: Room Occupants (Who is in this room) */}
      <div className="mt-3 self-start">
        <RoomOccupants />
      </div>

      {/* Disconnect Alert Banner */}
      {disconnectReason && (
        <div className="self-center pointer-events-auto bg-red-950/95 border border-red-500 text-red-200 p-4 rounded-xl shadow-2xl max-w-lg text-center my-auto animate-bounce">
          <h4 className="font-bold text-sm mb-1 text-white">Connection Terminated</h4>
          <p className="text-xs mb-3">{disconnectReason}</p>
          <button
            onClick={handleLeaveWorld}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors"
          >
            Return to Lobby
          </button>
        </div>
      )}

      {/* Owner Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 pointer-events-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Private World Invitation (DEC-09)</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Only users with this invite link can enter this private world (max 20 concurrent users).
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/?invite=${currentInviteToken || activeInviteToken}`}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 select-all"
              />
              <button
                onClick={handleCopyInvite}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors whitespace-nowrap"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Need to lock out prior invitees?</span>
              <button
                onClick={handleRegenerateInvite}
                disabled={isRegenerating}
                className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 font-semibold"
              >
                {isRegenerating ? 'Revoking...' : 'Revoke & Regenerate Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar: Keyboard Controls & Status */}
      <div className="flex items-end justify-between w-full">
        <div className="bg-slate-900/85 border border-slate-800 px-3 py-2 rounded-lg text-[11px] text-slate-400 space-y-1 shadow-md backdrop-blur-sm pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="bg-slate-800 border border-slate-700 text-slate-200 px-1.5 py-0.5 rounded text-[10px] font-bold">W A S D</span>
            <span>or</span>
            <span className="bg-slate-800 border border-slate-700 text-slate-200 px-1.5 py-0.5 rounded text-[10px] font-bold">↑ ← ↓ →</span>
            <span>to Move</span>
          </div>
          <div className="text-slate-500 text-[10px]">Speed: 140 px/s | 20 Hz State Sync | Max: 20 Players</div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <VoiceControls />
          {isGameLoaded && (
            <div className="text-[11px] text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800 shadow backdrop-blur-sm pointer-events-auto flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Multiplayer Mode (Colyseus)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
