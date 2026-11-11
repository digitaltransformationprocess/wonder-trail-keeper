import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-ingest-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function runtimeSecret(supabase: SupabaseClient, key: string) {
  const fromEnv = Deno.env.get(key);
  if (fromEnv) return fromEnv;
  const { data, error } = await supabase.from("runtime_secrets").select("value").eq("key", key).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.value) throw new Error(`${key} secret is not set`);
  return data.value as string;
}

type Extracted = {
  name?: string;
  summary?: string;
  description?: string;
  pricing_model?: string;
  price_display?: string;
  api_available?: boolean | null;
  open_source?: boolean | null;
  local_available?: boolean | null;
};

const CRITICAL_FIELDS = [
  "summary",
  "pricing_model",
  "price_display",
  "api_available",
  "open_source",
  "local_available",
] as const;

function stringify(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "boolean") return v ? "true" : "false";
  return String(v);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const expected = await runtimeSecret(supabase, "INGEST_CRON_SECRET");
  const provided = req.headers.get("x-ingest-secret");
  if (provided !== expected) {
    return json({ error: "Unauthorized" }, 401);
  }

  const body = (await req.json().catch(() => ({}))) as { limit?: number };
  const limit = Math.max(1, Math.min(Number(body.limit ?? 5), 15));

  const { data: run, error: runErr } = await supabase
    .from("ingestion_runs")
    .insert({ kind: "change_watch", stats: {}, started_at: new Date().toISOString() })
    .select("id")
    .single();
  if (runErr) return json({ error: runErr.message }, 500);

  let scanned = 0;
  let changes = 0;
  let errors = 0;

  try {
    const { data: tools, error } = await supabase
      .from("tools")
      .select(
        "id, name, slug, official_url, summary, pricing_model, price_display, api_available, open_source, local_available, last_verified_at",
      )
      .eq("status", "published")
      .order("last_verified_at", { ascending: true, nullsFirst: true })
      .limit(limit);
    if (error) throw new Error(error.message);

    const firecrawlKey = await runtimeSecret(supabase, "FIRECRAWL_API_KEY");

    for (const tool of tools ?? []) {
      scanned += 1;
      try {
        const schema = {
          type: "object",
          properties: {
            name: { type: "string" },
            summary: { type: "string" },
            description: { type: "string" },
            pricing_model: { type: "string" },
            price_display: { type: "string" },
            api_available: { type: "boolean" },
            open_source: { type: "boolean" },
            local_available: { type: "boolean" },
          },
          required: ["summary"],
        };
        const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${firecrawlKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: tool.official_url,
            formats: [
              "markdown",
              {
                type: "json",
                prompt:
                  "Extract factual product fields only. Never invent prices. Use null when unknown.",
                schema,
              },
            ],
            onlyMainContent: true,
          }),
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || payload?.message || `scrape ${res.status}`);
        const data = payload?.data ?? payload;
        const extracted = (data?.json ?? data?.extract ?? {}) as Extracted;

        for (const field of CRITICAL_FIELDS) {
          const oldValue = stringify((tool as Record<string, unknown>)[field]);
          const rawNew = (extracted as Record<string, unknown>)[field];
          if (rawNew === undefined || rawNew === null || rawNew === "") continue;
          const newValue = stringify(rawNew);
          if (!newValue || newValue === oldValue) continue;

          const { error: insertErr } = await supabase.from("change_events").insert({
            tool_id: tool.id,
            field_key: field,
            old_value: oldValue,
            new_value: newValue,
            review_status: "pending",
          });
          if (insertErr) throw new Error(insertErr.message);
          changes += 1;
        }

        // Touch verification timestamp rotation without publishing scraped values.
        await supabase
          .from("tools")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", tool.id);
      } catch (err) {
        errors += 1;
        console.error(tool.slug, err);
      }
    }

    await supabase
      .from("ingestion_runs")
      .update({
        finished_at: new Date().toISOString(),
        stats: { scanned, changes, errors, limit },
      })
      .eq("id", run.id);

    await supabase.from("watch_state").upsert({
      id: "change_watch",
      last_run_at: new Date().toISOString(),
      last_result: JSON.stringify({ scanned, changes, errors }),
    });

    return json({ ok: true, scanned, changes, errors });
  } catch (err) {
    await supabase
      .from("ingestion_runs")
      .update({
        finished_at: new Date().toISOString(),
        error: err instanceof Error ? err.message : "watch failed",
        stats: { scanned, changes, errors },
      })
      .eq("id", run.id);
    return json({ error: err instanceof Error ? err.message : "watch failed" }, 500);
  }
});
