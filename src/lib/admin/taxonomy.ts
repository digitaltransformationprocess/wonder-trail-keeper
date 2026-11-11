import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/admin/catalog";

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface AdminSolutionType {
  id: string;
  name: string;
  slug: string;
}

export async function listAdminCategories(): Promise<AdminCategory[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, parent_id, is_active, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function upsertCategory(input: {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
  sort_order?: number;
  parent_id?: string | null;
}) {
  const name = input.name.trim();
  if (!name) throw new Error("Category name is required");
  const slug = (input.slug?.trim() || slugify(name)).slice(0, 80);
  const row = {
    name,
    slug,
    description: input.description?.trim() || null,
    is_active: input.is_active ?? true,
    sort_order: input.sort_order ?? 0,
    parent_id: input.parent_id ?? null,
  };

  if (input.id) {
    const { error } = await supabase.from("categories").update(row).eq("id", input.id);
    if (error) throw new Error(error.message);
    return input.id;
  }

  const { data, error } = await supabase.from("categories").insert(row).select("id").single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function setCategoryActive(id: string, is_active: boolean) {
  const { error } = await supabase.from("categories").update({ is_active }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listAdminTypes(): Promise<AdminSolutionType[]> {
  const { data, error } = await supabase
    .from("solution_types")
    .select("id, name, slug")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function upsertSolutionType(input: { id?: string; name: string; slug?: string }) {
  const name = input.name.trim();
  if (!name) throw new Error("Type name is required");
  const slug = (input.slug?.trim() || slugify(name)).slice(0, 80);

  if (input.id) {
    const { error } = await supabase
      .from("solution_types")
      .update({ name, slug })
      .eq("id", input.id);
    if (error) throw new Error(error.message);
    return input.id;
  }

  const { data, error } = await supabase
    .from("solution_types")
    .insert({ name, slug })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export interface AdminFeature {
  id: string;
  key: string;
  label: string;
  description: string | null;
  sort_order: number;
}

export async function listAdminFeatures(): Promise<AdminFeature[]> {
  const { data, error } = await supabase
    .from("features")
    .select("id, key, label, description, sort_order")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function upsertFeature(input: {
  id?: string;
  key?: string;
  label: string;
  description?: string;
  sort_order?: number;
}) {
  const label = input.label.trim();
  if (!label) throw new Error("Feature label is required");
  const key = (input.key?.trim() || slugify(label)).slice(0, 80);
  const row = {
    key,
    label,
    description: input.description?.trim() || null,
    sort_order: input.sort_order ?? 0,
  };

  if (input.id) {
    const { error } = await supabase.from("features").update(row).eq("id", input.id);
    if (error) throw new Error(error.message);
    return input.id;
  }

  const { data, error } = await supabase.from("features").insert(row).select("id").single();
  if (error) throw new Error(error.message);
  return data.id;
}

export const adminCategoriesQuery = queryOptions({
  queryKey: ["admin", "categories"],
  queryFn: listAdminCategories,
  staleTime: 15_000,
});

export const adminTypesQuery = queryOptions({
  queryKey: ["admin", "types"],
  queryFn: listAdminTypes,
  staleTime: 15_000,
});

export const adminFeaturesQuery = queryOptions({
  queryKey: ["admin", "features"],
  queryFn: listAdminFeatures,
  staleTime: 15_000,
});
