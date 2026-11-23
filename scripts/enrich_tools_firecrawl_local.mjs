/**
 * Enrich tool profiles for AI search using Firecrawl Local + LLM extract.
 *
 * Prereq: firecrawl-local serve on FIRECRAWL_API_URL (default http://127.0.0.1:3002)
 *
 * Usage:
 *   node scripts/enrich_tools_firecrawl_local.mjs
 *   node scripts/enrich_tools_firecrawl_local.mjs --limit 30
 *   node scripts/enrich_tools_firecrawl_local.mjs --slugs chatgpt,claude,cursor
 *   node scripts/enrich_tools_firecrawl_local.mjs --dry-run
 */
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "tmp-enrich");

function loadEnv(path) {
  const env = { ...process.env };
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    let k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) env[k] = v;
  }
  return env;
}

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  if (i < 0) return null;
  return process.argv[i + 1] ?? null;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function contentHash(text) {
  return createHash("sha256").update(text).digest("hex");
}

function completeness(t) {
  let s = 0;
  if (t.summary && t.summary.length > 40) s++;
  if (t.description && t.description.length > 120) s++;
  if (t.pricing_model && t.pricing_model !== "Not disclosed") s++;
  if (t.price_display && !/to verify|not disclosed/i.test(t.price_display || "")) s++;
  if (t.api_available !== null && t.api_available !== undefined) s++;
  if ((t.keywords ?? []).length >= 4) s++;
  if ((t.strengths ?? []).length >= 2) s++;
  if ((t.limits ?? []).length >= 1) s++;
  if ((t.audience ?? []).length >= 1) s++;
  if (t.last_verified_at) s++;
  return s;
}

function firecrawlOrigin(env) {
  return (env.FIRECRAWL_API_URL || "http://127.0.0.1:3002")
    .replace(/\/$/, "")
    .replace(/\/v2$/i, "");
}

/** Local serve root is :3002; API routes live under /v2 (same as Cloud). */
function firecrawlBase(env) {
  return `${firecrawlOrigin(env)}/v2`;
}

async function scrapeMarkdown(base, url) {
  const res = await fetch(`${base}/scrape`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
      onlyMainContent: true,
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.error || body?.message || `scrape ${res.status}`);
  }
  const data = body?.data ?? body;
  const markdown = typeof data?.markdown === "string" ? data.markdown : null;
  if (!markdown || markdown.trim().length < 40) {
    throw new Error("empty markdown");
  }
  return {
    markdown: markdown.slice(0, 28000),
    title: data?.metadata?.title || null,
    source: data?.source || "local",
  };
}

function candidateUrls(tool) {
  const urls = [];
  if (tool.official_url) urls.push(tool.official_url);
  if (tool.api_docs_url) urls.push(tool.api_docs_url);
  try {
    const u = new URL(tool.official_url);
    const pricing = `${u.origin}/pricing`;
    if (!urls.includes(pricing)) urls.push(pricing);
  } catch {
    /* ignore */
  }
  return [...new Set(urls)].slice(0, 3);
}

const EXTRACT_SCHEMA_HINT = `{
  "summary": "string <= 200 chars, factual value prop",
  "description": "string 2-6 sentences, factual, no hype invention",
  "pricing_model": "Free|Freemium|Paid|Open source|Not disclosed",
  "price_display": "short human price or Not disclosed / To verify",
  "api_available": true|false|null,
  "open_source": true|false,
  "local_available": true|false,
  "keywords": ["5-12 search keywords users might type"],
  "strengths": ["2-5 concrete strengths from the page"],
  "limits": ["1-4 concrete limitations / constraints from the page"],
  "audience": ["1-4 audiences"],
  "platforms": ["web"|"windows"|"mac"|"linux"|"ios"|"android"|"api"|"cli"|...],
  "pricing_notes": "optional short note"
}`;

