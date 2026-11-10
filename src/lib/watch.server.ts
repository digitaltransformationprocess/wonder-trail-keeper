import { streamText, Output } from "ai";
import { z } from "zod";
import { SOLUTIONS } from "@/data/catalog";
import { createGateway, AI_MODEL, OPENAI_OPTS } from "./ai.server";

const KINDS = ["New tool", "New version", "Pricing change", "Announcement"] as const;
const MAX_ITEMS = 6; // bounded work per run

const schema = z.object({
  items: z.array(z.object({
    source_url: z.string(),
    kind: z.enum(KINDS),
    title: z.string(),
    summary: z.string(),
    solution_slug: z.string().nullable(),
  })),
});

export async function runWatch(): Promise<{ status: number; message: string }> {
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  const now = new Date();

  const { data: state } = await db.from("watch_state").select("*").eq("id", "veille").single();
  if (state?.paused_reason) return { status: 200, message: `Paused: ${state.paused_reason}` };
  if (state?.locked_until && new Date(state.locked_until) > now) return { status: 200, message: "Already running" };
  await db.from("watch_state").update({ locked_until: new Date(now.getTime() + 10 * 60_000).toISOString() }).eq("id", "veille");

  const finish = async (result: string, paused?: string) => {
    await db.from("watch_state").update({ locked_until: null, last_run_at: new Date().toISOString(), last_result: result, ...(paused ? { paused_reason: paused } : {}) }).eq("id", "veille");
  };

  try {
    const key = process.env['FIRECRAWL_API_KEY'];
    if (!key) throw new Error("FIRECRAWL_API_KEY is missing");
    const gatewayKey = process.env['LOVABLE_API_KEY'];
    if (!gatewayKey) throw new Error("LOVABLE_API_KEY is missing");
    const fc = await fetch("https://connector-gateway.lovable.dev/firecrawl/v2/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${gatewayKey}`, "X-Connection-Api-Key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ query: "AI tool launch OR new version OR pricing change announcement", limit: 12, tbs: "qdr:w", sources: ["news"] }),
    });
    if (!fc.ok) {
      const body = await fc.text();
      console.error(`Firecrawl request failed [${fc.status}]: ${body}`);
      await finish(`Web search failed [${fc.status}]`, fc.status === 402 ? "Web search credits exhausted" : undefined);
      return { status: fc.status, message: `Firecrawl ${fc.status}: ${body}` };
    }
    const json = await fc.json() as { data?: { news?: Raw[]; web?: Raw[] } | Raw[] };
    type Raw = { url?: string; title?: string; snippet?: string; description?: string; date?: string };
    const d = json.data;
    const raw: Raw[] = Array.isArray(d) ? d : [...(d?.news ?? []), ...(d?.web ?? [])];
    const results = raw.flatMap((r) => r.url && r.title ? [{ url: r.url, title: r.title, snippet: r.snippet ?? r.description ?? "", date: r.date ?? "" }] : []);

    const { data: existing } = await db.from("news_items").select("source_url").in("source_url", results.map((r) => r.url));
    const seen = new Set((existing ?? []).map((e) => e.source_url));
    const fresh = results.filter((r) => !seen.has(r.url));
    if (fresh.length === 0) { await finish("No new items"); return { status: 200, message: "No new items" }; }

    const result = streamText({
      model: createGateway().responses(AI_MODEL),
      system: `You are AI Discovery's news editor. From the supplied search results, keep at most ${MAX_ITEMS} news items actually related to an AI product or service (launch, new version, pricing change, announcement). Ignore everything else. Always write in English. Write a short title and a factual one- or two-sentence summary based ONLY on the supplied text, without inventing anything. Copy source_url exactly. solution_slug: a catalog slug if the news clearly concerns that tool, otherwise null.`,
      prompt: `Catalog (slug: name): ${SOLUTIONS.map((s) => `${s.slug}: ${s.name}`).join(", ")}\n\nResults:\n${JSON.stringify(fresh)}`,
      output: Output.object({ schema }),
      providerOptions: OPENAI_OPTS,
    });
    const out = await result.output;
    const urls = new Set(fresh.map((f) => f.url));
    const slugs = new Set(SOLUTIONS.map((s) => s.slug));
    const rows = out.items.filter((i) => urls.has(i.source_url)).slice(0, MAX_ITEMS).map((i) => {
      const src = fresh.find((f) => f.url === i.source_url);
      const dt = src?.date ? new Date(src.date) : null;
      return { ...i, solution_slug: i.solution_slug && slugs.has(i.solution_slug) ? i.solution_slug : null,
        published_at: (dt && !isNaN(dt.getTime()) ? dt : new Date()).toISOString().slice(0, 10) };
    });
    if (rows.length) await db.from("news_items").upsert(rows, { onConflict: "source_url", ignoreDuplicates: true });
    await finish(`${rows.length} news item(s) added`);
    return { status: 200, message: `${rows.length} added` };
  } catch (e) {
    const status = (e as { statusCode?: number })?.statusCode;
    const paused = status === 402 ? "AI credits exhausted" : status === 403 ? "AI access denied" : undefined;
    console.error("runWatch", e);
    await finish("Error", paused);
    return { status: 500, message: "News update failed" };
  }
}
