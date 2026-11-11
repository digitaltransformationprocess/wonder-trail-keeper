alter table public.change_events
  add column if not exists review_status text not null default 'pending',
  add column if not exists reviewed_by uuid references public.profiles(id),
  add column if not exists review_note text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'change_events_review_status_check'
  ) then
    alter table public.change_events
      add constraint change_events_review_status_check
      check (review_status in ('pending', 'approved', 'rejected'));
  end if;
end $$;

create index if not exists change_events_pending_idx
  on public.change_events (detected_at desc)
  where review_status = 'pending';

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_id uuid not null references public.tools(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, tool_id)
);

alter table public.favorites enable row level security;

drop policy if exists favorites_owner_select on public.favorites;
create policy favorites_owner_select on public.favorites
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists favorites_owner_insert on public.favorites;
create policy favorites_owner_insert on public.favorites
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists favorites_owner_delete on public.favorites;
create policy favorites_owner_delete on public.favorites
  for delete to authenticated
  using (auth.uid() = user_id);

grant select, insert, delete on public.favorites to authenticated;

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);

create table if not exists public.collection_items (
  collection_id uuid not null references public.collections(id) on delete cascade,
  tool_id uuid not null references public.tools(id) on delete cascade,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (collection_id, tool_id)
);

alter table public.collections enable row level security;
alter table public.collection_items enable row level security;

drop policy if exists collections_owner_all on public.collections;
create policy collections_owner_all on public.collections
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists collection_items_owner_all on public.collection_items;
create policy collection_items_owner_all on public.collection_items
  for all to authenticated
  using (
    exists (
      select 1 from public.collections c
      where c.id = collection_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.collections c
      where c.id = collection_id and c.user_id = auth.uid()
    )
  );

grant select, insert, update, delete on public.collections to authenticated;
grant select, insert, update, delete on public.collection_items to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'ingestion_run_kind' and e.enumlabel = 'change_watch'
  ) then
    alter type public.ingestion_run_kind add value 'change_watch';
  end if;
end $$;
