import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";

export type IngestionCandidateStatus =
  Database["public"]["Enums"]["ingestion_candidate_status"];
export type IngestionSourceType = Database["public"]["Enums"]["ingestion_source_type"];
export type IngestionRunKind = Database["public"]["Enums"]["ingestion_run_kind"];

export interface IngestionCandidate {
  id: string;
  candidate_url: string;
  dedupe_key: string;
  source_type: IngestionSourceType;
  status: IngestionCandidateStatus;
  extracted_payload: Json;
  raw_markdown: string | null;
  confidence: number | null;
  error: string | null;
  discovered_at: string;
  reviewed_at: string | null;
  tool_id: string | null;
}

export interface IngestionRun {
  id: string;
  kind: IngestionRunKind;
  started_at: string;
  finished_at: string | null;
  stats: Json;
  error: string | null;
}

export interface ExtractedPayload {
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
}

function parseUrls(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(/[\n,]+/)
        .map((u) => u.trim())
        .filter(Boolean),
    ),
  ];
}

export async function queueIngestUrls(raw: string) {
  const urls = parseUrls(raw);
  if (!urls.length) throw new Error("Paste at least one URL");
  if (urls.length > 25) throw new Error("Max 25 URLs per batch");

  const { data, error } = await supabase.functions.invoke("ingest-tool", {
    body: { urls },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(String(data.error));
  return data as {
    run_id: string;
    stats: Record<string, number>;
    results: Array<{ url: string; status: string; candidate_id?: string; error?: string }>;
  };
}

export async function triggerDiscoverDaily() {
  const { data, error } = await supabase.functions.invoke("discover-daily", {
    body: { force: true },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(String(data.error));
  return data as {
    run_id?: string;
    skipped?: boolean;
    reason?: string;
    stats?: Record<string, number>;
    results?: Array<{ url: string; status: string; candidate_id?: string; error?: string }>;
  };
}

export async function triggerDiscoverNews(options: { publish?: boolean } = {}) {
  const { data, error } = await supabase.functions.invoke("discover-news", {
    body: { publish: Boolean(options.publish), limit: 12 },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(String(data.error));
  return data as {
    ok: boolean;
    stats: Record<string, number | string>;
    results: Array<{ url: string; status: string; id?: string; error?: string }>;
  };
}

export async function listPendingCandidates(): Promise<IngestionCandidate[]> {
  const { data, error } = await supabase
    .from("ingestion_candidates")
    .select(
      "id, candidate_url, dedupe_key, source_type, status, extracted_payload, raw_markdown, confidence, error, discovered_at, reviewed_at, tool_id",
    )
    .eq("status", "pending")
    .is("error", null)
    .order("discovered_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return ((data ?? []) as IngestionCandidate[]).filter((row) => {
    const payload = asPayload(row.extracted_payload);
    return Boolean(payload.name && payload.summary);
  });
}

export async function listRecentIngestionRuns(limit = 5): Promise<IngestionRun[]> {
  const { data, error } = await supabase
    .from("ingestion_runs")
    .select("id, kind, started_at, finished_at, stats, error")
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as IngestionRun[];
}

export async function countPendingCandidates(): Promise<number> {
  const rows = await listPendingCandidates();
  return rows.length;
}

export async function approveCandidate(candidateId: string, publishNow = false) {
  const { data, error } = await supabase.functions.invoke("approve-candidate", {
    body: { candidate_id: candidateId, action: "approve", publish_now: publishNow },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(String(data.error));
  return data as { ok: boolean; status: string; tool_id?: string; slug?: string };
}

export async function approveAllCandidates(publishNow = false) {
  const { data, error } = await supabase.functions.invoke("approve-candidate", {
    body: { action: "approve_all", publish_now: publishNow },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(String(data.error));
  return data as {
    ok: boolean;
    status: string;
    stats: { considered: number; approved: number; failed: number; publish_now: boolean };
    failures?: Array<{ id: string; error: string }>;
  };
}

export async function rejectCandidate(candidateId: string, reason?: string) {
  const { data, error } = await supabase.functions.invoke("approve-candidate", {
    body: { candidate_id: candidateId, action: "reject", reason },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(String(data.error));
  return data as { ok: boolean; status: string };
}

export function asPayload(value: Json): ExtractedPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as ExtractedPayload;
}

export const pendingCandidatesQuery = queryOptions({
  queryKey: ["admin", "ingestion", "pending"],
  queryFn: listPendingCandidates,
  staleTime: 10_000,
});

export const recentIngestionRunsQuery = queryOptions({
  queryKey: ["admin", "ingestion", "runs"],
  queryFn: () => listRecentIngestionRuns(5),
  staleTime: 15_000,
});
