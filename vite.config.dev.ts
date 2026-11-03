import type { Plugin } from "vite";

/** The short path of the dev dashboard. */
const DASHBOARD_PATH = "/dev";

/**
 * Dev-server support for the dev dashboard in `src/dev`.
 *
 * - `/dev` redirects to the dashboard page at `/src/dev/`.
 * - After the server starts, the terminal shows the dashboard URL under the app URLs.
 *
 * The plugin applies to `vite` (serve) only. The production build has no dashboard: it is not a build input, and the
 * app imports nothing from `src/dev`.
 */
export function devDashboard(): Plugin {
  return {
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== DASHBOARD_PATH && req.url !== `${DASHBOARD_PATH}/`) return next();
        res.statusCode = 302;
        res.setHeader("Location", "/src/dev/");
        res.end();
      });

      // Keep Vite's own output and add one line after it. `resolvedUrls` is null until the server listens.
      const printUrls = server.printUrls.bind(server);
      server.printUrls = () => {
        printUrls();
        const local = server.resolvedUrls?.local[0];
        if (!local) return;
        const url = new URL(DASHBOARD_PATH, local).href;
        server.config.logger.info(`  \u001B[32m➜\u001B[0m  \u001B[1mDev tools\u001B[0m: \u001B[36m${url}\u001B[0m`);
      };
    },
    name: "splitz-dev-dashboard",
  };
}
