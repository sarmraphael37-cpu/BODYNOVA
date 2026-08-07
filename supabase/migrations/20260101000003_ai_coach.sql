-- ============================================================================
-- BodyNova — AI Coach
-- ----------------------------------------------------------------------------
-- Conversation persistence, message history, AI usage/observability, and a
-- `summary` column on ai_insights for richer insight cards.
-- Every table is RLS-protected so a user can only ever read/write their own
-- AI data.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ai_conversations
-- ----------------------------------------------------------------------------
create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_conversations enable row level security;

create policy "Users can manage their own AI conversations"
  on public.ai_conversations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index on public.ai_conversations (user_id, updated_at desc);

-- ----------------------------------------------------------------------------
-- ai_messages
-- ----------------------------------------------------------------------------
create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.ai_messages enable row level security;

create policy "Users can manage their own AI messages"
  on public.ai_messages for all
  using (
    auth.uid() = user_id and
    exists (
      select 1 from public.ai_conversations
      where ai_conversations.id = conversation_id
        and ai_conversations.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.ai_conversations
      where ai_conversations.id = conversation_id
        and ai_conversations.user_id = auth.uid()
    )
  );

create index on public.ai_messages (conversation_id, created_at asc);
create index on public.ai_messages (user_id, created_at desc);

-- ----------------------------------------------------------------------------
-- ai_usage — request logs for rate limiting, cost control, and observability.
-- ----------------------------------------------------------------------------
create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  feature text not null check (feature in (
    'chat', 'insight', 'weekly_review', 'workout', 'progress', 'chart_explain'
  )),
  provider text,
  model text,
  status text not null default 'success' check (status in ('success', 'error', 'fallback')),
  prompt_tokens integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens integer not null default 0,
  latency_ms integer,
  error text,
  created_at timestamptz not null default now()
);

alter table public.ai_usage enable row level security;

-- Users can read their own usage (transparency + the rate limiter runs under
-- the user's own RLS-scoped session on the server).
create policy "Users can view their own AI usage"
  on public.ai_usage for select
  using (auth.uid() = user_id);

create policy "Users can log their own AI usage"
  on public.ai_usage for insert
  with check (auth.uid() = user_id);

create index on public.ai_usage (user_id, created_at desc);
create index on public.ai_usage (feature, created_at desc);

-- ----------------------------------------------------------------------------
-- ai_insights — add a short summary column for richer cards.
-- ----------------------------------------------------------------------------
alter table public.ai_insights
  add column if not exists summary text;

-- ----------------------------------------------------------------------------
-- Triggers: bump updated_at where it exists.
-- ----------------------------------------------------------------------------
create trigger ai_conversations_updated_at before update on public.ai_conversations
  for each row execute function public.set_updated_at();
