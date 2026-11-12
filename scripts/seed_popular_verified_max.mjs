/**
 * Maximum batch of popular, well-known, verifiable AI tools still missing.
 * Skips existing slug/URL. Usage: node scripts/seed_popular_verified_max.mjs
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
  // Writing / SEO
  ["Frase", "frase", "Frase", "https://www.frase.io", "SEO content research and AI brief/writing workflow for content teams.", "Paid", false, true, false, ["writing-content", "business-marketing"], "tool", ["web"], ["seo", "briefs", "content"]],
  ["Clearscope", "clearscope", "Clearscope", "https://www.clearscope.io", "Premium SEO content optimization platform used by large content teams.", "Paid", false, true, false, ["writing-content", "business-marketing"], "tool", ["web"], ["seo", "content-grade"]],
  ["MarketMuse", "marketmuse", "MarketMuse", "https://www.marketmuse.com", "AI content planning and topical authority platform for SEO teams.", "Paid", false, false, false, ["writing-content", "business-marketing"], "platform", ["web"], ["seo", "content-strategy"]],
  ["Copysmith", "copysmith", "Copysmith", "https://copysmith.ai", "AI copy generation suite for ecommerce and performance marketing teams.", "Paid", false, true, false, ["writing-content", "business-marketing"], "tool", ["web"], ["ecommerce", "ads-copy"]],
  ["Peppertype", "peppertype", "Pepper Content", "https://www.peppertype.ai", "AI writing assistant for marketing copy, blogs, and social content.", "Freemium", false, false, false, ["writing-content", "business-marketing"], "tool", ["web"], ["marketing-copy", "social"]],
  ["Type.ai", "type-ai", "Type.ai", "https://type.ai", "AI document editor for long-form writing with strong drafting controls.", "Freemium", false, false, false, ["writing-content"], "tool", ["web"], ["editor", "long-form"]],
  ["Shortwave", "shortwave", "Shortwave", "https://www.shortwave.com", "AI-first email client for faster triage, search, and drafting.", "Freemium", false, false, false, ["productivity", "writing-content"], "tool", ["web"], ["email", "inbox"]],
  ["SciSpace", "scispace", "SciSpace", "https://typeset.io", "AI research assistant for reading papers, citations, and literature Q&A.", "Freemium", false, false, false, ["research-education"], "tool", ["web"], ["papers", "research"]],
  ["Paperpal", "paperpal", "Paperpal", "https://paperpal.com", "Academic writing assistant for grammar, clarity, and submission readiness.", "Freemium", false, false, false, ["writing-content", "research-education"], "tool", ["web"], ["academic", "editing"]],
  ["Scholarcy", "scholarcy", "Scholarcy", "https://www.scholarcy.com", "Summarizes research papers into structured flashcards and highlights.", "Freemium", false, true, false, ["research-education"], "tool", ["web"], ["summaries", "papers"]],
  ["Connected Papers", "connected-papers", "Connected Papers", "https://www.connectedpapers.com", "Visual graph explorer to discover related academic papers from a seed work.", "Freemium", false, false, false, ["research-education"], "tool", ["web"], ["literature", "graphs"]],
  ["Litmaps", "litmaps", "Litmaps", "https://www.litmaps.com", "Literature discovery maps for researchers exploring citation networks.", "Freemium", false, false, false, ["research-education"], "tool", ["web"], ["citations", "maps"]],
  ["Humata", "humata", "Humata", "https://www.humata.ai", "Chat with PDFs for summaries and answers grounded in uploaded documents.", "Freemium", false, false, false, ["research-education", "productivity"], "tool", ["web"], ["pdf", "rag"]],
  ["Afforai", "afforai", "Afforai", "https://afforai.com", "AI research chatbot with multi-document chat and citation workflows.", "Freemium", false, false, false, ["research-education"], "tool", ["web"], ["research", "citations"]],

  // Design / image
  ["Cleanup.pictures", "cleanup-pictures", "Clipdrop", "https://cleanup.pictures", "One-click object removal from photos using AI inpainting.", "Freemium", false, false, false, ["image-generation", "design-creativity"], "tool", ["web"], ["object-removal", "cleanup"]],
  ["Let's Enhance", "lets-enhance", "Let's Enhance", "https://letsenhance.io", "AI image upscaler and enhancer for sharper product and photo assets.", "Freemium", false, true, false, ["image-generation"], "tool", ["web"], ["upscale", "enhance"]],
  ["Remini", "remini", "Remini", "https://remini.ai", "Popular mobile AI photo enhancer for faces and old image restoration.", "Freemium", false, false, false, ["image-generation"], "tool", ["ios", "android"], ["enhance", "faces"]],
  ["Lensa", "lensa", "Prisma Labs", "https://prisma-ai.com/lensa", "AI photo editor famous for Magic Avatars and portrait enhancements.", "Freemium", false, false, false, ["image-generation", "design-creativity"], "tool", ["ios", "android"], ["avatars", "portraits"]],
  ["VanceAI", "vanceai", "VanceAI", "https://vanceai.com", "Suite of AI image tools for upscaling, sharpening, and background edits.", "Freemium", false, true, false, ["image-generation"], "tool", ["web"], ["upscale", "background"]],
  ["Brandmark", "brandmark", "Brandmark", "https://brandmark.io", "AI logo maker widely used by startups for quick brand marks.", "Paid", false, false, false, ["design-creativity", "business-marketing"], "tool", ["web"], ["logo", "branding"]],
  ["Designs.ai", "designs-ai", "Designs.ai", "https://designs.ai", "AI toolkit for logos, videos, mockups, and speech for marketers.", "Paid", false, false, false, ["design-creativity", "business-marketing"], "tool", ["web"], ["logo", "video", "speech"]],
  ["Spline AI", "spline-ai", "Spline", "https://spline.design", "3D design tool with AI generation features for interactive web 3D.", "Freemium", false, false, false, ["design-creativity"], "tool", ["web"], ["3d", "web-design"]],
  ["Khroma", "khroma", "Khroma", "https://www.khroma.co", "AI color palette generator trained on your preferred color tastes.", "Free", false, false, false, ["design-creativity"], "tool", ["web"], ["color", "palettes"]],
  ["VistaCreate", "vistacreate", "Crello / Depositphotos", "https://create.vista.com", "Canva-like design platform with AI helpers for social creatives.", "Freemium", false, false, false, ["design-creativity", "business-marketing"], "tool", ["web"], ["templates", "social"]],
  ["Placeit", "placeit", "Envato", "https://placeit.net", "Mockup and design generator popular for merch and branding previews.", "Paid", false, false, false, ["design-creativity", "business-marketing"], "tool", ["web"], ["mockups", "merch"]],
  ["Smartmockups", "smartmockups", "Smartmockups", "https://smartmockups.com", "Product mockup studio with AI-assisted placement for marketing assets.", "Freemium", false, false, false, ["design-creativity", "business-marketing"], "tool", ["web"], ["mockups"]],

  // Video
  ["Kapwing", "kapwing", "Kapwing", "https://www.kapwing.com", "Browser collaborative video editor with AI captions and resize tools.", "Freemium", false, false, false, ["video-generation", "productivity"], "tool", ["web"], ["editor", "captions"]],
  ["FlexClip", "flexclip", "FlexClip", "https://www.flexclip.com", "Online video maker with AI script-to-video and stock media templates.", "Freemium", false, false, false, ["video-generation", "business-marketing"], "tool", ["web"], ["templates", "marketing-video"]],
  ["Animoto", "animoto", "Animoto", "https://animoto.com", "Long-standing drag-and-drop video maker for marketing slideshows and ads.", "Freemium", false, false, false, ["video-generation", "business-marketing"], "tool", ["web"], ["slideshow", "ads"]],
  ["Vyond", "vyond", "Vyond", "https://www.vyond.com", "Enterprise animation platform for training and explainers with AI assist.", "Paid", false, false, false, ["video-generation", "business-marketing"], "tool", ["web"], ["animation", "training"]],
  ["Powtoon", "powtoon", "Powtoon", "https://www.powtoon.com", "Popular animated video and presentation maker for business explainers.", "Freemium", false, false, false, ["video-generation", "business-marketing"], "tool", ["web"], ["animation", "presentations"]],
  ["Wisecut", "wisecut", "Wisecut", "https://www.wisecut.video", "AI video editor that auto-cuts silences and adds captions/music.", "Freemium", false, false, false, ["video-generation"], "tool", ["web"], ["auto-edit", "captions"]],
  ["Vizard", "vizard", "Vizard", "https://vizard.ai", "Turns long videos into short social clips with AI highlighting.", "Freemium", false, false, false, ["video-generation", "business-marketing"], "tool", ["web"], ["clips", "repurposing"]],
  ["Munch", "munch-ai", "Munch", "https://www.getmunch.com", "AI social clipping that finds viral moments from long-form video.", "Paid", false, false, false, ["video-generation", "business-marketing"], "tool", ["web"], ["viral-clips", "social"]],
  ["Vidyo.ai", "vidyo-ai", "Vidyo.ai", "https://vidyo.ai", "AI short-form video generator from podcasts and YouTube content.", "Freemium", false, false, false, ["video-generation", "business-marketing"], "tool", ["web"], ["shorts", "podcasts"]],
  ["Creatify", "creatify", "Creatify", "https://creatify.ai", "AI ad creative platform for UGC-style product video ads.", "Paid", false, true, false, ["video-generation", "business-marketing"], "tool", ["web"], ["ugc", "ads"]],
  ["Arcads", "arcads", "Arcads", "https://www.arcads.ai", "AI actor videos for performance ads and product demos.", "Paid", false, false, false, ["video-generation", "business-marketing"], "tool", ["web"], ["ai-actors", "ads"]],
  ["Hour One", "hour-one", "Hour One", "https://hourone.ai", "AI presenter video platform for enterprise learning and communications.", "Paid", false, true, false, ["video-generation", "business-marketing"], "tool", ["web"], ["avatars", "l&d"]],
  ["DeepBrain AI", "deepbrain-ai", "DeepBrain AI", "https://www.deepbrain.io", "AI avatar studio for multilingual video content production.", "Paid", false, true, false, ["video-generation"], "tool", ["web"], ["avatars", "multilingual"]],
  ["Filmora", "filmora", "Wondershare", "https://filmora.wondershare.com", "Consumer video editor with extensive AI effects, captions, and audio tools.", "Freemium", false, false, false, ["video-generation"], "tool", ["windows", "macos"], ["editor", "effects"]],

  // Audio
  ["Podcastle", "podcastle", "Podcastle", "https://podcastle.ai", "AI podcast studio for recording, cleanup, and clip creation.", "Freemium", false, false, false, ["audio-music", "productivity"], "tool", ["web"], ["podcast", "editing"]],
  ["Audo.ai", "audo-ai", "Audo", "https://audo.ai", "One-click AI noise cleanup for voice recordings and podcasts.", "Freemium", false, true, false, ["audio-music"], "tool", ["web"], ["denoise", "voice"]],
  ["Beatoven", "beatoven", "Beatoven.ai", "https://www.beatoven.ai", "Royalty-free AI music generator for creators and video editors.", "Freemium", false, false, false, ["audio-music"], "tool", ["web"], ["music", "royalty-free"]],
  ["Loudly", "loudly", "Loudly", "https://www.loudly.com", "AI music creation and library platform for content and brands.", "Freemium", false, true, false, ["audio-music", "business-marketing"], "tool", ["web"], ["music", "licensing"]],
  ["Brain.fm", "brain-fm", "Brain.fm", "https://www.brain.fm", "Functional music app using AI/audio science for focus and sleep.", "Paid", false, false, false, ["audio-music", "productivity"], "tool", ["web", "ios", "android"], ["focus", "sleep"]],
  ["Kits AI", "kits-ai", "Kits AI", "https://www.kits.ai", "Voice models and AI singing/voice conversion for musicians.", "Freemium", false, true, false, ["audio-music"], "tool", ["web"], ["voice-models", "music"]],
  ["NaturalReader", "naturalreader", "NaturalSoft", "https://www.naturalreaders.com", "Popular text-to-speech reader for documents, webpages, and accessibility.", "Freemium", false, false, false, ["audio-music", "productivity"], "tool", ["web", "windows", "macos"], ["tts", "accessibility"]],
  ["Listnr", "listnr", "Listnr", "https://listnr.ai", "AI voice generator and podcast hosting toolkit for creators.", "Freemium", false, true, false, ["audio-music"], "tool", ["web"], ["tts", "podcast"]],
  ["Google Cloud Text-to-Speech", "google-cloud-tts", "Google Cloud", "https://cloud.google.com/text-to-speech", "Enterprise TTS API with WaveNet/Journey voices from Google Cloud.", "Paid", false, true, false, ["audio-music", "coding-development"], "api", ["web", "python"], ["tts", "gcp"]],
  ["Azure Speech", "azure-speech", "Microsoft Azure", "https://azure.microsoft.com/products/ai-services/ai-speech", "Microsoft speech service for STT, TTS, and real-time translation.", "Paid", false, true, false, ["audio-music", "coding-development"], "api", ["web", "python"], ["stt", "tts", "azure"]],

  // Meetings / productivity
  ["Read AI", "read-ai", "Read AI", "https://www.read.ai", "Meeting summaries, search, and coaching insights across Zoom/Meet/Teams.", "Freemium", false, true, false, ["productivity"], "tool", ["web"], ["meetings", "summaries"]],
  ["Avoma", "avoma", "Avoma", "https://www.avoma.com", "AI meeting assistant for notes, CRM scoring, and conversation intelligence.", "Paid", false, true, false, ["productivity", "business-marketing"], "tool", ["web"], ["meetings", "crm"]],
  ["Fellow", "fellow", "Fellow", "https://fellow.app", "Meeting management app with AI notes, agendas, and action items.", "Freemium", false, false, false, ["productivity"], "tool", ["web"], ["meetings", "agendas"]],
  ["Grain", "grain", "Grain", "https://grain.com", "Records customer calls and turns moments into shareable clips/insights.", "Paid", false, true, false, ["productivity", "business-marketing"], "tool", ["web"], ["calls", "clips"]],
  ["Reflect", "reflect-app", "Reflect", "https://reflect.app", "Networked note app with AI linking, summarization, and calendar context.", "Paid", false, false, false, ["productivity", "writing-content"], "tool", ["web", "macos"], ["notes", "pkm"]],
  ["Capacities", "capacities", "Capacities", "https://capacities.io", "Object-based notes studio with AI assist for personal knowledge management.", "Freemium", false, false, false, ["productivity"], "tool", ["web", "windows", "macos"], ["notes", "pkm"]],
  ["Craft", "craft-docs", "Craft Docs", "https://www.craft.do", "Beautiful documents app with Craft AI for writing and organization.", "Freemium", false, false, false, ["productivity", "writing-content"], "tool", ["macos", "ios", "web"], ["docs", "notes"]],
  ["Todoist", "todoist-ai", "Doist", "https://todoist.com", "Leading task manager with AI Assist for breaking down and scheduling work.", "Freemium", false, true, false, ["productivity"], "tool", ["web", "ios", "android"], ["tasks", "productivity"]],
  ["Reclaim", "reclaim-ai", "Reclaim.ai", "https://reclaim.ai", "AI calendar scheduling for habits, tasks, and meeting defense.", "Freemium", false, true, false, ["productivity"], "tool", ["web"], ["calendar", "scheduling"]],
  ["Clockwise", "clockwise", "Clockwise", "https://www.getclockwise.com", "AI calendar optimization for focus time and team scheduling.", "Freemium", false, true, false, ["productivity"], "tool", ["web"], ["calendar", "focus-time"]],

  // Sales / marketing
  ["Clay", "clay", "Clay", "https://www.clay.com", "Creative data enrichment and outbound orchestration platform with AI.", "Paid", false, true, false, ["business-marketing"], "platform", ["web"], ["enrichment", "outbound"]],
  ["Instantly", "instantly", "Instantly", "https://instantly.ai", "Cold email platform with AI copy and unlimited sender scaling workflows.", "Paid", false, true, false, ["business-marketing"], "tool", ["web"], ["cold-email", "outreach"]],
  ["Lemlist", "lemlist", "lemlist", "https://www.lemlist.com", "Personalized multichannel outreach suite with AI writing helpers.", "Paid", false, true, false, ["business-marketing"], "tool", ["web"], ["outreach", "personalization"]],
  ["Smartlead", "smartlead", "Smartlead", "https://www.smartlead.ai", "Cold email infrastructure platform popular with agencies and growth teams.", "Paid", false, true, false, ["business-marketing"], "tool", ["web"], ["cold-email", "deliverability"]],
  ["Regie.ai", "regie-ai", "Regie.ai", "https://www.regie.ai", "AI content and sequencing for B2B sales engagement teams.", "Paid", false, true, false, ["business-marketing", "writing-content"], "tool", ["web"], ["sales-content", "sequences"]],
  ["ZoomInfo", "zoominfo", "ZoomInfo", "https://www.zoominfo.com", "B2B database and GTM intelligence platform with AI assistants.", "Paid", false, true, false, ["business-marketing"], "platform", ["web"], ["b2b-data", "gtm"]],
  ["Clari", "clari", "Clari", "https://www.clari.com", "Revenue forecasting and inspection platform with conversation AI signals.", "Paid", false, true, false, ["business-marketing"], "platform", ["web"], ["forecasting", "revenue"]],
  ["Outreach", "outreach", "Outreach", "https://www.outreach.io", "Sales execution platform with AI coaching and engagement insights.", "Paid", false, true, false, ["business-marketing"], "platform", ["web"], ["sales-engagement"]],
  ["Hootsuite", "hootsuite", "Hootsuite", "https://www.hootsuite.com", "Enterprise social management suite with OwlyWriter AI content tools.", "Paid", false, true, false, ["business-marketing", "writing-content"], "platform", ["web"], ["social", "scheduling"]],
  ["Later", "later", "Later", "https://later.com", "Social scheduling platform with AI caption and content helpers.", "Freemium", false, false, false, ["business-marketing"], "tool", ["web"], ["instagram", "scheduling"]],
  ["Ocoya", "ocoya", "Ocoya", "https://www.ocoya.com", "AI social content generator and scheduler for SMBs and agencies.", "Freemium", false, false, false, ["business-marketing", "writing-content"], "tool", ["web"], ["social", "design"]],
  ["Pencil", "pencil-ai", "pencil", "https://www.trypencil.com", "Generative ad creative platform used by performance marketers.", "Paid", false, false, false, ["business-marketing", "design-creativity"], "tool", ["web"], ["ads", "creatives"]],

  // Support / CX
  ["Ada", "ada-cx", "Ada", "https://www.ada.cx", "Enterprise AI customer service automation platform for brand support.", "Paid", false, true, false, ["automation-agents", "business-marketing"], "platform", ["web"], ["support", "automation"]],
  ["Forethought", "forethought", "Forethought", "https://forethought.ai", "AI support agents and triage for enterprise customer service teams.", "Paid", false, true, false, ["automation-agents", "business-marketing"], "platform", ["web"], ["support", "triage"]],
  ["Cresta", "cresta", "Cresta", "https://cresta.com", "Real-time AI coaching and automation for contact centers.", "Paid", false, true, false, ["business-marketing", "automation-agents"], "platform", ["web"], ["contact-center", "coaching"]],
  ["Kore.ai", "kore-ai", "Kore.ai", "https://www.kore.ai", "Enterprise conversational AI platform for assistants across channels.", "Paid", false, true, false, ["automation-agents"], "platform", ["web"], ["enterprise-bots", "omnichannel"]],
  ["Yellow.ai", "yellow-ai", "Yellow.ai", "https://yellow.ai", "DynamicAI agents platform for customer experience automation.", "Paid", false, true, false, ["automation-agents", "business-marketing"], "platform", ["web"], ["cx", "agents"]],
  ["Cognigy", "cognigy", "Cognigy", "https://www.cognigy.com", "Enterprise conversational AI platform for complex voice/chat automation.", "Paid", false, true, false, ["automation-agents"], "platform", ["web"], ["voice", "enterprise"]],
  ["Moveworks", "moveworks", "Moveworks", "https://www.moveworks.com", "Enterprise employee support AI for IT, HR, and workplace requests.", "Paid", false, true, false, ["automation-agents", "productivity"], "platform", ["web"], ["it-support", "enterprise"]],

  // Legal / finance / health (verified products)
  ["Ironclad", "ironclad", "Ironclad", "https://ironcladapp.com", "Contract lifecycle platform with AI review and workflow automation.", "Paid", false, true, false, ["finance-legal"], "platform", ["web"], ["contracts", "clm"]],
  ["LinkSquares", "linksquares", "LinkSquares", "https://linksquares.com", "AI contract management and analysis for legal and business teams.", "Paid", false, true, false, ["finance-legal"], "platform", ["web"], ["contracts", "analysis"]],
  ["Robin AI", "robin-ai", "Robin AI", "https://www.robinai.com", "AI legal assistant for contract review used by in-house legal teams.", "Paid", false, false, false, ["finance-legal"], "tool", ["web"], ["contracts", "legal"]],
  ["Hebbia", "hebbia", "Hebbia", "https://www.hebbia.com", "AI knowledge worker platform for finance and professional services research.", "Paid", false, false, false, ["finance-legal", "research-education"], "platform", ["web"], ["research", "finance"]],
  ["EvenUp", "evenup", "EvenUp", "https://www.evenuplaw.com", "AI for personal-injury law firms—demand letters and case documentation.", "Paid", false, false, false, ["finance-legal"], "tool", ["web"], ["legal", "demands"]],
  ["Abridge", "abridge", "Abridge", "https://www.abridge.com", "Clinical conversation AI that drafts medical notes from clinician-patient visits.", "Paid", false, false, false, ["healthcare"], "platform", ["web"], ["clinical-notes", "healthcare"]],
  ["Nabla", "nabla", "Nabla", "https://www.nabla.com", "Ambient AI assistant for clinicians to draft notes and reduce admin load.", "Paid", false, false, false, ["healthcare"], "tool", ["web"], ["clinical", "documentation"]],
  ["Nuance DAX", "nuance-dax", "Microsoft Nuance", "https://www.nuance.com/healthcare/dragon-ai-clinical-solutions/dax.html", "Dragon Ambient eXperience for clinical documentation in healthcare systems.", "Paid", false, false, false, ["healthcare"], "platform", ["web"], ["ambient", "ehr"]],

  // No-code / builders
  ["Retool", "retool", "Retool", "https://retool.com", "Internal tools platform with AI assist for building admin apps fast.", "Freemium", false, true, false, ["coding-development", "productivity"], "platform", ["web"], ["internal-tools", "low-code"]],
  ["Appsmith", "appsmith", "Appsmith", "https://www.appsmith.com", "Open-source low-code platform for internal apps with AI features.", "Open source", true, true, true, ["coding-development"], "open-source", ["web", "self-hosted"], ["low-code", "internal-tools"]],
  ["Budibase", "budibase", "Budibase", "https://budibase.com", "Open-source low-code app builder for internal business tools.", "Open source", true, true, true, ["coding-development"], "open-source", ["web", "self-hosted"], ["low-code", "workflows"]],
  ["Softr", "softr", "Softr", "https://www.softr.io", "No-code app builder on top of Airtable/databases with AI helpers.", "Freemium", false, true, false, ["coding-development", "productivity"], "tool", ["web"], ["no-code", "airtable"]],
  ["FlutterFlow", "flutterflow", "FlutterFlow", "https://www.flutterflow.io", "Visual Flutter app builder with AI generation for mobile products.", "Freemium", false, true, false, ["coding-development"], "platform", ["web"], ["flutter", "mobile"]],
  ["Adalo", "adalo", "Adalo", "https://www.adalo.com", "No-code mobile app builder popular with solo founders and SMBs.", "Freemium", false, true, false, ["coding-development"], "tool", ["web"], ["mobile", "no-code"]],
  ["Fillout", "fillout", "Fillout", "https://www.fillout.com", "Modern forms platform with AI form generation and workflow logic.", "Freemium", false, true, false, ["productivity", "business-marketing"], "tool", ["web"], ["forms", "workflows"]],
  ["Tally", "tally-forms", "Tally", "https://tally.so", "Free-friendly forms product with AI assistance for creating surveys.", "Freemium", false, false, false, ["productivity", "business-marketing"], "tool", ["web"], ["forms", "surveys"]],
  ["Typeform", "typeform", "Typeform", "https://www.typeform.com", "Conversational forms/surveys platform with AI creation features.", "Freemium", false, true, false, ["business-marketing", "productivity"], "tool", ["web"], ["forms", "surveys"]],
  ["Jotform AI", "jotform-ai", "Jotform", "https://www.jotform.com", "Form builder giant with AI agents and form generation tools.", "Freemium", false, true, false, ["productivity", "business-marketing"], "tool", ["web"], ["forms", "agents"]],

  // Dev / agents / infra
  ["Sweep AI", "sweep-ai", "Sweep AI", "https://sweep.dev", "AI junior developer that turns issues into pull requests in GitHub.", "Freemium", false, true, false, ["coding-development", "automation-agents"], "tool", ["web"], ["github", "prs"]],
  ["OpenHands", "openhands", "OpenHands", "https://www.all-hands.dev", "Open-source autonomous coding agent platform formerly OpenDevin.", "Open source", true, true, true, ["coding-development", "automation-agents"], "open-source", ["self-hosted", "web"], ["agents", "coding"]],
  ["GPT Engineer", "gpt-engineer", "GPT Engineer", "https://gptengineer.app", "Popular open-source codegen agent to scaffold apps from prompts.", "Open source", true, false, true, ["coding-development"], "open-source", ["python", "self-hosted"], ["codegen", "agents"]],
  ["Aider Desk", "aider-desk", "community / Aider ecosystem", "https://aider.chat", "Pair-programming CLI agent ecosystem around Aider for repo edits.", "Open source", true, false, true, ["coding-development"], "open-source", ["self-hosted"], ["cli", "pairing"]],
  ["Roo Code", "roo-code", "Roo Code", "https://roocode.com", "VS Code autonomous coding agent fork popular in the Cline ecosystem.", "Open source", true, false, true, ["coding-development", "automation-agents"], "extension", ["vscode"], ["agent", "vscode"]],
  ["Continue.dev", "continue-dev-full", "Continue", "https://www.continue.dev", "Open-source IDE copilot for custom model backends and team configs.", "Open source", true, true, true, ["coding-development"], "extension", ["vscode", "jetbrains"], ["copilot", "open-source"]],
  ["Sourcegraph", "sourcegraph", "Sourcegraph", "https://sourcegraph.com", "Code search and Cody AI platform for understanding large codebases.", "Freemium", false, true, true, ["coding-development"], "platform", ["web", "self-hosted"], ["code-search", "cody"]],
  ["Sourcery", "sourcery", "Sourcery", "https://sourcery.ai", "AI refactoring and code review assistant for Python and more.", "Freemium", false, true, false, ["coding-development"], "extension", ["vscode"], ["refactor", "review"]],
  ["Bito", "bito", "Bito", "https://bito.ai", "AI coding assistant and code review agent for engineering teams.", "Freemium", false, true, false, ["coding-development"], "tool", ["web", "vscode"], ["code-review", "assistant"]],
  ["GitHub Copilot Workspace", "github-copilot-workspace", "GitHub", "https://github.com/features/copilot", "GitHub’s agentic coding environment for issue-to-PR workflows with Copilot.", "Paid", false, false, false, ["coding-development", "automation-agents"], "tool", ["web"], ["github", "agent"]],
  ["Amazon CodeWhisperer", "amazon-codewhisperer", "Amazon Web Services", "https://aws.amazon.com/q/developer/", "AWS AI coding companion (now part of Amazon Q Developer).", "Freemium", false, false, false, ["coding-development"], "tool", ["vscode"], ["aws", "completion"]],
  ["Browserbase", "browserbase", "Browserbase", "https://www.browserbase.com", "Headless browser cloud for AI agents that need reliable web automation.", "Paid", false, true, false, ["automation-agents", "coding-development"], "platform", ["web"], ["browser", "agents"]],
  ["MultiOn", "multion", "MultiOn", "https://www.multion.ai", "Web action agent API for automating browser tasks with AI.", "Paid", false, true, false, ["automation-agents"], "api", ["web"], ["web-agent", "automation"]],
  ["Lindy", "lindy", "Lindy", "https://www.lindy.ai", "No-code AI agents/automations for business workflows and email ops.", "Freemium", false, false, false, ["automation-agents", "productivity"], "tool", ["web"], ["agents", "automation"]],
  ["Relay.app", "relay-app", "Relay.app", "https://www.relay.app", "AI workflow automation with human-in-the-loop steps for teams.", "Freemium", false, true, false, ["automation-agents", "productivity"], "tool", ["web"], ["workflows", "hitl"]],
  ["Zapier Agents", "zapier-agents", "Zapier", "https://zapier.com/agents", "Zapier’s AI agents that use your connected apps to complete tasks.", "Paid", false, true, false, ["automation-agents", "productivity"], "tool", ["web"], ["agents", "zapier"]],
  ["Make AI", "make-ai", "Make", "https://www.make.com", "Make (Integromat) scenario automation with AI modules for content/ops.", "Freemium", false, true, false, ["automation-agents"], "platform", ["web"], ["automation", "scenarios"]],
  ["Arize Phoenix", "arize-phoenix", "Arize AI", "https://phoenix.arize.com", "Open-source LLM observability and evaluation toolkit for AI apps.", "Open source", true, true, true, ["coding-development", "data-analytics"], "open-source", ["python", "self-hosted"], ["evals", "observability"]],
  ["Braintrust", "braintrust", "Braintrust", "https://www.braintrust.dev", "Eval and observability platform for shipping reliable AI products.", "Freemium", false, true, false, ["coding-development"], "platform", ["web"], ["evals", "prompts"]],
  ["PromptLayer", "promptlayer", "PromptLayer", "https://www.promptlayer.com", "Prompt management and logging platform for LLM engineering teams.", "Freemium", false, true, false, ["coding-development"], "platform", ["web"], ["prompts", "logging"]],
  ["Humanloop", "humanloop", "Humanloop", "https://humanloop.com", "Prompt engineering and evaluation platform for enterprise LLM apps.", "Paid", false, true, false, ["coding-development"], "platform", ["web"], ["prompts", "evals"]],
  ["MLflow", "mlflow", "Databricks", "https://mlflow.org", "Open-source MLOps platform for experiment tracking and model registry.", "Open source", true, true, true, ["data-analytics", "coding-development"], "open-source", ["python", "self-hosted"], ["mlops", "tracking"]],
  ["Weights & Biases Weave", "wandb-weave", "Weights & Biases", "https://wandb.ai/site/weave", "W&B Weave for tracing and evaluating LLM applications.", "Freemium", false, true, false, ["coding-development", "data-analytics"], "platform", ["web", "python"], ["llmops", "tracing"]],
  ["V7", "v7-labs", "V7", "https://www.v7labs.com", "AI data platform for labeling, model training, and document workflows.", "Paid", false, true, false, ["data-analytics"], "platform", ["web"], ["labeling", "documents"]],
  ["Encord", "encord", "Encord", "https://encord.com", "Data development platform for computer vision and multimodal AI teams.", "Paid", false, true, false, ["data-analytics"], "platform", ["web"], ["labeling", "cv"]],
  ["SuperAnnotate", "superannotate", "SuperAnnotate", "https://www.superannotate.com", "Annotation platform for vision/LLM datasets used by ML teams.", "Paid", false, true, false, ["data-analytics"], "platform", ["web"], ["annotation", "datasets"]],
  ["Snorkel AI", "snorkel-ai", "Snorkel AI", "https://snorkel.ai", "Data-centric AI platform for programmatic labeling and expert workflows.", "Paid", false, true, false, ["data-analytics"], "platform", ["web"], ["labeling", "data-centric"]],

  // Search / assistants / regional popular verified
  ["Komo", "komo", "Komo", "https://komo.ai", "AI search engine with chat, explore, and social-style answer modes.", "Freemium", false, false, false, ["research-education", "ai-assistants"], "tool", ["web"], ["ai-search"]],
  ["Felo", "felo", "Felo", "https://felo.ai", "AI search assistant popular for multilingual research answers.", "Freemium", false, false, false, ["research-education", "ai-assistants"], "tool", ["web"], ["search", "multilingual"]],
  ["Andi", "andi-search", "Andi", "https://andisearch.com", "Privacy-oriented AI search assistant with conversational answers.", "Free", false, false, false, ["research-education", "ai-assistants"], "tool", ["web"], ["search", "privacy"]],
  ["Devv", "devv", "Devv", "https://devv.ai", "Developer-focused AI search for coding questions and docs.", "Freemium", false, false, false, ["coding-development", "research-education"], "tool", ["web"], ["dev-search", "docs"]],
  ["iFlytek Spark", "iflytek-spark", "iFlytek", "https://xinghuo.xfyun.cn", "Major Chinese LLM assistant from iFlytek (Spark Desk).", "Freemium", false, true, false, ["ai-assistants"], "model", ["web"], ["china", "llm"]],
  ["SenseNova", "sensenova", "SenseTime", "https://www.sensetime.com", "SenseTime’s foundation model family and enterprise generative AI stack.", "Paid", false, true, false, ["ai-assistants", "coding-development"], "platform", ["web"], ["china", "foundation-models"]],
  ["Yi", "yi-01ai", "01.AI", "https://www.01.ai", "01.AI Yi models—popular open/API LLMs from Kai-Fu Lee’s lab.", "Freemium", true, true, true, ["ai-assistants", "coding-development"], "model", ["web", "self-hosted"], ["open-weight", "llm"]],
  ["Baichuan", "baichuan", "Baichuan AI", "https://www.baichuan-ai.com", "Baichuan large language models widely used in Chinese AI apps.", "Freemium", true, true, true, ["ai-assistants"], "model", ["web", "self-hosted"], ["china", "llm"]],
  ["Jimeng", "jimeng", "ByteDance", "https://jimeng.jianying.com", "ByteDance AI image/video creation suite linked to CapCut ecosystem.", "Freemium", false, false, false, ["image-generation", "video-generation"], "tool", ["web"], ["bytedance", "creative"]],
  ["Dreamina", "dreamina", "ByteDance", "https://dreamina.capcut.com", "CapCut/ByteDance generative design tool for images and creatives.", "Freemium", false, false, false, ["image-generation", "design-creativity"], "tool", ["web"], ["capcut", "design"]],
  ["Tongyi Qianwen", "tongyi-qianwen", "Alibaba Cloud", "https://tongyi.aliyun.com", "Alibaba’s Tongyi Qianwen assistant and model portal (Qwen ecosystem).", "Freemium", true, true, true, ["ai-assistants"], "model", ["web"], ["alibaba", "qwen"]],
  ["Skywork", "skywork", "Kunlun Tech / Skywork", "https://www.skywork.ai", "Skywork multimodal models and productivity assistants from Kunlun.", "Freemium", false, true, false, ["ai-assistants", "productivity"], "model", ["web"], ["multimodal", "china"]],
  ["StepFun", "stepfun", "StepFun", "https://www.stepfun.com", "StepFun (JieYue) foundation models and chat products gaining rapid adoption.", "Freemium", false, true, false, ["ai-assistants"], "model", ["web"], ["llm", "china"]],
  ["Hume AI", "hume-ai", "Hume AI", "https://www.hume.ai", "Empathic voice AI platform measuring and generating emotional speech.", "Paid", false, true, false, ["audio-music", "coding-development"], "api", ["web"], ["voice", "emotion"]],
  ["Sesame", "sesame-ai", "Sesame", "https://www.sesame.com", "Realtime conversational voice AI known for natural dialogue demos.", "Freemium", false, false, false, ["audio-music", "ai-assistants"], "tool", ["web"], ["voice", "realtime"]],
  ["OpenAI Realtime API", "openai-realtime-api", "OpenAI", "https://platform.openai.com/docs/guides/realtime", "OpenAI API for low-latency speech-to-speech multimodal agents.", "Paid", false, true, false, ["audio-music", "coding-development"], "api", ["web"], ["realtime", "voice"]],
  ["Gemini Live", "gemini-live", "Google", "https://gemini.google.com", "Gemini’s live voice/camera conversational mode in the Gemini app.", "Freemium", false, false, false, ["ai-assistants"], "tool", ["web", "ios", "android"], ["voice", "multimodal"]],
  ["Claude for Work", "claude-for-work", "Anthropic", "https://claude.ai", "Anthropic’s team/enterprise Claude workspace for organizations.", "Paid", false, false, false, ["ai-assistants", "productivity"], "tool", ["web"], ["teams", "enterprise"]],
  ["ChatGPT Enterprise", "chatgpt-enterprise", "OpenAI", "https://openai.com/chatgpt/enterprise/", "Enterprise ChatGPT with admin controls, security, and unlimited GPT access tiers.", "Paid", false, false, false, ["ai-assistants", "business-marketing"], "platform", ["web"], ["enterprise", "admin"]],
  ["Microsoft 365 Copilot", "microsoft-365-copilot", "Microsoft", "https://www.microsoft.com/microsoft-365/copilot", "Copilot inside Word, Excel, PowerPoint, Outlook, and Teams.", "Paid", false, false, false, ["productivity", "business-marketing"], "tool", ["web", "windows"], ["office", "copilot"]],
  ["GitHub Spark", "github-spark", "GitHub", "https://github.com/features", "GitHub AI tooling for natural-language app prototyping in the GitHub ecosystem.", "Paid", false, false, false, ["coding-development"], "tool", ["web"], ["github", "prototyping"]],
  ["IBM watsonx", "ibm-watsonx", "IBM", "https://www.ibm.com/watsonx", "IBM enterprise AI platform for models, data, and governance.", "Paid", false, true, false, ["coding-development", "business-marketing"], "platform", ["web"], ["enterprise", "governance"]],
  ["Oracle OCI Generative AI", "oracle-oci-genai", "Oracle", "https://www.oracle.com/artificial-intelligence/generative-ai/", "Oracle Cloud generative AI services for enterprise deployments.", "Paid", false, true, false, ["coding-development"], "platform", ["web"], ["oracle", "enterprise"]],
  ["Salesforce Agentforce", "salesforce-agentforce", "Salesforce", "https://www.salesforce.com/agentforce/", "Salesforce platform for building autonomous agents across CRM clouds.", "Paid", false, true, false, ["automation-agents", "business-marketing"], "platform", ["web"], ["crm", "agents"]],
  ["ServiceNow Now Assist", "servicenow-now-assist", "ServiceNow", "https://www.servicenow.com/products/now-assist.html", "Generative AI assist across ITSM and enterprise workflows on ServiceNow.", "Paid", false, true, false, ["automation-agents", "productivity"], "platform", ["web"], ["itsm", "enterprise"]],
  ["SAP Joule", "sap-joule", "SAP", "https://www.sap.com/products/artificial-intelligence/ai-assistant.html", "SAP’s generative AI assistant embedded in enterprise SAP applications.", "Paid", false, false, false, ["productivity", "business-marketing"], "tool", ["web"], ["sap", "erp"]],
  ["Workday Illuminate", "workday-illuminate", "Workday", "https://www.workday.com", "Workday AI capabilities for HR and finance enterprise workflows.", "Paid", false, false, false, ["productivity", "finance-legal"], "platform", ["web"], ["hr", "finance"]],
  ["Canva Magic Write", "canva-magic-write", "Canva", "https://www.canva.com/magic-write/", "Canva’s AI copy assistant for docs, presentations, and social designs.", "Freemium", false, false, false, ["writing-content", "design-creativity"], "tool", ["web"], ["copy", "canva"]],
  ["Figma Dev Mode AI", "figma-dev-mode-ai", "Figma", "https://www.figma.com", "AI helpers in Figma for design-to-development productivity features.", "Paid", false, false, false, ["design-creativity", "coding-development"], "tool", ["web"], ["figma", "design-systems"]],
  ["Adobe Premiere AI", "adobe-premiere-ai", "Adobe", "https://www.adobe.com/products/premiere.html", "Premiere Pro generative AI tools for editing, transcription, and media.", "Paid", false, false, false, ["video-generation"], "tool", ["windows", "macos"], ["editing", "premiere"]],
  ["Adobe Photoshop AI", "adobe-photoshop-ai", "Adobe", "https://www.adobe.com/products/photoshop.html", "Photoshop Generative Fill/Expand and Firefly-powered creative edits.", "Paid", false, false, false, ["image-generation", "design-creativity"], "tool", ["windows", "macos"], ["generative-fill", "photoshop"]],
  ["Final Cut Pro AI", "final-cut-pro-ai", "Apple", "https://www.apple.com/final-cut-pro/", "Apple’s pro editor with AI features like captions and scene tools.", "Paid", false, false, false, ["video-generation"], "tool", ["macos"], ["editing", "apple"]],
  ["DaVinci Resolve AI", "davinci-resolve-ai", "Blackmagic Design", "https://www.blackmagicdesign.com/products/davinciresolve", "Pro color/edit suite with Neural Engine AI tools for audio/video.", "Freemium", false, false, false, ["video-generation"], "tool", ["windows", "macos", "linux"], ["editing", "color"]],
  ["Blender AI add-ons ecosystem", "blender-ai", "Blender Foundation / community", "https://www.blender.org", "Open 3D suite widely extended with AI add-ons for modeling and rendering.", "Open source", true, false, true, ["design-creativity"], "open-source", ["windows", "macos", "linux"], ["3d", "open-source"]],
  ["Unreal Engine AI tools", "unreal-engine-ai", "Epic Games", "https://www.unrealengine.com", "Epic’s Unreal ecosystem with AI-assisted animation and content tools.", "Freemium", false, false, false, ["design-creativity", "robotics-hardware"], "platform", ["windows"], ["games", "3d"]],
  ["Unity Muse", "unity-muse", "Unity", "https://unity.com/products/muse", "Unity’s AI assistant/tools for game creators and engine workflows.", "Paid", false, false, false, ["design-creativity", "coding-development"], "tool", ["windows", "macos"], ["games", "unity"]],
  ["Autodesk AI", "autodesk-ai", "Autodesk", "https://www.autodesk.com", "Autodesk generative design and AI features across CAD/construction tools.", "Paid", false, false, false, ["design-creativity", "robotics-hardware"], "platform", ["windows"], ["cad", "generative-design"]],
  ["Notion Q&A", "notion-qa", "Notion Labs", "https://www.notion.com/help/notion-ai-faqs", "Ask questions across your Notion workspace using Notion AI Q&A.", "Paid", false, false, false, ["productivity", "research-education"], "tool", ["web"], ["workspace-search", "rag"]],
  ["Slack GPT", "slack-gpt", "Salesforce", "https://slack.com", "Slack generative features for summarize/write in paid Slack plans.", "Paid", false, false, false, ["productivity"], "tool", ["web"], ["slack", "summaries"]],
  ["Discord Clyde", "discord-clyde", "Discord", "https://discord.com", "Discord’s built-in AI assistant experiments for chat help in communities.", "Freemium", false, false, false, ["ai-assistants"], "tool", ["web", "ios", "android"], ["chat", "community"]],
  ["LinkedIn AI", "linkedin-ai", "LinkedIn / Microsoft", "https://www.linkedin.com", "AI writing and hiring helpers across LinkedIn Premium experiences.", "Paid", false, false, false, ["business-marketing", "writing-content"], "tool", ["web"], ["linkedin", "hiring"]],
  ["Zoom IQ", "zoom-iq", "Zoom", "https://www.zoom.com", "Zoom’s conversation intelligence companion features for sales/meetings.", "Paid", false, false, false, ["productivity", "business-marketing"], "tool", ["web"], ["meetings", "sales"]],
];

const PLATFORM_ALIASES = { chrome: "web", docker: "self-hosted" };

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
