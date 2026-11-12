import fs from "node:fs";
import { spawn } from "node:child_process";

const payload = JSON.parse(
  fs.readFileSync(
    "C:/Users/bilal/AppData/Local/Temp/discover-news-deploy-clean.json",
    "utf8",
  ),
);

const stdin = JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "deploy_edge_function",
    arguments: payload,
  },
});

console.error("Payload files:", payload.files.length);
console.error("days line:", payload.files[0].content.includes("body.days ?? 7"));
console.log(stdin.length, "chars to MCP");
