// oxlint-disable sort-keys
import fs from "node:fs";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

import vue from "@vitejs/plugin-vue";
import { ExternalFluentPlugin, SFCFluentPlugin } from "unplugin-fluent-vue/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import vueDevTools from "vite-plugin-vue-devtools";

const isStorybookProcess = process.env.npm_lifecycle_event === "storybook";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // incompatible with Storybook for now
    // https://github.com/storybookjs/storybook/issues/32462
    !isStorybookProcess && vueDevTools(),
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
      registerType: "prompt",
      includeAssets: ["favicon.svg", "apple-touch-icon-180x180.png"],
      manifest: {
        name: "SplitZ",
        short_name: "SplitZ",
        description: "Split expenses with friends and groups",
        theme_color: "#647C72",
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
      devOptions: {
        enabled: true,
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
    },
  },
  server: {
    host: "0.0.0.0", // Allow access from local network
    port: 5173,
  },
});
