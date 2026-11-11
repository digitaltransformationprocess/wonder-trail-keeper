import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// ---- shared/cors.ts ----
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-ingest-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---- shared/normalize.ts ----
function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Empty URL");
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const u = new URL(withProtocol);
  u.hash = "";
  u.hostname = u.hostname.toLowerCase();
  if ((u.protocol === "https:" && u.port === "443") || (u.protocol === "http:" && u.port === "80")) {
    u.port = "";
  }
  // Drop common tracking params
  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "fbclid", "gclid"].forEach(
    (k) => u.searchParams.delete(k),
  );
  let path = u.pathname.replace(/\/+$/, "");
  if (!path) path = "";
  u.pathname = path || "/";
  // Prefer origin without trailing slash for homepage
  if (u.pathname === "/") return `${u.origin}/`;
  return `${u.origin}${u.pathname}${u.search}`;
}

function dedupeKeyFromUrl(url: string): string {
  const u = new URL(normalizeUrl(url));
  return `${u.hostname}${u.pathname}`.toLowerCase().replace(/\/+$/, "") || u.hostname;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

type ExtractedTool = {
  name?: string | null;
  publisher?: string | null;
  summary?: string | null;
  description?: string | null;
  official_url?: string | null;
  pricing_model?: string | null;
  price_display?: string | null;
  api_available?: boolean | null;
  open_source?: boolean | null;
  local_available?: boolean | null;
  platforms?: string[] | null;
  categories?: string[] | null;
  type?: string | null;
  keywords?: string[] | null;
  strengths?: string[] | null;
  limits?: string[] | null;
  audience?: string[] | null;
  source_url?: string | null;
};

const ALLOWED_PRICING = new Set(["Free", "Freemium", "Paid", "Open source", "Not disclosed"]);
const ALLOWED_TYPES = new Set([
  "Tool",
  "Model",
  "Agent",
  "API",
  "Platform",
  "Extension",
  "Framework",
  "Open source",
]);

function sanitizeExtracted(raw: ExtractedTool, fallbackUrl: string): ExtractedTool {
  const pricing = raw.pricing_model && ALLOWED_PRICING.has(raw.pricing_model)
    ? raw.pricing_model
    : "Not disclosed";
  const type = raw.type && ALLOWED_TYPES.has(raw.type) ? raw.type : "Tool";

  return {
    name: raw.name?.trim() || null,
    publisher: raw.publisher?.trim() || null,
    summary: raw.summary?.trim() || null,
    description: raw.description?.trim() || null,
    official_url: raw.official_url?.trim() || fallbackUrl,
    pricing_model: pricing,
    price_display: raw.price_display?.trim() || "To verify",
    api_available: typeof raw.api_available === "boolean" ? raw.api_available : null,
    open_source: typeof raw.open_source === "boolean" ? raw.open_source : null,
    local_available: typeof raw.local_available === "boolean" ? raw.local_available : null,
    platforms: Array.isArray(raw.platforms) ? raw.platforms.filter(Boolean) : [],
    categories: Array.isArray(raw.categories) ? raw.categories.filter(Boolean) : [],
    type,
    keywords: Array.isArray(raw.keywords) ? raw.keywords.filter(Boolean) : [],
    strengths: Array.isArray(raw.strengths) ? raw.strengths.filter(Boolean) : [],
    limits: Array.isArray(raw.limits) ? raw.limits.filter(Boolean) : [],
    audience: Array.isArray(raw.audience) ? raw.audience.filter(Boolean) : [],
    source_url: raw.source_url?.trim() || fallbackUrl,
  };
}

function confidenceFromPayload(payload: ExtractedTool): number {
  let score = 0;
  if (payload.name) score += 0.25;
  if (payload.summary) score += 0.2;
  if (payload.description) score += 0.15;
  if (payload.publisher) score += 0.1;
  if (payload.official_url) score += 0.1;
  if (payload.categories && payload.categories.length) score += 0.1;
  if (payload.pricing_model && payload.pricing_model !== "Not disclosed") score += 0.05;
  if (payload.keywords && payload.keywords.length) score += 0.05;
  return Math.min(1, Number(score.toFixed(2)));
}

// ---- shared/supabase.ts ----
function serviceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function userClient(authHeader: string): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anon) throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  return createClient(url, anon, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function requireStaff(authHeader: string | null) {
  if (!authHeader) throw new Error("Missing Authorization header");
  const supabase = userClient(authHeader);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("Unauthorized");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, email")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);
  if (!profile || !["editor", "admin", "owner"].includes(profile.role)) {
    throw new Error("Forbidden: staff role required");
  }

  return { supabase, user: userData.user, profile, service: serviceClient() };
}

function assertCronSecret(req: Request) {
  const expected = Deno.env.get("INGEST_CRON_SECRET");
  if (!expected) throw new Error("INGEST_CRON_SECRET is not configured");
  const provided = req.headers.get("x-ingest-secret");
  if (!provided || provided !== expected) throw new Error("Invalid cron secret");
}

// ---- shared/approve.ts ----
async function ensurePublisher(supabase: SupabaseClient, name: string): Promise<string> {
  const trimmed = name.trim() || "Unknown";
  const { data: existing } = await supabase
    .from("publishers")
    .select("id")
    .eq("name", trimmed)
    .maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await supabase
    .from("publishers")
    .insert({ name: trimmed })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

async function ensureSource(
  supabase: SupabaseClient,
  url: string,
  publisher: string,
): Promise<string | null> {
  if (!url) return null;
  const { data: existing } = await supabase.from("sources").select("id").eq("url", url).maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await supabase
    .from("sources")
    .insert({
      url,
      publisher,
      source_type: "official",
      reliability_level: "A",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

async function approveCandidate(
  supabase: SupabaseClient,
  candidateId: string,
  opts: {
    reviewerId: string;
    publishNow?: boolean;
  },
): Promise<{ tool_id: string; slug: string }> {
  const { data: candidate, error } = await supabase
    .from("ingestion_candidates")
    .select("*")
    .eq("id", candidateId)
    .single();
  if (error || !candidate) throw new Error(error?.message || "Candidate not found");
  if (candidate.status !== "pending") throw new Error(`Candidate status is ${candidate.status}`);

  const payload = (candidate.extracted_payload ?? {}) as ExtractedTool;
  if (!payload.name || !payload.summary) {
    throw new Error("Candidate payload incomplete (name/summary required)");
  }

  const publisherId = await ensurePublisher(supabase, payload.publisher || "Unknown");
  let slug = slugify(payload.name);
  if (!slug) slug = slugify(new URL(candidate.candidate_url).hostname);

  // Ensure unique slug
  const { data: slugClash } = await supabase.from("tools").select("id, slug").eq("slug", slug).maybeSingle();
  if (slugClash) slug = `${slug}-${crypto.randomUUID().slice(0, 6)}`;

  const status = opts.publishNow ? "published" : "pending_review";
  const officialUrl = payload.official_url || candidate.candidate_url;

  const { data: tool, error: insertError } = await supabase
    .from("tools")
    .insert({
      name: payload.name,
      slug,
      publisher_id: publisherId,
      summary: payload.summary,
      description: payload.description || payload.summary,
      official_url: officialUrl,
      status,
      pricing_model: payload.pricing_model || "Not disclosed",
      price_display: payload.price_display || "To verify",
      api_available: payload.api_available,
      open_source: Boolean(payload.open_source),
      local_available: Boolean(payload.local_available),
      keywords: payload.keywords ?? [],
      strengths: payload.strengths ?? [],
      limits: payload.limits ?? [],
      audience: payload.audience ?? [],
      last_verified_at: opts.publishNow ? new Date().toISOString().slice(0, 10) : null,
    })
    .select("id, slug")
    .single();

  if (insertError) throw new Error(insertError.message);

  // Type
  const typeName = payload.type || "Tool";
  const { data: typeRow } = await supabase
    .from("solution_types")
    .select("id")
    .eq("name", typeName)
    .maybeSingle();
  if (typeRow) {
    await supabase.from("tool_types").insert({
      tool_id: tool.id,
      solution_type_id: typeRow.id,
      is_primary: true,
    });
  }

  // Categories
  const categoryNames = payload.categories ?? [];
  if (categoryNames.length) {
    const { data: cats } = await supabase.from("categories").select("id, name").in("name", categoryNames);
    if (cats?.length) {
      await supabase.from("tool_categories").insert(
        cats.map((c, i) => ({
          tool_id: tool.id,
          category_id: c.id,
          is_primary: i === 0,
        })),
      );
    }
  }

  // Platforms
  const platformLabels = payload.platforms ?? [];
  if (platformLabels.length) {
    const { data: plats } = await supabase
      .from("platforms")
      .select("id, label")
      .in("label", platformLabels);
    if (plats?.length) {
      await supabase.from("tool_platforms").insert(
        plats.map((p) => ({
          tool_id: tool.id,
          platform_id: p.id,
          status: "available",
        })),
      );
    }
  }

  const sourceId = await ensureSource(
    supabase,
    payload.source_url || officialUrl,
    payload.publisher || "Unknown",
  );
  if (sourceId) {
    await supabase.from("tool_sources").insert({
      tool_id: tool.id,
      source_id: sourceId,
      claim_key: "general",
      verified_at: opts.publishNow ? new Date().toISOString().slice(0, 10) : null,
    });
  }

  const { error: updateError } = await supabase
    .from("ingestion_candidates")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: opts.reviewerId,
      tool_id: tool.id,
      error: null,
    })
    .eq("id", candidateId);

  if (updateError) throw new Error(updateError.message);

  return { tool_id: tool.id, slug: tool.slug };
}

async function rejectCandidate(
  supabase: SupabaseClient,
  candidateId: string,
  reviewerId: string,
  reason?: string,
) {
  const { error } = await supabase
    .from("ingestion_candidates")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
      error: reason || "Rejected by editor",
    })
    .eq("id", candidateId)
    .eq("status", "pending");
  if (error) throw new Error(error.message);
}

// ---- entry ----
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

    const auth = await requireStaff(req.headers.get("Authorization"));
    const body = await req.json();
    const candidateId = String(body?.candidate_id ?? "");
    const action = String(body?.action ?? "approve");

    if (!candidateId) return jsonResponse({ error: "candidate_id required" }, 400);

    if (action === "reject") {
      await rejectCandidate(auth.service, candidateId, auth.user.id, body?.reason);
      return jsonResponse({ ok: true, status: "rejected" });
    }

    const result = await approveCandidate(auth.service, candidateId, {
      reviewerId: auth.user.id,
      publishNow: Boolean(body?.publish_now),
    });

    return jsonResponse({ ok: true, status: "approved", ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Approve failed";
    const status = message.includes("Unauthorized") || message.includes("Forbidden")
      ? 401
      : message.includes("not found")
        ? 404
        : 500;
    return jsonResponse({ error: message }, status);
  }
});
