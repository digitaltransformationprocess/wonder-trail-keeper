select cron.unschedule(jobid) from cron.job where jobname = 'watch-changes';

select cron.schedule(
  'watch-changes',
  '30 7 * * *',
  $$
  select net.http_post(
    url := 'https://oqgqdvsasfazpsocffsn.supabase.co/functions/v1/watch-changes',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-ingest-secret', coalesce(
        (select decrypted_secret from vault.decrypted_secrets where name = 'ingest_cron_secret' limit 1),
        (select value from public.runtime_secrets where key = 'INGEST_CRON_SECRET' limit 1)
      )
    ),
    body := '{"limit":5}'::jsonb
  );
  $$
);
