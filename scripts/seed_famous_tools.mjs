/**
 * Seed famous / household-name AI tools still missing from the catalog.
 * Usage: node scripts/seed_famous_tools.mjs
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
  // —— Assistants très connus ——
  {
    name: "Google Gemini App",
    slug: "google-gemini-app",
    publisher: "Google",
    url: "https://gemini.google.com",
    summary: "L’assistant IA grand public de Google (ex-Bard), multimodal et intégré à l’écosystème Google.",
    description:
      "L’application Gemini permet de discuter, analyser des images et s’appuyer sur les services Google pour des tâches du quotidien et professionnelles.",
    pricing_model: "Freemium",
    price_display: "Gratuit / Gemini Advanced",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["gemini", "bard", "google", "assistant", "multimodal"],
    strengths: ["Intégration Google", "Multimodal"],
    limits: ["Fonctionnalités avancées payantes"],
    audience: ["Grand public", "Professionnels"],
    categories: ["ai-assistants"],
    type: "tool",
    platforms: ["web", "ios", "android"],
  },
  {
    name: "Meta AI",
    slug: "meta-ai-app",
    publisher: "Meta",
    url: "https://www.meta.ai",
    summary: "L’assistant Meta intégré à WhatsApp, Instagram, Messenger et le web.",
    description:
      "Meta AI propose chat, génération d’images et aide pratique directement dans les apps Meta et sur meta.ai.",
    pricing_model: "Free",
    price_display: "Gratuit",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["meta", "whatsapp", "instagram", "llama"],
    strengths: ["Disponible dans les apps Meta", "Accès large"],
    limits: ["Disponibilité selon pays"],
    audience: ["Grand public"],
    categories: ["ai-assistants", "image-generation"],
    type: "tool",
    platforms: ["web", "ios", "android"],
  },
  {
    name: "Microsoft Copilot",
    slug: "copilot-microsoft",
    publisher: "Microsoft",
    url: "https://copilot.microsoft.com",
    summary: "Copilot grand public de Microsoft pour le web, Windows et Bing.",
    description:
      "Microsoft Copilot aide à rédiger, rechercher et créer des images, avec intégrations Windows, Edge et Microsoft 365 selon les plans.",
    pricing_model: "Freemium",
    price_display: "Gratuit / Pro",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["copilot", "bing", "windows", "microsoft"],
    strengths: ["Intégré à Windows/Edge", "Recherche web"],
    limits: ["Certaines fonctions réservées aux abonnements"],
    audience: ["Grand public", "Entreprises"],
    categories: ["ai-assistants", "productivity"],
    type: "tool",
    platforms: ["web", "windows", "ios", "android"],
  },
  {
    name: "Amazon Alexa",
    slug: "amazon-alexa",
    publisher: "Amazon",
    url: "https://alexa.amazon.com",
    summary: "Assistant vocal grand public d’Amazon pour la maison connectée et les routines.",
    description:
      "Alexa répond aux commandes vocales, contrôle la domotique et s’enrichit de skills ; Amazon y ajoute progressivement des capacités génératives.",
    pricing_model: "Free",
    price_display: "Gratuit (matériel à part)",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["voice", "assistant", "smart-home", "alexa"],
    strengths: ["Écosystème devices énorme", "Routines vocales"],
    limits: ["Moins fort en raisonnement long que les LLM chat"],
    audience: ["Grand public"],
    categories: ["ai-assistants", "robotics-hardware"],
    type: "platform",
    platforms: ["web", "ios", "android"],
  },
  {
    name: "Google Assistant",
    slug: "google-assistant",
    publisher: "Google",
    url: "https://assistant.google.com",
    summary: "Assistant vocal Google sur Android, Nest et l’écosystème Google.",
    description:
      "Google Assistant gère commandes vocales, domotique et tâches rapides ; Google oriente de plus en plus les usages avancés vers Gemini.",
    pricing_model: "Free",
    price_display: "Gratuit",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["voice", "android", "nest", "assistant"],
    strengths: ["Très présent sur Android", "Maison connectée"],
    limits: ["Migration progressive vers Gemini"],
    audience: ["Grand public"],
    categories: ["ai-assistants", "robotics-hardware"],
    type: "platform",
    platforms: ["android", "ios", "web"],
  },
  {
    name: "Siri",
    slug: "siri",
    publisher: "Apple",
    url: "https://www.apple.com/siri/",
    summary: "L’assistant vocal d’Apple, renforcé par Apple Intelligence sur appareils compatibles.",
    description:
      "Siri aide à contrôler l’iPhone/Mac et les apps Apple ; avec Apple Intelligence, la compréhension et la rédaction progressent sur le device.",
    pricing_model: "Free",
    price_display: "Inclus avec Apple",
    open_source: false,
    api_available: false,
    local_available: true,
    keywords: ["siri", "apple", "voice", "ios"],
    strengths: ["Intégration Apple", "Vie privée on-device"],
    limits: ["Moins ouvert que les chatbots web"],
    audience: ["Grand public"],
    categories: ["ai-assistants"],
    type: "tool",
    platforms: ["ios", "macos"],
  },
  {
    name: "Replika",
    slug: "replika",
    publisher: "Luka",
    url: "https://replika.com",
    summary: "Companion IA conversationnel très connu pour le chat personnel.",
    description:
      "Replika est un chatbot compagnon axé relation et bien-être émotionnel, populaire auprès du grand public.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["companion", "chatbot", "personal"],
    strengths: ["Expérience compagnon", "Apps mobiles"],
    limits: ["Pas un outil productivité"],
    audience: ["Grand public"],
    categories: ["ai-assistants"],
    type: "tool",
    platforms: ["ios", "android", "web"],
  },
  {
    name: "Poe",
    slug: "poe-by-quora",
    publisher: "Quora",
    url: "https://poe.com",
    summary: "App multi-bots pour chatter avec ChatGPT, Claude, Gemini et bien d’autres.",
    description:
      "Poe agrège de nombreux modèles et bots derrière une seule interface, avec abonnements et bots créés par la communauté.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["multi-model", "chat", "bots", "quora"],
    strengths: ["Accès multi-modèles", "UX simple"],
    limits: ["Quotas selon plan"],
    audience: ["Grand public", "Power users"],
    categories: ["ai-assistants"],
    type: "tool",
    platforms: ["web", "ios", "android"],
  },

  // —— Image célèbres ——
  {
    name: "Craiyon",
    slug: "craiyon",
    publisher: "Craiyon",
    url: "https://www.craiyon.com",
    summary: "Générateur d’images IA gratuit, connu comme l’ex-DALL·E mini.",
    description:
      "Craiyon popularise la génération d’images gratuite dans le navigateur, accessible au grand public.",
    pricing_model: "Freemium",
    price_display: "Gratuit / Pro",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["image", "gratuit", "dalle-mini"],
    strengths: ["Très accessible", "Gratuit"],
    limits: ["Qualité inférieure aux leaders payants"],
    audience: ["Grand public"],
    categories: ["image-generation"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Playground AI",
    slug: "playground-ai",
    publisher: "Playground",
    url: "https://playground.com",
    summary: "Studio d’images IA populaire pour créer et éditer rapidement.",
    description:
      "Playground AI propose génération et édition d’images avec une interface simple pour créateurs et designers.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["image", "editor", "design"],
    strengths: ["Bon équilibre gratuit/qualité", "Édition canvas"],
    limits: ["Limites journalières en free"],
    audience: ["Créateurs", "Designers"],
    categories: ["image-generation", "design-creativity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Artbreeder",
    slug: "artbreeder",
    publisher: "Artbreeder",
    url: "https://www.artbreeder.com",
    summary: "Plateforme célèbre pour croiser et évoluer des images via IA (portraits, paysages).",
    description:
      "Artbreeder permet de mixer des génomes d’images pour explorer des variations créatives, très utilisé pour personnages et concept art.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["image", "portraits", "concept-art"],
    strengths: ["Exploration visuelle unique", "Communauté"],
    limits: ["Moins « prompt-first » que Midjourney"],
    audience: ["Artistes", "Game designers"],
    categories: ["image-generation", "design-creativity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Adobe Express",
    slug: "adobe-express",
    publisher: "Adobe",
    url: "https://www.adobe.com/express/",
    summary: "Outil Adobe grand public pour visuels rapides avec Firefly intégré.",
    description:
      "Adobe Express simplifie la création de posts, logos et vidéos courtes avec des fonctions génératives Firefly.",
    pricing_model: "Freemium",
    price_display: "Gratuit / Premium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["design", "firefly", "social", "adobe"],
    strengths: ["Marque Adobe", "Templates + IA"],
    limits: ["Moins pro que Photoshop"],
    audience: ["Marketeurs", "PME", "Créateurs"],
    categories: ["design-creativity", "business-marketing"],
    type: "tool",
    platforms: ["web", "ios", "android"],
  },
  {
    name: "Freepik AI",
    slug: "freepik-ai",
    publisher: "Freepik",
    url: "https://www.freepik.com/ai",
    summary: "Suite IA Freepik (image, vidéo, rework) très utilisée par les designers.",
    description:
      "Freepik AI regroupe génération d’images, outils de retouche et assets pour accélérer la production visuelle.",
    pricing_model: "Freemium",
    price_display: "Freemium / Premium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["stock", "image", "design", "freepik"],
    strengths: ["Couplé à la librairie Freepik", "Outils créatifs variés"],
    limits: ["Licence selon abonnement"],
    audience: ["Designers", "Marketeurs"],
    categories: ["image-generation", "design-creativity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "SeaArt",
    slug: "seaart",
    publisher: "SeaArt",
    url: "https://www.seaart.ai",
    summary: "Plateforme d’art IA très populaire (modèles, communauté, génération).",
    description:
      "SeaArt propose génération d’images, modèles communautaires et outils créatifs pour illustrateurs et fans d’AI art.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["ai-art", "community", "models"],
    strengths: ["Beaucoup de modèles", "Communauté active"],
    limits: ["Qualité variable selon modèle"],
    audience: ["Créateurs"],
    categories: ["image-generation"],
    type: "tool",
    platforms: ["web"],
  },

  // —— Vidéo célèbres ——
  {
    name: "Google Veo",
    slug: "google-veo",
    publisher: "Google DeepMind",
    url: "https://deepmind.google/models/veo/",
    summary: "Modèle de génération vidéo de Google DeepMind, accessible via Gemini/Video tools Google.",
    description:
      "Veo est le modèle vidéo phare de Google pour générer des clips à partir de texte/images, intégré progressivement aux produits Google.",
    pricing_model: "Paid",
    price_display: "Via Gemini / Cloud",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["video", "veo", "google", "text-to-video"],
    strengths: ["Qualité Google/DeepMind", "Écosystème Gemini"],
    limits: ["Accès encore progressif"],
    audience: ["Créateurs", "Entreprises"],
    categories: ["video-generation"],
    type: "model",
    platforms: ["web"],
  },
  {
    name: "Kaiber",
    slug: "kaiber",
    publisher: "Kaiber",
    url: "https://kaiber.ai",
    summary: "Générateur vidéo IA connu des artistes et musiciens (clips, styles).",
    description:
      "Kaiber transforme images et prompts en vidéos stylisées, souvent utilisé pour clips musicaux et arts visuels.",
    pricing_model: "Freemium",
    price_display: "Crédits",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["video", "music-video", "animation"],
    strengths: ["Rendu artistique", "Popularité créateurs"],
    limits: ["Crédits payants"],
    audience: ["Artistes", "Musiciens"],
    categories: ["video-generation", "design-creativity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Viggle",
    slug: "viggle",
    publisher: "Viggle",
    url: "https://viggle.ai",
    summary: "IA virale pour animer des personnages / controler des mouvements en vidéo.",
    description:
      "Viggle popularise l’animation de personnages à partir d’images et de mouvements, très partagé sur les réseaux.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["animation", "character", "viral", "video"],
    strengths: ["Effets viraux", "Simple à utiliser"],
    limits: ["Usage créatif niche"],
    audience: ["Créateurs"],
    categories: ["video-generation"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Loom",
    slug: "loom",
    publisher: "Atlassian",
    url: "https://www.loom.com",
    summary: "Enregistreur vidéo async très connu, avec résumés et chapitres IA.",
    description:
      "Loom sert à enregistrer rapidement écran + caméra pour le travail d’équipe ; l’IA ajoute titres, résumés et chapitres.",
    pricing_model: "Freemium",
    price_display: "Gratuit / Business",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["async-video", "screen-recording", "summaries"],
    strengths: ["Standard en entreprise", "IA de résumé"],
    limits: ["Pas un générateur text-to-video"],
    audience: ["Équipes", "Entreprises"],
    categories: ["productivity", "video-generation"],
    type: "tool",
    platforms: ["web", "macos", "windows", "chrome"],
  },
  {
    name: "Riverside",
    slug: "riverside",
    publisher: "Riverside",
    url: "https://riverside.fm",
    summary: "Studio d’enregistrement podcast/vidéo distant avec outils IA (clips, transcription).",
    description:
      "Riverside enregistre localement en haute qualité pour podcasts et interviews, avec transcription et découpage assistés par IA.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["podcast", "recording", "transcription", "clips"],
    strengths: ["Qualité audio/vidéo", "Workflow créateurs"],
    limits: ["Fonctions pro payantes"],
    audience: ["Podcasters", "Créateurs"],
    categories: ["audio-music", "video-generation"],
    type: "tool",
    platforms: ["web"],
  },

  // —— Audio célèbres ——
  {
    name: "Amazon Polly",
    slug: "amazon-polly",
    publisher: "Amazon Web Services",
    url: "https://aws.amazon.com/polly/",
    summary: "Service AWS de synthèse vocale (text-to-speech) très utilisé en prod.",
    description:
      "Amazon Polly convertit du texte en voix naturelles via API, pour apps, IVR et contenus accessibles.",
    pricing_model: "Paid",
    price_display: "À l’usage AWS",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["tts", "aws", "speech", "api"],
    strengths: ["Fiable en production", "Nombreuses voix/langues"],
    limits: ["Moins « acteur » qu’ElevenLabs"],
    audience: ["Développeurs", "Entreprises"],
    categories: ["audio-music", "coding-development"],
    type: "api",
    platforms: ["web", "python"],
  },
  {
    name: "WellSaid Labs",
    slug: "wellsaid-labs",
    publisher: "WellSaid Labs",
    url: "https://wellsaidlabs.com",
    summary: "Voix IA premium pour voice-over marketing et e-learning.",
    description:
      "WellSaid propose des voix studio pour narrations professionnelles, formation et publicités.",
    pricing_model: "Paid",
    price_display: "Abonnement",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["tts", "voiceover", "elearning"],
    strengths: ["Qualité voix pro", "Usage entreprise"],
    limits: ["Payant"],
    audience: ["Marketeurs", "L&D"],
    categories: ["audio-music", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "LOVO AI",
    slug: "lovo-ai",
    publisher: "LOVO",
    url: "https://lovo.ai",
    summary: "Générateur de voix et Genny pour vidéos et voice-overs.",
    description:
      "LOVO / Genny fournit TTS et outils de création de voice-over pour contenus marketing et apprentissages.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["tts", "voiceover", "genny"],
    strengths: ["Beaucoup de voix", "Outil créatif intégré"],
    limits: ["Qualité variable selon voix"],
    audience: ["Créateurs", "Marketeurs"],
    categories: ["audio-music"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Boomy",
    slug: "boomy",
    publisher: "Boomy",
    url: "https://boomy.com",
    summary: "Créer des morceaux de musique IA en quelques clics, très grand public.",
    description:
      "Boomy permet de générer et publier des pistes musicales rapidement, orienté créateurs non musiciens.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["music", "songs", "generative"],
    strengths: ["Très simple", "Publication facilitée"],
    limits: ["Contrôle artistique limité"],
    audience: ["Créateurs", "Grand public"],
    categories: ["audio-music"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Mubert",
    slug: "mubert",
    publisher: "Mubert",
    url: "https://mubert.com",
    summary: "Musique IA royalty-aware pour streams, apps et contenus.",
    description:
      "Mubert génère des ambiances musicales pour créateurs, développeurs et marques via web et API.",
    pricing_model: "Freemium",
    price_display: "Freemium / API",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["music", "royalty", "api", "ambient"],
    strengths: ["API musique", "Usage contenu/streaming"],
    limits: ["Moins « composition » classique"],
    audience: ["Créateurs", "Développeurs"],
    categories: ["audio-music"],
    type: "api",
    platforms: ["web"],
  },

  // —— Productivité / bureautique célèbres ——
  {
    name: "Duolingo Max",
    slug: "duolingo-max",
    publisher: "Duolingo",
    url: "https://www.duolingo.com",
    summary: "Version IA de Duolingo (explications et rôle-play) pour apprendre les langues.",
    description:
      "Duolingo Max ajoute des explications GPT et des exercices de conversation pour l’apprentissage linguistique.",
    pricing_model: "Paid",
    price_display: "Abonnement Max",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["education", "languages", "learning"],
    strengths: ["Marque ultra connue", "Pédagogie ludique + IA"],
    limits: ["Max payant"],
    audience: ["Étudiants", "Grand public"],
    categories: ["research-education"],
    type: "tool",
    platforms: ["ios", "android", "web"],
  },
  {
    name: "Khanmigo",
    slug: "khanmigo",
    publisher: "Khan Academy",
    url: "https://www.khanmigo.ai",
    summary: "Tuteur IA de Khan Academy pour élèves et enseignants.",
    description:
      "Khanmigo guide l’apprentissage (maths, écriture, etc.) avec une approche tutorielle plutôt que de donner juste la réponse.",
    pricing_model: "Paid",
    price_display: "Abonnement / écoles",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["education", "tutor", "khan-academy"],
    strengths: ["Pédagogie sérieuse", "Marque éducative de confiance"],
    limits: ["Accès payant"],
    audience: ["Élèves", "Enseignants"],
    categories: ["research-education"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Photomath",
    slug: "photomath",
    publisher: "Photomath",
    url: "https://photomath.com",
    summary: "App célèbre pour scanner et résoudre des problèmes de maths étape par étape.",
    description:
      "Photomath utilise la caméra pour reconnaître des équations et expliquer les solutions, très populaire chez les élèves.",
    pricing_model: "Freemium",
    price_display: "Gratuit / Plus",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["math", "education", "homework", "camera"],
    strengths: ["UX ultra simple", "Explications pas à pas"],
    limits: ["Focus maths uniquement"],
    audience: ["Élèves", "Parents"],
    categories: ["research-education"],
    type: "tool",
    platforms: ["ios", "android"],
  },
  {
    name: "WolframAlpha",
    slug: "wolframalpha",
    publisher: "Wolfram Research",
    url: "https://www.wolframalpha.com",
    summary: "Moteur de connaissance computationnelle mythique (maths, science, data).",
    description:
      "WolframAlpha calcule et explique via un moteur symbolique/données structurées, souvent branché aux LLM comme outil fiable.",
    pricing_model: "Freemium",
    price_display: "Gratuit / Pro",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["math", "computation", "science", "knowledge"],
    strengths: ["Exactitude calculatoire", "API historique"],
    limits: ["Moins « conversationnel » qu’un chatbot"],
    audience: ["Étudiants", "Ingénieurs", "Chercheurs"],
    categories: ["research-education", "data-analytics"],
    type: "tool",
    platforms: ["web", "ios", "android"],
  },
  {
    name: "Quizlet",
    slug: "quizlet",
    publisher: "Quizlet",
    url: "https://quizlet.com",
    summary: "Plateforme de flashcards n°1 étudiants, avec Magic Notes / IA d’étude.",
    description:
      "Quizlet aide à mémoriser via cartes et quiz ; les fonctions IA génèrent des supports d’étude à partir de notes.",
    pricing_model: "Freemium",
    price_display: "Gratuit / Plus",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["flashcards", "study", "education"],
    strengths: ["Adoption étudiante massive", "Génération de sets"],
    limits: ["Qualité IA à vérifier"],
    audience: ["Étudiants"],
    categories: ["research-education"],
    type: "tool",
    platforms: ["web", "ios", "android"],
  },
  {
    name: "Otter.ai",
    slug: "otter",
    publisher: "Otter.ai",
    url: "https://otter.ai",
    summary: "Transcription de réunions en temps réel, très répandue aux US.",
    description:
      "Otter transcrit réunions Zoom/Meet, génère résumés et permet de rechercher dans les conversations d’équipe.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["transcription", "meetings", "notes"],
    strengths: ["Marque meetings très connue", "Résumés"],
    limits: ["Qualité selon audio/accents"],
    audience: ["Équipes", "Étudiants"],
    categories: ["productivity", "audio-music"],
    type: "tool",
    platforms: ["web", "ios", "android"],
  },
  {
    name: "Airtable AI",
    slug: "airtable-ai",
    publisher: "Airtable",
    url: "https://www.airtable.com/ai",
    summary: "IA intégrée à Airtable pour champs, résumés et automatisations de bases.",
    description:
      "Airtable AI aide à remplir des champs, résumer des records et accélérer les workflows no-code sur des bases de données métier.",
    pricing_model: "Paid",
    price_display: "Credits / plans",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["no-code", "database", "automation"],
    strengths: ["Contexte métier Airtable", "No-code friendly"],
    limits: ["Crédits IA payants"],
    audience: ["Ops", "PME", "Product"],
    categories: ["productivity", "automation-agents"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Coda AI",
    slug: "coda-ai",
    publisher: "Coda",
    url: "https://coda.io/product/ai",
    summary: "Assistant IA dans Coda docs pour rédiger, résumer et automatiser des docs-apps.",
    description:
      "Coda AI s’intègre aux docs Coda pour drafting, Q&A sur le contenu et aides à la construction de docs interactifs.",
    pricing_model: "Freemium",
    price_display: "Selon plan Coda",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["docs", "workspace", "writing"],
    strengths: ["Docs + bases dans un outil", "IA contextuelle"],
    limits: ["Courbe d’apprentissage Coda"],
    audience: ["Équipes produit", "Ops"],
    categories: ["productivity", "writing-content"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Asana Intelligence",
    slug: "asana-intelligence",
    publisher: "Asana",
    url: "https://asana.com/product/intelligence",
    summary: "IA Asana pour objectifs, statuts et rédaction dans le work management.",
    description:
      "Asana Intelligence aide à formuler des tâches, résumer l’avancement et aligner le travail sur les objectifs d’équipe.",
    pricing_model: "Paid",
    price_display: "Plans Asana",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["project-management", "tasks", "status"],
    strengths: ["Natif Asana", "Utile aux managers"],
    limits: ["Réservé à l’écosystème Asana"],
    audience: ["Équipes", "Managers"],
    categories: ["productivity"],
    type: "tool",
    platforms: ["web", "ios", "android"],
  },
  {
    name: "monday.com AI",
    slug: "monday-ai",
    publisher: "monday.com",
    url: "https://monday.com/w/ai",
    summary: "Fonctions IA de monday.com pour tableaux, formules et automatisations.",
    description:
      "monday AI assiste la création de boards, la rédaction et les automatisations dans la plateforme work OS monday.com.",
    pricing_model: "Paid",
    price_display: "Plans monday",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["work-os", "boards", "automation"],
    strengths: ["Adoption PME forte", "IA dans le flux de travail"],
    limits: ["Selon plan"],
    audience: ["PME", "Ops"],
    categories: ["productivity", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },

  // —— Marketing / social célèbres ——
  {
    name: "AdCreative.ai",
    slug: "adcreative-ai",
    publisher: "AdCreative.ai",
    url: "https://www.adcreative.ai",
    summary: "Génération de créas publicitaires IA très utilisée en performance marketing.",
    description:
      "AdCreative.ai produit variantes de bannières et scores prédictifs pour accélérer les tests d’ads.",
    pricing_model: "Paid",
    price_display: "Abonnement",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["ads", "creative", "marketing"],
    strengths: ["Volume de variantes ads", "Orientation conversion"],
    limits: ["Moins custom qu’une équipe design"],
    audience: ["Growth", "Agences"],
    categories: ["business-marketing", "design-creativity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Predis.ai",
    slug: "predis-ai",
    publisher: "Predis.ai",
    url: "https://predis.ai",
    summary: "Création de posts social media (texte + visuels) par IA.",
    description:
      "Predis génère calendriers et posts pour Instagram, LinkedIn, etc., avec visuels et légendes.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["social-media", "content", "instagram"],
    strengths: ["All-in-one social", "Rapide pour PME"],
    limits: ["Ton de marque à retravailler"],
    audience: ["SME", "Social managers"],
    categories: ["business-marketing", "writing-content"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Buffer AI",
    slug: "buffer-ai",
    publisher: "Buffer",
    url: "https://buffer.com",
    summary: "Buffer, outil social historique, avec assistant IA de rédaction de posts.",
    description:
      "Buffer planifie les publications social media et propose une aide IA pour brainstormer et rédiger des posts.",
    pricing_model: "Freemium",
    price_display: "Gratuit / Essentials",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["social", "scheduling", "writing"],
    strengths: ["Marque social connue", "Planification + IA"],
    limits: ["IA d’écriture basique vs suites spécialisées"],
    audience: ["Créateurs", "SME"],
    categories: ["business-marketing", "writing-content"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Semrush AI",
    slug: "semrush-ai",
    publisher: "Semrush",
    url: "https://www.semrush.com",
    summary: "Suite SEO leader avec fonctionnalités IA de contenu et recherche.",
    description:
      "Semrush est une référence SEO/SEA ; ses outils IA aident à idéation, rédaction et optimisation de contenu.",
    pricing_model: "Paid",
    price_display: "Abonnement",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["seo", "content", "keywords", "marketing"],
    strengths: ["Data SEO de référence", "IA contenu intégrée"],
    limits: ["Prix élevé"],
    audience: ["Marketeurs", "SEO"],
    categories: ["business-marketing", "writing-content"],
    type: "platform",
    platforms: ["web"],
  },
  {
    name: "Surfer SEO",
    slug: "surfer-seo",
    publisher: "Surfer",
    url: "https://surferseo.com",
    summary: "Outil d’optimisation de contenu SEO très populaire (Content Editor).",
    description:
      "Surfer guide la rédaction SEO avec scores, NLP et briefs pour viser de meilleurs classements.",
    pricing_model: "Paid",
    price_display: "Abonnement",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["seo", "content-editor", "nlp"],
    strengths: ["Standard content SEO", "Briefs actionnables"],
    limits: ["Peut pousser au contenu formel"],
    audience: ["SEO", "Content teams"],
    categories: ["writing-content", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },

  // —— Chatbots / support célèbres ——
  {
    name: "ManyChat",
    slug: "manychat",
    publisher: "ManyChat",
    url: "https://manychat.com",
    summary: "Leader des chatbots marketing Instagram/Facebook/WhatsApp.",
    description:
      "ManyChat automatise DMs et tunnels de conversion sur les réseaux sociaux, avec AI Assist pour accélérer la création de flows.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["chatbot", "instagram", "whatsapp", "marketing"],
    strengths: ["Standard social chatbots", "Croissance PME"],
    limits: ["Dépendance Meta platforms"],
    audience: ["Marketeurs", "Créateurs"],
    categories: ["automation-agents", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Tidio",
    slug: "tidio",
    publisher: "Tidio",
    url: "https://www.tidio.com",
    summary: "Live chat + chatbot IA très répandu sur les sites e-commerce.",
    description:
      "Tidio combine messagerie site, chatbots et agents IA pour le support et la génération de leads.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["chatbot", "ecommerce", "support"],
    strengths: ["Setup rapide", "Populaire Shopify"],
    limits: ["Moins enterprise que Zendesk/Intercom"],
    audience: ["E-commerce", "PME"],
    categories: ["automation-agents", "business-marketing"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Intercom",
    slug: "intercom",
    publisher: "Intercom",
    url: "https://www.intercom.com",
    summary: "Plateforme de customer messaging / support, avec Fin et copilotes IA.",
    description:
      "Intercom est une référence du support moderne : inbox, product tours et agents IA pour résoudre les tickets.",
    pricing_model: "Paid",
    price_display: "Abonnement",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["support", "messaging", "fin", "cx"],
    strengths: ["Marque CX majeure", "IA agent + inbox"],
    limits: ["Coût"],
    audience: ["SaaS", "Support"],
    categories: ["business-marketing", "automation-agents"],
    type: "platform",
    platforms: ["web"],
  },

  // —— Dev / no-code célèbres ——
  {
    name: "Replit",
    slug: "replit",
    publisher: "Replit",
    url: "https://replit.com",
    summary: "IDE cloud ultra connu avec Agent pour builder des apps par prompt.",
    description:
      "Replit permet de coder dans le navigateur ; Replit Agent accélère la création d’apps full-stack à partir d’instructions naturelles.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["ide", "agent", "cloud", "coding"],
    strengths: ["Zero setup", "Agent + hosting"],
    limits: ["Limites free", "Vendor lock-in cloud"],
    audience: ["Développeurs", "Étudiants", "Builders"],
    categories: ["coding-development"],
    type: "platform",
    platforms: ["web"],
  },
  {
    name: "Glide",
    slug: "glide",
    publisher: "Glide",
    url: "https://www.glideapps.com",
    summary: "No-code pour apps à partir de Google Sheets/Data, avec aides IA.",
    description:
      "Glide transforme des données en apps mobiles/web ; l’IA aide à générer écrans et logique plus vite.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["no-code", "apps", "sheets"],
    strengths: ["Très accessible", "Rapide pour MVP internes"],
    limits: ["Complexité limitée vs code"],
    audience: ["Ops", "PME", "Builders"],
    categories: ["coding-development", "productivity"],
    type: "tool",
    platforms: ["web"],
  },
  {
    name: "Bubble",
    slug: "bubble",
    publisher: "Bubble",
    url: "https://bubble.io",
    summary: "Plateforme no-code célèbre pour apps web complexes, avec AI builder.",
    description:
      "Bubble permet de créer des produits web sans code ; les fonctions AI aident à générer pages et workflows.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["no-code", "web-apps", "mvp"],
    strengths: ["Puissance no-code", "Communauté large"],
    limits: ["Courbe d’apprentissage"],
    audience: ["Founders", "Builders"],
    categories: ["coding-development"],
    type: "platform",
    platforms: ["web"],
  },
  {
    name: "Webflow",
    slug: "webflow",
    publisher: "Webflow",
    url: "https://webflow.com",
    summary: "Builder web pro très connu, avec Webflow AI pour copy et structure.",
    description:
      "Webflow est une référence du web design visuel ; l’IA assiste génération de texte, mise en page et productivité design.",
    pricing_model: "Freemium",
    price_display: "Freemium / Site plans",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["web-design", "cms", "no-code"],
    strengths: ["Qualité visuelle pro", "CMS + hosting"],
    limits: ["Prix site plans"],
    audience: ["Designers", "Marketeurs", "Agences"],
    categories: ["design-creativity", "business-marketing"],
    type: "platform",
    platforms: ["web"],
  },
  {
    name: "Durable",
    slug: "durable",
    publisher: "Durable",
    url: "https://durable.co",
    summary: "AI website builder qui génère un site PME en ~30 secondes.",
    description:
      "Durable crée site, copy et branding de base pour petites entreprises via une expérience fortement assistée par IA.",
    pricing_model: "Paid",
    price_display: "Abonnement",
    open_source: false,
    api_available: false,
    local_available: false,
    keywords: ["website-builder", "sme", "ai-site"],
    strengths: ["Extrêmement rapide", "Cible PME claire"],
    limits: ["Personnalisation limitée vs Webflow"],
    audience: ["PME", "Indépendants"],
    categories: ["business-marketing", "design-creativity"],
    type: "tool",
    platforms: ["web"],
  },

  // —— Modèles / labs très connus ——
  {
    name: "ERNIE Bot (Wenxin)",
    slug: "ernie-bot",
    publisher: "Baidu",
    url: "https://yiyan.baidu.com",
    summary: "Assistant IA phare de Baidu, très connu en Chine (Wenxin Yiyan).",
    description:
      "ERNIE Bot / Wenxin Yiyan est l’assistant conversationnel majeur de Baidu pour chat, rédaction et multimédia.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["baidu", "china", "assistant", "ernie"],
    strengths: ["Très populaire en Chine", "Écosystème Baidu"],
    limits: ["Accès/région"],
    audience: ["Grand public", "Entreprises CN"],
    categories: ["ai-assistants"],
    type: "model",
    platforms: ["web"],
  },
  {
    name: "Doubao",
    slug: "doubao",
    publisher: "ByteDance",
    url: "https://www.doubao.com",
    summary: "Assistant IA ByteDance extrêmement populaire en Chine.",
    description:
      "Doubao est le chatbot grand public de ByteDance pour conversation, écriture et productivité quotidienne.",
    pricing_model: "Freemium",
    price_display: "Freemium",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["bytedance", "china", "assistant"],
    strengths: ["Adoption massive CN", "Produit grand public"],
    limits: ["Disponibilité internationale limitée"],
    audience: ["Grand public"],
    categories: ["ai-assistants"],
    type: "tool",
    platforms: ["web", "ios", "android"],
  },
  {
    name: "ChatGLM",
    slug: "chatglm",
    publisher: "Zhipu AI",
    url: "https://chatglm.cn",
    summary: "Famille de modèles / chat Zhipu très connue (open et produit).",
    description:
      "ChatGLM désigne les modèles et l’assistant de Zhipu AI, largement utilisés en recherche et applications chinoises.",
    pricing_model: "Freemium",
    price_display: "Freemium / API",
    open_source: true,
    api_available: true,
    local_available: true,
    keywords: ["glm", "zhipu", "open-weight", "china"],
    strengths: ["Présence open + produit", "Communauté recherche"],
    limits: ["Doc bilingue / région"],
    audience: ["Développeurs", "Chercheurs"],
    categories: ["ai-assistants", "coding-development"],
    type: "model",
    platforms: ["web", "self-hosted"],
  },
  {
    name: "MiniMax",
    slug: "minimax",
    publisher: "MiniMax",
    url: "https://www.minimaxi.com",
    summary: "Lab chinois connu pour modèles multimodaux et vidéo Hailuo.",
    description:
      "MiniMax propose API et produits génératifs (texte, voix, vidéo) dont des modèles vidéo remarqués internationalement.",
    pricing_model: "Freemium",
    price_display: "API / produits",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["hailuo", "video", "multimodal", "api"],
    strengths: ["Vidéo compétitive", "API multimodale"],
    limits: ["Marque moins connue en EU/US que OpenAI"],
    audience: ["Développeurs", "Créateurs"],
    categories: ["video-generation", "ai-assistants"],
    type: "platform",
    platforms: ["web"],
  },
  {
    name: "Cohere Command",
    slug: "cohere-command",
    publisher: "Cohere",
    url: "https://cohere.com",
    summary: "Modèles Command de Cohere pour entreprise (RAG, agents, multilingual).",
    description:
      "Cohere fournit des LLM Command et des services Embed/Rerank très utilisés pour assistants entreprise et RAG.",
    pricing_model: "Paid",
    price_display: "Usage / enterprise",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["enterprise-llm", "rag", "embed", "command"],
    strengths: ["Focus entreprise", "Stack RAG (embed/rerank)"],
    limits: ["Moins grand public"],
    audience: ["Entreprises", "Développeurs"],
    categories: ["coding-development", "business-marketing"],
    type: "model",
    platforms: ["web", "python"],
  },
  {
    name: "Anthropic API",
    slug: "anthropic-api",
    publisher: "Anthropic",
    url: "https://www.anthropic.com/api",
    summary: "API officielle Claude pour intégrer les modèles Anthropic dans vos apps.",
    description:
      "L’API Anthropic expose Claude pour le code, le raisonnement et les assistants d’entreprise avec tool use et messages API.",
    pricing_model: "Paid",
    price_display: "À l’usage",
    open_source: false,
    api_available: true,
    local_available: false,
    keywords: ["claude", "api", "llm", "tool-use"],
    strengths: ["Qualité Claude", "API développeur claire"],
    limits: ["Payant", "Rate limits"],
    audience: ["Développeurs", "Entreprises"],
    categories: ["coding-development"],
    type: "api",
    platforms: ["web", "python"],
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
    console.log(`[skip] url ${tool.url} -> ${byUrl.slug}`);
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
