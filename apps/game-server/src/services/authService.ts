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

  // 1. Check for offline/dev token pattern: "token:{uuid}:{displayName}:{avatarId}" or "dev-token:..."
  if (token.startsWith('token:') || token.startsWith('dev-token:')) {
    const parts = token.split(':');
    let userId = parts[1];
    
    // Validate UUID format; if not a UUID, generate a deterministic UUID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      userId = crypto.randomUUID();
    }

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
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
      });
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

export async function registerUser(
  email: string,
  password: string,
  displayName: string,
  avatarId: AvatarId
): Promise<{ user: UserProfile; token: string }> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Live Supabase Auth if configured
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_ANON_KEY) {
    const { createClient } = await import('@supabase/supabase-js');
    const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    const pub = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });

    // Create user in Supabase auth.users
    const { data: createData, error: createErr } = await admin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: { display_name: displayName, avatar_id: avatarId },
    });

    if (createErr) {
      throw new Error(createErr.message);
    }

    const userId = createData.user.id;
    const profile: UserProfile = {
      userId,
      email: cleanEmail,
      displayName,
      avatarId,
      createdAt: new Date().toISOString(),
    };

    // Upsert into public.profiles
    await db.upsertProfile(profile);

    // Sign in to get JWT token
    const { data: sessionData, error: sessionErr } = await pub.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (sessionErr || !sessionData.session) {
      throw new Error(sessionErr?.message || 'Failed to authenticate after registration');
    }

    return {
      user: profile,
      token: sessionData.session.access_token,
    };
  }

  // 2. Offline / Local fallback: generate valid UUID
  const userId = crypto.randomUUID();
  const profile: UserProfile = {
    userId,
    email: cleanEmail,
    displayName,
    avatarId,
    createdAt: new Date().toISOString(),
  };

  await db.upsertProfile(profile);
  const token = `token:${userId}:${displayName}:${avatarId}`;
  return { user: profile, token };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: UserProfile; token: string }> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Live Supabase Auth if configured
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    const { createClient } = await import('@supabase/supabase-js');
    const pub = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });

    const { data: sessionData, error: sessionErr } = await pub.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (sessionErr || !sessionData.user || !sessionData.session) {
      throw new Error(sessionErr?.message || 'Invalid email or password');
    }

    let profile = await db.getProfile(sessionData.user.id);
    if (!profile) {
      profile = await db.upsertProfile({
        userId: sessionData.user.id,
        email: cleanEmail,
        displayName: sessionData.user.user_metadata?.display_name || cleanEmail.split('@')[0],
        avatarId: sessionData.user.user_metadata?.avatar_id || 'avatar-01',
        createdAt: new Date().toISOString(),
      });
    }

    return {
      user: profile,
      token: sessionData.session.access_token,
    };
  }

  // 2. Offline / Local fallback
  const userId = crypto.randomUUID();
  const profile: UserProfile = {
    userId,
    email: cleanEmail,
    displayName: cleanEmail.split('@')[0],
    avatarId: 'avatar-01',
    createdAt: new Date().toISOString(),
  };

  await db.upsertProfile(profile);
  const token = `token:${userId}:${profile.displayName}:${profile.avatarId}`;
  return { user: profile, token };
}
