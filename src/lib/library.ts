import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Collection = Tables<"collections">;

export type CollectionItemRow = {
  position: number;
  tool_id: string;
  slug: string;
};

async function toolIdForSlug(slug: string): Promise<string | null> {
  const { data, error } = await supabase.from("tools").select("id").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

function slugifyName(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "collection";
}

export async function listCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createCollection(name: string, slug?: string): Promise<Collection> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Sign in to create collections");

  const finalSlug = slug?.trim() || slugifyName(name);
  const { data, error } = await supabase
    .from("collections")
    .insert({
      user_id: user.id,
      name: name.trim(),
      slug: finalSlug,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCollection(collectionId: string): Promise<void> {
  const { error } = await supabase.from("collections").delete().eq("id", collectionId);
  if (error) throw error;
}

export async function listCollectionItems(collectionId: string): Promise<CollectionItemRow[]> {
  const { data, error } = await supabase
    .from("collection_items")
    .select("position, tool_id, tools!inner(slug)")
    .eq("collection_id", collectionId)
    .order("position", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const tools = row.tools as { slug: string } | { slug: string }[];
    const t = Array.isArray(tools) ? tools[0] : tools;
    return {
      position: row.position,
      tool_id: row.tool_id,
      slug: t?.slug ?? "",
    };
  }).filter((r) => r.slug);
}

export async function addCollectionItem(collectionId: string, toolSlug: string): Promise<void> {
  const toolId = await toolIdForSlug(toolSlug);
  if (!toolId) throw new Error(`Unknown tool: ${toolSlug}`);

  const { data: existing, error: listError } = await supabase
    .from("collection_items")
    .select("position")
    .eq("collection_id", collectionId)
    .order("position", { ascending: false })
    .limit(1);
  if (listError) throw listError;

  const nextPos = existing?.[0]?.position != null ? existing[0].position + 1 : 0;
  const { error } = await supabase.from("collection_items").upsert(
    {
      collection_id: collectionId,
      tool_id: toolId,
      position: nextPos,
    },
    { onConflict: "collection_id,tool_id" },
  );
  if (error) throw error;

  await supabase
    .from("collections")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", collectionId);
}

export async function removeCollectionItem(collectionId: string, toolSlug: string): Promise<void> {
  const toolId = await toolIdForSlug(toolSlug);
  if (!toolId) return;

  const { error } = await supabase
    .from("collection_items")
    .delete()
    .eq("collection_id", collectionId)
    .eq("tool_id", toolId);
  if (error) throw error;

  await supabase
    .from("collections")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", collectionId);
}
