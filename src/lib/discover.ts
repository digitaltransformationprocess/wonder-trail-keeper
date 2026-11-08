import { SOLUTIONS, type Solution } from "@/data/catalog";

export interface Constraints { free: boolean; openSource: boolean; api: boolean; local: boolean; }
export interface Match { solution: Solution; score: number; reasons: string[]; }

export function extractConstraints(q: string): Constraints {
  const t = q.toLowerCase();
  return {
    free: /\b(free|gratuit|gratuite|sans payer)\b/.test(t),
    openSource: /open.?source|libre/.test(t),
    api: /\bapi\b/.test(t),
    local: /\b(local|offline|hors.?ligne|self.?host)/.test(t),
  };
}

export function discover(q: string): Match[] {
  const t = q.toLowerCase();
  const words = t.split(/[^a-zà-ÿ0-9]+/).filter((w) => w.length > 2);
  const c = extractConstraints(q);
  const out: Match[] = [];
  for (const s of SOLUTIONS) {
    const reasons: string[] = [];
    let score = 0;
    const hay = [...s.keywords, ...s.categories.map((x) => x.toLowerCase()), s.summary.toLowerCase()];
    const hits = s.keywords.filter((k) => t.includes(k));
    score += hits.length * 3;
    for (const w of words) if (hay.some((h) => h.includes(w))) score += 1;
    if (hits.length) reasons.push(`Correspond à : ${hits.slice(0, 3).join(", ")}`);
    if (score === 0) continue;
    if (c.free) { if (s.pricingModel === "Gratuit" || s.pricingModel === "Freemium" || s.pricingModel === "Open source") { score += 2; reasons.push("Offre gratuite ou freemium"); } else score -= 4; }
    if (c.openSource) { if (s.openSource) { score += 3; reasons.push("Open source"); } else score -= 4; }
    if (c.api) { if (s.api) { score += 2; reasons.push("API disponible"); } else score -= 4; }
    if (c.local) { if (s.local) { score += 3; reasons.push("Utilisable en local"); } else score -= 4; }
    if (score > 0) out.push({ solution: s, score, reasons });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 6);
}
