"""Extract init_discovery_catalog SQL from compaction transcript into local migrations."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEG = Path(
    r"C:\Users\bilal\.cursor\projects\c-Users-bilal-Desktop-the-new-idea-wonder-trail-keeper"
    r"\agent-transcripts\4de6e460-7c4f-4e2b-83a1-2ffe6e7785e9\compaction\segment_000.md"
)
OUT = ROOT / "supabase" / "migrations"
OUT.mkdir(parents=True, exist_ok=True)

text = SEG.read_text(encoding="utf-8", errors="ignore")
# Prefer the JSON argument blob that contains the full query
needle = '"name":"init_discovery_catalog","query":"'
idx = text.find(needle)
if idx < 0:
    raise SystemExit("init migration not found")
start = idx + len(needle)
# Unescape JSON string until closing unescaped quote before }
buf = []
i = start
while i < len(text):
    ch = text[i]
    if ch == "\\" and i + 1 < len(text):
        nxt = text[i + 1]
        mapping = {"n": "\n", "t": "\t", "r": "\r", '"': '"', "\\": "\\"}
        buf.append(mapping.get(nxt, nxt))
        i += 2
        continue
    if ch == '"':
        break
    buf.append(ch)
    i += 1
sql = "".join(buf)
(OUT / "20261110225635_init_discovery_catalog.sql").write_text(sql, encoding="utf-8")
print("wrote init", len(sql), "chars")

# Also extract other named migrations present as apply_migration arguments
names = [
    ("harden_security_advisors", "20261110225810"),
    ("admin_profiles_and_write_rls", "20261110231313"),
    ("revoke_definer_function_execute", "20261110231622"),
    ("ingestion_candidates_and_runs", "20261110232414"),
    ("discover_daily_cron_and_runtime_secrets", "20261110233817"),
    ("harden_seed_stage_and_runtime_secrets", "20261111130816"),
]
for name, version in names:
    pat = f'"name":"{name}","query":"'
    j = text.find(pat)
    if j < 0:
        # try later segments
        continue
    s = j + len(pat)
    buf = []
    i = s
    while i < len(text):
        ch = text[i]
        if ch == "\\" and i + 1 < len(text):
            nxt = text[i + 1]
            mapping = {"n": "\n", "t": "\t", "r": "\r", '"': '"', "\\": "\\"}
            buf.append(mapping.get(nxt, nxt))
            i += 2
            continue
        if ch == '"':
            break
        buf.append(ch)
        i += 1
    sql = "".join(buf)
    path = OUT / f"{version}_{name}.sql"
    path.write_text(sql, encoding="utf-8")
    print("wrote", path.name, len(sql))
