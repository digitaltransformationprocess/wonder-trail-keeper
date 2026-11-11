import json
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
req = urllib.request.Request(
    f"{url}/functions/v1/discover-search",
    data=json.dumps({"q": "AI writing assistant"}).encode(),
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {key}",
        "apikey": key,
    },
    method="POST",
)
with urllib.request.urlopen(req, timeout=60) as r:
    body = r.read().decode()
    print(r.status, body[:500])
