import {
  handleTruncatedProxy,
  truncatedOptionsResponse,
} from "../shared/truncatedProxy";

export const config = {
  maxDuration: 15,
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return truncatedOptionsResponse();
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Allow: "GET, OPTIONS",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
  return handleTruncatedProxy(req.url);
}
