/**
 * Hot / missing AI tools batch (Nov 2026).
 * Skips existing slug or official_url.
 * Usage: node scripts/seed_hot_tools_nov2026.mjs
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

const TOOLS = [
  {
    name: "Higgsfield AI",
    slug: "higgsfield",
    publisher: "Higgsfield",
    url: "https://higgsfield.ai",
    summary: "AI video studio for clips, ads, animations, and camera effects with consistent characters.",
    description:
      "Higgsfield generates short-form and marketing video from text or image prompts, with motion, camera, and character consistency tools aimed at creators and growth teams.",
    pricing_model: "Freemium",
    price_display: "Free / Paid plans",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["video", "ads", "animation", "camera", "ugc"],
    strengths: ["Creator-friendly video generation", "Character consistency"],
    limits: ["Quality varies by prompt and plan"],
    audience: ["Creators", "Marketers"],
    categories: ["video-generation", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Luma Dream Machine",
    slug: "luma-dream-machine",
    publisher: "Luma AI",
    url: "https://lumalabs.ai/dream-machine",
    summary: "Luma AI video model for text-to-video and image-to-video generation.",
    description:
      "Dream Machine creates short AI videos from text or images, used for concepting, social clips, and creative exploration.",
    pricing_model: "Freemium",
    price_display: "Free tier / Paid",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["video", "luma", "dream machine", "image-to-video"],
    strengths: ["Strong motion quality", "API access"],
    limits: ["Clip length and rate limits on free tiers"],
    audience: ["Creators", "Developers"],
    categories: ["video-generation"],
    type: "tool",
    platforms: ["web", "api"],
  },
  {
    name: "FLUX",
    slug: "flux-ai",
    publisher: "Black Forest Labs",
    url: "https://blackforestlabs.ai",
    summary: "High-quality text-to-image models from Black Forest Labs (FLUX family).",
    description:
      "FLUX models are widely used for photoreal and design-oriented image generation via partners and APIs such as fal, Replicate, and Together.",
    pricing_model: "Freemium",
    price_display: "Via API partners",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["image", "flux", "diffusion", "black forest labs"],
    strengths: ["Strong prompt adherence", "Open weights variants"],
    limits: ["Hosting and speed depend on provider"],
    audience: ["Creators", "Developers"],
    categories: ["image-generation"],
    type: "model",
    platforms: ["api", "self-hosted"],
  },
  {
    name: "DeepSeek",
    slug: "deepseek",
    publisher: "DeepSeek",
    url: "https://www.deepseek.com",
    summary: "High-capability LLM chat and coding models with competitive pricing and open releases.",
    description:
      "DeepSeek offers chat and reasoning models popular for coding and general assistants, with API access and notable open-weight releases.",
    pricing_model: "Freemium",
    price_display: "Free chat / Paid API",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["llm", "coding", "chat", "china", "open weights"],
    strengths: ["Strong coding", "Aggressive pricing"],
    limits: ["Availability and policy vary by region"],
    audience: ["Developers", "Researchers"],
    categories: ["ai-assistants", "coding-development"],
    type: "model",
    platforms: ["web", "api"],
  },
  {
    name: "Pika",
    slug: "pika-labs",
    publisher: "Pika",
    url: "https://pika.art",
    summary: "AI video generation platform for short creative clips from text and images.",
    description:
      "Pika lets creators generate and edit short videos with AI, including effects and iterative refinements for social and concept work.",
    pricing_model: "Freemium",
    price_display: "Credits / Subscription",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["video", "pika", "shorts", "effects"],
    strengths: ["Creative effects", "Fast ideation"],
    limits: ["Credit-based usage"],
    audience: ["Creators"],
    categories: ["video-generation"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "OpusClip",
    slug: "opusclip",
    publisher: "OpusClip",
    url: "https://www.opus.pro",
    summary: "AI clipper that turns long videos into viral short-form clips with captions.",
    description:
      "OpusClip detects highlight moments, reframes for vertical video, and adds captions for YouTube Shorts, TikTok, and Reels workflows.",
    pricing_model: "Freemium",
    price_display: "Free / Pro",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["shorts", "clips", "captions", "repurposing"],
    strengths: ["Highlight detection", "Captioning"],
    limits: ["Best on spoken long-form content"],
    audience: ["Creators", "Marketers"],
    categories: ["video-generation", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Qwen Chat",
    slug: "qwen-chat",
    publisher: "Alibaba Cloud",
    url: "https://chat.qwen.ai",
    summary: "Alibaba’s Qwen assistant for chat, coding, and multimodal tasks.",
    description:
      "Qwen Chat provides access to Alibaba’s Qwen models for conversation, coding help, and multimodal understanding, with API options via Alibaba Cloud.",
    pricing_model: "Freemium",
    price_display: "Free / Cloud API",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["qwen", "alibaba", "llm", "multimodal"],
    strengths: ["Strong open models", "Multimodal variants"],
    limits: ["Region and account requirements"],
    audience: ["Developers", "Researchers"],
    categories: ["ai-assistants", "coding-development"],
    type: "tool",
    platforms: ["web", "api"],
  },
  {
    name: "ChatLLM",
    slug: "chatllm-teams",
    publisher: "Abacus.AI",
    url: "https://chatllm.abacus.ai",
    summary: "Multi-model chat workspace that routes across leading LLMs in one subscription.",
    description:
      "ChatLLM Teams gives access to multiple frontier models in one interface for chat, docs, and team workflows.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["multi-model", "chat", "abacus", "teams"],
    strengths: ["Model switching", "Team plans"],
    limits: ["Paid product"],
    audience: ["Professionals", "Teams"],
    categories: ["ai-assistants", "productivity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Dia Browser",
    slug: "dia-browser",
    publisher: "The Browser Company",
    url: "https://www.diabrowser.com",
    summary: "AI-native browser from The Browser Company focused on agentic browsing.",
    description:
      "Dia is an AI-first browser experience designed around assistants and agent workflows rather than a classic tab-only browser.",
    pricing_model: "Freemium",
    price_display: "Invite / plans TBD",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["browser", "agent", "arc", "dia"],
    strengths: ["AI-native browsing concept"],
    limits: ["Access may be invite-limited"],
    audience: ["Power users", "Professionals"],
    categories: ["productivity", "ai-assistants"],
    type: "tool",
    platforms: ["web", "macos"],
  },
  {
    name: "OpenRouter",
    slug: "openrouter",
    publisher: "OpenRouter",
    url: "https://openrouter.ai",
    summary: "Unified API gateway to hundreds of LLMs with one key and pay-as-you-go pricing.",
    description:
      "OpenRouter routes requests to many model providers through a single API, useful for apps that want model choice without managing every vendor SDK.",
    pricing_model: "Paid",
    price_display: "Pay per token",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["gateway", "llm", "api", "routing"],
    strengths: ["Huge model catalog", "Simple billing"],
    limits: ["Depends on upstream providers"],
    audience: ["Developers"],
    categories: ["coding-development", "ai-assistants"],
    type: "api",
    platforms: ["api"],
  },
  {
    name: "LM Studio",
    slug: "lm-studio",
    publisher: "LM Studio",
    url: "https://lmstudio.ai",
    summary: "Desktop app to download and run local LLMs with a ChatGPT-like UI and local server.",
    description:
      "LM Studio helps users run open models locally, chat with them, and expose an OpenAI-compatible local endpoint for apps.",
    pricing_model: "Free",
    price_display: "Free",
    open_source: false,
    api_available: true,
    local_available: true,
    keywords: ["local", "llm", "desktop", "offline"],
    strengths: ["Easy local setup", "Local API server"],
    limits: ["Needs capable hardware"],
    audience: ["Developers", "Privacy-focused users"],
    categories: ["ai-assistants", "coding-development"],
    type: "tool",
    platforms: ["windows", "macos", "linux"],
  },
  {
    name: "Jan",
    slug: "jan-ai",
    publisher: "Jan",
    url: "https://jan.ai",
    summary: "Open-source desktop ChatGPT alternative for running local and remote models.",
    description:
      "Jan is an open-source AI desktop client for chatting with local models or remote providers while keeping control of data and setup.",
    pricing_model: "Free",
    price_display: "Free / Open source",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["local", "open source", "desktop", "offline"],
    strengths: ["Open source", "Local-first"],
    limits: ["Hardware dependent"],
    audience: ["Developers", "Privacy-focused users"],
    categories: ["ai-assistants"],
    type: "tool",
    platforms: ["windows", "macos", "linux"],
  },
  {
    name: "Dify",
    slug: "dify",
    publisher: "Dify",
    url: "https://dify.ai",
    summary: "Open-source LLM app platform for RAG, agents, and workflow apps.",
    description:
      "Dify provides a visual builder and APIs to ship AI apps with retrieval, agents, and observability, self-hosted or cloud.",
    pricing_model: "Freemium",
    price_display: "Cloud / Self-host",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["rag", "agents", "workflow", "llmops"],
    strengths: ["Visual builder", "Self-host option"],
    limits: ["Ops overhead if self-hosted"],
    audience: ["Developers", "Teams"],
    categories: ["automation-agents", "coding-development"],
    type: "platform",
    platforms: ["web", "self-hosted", "api"],
  },
  {
    name: "Flowise",
    slug: "flowise",
    publisher: "FlowiseAI",
    url: "https://flowiseai.com",
    summary: "Low-code builder for LangChain/LlamaIndex-style LLM flows.",
    description:
      "Flowise lets teams drag-and-drop LLM chains, tools, and memory for chatbots and agents, with self-hosting options.",
    pricing_model: "Freemium",
    price_display: "Open source / Cloud",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["langchain", "low-code", "agents", "flows"],
    strengths: ["Visual flows", "Open source"],
    limits: ["Complex apps need engineering"],
    audience: ["Developers", "Builders"],
    categories: ["automation-agents", "coding-development"],
    type: "tool",
    platforms: ["web", "self-hosted"],
  },
  {
    name: "CrewAI",
    slug: "crewai",
    publisher: "CrewAI",
    url: "https://www.crewai.com",
    summary: "Framework for multi-agent crews that collaborate on tasks.",
    description:
      "CrewAI helps developers define roles, tools, and workflows for multi-agent systems that research, write, and execute multi-step jobs.",
    pricing_model: "Freemium",
    price_display: "Open source / Enterprise",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["agents", "multi-agent", "orchestration"],
    strengths: ["Role-based crews", "Popular agent stack"],
    limits: ["Needs careful eval and guardrails"],
    audience: ["Developers"],
    categories: ["automation-agents", "coding-development"],
    type: "platform",
    platforms: ["api", "self-hosted"],
  },
  {
    name: "Langfuse",
    slug: "langfuse",
    publisher: "Langfuse",
    url: "https://langfuse.com",
    summary: "Open-source LLM observability for traces, evals, and prompt management.",
    description:
      "Langfuse captures traces, scores, and prompt versions so teams can debug and improve LLM apps in production.",
    pricing_model: "Freemium",
    price_display: "Cloud / Self-host",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["observability", "evals", "tracing", "llmops"],
    strengths: ["Open source", "Strong tracing UX"],
    limits: ["Needs instrumentation"],
    audience: ["Developers", "ML teams"],
    categories: ["coding-development", "data-analytics"],
    type: "platform",
    platforms: ["web", "self-hosted", "api"],
  },
  {
    name: "Helicone",
    slug: "helicone",
    publisher: "Helicone",
    url: "https://www.helicone.ai",
    summary: "LLM gateway and observability for logging, caching, and cost control.",
    description:
      "Helicone sits in front of LLM APIs to log requests, manage prompts, cache responses, and monitor spend.",
    pricing_model: "Freemium",
    price_display: "Free tier / Paid",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["gateway", "logging", "caching", "costs"],
    strengths: ["Easy proxy setup", "Cost visibility"],
    limits: ["Extra hop in the request path"],
    audience: ["Developers"],
    categories: ["coding-development", "data-analytics"],
    type: "platform",
    platforms: ["api", "web"],
  },
  {
    name: "Voyage AI",
    slug: "voyage-ai",
    publisher: "Voyage AI",
    url: "https://www.voyageai.com",
    summary: "Embedding and reranker models optimized for retrieval quality.",
    description:
      "Voyage AI provides embedding and reranking APIs used to improve RAG search quality across documents and code.",
    pricing_model: "Paid",
    price_display: "API usage",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["embeddings", "rerank", "rag", "retrieval"],
    strengths: ["Strong retrieval benchmarks", "Simple API"],
    limits: ["Paid API"],
    audience: ["Developers"],
    categories: ["coding-development", "research-education"],
    type: "api",
    platforms: ["api"],
  },
  {
    name: "Jina AI",
    slug: "jina-ai",
    publisher: "Jina AI",
    url: "https://jina.ai",
    summary: "Multimodal embeddings, rerankers, and reader APIs for search and RAG.",
    description:
      "Jina AI offers embedding models, rerankers, and web reader APIs to build neural search and RAG pipelines.",
    pricing_model: "Freemium",
    price_display: "Free tier / Paid",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["embeddings", "search", "reader", "multimodal"],
    strengths: ["Multimodal search stack", "Open models"],
    limits: ["Needs tuning for domain data"],
    audience: ["Developers"],
    categories: ["coding-development", "research-education"],
    type: "api",
    platforms: ["api", "self-hosted"],
  },
  {
    name: "Qdrant",
    slug: "qdrant",
    publisher: "Qdrant",
    url: "https://qdrant.tech",
    summary: "Open-source vector database for semantic search and RAG.",
    description:
      "Qdrant stores and searches embeddings with filters, payloads, and cloud or self-hosted deployment options.",
    pricing_model: "Freemium",
    price_display: "Open source / Cloud",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["vector db", "rag", "search", "embeddings"],
    strengths: ["Filtering + payloads", "Self-host friendly"],
    limits: ["Needs embedding pipeline"],
    audience: ["Developers"],
    categories: ["coding-development", "data-analytics"],
    type: "platform",
    platforms: ["api", "self-hosted", "cloud"],
  },
  {
    name: "Weaviate",
    slug: "weaviate",
    publisher: "Weaviate",
    url: "https://weaviate.io",
    summary: "AI-native vector database with hybrid search and modules.",
    description:
      "Weaviate combines vector and keyword search with modules for embeddings, used heavily in RAG and semantic apps.",
    pricing_model: "Freemium",
    price_display: "Open source / Cloud",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["vector db", "hybrid search", "rag"],
    strengths: ["Hybrid search", "Ecosystem modules"],
    limits: ["Ops complexity at scale"],
    audience: ["Developers"],
    categories: ["coding-development", "data-analytics"],
    type: "platform",
    platforms: ["api", "self-hosted", "cloud"],
  },
  {
    name: "Pinecone",
    slug: "pinecone",
    publisher: "Pinecone",
    url: "https://www.pinecone.io",
    summary: "Managed vector database popular for production RAG and semantic search.",
    description:
      "Pinecone provides a fully managed vector index with namespaces, metadata filters, and SDKs for AI applications.",
    pricing_model: "Freemium",
    price_display: "Free tier / Paid",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["vector db", "rag", "managed", "search"],
    strengths: ["Managed reliability", "Simple DX"],
    limits: ["Vendor lock-in vs self-host DBs"],
    audience: ["Developers", "Teams"],
    categories: ["coding-development", "data-analytics"],
    type: "platform",
    platforms: ["api", "cloud"],
  },
  {
    name: "Hailuo AI",
    slug: "hailuo-ai",
    publisher: "MiniMax",
    url: "https://hailuoai.video",
    summary: "MiniMax video generation product for cinematic AI clips.",
    description:
      "Hailuo focuses on AI video generation with cinematic motion, used for creative concepting and short-form content.",
    pricing_model: "Freemium",
    price_display: "Credits",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["video", "minimax", "hailuo", "cinematic"],
    strengths: ["Cinematic motion", "Creator adoption"],
    limits: ["Credit limits"],
    audience: ["Creators"],
    categories: ["video-generation"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Vidu",
    slug: "vidu-ai",
    publisher: "Shengshu Technology",
    url: "https://www.vidu.com",
    summary: "AI video platform for text-to-video and reference-driven generation.",
    description:
      "Vidu generates videos from text and references, aimed at creators who need controllable characters and scenes.",
    pricing_model: "Freemium",
    price_display: "Credits / Plans",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["video", "vidu", "reference", "china"],
    strengths: ["Reference control", "Growing model quality"],
    limits: ["Access and pricing vary by region"],
    audience: ["Creators"],
    categories: ["video-generation"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Recraft",
    slug: "recraft",
    publisher: "Recraft",
    url: "https://www.recraft.ai",
    summary: "AI design tool for brand-consistent vectors, icons, and illustrations.",
    description:
      "Recraft helps designers generate and edit brand-ready graphics with strong style control for icons, illustrations, and marketing assets.",
    pricing_model: "Freemium",
    price_display: "Free / Pro",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["design", "vector", "icons", "brand"],
    strengths: ["Style consistency", "Designer-oriented"],
    limits: ["Best for 2D design workflows"],
    audience: ["Designers", "Marketers"],
    categories: ["design-creativity", "image-generation"],
    type: "tool",
    platforms: ["web", "api"],
  },
  {
    name: "Ideogram",
    slug: "ideogram",
    publisher: "Ideogram",
    url: "https://ideogram.ai",
    summary: "Image generator known for unusually good text rendering inside images.",
    description:
      "Ideogram is popular for posters, logos, and social graphics where readable text in the image matters.",
    pricing_model: "Freemium",
    price_display: "Free / Paid",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["image", "text-in-image", "posters", "logos"],
    strengths: ["Text rendering", "Design prompts"],
    limits: ["Credits on free tier"],
    audience: ["Creators", "Marketers"],
    categories: ["image-generation", "design-creativity"],
    type: "tool",
    platforms: ["web", "api"],
  },
  {
    name: "Cloudflare Workers AI",
    slug: "cloudflare-workers-ai",
    publisher: "Cloudflare",
    url: "https://developers.cloudflare.com/workers-ai/",
    summary: "Run inference for LLMs and media models at the edge on Cloudflare.",
    description:
      "Workers AI lets developers call models from Cloudflare’s network for low-latency inference inside Workers and AI Gateway setups.",
    pricing_model: "Paid",
    price_display: "Usage-based",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["edge", "inference", "workers", "llm"],
    strengths: ["Edge latency", "Cloudflare ecosystem"],
    limits: ["Model selection constrained to catalog"],
    audience: ["Developers"],
    categories: ["coding-development"],
    type: "platform",
    platforms: ["api", "cloud"],
  },
  {
    name: "Google AI Studio",
    slug: "google-ai-studio",
    publisher: "Google",
    url: "https://aistudio.google.com",
    summary: "Google’s playground and key console for Gemini models and prompting.",
    description:
      "AI Studio is where developers prototype Gemini prompts, tune settings, and obtain API keys for Gemini apps.",
    pricing_model: "Freemium",
    price_display: "Free tier / Paid API",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["gemini", "playground", "api", "prompting"],
    strengths: ["Fast Gemini prototyping", "Direct API path"],
    limits: ["Quotas on free tier"],
    audience: ["Developers"],
    categories: ["coding-development", "ai-assistants"],
    type: "platform",
    platforms: ["web", "api"],
  },
  {
    name: "Vercel AI SDK",
    slug: "vercel-ai-sdk",
    publisher: "Vercel",
    url: "https://sdk.vercel.ai",
    summary: "TypeScript toolkit for streaming AI UIs across model providers.",
    description:
      "The Vercel AI SDK helps build chat and generative UIs with streaming, tool calling, and provider adapters for popular LLM APIs.",
    pricing_model: "Free",
    price_display: "Open source",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["sdk", "streaming", "typescript", "chat ui"],
    strengths: ["Great DX for AI UIs", "Multi-provider"],
    limits: ["You still pay model providers"],
    audience: ["Developers"],
    categories: ["coding-development"],
    type: "api",
    platforms: ["api"],
  },
  {
    name: "AnythingLLM",
    slug: "anythingllm",
    publisher: "Mintplex Labs",
    url: "https://anythingllm.com",
    summary: "All-in-one private RAG chat app for docs, with local or cloud models.",
    description:
      "AnythingLLM lets teams chat with documents using local or remote LLMs, with workspaces, agents, and desktop/self-host options.",
    pricing_model: "Freemium",
    price_display: "Free / Desktop / Hosted",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["rag", "documents", "local", "chat"],
    strengths: ["Private doc chat", "Flexible model backends"],
    limits: ["Setup quality depends on embeddings/models"],
    audience: ["Teams", "Privacy-focused users"],
    categories: ["productivity", "research-education"],
    type: "tool",
    platforms: ["web", "windows", "macos", "linux", "self-hosted"],
  },
];

const PLATFORM_ALIASES = {
  chrome: "web",
  docker: "self-hosted",
  cloud: "web",
  macos: "macos",
  windows: "windows",
  linux: "linux",
};

async function ensurePublisher(sb, name) {
  const { data: existing } = await sb.from("publishers").select("id").eq("name", name).maybeSingle();
  if (existing?.id) return existing.id;
  const { data, error } = await sb.from("publishers").insert({ name }).select("id").single();
  if (error) throw error;
  return data.id;
}

async function ensureSource(sb, url) {
  const { data: existing } = await sb.from("sources").select("id").eq("url", url).maybeSingle();
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
  const { data, error } = await sb.from(table).select("id").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function idByKey(sb, table, key) {
  const { data, error } = await sb.from(table).select("id").eq("key", key).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function upsertTool(sb, tool) {
  const { data: bySlug } = await sb.from("tools").select("id").eq("slug", tool.slug).maybeSingle();
  if (bySlug?.id) {
    console.log(`[skip] slug ${tool.slug}`);
    return "skipped";
  }
  const { data: byUrl } = await sb
    .from("tools")
    .select("id, slug")
    .eq("official_url", tool.url)
    .maybeSingle();
  if (byUrl?.id) {
    console.log(`[skip] url -> ${byUrl.slug}`);
    return "skipped";
  }

  const publisherId = await ensurePublisher(sb, tool.publisher);
  const sourceId = await ensureSource(sb, tool.url);

  const { data: inserted, error } = await sb
    .from("tools")
    .insert({
      name: tool.name,
      slug: tool.slug,
      publisher_id: publisherId,
      summary: tool.summary,
      description: tool.description,
      official_url: tool.url,
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
      status: "pending_review",
      last_verified_at: new Date().toISOString().slice(0, 10),
    })
    .select("id")
    .single();
  if (error) throw error;

  const toolId = inserted.id;
  for (let i = 0; i < tool.categories.length; i++) {
    const catId = await idBySlug(sb, "categories", tool.categories[i]);
    if (!catId) continue;
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

  for (const raw of tool.platforms) {
    const key = PLATFORM_ALIASES[raw] ?? raw;
    const platformId = await idByKey(sb, "platforms", key);
    if (!platformId) continue;
    await sb.from("tool_platforms").upsert({
      tool_id: toolId,
      platform_id: platformId,
      status: "available",
    });
  }

  await sb.from("tool_sources").upsert({
    tool_id: toolId,
    source_id: sourceId,
    claim_key: "general",
    verified_at: new Date().toISOString().slice(0, 10),
  });

  const { error: pubErr } = await sb
    .from("tools")
    .update({ status: "published", updated_at: new Date().toISOString() })
    .eq("id", toolId);
  if (pubErr) throw pubErr;

  console.log(`[tool] ${tool.slug}`);
  return "inserted";
}

async function main() {
  const env = {
    ...loadEnv(join(ROOT, ".env.production")),
    ...loadEnv(join(ROOT, ".env")),
  };
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    console.error("Missing Supabase URL or secret key");
    process.exit(1);
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let inserted = 0;
  let skipped = 0;
  let failed = 0;
  for (const tool of TOOLS) {
    try {
      const r = await upsertTool(sb, tool);
      if (r === "inserted") inserted += 1;
      else skipped += 1;
    } catch (err) {
      failed += 1;
      console.error(`[fail] ${tool.slug}:`, err.message || err);
    }
  }

  const { count: published } = await sb
    .from("tools")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  console.log(`[done] inserted=${inserted} skipped=${skipped} failed=${failed} published=${published}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
