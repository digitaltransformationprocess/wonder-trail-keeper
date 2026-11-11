import { corsHeaders, jsonResponse } from "./_shared/cors.ts";
import { searchNewTools } from "./_shared/firecrawl.ts";
import { assertCronSecret, requireStaff, serviceClient } from "./_shared/supabase.ts";

const QUERIES = [
  "AI tool launch news this week",
  "new AI product release announcement",
  "AI pricing change OR API launch news",
];

const BLOCKED = [
  "reddit.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "youtube.com",
  "tiktok.com",
  "pinterest.com",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function isBlocked(url: string) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return BLOCKED.some((p) => host === p || host.endsWith(`.${p}`));
  } catch {
    return true;
  }
}

function inferKind(title: string, description: string): string {
  const t = `${title} ${description}`.toLowerCase();
  if (/pric|plan|billing|free tier/.test(t)) return "pricing";
  if (/launch|releas|announce|introduc/.test(t)) return "release";
  if (/acquisit|fund|rais/.test(t)) return "business";
  return "news";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

    const body = (await req.json().catch(() => ({}))) as {
      publish?: boolean;
      limit?: number;
    };
    const publish = Boolean(body.publish);
    const limit = Math.max(1, Math.min(Number(body.limit ?? 12), 20));

    const cronHeader = req.headers.get("x-ingest-secret");
    let supabase;
    if (cronHeader) {
      supabase = serviceClient();
      await assertCronSecret(req, supabase);
    } else {
      const auth = await requireStaff(req.headers.get("Authorization"));
      supabase = auth.service;
    }

    const hits: Array<{ url: string; title?: string; description?: string }> = [];
    for (const query of QUERIES) {
      const found = await searchNewTools(query, 5, supabase);
      hits.push(...found);
    }

    const unique = new Map<string, { url: string; title?: string; description?: string }>();
    for (const hit of hits) {
      if (!hit.url || isBlocked(hit.url)) continue;
      const key = hit.url.replace(/\/+$/, "").toLowerCase();
      if (!unique.has(key)) unique.set(key, hit);
    }

    const candidates = [...unique.values()].slice(0, limit);
    let created = 0;
    let skipped = 0;
    let errors = 0;
    const results: Array<{ url: string; status: string; id?: string; error?: string }> = [];

    for (const hit of candidates) {
      try {
        const { data: existing } = await supabase
          .from("news_items")
          .select("id")
          .eq("source_url", hit.url)
          .maybeSingle();
        if (existing) {
          skipped += 1;
          results.push({ url: hit.url, status: "exists", id: existing.id });
          continue;
        }

        const title = (hit.title || new URL(hit.url).hostname).trim().slice(0, 180);
        const summary = (hit.description || hit.title || "To verify from source.").trim().slice(0, 400);
        let slug = slugify(title) || slugify(new URL(hit.url).hostname);
        if (slug) {
          const { data: clash } = await supabase.from("news_items").select("id").eq("slug", slug).maybeSingle();
          if (clash) slug = `${slug}-${crypto.randomUUID().slice(0, 6)}`;
        }

        const { data: row, error } = await supabase
          .from("news_items")
          .insert({
            title,
            slug: slug || null,
            summary,
            body: null,
            kind: inferKind(title, summary),
            event_type: "discovered",
            published_at: new Date().toISOString().slice(0, 10),
            source_url: hit.url,
            solution_slug: null,
            status: publish ? "published" : "draft",
          })
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        created += 1;
        results.push({ url: hit.url, status: publish ? "published" : "draft", id: row.id });
      } catch (err) {
        errors += 1;
        results.push({
          url: hit.url,
          status: "error",
          error: err instanceof Error ? err.message : "failed",
        });
      }
    }

    return jsonResponse({
      ok: true,
      stats: {
        searched_queries: QUERIES.length,
        urls_found: hits.length,
        considered: candidates.length,
        created,
        skipped,
        errors,
        status: publish ? "published" : "draft",
      },
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "discover-news failed";
    const status =
      message.includes("Invalid cron") || message.includes("Forbidden")
        ? 403
        : message.includes("Unauthorized")
          ? 401
          : 500;
    return jsonResponse({ error: message }, status);
  }
});
