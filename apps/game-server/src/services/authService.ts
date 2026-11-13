import crypto from 'node:crypto';
import { UserProfile, AvatarId } from '@townhall/shared';
import { db } from '../db/dbClient';

export function generateInviteSecret(): string {
  // 32-character cryptographically random token (DEC-09)
  return crypto.randomBytes(16).toString('hex');
}

export function hashSecret(secret: string): string {
  // SHA-256 hash for database storage (DEC-09)
  return crypto.createHash('sha256').update(secret.trim()).digest('hex');
}

export async function verifyAuthToken(token?: string): Promise<UserProfile | null> {
  if (!token || !token.trim()) return null;

  // 1. Check for dev/offline token pattern: "dev-token:{userId}:{displayName}:{avatarId}"
  if (token.startsWith('dev-token:')) {
    const parts = token.split(':');
    const userId = parts[1] || crypto.randomUUID();
    const displayName = parts[2] || `Player-${userId.slice(0, 4)}`;
    const avatarId = (parts[3] as AvatarId) || 'avatar-01';

    let profile = await db.getProfile(userId);
    if (!profile) {
      profile = await db.upsertProfile({
        userId,
        displayName,
        avatarId,
        createdAt: new Date().toISOString(),
      });
    }
    return profile;
  }

  // 2. Check live Supabase JWT if configured
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) return null;

      let profile = await db.getProfile(user.id);
      if (!profile) {
        profile = await db.upsertProfile({
          userId: user.id,
          email: user.email,
          displayName: user.user_metadata?.display_name || user.email?.split('@')[0] || `User-${user.id.slice(0, 4)}`,
          avatarId: user.user_metadata?.avatar_id || 'avatar-01',
          createdAt: new Date().toISOString(),
        });
      }
      return profile;
    } catch (err) {
      console.error('[AuthService] Supabase token verification failed:', err);
      return null;
    }
  }

  return null;
}
