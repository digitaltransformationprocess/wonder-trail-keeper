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
  try {
    const { data, error } = await supabase
      .from("news_items")
      .select("id, published_at, kind, title, summary, solution_slug, source_url")
      .order("published_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("listNews", error);
      return [];
    }
    return data ?? [];
  } catch (error) {
    console.error("listNews", error);
    return [];
  }
}
