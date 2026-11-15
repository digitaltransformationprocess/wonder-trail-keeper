import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import {
  handleTruncatedProxy,
  truncatedOptionsResponse,
} from "./shared/truncatedProxy";

function truncatedDevProxy(): Plugin {
  return {
    name: "truncated-dev-proxy",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const raw = req.url ?? "";
        const pathOnly = raw.split("?")[0] ?? "";
        if (pathOnly !== "/api/truncated") {
          next();
          return;
        }

        try {
          if (req.method === "OPTIONS") {
            const out = truncatedOptionsResponse();
            res.statusCode = out.status;
            out.headers.forEach((v, k) => res.setHeader(k, v));
            res.end();
            return;
          }
          if (req.method !== "GET") {
            res.statusCode = 405;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Method not allowed" }));
            return;
          }

          const out = await handleTruncatedProxy(`http://localhost${raw}`);
          res.statusCode = out.status;
          out.headers.forEach((v, k) => res.setHeader(k, v));
          const buf = Buffer.from(await out.arrayBuffer());
          res.end(buf);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: "Proxy failure",
              detail: err instanceof Error ? err.message : String(err),
            }),
          );
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
    truncatedDevProxy(),
  ],
});
