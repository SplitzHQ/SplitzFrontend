import path from "node:path";
import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { mergeConfig, defineConfig, configDefaults } from "vitest/config";

import viteConfig from "./vite.config";

const dirname = typeof __dirname === "undefined" ? path.dirname(fileURLToPath(import.meta.url)) : __dirname;

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          test: {
            environment: "jsdom",
            exclude: [...configDefaults.exclude, "e2e/**"],
            root: fileURLToPath(new URL("./", import.meta.url))
          }
        },
        {
          extends: true,
          plugins: [
            storybookTest({
              // The location of your Storybook config, main.js|ts
              configDir: path.join(dirname, ".storybook")
            })
          ],
          test: {
            // Enable browser mode
            browser: {
              enabled: true,
              headless: true,
              instances: [{ browser: "chromium" }],
              // Make sure to install Playwright
              provider: playwright()
            },
            name: "storybook",
            setupFiles: ["./.storybook/vitest.setup.ts"]
          }
        }
      ]
    }
  })
);
