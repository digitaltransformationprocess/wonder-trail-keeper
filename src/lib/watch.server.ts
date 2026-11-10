import { streamText, Output } from "ai";
import { z } from "zod";
import { SOLUTIONS } from "@/data/catalog";
import { createGateway, AI_MODEL, OPENAI_OPTS } from "./ai.server";

const KINDS = ["Nouvel outil", "Nouvelle version", "Changement de prix", "Annonce"] as const;
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
  if (state?.paused_reason) return { status: 200, message: `En pause : ${state.paused_reason}` };
  if (state?.locked_until && new Date(state.locked_until) > now) return { status: 200, message: "Déjà en cours" };
  await db.from("watch_state").update({ locked_until: new Date(now.getTime() + 10 * 60_000).toISOString() }).eq("id", "veille");

  const finish = async (result: string, paused?: string) => {
    await db.from("watch_state").update({ locked_until: null, last_run_at: new Date().toISOString(), last_result: result, ...(paused ? { paused_reason: paused } : {}) }).eq("id", "veille");
  };

  try {
    const key = process.env.FIRECRAWL_API_KEY;
    if (!key) throw new Error("FIRECRAWL_API_KEY manquante");
    const fc = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: "AI tool launch OR new version OR pricing change announcement", limit: 12, tbs: "qdr:w", sources: ["news"] }),
    });
    if (!fc.ok) {
      const body = await fc.text();
      await finish(`Recherche web échouée [${fc.status}]`, fc.status === 402 ? "Crédits de recherche web épuisés" : undefined);
      return { status: 502, message: `Firecrawl ${fc.status}: ${body.slice(0, 200)}` };
    }
    const json = await fc.json() as { data?: { news?: Raw[]; web?: Raw[] } | Raw[] };
    type Raw = { url?: string; title?: string; snippet?: string; description?: string; date?: string };
    const d = json.data;
    const raw: Raw[] = Array.isArray(d) ? d : [...(d?.news ?? []), ...(d?.web ?? [])];
    const results = raw.filter((r) => r.url && r.title).map((r) => ({ url: r.url!, title: r.title!, snippet: r.snippet ?? r.description ?? "", date: r.date ?? "" }));

    const { data: existing } = await db.from("news_items").select("source_url").in("source_url", results.map((r) => r.url));
    const seen = new Set((existing ?? []).map((e) => e.source_url));
    const fresh = results.filter((r) => !seen.has(r.url));
    if (fresh.length === 0) { await finish("Aucune nouveauté"); return { status: 200, message: "Aucune nouveauté" }; }

    const result = streamText({
      model: createGateway().responses(AI_MODEL),
      system: `Tu es l'éditeur de veille d'AI Discovery. À partir des résultats de recherche fournis, garde au plus ${MAX_ITEMS} actualités réellement liées à un produit ou service d'IA (lancement, nouvelle version, changement de prix, annonce). Ignore le reste. Rédige en français un titre court et un résumé factuel d'une ou deux phrases fondé UNIQUEMENT sur le texte fourni, sans rien inventer. source_url doit être recopiée exactement. solution_slug : un slug du catalogue si l'actualité concerne clairement cet outil, sinon null.`,
      prompt: `Catalogue (slug: nom): ${SOLUTIONS.map((s) => `${s.slug}: ${s.name}`).join(", ")}\n\nRésultats:\n${JSON.stringify(fresh)}`,
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
    await finish(`${rows.length} actualité(s) ajoutée(s)`);
    return { status: 200, message: `${rows.length} ajoutée(s)` };
  } catch (e) {
    const status = (e as { statusCode?: number })?.statusCode;
    const paused = status === 402 ? "Crédits IA épuisés" : status === 403 ? "Accès IA refusé" : undefined;
    console.error("runWatch", e);
    await finish("Erreur", paused);
    return { status: 500, message: "Erreur de veille" };
  }
}
