# SplitzFrontend - Copilot Instructions

## Repository Overview

SplitzFrontend is a Vue 3 expense-splitting web application (~110 source files) built with Vite, TypeScript, Tailwind CSS, and **Bun** (package manager/runtime).

**Stack:** Vue 3 + TypeScript + Vite 7 + Tailwind 4 + Vitest + Playwright + Storybook + Fluent i18n (en/zh-cn) + Husky pre-commit hooks

## Build & Development Commands

**CRITICAL:** Always use `bun` (NOT npm/yarn/pnpm).

### Essential Commands

```bash
# Install dependencies - ALWAYS run first
bun install

# Install Playwright browsers (needed for tests)
npx playwright install chromium

# Development server (http://localhost:5173)
bun dev

# Type check (MUST pass before commit)
bun run type-check

# Lint + auto-fix (MUST pass before commit)
bun run lint

# Format code
bun run format

# Production build (~10-15s, runs type-check + build in parallel)
bun run build

# Preview production build
bun run preview
```

### Testing Commands

```bash
# Unit tests (requires Playwright browsers installed)
bun run test:unit run         # Run once
bun run test:unit             # Watch mode

# E2E tests (must build first on CI)
bun build && bun run test:e2e
bun run test:e2e --project=chromium    # Specific browser
bun run test:e2e e2e/vue.spec.ts       # Specific file
bun run test:e2e --debug               # Debug mode

# Storybook
bun run storybook             # Dev server
bun run build-storybook       # Build

# Generate Tailwind colors from CSS vars
bun run css-var-to-tailwind
```

## Pre-commit Validation

Husky runs automatically on commit:

1. `vue-tsc --build --force` - Type checks all files
2. `lint-staged` - On staged files: `eslint --fix` + `oxfmt` for .ts/.vue files, `oxfmt` for other files

**Pre-commit check locally:**

```bash
bun run type-check && bun run lint && bun run format
```

## Configuration Summary

- **TypeScript:** Project references (app/node/vitest), strict mode, `@/` alias → `src/`
- **Tailwind:** CSS variables for colors, custom font sizes, z-index scale. Uses `@tailwindcss/postcss` (v4)
- **Vite:** Vue 3 plugin, Fluent Vue i18n (SFC + .ftl files), `@` alias → `./src`
- **Vitest:** Two projects: (1) unit tests (jsdom), (2) Storybook tests (browser/Chromium). Excludes `e2e/**`
- **Playwright:** Tests in `./e2e`, base URL `localhost:5173`, runs on Chromium/Firefox/WebKit, 30s timeout, CI uses preview server

## Common Issues & Solutions

| Issue                                 | Solution                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| `bun: command not found`              | Install: `curl -fsSL https://bun.sh/install \| bash && source ~/.bash_profile` |
| Playwright browser missing            | Run `npx playwright install chromium` after `bun install`                      |
| Unit tests fail with Playwright error | Storybook tests need browsers: `npx playwright install chromium`               |
| E2E tests fail to start (CI)          | Build first: `bun run build && bun run test:e2e`                               |
| Type checking fails                   | Force rebuild: `bun run type-check`                                            |
| Color variables not in Tailwind       | Regenerate: `bun run css-var-to-tailwind`                                      |

## Important Notes

**DO NOT edit generated files:**

- `src/backend/openapi/**/*` - OpenAPI generated client
- `src/assets/color.css` - Generated from scripts
- `tailwind.config.colors.js` - Generated from scripts

**Key conventions:**

- Use `bun` not npm/yarn/pnpm
- Path alias: `@/` imports from `src/`
- i18n: Fluent syntax in `.ftl` files or `<fluent>` blocks in Vue SFCs
- Components: Add `.stories.ts` files for Storybook
- Tests: Unit tests in `src/**/__tests__/*.spec.ts`, E2E in `e2e/*.spec.ts`
- Pre-commit: Type check + lint-staged run automatically
- Build: ~10-15s, Lint: ~5-10s

## Validation Before Submit

```bash
bun install                    # If dependencies changed
bun run type-check             # Must pass
bun run lint                   # Must pass
bun run format                 # Format code
bun run build                  # Must succeed
bun run test:unit run          # If tests exist
```

## Trust These Instructions

These instructions document actual tested behavior. Only search for additional info if these are incomplete, you hit undocumented errors, or the repo has significantly changed.
