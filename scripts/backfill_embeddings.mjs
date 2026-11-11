/**
 * Backfill tool_embeddings for published tools.
 *
 * Requires:
 *   VITE_SUPABASE_URL (or SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY — Dashboard → API → Secret keys)
 *   EMBEDDING_API_KEY or OPENAI_API_KEY
 * Optional:
 *   EMBEDDING_MODEL (default text-embedding-3-small)
 *   EMBEDDING_BASE_URL (default https://api.openai.com/v1)
 */
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(path) {
  const env = { ...process.env };
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) env[key] = value;
  }
  return env;
}

function contentHash(text) {
  return createHash("sha256").update(text).digest("hex");
}

function toolText(tool) {
  return [
    tool.name,
    tool.summary,
    tool.description,
    ...(tool.keywords ?? []),
    ...(tool.strengths ?? []),
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 8000);
}

async function embed(text, { apiKey, model, baseUrl }) {
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, input: text }),
  });
  if (!res.ok) {
    throw new Error(`Embedding API ${res.status}: ${await res.text()}`);
  }
  const body = await res.json();
  const embedding = body?.data?.[0]?.embedding;
  if (!Array.isArray(embedding) || embedding.length !== 1536) {
    throw new Error(`Expected 1536-dim embedding, got ${embedding?.length}`);
  }
  return embedding;
}

async function main() {
  const env = loadEnv(join(ROOT, ".env"));
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const serviceKey =
    env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;
  const apiKey = env.EMBEDDING_API_KEY || env.OPENAI_API_KEY;
  const model = env.EMBEDDING_MODEL || "text-embedding-3-small";
  const baseUrl = env.EMBEDDING_BASE_URL || "https://api.openai.com/v1";

  const missing = [];
  if (!url) missing.push("VITE_SUPABASE_URL (or SUPABASE_URL)");
  if (!serviceKey) {
    missing.push(
      "SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY (Dashboard → API → Secret keys → reveal/copy sb_secret_… — not the publishable key)",
    );
  }
  if (!apiKey) missing.push("EMBEDDING_API_KEY (or OPENAI_API_KEY)");
  if (missing.length) {
    console.error("Missing env in .env:\n- " + missing.join("\n- "));
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: tools, error } = await supabase
    .from("tools")
    .select("id, name, summary, description, keywords, strengths")
    .eq("status", "published")
    .order("name");
  if (error) throw error;

  const { data: existing } = await supabase.from("tool_embeddings").select("tool_id, content_hash");
  const hashes = new Map((existing ?? []).map((r) => [r.tool_id, r.content_hash]));

  let written = 0;
  let skipped = 0;
  for (const tool of tools ?? []) {
    const text = toolText(tool);
    const hash = contentHash(text);
    if (hashes.get(tool.id) === hash) {
      skipped += 1;
      continue;
    }
    const embedding = await embed(text, { apiKey, model, baseUrl });
    const { error: upsertError } = await supabase.from("tool_embeddings").upsert({
      tool_id: tool.id,
      model,
      dimensions: 1536,
      embedding,
      content_hash: hash,
      updated_at: new Date().toISOString(),
    });
    if (upsertError) throw upsertError;
    written += 1;
    console.log(`[embed] ${tool.name}`);
  }

  console.log(`[embed] done — wrote ${written}, skipped ${skipped}, total ${tools?.length ?? 0}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
