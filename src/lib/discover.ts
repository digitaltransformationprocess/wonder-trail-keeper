import { supabase } from "@/integrations/supabase/client";
import type { Solution } from "@/lib/solutions";

export interface Constraints {
  free: boolean;
  openSource: boolean;
  api: boolean;
  local: boolean;
}

export interface Match {
  solution: Solution;
  score: number;
  reasons: string[];
  source?: "fts" | "ai" | "local";
}

export function extractConstraints(q: string): Constraints {
  const t = q.toLowerCase();
  return {
    free: /\b(free|gratuit|gratuite|gratuitement|sans payer)\b/.test(t),
    openSource: /open.?source|libre/.test(t),
    api: /\bapi\b/.test(t),
    local: /\b(local|offline|hors.?ligne|self.?host)/.test(t),
  };
}

/** Rank published solutions against a natural-language need. Offline/local fallback. */
export function discover(q: string, solutions: Solution[]): Match[] {
  const t = q.toLowerCase();
  const words = t.split(/[^a-zà-ÿ0-9]+/).filter((w) => w.length > 2);
  const c = extractConstraints(q);
  const out: Match[] = [];

  for (const s of solutions) {
    const reasons: string[] = [];
    let score = 0;
    const hay = [
      ...s.keywords,
      ...s.categories.map((x) => x.toLowerCase()),
      s.summary.toLowerCase(),
      s.name.toLowerCase(),
      s.description.toLowerCase(),
    ];
    const hits = s.keywords.filter((k) => t.includes(k));
    score += hits.length * 3;
    for (const w of words) if (hay.some((h) => h.includes(w))) score += 1;
    if (hits.length) reasons.push(`Matches your request: ${s.summary}`);
    if (score === 0) continue;
    if (c.free) {
      if (
        s.pricingModel === "Free" ||
        s.pricingModel === "Freemium" ||
        s.pricingModel === "Open source"
      ) {
        score += 2;
        reasons.push("Free or freemium option");
      } else score -= 4;
    }
    if (c.openSource) {
      if (s.openSource) {
        score += 3;
        reasons.push("Open source");
      } else score -= 4;
    }
    if (c.api) {
      if (s.api) {
        score += 2;
        reasons.push("API available");
      } else score -= 4;
    }
    if (c.local) {
      if (s.local) {
        score += 3;
        reasons.push("Runs locally");
      } else score -= 4;
    }
    if (score > 0) out.push({ solution: s, score, reasons, source: "local" });
  }

  return out.sort((a, b) => b.score - a.score).slice(0, 6);
}

function groundedReasons(solution: Solution, c: Constraints): string[] {
  const reasons: string[] = [];
  if (solution.summary) reasons.push(solution.summary);
  if (c.free && ["Free", "Freemium", "Open source"].includes(solution.pricingModel)) {
    reasons.push(`Pricing model: ${solution.pricingModel}`);
  }
  if (c.openSource && solution.openSource) reasons.push("Open source");
  if (c.api && solution.api) reasons.push("API available");
  if (c.local && solution.local) reasons.push("Runs locally");
  return reasons.slice(0, 3);
}

export async function discoverViaFts(
  q: string,
  solutionsBySlug: Map<string, Solution>,
): Promise<Match[]> {
  const started = performance.now();
  const c = extractConstraints(q);
  const { data, error } = await supabase.rpc("search_published_tools", {
    q,
    want_free: c.free,
    want_oss: c.openSource,
    want_api: c.api,
    want_local: c.local,
    result_limit: 8,
  });

  const latency = Math.round(performance.now() - started);
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  void supabase.from("search_logs").insert({
    query: q,
    constraints: c,
    result_count: rows.length,
    latency_ms: latency,
    source: "fts",
  });

  const matches: Match[] = [];
  for (const row of rows) {
    const solution = solutionsBySlug.get(row.slug);
    if (!solution) continue;
    matches.push({
      solution,
      score: Math.max(1, Math.round((row.rank ?? 0) * 100)),
      reasons: groundedReasons(solution, c),
      source: "fts",
    });
  }
  return matches.slice(0, 6);
}

export interface DiscoverAiResult {
  matches: Match[];
  source: "ai" | "fts" | "local";
  intent?: Record<string, unknown>;
}

/** Prefer edge LLM (grounded) → FTS → local scoring. */
export async function discoverSmart(
  q: string,
  solutions: Solution[],
): Promise<DiscoverAiResult> {
  const bySlug = new Map(solutions.map((s) => [s.slug, s]));
  const base = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

  if (base && key) {
    try {
      const res = await fetch(`${base}/functions/v1/discover-search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          apikey: key,
        },
        body: JSON.stringify({ q }),
      });
      if (res.ok) {
        const body = (await res.json()) as {
          source?: "ai" | "fts";
          intent?: Record<string, unknown>;
          results?: Array<{
            slug: string;
            score?: number;
            reasons?: string[];
          }>;
        };
        const matches: Match[] = [];
        for (const row of body.results ?? []) {
          const solution = bySlug.get(row.slug);
          if (!solution) continue;
          matches.push({
            solution,
            score: row.score ?? 1,
            reasons: (row.reasons ?? []).filter(Boolean).slice(0, 3),
            source: body.source === "ai" ? "ai" : "fts",
          });
        }
        if (matches.length) {
          return {
            matches: matches.slice(0, 6),
            source: body.source === "ai" ? "ai" : "fts",
            intent: body.intent,
          };
        }
        if (body.source === "fts" || body.source === "ai") {
          return { matches: [], source: body.source ?? "fts", intent: body.intent };
        }
      }
    } catch {
      // fall through
    }
  }

  try {
    const matches = await discoverViaFts(q, bySlug);
    if (matches.length) return { matches, source: "fts" };
  } catch {
    // fall through to local
  }

  return { matches: discover(q, solutions), source: "local" };
}
