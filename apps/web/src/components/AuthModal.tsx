import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { AVATAR_IDS, AvatarId } from '@townhall/shared';

interface AuthModalProps {
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const { setUser } = useGameStore();
  const [mode, setMode] = useState<'guest' | 'login' | 'register'>('guest');
  const [displayName, setDisplayName] = useState('Alex');
  const [avatarId, setAvatarId] = useState<AvatarId>('avatar-01');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Please enter a display name');
      return;
    }

    const guestId = `guest-${Math.random().toString(36).substring(2, 9)}`;
    const guestToken = `dev-token:${guestId}:${displayName.trim()}:${avatarId}`;

    setUser(
      {
        userId: guestId,
        displayName: displayName.trim(),
        avatarId,
        createdAt: new Date().toISOString(),
      },
      guestToken
    );
    onSuccess();
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    // In local/dev environment, generate deterministic dev token based on email
    const userId = `user-${btoa(email.trim().toLowerCase()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`;
    const devToken = `dev-token:${userId}:${displayName.trim() || email.split('@')[0]}:${avatarId}`;

    setUser(
      {
        userId,
        email: email.trim(),
        displayName: displayName.trim() || email.split('@')[0],
        avatarId,
        createdAt: new Date().toISOString(),
      },
      devToken
    );
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">TownHall Social World</h2>
          <p className="text-xs text-slate-400">Invite-Only Private Pixel-Art Multiplayer Space</p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('guest')}
            className={`py-2 rounded-md transition-colors ${
              mode === 'guest' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Quick Join (Guest)
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 rounded-md transition-colors ${
              mode === 'login' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Account Login
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-500/50 rounded-lg text-red-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={mode === 'guest' ? handleGuestSubmit : handleAuthSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              maxLength={20}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
              placeholder="e.g. Alex"
              required
            />
          </div>

          {mode === 'login' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                  placeholder="alex@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </>
          )}

          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Choose Avatar</label>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAvatarId(id)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    avatarId === id
                      ? 'border-amber-400 bg-amber-400/10 ring-2 ring-amber-400/30'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="w-8 h-12 mx-auto overflow-hidden bg-slate-900 rounded flex items-center justify-center mb-1">
                    <img
                      src={`/assets/characters/${id}.png`}
                      alt={id}
                      className="max-h-full object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">{id}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors text-sm shadow-lg shadow-amber-500/20"
          >
            {mode === 'guest' ? 'Continue as Guest' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
