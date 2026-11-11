import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

const FAV_KEY = "aidp:favorites";
const CMP_KEY = "aidp:compare";
const COMPARE_MAX = 4;

function readList(key: string): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(raw) ? raw.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function writeList(key: string, list: string[]) {
  localStorage.setItem(key, JSON.stringify(list));
  window.dispatchEvent(new Event(`store:${key}`));
}

function useList(key: string, max = 99) {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    const read = () => setList(readList(key));
    read();
    window.addEventListener(`store:${key}`, read);
    return () => window.removeEventListener(`store:${key}`, read);
  }, [key]);
  const toggle = useCallback(
    (slug: string) => {
      const cur = readList(key);
      const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug].slice(-max);
      writeList(key, next);
    },
    [key, max],
  );
  const setListDirect = useCallback(
    (slugs: string[]) => {
      writeList(key, slugs.slice(-max));
    },
    [key, max],
  );
  return { list, toggle, has: (s: string) => list.includes(s), setList: setListDirect };
}

async function fetchCloudFavoriteSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select("created_at, tools!inner(slug)")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => {
    const tools = row.tools as { slug: string } | { slug: string }[];
    const t = Array.isArray(tools) ? tools[0] : tools;
    return t?.slug;
  }).filter((s): s is string => !!s);
}

async function toolIdForSlug(slug: string): Promise<string | null> {
  const { data, error } = await supabase.from("tools").select("id").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function setCloudFavorite(slug: string, on: boolean, userId: string) {
  const toolId = await toolIdForSlug(slug);
  if (!toolId) return;
  if (on) {
    const { error } = await supabase
      .from("favorites")
      .upsert({ user_id: userId, tool_id: toolId }, { onConflict: "user_id,tool_id" });
    if (error) throw error;
  } else {
    const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("tool_id", toolId);
    if (error) throw error;
  }
}

export function useFavorites() {
  const { user } = useAuth();
  const [list, setList] = useState<string[]>([]);
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    const read = () => setList(readList(FAV_KEY));
    read();
    window.addEventListener(`store:${FAV_KEY}`, read);
    return () => window.removeEventListener(`store:${FAV_KEY}`, read);
  }, []);

  useEffect(() => {
    if (!user) {
      syncedFor.current = null;
      return;
    }
    if (syncedFor.current === user.id) return;

    let cancelled = false;
    void (async () => {
      try {
        const local = readList(FAV_KEY);
        const cloud = await fetchCloudFavoriteSlugs();
        const merged = [...new Set([...local, ...cloud])];
        if (cancelled) return;
        writeList(FAV_KEY, merged);
        syncedFor.current = user.id;

        const cloudSet = new Set(cloud);
        for (const slug of local) {
          if (!cloudSet.has(slug)) {
            await setCloudFavorite(slug, true, user.id);
          }
        }
      } catch (err) {
        console.error("Favorites cloud sync failed", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggle = useCallback(
    (slug: string) => {
      const cur = readList(FAV_KEY);
      const adding = !cur.includes(slug);
      const next = adding ? [...cur, slug] : cur.filter((s) => s !== slug);
      writeList(FAV_KEY, next);
      if (user) {
        void setCloudFavorite(slug, adding, user.id).catch((err) =>
          console.error("Favorites toggle cloud write failed", err),
        );
      }
    },
    [user],
  );

  return { list, toggle, has: (s: string) => list.includes(s) };
}

export function useCompare() {
  return useList(CMP_KEY, COMPARE_MAX);
}

export function setCompareSlugs(slugs: string[]) {
  writeList(CMP_KEY, slugs.slice(0, COMPARE_MAX));
}