async function extractWithLlm(env, { name, url, markdown, existing }) {
  const apiKey =
    env.GROK_API_KEY ||
    env.XAI_API_KEY ||
    env.OPENROUTER_API_KEY ||
    env.EMBEDDING_API_KEY;
  if (!apiKey) throw new Error("No LLM API key (GROK_API_KEY / EMBEDDING_API_KEY)");

  const useGrok = Boolean(env.GROK_API_KEY || env.XAI_API_KEY);
  const baseUrl = useGrok
    ? "https://api.x.ai/v1"
    : (env.EMBEDDING_BASE_URL || "https://openrouter.ai/api/v1").replace(
        /\/embeddings$/i,
        "",
      ).replace(/\/$/, "");
  const model = useGrok
    ? env.GROK_MODEL || "grok-4.20-0309-non-reasoning"
    : env.ENRICH_MODEL || "openai/gpt-4o-mini";

  const system = [
    "You enrich AI tool catalog profiles for search matching.",
    "Use ONLY facts present in the scraped page markdown.",
    "Never invent prices, APIs, or features. If unknown, use null / Not disclosed / To verify / empty arrays.",
    "Optimize keywords and summary for natural-language discovery queries.",
    `Return ONLY valid JSON matching: ${EXTRACT_SCHEMA_HINT}`,
  ].join("\n");

  const user = JSON.stringify({
    tool: name,
    official_url: url,
    current: {
      summary: existing.summary,
      pricing_model: existing.pricing_model,
      price_display: existing.price_display,
      api_available: existing.api_available,
      open_source: existing.open_source,
      local_available: existing.local_available,
      keywords: existing.keywords,
      strengths: existing.strengths,
      limits: existing.limits,
      audience: existing.audience,
    },
    markdown,
  });

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(useGrok ? {} : { "HTTP-Referer": "https://aidiscov.com", "X-Title": "AI Discov enrich" }),
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 1400,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`LLM ${res.status}: ${(await res.text()).slice(0, 400)}`);
  }
  const body = await res.json();
  const content = body?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("empty LLM content");
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("no JSON in LLM response");
  return JSON.parse(match[0]);
}

function mergeArrays(oldArr, newArr, max) {
  const out = [];
  const seen = new Set();
  for (const x of [...(newArr ?? []), ...(oldArr ?? [])]) {
    const t = String(x || "").trim();
    if (!t) continue;
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
    if (out.length >= max) break;
  }
  return out;
}

function pickBetterText(oldT, newT, minLen) {
  const o = (oldT || "").trim();
  const n = (newT || "").trim();
  if (!n) return o || null;
  if (!o) return n;
  if (n.length >= minLen && n.length >= o.length * 0.8) return n;
  if (o.length < minLen && n.length > o.length) return n;
  return o;
}

async function readSecret(sb, key) {
  const { data } = await sb
    .from("runtime_secrets")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  return data?.value || null;
}

