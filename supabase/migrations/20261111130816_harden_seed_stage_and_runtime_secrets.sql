-- Drop ephemeral seed staging if present; keep runtime_secrets service_role-only.
drop table if exists public._seed_stage cascade;

revoke all on public.runtime_secrets from anon, authenticated, public;
grant all on public.runtime_secrets to service_role;
alter table public.runtime_secrets enable row level security;
