from pathlib import Path

HELPER = '''
async function runtimeSecret(supabase: SupabaseClient, key: string) {
  const fromEnv = Deno.env.get(key);
  if (fromEnv) return fromEnv;
  const { data, error } = await supabase.from("runtime_secrets").select("value").eq("key", key).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.value) throw new Error(`${key} secret is not set`);
  return data.value as string;
}
async function firecrawlKey(supabase: SupabaseClient) {
  return runtimeSecret(supabase, "FIRECRAWL_API_KEY");
}
'''.strip()


def patch_discover(src: str) -> str:
    src = src.replace(
        """function apiKey() {
  const key = Deno.env.get("FIRECRAWL_API_KEY");
  if (!key) throw new Error("FIRECRAWL_API_KEY secret is not set");
  return key;
}""",
        HELPER,
    )
    src = src.replace(
        "async function scrapeTool(url: string) {",
        "async function scrapeTool(url: string, supabase: SupabaseClient) {",
    )
    src = src.replace(
        "Authorization: `Bearer ${apiKey()}`",
        "Authorization: `Bearer ${await firecrawlKey(supabase)}`",
    )
    src = src.replace(
        "async function searchNewTools(query: string, limit = 8) {",
        "async function searchNewTools(supabase: SupabaseClient, query: string, limit = 8) {",
    )
    src = src.replace(
        """function assertCronSecret(req: Request) {
  const expected = Deno.env.get("INGEST_CRON_SECRET");
  if (!expected) throw new Error("INGEST_CRON_SECRET is not configured");
  if (req.headers.get("x-ingest-secret") !== expected) throw new Error("Invalid cron secret");
}""",
        """async function assertCronSecret(req: Request, supabase: SupabaseClient) {
  const expected = await runtimeSecret(supabase, "INGEST_CRON_SECRET");
  if (req.headers.get("x-ingest-secret") !== expected) throw new Error("Invalid cron secret");
}""",
    )
    src = src.replace(
        "const { extracted, markdown } = await scrapeTool(normalized);",
        "const { extracted, markdown } = await scrapeTool(normalized, supabase);",
    )
    src = src.replace(
        "assertCronSecret(req);\n    const supabase = serviceClient();",
        "const supabase = serviceClient();\n    await assertCronSecret(req, supabase);",
    )
    src = src.replace(
        "const hits = await searchNewTools(query, 5);",
        "const hits = await searchNewTools(supabase, query, 5);",
    )
    return src


def patch_ingest(src: str) -> str:
    # ingest-tool bundled uses apiKey() similarly - patch compact if present, else index.ts
    if "function apiKey()" in src and "runtimeSecret" not in src:
        src = src.replace(
            """function apiKey() {
  const key = Deno.env.get("FIRECRAWL_API_KEY");
  if (!key) throw new Error("FIRECRAWL_API_KEY secret is not set");
  return key;
}""",
            HELPER,
        )
    # Also handle multi-line formatted version from bundled ingest
    old = '''function apiKey(): string {
  const key = Deno.env.get("FIRECRAWL_API_KEY");
  if (!key) throw new Error("FIRECRAWL_API_KEY secret is not set");
  return key;
}'''
    if old in src and "runtimeSecret" not in src:
        src = src.replace(old, HELPER)

    if "async function scrapeTool(url: string)" in src:
        src = src.replace(
            "async function scrapeTool(url: string)",
            "async function scrapeTool(url: string, supabase: SupabaseClient)",
        )
    if "Authorization: `Bearer ${apiKey()}`" in src:
        src = src.replace(
            "Authorization: `Bearer ${apiKey()}`",
            "Authorization: `Bearer ${await firecrawlKey(supabase)}`",
        )
    if "const { extracted, markdown } = await scrapeTool(normalized);" in src:
        src = src.replace(
            "const { extracted, markdown } = await scrapeTool(normalized);",
            "const { extracted, markdown } = await scrapeTool(normalized, supabase);",
        )

    old_assert = '''function assertCronSecret(req: Request) {
  const expected = Deno.env.get("INGEST_CRON_SECRET");
  if (!expected) throw new Error("INGEST_CRON_SECRET is not configured");
  const provided = req.headers.get("x-ingest-secret");
  if (!provided || provided !== expected) throw new Error("Invalid cron secret");
}'''
    new_assert = '''async function assertCronSecret(req: Request, supabase: SupabaseClient) {
  const expected = await runtimeSecret(supabase, "INGEST_CRON_SECRET");
  const provided = req.headers.get("x-ingest-secret");
  if (!provided || provided !== expected) throw new Error("Invalid cron secret");
}'''
    if old_assert in src:
        src = src.replace(old_assert, new_assert)

    # Update call sites that use assertCronSecret before service client
    src = src.replace(
        "assertCronSecret(req); supabase = serviceClient();",
        "supabase = serviceClient(); await assertCronSecret(req, supabase);",
    )
    src = src.replace(
        "assertCronSecret(req);\n    supabase = serviceClient();",
        "supabase = serviceClient();\n    await assertCronSecret(req, supabase);",
    )
    return src


def main() -> None:
    discover = Path("supabase/functions/discover-daily/index.compact.ts")
    dsrc = patch_discover(discover.read_text(encoding="utf-8"))
    discover.write_text(dsrc, encoding="utf-8")
    Path("supabase/functions/discover-daily/index.ts").write_text(dsrc, encoding="utf-8")
    print("discover-daily", len(dsrc))

    ingest_paths = [
        Path("supabase/functions/ingest-tool/index.ts"),
        Path("supabase/functions/ingest-tool/bundled.ts"),
    ]
    for path in ingest_paths:
        if not path.exists():
            continue
        isrc = patch_ingest(path.read_text(encoding="utf-8"))
        path.write_text(isrc, encoding="utf-8")
        print(path, len(isrc), "runtimeSecret" in isrc)


if __name__ == "__main__":
    main()
