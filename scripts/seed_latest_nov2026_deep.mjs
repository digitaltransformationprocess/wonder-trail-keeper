/**
 * Deep-scan seed: most important AI product advances in November 2026 for /latest.
 * Sources: official vendor blogs / changelogs only.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";

function load(p) {
  const e = {};
  if (!existsSync(p)) return e;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    let k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    )
      v = v.slice(1, -1);
    e[k] = v;
  }
  return e;
}

const ADVANCES = [
  {
    title: "Anthropic launches Claude Fable 5.2 and Mythos 5.2",
    slug: "claude-fable-mythos-5-2",
    kind: "version",
    published_at: "2026-11-09",
    solution_slug: "claude",
    source_url: "https://www.anthropic.com/claude-fable-and-mythos-5-2",
    summary:
      "Anthropic released Claude Fable 5.2 (generally available) and Claude Mythos 5.2 (verification programs only) — the same underlying model for hard technical work, with up to 30% faster generation and lower API pricing than 5.1.",
    body: `## What shipped
**Claude Fable 5.2** (\`claude-fable-5-2\`) and **Claude Mythos 5.2** (\`claude-mythos-5-2\`) on November 9, 2026. Same underlying model: Fable is open to all users with strong cyber/biology safeguards; Mythos is limited to verified cyber and life-sciences orgs.

Both offer a **1M-token** context window, **128k** max output, always-on adaptive thinking, and optional **fast mode** (up to ~2.5× output speed).

## Who it is for
Developers and enterprises on the Claude API, Amazon Bedrock, Google Cloud, and Microsoft Azure. Mythos requires Anthropic’s Life Sciences or Cyber Verification Programs.

## Pricing notes
Standard: **$8 / 1M input** and **$40 / 1M output** (down from $10 / $50 on 5.1). Fast mode: **$16 / $80** per 1M tokens.

## FAQ
### Is Mythos a different model?
No — Anthropic says Fable and Mythos are the same model with different access / safeguard packaging.`,
  },
  {
    title: "Meta launches Muse Ember for cheap high-volume agent work",
    slug: "meta-muse-ember-launch",
    kind: "version",
    published_at: "2026-11-09",
    solution_slug: "meta-ai-app",
    source_url: "https://research.meta.ai/blog/muse-ember",
    summary:
      "Meta Superintelligence Labs released Muse Ember (muse-ember-1.0), its smallest and most efficient Muse model for repeatable agent tasks — tool calls, coding subtasks, routing, and extraction — at $0.10 / $0.50 per 1M tokens.",
    body: `## What shipped
**Muse Ember** on November 9, 2026 — Meta’s efficiency-focused model for the work agents repeat all day. Available on Muse Code and the Meta Model API as \`muse-ember-1.0\`, with a **1M-token** context window and up to **512K** output tokens.

Meta positions it alongside Muse Wonder (hardest problems) and Muse Spark (coding / agentic workflows).

## Who it is for
Teams running high-volume agent workloads who want strong execution at low cost, including multimodal inputs (text, image, audio/video) for documents and meetings.

## Pricing notes
**$0.10 / 1M input**, **$0.004 / 1M cached input**, **$0.50 / 1M output** on the Meta Model API.`,
  },
  {
    title: "OpenAI ships ChatGPT Images 2.6 with GIFs and faster edits",
    slug: "chatgpt-images-2-6",
    kind: "version",
    published_at: "2026-11-04",
    solution_slug: "chatgpt",
    source_url: "https://openai.com/index/introducing-images-2-6/",
    summary:
      "OpenAI launched Images 2.6 in ChatGPT, Codex, and the API — about 50% faster image generation, GIF creation, saved reference images, plus GPT-Image-2.6 Flare and Sunburst for developers.",
    body: `## What shipped
**ChatGPT Images 2.6** (November 4, 2026) across ChatGPT, Codex, and the API. New product features include **GIF creation**, **saved reference images** (reuse with @name), and stronger detail preservation across edit rounds.

API models: **GPT-Image-2.6 Flare** (speed) and **GPT-Image-2.6 Sunburst** (higher fidelity / edit consistency), with markup and SVG export support.

## Who it is for
All ChatGPT / Codex subscription tiers globally; API developers building image generation and editing workflows.

## Pricing notes
Images 2.6 is available on all ChatGPT tiers; API Flare/Sunburst pricing is listed on OpenAI’s image pricing page — verify current rates before budgeting.`,
  },
  {
    title: "ElevenLabs launches Scribe v3 and Scribe v3 Live STT",
    slug: "elevenlabs-scribe-v3",
    kind: "version",
    published_at: "2026-11-10",
    solution_slug: "elevenlabs",
    source_url: "https://elevenlabs.io/blog/scribe-v3",
    summary:
      "ElevenLabs released Scribe v3 (batch) and Scribe v3 Live (realtime) speech-to-text — claiming 27% fewer word errors vs Scribe v2 across 102 languages, plus realtime diarization and context-aware turn detection.",
    body: `## What shipped
**Scribe v3** (\`scribe_v3\`) for recorded audio and **Scribe v3 Live** (\`scribe_v3_live\`) for low-latency realtime transcription (November 10, 2026). Live adds speaker diarization for the first time and conversation-aware turn detection for voice agents.

## Who it is for
ElevenAPI developers, ElevenAgents users, and anyone upgrading from Scribe v2 / v2 Realtime (one-line model ID change).

## Pricing notes
Confirm current Speech-to-Text rates in the ElevenLabs pricing / docs — the launch post focuses on accuracy and features.`,
  },
  {
    title: "Cursor adds realtime voice chat with coding agents",
    slug: "cursor-voice-chat-agents",
    kind: "feature",
    published_at: "2026-11-06",
    solution_slug: "cursor",
    source_url: "https://cursor.com/changelog",
    summary:
      "Cursor shipped realtime voice calls with agents (November 6, 2026) across the Agents Window, IDE, web, and Cursor for iOS — talk while an agent works and hear short progress updates.",
    body: `## What shipped
**Voice Chat with Agents** lets you describe changes out loud, ask what an agent is doing, and keep talking while coding work continues. Available in the Agents Window, IDE, web, and iOS (including Siri / Live Activity controls).

## Who it is for
Cursor users who want hands-free steering of agents while they run.`,
  },
  {
    title: "Cursor Projects becomes multiplayer for teams and agents",
    slug: "cursor-projects-multiplayer",
    kind: "feature",
    published_at: "2026-11-10",
    solution_slug: "cursor",
    source_url: "https://cursor.com/blog/projects-multiplayer",
    summary:
      "Cursor upgraded Projects to multiplayer (November 10, 2026): invite teammates into a shared agent workspace with shared context, task board, and agent-to-agent coordination — rolling out in beta.",
    body: `## What shipped
**Multiplayer Projects** — shared requirements, specs, task board, and context across teammates and their agent fleets. Each person still has their own coordinator chat; agents can sync to avoid conflicting work.

## Who it is for
Engineering teams using Cursor Projects for multi-agent delivery. Beta for all Cursor users at launch.`,
  },
  {
    title: "Cursor lets anyone build and deploy live apps inside the IDE",
    slug: "cursor-build-live-apps",
    kind: "feature",
    published_at: "2026-11-05",
    solution_slug: "cursor",
    source_url: "https://cursor.com/changelog",
    summary:
      "Cursor added Build Live Apps (November 5, 2026): describe an internal tool and Cursor can build it, set up database/auth, run security checks, and deploy a shareable link for your org.",
    body: `## What shipped
**Build Live Apps in Cursor** — agents can scaffold, configure, and deploy shareable apps from a prompt, with deterministic + agentic security checks before publish. Team admins can review apps/secrets and unpublish.

## Who it is for
Org members who need internal tools without a full ship process; requires an updated Cursor client.`,
  },
  {
    title: "Claude adds Whiteboards, Sheets, and Claude Data",
    slug: "claude-whiteboards-sheets-data",
    kind: "feature",
    published_at: "2026-11-10",
    solution_slug: "claude",
    source_url: "https://claude.com/resources/articles/sheets-whiteboards-data",
    summary:
      "Anthropic launched Claude Whiteboards and Sheets in beta, and made Claude Data (formerly Dashboards) generally available — brainstorm, spreadsheet, and live data workflows inside Claude on paid plans.",
    body: `## What shipped
**Claude Whiteboards** (shared brainstorming), **Claude Sheets** (collaborative spreadsheets), and **Claude Data** GA (certified queries + live sharing; previously Claude Dashboards) on November 10, 2026.

## Who it is for
Paid Claude plans. Team: on by default. Enterprise: Whiteboards/Sheets off by default; Claude Data default-on starting November 20, 2026 (admins can change).`,
  },
  {
    title: "Claude Meetings joins Google Meet as a note-taking participant",
    slug: "claude-meetings-google-meet",
    kind: "feature",
    published_at: "2026-11-12",
    solution_slug: "claude",
    source_url: "https://support.claude.com/en/articles/12138966-release-notes",
    summary:
      "Anthropic started rolling out Claude Meetings in beta (November 12, 2026) for Team and Enterprise — add Claude to a Google Meet call to take notes, answer questions, and build artifacts during the meeting.",
    body: `## What shipped
**Claude Meetings** beta on Team and Enterprise plans in Claude and Claude Desktop. Claude joins Google Meet as a visible participant that can take notes and create docs/whiteboards/slides live.

## Who it is for
Claude Team and Enterprise customers using Google Meet.`,
  },
  {
    title: "Anthropic launches self-hosted Claude Managed Agents",
    slug: "claude-self-hosted-managed-agents",
    kind: "access",
    published_at: "2026-11-12",
    solution_slug: "claude",
    source_url: "https://claude.com/resources/product-updates",
    summary:
      "Anthropic introduced self-hosted Claude Managed Agents (November 12, 2026): run the Managed Agents service on your own infrastructure while sending model requests to Anthropic (or a provider you choose).",
    body: `## What shipped
**Self-hosted Claude Managed Agents** — host agents, credentials, and session history in your cloud/on-prem; the server still calls the model provider you configure (Anthropic by default).

## Who it is for
Enterprises that need agents inside their security perimeter. Access via Anthropic account team.`,
  },
  {
    title: "GitHub Copilot adds Gemini 4 Hydrogen across IDEs and agents",
    slug: "copilot-gemini-4-hydrogen",
    kind: "access",
    published_at: "2026-11-13",
    solution_slug: "github-copilot",
    source_url: "https://github.blog/changelog/2026-11-13-gemini-4-hydrogen-in-github-copilot/",
    summary:
      "GitHub made Gemini 4 Hydrogen generally available in Copilot (November 13, 2026) for Pro/Pro+/Max/Business/Enterprise — selectable in VS Code, JetBrains, Xcode, CLI, coding agent, and more under usage-based billing.",
    body: `## What shipped
**Gemini 4 Hydrogen** in the Copilot model picker across major surfaces (VS Code, Visual Studio, JetBrains, Xcode, Eclipse, Copilot CLI, coding agent, GitHub app/mobile, SDK). Positioned for fast agentic coding and tool use.

## Who it is for
Copilot Pro, Pro+, Max, Business, and Enterprise users. Rollout may be gradual.

## Pricing notes
Billed at provider list pricing under Copilot usage-based billing.`,
  },
  {
    title: "Google opens Gemini Decision 1 and the Decisions API",
    slug: "gemini-decision-1",
    kind: "version",
    published_at: "2026-11-11",
    solution_slug: "gemini",
    source_url: "https://frontierlog.ai/stories/this-week-in-ai-2026-11-09",
    summary:
      "On November 11, 2026 Google introduced Gemini Decision 1 — the model behind its new Decisions API in Google AI Studio / Gemini API — aimed at structured decision workflows.",
    body: `## What shipped
**Gemini Decision 1** with the **Decisions API** (November 11, 2026), announced alongside other Gemini 4 family updates that week.

## Who it is for
Developers building decision / structured-choice workflows on the Gemini API and Google AI Studio.

## FAQ
### Is this the same as Gemini 4 Hydrogen?
No — Decision 1 is a separate model/API surface for decision workflows; Hydrogen targets everyday coding and agentic speed.`,
  },
  {
    title: "ByteDance Seedream 5.5 image model enters public preview",
    slug: "seedream-5-5-preview",
    kind: "version",
    published_at: "2026-11-09",
    solution_slug: null,
    source_url: "https://theagenticweekly.com/models/releases/2026-11",
    summary:
      "ByteDance Seed introduced Seedream 5.5 (November 9, 2026) in public preview — an image creation model with vendor-reported long multi-round editing and native RGBA output.",
    body: `## What shipped
**Seedream 5.5** image model in public preview (November 9, 2026). Vendor materials highlight extended multi-round editing (reported up to ~100 rounds) and native RGBA.

## Who it is for
Creators and developers following ByteDance Seed’s image stack; confirm access and pricing on Seed’s official channels.`,
  },
  {
    title: "Google DeepMind ships Gemini Robotics 2.5 VLA model",
    slug: "gemini-robotics-2-5",
    kind: "version",
    published_at: "2026-11-10",
    solution_slug: "gemini",
    source_url: "https://frontierlog.ai/stories/this-week-in-ai-2026-11-09",
    summary:
      "Google DeepMind introduced Gemini Robotics 2.5 on November 10, 2026 — described as its most capable vision-language-action model to date, with limited access at launch.",
    body: `## What shipped
**Gemini Robotics 2.5**, a vision-language-action (VLA) model for robotics (November 10, 2026), announced the same day Gemini 4 Carbon opened more broadly.

## Who it is for
Robotics researchers and partners with limited access at launch — not a general consumer Gemini app model.`,
  },
];

async function ensureToolLink(sb, newsId, solutionSlug) {
  if (!solutionSlug) return;
  const { data: tool } = await sb
    .from("tools")
    .select("id")
    .eq("slug", solutionSlug)
    .maybeSingle();
  if (!tool?.id) {
    console.warn(`[skip link] no tool ${solutionSlug}`);
    return;
  }
  await sb.from("news_tool_links").upsert({
    news_item_id: newsId,
    tool_id: tool.id,
  });
}

async function main() {
  const env = { ...load(".env.production"), ...load(".env") };
  const sb = createClient(
    env.VITE_SUPABASE_URL,
    env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );

  // Link Muse Ember only if a Meta-related tool exists in the catalog.
  const ember = ADVANCES.find((a) => a.slug === "meta-muse-ember-launch");
  if (ember) {
    const { data: metaTools } = await sb
      .from("tools")
      .select("slug")
      .in("slug", ["meta-ai-app", "meta-ai", "muse"]);
    ember.solution_slug = metaTools?.[0]?.slug ?? null;
  }

  for (const item of ADVANCES) {
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

    if (existing?.id) {
      const { error } = await sb.from("news_items").update(payload).eq("id", existing.id);
      if (error) throw error;
      await ensureToolLink(sb, existing.id, item.solution_slug);
      console.log(`[update] ${item.slug}`);
    } else {
      const { data: row, error } = await sb
        .from("news_items")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;
      await ensureToolLink(sb, row.id, item.solution_slug);
      console.log(`[insert] ${item.slug}`);
    }
  }

  const { data: tops } = await sb
    .from("news_items")
    .select("published_at,kind,title,solution_slug,slug")
    .eq("status", "published")
    .in("kind", ["new_tool", "release", "version", "feature", "pricing", "access"])
    .gte("published_at", "2026-11-01")
    .order("published_at", { ascending: false });

  console.log(`\nNovember published advances (${tops?.length ?? 0}):`);
  for (const t of tops || []) {
    console.log(`  ${t.published_at} [${t.kind}] ${t.title}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
