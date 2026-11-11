import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ReliabilityLevel = Database["public"]["Enums"]["reliability_level"];

export interface AdminSource {
  id: string;
  url: string;
  publisher: string | null;
  source_type: string;
  reliability_level: ReliabilityLevel;
  terms_notes: string | null;
  created_at: string;
  tool_count: number;
}

export async function listAdminSources(): Promise<AdminSource[]> {
  const [{ data: sources, error }, { data: links, error: linkError }] = await Promise.all([
    supabase
      .from("sources")
      .select("id, url, publisher, source_type, reliability_level, terms_notes, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("tool_sources").select("source_id"),
  ]);
  if (error) throw new Error(error.message);
  if (linkError) throw new Error(linkError.message);

  const counts = new Map<string, number>();
  for (const link of links ?? []) {
    counts.set(link.source_id, (counts.get(link.source_id) ?? 0) + 1);
  }

  return (sources ?? []).map((s) => ({
    ...s,
    tool_count: counts.get(s.id) ?? 0,
  }));
}

export async function updateAdminSource(
  id: string,
  patch: {
    publisher?: string;
    source_type?: string;
    reliability_level?: ReliabilityLevel;
    terms_notes?: string;
  },
) {
  const { error } = await supabase
    .from("sources")
    .update({
      publisher: patch.publisher?.trim() || null,
      source_type: patch.source_type?.trim() || "official",
      reliability_level: patch.reliability_level,
      terms_notes: patch.terms_notes?.trim() || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export const adminSourcesQuery = queryOptions({
  queryKey: ["admin", "sources"],
  queryFn: listAdminSources,
  staleTime: 15_000,
});
