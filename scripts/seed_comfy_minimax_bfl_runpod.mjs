/**
 * Enrich Comfy / MiniMax / Black Forest Labs (FLUX) / RunPod from official sites.
 * Usage: node scripts/seed_comfy_minimax_bfl_runpod.mjs
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

const TODAY = new Date().toISOString().slice(0, 10);

const TOOLS = [
  {
    slug: "comfyui",
    name: "Comfy",
    publisher: "Comfy Org",
    url: "https://comfy.org/",
    api_docs_url: "https://docs.comfy.org/",
    repository_url: "https://github.com/Comfy-Org/ComfyUI",
    summary:
      "Professional visual AI engine — node-based ComfyUI, Comfy Cloud, Agent, and one API for frontier image/video/3D/audio models.",
    description:
      "Comfy (Comfy Org) is the company and platform around ComfyUI: the open node-based canvas for image, video, 3D, and audio workflows. Products include Comfy Desktop, Comfy Cloud (run custom nodes/models in the browser with managed GPUs), Comfy Agent (describe a goal and it builds/runs workflows), Comfy API / Developer Platform, and Comfy Enterprise. One API can route frontier media models across providers. Comfy is also the official reseller of MiniMax commercial-use licenses for local MiniMax models. Open-source ComfyUI remains free; Cloud bills GPU time by the second (e.g. H100 ~$6.23/hr).",
    pricing_model: "Freemium",
    price_display: "Open source · Cloud GPU by the second",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: [
      "comfy",
      "comfyui",
      "comfy cloud",
      "nodes",
      "image",
      "video",
      "workflows",
      "stable diffusion",
    ],
    strengths: [
      "Deep node-level control of visual AI pipelines",
      "Cloud + Desktop + API + Agent under one org",
      "Huge community of custom nodes and workflows",
      "Official MiniMax commercial license reseller",
    ],
    limits: [
      "Node graphs have a learning curve for beginners",
      "Cloud GPU cost scales with heavy video/image jobs",
      "Local setups still need capable hardware / VRAM",
    ],
    audience: ["Creators", "VFX / ads teams", "Developers"],
    categories: ["image-generation", "video-generation", "design-creativity"],
    type: "platform",
    platforms: ["web", "windows", "macos", "linux", "self-hosted"],
    featureKeys: [
      "image_generation",
      "video_generation",
      "audio_speech",
      "api_access",
      "local_deploy",
      "agents_automation",
    ],
    plans: [
      { plan_name: "ComfyUI (open source)", price_amount: 0, billing_period: "custom", pricing_model: "Open source" },
      { plan_name: "Comfy Cloud (GPU time)", price_amount: null, billing_period: "usage", pricing_model: "Freemium" },
      { plan_name: "Enterprise", price_amount: null, billing_period: "custom", pricing_model: "Paid" },
    ],
    sources: [
      ["https://comfy.org/", "general"],
      ["https://comfy.org/pricing/", "pricing"],
      ["https://docs.comfy.org/", "api"],
    ],
  },
  {
    slug: "minimax",
    name: "MiniMax",
    publisher: "MiniMax",
    url: "https://www.minimax.io/",
    api_docs_url: "https://platform.minimax.io/docs/",
    repository_url: null,
    summary:
      "General AI lab for language, video (H3), image, speech, and music — open-weight models plus MiniMax Agent / Code / Design products.",
    description:
      "MiniMax is a general AI company shipping multimodal foundation models and AI-native products. Flagship lines include MiniMax M3.1 Flash (language), MiniMax H3 (video / multimodal), H3 Image, Speech 2.8, and Music 3.0. Products include MiniMax Agent, MiniMax Code, and MiniMax Design, with an open platform for developers (platform.minimax.io). Open-weight options exist for several models; API is pay-as-you-go (e.g. M3.1 Flash ~$0.15/$0.60 per MTok; H3 video billed per second by resolution). Official site: https://www.minimax.io/",
    pricing_model: "Freemium",
    price_display: "API usage · open weights available",
    open_source: false,
    api_available: true,
    local_available: true,
    keywords: [
      "minimax",
      "hailuo",
      "h3",
      "m3",
      "video",
      "speech",
      "music",
      "multimodal",
      "open weights",
    ],
    strengths: [
      "Strong multimodal stack (text, video, image, speech, music)",
      "Open-weight releases for several models",
      "Developer platform + consumer/agent products",
    ],
    limits: [
      "Video API cost scales with duration/resolution",
      "Local commercial rights may need a license (e.g. via Comfy)",
      "Docs and brand presence stronger in Asia than some Western stacks",
    ],
    audience: ["Developers", "Creators", "Enterprises"],
    categories: [
      "video-generation",
      "image-generation",
      "audio-music",
      "ai-assistants",
      "coding-development",
    ],
    type: "model",
    platforms: ["web", "api", "self-hosted"].filter(Boolean),
    platformsFixed: ["web", "self-hosted"],
    featureKeys: [
      "text_generation",
      "image_generation",
      "video_generation",
      "audio_speech",
      "api_access",
      "agents_automation",
      "multimodal",
    ],
    plans: [
      { plan_name: "Open Platform API", price_amount: null, billing_period: "usage", pricing_model: "Freemium" },
      { plan_name: "Open weights (local)", price_amount: 0, billing_period: "custom", pricing_model: "Freemium" },
    ],
    sources: [
      ["https://www.minimax.io/", "general"],
      ["https://platform.minimax.io/docs/pricing/overview", "pricing"],
      ["https://platform.minimax.io/docs/", "api"],
    ],
  },
  {
    slug: "flux",
    name: "Black Forest Labs (FLUX)",
    publisher: "Black Forest Labs",
    url: "https://bfl.ai/",
    api_docs_url: "https://docs.bfl.ai/",
    repository_url: null,
    summary:
      "Frontier AI lab behind FLUX 3 — multimodal image, video, audio, and action-prediction models via API, playground, and open weights.",
    description:
      "Black Forest Labs (bfl.ai) builds the FLUX family. FLUX 3 is positioned as one multimodal model for image, video (up to ~20s with native audio), audio, and action-prediction for robotics. Access via Playground, production API, open weights for some models (e.g. FLUX 3 Image Klein on consumer GPUs), and Enterprise. API pricing is usage-based with no seat fees — e.g. FLUX 3 Image from about $0.041/image at 768². SOC 2 and ISO 27001 mentioned for enterprise.",
    pricing_model: "Freemium",
    price_display: "API per image/video · open weights",
    open_source: false,
    api_available: true,
    local_available: true,
    keywords: [
      "flux",
      "flux 3",
      "black forest labs",
      "bfl",
      "image",
      "video",
      "text-to-image",
    ],
    strengths: [
      "Frontier image quality; FLUX 3 expands to video/audio",
      "API + playground + open-weight options",
      "Enterprise compliance (SOC 2 / ISO 27001)",
    ],
    limits: [
      "Top models are paid API or licensed weights",
      "Video generation cost/availability still evolving",
      "Open weights ≠ every FLUX 3 capability for free",
    ],
    audience: ["Creatives", "Developers", "Enterprises"],
    categories: ["image-generation", "video-generation", "design-creativity"],
    type: "model",
    platformsFixed: ["web", "self-hosted"],
    featureKeys: [
      "image_generation",
      "video_generation",
      "audio_speech",
      "api_access",
      "local_deploy",
      "multimodal",
    ],
    plans: [
      { plan_name: "Playground / experiment", price_amount: null, billing_period: "usage", pricing_model: "Freemium" },
      { plan_name: "API (pay per generation)", price_amount: null, billing_period: "usage", pricing_model: "Paid" },
      { plan_name: "Open weights", price_amount: 0, billing_period: "custom", pricing_model: "Freemium" },
      { plan_name: "Enterprise", price_amount: null, billing_period: "custom", pricing_model: "Paid" },
    ],
    sources: [
      ["https://bfl.ai/", "general"],
      ["https://bfl.ai/pricing", "pricing"],
      ["https://docs.bfl.ai/", "api"],
    ],
  },
  {
    slug: "runpod",
    name: "RunPod",
    publisher: "RunPod",
    url: "https://www.runpod.io/",
    api_docs_url: "https://docs.runpod.io/",
    repository_url: "https://github.com/runpod",
    summary:
      "AI developer cloud — GPU Pods, Serverless endpoints (scale-to-zero), Clusters, and Public Endpoints for training and inference.",
    description:
      "RunPod is an AI infrastructure cloud for experiment → train → deploy → scale. Pods spin up GPU environments (30+ SKUs, 31 regions) in under a minute; Serverless autoscales workers with FlashBoot cold starts (sub-200ms claims) and zero idle cost; Clusters support multi-GPU training; Public Endpoints expose pre-deployed models (image/video/audio/LLM) via API. SOC 2 Type II, HIPAA/GDPR options, Secure Cloud for isolation. Pricing is usage-based by GPU SKU (Serverless/Pods) plus per-request Public Endpoint rates.",
    pricing_model: "Paid",
    price_display: "GPU hourly · Serverless · Public Endpoints",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: [
      "runpod",
      "gpu cloud",
      "serverless",
      "pods",
      "inference",
      "fine-tuning",
      "h100",
    ],
    strengths: [
      "Pods + Serverless + Clusters in one account",
      "Scale-to-zero serverless with fast cold starts",
      "Broad GPU catalog and global regions",
      "Public Endpoints for instant model APIs",
    ],
    limits: [
      "Costs can spike on large continuous GPU use",
      "Spot/interruptible pods need fault-tolerant jobs",
      "Compliance features vary by region / plan",
    ],
    audience: ["ML engineers", "AI startups", "Researchers"],
    categories: ["coding-development", "data-analytics", "automation-agents"],
    type: "platform",
    platformsFixed: ["web"],
    featureKeys: ["api_access", "local_deploy", "agents_automation"],
    plans: [
      { plan_name: "GPU Pods", price_amount: null, billing_period: "usage", pricing_model: "Paid" },
      { plan_name: "Serverless", price_amount: null, billing_period: "usage", pricing_model: "Paid" },
      { plan_name: "Public Endpoints", price_amount: null, billing_period: "usage", pricing_model: "Paid" },
      { plan_name: "Enterprise", price_amount: null, billing_period: "custom", pricing_model: "Paid" },
    ],
    sources: [
      ["https://www.runpod.io/", "general"],
      ["https://www.runpod.io/pricing", "pricing"],
      ["https://docs.runpod.io/", "api"],
    ],
  },
];

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
  if (!bySlug?.id) throw new Error(`missing tool ${tool.slug}`);

  const publisherId = await ensurePublisher(sb, tool.publisher);
  const platforms = tool.platformsFixed || tool.platforms || ["web"];

  const row = {
    name: tool.name,
    publisher_id: publisherId,
    summary: tool.summary,
    description: tool.description,
    official_url: tool.url,
    api_docs_url: tool.api_docs_url,
    repository_url: tool.repository_url,
    logo_url: logoFor(tool.url),
    pricing_model: tool.pricing_model,
    price_display: tool.price_display,
    open_source: tool.open_source,
    api_available: tool.api_available,
    local_available: tool.local_available,
    keywords: tool.keywords,
    strengths: tool.strengths,
    limits: tool.limits,
    audience: tool.audience,
    last_verified_at: TODAY,
    updated_at: new Date().toISOString(),
    status: "published",
  };

  const { error } = await sb.from("tools").update(row).eq("id", bySlug.id);
  if (error) throw error;
  const toolId = bySlug.id;

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

  for (const key of platforms) {
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

  await sb.from("pricing_plans").delete().eq("tool_id", toolId);
  if (tool.plans?.length) {
    await sb.from("pricing_plans").insert(
      tool.plans.map((p) => ({
        tool_id: toolId,
        plan_name: p.plan_name,
        price_amount: p.price_amount,
        currency: "USD",
        billing_period: p.billing_period,
        pricing_model: p.pricing_model,
        verified_at: TODAY,
      })),
    );
  }

  for (const [url, claim] of tool.sources ?? []) {
    const sourceId = await ensureSource(sb, url);
    await sb.from("tool_sources").upsert({
      tool_id: toolId,
      source_id: sourceId,
      claim_key: claim,
      verified_at: TODAY,
    });
  }

  console.log(`[ok] /tools/${tool.slug}`);
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

  for (const tool of TOOLS) {
    try {
      await upsertTool(sb, tool);
    } catch (err) {
      console.error(`[fail] ${tool.slug}:`, err.message || err);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
