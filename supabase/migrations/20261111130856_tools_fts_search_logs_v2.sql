alter table public.tools add column if not exists search_tsv tsvector;

update public.tools
set search_tsv =
  setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(array_to_string(keywords, ' '), '')), 'B') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'C');

create index if not exists tools_search_tsv_idx on public.tools using gin (search_tsv);
create index if not exists tools_name_trgm_idx on public.tools using gin (name gin_trgm_ops);

create or replace function public.tools_search_tsv_refresh()
returns trigger
language plpgsql
as $$
begin
  new.search_tsv :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.summary, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.keywords, ' '), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'C');
  return new;
end;
$$;

drop trigger if exists trg_tools_search_tsv on public.tools;
create trigger trg_tools_search_tsv
before insert or update of name, summary, description, keywords
on public.tools
for each row execute function public.tools_search_tsv_refresh();

create table if not exists public.search_logs (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  constraints jsonb not null default '{}'::jsonb,
  result_count integer not null default 0,
  latency_ms integer,
  source text not null default 'fts',
  created_at timestamptz not null default now()
);

alter table public.search_logs enable row level security;

drop policy if exists search_logs_staff_select on public.search_logs;
create policy search_logs_staff_select on public.search_logs
  for select to authenticated
  using (public.is_staff());

drop policy if exists search_logs_anon_insert on public.search_logs;
create policy search_logs_anon_insert on public.search_logs
  for insert to anon, authenticated
  with check (true);

revoke update, delete on public.search_logs from anon, authenticated;
grant select on public.search_logs to authenticated;
grant insert on public.search_logs to anon, authenticated;

create or replace function public.search_published_tools(
  q text,
  want_free boolean default false,
  want_oss boolean default false,
  want_api boolean default false,
  want_local boolean default false,
  result_limit integer default 20
)
returns table (
  id uuid,
  slug text,
  name text,
  summary text,
  rank real
)
language sql
stable
security invoker
as $$
  with cleaned as (
    select trim(coalesce(q, '')) as q
  ),
  tsq as (
    select case
      when cleaned.q = '' then null
      else websearch_to_tsquery('english', cleaned.q)
    end as query
    from cleaned
  )
  select t.id, t.slug, t.name, t.summary,
    case
      when tsq.query is null then 0::real
      else ts_rank_cd(t.search_tsv, tsq.query)
    end as rank
  from public.tools t
  cross join tsq
  where t.status = 'published'
    and (
      tsq.query is null
      or t.search_tsv @@ tsq.query
      or t.name ilike '%' || (select q from cleaned) || '%'
    )
    and (not want_free or t.pricing_model in ('Free', 'Freemium', 'Open source'))
    and (not want_oss or t.open_source = true)
    and (not want_api or t.api_available = true)
    and (not want_local or t.local_available = true)
  order by rank desc, t.name asc
  limit greatest(1, least(result_limit, 50));
$$;

revoke all on function public.search_published_tools(text, boolean, boolean, boolean, boolean, integer) from public;
grant execute on function public.search_published_tools(text, boolean, boolean, boolean, boolean, integer) to anon, authenticated;
