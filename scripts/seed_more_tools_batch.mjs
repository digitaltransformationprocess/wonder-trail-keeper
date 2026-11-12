/**
 * Another batch of popular AI tools missing from the catalog.
 * Usage: node scripts/seed_more_tools_batch.mjs
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
    name: "Sudowrite",
    slug: "sudowrite",
    publisher: "Sudowrite",
    url: "https://sudowrite.com",
    summary: "AI writing partner popular with novelists for prose, plot, and rewrite help.",
    description:
      "Sudowrite helps fiction writers brainstorm, describe scenes, rewrite passages, and expand drafts with AI tools tuned for storytelling.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["fiction", "novel", "writing", "storytelling"],
    strengths: ["Fiction-focused workflows", "Rewrite tools"],
    limits: ["Paid-only for serious use"],
    audience: ["Authors"],
    categories: ["writing-content"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "NovelAI",
    slug: "novelai",
    publisher: "Anlatan",
    url: "https://novelai.net",
    summary: "AI storytelling and anime-style image generation for creative writers.",
    description:
      "NovelAI provides story generation, lorebook memory, and optional image generation aimed at fiction and visual novel creators.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["fiction", "anime", "story", "images"],
    strengths: ["Story + image combo", "Creator community"],
    limits: ["Niche creative focus"],
    audience: ["Writers", "Creators"],
    categories: ["writing-content", "image-generation"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "LanguageTool",
    slug: "languagetool",
    publisher: "LanguageTooler",
    url: "https://languagetool.org",
    summary: "Popular multilingual grammar and style checker with AI rewrites.",
    description:
      "LanguageTool corrects grammar and style across many languages and offers AI-assisted paraphrasing for clearer writing.",
    pricing_model: "Freemium",
    price_display: "Free / Premium",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["grammar", "multilingual", "proofreading"],
    strengths: ["Many languages", "Open-source core"],
    limits: ["Advanced tone tools on Premium"],
    audience: ["Writers", "Students", "Professionals"],
    categories: ["writing-content"],
    type: "tool",
    platforms: ["web", "self-hosted"],
  },
  {
    name: "Hypotenuse AI",
    slug: "hypotenuse-ai",
    publisher: "Hypotenuse AI",
    url: "https://www.hypotenuse.ai",
    summary: "AI content platform for ecommerce product copy and SEO articles.",
    description:
      "Hypotenuse generates product descriptions, blog posts, and bulk ecommerce content with SEO-oriented workflows.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["ecommerce", "seo", "product-copy"],
    strengths: ["Bulk ecommerce content", "SEO features"],
    limits: ["Best for marketing copy, not fiction"],
    audience: ["Ecommerce", "Marketers"],
    categories: ["writing-content", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Simplified",
    slug: "simplified",
    publisher: "Simplified",
    url: "https://simplified.com",
    summary: "All-in-one AI suite for copy, design, video, and social publishing.",
    description:
      "Simplified combines writing, design, and short video tools so small teams can produce marketing assets in one workspace.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["all-in-one", "design", "copy", "social"],
    strengths: ["Many creative tools in one place", "SMB friendly"],
    limits: ["Depth per module varies"],
    audience: ["SMBs", "Marketers"],
    categories: ["business-marketing", "design-creativity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Relume",
    slug: "relume",
    publisher: "Relume",
    url: "https://www.relume.io",
    summary: "AI sitemap and Wireframe generator popular with Webflow freelancers.",
    description:
      "Relume turns a brief into sitemaps and wireframes that export cleanly into Webflow component libraries.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["webflow", "wireframe", "sitemap", "ui"],
    strengths: ["Webflow-oriented", "Fast site structure"],
    limits: ["Best inside Webflow workflows"],
    audience: ["Web designers", "Agencies"],
    categories: ["design-creativity", "coding-development"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Galileo AI",
    slug: "galileo-ai",
    publisher: "Galileo AI",
    url: "https://www.usegalileo.ai",
    summary: "Text-to-UI design tool for generating editable interface mockups.",
    description:
      "Galileo AI generates high-fidelity UI designs from prompts to accelerate product and design exploration.",
    pricing_model: "Paid",
    price_display: "Waitlist / plans",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["ui", "design", "mockups", "figma"],
    strengths: ["Fast UI concepts", "Designer-oriented output"],
    limits: ["Access/pricing can change"],
    audience: ["Designers", "Product teams"],
    categories: ["design-creativity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Dora AI",
    slug: "dora-ai",
    publisher: "Dora",
    url: "https://www.dora.run",
    summary: "AI website builder focused on animated, 3D-looking marketing sites.",
    description:
      "Dora helps create visually bold websites with AI generation and motion-oriented design controls.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["website-builder", "animation", "no-code"],
    strengths: ["Distinctive motion sites", "AI page generation"],
    limits: ["Less CMS depth than Webflow"],
    audience: ["Designers", "Startups"],
    categories: ["design-creativity", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Kittl",
    slug: "kittl",
    publisher: "Kittl",
    url: "https://www.kittl.com",
    summary: "Design platform for posters, logos, and merch with AI generation tools.",
    description:
      "Kittl combines templates and generative AI for graphic design projects like apparel, posters, and branding assets.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["graphic-design", "logos", "merch", "posters"],
    strengths: ["Strong template + AI mix", "Creator friendly"],
    limits: ["Print/legal checks still needed"],
    audience: ["Creators", "SMBs"],
    categories: ["design-creativity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Clipchamp",
    slug: "clipchamp",
    publisher: "Microsoft",
    url: "https://clipchamp.com",
    summary: "Microsoft’s free browser video editor with AI auto-compose and captions.",
    description:
      "Clipchamp is a mainstream video editor for Windows/web with stock media, AI features, and easy exports for social content.",
    pricing_model: "Freemium",
    price_display: "Free / Microsoft 365",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["video-editor", "captions", "microsoft"],
    strengths: ["Free & widely available", "Simple editing"],
    limits: ["Not a generative cinema model"],
    audience: ["Creators", "SMBs", "Students"],
    categories: ["video-generation", "productivity"],
    type: "tool",
    platforms: ["web", "windows"],
  },
  {
    name: "Submagic",
    slug: "submagic",
    publisher: "Submagic",
    url: "https://www.submagic.co",
    summary: "AI captions and viral effects for short-form social videos.",
    description:
      "Submagic automatically captions videos and adds emoji/highlight styles popular for TikTok, Reels, and Shorts.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["captions", "short-form", "tiktok", "reels"],
    strengths: ["Fast social captions", "Creator-oriented styles"],
    limits: ["Niche to short-form editing"],
    audience: ["Creators", "Marketers"],
    categories: ["video-generation", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Steve AI",
    slug: "steve-ai",
    publisher: "Steve AI",
    url: "https://www.steve.ai",
    summary: "Text-to-video maker for explainer and marketing animations.",
    description:
      "Steve AI turns scripts into animated or live-action style videos for ads, explainers, and social posts.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["text-to-video", "explainer", "animation"],
    strengths: ["Quick explainer videos", "Template library"],
    limits: ["Looks templated without editing"],
    audience: ["Marketers", "Educators"],
    categories: ["video-generation", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Elai.io",
    slug: "elai-io",
    publisher: "Elai",
    url: "https://elai.io",
    summary: "AI avatar video platform for training and corporate explainers.",
    description:
      "Elai generates presenter videos from text using AI avatars, popular for L&D and internal communications.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["avatar", "training", "video"],
    strengths: ["Business avatar videos", "API available"],
    limits: ["Avatar realism varies"],
    audience: ["L&D", "Enterprises"],
    categories: ["video-generation", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Tavus",
    slug: "tavus",
    publisher: "Tavus",
    url: "https://www.tavus.io",
    summary: "Personalized AI video platform for sales and customer messaging at scale.",
    description:
      "Tavus creates personalized video messages with digital replicas for outreach, onboarding, and support use cases.",
    pricing_model: "Paid",
    price_display: "Enterprise / usage",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["personalized-video", "sales", "replicas"],
    strengths: ["Personalization at scale", "API-first"],
    limits: ["Needs consent/compliance care"],
    audience: ["Sales", "Growth teams"],
    categories: ["video-generation", "business-marketing"],
    type: "api",
    platforms: ["web"],
  },
  {
    name: "NVIDIA Broadcast",
    slug: "nvidia-broadcast",
    publisher: "NVIDIA",
    url: "https://www.nvidia.com/broadcast-app/",
    summary: "AI audio/video effects for streamers—noise removal, virtual background, eye contact.",
    description:
      "NVIDIA Broadcast uses RTX GPUs to enhance mics and cameras with noise removal, room echo reduction, and green-screen alternatives.",
    pricing_model: "Free",
    price_display: "Free (NVIDIA GPU)",
    open_source: false,
    api_available: false,
    local_available: true,
    keywords: ["streaming", "noise-removal", "rtx", "webcam"],
    strengths: ["Excellent local AV cleanup", "Free for RTX users"],
    limits: ["Requires NVIDIA hardware"],
    audience: ["Streamers", "Remote workers"],
    categories: ["audio-music", "productivity"],
    type: "tool",
    platforms: ["windows"],
  },
  {
    name: "Resemble AI",
    slug: "resemble-ai",
    publisher: "Resemble AI",
    url: "https://www.resemble.ai",
    summary: "Voice cloning and generative speech platform for products and media.",
    description:
      "Resemble provides voice cloning, TTS, and detection tools for builders who need custom speech in apps or content pipelines.",
    pricing_model: "Paid",
    price_display: "Usage / plans",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["voice-clone", "tts", "speech"],
    strengths: ["Custom voices", "API + detection tools"],
    limits: ["Ethical/consent requirements"],
    audience: ["Developers", "Studios"],
    categories: ["audio-music", "coding-development"],
    type: "api",
    platforms: ["web"],
  },
  {
    name: "Cartesia",
    slug: "cartesia",
    publisher: "Cartesia",
    url: "https://cartesia.ai",
    summary: "Ultra-low-latency generative voice API for real-time agents.",
    description:
      "Cartesia focuses on fast, streaming text-to-speech models designed for interactive voice agents and applications.",
    pricing_model: "Paid",
    price_display: "Usage-based",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["tts", "realtime", "voice-agents"],
    strengths: ["Low latency", "Agent-friendly streaming"],
    limits: ["Newer ecosystem"],
    audience: ["Developers"],
    categories: ["audio-music", "coding-development"],
    type: "api",
    platforms: ["web", "python"],
  },
  {
    name: "Endel",
    slug: "endel",
    publisher: "Endel",
    url: "https://endel.io",
    summary: "Personalized AI soundscapes for focus, sleep, and relaxation.",
    description:
      "Endel generates adaptive audio environments based on time of day, heart rate, and context for productivity and wellness.",
    pricing_model: "Freemium",
    price_display: "Subscription",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["soundscape", "focus", "sleep", "wellness"],
    strengths: ["Adaptive audio", "Polished consumer apps"],
    limits: ["Not a music production suite"],
    audience: ["Consumers", "Professionals"],
    categories: ["audio-music", "productivity"],
    type: "tool",
    platforms: ["ios", "android", "web"],
  },
  {
    name: "Soundful",
    slug: "soundful",
    publisher: "Soundful",
    url: "https://soundful.com",
    summary: "AI music generator for creators needing royalty-friendly tracks.",
    description:
      "Soundful creates genre-based tracks for YouTube, games, and content creators with straightforward controls.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["music", "royalty-free", "youtube"],
    strengths: ["Easy track generation", "Creator licensing"],
    limits: ["Less flexible than DAWs"],
    audience: ["Creators"],
    categories: ["audio-music"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Akkio",
    slug: "akkio",
    publisher: "Akkio",
    url: "https://www.akkio.com",
    summary: "No-code AI platform for business forecasting and data predictions.",
    description:
      "Akkio lets business teams train and deploy predictive models without ML engineering, including chat-style analytics.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["no-code-ml", "forecasting", "analytics"],
    strengths: ["Business-user friendly", "Fast model deployment"],
    limits: ["Not for heavy custom ML research"],
    audience: ["Analysts", "SMBs"],
    categories: ["data-analytics", "business-marketing"],
    type: "platform",
    platforms: ["web"],
  },
  {
    name: "Obviously AI",
    slug: "obviously-ai",
    publisher: "Obviously AI",
    url: "https://www.obviously.ai",
    summary: "AutoML tool to build prediction models from spreadsheets in minutes.",
    description:
      "Obviously AI helps non-experts upload CSV data and launch prediction APIs with minimal machine-learning expertise.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["automl", "predictions", "csv"],
    strengths: ["Very fast AutoML path", "API export"],
    limits: ["Limited vs full data-science stacks"],
    audience: ["Analysts", "Operators"],
    categories: ["data-analytics"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Rows AI",
    slug: "rows-ai",
    publisher: "Rows",
    url: "https://rows.com",
    summary: "Spreadsheet platform with AI analysis and connected data automations.",
    description:
      "Rows combines spreadsheets with AI and integrations so teams can analyze live business data in a familiar grid.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["spreadsheet", "analytics", "automation"],
    strengths: ["Spreadsheet UX + AI", "Integrations"],
    limits: ["Not a full BI suite"],
    audience: ["Operators", "Analysts"],
    categories: ["data-analytics", "productivity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Spellbook",
    slug: "spellbook",
    publisher: "Spellbook",
    url: "https://www.spellbook.legal",
    summary: "AI contract drafting and review assistant inside Microsoft Word.",
    description:
      "Spellbook helps lawyers draft and redline contracts with AI directly in Word, aimed at transactional legal work.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["legal", "contracts", "word", "drafting"],
    strengths: ["In-Word workflow", "Legal specialization"],
    limits: ["Lawyer review still required"],
    audience: ["Lawyers"],
    categories: ["finance-legal"],
    type: "tool",
    platforms: ["windows", "macos"],
  },
  {
    name: "CoCounsel",
    slug: "cocounsel",
    publisher: "Thomson Reuters",
    url: "https://www.thomsonreuters.com/en/artificial-intelligence/aicounsel.html",
    summary: "Thomson Reuters AI assistant for legal research and document review.",
    description:
      "CoCounsel supports attorneys with research memos, review workflows, and analysis grounded in trusted legal content ecosystems.",
    pricing_model: "Paid",
    price_display: "Enterprise",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["legal", "research", "thomson-reuters"],
    strengths: ["Trusted legal publisher backing", "Professional workflows"],
    limits: ["Enterprise access"],
    audience: ["Law firms"],
    categories: ["finance-legal", "research-education"],
    type: "platform",
    platforms: ["web"],
  },
  {
    name: "DoNotPay",
    slug: "donotpay",
    publisher: "DoNotPay",
    url: "https://donotpay.com",
    summary: "Consumer ‘robot lawyer’ app for cancellations, claims, and rights tasks.",
    description:
      "DoNotPay automates common consumer advocacy tasks like cancellations, chargebacks, and form letters using AI-assisted flows.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["consumer-rights", "legaltech", "automation"],
    strengths: ["Consumer-friendly automation", "High brand recognition"],
    limits: ["Not a substitute for counsel"],
    audience: ["Consumers"],
    categories: ["finance-legal"],
    type: "tool",
    platforms: ["web", "ios", "android"],
  },
  {
    name: "Gong",
    slug: "gong",
    publisher: "Gong",
    url: "https://www.gong.io",
    summary: "Revenue intelligence platform that analyzes sales calls with AI.",
    description:
      "Gong records and analyzes customer conversations to coach reps, surface deal risks, and improve forecast visibility.",
    pricing_model: "Paid",
    price_display: "Enterprise",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["sales", "call-intelligence", "revenue"],
    strengths: ["Category leader", "Deep call analytics"],
    limits: ["Enterprise pricing"],
    audience: ["Sales teams"],
    categories: ["business-marketing"],
    type: "platform",
    platforms: ["web"],
  },
  {
    name: "Lavender",
    slug: "lavender",
    publisher: "Lavender",
    url: "https://www.lavender.ai",
    summary: "AI email coach for sales reps—personalization and reply-rate tips.",
    description:
      "Lavender scores outbound emails and suggests improvements to tone, length, and personalization for higher response rates.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["sales-email", "outreach", "coaching"],
    strengths: ["Practical email scoring", "Popular with SDRs"],
    limits: ["Email-focused only"],
    audience: ["Sales"],
    categories: ["business-marketing", "writing-content"],
    type: "extension",
    platforms: ["web", "chrome"],
  },
  {
    name: "Apollo.io",
    slug: "apollo-io",
    publisher: "Apollo",
    url: "https://www.apollo.io",
    summary: "Sales intelligence and engagement platform with AI writing/ sequencers.",
    description:
      "Apollo combines B2B contact data, sequencing, and AI helpers for outbound prospecting teams.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["sales", "leads", "sequences", "b2b"],
    strengths: ["Data + engagement in one", "Strong SMB adoption"],
    limits: ["Data accuracy varies"],
    audience: ["Sales", "Growth"],
    categories: ["business-marketing"],
    type: "platform",
    platforms: ["web"],
  },
  {
    name: "LangSmith",
    slug: "langsmith",
    publisher: "LangChain",
    url: "https://www.langchain.com/langsmith",
    summary: "Observability, testing, and evaluation platform for LangChain/LLM apps.",
    description:
      "LangSmith helps teams trace chains/agents, create datasets, and run evaluations for production LLM applications.",
    pricing_model: "Freemium",
    price_display: "Free tier / Team",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["observability", "evals", "langchain", "tracing"],
    strengths: ["Best-in-class with LangChain", "Eval workflows"],
    limits: ["Most value inside LangChain ecosystem"],
    audience: ["Developers"],
    categories: ["coding-development", "data-analytics"],
    type: "platform",
    platforms: ["web"],
  },
  {
    name: "Helicone",
    slug: "helicone",
    publisher: "Helicone",
    url: "https://www.helicone.ai",
    summary: "Open-source LLM observability proxy for logging, costs, and caching.",
    description:
      "Helicone sits as a gateway in front of model APIs to capture requests, costs, latency, and user analytics.",
    pricing_model: "Open source",
    price_display: "Open source / Cloud",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["observability", "proxy", "llmops", "caching"],
    strengths: ["Easy proxy setup", "Open-source option"],
    limits: ["Needs instrumentation discipline"],
    audience: ["Developers"],
    categories: ["coding-development"],
    type: "platform",
    platforms: ["web", "self-hosted"],
  },
  {
    name: "Portkey",
    slug: "portkey",
    publisher: "Portkey",
    url: "https://portkey.ai",
    summary: "AI gateway for routing, guardrails, and observability across model providers.",
    description:
      "Portkey provides an AI gateway with fallbacks, budgets, and governance controls for multi-provider LLM stacks.",
    pricing_model: "Freemium",
    price_display: "Freemium / Enterprise",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["gateway", "routing", "guardrails", "llmops"],
    strengths: ["Multi-provider control plane", "Production features"],
    limits: ["Another hop in the stack"],
    audience: ["Developers", "Platform teams"],
    categories: ["coding-development"],
    type: "platform",
    platforms: ["web"],
  },
  {
    name: "LiteLLM",
    slug: "litellm",
    publisher: "BerriAI",
    url: "https://www.litellm.ai",
    summary: "Open-source library/proxy to call 100+ LLM APIs with one OpenAI-like interface.",
    description:
      "LiteLLM standardizes provider APIs and can run as a proxy with budgeting, load balancing, and logging.",
    pricing_model: "Open source",
    price_display: "Open source",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["proxy", "openai-compatible", "multi-provider"],
    strengths: ["Huge provider coverage", "Simple DX"],
    limits: ["Ops burden if self-hosting proxy"],
    audience: ["Developers"],
    categories: ["coding-development"],
    type: "framework",
    platforms: ["python", "self-hosted"],
  },
  {
    name: "Roboflow",
    slug: "roboflow",
    publisher: "Roboflow",
    url: "https://roboflow.com",
    summary: "End-to-end computer vision platform for datasets, training, and deployment.",
    description:
      "Roboflow helps teams label images, train vision models, and deploy detection/segmentation workflows quickly.",
    pricing_model: "Freemium",
    price_display: "Freemium / paid",
    open_source: false,
    api_available: true,
    local_available: true,
    keywords: ["computer-vision", "datasets", "detection"],
    strengths: ["CV workflow completeness", "Strong community"],
    limits: ["Vision-focused only"],
    audience: ["ML engineers", "Builders"],
    categories: ["data-analytics", "coding-development"],
    type: "platform",
    platforms: ["web", "python"],
  },
  {
    name: "Labelbox",
    slug: "labelbox",
    publisher: "Labelbox",
    url: "https://labelbox.com",
    summary: "Enterprise data-labeling and evaluation platform for AI teams.",
    description:
      "Labelbox provides annotation tools, workflows, and model evaluation infrastructure for production AI datasets.",
    pricing_model: "Paid",
    price_display: "Enterprise",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["labeling", "datasets", "evaluation"],
    strengths: ["Enterprise labeling ops", "Broad modality support"],
    limits: ["Enterprise sales cycle"],
    audience: ["ML teams", "Enterprises"],
    categories: ["data-analytics"],
    type: "platform",
    platforms: ["web"],
  },
  {
    name: "Scale AI",
    slug: "scale-ai",
    publisher: "Scale AI",
    url: "https://scale.com",
    summary: "Data and evaluation infrastructure provider for frontier AI labs and enterprises.",
    description:
      "Scale supplies high-quality data labeling, RLHF/evaluation services, and generative AI data platforms used by major AI organizations.",
    pricing_model: "Paid",
    price_display: "Enterprise",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["rlhf", "labeling", "evaluation", "enterprise"],
    strengths: ["Trusted by top labs", "Evaluation expertise"],
    limits: ["Not a consumer product"],
    audience: ["AI labs", "Enterprises"],
    categories: ["data-analytics", "research-education"],
    type: "platform",
    platforms: ["web"],
  },
  {
    name: "Tabby",
    slug: "tabbyml",
    publisher: "TabbyML",
    url: "https://tabby.tabbyml.com",
    summary: "Open-source, self-hosted coding assistant alternative to Copilot.",
    description:
      "Tabby is a self-hosted AI coding completion server that teams can run privately with editor extensions.",
    pricing_model: "Open source",
    price_display: "Open source",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["copilot-alternative", "self-hosted", "completion"],
    strengths: ["Private self-hosting", "Open source"],
    limits: ["Requires infra + model ops"],
    audience: ["Developers", "Security-conscious teams"],
    categories: ["coding-development"],
    type: "open-source",
    platforms: ["self-hosted", "vscode", "jetbrains"],
  },
  {
    name: "Warp AI",
    slug: "warp-ai",
    publisher: "Warp",
    url: "https://www.warp.dev",
    summary: "AI-assisted modern terminal for explaining errors and generating commands.",
    description:
      "Warp pairs a fast terminal UX with AI features that suggest commands, explain output, and help debug shell workflows.",
    pricing_model: "Freemium",
    price_display: "Free / Pro",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["terminal", "cli", "devtools", "commands"],
    strengths: ["Great terminal UX", "Practical AI for shell"],
    limits: ["Not a full IDE agent"],
    audience: ["Developers"],
    categories: ["coding-development", "productivity"],
    type: "tool",
    platforms: ["macos", "windows", "linux"],
  },
  {
    name: "Pieces for Developers",
    slug: "pieces",
    publisher: "Pieces",
    url: "https://pieces.app",
    summary: "AI snippet manager and on-device developer memory across tools.",
    description:
      "Pieces captures, enriches, and retrieves code snippets and context with local-first AI workflows for developers.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: true,
    keywords: ["snippets", "developer-memory", "local-ai"],
    strengths: ["Local-first angle", "Cross-tool snippet workflow"],
    limits: ["Habit change required"],
    audience: ["Developers"],
    categories: ["coding-development", "productivity"],
    type: "tool",
    platforms: ["windows", "macos", "linux"],
  },
  {
    name: "CustomGPT",
    slug: "customgpt",
    publisher: "CustomGPT",
    url: "https://customgpt.ai",
    summary: "No-code platform to build business chatbots on your documents/site content.",
    description:
      "CustomGPT creates support/research agents grounded in uploaded files or crawled websites with citations.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["rag", "chatbot", "docs", "no-code"],
    strengths: ["Fast business RAG bots", "Citations"],
    limits: ["Less flexible than custom engineering"],
    audience: ["SMBs", "Support teams"],
    categories: ["automation-agents", "productivity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "SiteGPT",
    slug: "sitegpt",
    publisher: "SiteGPT",
    url: "https://sitegpt.ai",
    summary: "ChatGPT-like support widget trained on your website content.",
    description:
      "SiteGPT crawls a site to create an embeddable AI support agent that answers visitor questions from your pages.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["support-widget", "website-chatbot", "rag"],
    strengths: ["Simple website training", "Embeddable widget"],
    limits: ["Depends on site content quality"],
    audience: ["SMBs", "SaaS"],
    categories: ["automation-agents", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Chatbase",
    slug: "chatbase",
    publisher: "Chatbase",
    url: "https://www.chatbase.co",
    summary: "Popular builder for custom AI chatbots trained on your data.",
    description:
      "Chatbase lets teams upload docs or URLs and deploy branded chat agents for support and lead qualification.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["chatbot", "rag", "support", "no-code"],
    strengths: ["Easy setup", "Widely used by SMBs"],
    limits: ["Advanced orchestration limited"],
    audience: ["SMBs", "Support"],
    categories: ["automation-agents"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Character.AI+",
    slug: "character-ai-plus",
    publisher: "Character.AI",
    url: "https://character.ai",
    summary: "Paid Character.AI tier for faster chats and higher limits with popular AI characters.",
    description:
      "Character.AI+ expands the consumer character-chat experience with priority access and higher usage compared to the free plan.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["characters", "roleplay", "chat", "consumer"],
    strengths: ["Huge character ecosystem", "Consumer brand"],
    limits: ["Entertainment-focused"],
    audience: ["Consumers"],
    categories: ["ai-assistants"],
    type: "tool",
    platforms: ["web", "ios", "android"],
  },
  {
    name: "Pi by Inflection",
    slug: "pi-inflection",
    publisher: "Inflection AI",
    url: "https://pi.ai",
    summary: "Personal AI companion focused on supportive, emotionally intelligent conversation.",
    description:
      "Pi is Inflection’s consumer assistant designed for friendly daily conversation, advice, and companionship-style interactions.",
    pricing_model: "Free",
    price_display: "Free",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["companion", "personal-ai", "chat"],
    strengths: ["Warm conversational style", "Easy mobile/web access"],
    limits: ["Less of a work productivity suite"],
    audience: ["Consumers"],
    categories: ["ai-assistants"],
    type: "tool",
    platforms: ["web", "ios", "android"],
  },
  {
    name: "YouChat",
    slug: "youchat",
    publisher: "You.com",
    url: "https://you.com",
    summary: "AI chat mode inside You.com search with web-grounded answers.",
    description:
      "YouChat combines conversational answers with search-style results and productivity modes inside the You.com assistant.",
    pricing_model: "Freemium",
    price_display: "Free / Pro",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["search", "chat", "web-grounded"],
    strengths: ["Search + chat combo", "Multiple modes"],
    limits: ["Smaller share than Perplexity/ChatGPT"],
    audience: ["Consumers", "Professionals"],
    categories: ["ai-assistants", "research-education"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Phind",
    slug: "phind-ai",
    publisher: "Phind",
    url: "https://www.phind.com",
    summary: "AI search engine popular with developers for coding answers with sources.",
    description:
      "Phind specializes in technical/dev questions, returning grounded answers and code-focused explanations from the web.",
    pricing_model: "Freemium",
    price_display: "Free / Pro",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["developer-search", "coding", "answers"],
    strengths: ["Dev-oriented search", "Source links"],
    limits: ["Less general consumer breadth"],
    audience: ["Developers"],
    categories: ["coding-development", "research-education"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Black Forest Labs",
    slug: "black-forest-labs",
    publisher: "Black Forest Labs",
    url: "https://blackforestlabs.ai",
    summary: "Creators of FLUX image models—API and playground for frontier image generation.",
    description:
      "Black Forest Labs develops FLUX models and provides APIs/playground access for high-quality text-to-image generation.",
    pricing_model: "Paid",
    price_display: "API usage",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["flux", "image-models", "api"],
    strengths: ["Frontier image quality", "API access"],
    limits: ["Compute costs"],
    audience: ["Developers", "Creators"],
    categories: ["image-generation"],
    type: "model",
    platforms: ["web"],
  },
  {
    name: "Ideogram 2",
    slug: "ideogram-2",
    publisher: "Ideogram",
    url: "https://ideogram.ai",
    summary: "Image generator known for accurate text rendering inside images.",
    description:
      "Ideogram is widely used for posters, logos, and designs that need readable text in generated images.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["text-in-image", "posters", "design"],
    strengths: ["Best-in-class text rendering", "Design use cases"],
    limits: ["Credits on free plans"],
    audience: ["Designers", "Marketers"],
    categories: ["image-generation", "design-creativity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Leonardo Phoenix",
    slug: "leonardo-phoenix",
    publisher: "Leonardo.Ai",
    url: "https://leonardo.ai",
    summary: "Leonardo’s newer generative image model/workflow for production creatives.",
    description:
      "Leonardo remains a top creator platform; Phoenix-oriented workflows emphasize quality and control for game/concept art pipelines.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["game-art", "images", "creative"],
    strengths: ["Creator community", "Fine control tools"],
    limits: ["Token limits on free"],
    audience: ["Game artists", "Creators"],
    categories: ["image-generation"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Runway Gen-3",
    slug: "runway-gen-3",
    publisher: "Runway",
    url: "https://runwayml.com",
    summary: "Runway’s flagship generative video model line for cinematic clips and editing.",
    description:
      "Gen-3 powers Runway’s text/image-to-video tools used by filmmakers and marketers for short generative video production.",
    pricing_model: "Paid",
    price_display: "Credits",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["gen-3", "text-to-video", "filmmaking"],
    strengths: ["Leading creative video suite", "Pro editing tools"],
    limits: ["Credit costs"],
    audience: ["Filmmakers", "Agencies"],
    categories: ["video-generation"],
    type: "model",
    platforms: ["web"],
  },
  {
    name: "Luma Ray",
    slug: "luma-ray",
    publisher: "Luma AI",
    url: "https://lumalabs.ai/ray",
    summary: "Luma’s generative video model for coherent motion from text/images.",
    description:
      "Ray is Luma’s video generation model family used via Dream Machine for creative text-to-video and image-to-video clips.",
    pricing_model: "Freemium",
    price_display: "Freemium / paid",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["ray", "dream-machine", "video"],
    strengths: ["Strong motion quality", "Creator accessibility"],
    limits: ["Queue/limits on free"],
    audience: ["Creators"],
    categories: ["video-generation"],
    type: "model",
    platforms: ["web"],
  },
  {
    name: "GroqCloud",
    slug: "groqcloud",
    publisher: "Groq",
    url: "https://console.groq.com",
    summary: "Ultra-fast LLM inference cloud powered by Groq LPU hardware.",
    description:
      "GroqCloud serves popular open models with extremely low latency token generation for developers building snappy AI apps.",
    pricing_model: "Freemium",
    price_display: "Free tier / usage",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["fast-inference", "lpu", "api", "open-models"],
    strengths: ["Speed", "Simple OpenAI-like API"],
    limits: ["Model catalog depends on Groq offerings"],
    audience: ["Developers"],
    categories: ["coding-development"],
    type: "api",
    platforms: ["web", "python"],
  },
  {
    name: "Cerebras Inference",
    slug: "cerebras-inference",
    publisher: "Cerebras",
    url: "https://www.cerebras.ai/inference",
    summary: "High-speed AI inference cloud from Cerebras wafer-scale hardware.",
    description:
      "Cerebras Inference provides fast LLM APIs for developers who need high throughput and low latency on supported models.",
    pricing_model: "Paid",
    price_display: "Usage / plans",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["inference", "hardware", "api", "speed"],
    strengths: ["Hardware-accelerated speed", "Developer API"],
    limits: ["Provider lock-in considerations"],
    audience: ["Developers"],
    categories: ["coding-development"],
    type: "api",
    platforms: ["web"],
  },
  {
    name: "Fireworks AI",
    slug: "fireworks",
    publisher: "Fireworks AI",
    url: "https://fireworks.ai",
    summary: "Fast inference platform for open models with production APIs.",
    description:
      "Fireworks hosts optimized open-model inference (LLMs and media models) with developer-friendly deployment options.",
    pricing_model: "Paid",
    price_display: "Usage-based",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["inference", "open-models", "api"],
    strengths: ["Speed + open model catalog", "Production focus"],
    limits: ["Usage costs"],
    audience: ["Developers"],
    categories: ["coding-development"],
    type: "api",
    platforms: ["web", "python"],
  },
  {
    name: "Together AI",
    slug: "together",
    publisher: "Together AI",
    url: "https://www.together.ai",
    summary: "Cloud platform to fine-tune and serve open-source AI models.",
    description:
      "Together AI provides inference and training infrastructure for open models, popular with startups building on OSS LLMs.",
    pricing_model: "Paid",
    price_display: "Usage-based",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["open-source-llm", "inference", "fine-tune"],
    strengths: ["OSS model breadth", "Fine-tune options"],
    limits: ["Cloud spend management"],
    audience: ["Developers", "Startups"],
    categories: ["coding-development"],
    type: "platform",
    platforms: ["web", "python"],
  },
  {
    name: "Perplexity Pro",
    slug: "perplexity-pro",
    publisher: "Perplexity",
    url: "https://www.perplexity.ai",
    summary: "Paid Perplexity plan with better models, file uploads, and higher limits.",
    description:
      "Perplexity Pro upgrades the AI search experience with premium models, unlimited Pro searches (per plan terms), and research features.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["ai-search", "research", "citations"],
    strengths: ["Excellent cited answers", "Research UX"],
    limits: ["Subscription cost"],
    audience: ["Professionals", "Researchers"],
    categories: ["research-education", "ai-assistants"],
    type: "tool",
    platforms: ["web", "ios", "android"],
  },
];

const PLATFORM_ALIASES = { chrome: "web", docker: "self-hosted" };

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
