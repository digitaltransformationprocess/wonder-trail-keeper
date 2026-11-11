import { describe, expect, it } from "vitest";
import { DISCOVER_EVAL_QUERIES } from "@/lib/discover.eval";
import { discover, extractConstraints } from "@/lib/discover";
import type { Solution } from "@/lib/solutions";

function stub(slug: string, extra: Partial<Solution> = {}): Solution {
  return {
    id: slug,
    slug,
    name: slug,
    publisher: "Test",
    url: `https://example.com/${slug}`,
    logoUrl: null,
    type: "Tool",
    categories: ["General"],
    categorySlugs: ["general"],
    summary: `${slug} AI solution`,
    description: `${slug} description`,
    keywords: slug.split("-"),
    pricingModel: "Freemium",
    price: "To verify",
    pricingPlans: [],
    platforms: ["Web"],
    api: true,
    apiAvailable: true,
    apiDocsUrl: null,
    repositoryUrl: null,
    license: null,
    openSource: false,
    local: false,
    strengths: ["catalog-backed"],
    limits: ["To verify"],
    audience: ["builders"],
    features: [],
    alternatives: [],
    sources: [
      {
        url: "https://example.com",
        reliabilityLevel: "A",
        claimKey: "general",
        verifiedAt: "2026-01-01",
        sourceType: "official",
      },
    ],
    verifiedAt: "2026-01-01",
    status: "Verified",
    ...extra,
  };
}

describe("discover score weights", () => {
  it("weights sum to 1", async () => {
    const { DISCOVER_SCORE_WEIGHTS } = await import("@/lib/discover");
    const sum = Object.values(DISCOVER_SCORE_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
  });
});

describe("discover eval set", () => {
  it("has at least 50 queries", () => {
    expect(DISCOVER_EVAL_QUERIES.length).toBeGreaterThanOrEqual(50);
  });

  it("extracts free/oss/api/local constraints", () => {
    const c = extractConstraints("free open source local API assistant");
    expect(c.free).toBe(true);
    expect(c.openSource).toBe(true);
    expect(c.api).toBe(true);
    expect(c.local).toBe(true);
  });

  it("local scoring can surface expected catalog slugs when fields match the query", () => {
    for (const row of DISCOVER_EVAL_QUERIES) {
      const words = row.q.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);
      const catalog = row.expectAnyOf.map((slug) =>
        stub(slug, {
          keywords: words,
          summary: row.q,
          description: row.q,
          openSource: /open.?source|ollama|gpt4all/.test(row.q),
          local: /local|offline|self.?host/.test(row.q),
          api: /\bapi\b/.test(row.q),
          pricingModel: /\bfree\b/.test(row.q) ? "Free" : "Freemium",
        }),
      );
      const distractors = ["unrelated-tool", "other-saas"].map((slug) =>
        stub(slug, { keywords: ["unrelated"], summary: "Unrelated product" }),
      );
      const matches = discover(row.q, [...catalog, ...distractors]);
      const hit = matches.some((m) => row.expectAnyOf.includes(m.solution.slug));
      expect(hit, `expected one of ${row.expectAnyOf.join(",")} for "${row.q}"`).toBe(true);
    }
  });
});
