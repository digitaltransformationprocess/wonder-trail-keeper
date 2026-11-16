/**
 * Seed real AI product advances into news_items for /latest
 * (new models, features, versions — not industry news, not catalog blurbs).
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

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const ADVANCES = [
  {
    title: "Google launches Gemini 4 Hydrogen for agentic workflows",
    slug: "gemini-4-hydrogen-launch",
    kind: "version",
    published_at: "2026-11-12",
    solution_slug: "gemini",
    source_url:
      "https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/",
    summary:
      "Google DeepMind released Gemini 4 Hydrogen, a fast model aimed at everyday coding and agentic workflows, rolling out across the Gemini app, Search, AI Studio, and the Gemini API.",
    body: `## What shipped
Google introduced **Gemini 4 Hydrogen** (\`gemini-4-hydrogen\`) on November 12, 2026. It sits alongside Gemini 4 Argon and Gemini 4 Carbon as a speed-focused model for agentic workflows, with a unified 1M-token context window.

## Who it is for
Developers on the Gemini API / AI Studio, Gemini app users, Google Search (AI Mode), and Google AI Pro/Ultra subscribers in Antigravity.

## Pricing notes
Flat API pricing across the full context window: **$1.50 / 1M input tokens** and **$7.50 / 1M output tokens** (per Google’s announcement).

## FAQ
### How is Hydrogen different from Argon / Carbon?
Argon and Carbon target deeper long-horizon reasoning; Hydrogen prioritizes faster execution for everyday agentic tasks.`,
  },
  {
    title: "Gemini 4 Carbon now available as Google’s frontier model",
    slug: "gemini-4-carbon-available",
    kind: "version",
    published_at: "2026-11-10",
    solution_slug: "gemini",
    source_url:
      "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/",
    summary:
      "Google made Gemini 4 Carbon generally available for developers, enterprises, and Ultra subscribers — positioned as the strongest Gemini 4 model for long-horizon coding, cyber, and scientific work.",
    body: `## What shipped
**Gemini 4 Carbon** moved from limited Fairwind access to broader availability on November 10, 2026, joining Argon in Google’s frontier Gemini 4 lineup.

## Who it is for
Paid API / AI Studio developers, Gemini for business, Google AI Ultra users in Antigravity / Gemini app / AI Mode in Search, plus cyber defenders via Fairwind.

## Pricing notes
Introductory API pricing matched Argon during the launch window; Google said higher rates apply after November 30, 2026.`,
  },
  {
    title: "Claude Code adds experimental Code Mode for JS tool calls",
    slug: "claude-code-code-mode",
    kind: "feature",
    published_at: "2026-11-12",
    solution_slug: "claude",
    source_url: "https://code.claude.com/docs/en/code-mode",
    summary:
      "Anthropic shipped Code Mode in Claude Code v2.1.323: an opt-in experiment where Claude writes JavaScript to call multiple tools in one step instead of requesting each tool call separately.",
    body: `## What shipped
**Code Mode** landed in Claude Code **v2.1.323** (November 12, 2026). Claude can write JavaScript that performs several tool calls (including parallel and chained results) in one step.

## Who it is for
Claude Code users who want denser tool use in agentic coding sessions. It is **off by default**; enable with \`CLAUDE_CODE_EXPERIMENTAL_CODE_MODE=1\` in an interactive terminal.

## FAQ
### Is this a new Claude model?
No — it is a **Claude Code product feature**, not a new Claude LLM release.`,
  },
  {
    title: "Claude Code Projects gain coordinator, /btw and /fork",
    slug: "claude-code-projects-coordinator",
    kind: "feature",
    published_at: "2026-11-14",
    solution_slug: "claude",
    source_url: "https://emergent.sh/news/claude-code-projects-adds-coordinator-btw",
    summary:
      "Anthropic updated Claude Code Projects with a coordinator for parallel working sessions, plus /btw and /fork workflows for multi-session product work.",
    body: `## What shipped
Claude Code Projects moved beyond a static file repo toward coordinated parallel sessions, with a **coordinator** that pushes work across sessions and new **\`/btw\`** / **\`/fork\`** commands.

## Who it is for
Teams using Claude Code Projects for larger multi-file / multi-session engineering work.`,
  },
  {
    title: "OpenAI introduces GPT-6 Cyber for aligned security research",
    slug: "gpt-6-cyber-launch",
    kind: "version",
    published_at: "2026-11-05",
    solution_slug: "chatgpt",
    source_url: "https://openai.com/index/introducing-gpt-6-cyber",
    summary:
      "OpenAI launched GPT-6 Cyber, a cybersecurity-focused model trained to find and validate vulnerabilities while staying inside researcher-defined scope, with large gains on ExploitGym vs GPT-5.6 Cyber.",
    body: `## What shipped
**GPT-6 Cyber** (November 5, 2026) targets authorized vulnerability research: find, validate, and help fix exploits while respecting scope boundaries.

## Who it is for
Security researchers and defender programs (including Daybreak workflows). Not a general ChatGPT default model for everyday chat.

## FAQ
### How does it differ from GPT-6 Astra?
Astra is the broader frontier model; Cyber is specialized for cybersecurity agent work and scope alignment.`,
  },
  {
    title: "OpenAI launches GPT-6.1 Terra for fast computer use",
    slug: "gpt-6-1-terra-launch",
    kind: "version",
    published_at: "2026-11-04",
    solution_slug: "chatgpt",
    source_url: "https://openai.com/index/introducing-gpt-6-1-terra",
    summary:
      "GPT-6.1 Terra is OpenAI’s faster computer-use and visual-reasoning model, priced for high-volume workday automation with large gains over GPT-5.6 Terra on Agents’ Last Exam and Terminal-Bench.",
    body: `## What shipped
**GPT-6.1 Terra** focuses on visual reasoning and computer use for everyday professional tasks, with lower API pricing than prior Terra / Sol tiers for high-volume automation.

## Who it is for
Developers automating screen/form/document workflows; ChatGPT Work and Codex users where Terra is offered.`,
  },
  {
    title: "Alibaba releases Qwen4-Max with 1M context and native vision",
    slug: "qwen4-max-launch",
    kind: "version",
    published_at: "2026-11-16",
    solution_slug: null,
    source_url:
      "https://www.alibabacloud.com/blog/alibaba-unveils-qwen4-max-new-ai-teammate-for-work-creativity-and-discovery_603783",
    summary:
      "Alibaba launched Qwen4-Max, described as its strongest Qwen model yet: 2.4T total parameters, native vision, and a one-million-token context window, available on QwenCloud API and related Alibaba surfaces.",
    body: `## What shipped
**Qwen4-Max** (November 16, 2026) is Alibaba’s latest flagship Qwen model with native vision and a **1M-token** context window for complex work, creativity, and research tasks.

## Who it is for
QwenCloud Token Plan / API users, plus Alibaba surfaces such as QwenWork and QwenStudio.

## Pricing notes
Alibaba listed input (implicit cache hit) around **$0.075 / 1M tokens** in the launch post; verify current rates on QwenCloud.`,
  },
  {
    title: "Google Search upgrades AI Mode with Gemini 4 Hydrogen",
    slug: "google-search-gemini-4-hydrogen",
    kind: "feature",
    published_at: "2026-11-12",
    solution_slug: "gemini",
    source_url:
      "https://blog.google/products-and-platforms/products/search/gemini-4-hydrogen-search-upgrade/",
    summary:
      "Google Search rolled Gemini 4 Hydrogen into AI Mode globally, improving intent understanding, query fan-out, visual answers, and multilingual responses for all users.",
    body: `## What shipped
Search’s AI Mode now runs on **Gemini 4 Hydrogen** for all users — Google called it its biggest model upgrade to Search yet.

## Who it is for
Anyone using Google Search AI Mode; no separate product install required.`,
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

  for (const item of ADVANCES) {
    const slug = item.slug || slugify(item.title);
    const { data: existing } = await sb
      .from("news_items")
      .select("id,status")
      .eq("slug", slug)
      .maybeSingle();

    const payload = {
      title: item.title,
      slug,
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
      console.log(`[update] ${slug}`);
    } else {
      const { data: row, error } = await sb
        .from("news_items")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;
      await ensureToolLink(sb, row.id, item.solution_slug);
      console.log(`[insert] ${slug}`);
    }
  }

  const { data: tops } = await sb
    .from("news_items")
    .select("published_at,kind,title,solution_slug")
    .eq("status", "published")
    .in("kind", ["new_tool", "release", "version", "feature", "pricing", "access"])
    .order("published_at", { ascending: false })
    .limit(15);
  console.log(
    "published advances",
    tops?.map((t) => `${t.published_at} [${t.kind}] ${t.title}`),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
