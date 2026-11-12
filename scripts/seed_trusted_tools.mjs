/**
 * Seed highly used / trusted AI tools missing from the catalog (+ logos).
 * Usage: node scripts/seed_trusted_tools.mjs
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
  // —— Frontier assistants / models ——
  {
    name: "Grok",
    slug: "grok",
    publisher: "xAI",
    url: "https://grok.com",
    summary: "xAI’s conversational assistant with real-time knowledge and a distinctive style.",
    description:
      "Grok is xAI’s flagship chat assistant available on the web and via X, known for real-time awareness and a less filtered personality than typical assistants.",
    pricing_model: "Freemium",
    price_display: "Free / X Premium+",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["assistant", "chat", "xai", "realtime"],
    strengths: ["Real-time flavor", "Strong general chat"],
    limits: ["Feature access tied to plans"],
    audience: ["Consumers", "Developers"],
    categories: ["ai-assistants"],
    type: "model",
    platforms: ["web"],
  },
  {
    name: "Le Chat",
    slug: "le-chat",
    publisher: "Mistral AI",
    url: "https://chat.mistral.ai",
    summary: "Mistral’s consumer chat assistant powered by its open and proprietary models.",
    description:
      "Le Chat is Mistral AI’s web assistant for everyday Q&A, writing, and coding help using Mistral models.",
    pricing_model: "Freemium",
    price_display: "Free / Pro",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["mistral", "chat", "assistant", "europe"],
    strengths: ["European provider", "Strong multilingual chat"],
    limits: ["Ecosystem smaller than OpenAI/Google"],
    audience: ["Consumers", "Professionals"],
    categories: ["ai-assistants"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "DeepSeek",
    slug: "deepseek",
    publisher: "DeepSeek",
    url: "https://www.deepseek.com",
    summary: "Popular low-cost chat and coding models with a strong open-weight presence.",
    description:
      "DeepSeek offers chat products and APIs known for competitive reasoning/coding quality at aggressive pricing, plus open-weight releases.",
    pricing_model: "Freemium",
    price_display: "Free / cheap API",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["llm", "coding", "cheap-api", "open-weight"],
    strengths: ["Strong price/performance", "Open weights available"],
    limits: ["Docs/ecosystem evolving quickly"],
    audience: ["Developers", "Builders"],
    categories: ["ai-assistants", "coding-development"],
    type: "model",
    platforms: ["web", "self-hosted"],
  },
  {
    name: "ChatGPT Team",
    slug: "chatgpt-team",
    publisher: "OpenAI",
    url: "https://chatgpt.com",
    summary: "Workspace-oriented ChatGPT plan for shared team workspaces and admin controls.",
    description:
      "ChatGPT Team gives organizations shared workspaces, higher limits, and admin controls while keeping chats out of training by default.",
    pricing_model: "Paid",
    price_display: "Per seat",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["chatgpt", "teams", "workspace", "business"],
    strengths: ["Familiar ChatGPT UX", "Team admin features"],
    limits: ["Seat cost"],
    audience: ["Teams", "SMBs"],
    categories: ["ai-assistants", "productivity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Claude Pro",
    slug: "claude-pro",
    publisher: "Anthropic",
    url: "https://claude.ai",
    summary: "Paid Claude plan with higher usage for writing, coding, and analysis.",
    description:
      "Claude Pro unlocks higher rate limits and priority access to Anthropic’s latest Claude models in the Claude apps.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["claude", "writing", "coding", "subscription"],
    strengths: ["Excellent long-form writing", "Strong coding help"],
    limits: ["Still subject to usage caps"],
    audience: ["Professionals", "Developers"],
    categories: ["ai-assistants", "writing-content"],
    type: "tool",
    platforms: ["web"],
  },

  // —— Cloud AI platforms (trusted infra) ——
  {
    name: "Azure OpenAI",
    slug: "azure-openai",
    publisher: "Microsoft",
    url: "https://azure.microsoft.com/products/ai-services/openai-service",
    summary: "Enterprise OpenAI models hosted in Azure with Microsoft compliance controls.",
    description:
      "Azure OpenAI Service provides GPT, embeddings, and related models inside Azure’s enterprise security, networking, and compliance boundary.",
    pricing_model: "Paid",
    price_display: "Azure usage",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["enterprise", "openai", "azure", "compliance"],
    strengths: ["Enterprise controls", "Familiar OpenAI APIs"],
    limits: ["Quota/region constraints"],
    audience: ["Enterprises"],
    categories: ["coding-development", "business-marketing"],
    type: "platform",
    platforms: ["web", "python"],
  },
  {
    name: "Amazon Bedrock",
    slug: "amazon-bedrock",
    publisher: "Amazon Web Services",
    url: "https://aws.amazon.com/bedrock/",
    summary: "AWS managed service to call multiple foundation models through one API.",
    description:
      "Amazon Bedrock offers serverless access to models from Amazon and partners with AWS IAM, VPC, and enterprise governance.",
    pricing_model: "Paid",
    price_display: "AWS usage",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["aws", "foundation-models", "enterprise", "api"],
    strengths: ["Multi-model catalog", "AWS-native security"],
    limits: ["AWS complexity"],
    audience: ["Enterprises", "Developers"],
    categories: ["coding-development"],
    type: "platform",
    platforms: ["web", "python"],
  },
  {
    name: "Google Vertex AI",
    slug: "vertex-ai",
    publisher: "Google Cloud",
    url: "https://cloud.google.com/vertex-ai",
    summary: "Google Cloud platform for training, hosting, and calling Gemini and other models.",
    description:
      "Vertex AI combines model garden access, Gemini APIs, MLOps, and enterprise controls on Google Cloud.",
    pricing_model: "Paid",
    price_display: "GCP usage",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["gcp", "gemini", "mlops", "enterprise"],
    strengths: ["Gemini + Google data stack", "Enterprise MLOps"],
    limits: ["Cloud lock-in considerations"],
    audience: ["Enterprises", "ML teams"],
    categories: ["coding-development", "data-analytics"],
    type: "platform",
    platforms: ["web", "python"],
  },
  {
    name: "Cloudflare Workers AI",
    slug: "cloudflare-workers-ai",
    publisher: "Cloudflare",
    url: "https://developers.cloudflare.com/workers-ai/",
    summary: "Run inference for popular open models at the edge on Cloudflare’s network.",
    description:
      "Workers AI lets developers call LLMs and other models from Cloudflare Workers with global edge distribution.",
    pricing_model: "Freemium",
    price_display: "Free tier / usage",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["edge", "inference", "workers", "llm"],
    strengths: ["Edge latency", "Simple Workers integration"],
    limits: ["Model catalog narrower than hyperscalers"],
    audience: ["Developers"],
    categories: ["coding-development"],
    type: "api",
    platforms: ["web", "javascript"],
  },

  // —— Coding (most used) ——
  {
    name: "JetBrains AI Assistant",
    slug: "jetbrains-ai-assistant",
    publisher: "JetBrains",
    url: "https://www.jetbrains.com/ai/",
    summary: "AI coding assistant built into JetBrains IDEs like IntelliJ and PyCharm.",
    description:
      "JetBrains AI Assistant adds chat, completion, and refactor help inside JetBrains IDEs using cloud models with IDE context.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["ide", "intellij", "completion", "refactor"],
    strengths: ["Deep IDE integration", "Strong for JVM stacks"],
    limits: ["Tied to JetBrains ecosystem"],
    audience: ["Developers"],
    categories: ["coding-development"],
    type: "extension",
    platforms: ["jetbrains"],
  },
  {
    name: "Cline",
    slug: "cline",
    publisher: "Cline",
    url: "https://cline.bot",
    summary: "Autonomous coding agent extension for VS Code that can edit and run tools.",
    description:
      "Cline is a popular open agent-style coding assistant for VS Code that plans, edits files, and runs commands with human approval.",
    pricing_model: "Open source",
    price_display: "Open source (model costs separate)",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["agent", "vscode", "coding", "autonomous"],
    strengths: ["Agentic coding in VS Code", "Bring-your-own model"],
    limits: ["Needs careful permissioning"],
    audience: ["Developers"],
    categories: ["coding-development", "automation-agents"],
    type: "extension",
    platforms: ["vscode"],
  },
  {
    name: "Supermaven",
    slug: "supermaven",
    publisher: "Supermaven",
    url: "https://supermaven.com",
    summary: "High-speed AI code completion plugin popular with power users.",
    description:
      "Supermaven focuses on fast, long-context code completions inside editors as a Copilot-style alternative.",
    pricing_model: "Freemium",
    price_display: "Free / Pro",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["completion", "copilot-alternative", "ide"],
    strengths: ["Very fast completions", "Long context"],
    limits: ["Narrower than full agent IDEs"],
    audience: ["Developers"],
    categories: ["coding-development"],
    type: "extension",
    platforms: ["vscode", "jetbrains"],
  },
  {
    name: "Blackbox AI",
    slug: "blackbox-ai",
    publisher: "BLACKBOX AI",
    url: "https://www.blackbox.ai",
    summary: "AI coding assistant and search for code snippets across languages.",
    description:
      "Blackbox AI helps developers autocomplete, search code, and chat about programming tasks in the browser and extensions.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["coding", "autocomplete", "snippets"],
    strengths: ["Free-friendly coding help", "Browser + extensions"],
    limits: ["Quality varies by language"],
    audience: ["Developers", "Students"],
    categories: ["coding-development"],
    type: "tool",
    platforms: ["web", "vscode"],
  },
  {
    name: "v0 by Vercel",
    slug: "v0-vercel",
    publisher: "Vercel",
    url: "https://v0.dev",
    summary: "Generate UI components and apps from prompts, tightly tied to Next.js/React.",
    description:
      "v0 turns natural-language prompts into React/Tailwind UI that developers can iterate and export into real codebases.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["ui", "react", "nextjs", "codegen"],
    strengths: ["Strong UI generation", "Vercel ecosystem fit"],
    limits: ["Best for web UI, not all backends"],
    audience: ["Frontend developers"],
    categories: ["coding-development", "design-creativity"],
    type: "tool",
    platforms: ["web"],
  },

  // —— Image / design (trusted) ——
  {
    name: "Microsoft Designer",
    slug: "microsoft-designer",
    publisher: "Microsoft",
    url: "https://designer.microsoft.com",
    summary: "Free AI graphic design tool powered by DALL·E for social and marketing creatives.",
    description:
      "Microsoft Designer generates images and layouts from text prompts for posts, invitations, and simple brand graphics.",
    pricing_model: "Freemium",
    price_display: "Free with Microsoft account",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["design", "dalle", "social", "graphics"],
    strengths: ["Easy for non-designers", "Microsoft account access"],
    limits: ["Less control than pro suites"],
    audience: ["Marketers", "Consumers"],
    categories: ["design-creativity", "image-generation"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Canva",
    slug: "canva",
    publisher: "Canva",
    url: "https://www.canva.com",
    summary: "Widely used design platform with Magic Studio AI for images, text, and video.",
    description:
      "Canva is a mainstream design suite; Magic Studio adds generative fill, text, and video helpers for everyday creatives and teams.",
    pricing_model: "Freemium",
    price_display: "Free / Pro",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["design", "templates", "magic-studio", "brand"],
    strengths: ["Huge adoption", "Templates + AI assist"],
    limits: ["Advanced brand systems still limited"],
    audience: ["Marketers", "SMBs", "Creators"],
    categories: ["design-creativity", "business-marketing"],
    type: "tool",
    platforms: ["web", "ios", "android"],
  },
  {
    name: "Magnific AI",
    slug: "magnific-ai",
    publisher: "Freepik",
    url: "https://magnific.ai",
    summary: "AI image upscaler and enhancer popular with creative professionals.",
    description:
      "Magnific specializes in creative upscaling that can add plausible detail while increasing resolution for design workflows.",
    pricing_model: "Paid",
    price_display: "Credits",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["upscale", "enhance", "images"],
    strengths: ["Detail-aware upscaling", "Creative control"],
    limits: ["Can invent detail"],
    audience: ["Designers", "Artists"],
    categories: ["image-generation", "design-creativity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Upscayl",
    slug: "upscayl",
    publisher: "Upscayl",
    url: "https://upscayl.org",
    summary: "Free open-source AI image upscaler that runs locally.",
    description:
      "Upscayl is a desktop app for local AI upscaling without uploading images to the cloud.",
    pricing_model: "Open source",
    price_display: "Free",
    open_source: true,
    api_available: false,
    local_available: true,
    keywords: ["upscale", "local", "open-source", "privacy"],
    strengths: ["Local/private", "Free"],
    limits: ["Needs decent hardware"],
    audience: ["Creators", "Privacy users"],
    categories: ["image-generation"],
    type: "open-source",
    platforms: ["windows", "macos", "linux"],
  },
  {
    name: "NightCafe",
    slug: "nightcafe",
    publisher: "NightCafe Studio",
    url: "https://nightcafe.studio",
    summary: "Popular AI art community and generator supporting multiple model engines.",
    description:
      "NightCafe lets users create AI art with multiple algorithms and share work in a large creator community.",
    pricing_model: "Freemium",
    price_display: "Credits",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["ai-art", "community", "images"],
    strengths: ["Community features", "Multiple engines"],
    limits: ["Credit system"],
    audience: ["Creators"],
    categories: ["image-generation", "design-creativity"],
    type: "tool",
    platforms: ["web"],
  },

  // —— Video ——
  {
    name: "Captions",
    slug: "captions-ai",
    publisher: "Captions",
    url: "https://www.captions.ai",
    summary: "Mobile-first AI video app for captions, eye contact, and talking avatars.",
    description:
      "Captions helps creators produce social videos with auto captions, teleprompter, eye-contact correction, and generative features.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["captions", "social-video", "avatar"],
    strengths: ["Great mobile UX", "Caption quality"],
    limits: ["Subscription for pro features"],
    audience: ["Creators"],
    categories: ["video-generation"],
    type: "tool",
    platforms: ["ios", "android", "web"],
  },
  {
    name: "Fliki",
    slug: "fliki",
    publisher: "Fliki",
    url: "https://fliki.ai",
    summary: "Turn text into videos with AI voices and stock media.",
    description:
      "Fliki generates video from scripts using text-to-speech and media libraries for social and marketing content.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["text-to-video", "tts", "marketing"],
    strengths: ["Fast script-to-video", "Many languages"],
    limits: ["Stock-media aesthetic"],
    audience: ["Marketers", "Creators"],
    categories: ["video-generation", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Colossyan",
    slug: "colossyan",
    publisher: "Colossyan",
    url: "https://www.colossyan.com",
    summary: "AI avatar video platform focused on training and L&D content.",
    description:
      "Colossyan creates presenter videos with AI avatars for workplace learning, onboarding, and explainers.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["avatar", "training", "l&d", "video"],
    strengths: ["L&D focus", "Multilingual avatars"],
    limits: ["Enterprise pricing"],
    audience: ["L&D", "Enterprises"],
    categories: ["video-generation", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Haiper",
    slug: "haiper",
    publisher: "Haiper",
    url: "https://haiper.ai",
    summary: "AI video generation model and app for short creative clips.",
    description:
      "Haiper generates short videos from text or images and is used by creators experimenting with generative video.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["text-to-video", "generative-video"],
    strengths: ["Accessible video gen", "Creator-friendly"],
    limits: ["Short clip lengths"],
    audience: ["Creators"],
    categories: ["video-generation"],
    type: "tool",
    platforms: ["web"],
  },

  // —— Audio ——
  {
    name: "OpenAI Whisper",
    slug: "whisper",
    publisher: "OpenAI",
    url: "https://openai.com/index/whisper/",
    summary: "Widely adopted open speech-recognition model for transcription.",
    description:
      "Whisper is OpenAI’s open-source ASR model family, commonly self-hosted or used via API wrappers for multilingual transcription.",
    pricing_model: "Open source",
    price_display: "Open source / API variants",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["speech-to-text", "transcription", "open-source"],
    strengths: ["Strong baseline ASR", "Local possible"],
    limits: ["Real-time needs extra engineering"],
    audience: ["Developers"],
    categories: ["audio-music", "coding-development"],
    type: "model",
    platforms: ["python", "self-hosted"],
  },
  {
    name: "LALAL.AI",
    slug: "lalal-ai",
    publisher: "LALAL.AI",
    url: "https://www.lalal.ai",
    summary: "Trusted stem splitter for vocals/instruments using AI.",
    description:
      "LALAL.AI separates songs into stems (vocals, drums, bass, etc.) for creators, producers, and karaoke workflows.",
    pricing_model: "Freemium",
    price_display: "Minutes / packs",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["stem-split", "vocals", "audio"],
    strengths: ["High-quality separation", "Simple UX"],
    limits: ["Pay per minutes"],
    audience: ["Musicians", "Creators"],
    categories: ["audio-music"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Moises",
    slug: "moises",
    publisher: "Moises",
    url: "https://moises.ai",
    summary: "AI music practice app for stem separation, tempo, and pitch tools.",
    description:
      "Moises helps musicians practice by isolating stems, changing key/tempo, and generating backing tracks.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["music", "practice", "stems"],
    strengths: ["Musician-focused tools", "Mobile apps"],
    limits: ["Pro features gated"],
    audience: ["Musicians"],
    categories: ["audio-music"],
    type: "tool",
    platforms: ["web", "ios", "android"],
  },
  {
    name: "Cleanvoice",
    slug: "cleanvoice",
    publisher: "Cleanvoice",
    url: "https://cleanvoice.ai",
    summary: "AI audio cleanup for podcasts—fillers, mouths sounds, and silence.",
    description:
      "Cleanvoice automatically edits podcast audio to remove filler words, awkward pauses, and noise artifacts.",
    pricing_model: "Paid",
    price_display: "Hours-based",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["podcast", "cleanup", "fillers"],
    strengths: ["Podcast-specific cleanup", "API available"],
    limits: ["Not a full DAW"],
    audience: ["Podcasters"],
    categories: ["audio-music", "productivity"],
    type: "tool",
    platforms: ["web"],
  },

  // —— Productivity / workplace (trusted) ——
  {
    name: "Slack AI",
    slug: "slack-ai",
    publisher: "Salesforce",
    url: "https://slack.com/ai",
    summary: "AI summaries, search, and recaps inside Slack workspaces.",
    description:
      "Slack AI helps teams summarize channels/threads, search conversations, and catch up on missed discussions inside Slack.",
    pricing_model: "Paid",
    price_display: "Add-on / plan dependent",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["slack", "summaries", "workplace", "search"],
    strengths: ["Native Slack context", "Catch-up summaries"],
    limits: ["Paid add-on in many plans"],
    audience: ["Teams", "Enterprises"],
    categories: ["productivity", "business-marketing"],
    type: "tool",
    platforms: ["web", "ios", "android"],
  },
  {
    name: "Zoom AI Companion",
    slug: "zoom-ai-companion",
    publisher: "Zoom",
    url: "https://www.zoom.com/ai-companion",
    summary: "Zoom’s AI for meeting summaries, chat help, and follow-ups.",
    description:
      "AI Companion drafts meeting summaries, next steps, and in-product assistance across Zoom Meetings and Team Chat.",
    pricing_model: "Freemium",
    price_display: "Included in many paid plans",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["meetings", "summaries", "zoom"],
    strengths: ["Native Zoom integration", "Meeting recaps"],
    limits: ["Quality depends on recording/transcript settings"],
    audience: ["Teams"],
    categories: ["productivity"],
    type: "tool",
    platforms: ["web", "windows", "macos"],
  },
  {
    name: "ClickUp Brain",
    slug: "clickup-brain",
    publisher: "ClickUp",
    url: "https://clickup.com/brain",
    summary: "AI layer across ClickUp tasks, docs, and chat for work summaries.",
    description:
      "ClickUp Brain answers questions about your workspace and helps draft tasks, docs, and updates from ClickUp context.",
    pricing_model: "Paid",
    price_display: "Add-on",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["project-management", "workspace-ai", "docs"],
    strengths: ["Uses ClickUp work graph", "Cross-object answers"],
    limits: ["Best if already on ClickUp"],
    audience: ["Teams"],
    categories: ["productivity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Motion",
    slug: "motion",
    publisher: "Motion",
    url: "https://www.usemotion.com",
    summary: "AI calendar and task planner that auto-schedules your day.",
    description:
      "Motion automatically places tasks onto your calendar based on deadlines and priorities to reduce manual planning.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["calendar", "scheduling", "tasks"],
    strengths: ["Auto-scheduling", "Deadline awareness"],
    limits: ["Can feel opinionated"],
    audience: ["Professionals"],
    categories: ["productivity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Superhuman",
    slug: "superhuman",
    publisher: "Superhuman",
    url: "https://superhuman.com",
    summary: "Premium email client with strong AI triage and writing features.",
    description:
      "Superhuman is a fast email client popular with operators; AI features help draft, triage, and summarize inbox threads.",
    pricing_model: "Paid",
    price_display: "Premium subscription",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["email", "productivity", "writing"],
    strengths: ["Speed-focused UX", "AI drafting/triage"],
    limits: ["Expensive"],
    audience: ["Executives", "Operators"],
    categories: ["productivity", "writing-content"],
    type: "tool",
    platforms: ["web", "macos", "windows", "ios", "android"],
  },
  {
    name: "Raycast AI",
    slug: "raycast-ai",
    publisher: "Raycast",
    url: "https://www.raycast.com/core-features/ai",
    summary: "AI commands and chat inside the Raycast macOS launcher.",
    description:
      "Raycast AI brings quick prompts, chat, and AI commands to the Raycast launcher for developers and power users on macOS.",
    pricing_model: "Freemium",
    price_display: "Pro for AI",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["launcher", "macos", "commands", "chat"],
    strengths: ["Instant access", "Great for power users"],
    limits: ["macOS-centric"],
    audience: ["Developers", "Power users"],
    categories: ["productivity", "coding-development"],
    type: "tool",
    platforms: ["macos"],
  },
  {
    name: "Notion",
    slug: "notion",
    publisher: "Notion Labs",
    url: "https://www.notion.com",
    summary: "All-in-one workspace with Notion AI for writing, Q&A, and summaries.",
    description:
      "Notion combines docs, wikis, and projects; Notion AI helps draft, translate, and answer questions over workspace content.",
    pricing_model: "Freemium",
    price_display: "Free / Plus / Business",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["docs", "wiki", "workspace", "ai-writing"],
    strengths: ["Massive adoption", "Flexible docs + AI"],
    limits: ["Can get messy without structure"],
    audience: ["Teams", "Individuals"],
    categories: ["productivity", "writing-content"],
    type: "tool",
    platforms: ["web", "ios", "android", "macos", "windows"],
  },

  // —— Writing / research ——
  {
    name: "Jenni AI",
    slug: "jenni-ai",
    publisher: "Jenni AI",
    url: "https://jenni.ai",
    summary: "AI writing assistant tailored for academic essays and citations.",
    description:
      "Jenni helps students and researchers draft papers with citation suggestions and academic writing workflows.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["academic", "citations", "essays"],
    strengths: ["Academic focus", "Citation helpers"],
    limits: ["Must verify sources manually"],
    audience: ["Students", "Researchers"],
    categories: ["writing-content", "research-education"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Lex",
    slug: "lex",
    publisher: "Every",
    url: "https://lex.page",
    summary: "Clean AI writing doc editor popular with newsletter and essay writers.",
    description:
      "Lex is a minimalist document editor with inline AI help for drafting and editing long-form writing.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["writing", "editor", "essays"],
    strengths: ["Distraction-free writing", "Inline AI"],
    limits: ["Fewer collaboration features than Google Docs"],
    audience: ["Writers"],
    categories: ["writing-content"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "ProWritingAid",
    slug: "prowritingaid",
    publisher: "ProWritingAid",
    url: "https://prowritingaid.com",
    summary: "Grammar and style checker favored by authors and long-form writers.",
    description:
      "ProWritingAid analyzes style, grammar, and readability with deeper reports than basic spellcheck tools.",
    pricing_model: "Freemium",
    price_display: "Freemium / lifetime options",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["grammar", "style", "editing"],
    strengths: ["Detailed style reports", "Author-focused"],
    limits: ["UI denser than Grammarly"],
    audience: ["Authors", "Editors"],
    categories: ["writing-content"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Scite",
    slug: "scite",
    publisher: "Scite",
    url: "https://scite.ai",
    summary: "Research tool that shows how papers are cited—supporting or contrasting.",
    description:
      "Scite helps researchers evaluate papers using Smart Citations that classify citation context as supporting or contrasting.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["research", "citations", "papers"],
    strengths: ["Citation context", "Research trust signals"],
    limits: ["Coverage not universal"],
    audience: ["Researchers"],
    categories: ["research-education"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "ResearchRabbit",
    slug: "researchrabbit",
    publisher: "ResearchRabbit",
    url: "https://www.researchrabbit.ai",
    summary: "‘Spotify for papers’—maps related research from seed papers.",
    description:
      "ResearchRabbit visualizes networks of related papers to help literature discovery and citation exploration.",
    pricing_model: "Free",
    price_display: "Free",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["literature-review", "papers", "discovery"],
    strengths: ["Visual paper graphs", "Free for researchers"],
    limits: ["Not a full writing suite"],
    audience: ["Researchers", "Students"],
    categories: ["research-education"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "PDF.ai",
    slug: "pdf-ai",
    publisher: "PDF.ai",
    url: "https://pdf.ai",
    summary: "Chat with PDFs for summaries, Q&A, and extraction.",
    description:
      "PDF.ai lets users upload documents and ask questions with citations back into the PDF content.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["pdf", "rag", "documents", "qa"],
    strengths: ["Simple PDF Q&A", "Citations into docs"],
    limits: ["Large/complex PDFs can struggle"],
    audience: ["Professionals", "Students"],
    categories: ["research-education", "productivity"],
    type: "tool",
    platforms: ["web"],
  },

  // —— Enterprise / trusted business AI ——
  {
    name: "Glean",
    slug: "glean",
    publisher: "Glean",
    url: "https://www.glean.com",
    summary: "Enterprise AI search and assistants over company knowledge.",
    description:
      "Glean indexes workplace apps to provide permission-aware search and AI answers for employees.",
    pricing_model: "Paid",
    price_display: "Enterprise",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["enterprise-search", "knowledge", "rag", "sso"],
    strengths: ["Permission-aware search", "Broad connectors"],
    limits: ["Enterprise sales motion"],
    audience: ["Enterprises"],
    categories: ["productivity", "business-marketing"],
    type: "platform",
    platforms: ["web"],
  },
  {
    name: "Harvey",
    slug: "harvey",
    publisher: "Harvey",
    url: "https://www.harvey.ai",
    summary: "AI platform for law firms—research, drafting, and analysis workflows.",
    description:
      "Harvey provides domain-specific AI assistance for legal professionals with firm-oriented deployments and workflows.",
    pricing_model: "Paid",
    price_display: "Enterprise",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["legal", "law", "enterprise"],
    strengths: ["Legal specialization", "Firm deployments"],
    limits: ["Not for consumer use"],
    audience: ["Law firms"],
    categories: ["finance-legal"],
    type: "platform",
    platforms: ["web"],
  },
  {
    name: "Writer",
    slug: "writer",
    publisher: "Writer",
    url: "https://writer.com",
    summary: "Enterprise generative AI platform for brand-safe content and agents.",
    description:
      "Writer offers full-stack generative AI for enterprises—including LLMs, graph-based grounding, and governance for marketing and ops teams.",
    pricing_model: "Paid",
    price_display: "Enterprise",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["enterprise", "brand", "agents", "governance"],
    strengths: ["Enterprise governance", "Brand consistency"],
    limits: ["Enterprise pricing"],
    audience: ["Enterprises"],
    categories: ["writing-content", "business-marketing"],
    type: "platform",
    platforms: ["web"],
  },
  {
    name: "Salesforce Einstein",
    slug: "salesforce-einstein",
    publisher: "Salesforce",
    url: "https://www.salesforce.com/artificial-intelligence/",
    summary: "Salesforce’s AI layer for CRM predictions, copilots, and automation.",
    description:
      "Einstein brings AI predictions, generative copilots, and agents into Salesforce CRM clouds for sales and service teams.",
    pricing_model: "Paid",
    price_display: "Salesforce add-ons",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["crm", "sales", "copilot", "enterprise"],
    strengths: ["Native CRM context", "Enterprise trust"],
    limits: ["Requires Salesforce stack"],
    audience: ["Sales", "Enterprises"],
    categories: ["business-marketing"],
    type: "platform",
    platforms: ["web"],
  },
  {
    name: "Zendesk AI",
    slug: "zendesk-ai",
    publisher: "Zendesk",
    url: "https://www.zendesk.com/service/ai/",
    summary: "AI agents and assist features for customer support in Zendesk.",
    description:
      "Zendesk AI helps automate tier-1 support, suggest replies, and route tickets inside the Zendesk service suite.",
    pricing_model: "Paid",
    price_display: "Plan add-ons",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["support", "cx", "agents", "tickets"],
    strengths: ["Native Zendesk workflows", "Agent assist"],
    limits: ["Best inside Zendesk"],
    audience: ["Support teams"],
    categories: ["business-marketing", "automation-agents"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "HubSpot AI (Breeze)",
    slug: "hubspot-ai",
    publisher: "HubSpot",
    url: "https://www.hubspot.com/products/artificial-intelligence",
    summary: "AI assistants and content tools across HubSpot CRM and marketing hubs.",
    description:
      "HubSpot’s Breeze AI helps with content drafting, CRM summaries, and go-to-market workflows inside HubSpot.",
    pricing_model: "Freemium",
    price_display: "Included / credits by plan",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["crm", "marketing", "content", "breeze"],
    strengths: ["Native HubSpot data", "SMB-friendly"],
    limits: ["Advanced AI may need higher tiers"],
    audience: ["Marketers", "SMBs"],
    categories: ["business-marketing", "writing-content"],
    type: "tool",
    platforms: ["web"],
  },

  // —— Data ——
  {
    name: "Julius AI",
    slug: "julius-ai",
    publisher: "Julius",
    url: "https://julius.ai",
    summary: "Chat-based data analyst for spreadsheets and CSV exploration.",
    description:
      "Julius lets non-experts upload data and ask questions to get charts, stats, and Python-backed analyses.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["data-analysis", "csv", "charts", "python"],
    strengths: ["Approachable analytics chat", "Code-backed answers"],
    limits: ["Not a full BI platform"],
    audience: ["Analysts", "Operators"],
    categories: ["data-analytics"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Hex",
    slug: "hex",
    publisher: "Hex",
    url: "https://hex.tech",
    summary: "Collaborative analytics notebooks with AI assist for data teams.",
    description:
      "Hex combines SQL/Python notebooks, apps, and AI assistance for modern data team workflows.",
    pricing_model: "Paid",
    price_display: "Team plans",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["notebooks", "sql", "analytics", "collaboration"],
    strengths: ["Great for data teams", "AI + notebooks"],
    limits: ["Paid for serious use"],
    audience: ["Data teams"],
    categories: ["data-analytics"],
    type: "platform",
    platforms: ["web"],
  },

  // —— Search / agents ——
  {
    name: "Brave Leo",
    slug: "brave-leo",
    publisher: "Brave Software",
    url: "https://brave.com/leo/",
    summary: "Privacy-focused AI assistant built into the Brave browser.",
    description:
      "Leo helps with page summaries and chat inside Brave, with privacy-oriented positioning versus mainstream browser AIs.",
    pricing_model: "Freemium",
    price_display: "Free / Premium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["browser", "privacy", "assistant", "summaries"],
    strengths: ["Privacy angle", "In-browser help"],
    limits: ["Model quality depends on plan"],
    audience: ["Consumers", "Privacy users"],
    categories: ["ai-assistants", "productivity"],
    type: "extension",
    platforms: ["web"],
  },
  {
    name: "Arc Search",
    slug: "arc-search",
    publisher: "The Browser Company",
    url: "https://arc.net/search",
    summary: "AI search app that builds a quick summary page for your query.",
    description:
      "Arc Search Browse for Me compiles a readable summary page from the web, popular on mobile for fast answers.",
    pricing_model: "Free",
    price_display: "Free",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["search", "mobile", "summaries"],
    strengths: ["Fast summarized pages", "Clean UX"],
    limits: ["Not a full research suite"],
    audience: ["Consumers"],
    categories: ["research-education", "ai-assistants"],
    type: "tool",
    platforms: ["ios", "android"],
  },
  {
    name: "GenSpark",
    slug: "genspark",
    publisher: "GenSpark",
    url: "https://www.genspark.ai",
    summary: "AI search engine that generates custom Sparkpages for queries.",
    description:
      "GenSpark produces structured answer pages synthesizing web results for research-style questions.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["ai-search", "sparkpages", "research"],
    strengths: ["Structured answer pages", "Research UX"],
    limits: ["Newer than Perplexity-scale players"],
    audience: ["Researchers", "Professionals"],
    categories: ["research-education", "ai-assistants"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Manus AI",
    slug: "manus-ai",
    publisher: "Manus",
    url: "https://manus.im",
    summary: "Autonomous AI agent product for multi-step computer tasks.",
    description:
      "Manus is positioned as a general AI agent that can carry out multi-step tasks across tools and the web.",
    pricing_model: "Freemium",
    price_display: "Credits / plans",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["agent", "autonomous", "tasks"],
    strengths: ["End-to-end agent framing", "High visibility"],
    limits: ["Reliability varies by task"],
    audience: ["Builders", "Professionals"],
    categories: ["automation-agents", "ai-assistants"],
    type: "agent",
    platforms: ["web"],
  },

  // —— Dev tools adjacent ——
  {
    name: "Hugging Face Hub",
    slug: "huggingface-hub",
    publisher: "Hugging Face",
    url: "https://huggingface.co",
    summary: "The standard hub for open models, datasets, and ML demos.",
    description:
      "Hugging Face Hub hosts models, datasets, Spaces demos, and inference options used across the open ML ecosystem.",
    pricing_model: "Freemium",
    price_display: "Free / Pro / Enterprise",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["models", "datasets", "open-source", "inference"],
    strengths: ["De facto open ML hub", "Huge model catalog"],
    limits: ["Quality varies by community model"],
    audience: ["Developers", "Researchers"],
    categories: ["coding-development", "research-education"],
    type: "platform",
    platforms: ["web", "python"],
  },
  {
    name: "Replicate",
    slug: "replicate-com",
    publisher: "Replicate",
    url: "https://replicate.com",
    summary: "Run open models via API without managing GPUs.",
    description:
      "Replicate hosts community and official models behind simple HTTP APIs for image, video, audio, and LLMs.",
    pricing_model: "Paid",
    price_display: "Usage-based",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["inference", "api", "open-models", "gpu"],
    strengths: ["Easy model APIs", "Large model zoo"],
    limits: ["Cold starts / cost management"],
    audience: ["Developers"],
    categories: ["coding-development", "image-generation"],
    type: "api",
    platforms: ["web", "python"],
  },
];

const PLATFORM_ALIASES = { chrome: "web", docker: "self-hosted" };
const TYPE_ALIASES = { agent: "agent" };

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

async function ensureSolutionType(sb, slug, name) {
  let id = await idBySlug(sb, "solution_types", slug);
  if (id) return id;
  const { data, error } = await sb
    .from("solution_types")
    .insert({ slug, name })
    .select("id")
    .single();
  if (error) {
    // race / exists
    id = await idBySlug(sb, "solution_types", slug);
    if (id) return id;
    throw error;
  }
  return data.id;
}

async function upsertTool(sb, tool) {
  const { data: existingSlug } = await sb
    .from("tools")
    .select("id")
    .eq("slug", tool.slug)
    .maybeSingle();
  if (existingSlug?.id) {
    // Still refresh logo if missing
    const logo_url = logoFor(tool.url);
    await sb
      .from("tools")
      .update({ logo_url, updated_at: new Date().toISOString() })
      .eq("id", existingSlug.id)
      .is("logo_url", null);
    console.log(`[skip] exists ${tool.slug}`);
    return "skipped";
  }

  // Avoid near-duplicates by official URL when possible
  const { data: byUrl } = await sb
    .from("tools")
    .select("id, slug")
    .eq("official_url", tool.url)
    .maybeSingle();
  if (byUrl?.id) {
    console.log(`[skip] url owned by ${byUrl.slug}`);
    return "skipped";
  }

  const publisherId = await ensurePublisher(sb, tool.publisher);
  const sourceId = await ensureSource(sb, tool.url);
  const logo_url = logoFor(tool.url);

  const { data: inserted, error } = await sb
    .from("tools")
    .insert({
      name: tool.name,
      slug: tool.slug,
      publisher_id: publisherId,
      summary: tool.summary,
      description: tool.description,
      official_url: tool.url,
      logo_url,
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

  const typeSlug = TYPE_ALIASES[tool.type] ?? tool.type;
  let typeId = await idBySlug(sb, "solution_types", typeSlug);
  if (!typeId && typeSlug === "agent") {
    typeId = await ensureSolutionType(sb, "agent", "Agent");
  }
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

  console.log(`[tool] inserted ${tool.slug}`);
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
  const { count: withLogo } = await sb
    .from("tools")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")
    .not("logo_url", "is", null);

  console.log(`[done] inserted=${inserted} skipped=${skipped} failed=${failed}`);
  console.log(`[done] published=${published} with_logo=${withLogo}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
