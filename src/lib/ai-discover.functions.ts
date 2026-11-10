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
          "Tu es le moteur de recommandation d'AI Discovery. Réponds en français. Choisis UNIQUEMENT parmi le catalogue fourni (slugs exacts), au plus 6 solutions, de la plus pertinente à la moins pertinente. Respecte strictement les contraintes de l'utilisateur (gratuit, open source, API, local…). N'invente aucun prix ni fait absent du catalogue. 'understood' : reformulation courte du besoin et des contraintes. 'why' : une phrase concrète. 'caveat' : la principale limite pour ce besoin. Si rien ne convient, renvoie une liste vide.",
        prompt: `Catalogue:\n${JSON.stringify(catalog)}\n\nBesoin de l'utilisateur: ${data.q}`,
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
