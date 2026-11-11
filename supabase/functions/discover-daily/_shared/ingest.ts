import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { scrapeTool } from "./firecrawl.ts";
import {
  confidenceFromPayload,
  dedupeKeyFromUrl,
  normalizeUrl,
  sanitizeExtracted,
} from "./normalize.ts";

export type IngestSourceType = "manual_url" | "daily_search";

export type IngestItemResult = {
  url: string;
  status: "queued" | "duplicate" | "exists" | "error";
  candidate_id?: string;
  error?: string;
};

function urlsMatch(a: string, b: string): boolean {
  try {
    return dedupeKeyFromUrl(a) === dedupeKeyFromUrl(b);
  } catch {
    return a === b;
  }
}

export async function ingestUrls(
  supabase: SupabaseClient,
  urls: string[],
  sourceType: IngestSourceType,
): Promise<IngestItemResult[]> {
  const results: IngestItemResult[] = [];

  for (const raw of urls) {
    let normalized: string;
    let key: string;
    try {
      normalized = normalizeUrl(raw);
      key = dedupeKeyFromUrl(normalized);
    } catch (err) {
      results.push({
        url: raw,
        status: "error",
        error: err instanceof Error ? err.message : "Invalid URL",
      });
      continue;
    }

    // Already in catalog?
    const { data: tools, error: toolsError } = await supabase
      .from("tools")
      .select("id, official_url, slug")
      .limit(500);
    if (toolsError) {
      results.push({ url: normalized, status: "error", error: toolsError.message });
      continue;
    }
    const existingTool = (tools ?? []).find((t) => urlsMatch(t.official_url, normalized));
    if (existingTool) {
      const { data: dup, error: dupError } = await supabase
        .from("ingestion_candidates")
        .upsert(
          {
            candidate_url: normalized,
            dedupe_key: key,
            source_type: sourceType,
            status: "duplicate",
            extracted_payload: { existing_tool_id: existingTool.id, slug: existingTool.slug },
            error: "Already present in catalog",
            tool_id: existingTool.id,
          },
          { onConflict: "dedupe_key" },
        )
        .select("id")
        .single();
      if (dupError) {
        results.push({ url: normalized, status: "error", error: dupError.message });
      } else {
        results.push({ url: normalized, status: "exists", candidate_id: dup.id });
      }
      continue;
    }

    // Pending candidate already?
    const { data: existingCandidate } = await supabase
      .from("ingestion_candidates")
      .select("id, status")
      .eq("dedupe_key", key)
      .maybeSingle();

    if (existingCandidate?.status === "pending") {
      results.push({
        url: normalized,
        status: "duplicate",
        candidate_id: existingCandidate.id,
        error: "Already pending review",
      });
      continue;
    }

    try {
      const { extracted, markdown } = await scrapeTool(normalized);
      const payload = sanitizeExtracted(extracted, normalized);
      if (!payload.name || !payload.summary) {
        throw new Error("Extraction missing required name/summary");
      }

      const { data: candidate, error: insertError } = await supabase
        .from("ingestion_candidates")
        .upsert(
          {
            candidate_url: normalized,
            dedupe_key: key,
            source_type: sourceType,
            status: "pending",
            extracted_payload: payload,
            raw_markdown: markdown?.slice(0, 50_000) ?? null,
            confidence: confidenceFromPayload(payload),
            error: null,
            discovered_at: new Date().toISOString(),
            reviewed_at: null,
            reviewed_by: null,
            tool_id: null,
          },
          { onConflict: "dedupe_key" },
        )
        .select("id")
        .single();

      if (insertError) throw new Error(insertError.message);
      results.push({ url: normalized, status: "queued", candidate_id: candidate.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ingest failed";
      const { data: failed } = await supabase
        .from("ingestion_candidates")
        .upsert(
          {
            candidate_url: normalized,
            dedupe_key: key,
            source_type: sourceType,
            status: "pending",
            extracted_payload: {},
            error: message,
            discovered_at: new Date().toISOString(),
          },
          { onConflict: "dedupe_key" },
        )
        .select("id")
        .maybeSingle();

      results.push({
        url: normalized,
        status: "error",
        candidate_id: failed?.id,
        error: message,
      });
    }
  }

  return results;
}
