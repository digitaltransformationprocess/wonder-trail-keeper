import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { scrapeTool } from "./firecrawl.ts";
import {
  confidenceFromPayload,
  dedupeKeyFromUrl,
  normalizeUrl,
  sanitizeExtracted,
  slugify,
} from "./normalize.ts";

export type IngestSourceType = "manual_url" | "daily_search";

export type IngestItemResult = {
  url: string;
  status: "queued" | "duplicate" | "exists" | "error" | "skipped";
  candidate_id?: string;
  error?: string;
};

/** Stay under Firecrawl free-tier ~15 req/min. */
const SCRAPE_GAP_MS = 5_000;

const BLOCKED_HOST_PARTS = [
  "reddit.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "linkedin.com",
  "youtube.com",
  "tiktok.com",
  "medium.com",
  "substack.com",
  "quora.com",
  "pinterest.com",
];

type CatalogTool = {
  id: string;
  official_url: string | null;
  slug: string;
  name: string;
};

type CatalogIndex = {
  byDedupeKey: Map<string, CatalogTool>;
  byHost: Map<string, CatalogTool>;
  bySlug: Map<string, CatalogTool>;
  byName: Map<string, CatalogTool>;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hostKey(url: string): string | null {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function nameKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isBlockedUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return BLOCKED_HOST_PARTS.some((part) => host === part || host.endsWith(`.${part}`));
  } catch {
    return true;
  }
}

function isHardFailure(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("rate limit") ||
    m.includes("do not support this site") ||
    m.includes("unsupported") ||
    m.includes("403") ||
    m.includes("401")
  );
}

async function loadCatalogIndex(supabase: SupabaseClient): Promise<CatalogIndex> {
  const index: CatalogIndex = {
    byDedupeKey: new Map(),
    byHost: new Map(),
    bySlug: new Map(),
    byName: new Map(),
  };

  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("tools")
      .select("id, official_url, slug, name")
      .range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as CatalogTool[];
    for (const tool of rows) {
      if (tool.slug) index.bySlug.set(tool.slug.toLowerCase(), tool);
      if (tool.name) index.byName.set(nameKey(tool.name), tool);
      if (tool.official_url) {
        try {
          index.byDedupeKey.set(dedupeKeyFromUrl(tool.official_url), tool);
          const host = hostKey(tool.official_url);
          if (host) index.byHost.set(host, tool);
        } catch {
          // ignore bad official URLs
        }
      }
    }
    if (rows.length < pageSize) break;
  }

  return index;
}

function findExistingTool(
  index: CatalogIndex,
  url: string,
  extracted?: { name?: string | null; official_url?: string | null },
): CatalogTool | null {
  try {
    const key = dedupeKeyFromUrl(url);
    const byUrl = index.byDedupeKey.get(key);
    if (byUrl) return byUrl;
  } catch {
    // ignore
  }

  const host = hostKey(url);
  if (host) {
    const byHost = index.byHost.get(host);
    if (byHost) return byHost;
  }

  if (extracted?.official_url) {
    try {
      const key = dedupeKeyFromUrl(extracted.official_url);
      const byOfficial = index.byDedupeKey.get(key);
      if (byOfficial) return byOfficial;
      const officialHost = hostKey(extracted.official_url);
      if (officialHost) {
        const byOfficialHost = index.byHost.get(officialHost);
        if (byOfficialHost) return byOfficialHost;
      }
    } catch {
      // ignore
    }
  }

  if (extracted?.name) {
    const byName = index.byName.get(nameKey(extracted.name));
    if (byName) return byName;
    const slug = slugify(extracted.name);
    if (slug) {
      const bySlug = index.bySlug.get(slug);
      if (bySlug) return bySlug;
    }
  }

  return null;
}

