/**
 * Shared Truncated.ai JSON proxy (CORS-safe).
 * Whitelists feed + search only; no arbitrary upstream paths.
 */

const UPSTREAM = "https://truncated.ai";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS,
      ...extra,
    },
  });
}

function clampPage(raw: string | null): number {
  const n = Number.parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, 100_000);
}

function pickAllowed(
  params: URLSearchParams,
  keys: readonly string[],
): URLSearchParams {
  const out = new URLSearchParams();
  for (const key of keys) {
    const v = params.get(key)?.trim();
    if (v) out.set(key, v);
  }
  return out;
}

export function truncatedOptionsResponse(): Response {
  return new Response(null, { status: 204, headers: CORS });
}

export async function handleTruncatedProxy(
  requestUrl: string,
): Promise<Response> {
  const url = new URL(requestUrl);
  const mode = (url.searchParams.get("mode") ?? "feed").trim().toLowerCase();

  let upstreamPath: string;
  let forward: URLSearchParams;

  if (mode === "feed") {
    upstreamPath = "/api/feed";
    forward = pickAllowed(url.searchParams, ["category", "page"] as const);
  } else if (mode === "search") {
    upstreamPath = "/api/search";
    forward = pickAllowed(url.searchParams, [
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
    ] as const);
  } else {
    return json({ error: "Unknown mode. Use mode=feed or mode=search." }, 400);
  }

  if (!forward.has("page")) forward.set("page", String(clampPage(null)));
  else forward.set("page", String(clampPage(forward.get("page"))));

  if (mode === "search") {
    const q = forward.get("q");
    const hasFilter = ["category", "topic", "entity", "source", "type"].some(
      (k) => forward.has(k),
    );
    if (!q && !hasFilter) {
      return json(
        { error: "Search needs q or at least one filter (e.g. category)." },
        400,
      );
    }
    if (q && q.length > 200) {
      forward.set("q", q.slice(0, 200));
    }
  }

  const target = `${UPSTREAM}${upstreamPath}?${forward.toString()}`;

  try {
    const res = await fetch(target, {
      headers: {
        Accept: "application/json",
        "User-Agent": "AI-Discov/1.0 (+https://aidiscov.com)",
      },
    });

    const text = await res.text();
    const cache =
      res.ok
        ? "public, s-maxage=120, stale-while-revalidate=300"
        : "no-store";

    return new Response(text, {
      status: res.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": cache,
        ...CORS,
      },
    });
  } catch (err) {
    return json(
      {
        error: "Truncated upstream unavailable",
        detail: err instanceof Error ? err.message : String(err),
      },
      502,
    );
  }
}
