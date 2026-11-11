import { corsHeaders, jsonResponse } from "./_shared/cors.ts";
import { ingestUrls } from "./_shared/ingest.ts";
import { assertCronSecret, requireStaff, serviceClient } from "./_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

    const body = await req.json();
    const urls: string[] = Array.isArray(body?.urls)
      ? body.urls.map(String)
      : body?.url
        ? [String(body.url)]
        : [];

    if (!urls.length) return jsonResponse({ error: "Provide urls[] or url" }, 400);
    if (urls.length > 25) return jsonResponse({ error: "Max 25 URLs per request" }, 400);

    const cronHeader = req.headers.get("x-ingest-secret");
    let supabase;
    let sourceType: "manual_url" | "daily_search" = "manual_url";

    if (cronHeader) {
      supabase = serviceClient();
      await assertCronSecret(req, supabase);
      sourceType = body?.source_type === "daily_search" ? "daily_search" : "manual_url";
    } else {
      const auth = await requireStaff(req.headers.get("Authorization"));
      supabase = auth.service;
      sourceType = "manual_url";
    }

    const { data: run, error: runError } = await supabase
      .from("ingestion_runs")
      .insert({ kind: "manual_ingest", stats: { requested: urls.length } })
      .select("id")
      .single();
    if (runError) throw new Error(runError.message);

    const results = await ingestUrls(supabase, urls, sourceType);
    const stats = {
      requested: urls.length,
      queued: results.filter((r) => r.status === "queued").length,
      duplicate: results.filter((r) => r.status === "duplicate").length,
      exists: results.filter((r) => r.status === "exists").length,
      error: results.filter((r) => r.status === "error").length,
    };

    await supabase
      .from("ingestion_runs")
      .update({ finished_at: new Date().toISOString(), stats })
      .eq("id", run.id);

    return jsonResponse({ run_id: run.id, stats, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ingest failed";
    const status = message.includes("Unauthorized") || message.includes("Forbidden")
      ? 401
      : message.includes("Invalid cron")
        ? 403
        : 500;
    return jsonResponse({ error: message }, status);
  }
});
