import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  UserProfile,
  WorldMetadata,
  WorldStatus,
  InvitationMetadata,
  AccountSessionRecord,
} from '@townhall/shared';
import crypto from 'node:crypto';

export interface DatabaseOperations {
  getProfile(userId: string): Promise<UserProfile | null>;
  upsertProfile(profile: UserProfile): Promise<UserProfile>;
  createWorld(ownerUserId: string, name: string): Promise<WorldMetadata>;
  getWorld(worldId: string): Promise<WorldMetadata | null>;
  getActiveWorldByOwner(ownerUserId: string): Promise<WorldMetadata | null>;
  updateWorldStatus(
    worldId: string,
    status: WorldStatus,
    emptySince?: string | null,
    deleteAfter?: string | null
  ): Promise<void>;
  createInvitation(worldId: string, secretHash: string, createdBy: string): Promise<InvitationMetadata>;
  getInvitationByHash(secretHash: string): Promise<InvitationMetadata | null>;
  revokeInvitationsForWorld(worldId: string): Promise<number>;
  claimSession(userId: string, sessionId: string): Promise<number>;
  getActiveSession(userId: string): Promise<AccountSessionRecord | null>;
  getExpiredGraceWorlds(nowIso?: string): Promise<WorldMetadata[]>;
  deleteWorld(worldId: string): Promise<void>;
  reset(): void;
}

// In-Memory / Dev / Test Provider implementing exact PostgreSQL constraints
class InMemoryDatabase implements DatabaseOperations {
  private profiles = new Map<string, UserProfile>();
  private worlds = new Map<string, WorldMetadata>();
  private invitations = new Map<string, InvitationMetadata & { secretHash: string }>();
  private sessions = new Map<string, AccountSessionRecord>();

  async getProfile(userId: string): Promise<UserProfile | null> {
    return this.profiles.get(userId) || null;
  }

  async upsertProfile(profile: UserProfile): Promise<UserProfile> {
    this.profiles.set(profile.userId, { ...profile });
    return profile;
  }

  async createWorld(ownerUserId: string, name: string): Promise<WorldMetadata> {
    // Enforce ADR-05 / idx_one_active_world_per_owner:
    // WHERE status IN ('active', 'empty_grace')
    const existingActive = await this.getActiveWorldByOwner(ownerUserId);
    if (existingActive) {
      throw new Error(
        `[ADR-05] Owner "${ownerUserId}" already has an active world or grace-period world (ID: ${existingActive.id}, status: ${existingActive.status})`
      );
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const world: WorldMetadata = {
      id,
      ownerUserId,
      name: name.trim().slice(0, 64) || 'My Town',
      status: 'active',
      emptySince: null,
      deleteAfter: null,
      createdAt: now,
      updatedAt: now,
    };
    this.worlds.set(id, world);
    return world;
  }

  async getWorld(worldId: string): Promise<WorldMetadata | null> {
    const world = this.worlds.get(worldId);
    if (!world || world.status === 'deleted') return null;
    return world;
  }

  async getActiveWorldByOwner(ownerUserId: string): Promise<WorldMetadata | null> {
    for (const world of this.worlds.values()) {
      if (
        world.ownerUserId === ownerUserId &&
        (world.status === 'active' || world.status === 'empty_grace')
      ) {
        return world;
      }
    }
    return null;
  }

  async updateWorldStatus(
    worldId: string,
    status: WorldStatus,
    emptySince?: string | null,
    deleteAfter?: string | null
  ): Promise<void> {
    const world = this.worlds.get(worldId);
    if (world) {
      world.status = status;
      world.emptySince = emptySince !== undefined ? emptySince : world.emptySince;
      world.deleteAfter = deleteAfter !== undefined ? deleteAfter : world.deleteAfter;
      world.updatedAt = new Date().toISOString();
    }
  }

  async createInvitation(
    worldId: string,
    secretHash: string,
    createdBy: string
  ): Promise<InvitationMetadata> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const invite = {
      id,
      worldId,
      createdBy,
      secretHash,
      expiresAt: null,
      revokedAt: null,
      createdAt: now,
    };
    this.invitations.set(secretHash, invite);
    return invite;
  }

