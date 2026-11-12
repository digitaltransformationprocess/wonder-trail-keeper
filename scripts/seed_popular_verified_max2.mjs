/**
 * Second max batch of popular, well-known, verifiable AI tools still missing.
 * Skips existing slug/URL. Usage: node scripts/seed_popular_verified_max2.mjs
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
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
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
  const d = domainFromUrl(url);
  return d ? `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(d)}` : null;
}

/** Compact: [name, slug, publisher, url, summary, pricing, oss, api, local, cats[], type, platforms[], keywords[]] */
const RAW = [
  // Writing / SEO / detection
  ["TextCortex", "textcortex", "TextCortex", "https://textcortex.com", "AI writing assistant with templates, knowledge bases, and browser extension.", "Freemium", false, true, false, ["writing-content"], "tool", ["web"], ["writing", "templates"]],
  ["HyperWrite", "hyperwrite", "OthersideAI", "https://www.hyperwriteai.com", "Personal AI writing assistant for drafts, research, and autocomplete.", "Freemium", false, false, false, ["writing-content", "productivity"], "tool", ["web"], ["writing", "autocomplete"]],
  ["Compose AI", "compose-ai", "Compose AI", "https://www.compose.ai", "Browser AI autocomplete for faster email and document writing.", "Freemium", false, false, false, ["writing-content", "productivity"], "extension", ["web"], ["autocomplete", "email"]],
  ["Scalenut", "scalenut", "Scalenut", "https://www.scalenut.com", "AI SEO content platform for briefs, articles, and topical clusters.", "Paid", false, false, false, ["writing-content", "business-marketing"], "tool", ["web"], ["seo", "content"]],
  ["Koala AI", "koala-ai", "Koala", "https://koala.sh", "AI article writer popular for affiliate SEO and product reviews.", "Paid", false, false, false, ["writing-content", "business-marketing"], "tool", ["web"], ["seo", "affiliate"]],
  ["Byword", "byword", "Byword", "https://byword.ai", "Bulk AI article generation for programmatic SEO publishers.", "Paid", false, true, false, ["writing-content", "business-marketing"], "tool", ["web"], ["bulk-seo", "articles"]],
  ["Outranking", "outranking", "Outranking", "https://www.outranking.io", "SEO content optimization and AI drafting workflow for ranking pages.", "Paid", false, false, false, ["writing-content", "business-marketing"], "tool", ["web"], ["seo", "optimization"]],
  ["Originality.ai", "originality-ai", "Originality.ai", "https://originality.ai", "AI content detection and plagiarism checking widely used by publishers.", "Paid", false, true, false, ["writing-content"], "tool", ["web"], ["ai-detection", "plagiarism"]],
  ["GPTZero", "gptzero", "GPTZero", "https://gptzero.me", "Popular AI text detector used by educators and institutions.", "Freemium", false, true, false, ["writing-content", "research-education"], "tool", ["web"], ["ai-detection", "education"]],
  ["Copyleaks", "copyleaks", "Copyleaks", "https://copyleaks.com", "Enterprise plagiarism and AI content detection platform.", "Paid", false, true, false, ["writing-content", "research-education"], "platform", ["web"], ["plagiarism", "ai-detection"]],
  ["Sapling", "sapling-ai", "Sapling", "https://sapling.ai", "AI writing assistant and autocomplete for customer-facing teams.", "Freemium", false, true, false, ["writing-content", "business-marketing"], "tool", ["web"], ["autocomplete", "support"]],
  ["Wordtune Read", "wordtune-read", "AI21 Labs", "https://www.wordtune.com/read", "AI document reader that summarizes and extracts insights from long texts.", "Freemium", false, false, false, ["writing-content", "productivity"], "tool", ["web"], ["summaries", "reading"]],
  ["Smodin", "smodin", "Smodin", "https://smodin.io", "Multilingual AI writer, rewriter, and plagiarism tools for students and creators.", "Freemium", false, true, false, ["writing-content", "research-education"], "tool", ["web"], ["rewrite", "multilingual"]],
  ["Narrato", "narrato", "Narrato", "https://narrato.io", "Content workspace with AI writing, briefs, and editorial workflows.", "Paid", false, false, false, ["writing-content", "business-marketing"], "tool", ["web"], ["content-ops", "briefs"]],
  ["LongShot AI", "longshot-ai", "LongShot", "https://www.longshot.ai", "AI long-form content and factual writing assistant for SEO teams.", "Paid", false, false, false, ["writing-content", "business-marketing"], "tool", ["web"], ["long-form", "seo"]],

  // Design / image
  ["Picsart AI", "picsart-ai", "Picsart", "https://picsart.com", "Consumer creative suite with AI image generation, editing, and templates.", "Freemium", false, true, false, ["image-generation", "design-creativity"], "tool", ["web", "ios", "android"], ["editing", "templates"]],
  ["Fotor", "fotor", "Fotor", "https://www.fotor.com", "Online photo editor with AI backgrounds, enhance, and generative tools.", "Freemium", false, false, false, ["image-generation", "design-creativity"], "tool", ["web"], ["photo-edit", "ai-design"]],
  ["Pixelcut", "pixelcut", "Pixelcut", "https://www.pixelcut.ai", "Mobile-first AI product photo editor for backgrounds and batch ecommerce shots.", "Freemium", false, true, false, ["image-generation", "business-marketing"], "tool", ["ios", "android", "web"], ["ecommerce", "backgrounds"]],
  ["Evoto", "evoto", "Evoto", "https://www.evoto.ai", "Pro AI photo retouching popular with portrait and wedding photographers.", "Paid", false, false, false, ["image-generation"], "tool", ["windows", "macos"], ["retouch", "portraits"]],
  ["Luminar Neo", "luminar-neo", "Skylum", "https://skylum.com/luminar", "AI photo editor with generative tools, sky replacement, and relighting.", "Paid", false, false, false, ["image-generation", "design-creativity"], "tool", ["windows", "macos"], ["photo-edit", "generative"]],
  ["Facetune", "facetune", "Lightricks", "https://www.facetuneapp.com", "Popular mobile AI portrait retouching and selfie editing app.", "Freemium", false, false, false, ["image-generation"], "tool", ["ios", "android"], ["portraits", "retouch"]],
  ["DreamStudio", "dreamstudio", "Stability AI", "https://dreamstudio.ai", "Official Stability AI web app for Stable Diffusion image generation.", "Freemium", false, true, false, ["image-generation"], "tool", ["web"], ["stable-diffusion", "txt2img"]],
  ["Stockimg AI", "stockimg-ai", "Stockimg", "https://stockimg.ai", "AI generator for logos, posters, book covers, and stock-style graphics.", "Freemium", false, false, false, ["design-creativity", "business-marketing"], "tool", ["web"], ["logos", "stock"]],
  ["Icons8 Generated Photos", "generated-photos", "Icons8", "https://generated.photos", "Large library of AI-generated people photos for design and mockups.", "Freemium", false, true, false, ["image-generation", "design-creativity"], "tool", ["web"], ["stock-people", "faces"]],
  ["Visily", "visily", "Visily", "https://www.visily.ai", "AI UI design tool that turns screenshots and text into editable wireframes.", "Freemium", false, false, false, ["design-creativity", "coding-development"], "tool", ["web"], ["wireframes", "ui"]],
  ["Motiff", "motiff", "Motiff", "https://motiff.com", "AI-native UI design tool for generating and iterating product interfaces.", "Freemium", false, false, false, ["design-creativity"], "tool", ["web"], ["ui", "design"]],
  ["Banani", "banani", "Banani", "https://www.banani.co", "Text-to-UI design tool for rapid product mockups and prototypes.", "Freemium", false, false, false, ["design-creativity"], "tool", ["web"], ["ui", "prototyping"]],
  ["Recraft V3", "recraft-v3", "Recraft", "https://www.recraft.ai", "Vector/illustration-focused AI image model popular with designers.", "Freemium", false, true, false, ["image-generation", "design-creativity"], "model", ["web"], ["vector", "illustration"]],
  ["Ideogram Character", "ideogram-character", "Ideogram", "https://ideogram.ai", "Ideogram’s character-consistent generation features for brand/mascot work.", "Freemium", false, true, false, ["image-generation"], "tool", ["web"], ["characters", "consistency"]],
  ["Remaker AI", "remaker-ai", "Remaker", "https://remaker.ai", "Popular face-swap and AI image tools suite for creators.", "Freemium", false, false, false, ["image-generation", "video-generation"], "tool", ["web"], ["face-swap", "editing"]],

  // Video
  ["Lumen5", "lumen5", "Lumen5", "https://lumen5.com", "Turns blog posts and scripts into marketing videos with AI assistance.", "Freemium", false, false, false, ["video-generation", "business-marketing"], "tool", ["web"], ["marketing-video", "repurposing"]],
  ["Animaker", "animaker", "Animaker", "https://www.animaker.com", "Animation and video maker with AI helpers for explainers and social clips.", "Freemium", false, false, false, ["video-generation", "business-marketing"], "tool", ["web"], ["animation", "explainers"]],
  ["Biteable", "biteable", "Biteable", "https://biteable.com", "Template-first video maker for ads, intros, and social campaigns.", "Freemium", false, false, false, ["video-generation", "business-marketing"], "tool", ["web"], ["templates", "ads"]],
  ["Guidde", "guidde", "Guidde", "https://www.guidde.com", "AI creates how-to video documentation from browser workflows.", "Freemium", false, false, false, ["video-generation", "productivity"], "tool", ["web"], ["documentation", "how-to"]],
  ["Tella", "tella", "Tella", "https://www.tella.tv", "Polished screen recording studio with AI editing for product videos.", "Paid", false, false, false, ["video-generation", "productivity"], "tool", ["web", "macos"], ["screen-record", "product"]],
  ["Klap", "klap", "Klap", "https://klap.app", "AI turns long YouTube videos into vertical shorts with captions.", "Freemium", false, false, false, ["video-generation", "business-marketing"], "tool", ["web"], ["shorts", "clips"]],
  ["2short.ai", "2short-ai", "2short.ai", "https://2short.ai", "AI YouTube Shorts generator from long-form videos.", "Freemium", false, false, false, ["video-generation", "business-marketing"], "tool", ["web"], ["shorts", "youtube"]],
  ["Topaz Video AI", "topaz-video-ai", "Topaz Labs", "https://www.topazlabs.com/topaz-video-ai", "Industry-standard AI video upscaling, frame interpolation, and restoration.", "Paid", false, false, true, ["video-generation"], "tool", ["windows", "macos"], ["upscale", "restoration"]],
  ["Magic Hour", "magic-hour", "Magic Hour", "https://magichour.ai", "AI video generation and face-swap toolkit for creators and marketers.", "Freemium", false, true, false, ["video-generation"], "tool", ["web"], ["ai-video", "faces"]],
  ["Hedra", "hedra", "Hedra", "https://www.hedra.com", "Character-driven AI video generation from images and scripts.", "Freemium", false, true, false, ["video-generation"], "tool", ["web"], ["characters", "talking-heads"]],
  ["Haiper Video", "haiper-video", "Haiper", "https://haiper.ai", "Fast AI video generation model and web app for short clips.", "Freemium", false, true, false, ["video-generation"], "tool", ["web"], ["text-to-video", "clips"]],
  ["Pikaffects", "pikaffects", "Pika", "https://pika.art", "Pika’s effect-driven AI video tools for stylized motion clips.", "Freemium", false, false, false, ["video-generation"], "tool", ["web"], ["effects", "ai-video"]],
  ["InShot", "inshot", "InShot", "https://inshot.com", "Widely used mobile video editor with AI captions and enhance tools.", "Freemium", false, false, false, ["video-generation"], "tool", ["ios", "android"], ["mobile-edit", "captions"]],
  ["Wave.video", "wave-video", "Wave.video", "https://wave.video", "Online video maker and stock library with AI script and caption features.", "Freemium", false, false, false, ["video-generation", "business-marketing"], "tool", ["web"], ["marketing-video", "stock"]],
  ["Raw Shorts", "raw-shorts", "Raw Shorts", "https://www.rawshorts.com", "Explainer video platform with AI script-to-video workflows.", "Paid", false, false, false, ["video-generation", "business-marketing"], "tool", ["web"], ["explainers", "marketing"]],

  // Audio / voice / music
  ["Speechmatics", "speechmatics", "Speechmatics", "https://www.speechmatics.com", "Enterprise speech-to-text API known for accuracy across accents/languages.", "Paid", false, true, false, ["audio-music", "coding-development"], "api", ["web"], ["stt", "transcription"]],
  ["Rev AI", "rev-ai", "Rev", "https://www.rev.ai", "Speech recognition API from Rev for transcripts and captions.", "Paid", false, true, false, ["audio-music", "coding-development"], "api", ["web"], ["stt", "captions"]],
  ["Notta", "notta", "Notta", "https://www.notta.ai", "AI transcription and meeting notes app popular on mobile and web.", "Freemium", false, true, false, ["productivity", "audio-music"], "tool", ["web", "ios", "android"], ["transcription", "meetings"]],
  ["Sonix", "sonix", "Sonix", "https://sonix.ai", "Automated transcription/translation platform for media teams.", "Paid", false, true, false, ["audio-music", "productivity"], "tool", ["web"], ["transcription", "translation"]],
  ["Auphonic", "auphonic", "Auphonic", "https://auphonic.com", "Automatic audio post-production for podcasts: levels, noise, loudness.", "Freemium", false, true, false, ["audio-music"], "tool", ["web"], ["podcast", "mastering"]],
  ["LANDR", "landr", "LANDR", "https://www.landr.com", "AI mastering and music creation platform for producers and creators.", "Freemium", false, false, false, ["audio-music"], "platform", ["web"], ["mastering", "music"]],
  ["Voicemod", "voicemod", "Voicemod", "https://www.voicemod.net", "Real-time AI voice changer popular with gamers and streamers.", "Freemium", false, false, false, ["audio-music"], "tool", ["windows", "macos"], ["voice-changer", "streaming"]],
  ["Voice.ai", "voice-ai", "Voice.ai", "https://voice.ai", "Real-time voice cloning/changer app for calls, games, and content.", "Freemium", false, false, false, ["audio-music"], "tool", ["windows", "macos"], ["voice-clone", "realtime"]],
  ["Rask AI", "rask-ai", "Rask AI", "https://www.rask.ai", "AI video dubbing and localization platform for global content teams.", "Paid", false, true, false, ["audio-music", "video-generation"], "tool", ["web"], ["dubbing", "localization"]],
  ["Papercup", "papercup", "Papercup", "https://www.papercup.com", "AI dubbing studio used by broadcasters and publishers for localization.", "Paid", false, false, false, ["audio-music", "video-generation"], "platform", ["web"], ["dubbing", "broadcast"]],
  ["Narakeet", "narakeet", "Narakeet", "https://www.narakeet.com", "Text-to-video/voice tool with many TTS voices for explainer content.", "Paid", false, true, false, ["audio-music", "video-generation"], "tool", ["web"], ["tts", "explainers"]],
  ["Fish Audio", "fish-audio", "Fish Audio", "https://fish.audio", "High-quality AI voice cloning and TTS platform popular with creators.", "Freemium", false, true, false, ["audio-music"], "tool", ["web"], ["tts", "voice-clone"]],
  ["Gladia", "gladia", "Gladia", "https://www.gladia.io", "Audio intelligence API for transcription, translation, and diarization.", "Paid", false, true, false, ["audio-music", "coding-development"], "api", ["web"], ["stt", "api"]],
  ["iZotope RX", "izotope-rx", "iZotope / Native Instruments", "https://www.izotope.com/en/products/rx.html", "Industry-standard audio repair suite with AI Dialogue Match and repair modules.", "Paid", false, false, true, ["audio-music"], "tool", ["windows", "macos"], ["repair", "dialogue"]],
  ["BandLab", "bandlab", "BandLab", "https://www.bandlab.com", "Social music creation platform with AI Songwriter and mastering tools.", "Freemium", false, false, false, ["audio-music"], "tool", ["web", "ios", "android"], ["music", "daw"]],

  // Meetings / productivity / notes
  ["Limitless", "limitless-ai", "Limitless", "https://www.limitless.ai", "AI wearable/desktop companion (ex-Rewind) for personalized memory and recall.", "Freemium", false, false, false, ["productivity", "ai-assistants"], "tool", ["macos", "windows"], ["memory", "pendant"]],
  ["Plaud", "plaud", "Plaud", "https://www.plaud.ai", "Popular AI voice recorder hardware+app for meeting transcripts and summaries.", "Paid", false, false, false, ["productivity", "audio-music"], "tool", ["ios", "android"], ["recorder", "meetings"]],
  ["Fireflies Autopilot", "fireflies-autopilot", "Fireflies.ai", "https://fireflies.ai", "Meeting agent workflows that automate notes, tasks, and CRM updates.", "Paid", false, true, false, ["productivity", "automation-agents"], "tool", ["web"], ["meetings", "automation"]],
  ["Scribe", "scribe-how", "Scribe", "https://scribehow.com", "Auto-generates step-by-step process docs and guides from your screen actions.", "Freemium", false, true, false, ["productivity"], "tool", ["web"], ["sop", "documentation"]],
  ["Taskade", "taskade", "Taskade", "https://www.taskade.com", "AI workspace for outlines, tasks, mind maps, and team agents.", "Freemium", false, true, false, ["productivity", "automation-agents"], "tool", ["web"], ["tasks", "agents"]],
  ["Akiflow", "akiflow", "Akiflow", "https://akiflow.com", "Time-blocking command bar that consolidates tasks with AI scheduling help.", "Paid", false, false, false, ["productivity"], "tool", ["web", "macos", "windows"], ["time-blocking", "tasks"]],
  ["Sunsama", "sunsama", "Sunsama", "https://www.sunsama.com", "Daily planning app with AI assist for realistic workday scheduling.", "Paid", false, false, false, ["productivity"], "tool", ["web", "macos", "windows"], ["planning", "calendar"]],
  ["Saner.AI", "saner-ai", "Saner.AI", "https://www.saner.ai", "AI personal assistant for ADHD-friendly notes, tasks, and email triage.", "Freemium", false, false, false, ["productivity", "ai-assistants"], "tool", ["web"], ["notes", "adhd"]],
  ["Mem AI", "mem-ai", "Mem", "https://get.mem.ai", "Self-organizing AI notes that resurface relevant knowledge automatically.", "Paid", false, false, false, ["productivity"], "tool", ["web"], ["notes", "memory"]],
  ["Obsidian Copilot", "obsidian-copilot", "Community / Obsidian plugins", "https://obsidian.md", "Popular AI plugin ecosystem for Obsidian PKM vaults (chat, rewrite, RAG).", "Freemium", true, false, true, ["productivity", "writing-content"], "extension", ["windows", "macos", "linux"], ["pkm", "plugins"]],
  ["RemNote", "remnote", "RemNote", "https://www.remnote.com", "Note-taking and spaced repetition with AI flashcard and writing helpers.", "Freemium", false, false, false, ["research-education", "productivity"], "tool", ["web"], ["flashcards", "notes"]],
  ["Heptabase", "heptabase", "Heptabase", "https://heptabase.com", "Visual learning whiteboard for research with AI card assistance.", "Paid", false, false, false, ["research-education", "productivity"], "tool", ["web"], ["whiteboard", "research"]],
  ["Miro AI", "miro-ai", "Miro", "https://miro.com", "Collaborative whiteboard AI for clustering sticky notes, diagrams, and summaries.", "Paid", false, false, false, ["productivity", "design-creativity"], "tool", ["web"], ["whiteboard", "collaboration"]],
  ["FigJam AI", "figjam-ai", "Figma", "https://www.figma.com/figjam/", "Figma’s FigJam AI for brainstorming, summarization, and sticky sorting.", "Paid", false, false, false, ["design-creativity", "productivity"], "tool", ["web"], ["brainstorm", "whiteboard"]],
  ["Microsoft Loop AI", "microsoft-loop-ai", "Microsoft", "https://loop.microsoft.com", "Collaborative Loop workspaces with Copilot-powered drafting and summaries.", "Paid", false, false, false, ["productivity"], "tool", ["web"], ["collaboration", "copilot"]],

  // Sales / marketing / CRM
  ["Salesloft", "salesloft", "Salesloft", "https://www.salesloft.com", "Sales engagement platform with AI coaching and revenue workflow automation.", "Paid", false, true, false, ["business-marketing"], "platform", ["web"], ["sales-engagement", "coaching"]],
  ["Chorus.ai", "chorus-ai", "ZoomInfo", "https://www.zoominfo.com/products/chorus", "Conversation intelligence for analyzing sales calls and deal risks.", "Paid", false, true, false, ["business-marketing"], "platform", ["web"], ["conversation-intelligence", "sales"]],
  ["6sense", "6sense", "6sense", "https://6sense.com", "AI revenue platform for account intent, scoring, and GTM orchestration.", "Paid", false, true, false, ["business-marketing"], "platform", ["web"], ["intent", "abm"]],
  ["Demandbase", "demandbase", "Demandbase", "https://www.demandbase.com", "Account-based GTM platform with AI insights for B2B pipeline teams.", "Paid", false, true, false, ["business-marketing"], "platform", ["web"], ["abm", "gtm"]],
  ["Cognism", "cognism", "Cognism", "https://www.cognism.com", "B2B sales intelligence and compliant contact data with AI enrichment.", "Paid", false, true, false, ["business-marketing"], "platform", ["web"], ["sales-data", "enrichment"]],
  ["Hunter", "hunter-io", "Hunter", "https://hunter.io", "Email finder and outreach toolkit widely used for prospecting.", "Freemium", false, true, false, ["business-marketing"], "tool", ["web"], ["email-finder", "prospecting"]],
  ["Reply.io", "reply-io", "Reply.io", "https://reply.io", "Multichannel sales engagement with AI sequence and reply assistance.", "Paid", false, true, false, ["business-marketing"], "tool", ["web"], ["sequences", "outreach"]],
  ["Drift", "drift", "Salesloft", "https://www.drift.com", "Conversational marketing/sales chat platform with AI bots and routing.", "Paid", false, true, false, ["business-marketing", "automation-agents"], "platform", ["web"], ["chat", "pipeline"]],
  ["Mutiny", "mutiny", "Mutiny", "https://www.mutinyhq.com", "AI website personalization for B2B conversion and account experiences.", "Paid", false, false, false, ["business-marketing"], "tool", ["web"], ["personalization", "conversion"]],
  ["Pipedrive AI", "pipedrive-ai", "Pipedrive", "https://www.pipedrive.com", "CRM AI features for deal recommendations, email assist, and insights.", "Paid", false, true, false, ["business-marketing"], "tool", ["web"], ["crm", "pipeline"]],
  ["Freshworks Freddy", "freshworks-freddy", "Freshworks", "https://www.freshworks.com/freddy-ai/", "Freddy AI across Freshdesk/Freshsales for support and CRM automation.", "Paid", false, true, false, ["business-marketing", "automation-agents"], "platform", ["web"], ["crm", "support"]],
  ["Zoho Zia", "zoho-zia", "Zoho", "https://www.zoho.com/zia/", "Zoho’s assistant across CRM, email, and productivity apps.", "Paid", false, true, false, ["business-marketing", "productivity"], "tool", ["web"], ["crm", "assistant"]],
  ["Attio", "attio", "Attio", "https://attio.com", "Modern AI-native CRM for startups with flexible data and enrichment.", "Paid", false, true, false, ["business-marketing"], "platform", ["web"], ["crm", "startups"]],
  ["Gorgias", "gorgias", "Gorgias", "https://www.gorgias.com", "Ecommerce helpdesk with AI agents for Shopify support automation.", "Paid", false, true, false, ["business-marketing", "automation-agents"], "platform", ["web"], ["ecommerce", "support"]],
  ["Sierra", "sierra-ai", "Sierra", "https://sierra.ai", "Customer experience AI agents platform from Bret Taylor / Clay Bavor.", "Paid", false, true, false, ["automation-agents", "business-marketing"], "platform", ["web"], ["cx-agents", "enterprise"]],

  // Support / CX agents
  ["Decagon", "decagon", "Decagon", "https://decagon.ai", "AI customer support agents used by high-growth consumer companies.", "Paid", false, true, false, ["automation-agents", "business-marketing"], "platform", ["web"], ["support-agents", "cx"]],
  ["Ultimate.ai", "ultimate-ai", "Ultimate", "https://www.ultimate.ai", "Enterprise AI customer service automation (acquired by Nokia context/market leader).", "Paid", false, true, false, ["automation-agents", "business-marketing"], "platform", ["web"], ["support", "automation"]],
  ["Capacity", "capacity-ai", "Capacity", "https://capacity.com", "AI support and knowledge automation for internal and customer help desks.", "Paid", false, true, false, ["automation-agents", "productivity"], "platform", ["web"], ["knowledge", "support"]],
  ["Help Scout AI", "help-scout-ai", "Help Scout", "https://www.helpscout.com", "Human-friendly shared inbox with AI drafts and help center assistance.", "Paid", false, false, false, ["business-marketing", "writing-content"], "tool", ["web"], ["inbox", "support"]],
  ["Gladly Sidekick", "gladly-sidekick", "Gladly", "https://www.gladly.com", "People-centric CX platform with AI Sidekick for agent assistance.", "Paid", false, true, false, ["business-marketing", "automation-agents"], "platform", ["web"], ["cx", "agents"]],

  // Coding / developer tools
  ["Qodo", "qodo", "Qodo", "https://www.qodo.ai", "AI code integrity platform (formerly Codium) for tests, review, and agents.", "Freemium", false, true, false, ["coding-development"], "tool", ["web"], ["testing", "code-review"]],
  ["CodeRabbit", "coderabbit", "CodeRabbit", "https://www.coderabbit.ai", "AI pull-request reviewer integrated with GitHub/GitLab workflows.", "Freemium", false, true, false, ["coding-development"], "tool", ["web"], ["code-review", "prs"]],
  ["Graphite", "graphite", "Graphite", "https://graphite.dev", "Stacked PR workflow tool with AI code review and merge assistance.", "Freemium", false, false, false, ["coding-development"], "tool", ["web"], ["prs", "code-review"]],
  ["Mintlify", "mintlify", "Mintlify", "https://mintlify.com", "Beautiful docs platform with AI writing and maintenance for developer docs.", "Freemium", false, true, false, ["coding-development", "writing-content"], "platform", ["web"], ["docs", "developer"]],
  ["Augment Code", "augment-code", "Augment Code", "https://www.augmentcode.com", "AI coding assistant built for large enterprise codebases and context.", "Paid", false, false, false, ["coding-development"], "tool", ["web"], ["enterprise", "coding-assistant"]],
  ["Factory", "factory-ai", "Factory", "https://factory.ai", "AI software factory / coding agents for end-to-end engineering tasks.", "Paid", false, false, false, ["coding-development", "automation-agents"], "platform", ["web"], ["agents", "engineering"]],
  ["Gemini Code Assist", "gemini-code-assist", "Google", "https://cloud.google.com/products/gemini/code-assist", "Google’s AI coding assistant for IDEs and Cloud developer workflows.", "Freemium", false, true, false, ["coding-development"], "tool", ["web"], ["ide", "google-cloud"]],
  ["Amazon Q Developer CLI", "amazon-q-cli", "Amazon Web Services", "https://aws.amazon.com/q/developer/", "CLI/agent workflows for AWS development with Amazon Q Developer.", "Freemium", false, true, false, ["coding-development"], "tool", ["linux", "macos", "windows"], ["aws", "cli"]],
  ["PearAI", "pearai", "PearAI", "https://trypear.ai", "Open-source AI code editor fork popular with indie developers.", "Freemium", true, false, true, ["coding-development"], "open-source", ["windows", "macos", "linux"], ["editor", "open-source"]],
  ["Zed AI", "zed-ai", "Zed Industries", "https://zed.dev", "High-performance collaborative editor with AI assistant features.", "Freemium", true, false, true, ["coding-development"], "tool", ["macos", "linux"], ["editor", "collaboration"]],
  ["Builder.io", "builder-io", "Builder.io", "https://www.builder.io", "Visual development platform with AI generation for websites and apps.", "Freemium", false, true, false, ["coding-development", "design-creativity"], "platform", ["web"], ["visual-dev", "headless"]],
  ["Anima", "anima-app", "Anima", "https://www.animaapp.com", "Design-to-code platform converting Figma into developer-ready frontend code.", "Freemium", false, true, false, ["coding-development", "design-creativity"], "tool", ["web"], ["figma", "codegen"]],
  ["Locofy", "locofy", "Locofy", "https://www.locofy.ai", "AI converts Figma/Adobe XD designs into production frontend code.", "Freemium", false, false, false, ["coding-development", "design-creativity"], "tool", ["web"], ["figma", "codegen"]],
  ["Tempo Labs", "tempo-labs", "Tempo Labs", "https://www.tempo.new", "AI React app builder focused on visual editing and clean code output.", "Freemium", false, false, false, ["coding-development"], "tool", ["web"], ["react", "app-builder"]],
  ["Create", "create-xyz", "Create", "https://www.create.xyz", "Text-to-app builder for shipping full-stack apps quickly.", "Freemium", false, false, false, ["coding-development", "automation-agents"], "tool", ["web"], ["app-builder", "nocode-procode"]],
  ["Snyk Code", "snyk-code", "Snyk", "https://snyk.io/product/snyk-code/", "AI-powered static application security testing in developer workflows.", "Freemium", false, true, false, ["coding-development"], "tool", ["web"], ["security", "sast"]],
  ["SonarQube AI", "sonarqube-ai", "SonarSource", "https://www.sonarsource.com", "Code quality platform adding AI assistance for issues and remediation.", "Freemium", false, true, false, ["coding-development"], "platform", ["web"], ["code-quality", "static-analysis"]],
  ["Tabnine Enterprise", "tabnine-enterprise", "Tabnine", "https://www.tabnine.com", "Private/enterprise AI code completion with repo-aware models.", "Paid", false, true, true, ["coding-development"], "tool", ["windows", "macos", "linux"], ["completion", "enterprise"]],

  // Data / analytics / MLOps
  ["ThoughtSpot", "thoughtspot", "ThoughtSpot", "https://www.thoughtspot.com", "Search/AI analytics platform for business users asking questions of data.", "Paid", false, true, false, ["data-analytics"], "platform", ["web"], ["bi", "search"]],
  ["Snowflake Cortex", "snowflake-cortex", "Snowflake", "https://www.snowflake.com/en/data-cloud/cortex/", "Snowflake’s built-in LLM and AI SQL functions for enterprise data.", "Paid", false, true, false, ["data-analytics", "coding-development"], "platform", ["web"], ["warehouse", "llm-sql"]],
  ["Databricks AI", "databricks-ai", "Databricks", "https://www.databricks.com", "Lakehouse AI features including Mosaic AI for models and agents.", "Paid", false, true, false, ["data-analytics", "coding-development"], "platform", ["web"], ["lakehouse", "ml"]],
  ["Power BI Copilot", "power-bi-copilot", "Microsoft", "https://www.microsoft.com/power-platform/products/power-bi", "Copilot in Power BI for report creation and DAX assistance.", "Paid", false, false, false, ["data-analytics", "productivity"], "tool", ["web", "windows"], ["bi", "copilot"]],
  ["Tableau AI", "tableau-ai", "Salesforce", "https://www.tableau.com", "Einstein/Tableau AI for insights, calculations, and analytic assistance.", "Paid", false, false, false, ["data-analytics"], "tool", ["web"], ["bi", "insights"]],
  ["Deepnote", "deepnote", "Deepnote", "https://deepnote.com", "Collaborative data notebooks with AI coding help for analysts.", "Freemium", false, false, false, ["data-analytics", "coding-development"], "tool", ["web"], ["notebooks", "collaboration"]],
  ["Observable", "observable", "Observable", "https://observablehq.com", "Reactive data notebooks and dashboards with AI-assisted analysis workflows.", "Freemium", false, false, false, ["data-analytics"], "platform", ["web"], ["notebooks", "visualization"]],
  ["DataRobot", "datarobot", "DataRobot", "https://www.datarobot.com", "Enterprise AutoML and AI platform for building/deploying models.", "Paid", false, true, false, ["data-analytics"], "platform", ["web"], ["automl", "enterprise"]],
  ["Dataiku", "dataiku", "Dataiku", "https://www.dataiku.com", "Enterprise AI/data platform for governed analytics and MLOps.", "Paid", false, true, false, ["data-analytics"], "platform", ["web"], ["mlops", "enterprise"]],
  ["H2O.ai", "h2o-ai", "H2O.ai", "https://h2o.ai", "Open-source-rooted AutoML and AI cloud popular in enterprises.", "Freemium", true, true, true, ["data-analytics"], "platform", ["web"], ["automl", "open-source"]],
  ["Neptune.ai", "neptune-ai", "Neptune", "https://neptune.ai", "ML experiment tracking and model registry for research/engineering teams.", "Freemium", false, true, false, ["data-analytics", "coding-development"], "tool", ["web"], ["experiment-tracking", "mlops"]],
  ["Comet ML", "comet-ml", "Comet", "https://www.comet.com", "MLOps platform for experiment tracking, monitoring, and model management.", "Freemium", false, true, false, ["data-analytics", "coding-development"], "platform", ["web"], ["mlops", "monitoring"]],
  ["Evidently AI", "evidently-ai", "Evidently AI", "https://www.evidentlyai.com", "Open-source ML/LLM evaluation and monitoring toolkit.", "Open source", true, true, true, ["data-analytics", "coding-development"], "open-source", ["python"], ["evaluation", "monitoring"]],
  ["WhyLabs", "whylabs", "WhyLabs", "https://whylabs.ai", "Data and ML monitoring platform for drift and data quality.", "Freemium", false, true, false, ["data-analytics"], "platform", ["web"], ["drift", "monitoring"]],
  ["Polymer", "polymer-search", "Polymer", "https://www.polymersearch.com", "No-code AI business intelligence that auto-builds dashboards from spreadsheets.", "Freemium", false, false, false, ["data-analytics"], "tool", ["web"], ["bi", "spreadsheets"]],

  // Search / browsers / assistants
  ["Monica", "monica-ai", "Monica", "https://monica.im", "All-in-one ChatGPT copilot extension for browsing, writing, and chat.", "Freemium", false, false, false, ["ai-assistants", "productivity"], "extension", ["web"], ["copilot", "browser"]],
  ["Sider", "sider-ai", "Sider", "https://sider.ai", "Browser AI sidebar for reading, writing, and chatting with page context.", "Freemium", false, false, false, ["ai-assistants", "productivity"], "extension", ["web"], ["sidebar", "browser"]],
  ["Merlin", "merlin-ai", "Merlin", "https://getmerlin.in", "Chrome AI assistant for summaries, chat, and writing across the web.", "Freemium", false, false, false, ["ai-assistants", "writing-content"], "extension", ["web"], ["chrome", "summaries"]],
  ["Opera Aria", "opera-aria", "Opera", "https://www.opera.com/features/aria", "Built-in Opera browser AI for chat, page Q&A, and commands.", "Free", false, false, false, ["ai-assistants"], "tool", ["web", "windows", "macos", "android"], ["browser", "chat"]],
  ["ChatSonic", "chatsonic", "Writesonic", "https://writesonic.com/chat", "Writesonic’s ChatGPT-style assistant with real-time web access features.", "Freemium", false, false, false, ["ai-assistants", "writing-content"], "tool", ["web"], ["chat", "writing"]],
  ["Arc Max", "arc-max", "The Browser Company", "https://arc.net", "Arc browser AI features for tidy tabs, ask-on-page, and previews.", "Freemium", false, false, false, ["ai-assistants", "productivity"], "tool", ["macos", "windows"], ["browser", "productivity"]],
  ["Comet Browser", "comet-browser", "Perplexity", "https://www.perplexity.ai/comet", "Perplexity’s AI browser for agentic search and web workflows.", "Freemium", false, false, false, ["ai-assistants", "productivity"], "tool", ["web"], ["browser", "search"]],
  ["OpenEvidence", "openevidence", "OpenEvidence", "https://www.openevidence.com", "Medical evidence AI search assistant widely used by clinicians.", "Freemium", false, false, false, ["healthcare", "research-education"], "tool", ["web"], ["medical", "evidence"]],
  ["Consensus Pro", "consensus-pro", "Consensus", "https://consensus.app", "Evidence-backed research search across scientific papers with AI answers.", "Freemium", false, false, false, ["research-education"], "tool", ["web"], ["papers", "evidence"]],
  ["Elicit Plus", "elicit-plus", "Elicit", "https://elicit.com", "AI research workflow tool for systematic reviews and paper extraction.", "Paid", false, false, false, ["research-education"], "tool", ["web"], ["systematic-review", "papers"]],

  // Education
  ["MagicSchool AI", "magicschool-ai", "MagicSchool", "https://www.magicschool.ai", "Teacher AI toolkit for lesson plans, IEPs, and classroom materials.", "Freemium", false, false, false, ["research-education", "writing-content"], "tool", ["web"], ["teachers", "lessons"]],
  ["Brisk Teaching", "brisk-teaching", "Brisk Teaching", "https://www.briskteaching.com", "Chrome extension AI for teachers to create feedback and instructional content.", "Freemium", false, false, false, ["research-education"], "extension", ["web"], ["teachers", "feedback"]],
  ["SchoolAI", "schoolai", "SchoolAI", "https://schoolai.com", "Safe classroom AI spaces and teacher tools for K-12.", "Freemium", false, false, false, ["research-education"], "platform", ["web"], ["k12", "classroom"]],
  ["Diffit", "diffit", "Diffit", "https://www.diffit.me", "Differentiates reading materials to any level with AI for teachers.", "Freemium", false, false, false, ["research-education"], "tool", ["web"], ["differentiation", "reading"]],
  ["Curipod", "curipod", "Curipod", "https://curipod.com", "AI lesson generation for interactive slides and classroom engagement.", "Freemium", false, false, false, ["research-education"], "tool", ["web"], ["lessons", "slides"]],
  ["Quizizz AI", "quizizz-ai", "Quizizz", "https://quizizz.com", "Gamified assessments with AI quiz generation for classrooms.", "Freemium", false, false, false, ["research-education"], "tool", ["web"], ["quizzes", "gamification"]],
  ["Symbolab", "symbolab", "Symbolab / Course Hero", "https://www.symbolab.com", "Popular AI math solver and step-by-step calculator for students.", "Freemium", false, false, false, ["research-education"], "tool", ["web", "ios", "android"], ["math", "solver"]],
  ["Mathway", "mathway", "Chegg", "https://www.mathway.com", "Widely used math problem solver with step explanations.", "Freemium", false, false, false, ["research-education"], "tool", ["web", "ios", "android"], ["math", "solver"]],
  ["Socratic", "socratic-google", "Google", "https://socratic.org", "Google’s homework help app using AI vision/search for explanations.", "Free", false, false, false, ["research-education"], "tool", ["ios", "android"], ["homework", "tutoring"]],
  ["ChatGPT Edu", "chatgpt-edu", "OpenAI", "https://openai.com/chatgpt/education/", "Education-focused ChatGPT offering for universities and campuses.", "Paid", false, false, false, ["research-education", "ai-assistants"], "tool", ["web"], ["education", "campus"]],

  // Legal / finance
  ["Lexis+ AI", "lexis-plus-ai", "LexisNexis", "https://www.lexisnexis.com/en-us/products/lexis-plus-ai.page", "Generative AI research assistant on LexisNexis legal content.", "Paid", false, false, false, ["finance-legal", "research-education"], "platform", ["web"], ["legal-research", "enterprise"]],
  ["Westlaw Precision AI", "westlaw-ai", "Thomson Reuters", "https://legal.thomsonreuters.com/en/westlaw", "Westlaw generative AI for legal research and drafting assistance.", "Paid", false, false, false, ["finance-legal"], "platform", ["web"], ["legal-research", "drafting"]],
  ["Luminance", "luminance", "Luminance", "https://www.luminance.com", "Legal AI for contract review, due diligence, and discovery.", "Paid", false, true, false, ["finance-legal"], "platform", ["web"], ["contracts", "diligence"]],
  ["Kira Systems", "kira-systems", "Litera", "https://kirasystems.com", "Contract analysis AI widely used in due diligence workflows.", "Paid", false, true, false, ["finance-legal"], "tool", ["web"], ["contracts", "diligence"]],
  ["Evisort", "evisort", "Evisort / Workday", "https://www.evisort.com", "AI contract lifecycle intelligence for enterprise legal ops.", "Paid", false, true, false, ["finance-legal"], "platform", ["web"], ["clm", "contracts"]],
  ["DocuSign Iris", "docusign-iris", "DocuSign", "https://www.docusign.com", "DocuSign AI agreement features for insights and clause understanding.", "Paid", false, true, false, ["finance-legal", "productivity"], "platform", ["web"], ["agreements", "esign"]],
  ["Legora", "legora", "Legora", "https://legora.com", "European legal AI workspace (formerly Leya) for lawyers’ drafting/research.", "Paid", false, false, false, ["finance-legal"], "tool", ["web"], ["legal", "drafting"]],
  ["Paxton AI", "paxton-ai", "Paxton AI", "https://www.paxton.ai", "AI legal assistant for research, drafting, and litigation support.", "Paid", false, false, false, ["finance-legal"], "tool", ["web"], ["legal", "research"]],
  ["Ramp AI", "ramp-ai", "Ramp", "https://ramp.com", "Finance automation platform with AI for expenses, policy, and accounting ops.", "Paid", false, true, false, ["finance-legal", "productivity"], "platform", ["web"], ["spend", "finance"]],
  ["Vic.ai", "vic-ai", "Vic.ai", "https://www.vic.ai", "Autonomous AP accounting AI for invoice processing and bookkeeping.", "Paid", false, true, false, ["finance-legal", "automation-agents"], "platform", ["web"], ["ap", "accounting"]],

  // Healthcare
  ["Ambience Healthcare", "ambience-healthcare", "Ambience Healthcare", "https://www.ambiencehealthcare.com", "AI medical scribe and clinical documentation for health systems.", "Paid", false, true, false, ["healthcare"], "platform", ["web"], ["scribe", "clinical"]],
  ["Suki", "suki-ai", "Suki", "https://www.suki.ai", "Voice AI clinical assistant for documentation and EHR commands.", "Paid", false, true, false, ["healthcare", "audio-music"], "tool", ["web", "ios"], ["scribe", "voice"]],
  ["Glass Health", "glass-health", "Glass Health", "https://glass.health", "Clinical decision support AI for differential diagnosis and notes.", "Freemium", false, false, false, ["healthcare"], "tool", ["web"], ["cds", "diagnosis"]],
  ["Hippocratic AI", "hippocratic-ai", "Hippocratic AI", "https://www.hippocraticai.com", "Healthcare LLM agents focused on non-diagnostic patient-facing tasks.", "Paid", false, true, false, ["healthcare", "automation-agents"], "platform", ["web"], ["healthcare-agents", "llm"]],
  ["Viz.ai", "viz-ai", "Viz.ai", "https://www.viz.ai", "AI care coordination for stroke and disease detection from medical imaging.", "Paid", false, true, false, ["healthcare"], "platform", ["web"], ["imaging", "stroke"]],
  ["PathAI", "pathai", "PathAI", "https://www.pathai.com", "AI pathology platform for research and clinical diagnostics support.", "Paid", false, false, false, ["healthcare", "data-analytics"], "platform", ["web"], ["pathology", "diagnostics"]],
  ["Ada Health", "ada-health", "Ada Health", "https://ada.com", "Consumer symptom assessment AI used globally for health navigation.", "Freemium", false, false, false, ["healthcare"], "tool", ["ios", "android", "web"], ["symptoms", "triage"]],
  ["Infermedica", "infermedica", "Infermedica", "https://infermedica.com", "Medical AI API for symptom checking and patient intake triage.", "Paid", false, true, false, ["healthcare", "coding-development"], "api", ["web"], ["triage", "api"]],

  // Infra / models / hosting
  ["Anyscale", "anyscale", "Anyscale", "https://www.anyscale.com", "Ray-based platform for scaling AI workloads and serving apps.", "Paid", false, true, false, ["coding-development", "data-analytics"], "platform", ["web"], ["ray", "serving"]],
  ["Baseten", "baseten", "Baseten", "https://www.baseten.co", "ML inference platform for deploying and scaling model APIs.", "Paid", false, true, false, ["coding-development"], "platform", ["web"], ["inference", "deploy"]],
  ["RunPod", "runpod", "RunPod", "https://www.runpod.io", "GPU cloud popular for training/inference and serverless workers.", "Paid", false, true, false, ["coding-development"], "platform", ["web"], ["gpu", "cloud"]],
  ["Vast.ai", "vast-ai", "Vast.ai", "https://vast.ai", "Marketplace for cheap GPU rentals for ML workloads.", "Paid", false, true, false, ["coding-development"], "platform", ["web"], ["gpu", "marketplace"]],
  ["Lambda", "lambda-labs", "Lambda", "https://lambdalabs.com", "GPU cloud and workstations widely used by ML researchers.", "Paid", false, true, false, ["coding-development"], "platform", ["web"], ["gpu", "research"]],
  ["CoreWeave", "coreweave", "CoreWeave", "https://www.coreweave.com", "Specialized GPU cloud for large-scale AI training and inference.", "Paid", false, true, false, ["coding-development"], "platform", ["web"], ["gpu", "training"]],
  ["Lightning AI", "lightning-ai", "Lightning AI", "https://lightning.ai", "PyTorch Lightning studio for building and hosting AI apps.", "Freemium", true, true, true, ["coding-development", "data-analytics"], "platform", ["web"], ["pytorch", "studio"]],
  ["Google Colab", "google-colab", "Google", "https://colab.research.google.com", "Hosted Jupyter notebooks with free/paid GPUs for ML experimentation.", "Freemium", false, false, false, ["coding-development", "research-education"], "tool", ["web"], ["notebooks", "gpu"]],
  ["DeepInfra", "deepinfra", "DeepInfra", "https://deepinfra.com", "Serverless inference APIs for popular open-source LLMs and models.", "Paid", false, true, false, ["coding-development"], "api", ["web"], ["inference", "llm"]],
  ["SambaNova Cloud", "sambanova-cloud", "SambaNova", "https://sambanova.ai", "Enterprise AI inference platform with high-throughput LLM serving.", "Paid", false, true, false, ["coding-development"], "platform", ["web"], ["inference", "enterprise"]],
  ["FriendliAI", "friendliai", "FriendliAI", "https://friendli.ai", "Optimized LLM serving engine and cloud for production inference.", "Paid", false, true, false, ["coding-development"], "platform", ["web"], ["serving", "inference"]],
  ["Turbopuffer", "turbopuffer", "Turbopuffer", "https://turbopuffer.com", "Fast serverless vector/search database popular with AI app builders.", "Paid", false, true, false, ["coding-development", "data-analytics"], "api", ["web"], ["vector", "search"]],
  ["Upstash Vector", "upstash-vector", "Upstash", "https://upstash.com/docs/vector", "Serverless vector database tightly integrated with modern web stacks.", "Freemium", false, true, false, ["coding-development"], "api", ["web"], ["vector", "serverless"]],
  ["Cloudflare Vectorize", "cloudflare-vectorize", "Cloudflare", "https://developers.cloudflare.com/vectorize/", "Edge vector database for AI apps on Cloudflare Workers.", "Paid", false, true, false, ["coding-development"], "api", ["web"], ["vector", "edge"]],
  ["Algolia AI", "algolia-ai", "Algolia", "https://www.algolia.com", "Search-as-a-service with AI recommendations and neural search features.", "Paid", false, true, false, ["coding-development", "business-marketing"], "platform", ["web"], ["search", "recommendations"]],

  // Asia / global models & products
  ["Tencent Hunyuan", "tencent-hunyuan", "Tencent", "https://hunyuan.tencent.com", "Tencent’s foundation model family and cloud AI services.", "Freemium", false, true, false, ["ai-assistants"], "model", ["web"], ["llm", "china"]],
  ["Huawei Pangu", "huawei-pangu", "Huawei", "https://www.huaweicloud.com/intl/en-us/product/pangu.html", "Huawei Cloud Pangu large models for enterprise AI scenarios.", "Paid", false, true, false, ["ai-assistants", "coding-development"], "model", ["web"], ["llm", "enterprise"]],
  ["Coze", "coze", "ByteDance", "https://www.coze.com", "ByteDance’s no-code AI agent builder with bots, plugins, and publish flows.", "Freemium", false, true, false, ["automation-agents", "ai-assistants"], "platform", ["web"], ["agents", "bots"]],
  ["Upstage Solar", "upstage-solar", "Upstage", "https://www.upstage.ai", "South Korean LLM provider known for Solar models and Document AI.", "Paid", false, true, false, ["ai-assistants", "coding-development"], "model", ["web"], ["llm", "korea"]],
  ["HyperCLOVA X", "hyperclova-x", "Naver", "https://clova.ai", "Naver’s large language model platform powering Korean AI products.", "Paid", false, true, false, ["ai-assistants"], "model", ["web"], ["llm", "korea"]],
  ["Sakana AI", "sakana-ai", "Sakana AI", "https://sakana.ai", "Tokyo AI lab known for evolutionary model-merging research and demos.", "Freemium", false, false, false, ["research-education", "coding-development"], "platform", ["web"], ["research", "japan"]],
  ["InternLM", "internlm", "Shanghai AI Lab", "https://internlm.intern-ai.org.cn", "Open InternLM foundation models widely used in the open-source community.", "Open source", true, true, true, ["ai-assistants", "coding-development"], "open-source", ["web", "python"], ["llm", "open-source"]],
  ["Yi Large", "yi-large", "01.AI", "https://www.01.ai", "01.AI’s flagship Yi large models for chat and API use.", "Freemium", false, true, false, ["ai-assistants"], "model", ["web"], ["llm", "china"]],
  ["Mistral Le Chat Enterprise", "mistral-le-chat-enterprise", "Mistral AI", "https://mistral.ai", "Mistral’s enterprise chat and model platform for European organizations.", "Paid", false, true, false, ["ai-assistants", "business-marketing"], "platform", ["web"], ["enterprise", "europe"]],
  ["Grok API", "grok-api", "xAI", "https://x.ai/api", "xAI API access to Grok models for builders and enterprises.", "Paid", false, true, false, ["coding-development", "ai-assistants"], "api", ["web"], ["grok", "api"]],
];

