import json
import time
import urllib.request
from pathlib import Path

env = {}
for line in Path(".env").read_text(encoding="utf-8").splitlines():
    line = line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    k, v = line.split("=", 1)
    env[k] = v.strip().strip('"')

url = env["VITE_SUPABASE_URL"]
key = env["VITE_SUPABASE_PUBLISHABLE_KEY"]
started = time.time()
req = urllib.request.Request(
    f"{url}/functions/v1/discover-search",
    data=json.dumps({"q": "Je cherche un assistant IA pour ecrire des emails"}).encode(),
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {key}",
        "apikey": key,
    },
    method="POST",
)
with urllib.request.urlopen(req, timeout=90) as r:
    body = json.loads(r.read().decode())
    elapsed = round((time.time() - started) * 1000)
    print("status", r.status, "client_ms", elapsed)
    print("source", body.get("source"), "model", (body.get("intent") or {}).get("model"))
    print("answer", (body.get("answer") or "")[:400])
    print("results", [x.get("slug") for x in body.get("results") or []])
