import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export interface NewsRow { id: string; published_at: string; kind: string; title: string; summary: string; solution_slug: string | null; source_url: string; }

export const listNews = createServerFn({ method: "GET" }).handler(async (): Promise<NewsRow[]> => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const db = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const h = new Headers(init?.headers);
      if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
      h.set("apikey", key);
      return fetch(input, { ...init, headers: h });
    } },
  });
  const { data, error } = await db.from("news_items")
    .select("id, published_at, kind, title, summary, solution_slug, source_url")
    .order("published_at", { ascending: false }).order("created_at", { ascending: false }).limit(50);
  if (error) { console.error("listNews", error); return []; }
  return data;
});
