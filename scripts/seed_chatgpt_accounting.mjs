/**
 * Catalog + Latest: ChatGPT for Accounting (finance)
 * Usage: node scripts/seed_chatgpt_accounting.mjs
 * Source: https://openai.com/business/solutions/accounting/
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

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

function domainFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}

function logoFor(url) {
  const domain = domainFromUrl(url);
  return domain
    ? `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(domain)}`
    : null;
}

const TOOL = {
  name: "ChatGPT for Accounting",
  slug: "chatgpt-accounting",
  publisher: "OpenAI",
  url: "https://openai.com/business/solutions/accounting/",
  summary:
    "Close your books with less manual work — ChatGPT for invoice processing, reconciliation, and reporting across QuickBooks, Xero, NetSuite, and more.",
  description:
    "ChatGPT for Accounting helps accounting teams close the books with less manual work. Delegate invoice processing, bank reconciliation, and month-end reporting to ChatGPT across tools you already use. An Accounting plugin adds guided workflows for coding, reconciliation, and reporting; computer use can help inside apps without dedicated APIs. Connectors / partners include Intuit QuickBooks, Xero, BILL, FreshBooks, NetSuite, QuickStart, Rillet, and Campfire. Draft entries from invoices and receipts, gather records from email and apps, flag duplicates or missing info for review, and reuse monthly templates as skills. Designed for ChatGPT Business and Enterprise — business data is not used to train OpenAI models by default; admins control connected apps and humans approve final entries.",
  pricing_model: "Paid",
  price_display: "Via ChatGPT Business / Enterprise",
  open_source: false,
  api_available: false,
  local_available: false,
  keywords: [
    "chatgpt accounting",
    "bookkeeping",
    "reconciliation",
    "invoicing",
    "quickbooks",
    "xero",
    "netsuite",
    "month-end close",
    "openai business",
  ],
  strengths: [
    "Works with QuickBooks, Xero, BILL, FreshBooks, NetSuite, and more",
    "Accounting plugin + computer use for invoice, recon, and reporting workflows",
    "Reusable monthly skills / templates with human review before posting",
  ],
  limits: [
    "Requires ChatGPT Business or Enterprise for business data controls",
    "Humans must review suggested coding and entries before approval",
    "Connected-app access depends on workspace admin settings",
  ],
  audience: [
    "Accountants",
    "Bookkeepers",
    "Controllers / FP&A",
    "Accounting firm partners",
  ],
  categories: ["finance", "finance-legal", "business-marketing"],
  type: "tool",
  platforms: ["web", "desktop"],
  featureKeys: ["agents_automation", "document_qa", "data_extraction"],
};

const NEWS = {
  title: "ChatGPT for Accounting: close the books with less manual work",
  slug: "chatgpt-for-accounting-openai",
  kind: "feature",
  published_at: "2026-11-18",
  solution_slug: TOOL.slug,
  source_url: TOOL.url,
  summary:
    "OpenAI’s ChatGPT for Accounting connects to QuickBooks, Xero, NetSuite, and more so teams can draft invoices, reconcile banks, and run month-end reporting with human review.",
  body: `## What it is
**ChatGPT for Accounting** is OpenAI’s business solution to **close the books with less manual work**. You can delegate invoice processing, reconciliation, and reporting to ChatGPT across existing accounting tools — so more time goes to advising the business.

## How it works
- **Plugins** connect ChatGPT to accounting tools and records
- The **Accounting plugin** guides invoice processing, reconciliation, and reporting
- **Computer use** can help in apps that don’t expose a full API
- Example flows: customer invoicing, month-end reporting, bank reconciliation

### Connected tools (examples)
Intuit QuickBooks · Xero · BILL · FreshBooks · NetSuite · QuickStart · Rillet · Campfire

## Everyday tasks
- Cut manual entry: draft entries from invoices/receipts with suggested account coding
- Gather records from email, files, and accounting apps
- Error checks: flag duplicates, missing info, unexplained differences for review
- Reuse monthly templates, instructions, and review checks as **skills**

## Privacy & control
- ChatGPT **Business / Enterprise** data is not used to train OpenAI models by default
- Admins choose which apps are enabled; ChatGPT respects each user’s app permissions
- You review supporting records and suggested coding before approving

## How to start
1. Open [ChatGPT for Accounting](https://openai.com/business/solutions/accounting/)
2. Set up the desktop app and add the Accounting plugin
3. Connect your ledger apps and try a known task (invoice, recon, or month-end)

## Sources
- [ChatGPT for Accounting | OpenAI](https://openai.com/business/solutions/accounting/)`,
};

async function ensurePublisher(sb, name) {
  const { data: existing } = await sb
    .from("publishers")
    .select("id")
    .eq("name", name)
    .maybeSingle();
  if (existing?.id) return existing.id;
  const { data, error } = await sb
    .from("publishers")
    .insert({ name })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function ensureSource(sb, url) {
  const { data: existing } = await sb
    .from("sources")
    .select("id")
    .eq("url", url)
    .maybeSingle();
  if (existing?.id) return existing.id;
  const { data, error } = await sb
    .from("sources")
    .insert({
      url,
      source_type: "official",
      reliability_level: "A",
      publisher: domainFromUrl(url),
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function idBySlug(sb, table, slug) {
  const { data, error } = await sb
    .from(table)
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function idByKey(sb, table, key) {
  const { data, error } = await sb
    .from(table)
    .select("id")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function upsertTool(sb, tool) {
  const { data: bySlug } = await sb
    .from("tools")
    .select("id")
    .eq("slug", tool.slug)
    .maybeSingle();
  const publisherId = await ensurePublisher(sb, tool.publisher);
  const sourceId = await ensureSource(sb, tool.url);
  const today = new Date().toISOString().slice(0, 10);

  const row = {
    name: tool.name,
    slug: tool.slug,
    publisher_id: publisherId,
    summary: tool.summary,
    description: tool.description,
    official_url: tool.url,
    logo_url: logoFor("https://openai.com"),
    pricing_model: tool.pricing_model,
    price_display: tool.price_display,
    open_source: tool.open_source,
    api_available: tool.api_available,
    local_available: tool.local_available,
    keywords: tool.keywords,
    strengths: tool.strengths,
    limits: tool.limits,
    audience: tool.audience,
    last_verified_at: today,
    updated_at: new Date().toISOString(),
  };

  let toolId = bySlug?.id ?? null;
  if (toolId) {
    const { error } = await sb.from("tools").update(row).eq("id", toolId);
    if (error) throw error;
    console.log(`[update] ${tool.slug}`);
  } else {
    const { data: inserted, error } = await sb
      .from("tools")
      .insert({ ...row, status: "pending_review" })
      .select("id")
      .single();
    if (error) throw error;
    toolId = inserted.id;
    console.log(`[insert] ${tool.slug}`);
  }

  for (let i = 0; i < tool.categories.length; i++) {
    const catId = await idBySlug(sb, "categories", tool.categories[i]);
    if (!catId) {
      console.warn(`[skip cat] ${tool.categories[i]}`);
      continue;
    }
    await sb.from("tool_categories").upsert({
      tool_id: toolId,
      category_id: catId,
      is_primary: i === 0,
    });
  }

  const typeId = await idBySlug(sb, "solution_types", tool.type);
  if (typeId) {
    await sb.from("tool_types").upsert({
      tool_id: toolId,
      solution_type_id: typeId,
      is_primary: true,
    });
  }

  for (const key of tool.platforms) {
    const platformId = await idByKey(sb, "platforms", key);
    if (!platformId) {
      console.warn(`[skip platform] ${key}`);
      continue;
    }
    await sb.from("tool_platforms").upsert({
      tool_id: toolId,
      platform_id: platformId,
      status: "available",
    });
  }

  if (tool.featureKeys?.length) {
    const { data: feats } = await sb
      .from("features")
      .select("id,key")
      .in("key", tool.featureKeys);
    for (const f of feats ?? []) {
      await sb.from("tool_features").upsert({
        tool_id: toolId,
        feature_id: f.id,
        availability: "available",
      });
    }
  }

  await sb.from("tool_sources").upsert({
    tool_id: toolId,
    source_id: sourceId,
    claim_key: "general",
    verified_at: today,
  });

  const { error: pubErr } = await sb
    .from("tools")
    .update({ status: "published", updated_at: new Date().toISOString() })
    .eq("id", toolId);
  if (pubErr) throw pubErr;

  return toolId;
}

async function linkAlternative(sb, sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return;
  const { data: existing } = await sb
    .from("tool_relations")
    .select("source_tool_id")
    .eq("source_tool_id", sourceId)
    .eq("target_tool_id", targetId)
    .eq("relation_type", "alternative")
    .maybeSingle();
  if (existing) return;
  const { error } = await sb.from("tool_relations").insert({
    source_tool_id: sourceId,
    target_tool_id: targetId,
    relation_type: "alternative",
  });
  if (error) console.warn(`[rel] ${error.message}`);
}

async function upsertNews(sb, item, toolIds) {
  const { data: existing } = await sb
    .from("news_items")
    .select("id")
    .eq("slug", item.slug)
    .maybeSingle();

  const payload = {
    title: item.title,
    slug: item.slug,
    summary: item.summary,
    body: item.body,
    kind: item.kind,
    event_type: "product_advance",
    published_at: item.published_at,
    source_url: item.source_url,
    solution_slug: item.solution_slug,
    status: "published",
    updated_at: new Date().toISOString(),
  };

  let newsId = existing?.id;
  if (newsId) {
    const { error } = await sb.from("news_items").update(payload).eq("id", newsId);
    if (error) throw error;
    console.log(`[news update] ${item.slug}`);
  } else {
    const { data, error } = await sb
      .from("news_items")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    newsId = data.id;
    console.log(`[news insert] ${item.slug}`);
  }

  await sb.from("news_tool_links").delete().eq("news_item_id", newsId);
  const ids = toolIds.filter(Boolean);
  if (ids.length) {
    await sb.from("news_tool_links").insert(
      ids.map((tool_id) => ({ news_item_id: newsId, tool_id })),
    );
  }
}

async function main() {
  const env = {
    ...loadEnv(join(ROOT, ".env.production")),
    ...loadEnv(join(ROOT, ".env")),
  };
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing Supabase URL or secret key");
    process.exit(1);
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const toolId = await upsertTool(sb, TOOL);
  const chatgptId = await idBySlug(sb, "tools", "chatgpt");
  const enterpriseId = await idBySlug(sb, "tools", "chatgpt-enterprise");
  const teamId = await idBySlug(sb, "tools", "chatgpt-team");

  await linkAlternative(sb, toolId, chatgptId);
  await linkAlternative(sb, toolId, enterpriseId);
  await linkAlternative(sb, toolId, teamId);

  await upsertNews(sb, NEWS, [toolId, chatgptId, enterpriseId]);

  console.log(`done -> /tools/${TOOL.slug}`);
  console.log(`done -> /latest/${NEWS.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
