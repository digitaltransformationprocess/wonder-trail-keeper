import json
from pathlib import Path

for name in ["ingest-tool", "discover-daily", "approve-candidate"]:
    data = json.loads(Path(f"_deploy_{name}.json").read_text(encoding="utf-8"))
    for i, f in enumerate(data["files"]):
        out = Path(f"_part_{name}_{i}.txt")
        out.write_text(f["content"], encoding="utf-8")
        print(f"{name}|{i}|{f['name']}|{out.name}|{len(f['content'])}")
