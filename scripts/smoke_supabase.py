"""Smoke-test live catalog endpoints used by the production app."""
from __future__ import annotations

import json
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
env: dict[str, str] = {}
for line in (ROOT / ".env").read_text(encoding="utf-8").splitlines():
    line = line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    key, value = line.split("=", 1)
    env[key] = value.strip().strip('"')

url = env["VITE_SUPABASE_URL"].rstrip("/")
key = env["VITE_SUPABASE_PUBLISHABLE_KEY"]
headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Accept": "application/json",
}

select = (
    "id,name,slug,summary,description,official_url,pricing_model,price_display,"
    "api_available,open_source,local_available,keywords,strengths,limits,audience,"
    "last_verified_at,status,"
    "publishers(name),"
    "tool_types(is_primary,solution_types(name)),"
    "tool_categories(is_primary,categories(name)),"
    "tool_platforms(platforms(label)),"
    "tool_sources(sources(url)),"
    "tool_relations!tool_relations_source_tool_id_fkey("
    "relation_type,tools!tool_relations_target_tool_id_fkey(slug,status))"
)

params = urllib.parse.urlencode(
    {
        "select": select,
        "status": "eq.published",
        "slug": "eq.chatgpt",
        "limit": "1",
    }
)
req = urllib.request.Request(f"{url}/rest/v1/tools?{params}", headers=headers)
with urllib.request.urlopen(req, timeout=30) as resp:
    data = json.loads(resp.read().decode("utf-8"))

if not data:
    raise SystemExit("no tool returned")

row = data[0]
print("ok", row["slug"], row["publishers"]["name"])
print("type", row["tool_types"][0]["solution_types"]["name"])
print("cats", [c["categories"]["name"] for c in row["tool_categories"]])
print("alts", [r["tools"]["slug"] for r in row["tool_relations"]])
