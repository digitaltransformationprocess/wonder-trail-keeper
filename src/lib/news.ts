import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NewsRow {
  id: string;
  published_at: string;
  kind: string;
  title: string;
  summary: string;
  solution_slug: string | null;
  source_url: string;
}

export async function listNews(): Promise<NewsRow[]> {
  const { data, error } = await supabase
    .from("news_items")
    .select("id, published_at, kind, title, summary, solution_slug, source_url")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`News unavailable: ${error.message}`);
  }

  return data ?? [];
}

export const newsQuery = queryOptions({
  queryKey: ["news"],
  queryFn: listNews,
  staleTime: 60_000,
});
