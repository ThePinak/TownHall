import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { AVATAR_IDS, AvatarId } from '@townhall/shared';

interface AuthModalProps {
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const { setUser } = useGameStore();
  const [isRegistering, setIsRegistering] = useState(false);
  const [displayName, setDisplayName] = useState('Alex');
  const [avatarId, setAvatarId] = useState<AvatarId>('avatar-01');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serverUrl = import.meta.env.VITE_GAME_SERVER_URL || '';
  const httpUrl = serverUrl ? serverUrl.replace(/^ws/, 'http') : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (isRegistering && !displayName.trim()) {
      setError('Please choose a display name');
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = isRegistering ? `${httpUrl}/api/auth/register` : `${httpUrl}/api/auth/login`;
      const payload = isRegistering
        ? { email: cleanEmail, password, displayName: displayName.trim(), avatarId }
        : { email: cleanEmail, password };

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      if (!resp.ok) {
        if (!isRegistering && (resp.status === 401 || data.error?.includes('Invalid'))) {
          throw new Error('Invalid email or password. If you haven\'t created an account yet, switch to the "Create Account" tab above.');
        }
        throw new Error(data.error || 'Authentication failed');
      }

      // Save credentials for persistence
      localStorage.setItem('townhall_auth_token', data.token);
      localStorage.setItem('townhall_auth_profile', JSON.stringify(data.user));

      setUser(data.user, data.token);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-7 text-slate-100">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/40 rounded-xl mx-auto flex items-center justify-center mb-3">
            <span className="text-2xl">🏛️</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">TownHall World</h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRegistering
              ? 'Create a registered account to own private worlds'
              : 'Sign in to access your private world or join invitations'}
          </p>
        </div>

        {/* Tab switch between Sign In and Register */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl mb-6 text-xs font-semibold border border-slate-800">
          <button
            type="button"
            onClick={() => { setIsRegistering(false); setError(null); }}
            className={`py-2.5 rounded-lg transition-all ${
              !isRegistering
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegistering(true); setError(null); }}
            className={`py-2.5 rounded-lg transition-all ${
              isRegistering
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-500/50 rounded-lg text-red-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {isRegistering && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                maxLength={20}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                placeholder="e.g. Alex"
                required
              />
            </div>
          )}

          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Select Character Avatar</label>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAvatarId(id)}
                  className={`p-2 rounded-xl border text-center transition-all ${
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
                  <span className="text-[10px] text-slate-400 block truncate font-mono">{id}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-colors text-sm shadow-lg shadow-amber-500/25"
          >
            {isSubmitting
              ? isRegistering ? 'Registering...' : 'Signing in...'
              : isRegistering ? 'Register & Enter World Lobby' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-500 mt-5">
          {isRegistering ? 'Already have an account? ' : "Don't have an account yet? "}
          <button
            type="button"
            onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
            className="text-amber-400 hover:underline font-semibold"
          >
            {isRegistering ? 'Sign In' : 'Create Account'}
          </button>
        </p>
      </div>
    </div>
  );
};
