-- ============================================================================
-- BodyNova — Password reset codes
-- ----------------------------------------------------------------------------
-- Stores hashed, single-use codes for the code-based password reset flow.
-- RLS is enabled with NO policies: rows are only reachable with the service
-- role key from server actions, so codes are never readable by the app client.
-- Apply this in the Supabase SQL editor after the initial schema.
-- ============================================================================

create table public.password_resets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  code_hash text not null,
  code_salt text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.password_resets enable row level security;

create index on public.password_resets (email, created_at desc);
create index on public.password_resets (user_id);
