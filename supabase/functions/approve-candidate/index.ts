import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-ingest-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}
function serviceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL"); const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
function userClient(authHeader: string): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL"); const anon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anon) throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  return createClient(url, anon, { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false, autoRefreshToken: false } });
}
async function requireStaff(authHeader: string | null) {
  if (!authHeader) throw new Error("Missing Authorization header");
  const supabase = userClient(authHeader);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("Unauthorized");
  const { data: profile, error: profileError } = await supabase.from("profiles").select("id, role, email").eq("id", userData.user.id).maybeSingle();
  if (profileError) throw new Error(profileError.message);
  if (!profile || !["editor", "admin", "owner"].includes(profile.role)) throw new Error("Forbidden: staff role required");
  return { user: userData.user, profile, service: serviceClient() };
}
async function ensurePublisher(supabase: SupabaseClient, name: string) {
  const trimmed = name.trim() || "Unknown";
  const { data: existing } = await supabase.from("publishers").select("id").eq("name", trimmed).maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await supabase.from("publishers").insert({ name: trimmed }).select("id").single();
  if (error) throw new Error(error.message);
  return data.id;
}
async function ensureSource(supabase: SupabaseClient, url: string, publisher: string) {
  if (!url) return null;
  const { data: existing } = await supabase.from("sources").select("id").eq("url", url).maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await supabase.from("sources").insert({ url, publisher, source_type: "official", reliability_level: "A" }).select("id").single();
  if (error) throw new Error(error.message);
  return data.id;
}
async function approveCandidate(supabase: SupabaseClient, candidateId: string, opts: { reviewerId: string; publishNow?: boolean }) {
  const { data: candidate, error } = await supabase.from("ingestion_candidates").select("*").eq("id", candidateId).single();
  if (error || !candidate) throw new Error(error?.message || "Candidate not found");
  if (candidate.status !== "pending") throw new Error(`Candidate status is ${candidate.status}`);
  const payload = (candidate.extracted_payload ?? {}) as Record<string, unknown>;
  if (!payload.name || !payload.summary) throw new Error("Candidate payload incomplete (name/summary required)");
  const publisherId = await ensurePublisher(supabase, String(payload.publisher || "Unknown"));
  let slug = slugify(String(payload.name));
  if (!slug) slug = slugify(new URL(candidate.candidate_url).hostname);
  const { data: slugClash } = await supabase.from("tools").select("id").eq("slug", slug).maybeSingle();
  if (slugClash) slug = `${slug}-${crypto.randomUUID().slice(0, 6)}`;
  const status = opts.publishNow ? "published" : "pending_review";
  const officialUrl = String(payload.official_url || candidate.candidate_url);
  const { data: tool, error: insertError } = await supabase.from("tools").insert({
    name: String(payload.name), slug, publisher_id: publisherId, summary: String(payload.summary),
    description: String(payload.description || payload.summary), official_url: officialUrl, status,
    pricing_model: String(payload.pricing_model || "Not disclosed"), price_display: String(payload.price_display || "To verify"),
    api_available: typeof payload.api_available === "boolean" ? payload.api_available : null,
    open_source: Boolean(payload.open_source), local_available: Boolean(payload.local_available),
    keywords: Array.isArray(payload.keywords) ? payload.keywords : [], strengths: Array.isArray(payload.strengths) ? payload.strengths : [],
    limits: Array.isArray(payload.limits) ? payload.limits : [], audience: Array.isArray(payload.audience) ? payload.audience : [],
    last_verified_at: opts.publishNow ? new Date().toISOString().slice(0, 10) : null,
  }).select("id, slug").single();
  if (insertError) throw new Error(insertError.message);
  const typeName = String(payload.type || "Tool");
  const { data: typeRow } = await supabase.from("solution_types").select("id").eq("name", typeName).maybeSingle();
  if (typeRow) await supabase.from("tool_types").insert({ tool_id: tool.id, solution_type_id: typeRow.id, is_primary: true });
  const categoryNames = Array.isArray(payload.categories) ? payload.categories.map(String) : [];
  if (categoryNames.length) {
    const { data: cats } = await supabase.from("categories").select("id, name").in("name", categoryNames);
    if (cats?.length) await supabase.from("tool_categories").insert(cats.map((c, i) => ({ tool_id: tool.id, category_id: c.id, is_primary: i === 0 })));
  }
  const platformLabels = Array.isArray(payload.platforms) ? payload.platforms.map(String) : [];
  if (platformLabels.length) {
    const { data: plats } = await supabase.from("platforms").select("id, label").in("label", platformLabels);
    if (plats?.length) await supabase.from("tool_platforms").insert(plats.map((p) => ({ tool_id: tool.id, platform_id: p.id, status: "available" })));
  }
  const sourceId = await ensureSource(supabase, String(payload.source_url || officialUrl), String(payload.publisher || "Unknown"));
  if (sourceId) await supabase.from("tool_sources").insert({ tool_id: tool.id, source_id: sourceId, claim_key: "general", verified_at: opts.publishNow ? new Date().toISOString().slice(0, 10) : null });
  const { error: updateError } = await supabase.from("ingestion_candidates").update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: opts.reviewerId, tool_id: tool.id, error: null }).eq("id", candidateId);
  if (updateError) throw new Error(updateError.message);
  return { tool_id: tool.id, slug: tool.slug };
}
async function rejectCandidate(supabase: SupabaseClient, candidateId: string, reviewerId: string, reason?: string) {
  const { error } = await supabase.from("ingestion_candidates").update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: reviewerId, error: reason || "Rejected by editor" }).eq("id", candidateId).eq("status", "pending");
  if (error) throw new Error(error.message);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
    const auth = await requireStaff(req.headers.get("Authorization"));
    const body = await req.json();
    const action = String(body?.action ?? "approve");
    const publishNow = Boolean(body?.publish_now);

    if (action === "approve_all") {
      const { data: pending, error } = await auth.service
        .from("ingestion_candidates")
        .select("id, extracted_payload, error, status")
        .eq("status", "pending")
        .is("error", null)
        .order("discovered_at", { ascending: true })
        .limit(100);
      if (error) throw new Error(error.message);

      const eligible = (pending ?? []).filter((row) => {
        const payload = (row.extracted_payload ?? {}) as Record<string, unknown>;
        return Boolean(payload.name && payload.summary);
      });

      let approved = 0;
      let failed = 0;
      const failures: Array<{ id: string; error: string }> = [];
      for (const row of eligible) {
        try {
          await approveCandidate(auth.service, row.id, {
            reviewerId: auth.user.id,
            publishNow,
          });
          approved += 1;
        } catch (err) {
          failed += 1;
          failures.push({
            id: row.id,
            error: err instanceof Error ? err.message : "approve failed",
          });
        }
      }
      return jsonResponse({
        ok: true,
        status: "approve_all",
        stats: { considered: eligible.length, approved, failed, publish_now: publishNow },
        failures,
      });
    }

    const candidateId = String(body?.candidate_id ?? "");
    if (!candidateId) return jsonResponse({ error: "candidate_id required" }, 400);
    if (action === "reject") {
      await rejectCandidate(auth.service, candidateId, auth.user.id, body?.reason);
      return jsonResponse({ ok: true, status: "rejected" });
    }
    const result = await approveCandidate(auth.service, candidateId, {
      reviewerId: auth.user.id,
      publishNow,
    });
    return jsonResponse({ ok: true, status: "approved", ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Approve failed";
    const status = message.includes("Unauthorized") || message.includes("Forbidden") ? 401 : message.includes("not found") ? 404 : 500;
    return jsonResponse({ error: message }, status);
  }
});