async function embedOne(env, sb, tool) {
  const apiKey = env.EMBEDDING_API_KEY || env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("  [embed skip] no EMBEDDING_API_KEY");
    return;
  }
  const model = env.EMBEDDING_MODEL || "text-embedding-3-small";
  const baseUrl = (env.EMBEDDING_BASE_URL || "https://api.openai.com/v1").replace(
    /\/$/,
    "",
  );
  const text = [
    tool.name,
    tool.summary,
    tool.description,
    ...(tool.keywords ?? []),
    ...(tool.strengths ?? []),
    ...(tool.limits ?? []),
    ...(tool.audience ?? []),
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 8000);
  const hash = contentHash(text);
  const res = await fetch(`${baseUrl}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, input: text }),
  });
  if (!res.ok) throw new Error(`embed ${res.status}: ${await res.text()}`);
  const body = await res.json();
  const embedding = body?.data?.[0]?.embedding;
  if (!Array.isArray(embedding) || embedding.length !== 1536) {
    throw new Error(`bad embedding dim ${embedding?.length}`);
  }
  const { error } = await sb.from("tool_embeddings").upsert(
    {
      tool_id: tool.id,
      embedding,
      content_hash: hash,
      model,
      dimensions: 1536,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "tool_id" },
  );
  if (error) throw error;
}

async function ensureSource(sb, url) {
  const { data: existing } = await sb
    .from("sources")
    .select("id")
    .eq("url", url)
    .maybeSingle();
  if (existing?.id) return existing.id;
  const host = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  })();
  const { data, error } = await sb
    .from("sources")
    .insert({
      url,
      source_type: "official",
      reliability_level: "A",
      publisher: host,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function main() {
  const env = {
    ...loadEnv(join(ROOT, ".env.production")),
    ...loadEnv(join(ROOT, ".env.ingest.local")),
    ...loadEnv(join(ROOT, ".env")),
  };
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase URL/secret");

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Pull LLM keys from runtime_secrets if missing locally
  if (!env.GROK_API_KEY) {
    env.GROK_API_KEY = await readSecret(sb, "GROK_API_KEY");
  }
  if (!env.XAI_API_KEY) {
    env.XAI_API_KEY = await readSecret(sb, "XAI_API_KEY");
  }
  if (!env.GROK_MODEL) {
    env.GROK_MODEL = (await readSecret(sb, "GROK_MODEL")) || undefined;
  }

  const limit = Number(argValue("--limit") || 40);
  const onlySlugs = (argValue("--slugs") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const dry = hasFlag("--dry-run");
  const force = hasFlag("--force");
  const origin = firecrawlOrigin(env);
  const fc = firecrawlBase(env);

  // health
  const health = await fetch(`${origin}/health`).then((r) => r.json()).catch(() => null);
  if (!health || health.status !== "ok") {
    throw new Error(
      `Firecrawl Local not reachable at ${origin}. Run: firecrawl-local serve --port 3002`,
    );
  }
  console.log(`[firecrawl] ${fc} · ${health.engine} ${health.version}`);

  // Also fix edge helpers: FIRECRAWL_API_URL may be host-only or .../v2

  let tools = [];
  if (onlySlugs.length) {
    const { data, error } = await sb
      .from("tools")
      .select(
        "id,slug,name,official_url,api_docs_url,summary,description,pricing_model,price_display,api_available,open_source,local_available,keywords,strengths,limits,audience,last_verified_at,status,created_at",
      )
      .eq("status", "published")
      .in("slug", onlySlugs);
    if (error) throw error;
    tools = data || [];
  } else {
    // Page through published tools so we don't only enrich the first ~80 rows.
    const pageSize = 200;
    for (let from = 0; ; from += pageSize) {
      const { data, error } = await sb
        .from("tools")
        .select(
          "id,slug,name,official_url,api_docs_url,summary,description,pricing_model,price_display,api_available,open_source,local_available,keywords,strengths,limits,audience,last_verified_at,status,created_at",
        )
        .eq("status", "published")
        .order("created_at", { ascending: true })
        .range(from, from + pageSize - 1);
      if (error) throw error;
      const batch = data || [];
      tools.push(...batch);
      if (batch.length < pageSize) break;
    }
  }

  let targets = tools || [];
  if (!onlySlugs.length) {
    // Prefer incomplete, then never/least-recently verified.
    // Skip tools verified in the last 3 days unless --force (avoids re-spinning stuck 8–9/10).
    const cooldownMs = 3 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const verifiedMs = (t) =>
      t.last_verified_at ? Date.parse(t.last_verified_at) || 0 : 0;
    const fresh = (t) => verifiedMs(t) > 0 && now - verifiedMs(t) < cooldownMs;
    targets = targets
      .map((t) => ({ ...t, _c: completeness(t) }))
      .filter((t) => force || (t._c < 10 && !fresh(t)))
      .sort((a, b) => {
        if (force) return a.created_at.localeCompare(b.created_at);
        if (a._c !== b._c) return a._c - b._c;
        if (verifiedMs(a) !== verifiedMs(b)) return verifiedMs(a) - verifiedMs(b);
        return a.created_at.localeCompare(b.created_at);
      })
      .slice(0, limit);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`[targets] ${targets.length} tools · dry=${dry}`);

  let ok = 0;
  let fail = 0;

  for (const tool of targets) {
    const before = completeness(tool);
    process.stdout.write(`\n→ ${tool.slug} (${before}/10) ${tool.official_url}\n`);
    try {
      const urls = candidateUrls(tool);
      const scraps = [];
      for (const u of urls) {
        try {
          const s = await scrapeMarkdown(fc, u);
          scraps.push({ url: u, ...s });
          console.log(`  scraped ${u} (${s.markdown.length} chars, ${s.source})`);
          await sleep(400);
        } catch (e) {
          console.warn(`  scrape fail ${u}: ${e.message}`);
        }
      }
      if (!scraps.length) {
        // Mark verified so dead DNS / blocked sites don't block every batch.
        if (!dry) {
          const today = new Date().toISOString().slice(0, 10);
          await sb
            .from("tools")
            .update({ last_verified_at: today, updated_at: new Date().toISOString() })
            .eq("id", tool.id);
        }
        throw new Error("all scrapes failed");
      }

      const bundled = scraps
        .map((s) => `## SOURCE ${s.url}\n# ${s.title || ""}\n\n${s.markdown}`)
        .join("\n\n---\n\n")
        .slice(0, 32000);

      writeFileSync(join(OUT_DIR, `${tool.slug}.md`), bundled);

      const extracted = await extractWithLlm(env, {
        name: tool.name,
        url: tool.official_url,
        markdown: bundled,
        existing: tool,
      });
      writeFileSync(
        join(OUT_DIR, `${tool.slug}.json`),
        JSON.stringify(extracted, null, 2),
      );

      const today = new Date().toISOString().slice(0, 10);
      const row = {
        summary: pickBetterText(tool.summary, extracted.summary, 40) || tool.summary,
        description:
          pickBetterText(tool.description, extracted.description, 120) ||
          tool.description,
        pricing_model: extracted.pricing_model || tool.pricing_model,
        price_display:
          extracted.price_display &&
          !/^to verify$/i.test(extracted.price_display)
            ? extracted.price_display
            : tool.price_display,
        api_available:
          typeof extracted.api_available === "boolean"
            ? extracted.api_available
            : tool.api_available,
        open_source:
          typeof extracted.open_source === "boolean"
            ? extracted.open_source
            : tool.open_source,
        local_available:
          typeof extracted.local_available === "boolean"
            ? extracted.local_available
            : tool.local_available,
        keywords: mergeArrays(tool.keywords, extracted.keywords, 16),
        strengths: mergeArrays(tool.strengths, extracted.strengths, 8),
        limits: mergeArrays(tool.limits, extracted.limits, 6),
        audience: mergeArrays(tool.audience, extracted.audience, 6),
        last_verified_at: today,
        updated_at: new Date().toISOString(),
      };

      // platforms column may not exist as array on tools — skip if unknown
      console.log(
        `  → summary ${row.summary?.length || 0}c · kw ${(row.keywords || []).length} · strengths ${(row.strengths || []).length} · limits ${(row.limits || []).length}`,
      );

      if (!dry) {
        const { error: upErr } = await sb.from("tools").update(row).eq("id", tool.id);
        if (upErr) throw upErr;

        for (const s of scraps) {
          try {
            const sid = await ensureSource(sb, s.url);
            await sb.from("tool_sources").upsert({
              tool_id: tool.id,
              source_id: sid,
              claim_key: s.url.includes("/pricing") ? "pricing" : "general",
              verified_at: today,
            });
          } catch (e) {
            console.warn(`  source link warn: ${e.message}`);
          }
        }

        await embedOne(env, sb, { ...tool, ...row });
        console.log(`  updated + embedded`);
      } else {
        console.log(`  dry-run (not written)`);
      }
      ok++;
      await sleep(600);
    } catch (e) {
      fail++;
      console.error(`  ERROR: ${e.message}`);
    }
  }

  console.log(`\nDone. ok=${ok} fail=${fail} · dumps in tmp-enrich/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
