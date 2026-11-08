// oxlint-disable sort-keys
import fs from "node:fs";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

import vue from "@vitejs/plugin-vue";
import { ExternalFluentPlugin, SFCFluentPlugin } from "unplugin-fluent-vue/vite";
import { defineConfig, normalizePath, type Plugin, runnerImport, type ViteDevServer } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import vueDevTools from "vite-plugin-vue-devtools";

const isStorybookOrTestProcess =
  process.env.npm_lifecycle_event === "storybook" ||
  process.env.npm_lifecycle_event === "build-storybook" ||
  process.env.VITEST === "true";

/**
 * Starts the server code of the private dev tools. The tools are in `devtools/`, which is a separate repository that
 * this repository ignores. Without that folder, the plugin does nothing and the app runs normally.
 *
 * The plugin loads the file at run time, because a static import fails when the folder does not exist. Vite does not
 * count a file loaded this way as a config file, so the plugin restarts the server itself when that code changes.
 */
function optionalDevtools(): Plugin {
  const entry = fileURLToPath(new URL("devtools/vite-plugin.ts", import.meta.url));
  return {
    apply: "serve",
    async configureServer(server) {
      if (!fs.existsSync(entry)) return;
      const { dependencies, module } = await runnerImport<{ configureDevtools(devServer: ViteDevServer): void }>(entry);
      module.configureDevtools(server);

      // `dependencies` does not include the entry file. A restart closes this watcher, so listeners do not add up.
      const serverFiles = new Set([entry, ...dependencies].map((file) => normalizePath(file)));
      server.watcher.on("change", (file) => {
        if (serverFiles.has(normalizePath(file))) void server.restart();
      });
    },
    name: "splitz-optional-devtools",
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // incompatible with Storybook for now
    // https://github.com/storybookjs/storybook/issues/32462
    !isStorybookOrTestProcess && vueDevTools(),
    // The tools write files, so tests and Storybook must not start them.
    !isStorybookOrTestProcess && optionalDevtools(),
    {
      name: "copy-redirects",
      writeBundle() {
        const src = fileURLToPath(new URL("_redirects", import.meta.url));
        const dest = fileURLToPath(new URL("dist/_redirects", import.meta.url));
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
      },
    },
    VitePWA({
      disable: isStorybookOrTestProcess,
      registerType: "prompt",
      includeAssets: ["favicon.svg", "apple-touch-icon-180x180.png"],
      manifest: {
        name: "SplitZ",
        short_name: "SplitZ",
        description: "Split expenses with friends and groups",
        theme_color: "#f9fbfa",
        background_color: "#fafbfa",
        display: "standalone",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      // The dev server makes no service worker. With one, each server start gave `index.html` a random revision, so
      // the app showed the new-version toast on almost each open. To test the PWA, build and run `vite preview`.
      devOptions: {
        enabled: false,
      },
    }),
    // define messages in SFCs
    SFCFluentPlugin({
      blockType: "fluent", // default 'fluent' - name of the block in SFCs
      checkSyntax: true, // default true - whether to check syntax of the messages
    }),
    // define messages in external ftl files
    ExternalFluentPlugin({
      locales: ["en", "zh-cn"], // required - list of locales
      checkSyntax: true, // default true - whether to check syntax of the messages

      baseDir: fileURLToPath(new URL("src", import.meta.url)), // base directory for Vue files
      ftlDir: fileURLToPath(new URL("src/locales", import.meta.url)), // directory with ftl files
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("src", import.meta.url)),
      // Code in devtools/ uses this path. The app does not.
      "@devtools": fileURLToPath(new URL("devtools", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0", // Allow access from local network
    port: 5173,
  },
});
