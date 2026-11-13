-- PostgreSQL Schema for TownHall (Milestone 4)
-- Enforces:
-- 1. ADR-03: Newest Session Wins (account_sessions generation tracking)
-- 2. ADR-05: Exactly one active or grace-period world per creator (idx_one_active_world_per_owner)
-- 3. ADR-07: Durable 10-minute empty-world lifecycle (empty_since, delete_after, idx_worlds_cleanup_eligible)
-- 4. DEC-09: Cryptographic hashed invitation secrets (secret_hash with revoke/regenerate)

-- 1. User Profiles
CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID PRIMARY KEY,
    display_name VARCHAR(32) NOT NULL,
    avatar_id VARCHAR(32) NOT NULL DEFAULT 'avatar-01',
    email VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Worlds Table with Partial Unique Index for ADR-05
DO $$ BEGIN
    CREATE TYPE world_status AS ENUM ('active', 'empty_grace', 'deleted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS worlds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL DEFAULT 'My Town',
    status world_status NOT NULL DEFAULT 'active',
    empty_since TIMESTAMPTZ,
    delete_after TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforces ADR-05: Exactly one active or grace-period world per creator
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_world_per_owner 
ON worlds (owner_user_id) 
WHERE status IN ('active', 'empty_grace');

-- Index for efficient lifecycle cleanup polling
CREATE INDEX IF NOT EXISTS idx_worlds_cleanup_eligible 
ON worlds (delete_after) 
WHERE status = 'empty_grace';

-- 3. Invitations Table (Hashed secrets with revoke/regenerate support)
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
    secret_hash VARCHAR(64) NOT NULL UNIQUE,
    created_by UUID NOT NULL REFERENCES profiles(user_id),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitations_lookup 
ON invitations (secret_hash) 
WHERE revoked_at IS NULL;

-- 4. Account Sessions (Enforces ADR-03: Newest Session Wins)
CREATE TABLE IF NOT EXISTS account_sessions (
    user_id UUID PRIMARY KEY REFERENCES profiles(user_id) ON DELETE CASCADE,
    active_session_id VARCHAR(64) NOT NULL,
    session_generation INT NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

