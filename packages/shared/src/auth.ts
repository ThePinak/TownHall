import type { AvatarId } from './index';

export type WorldStatus = 'active' | 'empty_grace' | 'deleted';

export interface UserProfile {
  userId: string;
  email?: string;
  displayName: string;
  avatarId: AvatarId;
  createdAt: string;
}

export interface WorldMetadata {
  id: string;
  ownerUserId: string;
  name: string;
  status: WorldStatus;
  emptySince?: string | null;
  deleteAfter?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvitationMetadata {
  id: string;
  worldId: string;
  createdBy: string;
  expiresAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
}

export interface CreateWorldPayload {
  name?: string;
}

export interface CreateWorldResponse {
  world: WorldMetadata;
  inviteToken: string; // Plaintext token returned once at creation/regeneration
}

export interface ValidateInvitePayload {
  inviteToken: string;
}

export interface InviteValidationResponse {
  valid: boolean;
  worldId?: string;
  worldName?: string;
  error?: string;
}

export interface RegenerateInviteResponse {
  worldId: string;
  newInviteToken: string;
  revokedCount: number;
}

export interface AccountSessionRecord {
  userId: string;
  activeSessionId: string;
  sessionGeneration: number;
  updatedAt: string;
}

export const EMPTY_GRACE_PERIOD_MS = 10 * 60 * 1000; // 10 minutes (ADR-07)
export const DISCONNECT_CODE_NEWER_SESSION = 4001; // Older session replaced (ADR-03)
export const DISCONNECT_CODE_CAPACITY_REACHED = 4002; // Room at 20 users (ADR-02)
export const DISCONNECT_CODE_WORLD_EXPIRED = 4003; // World deleted after grace