  async getInvitationByHash(secretHash: string): Promise<InvitationMetadata | null> {
    const invite = this.invitations.get(secretHash);
    if (!invite || invite.revokedAt) return null;
    return invite;
  }

  async revokeInvitationsForWorld(worldId: string): Promise<number> {
    const now = new Date().toISOString();
    let count = 0;
    for (const invite of this.invitations.values()) {
      if (invite.worldId === worldId && !invite.revokedAt) {
        invite.revokedAt = now;
        count++;
      }
    }
    return count;
  }

  async claimSession(userId: string, sessionId: string): Promise<number> {
    const existing = this.sessions.get(userId);
    const newGeneration = (existing ? existing.sessionGeneration : 0) + 1;
    const now = new Date().toISOString();

    this.sessions.set(userId, {
      userId,
      activeSessionId: sessionId,
      sessionGeneration: newGeneration,
      updatedAt: now,
    });
    return newGeneration;
  }

  async getActiveSession(userId: string): Promise<AccountSessionRecord | null> {
    return this.sessions.get(userId) || null;
  }

  async getExpiredGraceWorlds(nowIso?: string): Promise<WorldMetadata[]> {
    const cutoff = new Date(nowIso || Date.now()).getTime();
    const results: WorldMetadata[] = [];
    for (const world of this.worlds.values()) {
      if (world.status === 'empty_grace' && world.deleteAfter) {
        if (new Date(world.deleteAfter).getTime() <= cutoff) {
          results.push(world);
        }
      }
    }
    return results;
  }

  async deleteWorld(worldId: string): Promise<void> {
    const world = this.worlds.get(worldId);
    if (world) {
      world.status = 'deleted';
      world.updatedAt = new Date().toISOString();
    }
    await this.revokeInvitationsForWorld(worldId);
  }

  reset() {
    this.profiles.clear();
    this.worlds.clear();
    this.invitations.clear();
    this.sessions.clear();
  }
}

// Live Supabase Client Provider
class SupabaseDatabase implements DatabaseOperations {
  private client: SupabaseClient;

  constructor(url: string, serviceRoleKey: string) {
    this.client = createClient(url, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data } = await this.client.from('profiles').select('*').eq('user_id', userId).single();
    if (!data) return null;
    return {
      userId: data.user_id,
      displayName: data.display_name,
      avatarId: data.avatar_id,
      email: data.email,
      createdAt: data.created_at,
    };
  }

  async upsertProfile(profile: UserProfile): Promise<UserProfile> {
    const { data, error } = await this.client
      .from('profiles')
      .upsert({
        user_id: profile.userId,
        display_name: profile.displayName,
        avatar_id: profile.avatarId,
        email: profile.email,
      })
      .select()
      .single();
    if (error) throw error;
    return profile;
  }

