import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const argsPath = path.join(__dirname, "_mcp_deploy_args.json");
const args = JSON.parse(fs.readFileSync(argsPath, "utf8"));

// Emit deploy args as JSON on stdout (for piping); validation only.
const content = args.files[0].content;
console.log(
  JSON.stringify({
    ok: content.includes("loadInternalRanks") && !content.includes("PLACEHOLDER"),
    bytes: content.length,
    name: args.name,
    verify_jwt: args.verify_jwt,
  }),
);