async function markExists(
  supabase: SupabaseClient,
  normalized: string,
  key: string,
  sourceType: IngestSourceType,
  tool: CatalogTool,
): Promise<IngestItemResult> {
  const { data: dup, error: dupError } = await supabase
    .from("ingestion_candidates")
    .upsert(
      {
        candidate_url: normalized,
        dedupe_key: key,
        source_type: sourceType,
        status: "duplicate",
        extracted_payload: {
          existing_tool_id: tool.id,
          slug: tool.slug,
          name: tool.name,
        },
        error: "Already present in catalog — scrape skipped",
        tool_id: tool.id,
      },
      { onConflict: "dedupe_key" },
    )
    .select("id")
    .single();
  if (dupError) {
    return { url: normalized, status: "error", error: dupError.message };
  }
  return { url: normalized, status: "exists", candidate_id: dup.id };
}

export async function ingestUrls(
  supabase: SupabaseClient,
  urls: string[],
  sourceType: IngestSourceType,
  options: { delayMs?: number } = {},
): Promise<IngestItemResult[]> {
  const delayMs = options.delayMs ?? SCRAPE_GAP_MS;
  const results: IngestItemResult[] = [];
  let scraped = 0;

  let catalog: CatalogIndex;
  try {
    catalog = await loadCatalogIndex(supabase);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load catalog";
    return urls.map((url) => ({ url, status: "error" as const, error: message }));
  }

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

    if (isBlockedUrl(normalized)) {
      results.push({
        url: normalized,
        status: "skipped",
        error: "Blocked host (not an official product page)",
      });
      continue;
    }

    // Rule: never scrape URLs that already map to a catalog tool (URL / host).
    const existingBefore = findExistingTool(catalog, normalized);
    if (existingBefore) {
      results.push(await markExists(supabase, normalized, key, sourceType, existingBefore));
      continue;
    }

    const { data: existingCandidate } = await supabase
      .from("ingestion_candidates")
      .select("id, status, error, extracted_payload, tool_id")
      .eq("dedupe_key", key)
      .maybeSingle();

    if (existingCandidate?.status === "approved" || existingCandidate?.tool_id) {
      results.push({
        url: normalized,
        status: "exists",
        candidate_id: existingCandidate.id,
        error: "Already approved / linked to a tool",
      });
      continue;
    }

    if (existingCandidate?.status === "pending") {
      const payload = existingCandidate.extracted_payload;
      const hasPayload =
        payload &&
        typeof payload === "object" &&
        !Array.isArray(payload) &&
        Object.keys(payload as Record<string, unknown>).length > 0 &&
        !existingCandidate.error;
      if (hasPayload) {
        results.push({
          url: normalized,
          status: "duplicate",
          candidate_id: existingCandidate.id,
          error: "Already pending review",
        });
        continue;
      }
      // Allow retry of empty/failed pending rows.
    }

    if (existingCandidate?.status === "duplicate") {
      results.push({
        url: normalized,
        status: "exists",
        candidate_id: existingCandidate.id,
        error: "Marked duplicate of an existing catalog tool",
      });
      continue;
    }

    if (scraped > 0 && delayMs > 0) await sleep(delayMs);

    try {
      const { extracted, markdown } = await scrapeTool(normalized, supabase);
      scraped += 1;
      const payload = sanitizeExtracted(extracted, normalized);
      if (!payload.name || !payload.summary) {
        throw new Error("Extraction missing required name/summary");
      }

      // Rule: if scrape reveals a tool already in catalog (name/slug/official URL), do not queue.
      const existingAfter = findExistingTool(catalog, normalized, payload);
      if (existingAfter) {
        results.push(await markExists(supabase, normalized, key, sourceType, existingAfter));
        continue;
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
      scraped += 1;
      const message = err instanceof Error ? err.message : "Ingest failed";
      const status = isHardFailure(message) ? "rejected" : "pending";
      const { data: failed } = await supabase
        .from("ingestion_candidates")
        .upsert(
          {
            candidate_url: normalized,
            dedupe_key: key,
            source_type: sourceType,
            status,
            extracted_payload: {},
            error: message,
            discovered_at: new Date().toISOString(),
            reviewed_at: isHardFailure(message) ? new Date().toISOString() : null,
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