const PLATFORM_ALIASES = { chrome: "web", docker: "self-hosted", python: "web" };

function toTool(row) {
  const [name, slug, publisher, url, summary, pricing_model, open_source, api_available, local_available, categories, type, platforms, keywords] = row;
  return {
    name,
    slug,
    publisher,
    url,
    summary,
    description: `${summary} Official product page: ${url}`,
    pricing_model,
    price_display: pricing_model,
    open_source,
    api_available,
    local_available,
    categories,
    type,
    platforms,
    keywords,
    strengths: keywords.slice(0, 2).map((k) => `Known for ${k}`),
    limits: ["Verify latest pricing and limits on the official site"],
    audience: ["Professionals", "Builders"],
  };
}

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
    .insert({ url, source_type: "official", reliability_level: "A", publisher: domainFromUrl(url) })
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
  if (bySlug?.id) return "skipped";
  const { data: byUrl } = await sb.from("tools").select("id, slug").eq("official_url", tool.url).maybeSingle();
  if (byUrl?.id) return "skipped";

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
    await sb.from("tool_categories").upsert({ tool_id: toolId, category_id: catId, is_primary: i === 0 });
  }

  const typeId = await idBySlug(sb, "solution_types", tool.type === "Open source" ? "open-source" : tool.type);
  if (typeId) {
    await sb.from("tool_types").upsert({ tool_id: toolId, solution_type_id: typeId, is_primary: true });
  }

  for (const raw of tool.platforms) {
    const key = PLATFORM_ALIASES[raw] ?? raw;
    const platformId = await idByKey(sb, "platforms", key);
    if (!platformId) continue;
    await sb.from("tool_platforms").upsert({ tool_id: toolId, platform_id: platformId, status: "available" });
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
  return "inserted";
}

async function main() {
  const env = { ...loadEnv(join(ROOT, ".env.production")), ...loadEnv(join(ROOT, ".env")) };
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    console.error("Missing Supabase URL or secret key");
    process.exit(1);
  }
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  let inserted = 0;
  let skipped = 0;
  let failed = 0;
  for (const row of RAW) {
    const tool = toTool(row);
    try {
      const r = await upsertTool(sb, tool);
      if (r === "inserted") {
        inserted += 1;
        console.log(`[tool] ${tool.slug}`);
      } else skipped += 1;
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

  console.log(`[done] candidates=${RAW.length} inserted=${inserted} skipped=${skipped} failed=${failed}`);
  console.log(`[done] published=${published} with_logo=${withLogo}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
