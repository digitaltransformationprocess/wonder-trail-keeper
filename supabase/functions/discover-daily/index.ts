import { corsHeaders, jsonResponse } from "./_shared/cors.ts";
import { ingestUrls, isBlockedUrl } from "./_shared/ingest.ts";
import { assertCronSecret, requireStaff, serviceClient } from "./_shared/supabase.ts";
import { searchNewTools } from "./_shared/firecrawl.ts";

const QUERIES = [
  "new AI tool official launch site",
  "new AI API platform product launch",
  "new open source LLM developer tool release",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

    const body = (await req.json().catch(() => ({}))) as { force?: boolean };
    const force = Boolean(body.force);

    const cronHeader = req.headers.get("x-ingest-secret");
    let supabase;
    let isStaffManual = false;
    if (cronHeader) {
      supabase = serviceClient();
      await assertCronSecret(req, supabase);
    } else {
      const auth = await requireStaff(req.headers.get("Authorization"));
      supabase = auth.service;
      isStaffManual = true;
    }

    const now = new Date();
    const { data: state } = await supabase
      .from("watch_state")
      .select("*")
      .eq("id", "discover_daily")
      .maybeSingle();
    // Staff manual runs can force past the cron lock.
    if (
      !(isStaffManual && force) &&
      state?.locked_until &&
      new Date(state.locked_until) > now
    ) {
      return jsonResponse({
        skipped: true,
        reason: "locked",
        locked_until: state.locked_until,
      });
    }

    await supabase.from("watch_state").upsert({
      id: "discover_daily",
      locked_until: new Date(now.getTime() + 20 * 60_000).toISOString(),
    });

    const { data: run, error: runError } = await supabase
      .from("ingestion_runs")
      .insert({ kind: "daily_discover", stats: {} })
      .select("id")
      .single();
    if (runError) throw new Error(runError.message);

    try {
      const foundUrls: string[] = [];
      for (const query of QUERIES) {
        const hits = await searchNewTools(query, 4, supabase);
        for (const hit of hits) foundUrls.push(hit.url);
      }

      const unique = [...new Set(foundUrls)]
        .filter((u) => {
          try {
            return !isBlockedUrl(u);
          } catch {
            return false;
          }
        })
        .slice(0, 8);

      const results = await ingestUrls(supabase, unique, "daily_search", { delayMs: 5_000 });
      const stats = {
        searched_queries: QUERIES.length,
        urls_found: foundUrls.length,
        urls_unique: unique.length,
        queued: results.filter((r) => r.status === "queued").length,
        duplicate: results.filter((r) => r.status === "duplicate").length,
        exists: results.filter((r) => r.status === "exists").length,
        skipped: results.filter((r) => r.status === "skipped").length,
        error: results.filter((r) => r.status === "error").length,
      };

      await supabase
        .from("ingestion_runs")
        .update({ finished_at: new Date().toISOString(), stats })
        .eq("id", run.id);
      await supabase
        .from("watch_state")
        .update({
          locked_until: null,
          last_run_at: new Date().toISOString(),
          last_result: JSON.stringify(stats),
          paused_reason: null,
        })
        .eq("id", "discover_daily");

      return jsonResponse({ run_id: run.id, stats, results });
    } catch (inner) {
      const message = inner instanceof Error ? inner.message : "Discover failed";
      await supabase
        .from("ingestion_runs")
        .update({ finished_at: new Date().toISOString(), error: message })
        .eq("id", run.id);
      await supabase
        .from("watch_state")
        .update({
          locked_until: null,
          last_run_at: new Date().toISOString(),
          last_result: message,
          paused_reason: message,
        })
        .eq("id", "discover_daily");
      throw inner;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Discover failed";
    const status =
      message.includes("Invalid cron") || message.includes("Forbidden")
        ? 403
        : message.includes("Unauthorized")
          ? 401
          : 500;
    return jsonResponse({ error: message }, status);
  }
});
