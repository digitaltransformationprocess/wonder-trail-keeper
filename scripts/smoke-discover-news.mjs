/**
 * Smoke-test discover-news after you deploy it yourself.
 * Uses x-ingest-secret from .env.ingest.local / .env (does not publish news).
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(path) {
  const env = {};
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
    env[k] = v;
  }
  return env;
}

const env = {
  ...loadEnv(join(ROOT, ".env.production")),
  ...loadEnv(join(ROOT, ".env")),
  ...loadEnv(join(ROOT, ".env.ingest.local")),
};

const base = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const token =
  env.SUPABASE_SECRET_KEY ||
  env.SUPABASE_SERVICE_ROLE_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY;
const secret = env.INGEST_CRON_SECRET;

if (!base || !token) {
  console.error("Missing SUPABASE_URL / key");
  process.exit(1);
}
if (!secret) {
  console.error("Missing INGEST_CRON_SECRET (needed for non-staff smoke test)");
  process.exit(1);
}

const url = `${base}/functions/v1/discover-news`;
const res = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    apikey: token,
    "x-ingest-secret": secret,
  },
  body: JSON.stringify({ ping: true }),
});

const text = await res.text();
console.log("status", res.status);
console.log(text.slice(0, 1000));
if (!res.ok) process.exit(1);
try {
  const json = JSON.parse(text);
  if (!json.ok || !json.ping) {
    console.error("Unexpected ping payload — redeploy may still be needed");
    process.exit(1);
  }
  console.log("discover-news is healthy");
} catch {
  process.exit(1);
}