  async createWorld(ownerUserId: string, name: string): Promise<WorldMetadata> {
    const { data, error } = await this.client
      .from('worlds')
      .insert({
        owner_user_id: ownerUserId,
        name: name.trim().slice(0, 64) || 'My Town',
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505' || error.message.includes('idx_one_active_world_per_owner')) {
        throw new Error(`[ADR-05] Owner "${ownerUserId}" already has an active world or grace-period world.`);
      }
      throw error;
    }

    return {
      id: data.id,
      ownerUserId: data.owner_user_id,
      name: data.name,
      status: data.status,
      emptySince: data.empty_since,
      deleteAfter: data.delete_after,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async getWorld(worldId: string): Promise<WorldMetadata | null> {
    const { data } = await this.client
      .from('worlds')
      .select('*')
      .eq('id', worldId)
      .neq('status', 'deleted')
      .single();
    if (!data) return null;
    return {
      id: data.id,
      ownerUserId: data.owner_user_id,
      name: data.name,
      status: data.status,
      emptySince: data.empty_since,
      deleteAfter: data.delete_after,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async getActiveWorldByOwner(ownerUserId: string): Promise<WorldMetadata | null> {
    const { data } = await this.client
      .from('worlds')
      .select('*')
      .eq('owner_user_id', ownerUserId)
      .in('status', ['active', 'empty_grace'])
      .maybeSingle();
    if (!data) return null;
    return {
      id: data.id,
      ownerUserId: data.owner_user_id,
      name: data.name,
      status: data.status,
      emptySince: data.empty_since,
      deleteAfter: data.delete_after,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateWorldStatus(
    worldId: string,
    status: WorldStatus,
    emptySince?: string | null,
    deleteAfter?: string | null
  ): Promise<void> {
    const updatePayload: any = { status, updated_at: new Date().toISOString() };
    if (emptySince !== undefined) updatePayload.empty_since = emptySince;
    if (deleteAfter !== undefined) updatePayload.delete_after = deleteAfter;

    await this.client.from('worlds').update(updatePayload).eq('id', worldId);
  }

  async createInvitation(
    worldId: string,
    secretHash: string,
    createdBy: string
  ): Promise<InvitationMetadata> {
    const { data, error } = await this.client
      .from('invitations')
      .insert({
        world_id: worldId,
        secret_hash: secretHash,
        created_by: createdBy,
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      worldId: data.world_id,
      createdBy: data.created_by,
      expiresAt: data.expires_at,
      revokedAt: data.revoked_at,
      createdAt: data.created_at,
    };
  }

  async getInvitationByHash(secretHash: string): Promise<InvitationMetadata | null> {
    const { data } = await this.client
      .from('invitations')
      .select('*')
      .eq('secret_hash', secretHash)
      .is('revoked_at', null)
      .maybeSingle();
    if (!data) return null;
    return {
      id: data.id,
      worldId: data.world_id,
      createdBy: data.created_by,
      expiresAt: data.expires_at,
      revokedAt: data.revoked_at,
      createdAt: data.created_at,
    };
  }

  async revokeInvitationsForWorld(worldId: string): Promise<number> {
    const { data, error } = await this.client
      .from('invitations')
      .update({ revoked_at: new Date().toISOString() })
      .eq('world_id', worldId)
      .is('revoked_at', null)
      .select();
    if (error) return 0;
    return data?.length || 0;
  }

  async claimSession(userId: string, sessionId: string): Promise<number> {
    const existing = await this.getActiveSession(userId);
    const newGen = (existing?.sessionGeneration || 0) + 1;
    await this.client.from('account_sessions').upsert({
      user_id: userId,
      active_session_id: sessionId,
      session_generation: newGen,
      updated_at: new Date().toISOString(),
    });
    return newGen;
  }

  async getActiveSession(userId: string): Promise<AccountSessionRecord | null> {
    const { data } = await this.client
      .from('account_sessions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (!data) return null;
    return {
      userId: data.user_id,
      activeSessionId: data.active_session_id,
      sessionGeneration: data.session_generation,
      updatedAt: data.updated_at,
    };
  }

  async getExpiredGraceWorlds(nowIso?: string): Promise<WorldMetadata[]> {
    const cutoff = nowIso || new Date().toISOString();
    const { data } = await this.client
      .from('worlds')
      .select('*')
      .eq('status', 'empty_grace')
      .lte('delete_after', cutoff);
    if (!data) return [];
    return data.map((d) => ({
      id: d.id,
      ownerUserId: d.owner_user_id,
      name: d.name,
      status: d.status,
      emptySince: d.empty_since,
      deleteAfter: d.delete_after,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  }

  async deleteWorld(worldId: string): Promise<void> {
    await this.client.from('worlds').update({ status: 'deleted' }).eq('id', worldId);
    await this.revokeInvitationsForWorld(worldId);
  }

  reset() {
    // No-op for live Supabase
  }
}

// Select database provider based on environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const db: DatabaseOperations =
  supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')
    ? new SupabaseDatabase(supabaseUrl, supabaseKey)
    : new InMemoryDatabase();
