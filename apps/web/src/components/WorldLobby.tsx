import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

interface WorldLobbyProps {
  onEnterWorld: (worldId: string, inviteToken: string, isOwner: boolean) => void;
  onSignOut: () => void;
}

export const WorldLobby: React.FC<WorldLobbyProps> = ({ onEnterWorld, onSignOut }) => {
  const { user, authToken, disconnectReason } = useGameStore();
  const [worldName, setWorldName] = useState('My Town');
  const [inviteInput, setInviteInput] = useState('');
  const [createdInviteToken, setCreatedInviteToken] = useState<string | null>(null);
  const [createdWorldId, setCreatedWorldId] = useState<string | null>(null);
  const [activeOwnedWorld, setActiveOwnedWorld] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serverUrl = import.meta.env.VITE_GAME_SERVER_URL || '';
  const httpUrl = serverUrl ? serverUrl.replace(/^ws/, 'http') : '';

  // Check URL query parameters for ?invite=XYZ
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteParam = params.get('invite');
    if (inviteParam) {
      setInviteInput(inviteParam);
    }
  }, []);

  // Fetch active world owned by this user (ADR-05 recovery)
  useEffect(() => {
    if (!authToken) return;
    fetch(`${httpUrl}/api/worlds/my-active`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((res) => (res.ok ? res.json() : { world: null }))
      .then((data) => {
        if (data.world) {
          setActiveOwnedWorld(data.world);
        }
      })
      .catch(() => {});
  }, [authToken, httpUrl]);

  const handleCreateWorld = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const resp = await fetch(`${httpUrl}/api/worlds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: worldName }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        if (resp.status === 401) {
          onSignOut();
          return;
        }
        throw new Error(data.error || 'Failed to create private world');
      }

      setCreatedWorldId(data.world.id);
      setCreatedInviteToken(data.inviteToken);

      // Immediately enter the world as owner
      onEnterWorld(data.world.id, data.inviteToken, true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinWorld = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Extract raw token from full URL or bare string
    let token = inviteInput.trim();
    if (token.includes('invite=')) {
      token = token.split('invite=')[1].split('&')[0];
    }

    if (!token) {
      setError('Please provide a valid invitation code or link');
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await fetch(`${httpUrl}/api/invitations/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteToken: token }),
      });

      const data = await resp.json();
      if (!resp.ok || !data.valid) {
        throw new Error(data.error || 'Invalid or expired invitation');
      }

      onEnterWorld(data.worldId, token, false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInviteLink = () => {
    if (!createdInviteToken) return;
    const inviteUrl = `${window.location.origin}/?invite=${createdInviteToken}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 text-slate-100">
        {/* Header with User Info */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center overflow-hidden">
              <img
                src={`/assets/characters/${user?.avatarId || 'avatar-01'}.png`}
                alt="Avatar"
                className="max-h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <div>
              <h3 className="font-bold text-white leading-tight">{user?.displayName}</h3>
              <span className="text-[11px] text-slate-400 font-mono">User ID: {user?.userId.slice(0, 8)}...</span>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            Switch Profile
          </button>
        </div>

        {disconnectReason && (
          <div className="mb-6 p-3 bg-amber-950/60 border border-amber-500/50 rounded-lg text-amber-200 text-xs">
            {disconnectReason}
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-950/60 border border-red-500/50 rounded-lg text-red-200 text-xs">
            {error}
          </div>
        )}

        {activeOwnedWorld && (
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/40 rounded-xl flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Your Active World</span>
              </div>
              <h4 className="text-base font-bold text-white mt-1">{activeOwnedWorld.name}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Status: <span className="text-emerald-400 capitalize">{activeOwnedWorld.status.replace('_', ' ')}</span> • You are the world owner (no invite code needed)
              </p>
            </div>
            <button
              onClick={() => onEnterWorld(activeOwnedWorld.id, '', true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Rejoin World</span>
              <span>→</span>
            </button>
          </div>
        )}

        {createdInviteToken && createdWorldId ? (
          /* World Created Success Box */
          <div className="p-6 bg-slate-950 border border-amber-500/30 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              Private World Created Successfully!
            </div>
            <p className="text-xs text-slate-300">
              Your world is ready. Share this invite link with friends (up to 20 users max):
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/?invite=${createdInviteToken}`}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 select-all"
              />
              <button
                onClick={copyInviteLink}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg text-xs transition-colors whitespace-nowrap"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
            <button
              onClick={() => onEnterWorld(createdWorldId, createdInviteToken, true)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors text-sm shadow-lg shadow-amber-500/20"
            >
              Enter World Now
            </button>
          </div>
        ) : (
          /* Two Column Actions: Create or Join */
          <div className="grid md:grid-cols-2 gap-6">
            {/* Create World Form */}
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-white mb-1">Create Private World</h4>
                <p className="text-[11px] text-slate-400 mb-4">
                  Spawn a private 5-room space. Max 1 active world per owner (ADR-05).
                </p>
                <form onSubmit={handleCreateWorld} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">World Name</label>
                    <input
                      type="text"
                      value={worldName}
                      maxLength={32}
                      onChange={(e) => setWorldName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                      placeholder="My Town"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg transition-colors text-xs shadow-md shadow-amber-500/20"
                  >
                    {isSubmitting ? 'Creating...' : 'Create World'}
                  </button>
                </form>
              </div>
            </div>

            {/* Join World Form */}
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-white mb-1">Join via Invitation</h4>
                <p className="text-[11px] text-slate-400 mb-4">
                  Enter an invitation link or 32-character code to enter a friend's world.
                </p>
                <form onSubmit={handleJoinWorld} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Invite Code / Link</label>
                    <input
                      type="text"
                      value={inviteInput}
                      onChange={(e) => setInviteInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                      placeholder="e.g. 5a1b... or URL"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors text-xs border border-slate-700"
                  >
                    {isSubmitting ? 'Validating...' : 'Join World'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

