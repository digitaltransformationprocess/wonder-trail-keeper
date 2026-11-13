/**
 * IndexNow helper — notify Bing & other engines of URL adds/updates.
 * Spec: https://www.indexnow.org/documentation
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ENDPOINT = "https://api.indexnow.org/indexnow";
const BATCH = 10_000;

export function resolveIndexNowKey(root, env = process.env) {
  const fromEnv = (env.INDEXNOW_KEY || "").trim();
  if (fromEnv) return fromEnv;

  const publicDir = join(root, "public");
  if (!existsSync(publicDir)) return null;
  for (const name of readdirSync(publicDir)) {
    if (!/^[a-zA-Z0-9-]{8,128}\.txt$/.test(name)) continue;
    const key = name.slice(0, -4);
    const body = readFileSync(join(publicDir, name), "utf8").trim();
    if (body === key) return key;
  }
  return null;
}

/**
 * @param {object} opts
 * @param {string} opts.host e.g. aidiscov.com
 * @param {string} opts.key
 * @param {string[]} opts.urlList absolute https URLs
 * @param {string} [opts.keyLocation]
 */
export async function submitIndexNow({ host, key, urlList, keyLocation }) {
  const unique = [...new Set(urlList.filter(Boolean))];
  if (!unique.length) return { submitted: 0, results: [] };

  const results = [];
  for (let i = 0; i < unique.length; i += BATCH) {
    const chunk = unique.slice(i, i + BATCH);
    const body = {
      host,
      key,
      urlList: chunk,
    };
    if (keyLocation) body.keyLocation = keyLocation;

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });
    const text = await res.text().catch(() => "");
    results.push({ status: res.status, ok: res.ok || res.status === 202, count: chunk.length, body: text.slice(0, 200) });
  }

  return {
    submitted: unique.length,
    results,
  };
}

export function absoluteUrls(siteUrl, paths) {
  const base = siteUrl.replace(/\/$/, "");
  return paths.map((p) => {
    if (/^https?:\/\//i.test(p)) return p;
    const path = p.startsWith("/") ? p : `/${p}`;
    return `${base}${path}`;
  });
}
