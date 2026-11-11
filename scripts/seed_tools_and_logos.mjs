/**
 * Backfill logo_url for all tools + insert additional published tools with logos.
 * Usage: node scripts/seed_tools_and_logos.mjs
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
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host || null;
  } catch {
    return null;
  }
}

function logoFor(urlOrDomain) {
  const domain = urlOrDomain.includes("://")
    ? domainFromUrl(urlOrDomain)
    : urlOrDomain.replace(/^www\./, "");
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(domain)}`;
}

/** Curated additions inspired by common AI directories (AIxploria-style coverage). */
const NEW_TOOLS = [
  {
    name: "LM Studio",
    slug: "lm-studio",
    publisher: "LM Studio",
    url: "https://lmstudio.ai",
    summary: "Desktop app to download and run local LLMs with a ChatGPT-like UI.",
    description:
      "LM Studio lets you discover, download, and run open models locally on macOS, Windows, and Linux, with a local server compatible with OpenAI-style APIs.",
    pricing_model: "Free",
    price_display: "Free",
    open_source: false,
    api_available: true,
    local_available: true,
    keywords: ["local", "llm", "offline", "desktop", "gguf"],
    strengths: ["Easy local model runner", "Local OpenAI-compatible server"],
    limits: ["Hardware dependent", "Model quality varies"],
    audience: ["Developers", "Builders"],
    categories: ["coding-development", "ai-assistants"],
    type: "tool",
    platforms: ["macos", "windows", "linux", "self-hosted"],
  },
  {
    name: "GPT4All",
    slug: "gpt4all",
    publisher: "Nomic AI",
    url: "https://www.nomic.ai/gpt4all",
    summary: "Open-source ecosystem for running chat LLMs locally on everyday hardware.",
    description:
      "GPT4All provides a desktop chat client and open models you can run offline for private local assistants.",
    pricing_model: "Open source",
    price_display: "Open source",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["local", "open-source", "offline", "llm"],
    strengths: ["Fully local", "Open models"],
    limits: ["Weaker than frontier cloud models"],
    audience: ["Developers", "Privacy-focused users"],
    categories: ["ai-assistants", "coding-development"],
    type: "open-source",
    platforms: ["macos", "windows", "linux", "self-hosted"],
  },
  {
    name: "Open WebUI",
    slug: "open-webui",
    publisher: "Open WebUI",
    url: "https://openwebui.com",
    summary: "Self-hosted web UI for chatting with local and remote LLMs.",
    description:
      "Open WebUI is an extensible, self-hosted interface for Ollama and OpenAI-compatible backends with user management and RAG features.",
    pricing_model: "Open source",
    price_display: "Open source",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["self-host", "ollama", "chat", "rag"],
    strengths: ["Polished self-hosted chat UI", "Works with Ollama"],
    limits: ["Requires hosting/ops"],
    audience: ["Developers", "Teams"],
    categories: ["ai-assistants", "automation-agents"],
    type: "open-source",
    platforms: ["web", "self-hosted", "docker"],
  },
  {
    name: "Qdrant",
    slug: "qdrant",
    publisher: "Qdrant",
    url: "https://qdrant.tech",
    summary: "Open-source vector database for semantic search and RAG.",
    description:
      "Qdrant stores embeddings with filtering and hybrid retrieval for production RAG and recommendation systems.",
    pricing_model: "Open source",
    price_display: "Open source / Cloud",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["vector-db", "rag", "search", "embeddings"],
    strengths: ["Strong filtering", "Cloud + self-host"],
    limits: ["Ops overhead if self-hosting"],
    audience: ["Developers"],
    categories: ["data-analytics", "coding-development"],
    type: "platform",
    platforms: ["web", "self-hosted", "python"],
  },
  {
    name: "Milvus",
    slug: "milvus",
    publisher: "Zilliz",
    url: "https://milvus.io",
    summary: "Cloud-native open-source vector database for massive-scale similarity search.",
    description:
      "Milvus is designed for large-scale embedding search with indexes optimized for AI retrieval workloads.",
    pricing_model: "Open source",
    price_display: "Open source / Zilliz Cloud",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["vector-db", "rag", "similarity-search"],
    strengths: ["Scales to large corpora", "Rich index options"],
    limits: ["Heavier operational footprint"],
    audience: ["Developers", "Enterprises"],
    categories: ["data-analytics", "coding-development"],
    type: "platform",
    platforms: ["self-hosted", "web", "python"],
  },
  {
    name: "Voyage AI",
    slug: "voyage-ai",
    publisher: "Voyage AI",
    url: "https://www.voyageai.com",
    summary: "Embedding and reranking models optimized for retrieval quality.",
    description:
      "Voyage AI provides embedding and rerank APIs commonly used to improve RAG retrieval precision.",
    pricing_model: "Paid",
    price_display: "Usage-based",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["embeddings", "rerank", "rag", "api"],
    strengths: ["Retrieval-focused models", "Simple API"],
    limits: ["Paid usage", "Cloud-only"],
    audience: ["Developers"],
    categories: ["coding-development", "data-analytics"],
    type: "api",
    platforms: ["web", "python"],
  },
  {
    name: "AssemblyAI",
    slug: "assemblyai",
    publisher: "AssemblyAI",
    url: "https://www.assemblyai.com",
    summary: "Speech-to-text and audio intelligence API for apps and agents.",
    description:
      "AssemblyAI offers transcription, speaker labels, summarization, and real-time speech APIs for builders.",
    pricing_model: "Freemium",
    price_display: "Free tier / usage",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["speech-to-text", "transcription", "audio", "api"],
    strengths: ["Developer-friendly STT API", "Audio understanding features"],
    limits: ["Cloud dependency"],
    audience: ["Developers"],
    categories: ["audio-music", "coding-development"],
    type: "api",
    platforms: ["web", "python", "javascript"],
  },
  {
    name: "Deepgram",
    slug: "deepgram",
    publisher: "Deepgram",
    url: "https://deepgram.com",
    summary: "Real-time and batch speech recognition API built for developers.",
    description:
      "Deepgram provides fast speech-to-text, text-to-speech, and voice agent APIs with streaming support.",
    pricing_model: "Freemium",
    price_display: "Free credits / usage",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["speech-to-text", "realtime", "voice", "api"],
    strengths: ["Low-latency streaming STT", "Voice agent toolkit"],
    limits: ["Usage pricing"],
    audience: ["Developers"],
    categories: ["audio-music", "coding-development"],
    type: "api",
    platforms: ["web", "python", "javascript"],
  },
  {
    name: "Play.ht",
    slug: "play-ht",
    publisher: "Play.ht",
    url: "https://play.ht",
    summary: "AI text-to-speech platform with realistic voices for creators and products.",
    description:
      "Play.ht turns text into natural speech with a large voice library and APIs for apps and media workflows.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["tts", "voice", "text-to-speech"],
    strengths: ["Many voice styles", "Creator + API use"],
    limits: ["Quality/latency vary by voice"],
    audience: ["Creators", "Marketers"],
    categories: ["audio-music", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "D-ID",
    slug: "d-id",
    publisher: "D-ID",
    url: "https://www.d-id.com",
    summary: "AI talking-avatar video generation from text or audio.",
    description:
      "D-ID creates presenter-style videos by animating faces/avatars from scripts, useful for training and marketing.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["avatar", "video", "presenter", "tts"],
    strengths: ["Fast talking-head videos", "API available"],
    limits: ["Avatar realism varies"],
    audience: ["Marketers", "Educators"],
    categories: ["video-generation", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Uizard",
    slug: "uizard",
    publisher: "Uizard",
    url: "https://uizard.io",
    summary: "AI UI design tool that turns text or sketches into editable mockups.",
    description:
      "Uizard helps product teams generate wireframes and UI designs from prompts, screenshots, or hand sketches.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["ui", "design", "wireframe", "prototype"],
    strengths: ["Fast mockups from text", "Screenshot-to-design"],
    limits: ["Polish still needs designers"],
    audience: ["Product teams", "Designers"],
    categories: ["design-creativity", "productivity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Beautiful.ai",
    slug: "beautiful-ai",
    publisher: "Beautiful.ai",
    url: "https://www.beautiful.ai",
    summary: "AI presentation software that auto-formats slides as you create.",
    description:
      "Beautiful.ai helps teams build decks faster with smart templates and adaptive slide layouts.",
    pricing_model: "Freemium",
    price_display: "Freemium / paid plans",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["presentation", "slides", "decks"],
    strengths: ["Auto layout", "Team templates"],
    limits: ["Less flexible than PowerPoint for complex decks"],
    audience: ["Business users"],
    categories: ["productivity", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Photoroom",
    slug: "photoroom",
    publisher: "Photoroom",
    url: "https://www.photoroom.com",
    summary: "AI background removal and product photo studio for ecommerce.",
    description:
      "Photoroom removes backgrounds, generates studio scenes, and batch-edits product imagery for sellers and marketers.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["background-removal", "product-photos", "ecommerce"],
    strengths: ["Strong product cutouts", "Mobile + web"],
    limits: ["Complex scenes may need cleanup"],
    audience: ["Ecommerce", "Creators"],
    categories: ["image-generation", "business-marketing"],
    type: "tool",
    platforms: ["web", "ios", "android"],
  },
  {
    name: "remove.bg",
    slug: "remove-bg",
    publisher: "Kaleido AI",
    url: "https://www.remove.bg",
    summary: "One-click AI background removal for images.",
    description:
      "remove.bg specializes in fast background removal via web UI and API for design and ecommerce workflows.",
    pricing_model: "Freemium",
    price_display: "Free limited / credits",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["background-removal", "images", "api"],
    strengths: ["Very fast cutouts", "Simple API"],
    limits: ["Credit-based pricing"],
    audience: ["Designers", "Developers"],
    categories: ["image-generation", "design-creativity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "ComfyUI",
    slug: "comfyui",
    publisher: "Comfy Org",
    url: "https://github.com/comfyanonymous/ComfyUI",
    summary: "Node-based open-source UI for advanced Stable Diffusion workflows.",
    description:
      "ComfyUI is a modular graph interface for local image/video generation pipelines with fine-grained control.",
    pricing_model: "Open source",
    price_display: "Open source",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["stable-diffusion", "local", "nodes", "image"],
    strengths: ["Powerful local workflows", "Extensible nodes"],
    limits: ["Steep learning curve"],
    audience: ["Creators", "Developers"],
    categories: ["image-generation", "design-creativity"],
    type: "open-source",
    platforms: ["windows", "macos", "linux", "self-hosted"],
  },
  {
    name: "Flowise",
    slug: "flowise",
    publisher: "FlowiseAI",
    url: "https://flowiseai.com",
    summary: "Open-source visual builder for LLM apps and agents.",
    description:
      "Flowise lets teams drag-and-drop LangChain-style flows for chatbots, RAG, and agents, with self-host options.",
    pricing_model: "Open source",
    price_display: "Open source / Cloud",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["agents", "low-code", "rag", "langchain"],
    strengths: ["Visual LLM flows", "Self-host friendly"],
    limits: ["Complex agents need engineering"],
    audience: ["Developers", "Builders"],
    categories: ["automation-agents", "coding-development"],
    type: "framework",
    platforms: ["web", "self-hosted"],
  },
  {
    name: "Dify",
    slug: "dify",
    publisher: "Dify",
    url: "https://dify.ai",
    summary: "Open-source LLM app platform for agents, RAG, and workflows.",
    description:
      "Dify provides a backend + studio to build production AI apps with prompt ops, knowledge bases, and agent workflows.",
    pricing_model: "Open source",
    price_display: "Open source / Cloud",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["rag", "agents", "llmops", "self-host"],
    strengths: ["Full app platform", "Knowledge base tooling"],
    limits: ["Self-host setup effort"],
    audience: ["Developers", "Teams"],
    categories: ["automation-agents", "coding-development"],
    type: "platform",
    platforms: ["web", "self-hosted"],
  },
  {
    name: "Langfuse",
    slug: "langfuse",
    publisher: "Langfuse",
    url: "https://langfuse.com",
    summary: "Open-source observability and analytics for LLM applications.",
    description:
      "Langfuse traces prompts, generations, and agent runs to help teams debug quality, cost, and latency.",
    pricing_model: "Open source",
    price_display: "Open source / Cloud",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["observability", "tracing", "llmops", "evals"],
    strengths: ["Detailed traces", "Self-host option"],
    limits: ["Needs instrumentation"],
    audience: ["Developers"],
    categories: ["coding-development", "data-analytics"],
    type: "platform",
    platforms: ["web", "self-hosted"],
  },
  {
    name: "Opus Clip",
    slug: "opus-clip",
    publisher: "OpusClip",
    url: "https://www.opus.pro",
    summary: "AI video repurposing that turns long videos into short clips.",
    description:
      "Opus Clip finds viral moments, reframes for social, and captions clips from podcasts and YouTube videos.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["short-form", "clips", "captions", "youtube"],
    strengths: ["Automated highlight detection", "Social formats"],
    limits: ["Editorial judgment still needed"],
    audience: ["Creators", "Marketers"],
    categories: ["video-generation", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "InVideo",
    slug: "invideo",
    publisher: "InVideo",
    url: "https://invideo.io",
    summary: "AI video generator for marketing clips, explainers, and social content.",
    description:
      "InVideo generates scripted videos from text prompts with templates, stock media, and editing tools.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["video", "marketing", "templates", "social"],
    strengths: ["Fast template videos", "Text-to-video workflows"],
    limits: ["Stock-heavy look unless customized"],
    audience: ["Marketers", "Creators"],
    categories: ["video-generation", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "VEED",
    slug: "veed",
    publisher: "VEED",
    url: "https://www.veed.io",
    summary: "Browser video editor with AI captions, cleanup, and generation helpers.",
    description:
      "VEED is an online editor for social videos with automatic subtitles, eye-contact correction, and AI assist features.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["video-editor", "captions", "social"],
    strengths: ["Easy captions", "Browser-based editing"],
    limits: ["Advanced timelines less deep than desktop NLEs"],
    audience: ["Creators", "Teams"],
    categories: ["video-generation", "productivity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Speechify",
    slug: "speechify",
    publisher: "Speechify",
    url: "https://speechify.com",
    summary: "AI text-to-speech reader for documents, web pages, and PDFs.",
    description:
      "Speechify converts written content into natural audio for listening on mobile and desktop, popular for accessibility and studying.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["tts", "reader", "accessibility", "pdf"],
    strengths: ["Natural voices", "Cross-device reading"],
    limits: ["Premium voices behind paywall"],
    audience: ["Students", "Professionals"],
    categories: ["audio-music", "productivity"],
    type: "tool",
    platforms: ["web", "ios", "android", "chrome"],
  },
  {
    name: "AIVA",
    slug: "aiva",
    publisher: "AIVA Technologies",
    url: "https://www.aiva.ai",
    summary: "AI music composition tool for soundtracks and emotional scores.",
    description:
      "AIVA generates original music compositions that creators can edit and license for films, games, and ads.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["music", "composition", "soundtrack"],
    strengths: ["Cinematic scoring focus", "Editable compositions"],
    limits: ["Creative control still limited vs human composers"],
    audience: ["Creators", "Game studios"],
    categories: ["audio-music", "design-creativity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Soundraw",
    slug: "soundraw",
    publisher: "Soundraw",
    url: "https://soundraw.io",
    summary: "Royalty-free AI music generator for creators and YouTubers.",
    description:
      "Soundraw creates customizable instrumental tracks with mood/length controls for content creators.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["music", "royalty-free", "youtube"],
    strengths: ["Easy customization", "Creator licensing"],
    limits: ["Mostly instrumental"],
    audience: ["Creators"],
    categories: ["audio-music", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Bardeen",
    slug: "bardeen",
    publisher: "Bardeen",
    url: "https://www.bardeen.ai",
    summary: "AI browser automation for repetitive web workflows.",
    description:
      "Bardeen builds automations across browser tabs and SaaS tools, including AI-assisted playbooks for research and ops tasks.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["automation", "browser", "playbooks"],
    strengths: ["Browser-native automations", "AI playbook builder"],
    limits: ["Site changes can break flows"],
    audience: ["Operators", "Growth teams"],
    categories: ["automation-agents", "productivity"],
    type: "extension",
    platforms: ["web", "chrome"],
  },
  {
    name: "Rytr",
    slug: "rytr",
    publisher: "Rytr",
    url: "https://rytr.me",
    summary: "Budget AI writing assistant for short-form marketing copy.",
    description:
      "Rytr generates emails, ads, blogs, and social posts with templates aimed at freelancers and small businesses.",
    pricing_model: "Freemium",
    price_display: "Free plan / paid",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["copywriting", "marketing", "templates"],
    strengths: ["Affordable", "Many use-case templates"],
    limits: ["Long-form quality uneven"],
    audience: ["Freelancers", "SMBs"],
    categories: ["writing-content", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Anyword",
    slug: "anyword",
    publisher: "Anyword",
    url: "https://www.anyword.com",
    summary: "AI copywriting platform with performance prediction for marketing teams.",
    description:
      "Anyword generates and scores marketing copy using predictive analytics tuned for conversion-oriented messaging.",
    pricing_model: "Paid",
    price_display: "Paid plans",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["copywriting", "conversion", "ads"],
    strengths: ["Copy scoring", "Marketing-focused"],
    limits: ["Pricing geared to teams"],
    audience: ["Marketers"],
    categories: ["writing-content", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Exa",
    slug: "exa",
    publisher: "Exa",
    url: "https://exa.ai",
    summary: "Neural search API for finding high-signal web pages for agents and RAG.",
    description:
      "Exa (formerly Metaphor) provides semantic web search APIs optimized for LLM grounding and research agents.",
    pricing_model: "Freemium",
    price_display: "Free credits / usage",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["search", "rag", "agents", "api"],
    strengths: ["LLM-oriented search", "Clean API"],
    limits: ["Coverage depends on index"],
    audience: ["Developers"],
    categories: ["research-education", "coding-development"],
    type: "api",
    platforms: ["web", "python"],
  },
  {
    name: "Tavily",
    slug: "tavily",
    publisher: "Tavily",
    url: "https://tavily.com",
    summary: "Search API purpose-built for AI agents and RAG pipelines.",
    description:
      "Tavily returns concise, citation-friendly web results designed for agent tool-calling and retrieval workflows.",
    pricing_model: "Freemium",
    price_display: "Free tier / usage",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["search", "agents", "rag", "citations"],
    strengths: ["Agent-ready search", "Simple integration"],
    limits: ["Usage limits on free tier"],
    audience: ["Developers"],
    categories: ["research-education", "automation-agents"],
    type: "api",
    platforms: ["web", "python"],
  },
  {
    name: "Fathom",
    slug: "fathom",
    publisher: "Fathom",
    url: "https://fathom.video",
    summary: "AI meeting recorder that summarizes calls and extracts action items.",
    description:
      "Fathom joins Zoom/Meet/Teams calls to record, transcribe, and summarize meetings for sales and team follow-ups.",
    pricing_model: "Freemium",
    price_display: "Free plan / paid",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["meetings", "transcription", "notes"],
    strengths: ["Strong meeting summaries", "Easy setup"],
    limits: ["Requires meeting bot access"],
    audience: ["Sales", "Teams"],
    categories: ["productivity", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "tl;dv",
    slug: "tldv",
    publisher: "tl;dv",
    url: "https://tldv.io",
    summary: "AI meeting notes and clip sharing for customer and team calls.",
    description:
      "tl;dv records meetings, generates searchable transcripts, and helps teams share highlight clips across CRM workflows.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["meetings", "clips", "crm", "notes"],
    strengths: ["Highlight clips", "Integrations"],
    limits: ["Transcription quality varies by audio"],
    audience: ["Sales", "Customer success"],
    categories: ["productivity", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Granola",
    slug: "granola",
    publisher: "Granola",
    url: "https://www.granola.ai",
    summary: "AI notepad for meetings that enhances your own notes instead of full bot recording.",
    description:
      "Granola combines lightweight recording with your typed notes to produce clean meeting summaries without a visible meeting bot.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: true,
    keywords: ["meetings", "notes", "macos"],
    strengths: ["Less intrusive than bots", "Great enhanced notes"],
    limits: ["Platform availability may be limited"],
    audience: ["Founders", "Operators"],
    categories: ["productivity"],
    type: "tool",
    platforms: ["macos"],
  },
  {
    name: "Kimi",
    slug: "kimi",
    publisher: "Moonshot AI",
    url: "https://www.moonshot.cn",
    summary: "Long-context AI assistant from Moonshot AI for research and documents.",
    description:
      "Kimi is Moonshot AI’s assistant known for long-context document analysis and web-grounded answers.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["assistant", "long-context", "research"],
    strengths: ["Long context", "Document workflows"],
    limits: ["Availability/region varies"],
    audience: ["Researchers", "Professionals"],
    categories: ["ai-assistants", "research-education"],
    type: "model",
    platforms: ["web"],
  },
  {
    name: "Qwen",
    slug: "qwen",
    publisher: "Alibaba Cloud",
    url: "https://qwenlm.github.io",
    summary: "Alibaba’s Qwen family of open and API LLMs for chat, code, and multimodal tasks.",
    description:
      "Qwen models are widely used open-weight and API models spanning chat, coding, vision, and agent scenarios.",
    pricing_model: "Open source",
    price_display: "Open weights / API",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["llm", "open-weight", "multimodal", "code"],
    strengths: ["Strong open models", "Broad modality coverage"],
    limits: ["Hosting required for local use"],
    audience: ["Developers"],
    categories: ["ai-assistants", "coding-development"],
    type: "model",
    platforms: ["web", "self-hosted"],
  },
  {
    name: "fal.ai",
    slug: "fal-ai",
    publisher: "fal",
    url: "https://fal.ai",
    summary: "Serverless API platform for fast generative media models.",
    description:
      "fal.ai hosts optimized inference endpoints for image, video, and audio models with low-latency serverless APIs.",
    pricing_model: "Paid",
    price_display: "Usage-based",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["inference", "image", "video", "api", "serverless"],
    strengths: ["Fast generative APIs", "Many model endpoints"],
    limits: ["Usage costs"],
    audience: ["Developers"],
    categories: ["image-generation", "coding-development"],
    type: "api",
    platforms: ["web", "python", "javascript"],
  },
  {
    name: "PicWish",
    slug: "picwish",
    publisher: "PicWish",
    url: "https://picwish.com",
    summary: "AI image toolkit for background removal, enhancement, and cleanup.",
    description:
      "PicWish offers web tools to remove backgrounds, upscale, and restore photos for quick creative edits.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["background-removal", "enhance", "photos"],
    strengths: ["Simple photo utilities", "Batch options"],
    limits: ["Advanced edits limited"],
    audience: ["Creators", "SMBs"],
    categories: ["image-generation", "design-creativity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Clipdrop",
    slug: "clipdrop",
    publisher: "Stability AI",
    url: "https://clipdrop.co",
    summary: "Creative AI suite for cleanup, relighting, and image generation utilities.",
    description:
      "Clipdrop provides browser tools and APIs for object removal, background replacement, and generative image helpers.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["image-editing", "cleanup", "api"],
    strengths: ["Handy creative utilities", "API access"],
    limits: ["Credits for heavy use"],
    audience: ["Designers", "Creators"],
    categories: ["image-generation", "design-creativity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Topaz Labs",
    slug: "topaz-labs",
    publisher: "Topaz Labs",
    url: "https://www.topazlabs.com",
    summary: "AI photo and video enhancement suite for upscaling and restoration.",
    description:
      "Topaz Labs apps (Photo AI, Video AI) upscale, denoise, and sharpen media for professionals.",
    pricing_model: "Paid",
    price_display: "Paid licenses",
    open_source: false,
    api_available: false,
    local_available: true,
    keywords: ["upscale", "denoise", "photo", "video"],
    strengths: ["Pro-grade enhancement", "Local desktop apps"],
    limits: ["Paid licenses", "GPU recommended"],
    audience: ["Photographers", "Video editors"],
    categories: ["image-generation", "video-generation"],
    type: "tool",
    platforms: ["windows", "macos"],
  },
  {
    name: "Voiceflow",
    slug: "voiceflow",
    publisher: "Voiceflow",
    url: "https://www.voiceflow.com",
    summary: "Collaborative platform to design and launch AI agents and chat experiences.",
    description:
      "Voiceflow helps product and CX teams prototype, collaborate on, and deploy conversational AI agents.",
    pricing_model: "Freemium",
    price_display: "Freemium / paid",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["agents", "chatbots", "cx", "design"],
    strengths: ["Team collaboration", "Agent design canvas"],
    limits: ["Advanced logic needs engineering"],
    audience: ["Product", "CX teams"],
    categories: ["automation-agents", "business-marketing"],
    type: "platform",
    platforms: ["web"],
  },
  {
    name: "Botpress",
    slug: "botpress",
    publisher: "Botpress",
    url: "https://botpress.com",
    summary: "Open-core platform for building chat agents with visual flows and LLMs.",
    description:
      "Botpress provides a studio to build, test, and deploy AI chatbots with integrations and knowledge bases.",
    pricing_model: "Freemium",
    price_display: "Free / Cloud",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["chatbot", "agents", "open-core"],
    strengths: ["Visual agent builder", "Self-host options"],
    limits: ["Enterprise features on paid plans"],
    audience: ["Developers", "CX"],
    categories: ["automation-agents", "coding-development"],
    type: "platform",
    platforms: ["web", "self-hosted"],
  },
  {
    name: "Jan",
    slug: "jan-ai",
    publisher: "Jan",
    url: "https://jan.ai",
    summary: "Open-source ChatGPT-style desktop app for local models.",
    description:
      "Jan is an offline-friendly AI desktop client that runs local models with an OpenAI-compatible local API.",
    pricing_model: "Open source",
    price_display: "Open source",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["local", "desktop", "offline", "llm"],
    strengths: ["Clean local chat UX", "Open source"],
    limits: ["Depends on local hardware"],
    audience: ["Developers", "Privacy users"],
    categories: ["ai-assistants", "coding-development"],
    type: "open-source",
    platforms: ["macos", "windows", "linux", "self-hosted"],
  },
  {
    name: "AnythingLLM",
    slug: "anythingllm",
    publisher: "Mintplex Labs",
    url: "https://anythingllm.com",
    summary: "All-in-one local/private RAG and agent desktop for documents.",
    description:
      "AnythingLLM lets individuals and teams chat with documents using local or cloud models, with multi-user and agent features.",
    pricing_model: "Open source",
    price_display: "Open source / Cloud",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["rag", "documents", "local", "agents"],
    strengths: ["Private document chat", "Flexible model backends"],
    limits: ["Setup quality depends on embedding/model choices"],
    audience: ["Teams", "Developers"],
    categories: ["research-education", "productivity"],
    type: "tool",
    platforms: ["web", "self-hosted", "macos", "windows"],
  },
  {
    name: "Modal",
    slug: "modal",
    publisher: "Modal",
    url: "https://modal.com",
    summary: "Serverless cloud for running AI/ML jobs, inference, and batch workloads.",
    description:
      "Modal lets developers run Python/AI workloads in the cloud with simple deploy primitives for GPUs and jobs.",
    pricing_model: "Paid",
    price_display: "Usage-based",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["gpu", "serverless", "inference", "python"],
    strengths: ["Fast GPU bring-up", "Python-native DX"],
    limits: ["Cloud spend management needed"],
    audience: ["Developers", "ML teams"],
    categories: ["coding-development", "data-analytics"],
    type: "platform",
    platforms: ["web", "python"],
  },
  {
    name: "Weights & Biases",
    slug: "weights-biases",
    publisher: "Weights & Biases",
    url: "https://wandb.ai",
    summary: "MLOps platform for experiment tracking, evals, and model monitoring.",
    description:
      "W&B helps AI teams track experiments, datasets, and LLM evaluations across research and production workflows.",
    pricing_model: "Freemium",
    price_display: "Free tier / paid",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["mlops", "experiments", "evals"],
    strengths: ["Industry-standard tracking", "LLM eval tooling"],
    limits: ["Team pricing for advanced features"],
    audience: ["ML teams"],
    categories: ["data-analytics", "coding-development"],
    type: "platform",
    platforms: ["web", "python"],
  },
  {
    name: "Pictory",
    slug: "pictory",
    publisher: "Pictory",
    url: "https://pictory.ai",
    summary: "Turn scripts and long videos into short branded marketing clips.",
    description:
      "Pictory converts blog posts and transcripts into videos with stock footage, captions, and branding.",
    pricing_model: "Paid",
    price_display: "Subscription",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["video", "marketing", "repurposing"],
    strengths: ["Script-to-video", "Captioned social clips"],
    limits: ["Template look without customization"],
    audience: ["Marketers"],
    categories: ["video-generation", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Looka",
    slug: "looka",
    publisher: "Looka",
    url: "https://looka.com",
    summary: "AI logo and brand kit generator for startups and small businesses.",
    description:
      "Looka generates logo options and brand assets from a few business inputs for quick branding starts.",
    pricing_model: "Paid",
    price_display: "One-time / packages",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["logo", "branding", "identity"],
    strengths: ["Fast brand starters", "Brand kit exports"],
    limits: ["Not a substitute for custom design studios"],
    audience: ["Startups", "SMBs"],
    categories: ["design-creativity", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
];

const PLATFORM_ALIASES = {
  chrome: "web",
  docker: "self-hosted",
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
  const { data, error } = await sb.from(table).select("id").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function idByKey(sb, table, key) {
  const { data, error } = await sb.from(table).select("id").eq("key", key).maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function backfillLogos(sb) {
  const { data: tools, error } = await sb
    .from("tools")
    .select("id, slug, official_url, logo_url");
  if (error) throw error;
  let updated = 0;
  for (const t of tools ?? []) {
    const next = logoFor(t.official_url);
    if (!next) continue;
    if (t.logo_url === next) continue;
    const { error: upErr } = await sb
      .from("tools")
      .update({ logo_url: next, updated_at: new Date().toISOString() })
      .eq("id", t.id);
    if (upErr) throw upErr;
    updated += 1;
  }
  console.log(`[logos] updated ${updated}/${tools?.length ?? 0}`);
}

async function upsertTool(sb, tool) {
  const publisherId = await ensurePublisher(sb, tool.publisher);
  const sourceId = await ensureSource(sb, tool.url);
  const logo_url = logoFor(tool.url);

  const { data: existing } = await sb
    .from("tools")
    .select("id, status")
    .eq("slug", tool.slug)
    .maybeSingle();

  const payload = {
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
    last_verified_at: new Date().toISOString().slice(0, 10),
    updated_at: new Date().toISOString(),
  };

  let toolId = existing?.id;
  if (!toolId) {
    const { data, error } = await sb
      .from("tools")
      .insert({ ...payload, status: "pending_review" })
      .select("id")
      .single();
    if (error) throw error;
    toolId = data.id;
    console.log(`[tool] inserted ${tool.slug}`);
  } else {
    const { error } = await sb.from("tools").update(payload).eq("id", toolId);
    if (error) throw error;
    console.log(`[tool] refreshed ${tool.slug}`);
  }

  // Categories
  for (let i = 0; i < tool.categories.length; i++) {
    const catId = await idBySlug(sb, "categories", tool.categories[i]);
    if (!catId) continue;
    await sb.from("tool_categories").upsert({
      tool_id: toolId,
      category_id: catId,
      is_primary: i === 0,
    });
  }

  // Type
  const typeId = await idBySlug(sb, "solution_types", tool.type);
  if (typeId) {
    await sb.from("tool_types").upsert({
      tool_id: toolId,
      solution_type_id: typeId,
      is_primary: true,
    });
  }

  // Platforms
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

  // Source claim
  await sb.from("tool_sources").upsert({
    tool_id: toolId,
    source_id: sourceId,
    claim_key: "general",
    verified_at: new Date().toISOString().slice(0, 10),
  });

  // Publish after junctions exist
  const { error: pubErr } = await sb
    .from("tools")
    .update({ status: "published", updated_at: new Date().toISOString() })
    .eq("id", toolId);
  if (pubErr) throw pubErr;
}

async function main() {
  const env = {
    ...loadEnv(join(ROOT, ".env.production")),
    ...loadEnv(join(ROOT, ".env")),
  };
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    console.error("Missing VITE_SUPABASE_URL/SUPABASE_URL or SUPABASE_SECRET_KEY");
    process.exit(1);
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  await backfillLogos(sb);

  let ok = 0;
  let fail = 0;
  for (const tool of NEW_TOOLS) {
    try {
      await upsertTool(sb, tool);
      ok += 1;
    } catch (err) {
      fail += 1;
      console.error(`[tool] FAILED ${tool.slug}:`, err.message || err);
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

  console.log(`[done] new/refreshed ok=${ok} fail=${fail}`);
  console.log(`[done] published=${published} with_logo=${withLogo}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
