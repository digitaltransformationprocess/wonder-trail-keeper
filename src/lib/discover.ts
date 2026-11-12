import { supabase } from "@/integrations/supabase/client";
import type { Solution } from "@/lib/solutions";

export interface Constraints {
  free: boolean;
  openSource: boolean;
  api: boolean;
  local: boolean;
}

export type MatchConfidence = "high" | "medium" | "low";

export interface Match {
  solution: Solution;
  score: number;
  reasons: string[];
  tradeoffs: string[];
  confidence: MatchConfidence;
  evidence: string[];
  source?: "fts" | "ai" | "local" | "hybrid" | "semantic";
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

/** Scoring weights from the design brief (starting hypotheses). */
export const DISCOVER_SCORE_WEIGHTS = {
  need: 0.4,
  features: 0.25,
  price: 0.15,
  compatibility: 0.1,
  freshness: 0.1,
} as const;

/** Rank published solutions against a natural-language need. Offline/local fallback. */
export function discover(q: string, solutions: Solution[]): Match[] {
  const t = q.toLowerCase();
  const words = t.split(/[^a-zà-ÿ0-9]+/).filter((w) => w.length > 2);
  const c = extractConstraints(q);
  const out: Match[] = [];

  for (const s of solutions) {
    const reasons: string[] = [];
    const tradeoffs: string[] = [...s.limits.slice(0, 2)];
    let score = 0;
    const hay = [
      ...s.keywords,
      ...s.categories.map((x) => x.toLowerCase()),
      s.summary.toLowerCase(),
      s.name.toLowerCase(),
      s.description.toLowerCase(),
      ...s.features.map((f) => f.label.toLowerCase()),
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
    if (score > 0) {
      out.push({
        solution: s,
        score,
        reasons,
        tradeoffs,
        confidence: score >= 8 ? "high" : score >= 4 ? "medium" : "low",
        evidence: s.sources.map((src) => `${src.reliabilityLevel}:${src.claimKey}:${src.url}`),
        source: "local",
      });
    }
  }

  return out.sort((a, b) => b.score - a.score);
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
    result_limit: 50,
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
      tradeoffs: solution.limits.slice(0, 2),
      confidence: solution.status === "Verified" ? "medium" : "low",
      evidence: solution.sources.map((src) => `${src.reliabilityLevel}:${src.claimKey}:${src.url}`),
      source: "fts",
    });
  }
  return matches;
}

export interface DiscoverAiResult {
  matches: Match[];
  source: "ai" | "fts" | "local" | "hybrid";
  answer?: string;
  intent?: Record<string, unknown>;
  interpretedNeed?: string;
  clarificationNeeded?: boolean;
  clarificationQuestion?: string | null;
  coverageNote?: string;
  constraints?: Constraints;
}

/** Prefer edge hybrid+LLM → FTS → local scoring. */
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
          source?: "ai" | "fts" | "hybrid";
          answer?: string;
          intent?: Record<string, unknown>;
          interpreted_need?: string;
          clarification_needed?: boolean;
          clarification_question?: string | null;
          coverage_note?: string;
          constraints?: Constraints;
          results?: Array<{
            slug: string;
            score?: number;
            reasons?: string[];
            match_reason?: string[];
            tradeoffs?: string[];
            confidence?: MatchConfidence;
            evidence?: string[];
          }>;
        };
        const matches: Match[] = [];
        for (const row of body.results ?? []) {
          const solution = bySlug.get(row.slug);
          if (!solution) continue;
          const reasons = (row.match_reason ?? row.reasons ?? []).filter(Boolean).slice(0, 3);
          matches.push({
            solution,
            score: row.score ?? 1,
            reasons,
            tradeoffs: (row.tradeoffs ?? solution.limits).filter(Boolean).slice(0, 3),
            confidence: row.confidence ?? "medium",
            evidence: (row.evidence ?? []).filter(Boolean).slice(0, 4),
            source: body.source === "ai" ? "ai" : body.source === "hybrid" ? "hybrid" : "fts",
          });
        }
        const answer = typeof body.answer === "string" ? body.answer.trim() : undefined;
        if (matches.length || answer || body.clarification_needed) {
          return {
            matches,
            source: body.source === "ai" ? "ai" : body.source === "hybrid" ? "hybrid" : "fts",
            answer,
            intent: body.intent,
            interpretedNeed: body.interpreted_need ?? q,
            clarificationNeeded: Boolean(body.clarification_needed),
            clarificationQuestion: body.clarification_question ?? null,
            coverageNote: body.coverage_note,
            constraints: body.constraints,
          };
        }
      }
    } catch {
      // fall through
    }
  }

  try {
    const matches = await discoverViaFts(q, bySlug);
    if (matches.length) return { matches, source: "fts", interpretedNeed: q };
  } catch {
    // fall through to local
  }

  return { matches: discover(q, solutions), source: "local", interpretedNeed: q };
}
