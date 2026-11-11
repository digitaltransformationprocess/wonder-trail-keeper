-- Enable extensions used by scheduled discover-daily invocation.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
