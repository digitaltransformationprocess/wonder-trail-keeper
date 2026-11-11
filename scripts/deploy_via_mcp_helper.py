"""Print deploy payloads as separate JSON files ready for MCP deploy_edge_function."""
import json
from pathlib import Path

for name in ["ingest-tool", "discover-daily", "approve-candidate"]:
    data = json.loads(Path(f"_deploy_{name}.json").read_text(encoding="utf-8"))
    verify_jwt = name != "discover-daily"
    payload = {
        "name": name,
        "entrypoint_path": "index.ts",
        "verify_jwt": verify_jwt,
        "files": data["files"],
    }
    Path(f"_mcp_deploy_{name}.json").write_text(
        json.dumps(payload, ensure_ascii=False),
        encoding="utf-8",
    )
    print(name, "verify_jwt", verify_jwt, "files", len(data["files"]))
