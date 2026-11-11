"""Inline _shared imports into a single Deno entry file per function."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path("supabase/functions")


def load_shared(name: str) -> str:
    text = (ROOT / "_shared" / name).read_text(encoding="utf-8")
    text = re.sub(r'^import\s+type\s+.*?from\s+".*?";\s*\n', "", text, flags=re.M)
    text = re.sub(r'^import\s+\{[^}]*\}\s+from\s+"\./[^"]+";\s*\n', "", text, flags=re.M)
    text = re.sub(
        r'^import\s+\{[^}]*\}\s+from\s+"https://esm\.sh/@supabase/supabase-js[^"]+";\s*\n',
        "",
        text,
        flags=re.M,
    )
    text = text.replace("export ", "")
    return text.strip() + "\n\n"


def bundle(fn: str, shared_files: list[str]) -> str:
    index = (ROOT / fn / "index.ts").read_text(encoding="utf-8")
    index = re.sub(r'^import\s+.*?from\s+"\./_shared/[^"]+";\s*\n', "", index, flags=re.M)
    parts = [
        'import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";\n\n'
    ]
    for shared in shared_files:
        content = load_shared(shared)
        parts.append(f"// ---- shared/{shared} ----\n{content}")
    parts.append("// ---- entry ----\n" + index.strip() + "\n")
    out = "".join(parts)
    (ROOT / fn / "bundled.ts").write_text(out, encoding="utf-8")
    return out


bundles = {
    "ingest-tool": ["cors.ts", "normalize.ts", "firecrawl.ts", "supabase.ts", "ingest.ts"],
    "discover-daily": ["cors.ts", "normalize.ts", "firecrawl.ts", "supabase.ts", "ingest.ts"],
    "approve-candidate": ["cors.ts", "normalize.ts", "supabase.ts", "approve.ts"],
}

for name, shared in bundles.items():
    text = bundle(name, shared)
    print(name, len(text))
