import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ChangeReviewStatus = "pending" | "approved" | "rejected";

export type ChangeEventFieldKey =
  | "summary"
  | "pricing_model"
  | "price_display"
  | "api_available"
  | "open_source"
  | "local_available";

const APPLICABLE_FIELDS = new Set<string>([
  "summary",
  "pricing_model",
  "price_display",
  "api_available",
  "open_source",
  "local_available",
]);

const PRICE_FIELDS = new Set<string>(["pricing_model", "price_display"]);

export interface PendingChangeEvent {
  id: string;
  tool_id: string | null;
  field_key: string;
  old_value: string | null;
  new_value: string | null;
  source_id: string | null;
  detected_at: string;
  reviewed_at: string | null;
  review_status: ChangeReviewStatus;
  reviewed_by: string | null;
  review_note: string | null;
  tools: { name: string; slug: string } | null;
}

async function getReviewerId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

function coerceToolValue(
  fieldKey: ChangeEventFieldKey,
  raw: string | null,
): string | boolean | null {
  if (raw === null) return null;
  if (fieldKey === "api_available" || fieldKey === "open_source" || fieldKey === "local_available") {
    const lower = raw.trim().toLowerCase();
    if (lower === "true") return true;
    if (lower === "false") return false;
    throw new Error(`Invalid boolean for ${fieldKey}: ${raw}`);
  }
  return raw;
}

async function upsertOverviewPricingPlan(
  toolId: string,
  sourceId: string | null,
  pricingModel: string | null,
  priceDisplay: string | null,
) {
  const verifiedAt = new Date().toISOString().slice(0, 10);
  const limitsJson = priceDisplay ? { price_display: priceDisplay } : {};

  const { data: existing, error: findError } = await supabase
    .from("pricing_plans")
    .select("id")
    .eq("tool_id", toolId)
    .eq("plan_name", "Overview")
    .maybeSingle();
  if (findError) throw new Error(findError.message);

  if (existing) {
    const { error } = await supabase
      .from("pricing_plans")
      .update({
        pricing_model: pricingModel,
        limits_json: limitsJson,
        source_id: sourceId,
        verified_at: verifiedAt,
      })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from("pricing_plans").insert({
    tool_id: toolId,
    plan_name: "Overview",
    pricing_model: pricingModel,
    limits_json: limitsJson,
    source_id: sourceId,
    verified_at: verifiedAt,
  });
  if (error) throw new Error(error.message);
}

export async function listPendingChangeEvents(): Promise<PendingChangeEvent[]> {
  const { data, error } = await supabase
    .from("change_events")
    .select(
      `
      id, tool_id, field_key, old_value, new_value, source_id, detected_at,
      reviewed_at, review_status, reviewed_by, review_note,
      tools ( name, slug )
    `,
    )
    .eq("review_status", "pending")
    .order("detected_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []) as PendingChangeEvent[];
}

export async function countPendingChangeEvents(): Promise<number> {
  const { count, error } = await supabase
    .from("change_events")
    .select("id", { count: "exact", head: true })
    .eq("review_status", "pending");
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function approveChangeEvent(id: string) {
  const { data: event, error: loadError } = await supabase
    .from("change_events")
    .select(
      "id, tool_id, field_key, new_value, source_id, review_status",
    )
    .eq("id", id)
    .single();
  if (loadError) throw new Error(loadError.message);
  if (event.review_status !== "pending") {
    throw new Error(`Change event is already ${event.review_status}`);
  }
  if (!event.tool_id) throw new Error("Change event has no linked tool");

  const fieldKey = event.field_key;
  if (APPLICABLE_FIELDS.has(fieldKey)) {
    const coerced = coerceToolValue(fieldKey as ChangeEventFieldKey, event.new_value);
    const { error: toolError } = await supabase
      .from("tools")
      .update({ [fieldKey]: coerced })
      .eq("id", event.tool_id);
    if (toolError) throw new Error(toolError.message);

    if (PRICE_FIELDS.has(fieldKey)) {
      const { data: tool, error: pricingFetchError } = await supabase
        .from("tools")
        .select("pricing_model, price_display")
        .eq("id", event.tool_id)
        .single();
      if (pricingFetchError) throw new Error(pricingFetchError.message);
      await upsertOverviewPricingPlan(
        event.tool_id,
        event.source_id,
        tool.pricing_model,
        tool.price_display,
      );
    }
  }

  const reviewerId = await getReviewerId();
  const reviewedAt = new Date().toISOString();
  const { error: reviewError } = await supabase
    .from("change_events")
    .update({
      review_status: "approved",
      reviewed_at: reviewedAt,
      reviewed_by: reviewerId,
    })
    .eq("id", id)
    .eq("review_status", "pending");
  if (reviewError) throw new Error(reviewError.message);

  return { ok: true as const, id, review_status: "approved" as const };
}

export async function rejectChangeEvent(id: string, reviewNote?: string) {
  const reviewerId = await getReviewerId();
  const reviewedAt = new Date().toISOString();
  const { error } = await supabase
    .from("change_events")
    .update({
      review_status: "rejected",
      reviewed_at: reviewedAt,
      reviewed_by: reviewerId,
      review_note: reviewNote?.trim() || null,
    })
    .eq("id", id)
    .eq("review_status", "pending");
  if (error) throw new Error(error.message);
  return { ok: true as const, id, review_status: "rejected" as const };
}

export function fieldLabel(fieldKey: string): string {
  return fieldKey.replace(/_/g, " ");
}

export const pendingChangeEventsQuery = queryOptions({
  queryKey: ["admin", "changes", "pending"],
  queryFn: listPendingChangeEvents,
  staleTime: 10_000,
});
