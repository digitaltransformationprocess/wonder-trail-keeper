import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { slugify, type ExtractedTool } from "./normalize.ts";

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

export async function approveCandidate(
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

export async function rejectCandidate(
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
