/**
 * Vercel serverless proxy for Truncated.ai (self-contained — no parent imports).
 * Query: ?mode=feed|search&page=1&category=...&q=...
 */

export const config = {
  maxDuration: 15,
};

const UPSTREAM = "https://truncated.ai";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

function clampPage(raw: string | string[] | undefined): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = Number.parseInt(v ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, 100_000);
}

function first(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function pick(
  query: Record<string, string | string[] | undefined>,
  keys: readonly string[],
): URLSearchParams {
  const out = new URLSearchParams();
  for (const key of keys) {
    const v = first(query[key])?.trim();
    if (v) out.set(key, v);
  }
  return out;
}

function send(
  res: {
    statusCode: number;
    setHeader: (k: string, v: string) => void;
    end: (b?: string) => void;
  },
  status: number,
  body: string,
  contentType = "application/json; charset=utf-8",
  extra: Record<string, string> = {},
) {
  res.statusCode = status;
  res.setHeader("Content-Type", contentType);
  for (const [k, v] of Object.entries({ ...CORS, ...extra })) {
    res.setHeader(k, v);
  }
  res.end(body);
}

export default async function handler(
  req: {
    method?: string;
    query: Record<string, string | string[] | undefined>;
    url?: string;
  },
  res: {
    statusCode: number;
    setHeader: (k: string, v: string) => void;
    end: (b?: string) => void;
  },
) {
  try {
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v);
      res.end();
      return;
    }

    if (req.method !== "GET") {
      send(res, 405, JSON.stringify({ error: "Method not allowed" }), undefined, {
        Allow: "GET, OPTIONS",
      });
      return;
    }

    const mode = (first(req.query.mode) ?? "feed").trim().toLowerCase();
    let upstreamPath: string;
    let forward: URLSearchParams;

    if (mode === "feed") {
      upstreamPath = "/api/feed";
      forward = pick(req.query, ["category", "page"]);
    } else if (mode === "search") {
      upstreamPath = "/api/search";
      forward = pick(req.query, [
        "q",
        "page",
        "sort",
        "category",
        "topic",
        "entity",
        "source",
        "type",
        "from",
        "to",
        "noautocorrect",
      ]);
    } else {
      send(
        res,
        400,
        JSON.stringify({ error: "Unknown mode. Use mode=feed or mode=search." }),
      );
      return;
    }

    forward.set("page", String(clampPage(forward.get("page") ?? undefined)));

    if (mode === "search") {
      const q = forward.get("q");
      const hasFilter = ["category", "topic", "entity", "source", "type"].some(
        (k) => forward.has(k),
      );
      if (!q && !hasFilter) {
        send(
          res,
          400,
          JSON.stringify({
            error: "Search needs q or at least one filter (e.g. category).",
          }),
        );
        return;
      }
      if (q && q.length > 200) forward.set("q", q.slice(0, 200));
    }

    const target = `${UPSTREAM}${upstreamPath}?${forward.toString()}`;
    const upstream = await fetch(target, {
      headers: {
        Accept: "application/json",
        "User-Agent": "AI-Discov/1.0 (+https://aidiscov.com)",
      },
    });

    const text = await upstream.text();
    send(
      res,
      upstream.status,
      text,
      "application/json; charset=utf-8",
      {
        "Cache-Control": upstream.ok
          ? "public, s-maxage=120, stale-while-revalidate=300"
          : "no-store",
      },
    );
  } catch (err) {
    send(
      res,
      502,
      JSON.stringify({
        error: "Truncated upstream unavailable",
        detail: err instanceof Error ? err.message : String(err),
      }),
    );
  }
}
