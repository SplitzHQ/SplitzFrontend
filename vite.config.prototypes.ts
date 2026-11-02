import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, URL } from "node:url";

import type { Plugin } from "vite";

const PROTOTYPES_DIR = fileURLToPath(new URL("src/prototypes", import.meta.url));
const FOLDER_PATTERN = /^\d{4}-\d{2}-\d{2}-[\w-]+$/;

/**
 * Dev-server support for the prototype area in `src/prototypes` (see its README).
 *
 * - `/prototypes` redirects to the prototype index at `/src/prototypes/`.
 * - `POST /__prototype-choices` writes the body to `src/prototypes/<folder>/choices.json`.
 *   The "Export my choices" button on a prototype page sends it (`src/prototypes/kit/choices.ts`).
 *
 * The plugin applies to `vite` (serve) only. The production build has no prototype pages:
 * they are not build inputs, and the app imports nothing from `src/prototypes`.
 */
export function prototypes(): Plugin {
  return {
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== "/prototypes" && req.url !== "/prototypes/") return next();
        res.statusCode = 302;
        res.setHeader("Location", "/src/prototypes/");
        res.end();
      });

      server.middlewares.use("/__prototype-choices", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end();
          return;
        }
        let body = "";
        req.on("data", (chunk: Buffer) => (body += chunk.toString()));
        req.on("end", () => {
          try {
            const { prototype } = JSON.parse(body) as { prototype?: unknown };
            // Only an existing dated folder: the name goes into a file path.
            if (typeof prototype !== "string" || !FOLDER_PATTERN.test(prototype)) {
              throw new Error(`Not a prototype folder name: ${String(prototype)}`);
            }
            const folder = join(PROTOTYPES_DIR, prototype);
            if (!existsSync(folder)) throw new Error(`No prototype folder: ${prototype}`);
            writeFileSync(join(folder, "choices.json"), body.endsWith("\n") ? body : `${body}\n`);
            res.end("ok");
          } catch (error) {
            res.statusCode = 400;
            res.end(String(error));
          }
        });
      });
    },
    name: "splitz-prototypes",
  };
}
