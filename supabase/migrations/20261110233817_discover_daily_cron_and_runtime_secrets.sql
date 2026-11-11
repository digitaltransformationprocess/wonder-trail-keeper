-- Runtime secrets for edge cron (service_role only) + watch_state helpers.
-- Applied remotely; kept locally as mirror.

create table if not exists public.runtime_secrets (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.runtime_secrets enable row level security;
revoke all on public.runtime_secrets from anon, authenticated, public;
grant all on public.runtime_secrets to service_role;

create table if not exists public.watch_state (
  id text primary key,
  last_result text,
  last_run_at timestamptz,
  locked_until timestamptz,
  paused_reason text
);

alter table public.watch_state enable row level security;
