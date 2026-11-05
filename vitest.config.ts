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
    plugins: [
      {
        // Vite expands `import.meta.glob` in the transform, and the cache key does not include the files that match.
        // A cached transform keeps the old file list, so a spec can pass and not see a new file.
        // Vitest 5.0.5 skips the cache only for `import.meta.glob(`. This misses `import.meta.glob<string>(`.
        // Vitest 5.1.0 has the fix (vitest-dev/vitest#11666). Remove this plugin after the upgrade.
        configureVitest({ defineCacheKeyGenerator }) {
          defineCacheKeyGenerator(({ sourceCode }) => (sourceCode.includes("import.meta.glob") ? false : undefined));
        },
        name: "splitz-skip-glob-module-cache",
      },
    ],
    test: {
      projects: [
        {
          extends: true,
          test: {
            environment: "jsdom",
            // Each worktree in .claude/ has a copy of src/. Do not collect those copies as tests.
            exclude: [...configDefaults.exclude, "e2e/**", ".claude/**"],
            root: fileURLToPath(new URL("./", import.meta.url)),
          },
        },
        {
          extends: true,
          plugins: [
            storybookTest({
              // The location of your Storybook config, main.js|ts
              configDir: path.join(dirname, ".storybook"),
            }),
          ],
          test: {
            // Enable browser mode
            browser: {
              enabled: true,
              headless: true,
              instances: [{ browser: "chromium" }],
              // Make sure to install Playwright
              provider: playwright(),
            },
            name: "storybook",
            setupFiles: ["./.storybook/vitest.setup.ts"],
          },
        },
      ],
    },
  })
);
