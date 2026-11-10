import { createOpenAI } from "@ai-sdk/openai";

const RUN_ID = "X-Lovable-AIG-Run-ID";

export const AI_MODEL = "openai/gpt-6-astra";

export function createGateway() {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new Error("LOVABLE_API_KEY manquante");
  let runId: string | undefined;
  return createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(RUN_ID)) headers.set(RUN_ID, runId);
      const res = await fetch(input, { ...init, headers });
      runId ??= res.headers.get(RUN_ID)?.trim() || undefined;
      return res;
    },
  });
}

export const OPENAI_OPTS = {
  openai: {
    forceReasoning: true,
    reasoningEffort: "low",
    reasoningSummary: "auto",
    store: false,
    include: ["reasoning.encrypted_content"],
  },
} as const;

export function aiErrorMessage(e: unknown): string {
  const status = (e as { statusCode?: number })?.statusCode;
  if (status === 429) return "Trop de demandes, réessayez dans un instant.";
  if (status === 402) return "Crédits IA épuisés. Ajoutez des crédits pour continuer.";
  if (status === 403) return "Accès à l'IA refusé pour cet espace de travail.";
  return "La recherche IA est indisponible pour le moment.";
}
