import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { SOLUTIONS } from "@/data/catalog";

export interface AiMatch { slug: string; why: string; caveat: string; }
export interface AiDiscoverResult { understood: string; matches: AiMatch[]; error?: string; }

const schema = z.object({
  understood: z.string(),
  matches: z.array(z.object({ slug: z.string(), why: z.string(), caveat: z.string() })),
});

export const aiDiscover = createServerFn({ method: "POST" })
  .inputValidator((d: { q: string }) => ({ q: String(d.q ?? "").slice(0, 500) }))
  .handler(async ({ data }): Promise<AiDiscoverResult> => {
    if (!data.q.trim()) return { understood: "", matches: [] };
    const { streamText, Output } = await import("ai");
    const { createGateway, AI_MODEL, OPENAI_OPTS, aiErrorMessage } = await import("./ai.server");
    const catalog = SOLUTIONS.map((s) => ({
      slug: s.slug, name: s.name, type: s.type, categories: s.categories, summary: s.summary,
      pricing: s.pricingModel, api: s.api, openSource: s.openSource, local: s.local, limits: s.limits,
    }));
    try {
      const result = streamText({
        model: createGateway().responses(AI_MODEL),
        system:
          "You are AI Discovery's recommendation engine. Always respond in English, regardless of the language of the user's request. Choose ONLY from the supplied catalog (exact slugs), at most 6 solutions, ordered by relevance. Strictly respect the user's requirements (free, open source, API, local). Never invent prices or facts absent from the catalog. 'understood': a brief restatement of the need and requirements. 'why': one concrete sentence. 'caveat': the main limitation for this need. If nothing fits, return an empty list.",
        prompt: `Catalog:\n${JSON.stringify(catalog)}\n\nUser request: ${data.q}`,
        output: Output.object({ schema }),
        providerOptions: OPENAI_OPTS,
      });
      const out = await result.output;
      const valid = new Set(SOLUTIONS.map((s) => s.slug));
      return { understood: out.understood, matches: out.matches.filter((m) => valid.has(m.slug)).slice(0, 6) };
    } catch (e) {
      console.error("aiDiscover", e);
      return { understood: "", matches: [], error: aiErrorMessage(e) };
    }
  });
