/**
 * Minimal Discover evaluation set (20 queries).
 * Used by unit tests — expected slugs are soft hints, not hard inventing.
 */
export const DISCOVER_EVAL_QUERIES: Array<{
  q: string;
  expectAnyOf: string[];
  notes?: string;
}> = [
  { q: "AI writing assistant", expectAnyOf: ["chatgpt", "claude", "jasper", "copy-ai"] },
  { q: "free open source local LLM", expectAnyOf: ["ollama", "lm-studio", "gpt4all"] },
  { q: "create product videos from photos", expectAnyOf: ["runway", "pika", "luma-ai", "heygen"] },
  { q: "AI image generator API", expectAnyOf: ["midjourney", "stability-ai", "dall-e", "leonardo-ai"] },
  { q: "customer support chatbot", expectAnyOf: ["intercom", "zendesk", "chatgpt"] },
  { q: "code assistant for developers", expectAnyOf: ["github-copilot", "cursor", "chatgpt", "claude"] },
  { q: "speech to text transcription", expectAnyOf: ["whisper", "otter", "deepgram", "assemblyai"] },
  { q: "text to speech voice", expectAnyOf: ["elevenlabs", "murf", "play-ht"] },
  { q: "AI agent automation workflow", expectAnyOf: ["n8n", "zapier", "make", "langchain"] },
  { q: "vector database for RAG", expectAnyOf: ["pinecone", "weaviate", "qdrant", "chroma"] },
  { q: "meeting notes summarizer", expectAnyOf: ["fireflies", "otter", "notion-ai"] },
  { q: "design UI with AI", expectAnyOf: ["figma", "uizard", "galileo"] },
  { q: "self-host open source chat", expectAnyOf: ["ollama", "open-webui", "huggingface"] },
  { q: "music generation AI", expectAnyOf: ["suno", "udio", "aiva"] },
  { q: "presentation maker AI", expectAnyOf: ["gamma", "beautiful-ai", "tome"] },
  { q: "data analysis spreadsheet AI", expectAnyOf: ["chatgpt", "claude", "julius"] },
  { q: "SEO content generation", expectAnyOf: ["jasper", "surfer", "copy-ai", "chatgpt"] },
  { q: "avatar video presenter", expectAnyOf: ["heygen", "synthesia", "d-id"] },
  { q: "embedding model API", expectAnyOf: ["openai", "cohere", "voyage"] },
  { q: "local offline coding model", expectAnyOf: ["ollama", "lm-studio", "continue"] },
];
