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


def get(path: str):
    req = urllib.request.Request(
        url + path,
        headers={"apikey": key, "Authorization": f"Bearer {key}"},
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.status, r.read().decode()


def post_rpc(name: str, body: dict):
    req = urllib.request.Request(
        f"{url}/rest/v1/rpc/{name}",
        data=json.dumps(body).encode(),
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.status, r.read().decode()


status, body = get(
    "/rest/v1/tools?select=slug&status=eq.published&slug=eq.chatgpt&limit=1"
)
print("chatgpt", status, body[:200])
status, body = post_rpc(
    "search_published_tools",
    {
        "q": "chatgpt writing",
        "want_free": False,
        "want_oss": False,
        "want_api": False,
        "want_local": False,
        "result_limit": 5,
    },
)
print("fts", status, body[:400])
