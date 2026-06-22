# SplitzFrontend Agent Guidelines

## Project Shape

SplitzFrontend is a Vue 3 + TypeScript + Vite SPA/PWA using Bun, Pinia, Vue Router, Tailwind CSS token classes, Fluent i18n, Playwright, Vitest, and Storybook. Use [README.md](README.md) for the OpenAPI generation command and [tasks/spec.md](tasks/spec.md) for the current email confirmation/password recovery feature spec when that work is relevant.

## Commands

- Install dependencies with `bun install`.
- Start local development with `bun run dev` on port 5173.
- Build with `bun run build`; this runs `vue-tsc` before `vite build`.
- Type-check only with `bun run type-check`.
- Run unit and Storybook Vitest projects with `bun run test:unit`.
- Run Playwright E2E tests with `bun run test:e2e`; Playwright starts or reuses the Vite server at `http://localhost:5173`.
- Lint with autofix using `bun run lint`; format with `bun run format`; check formatting with `bun run format:check`.
- Run Storybook with `bun run storybook`; build it with `bun run build-storybook`.

## Architecture

- [src/main.ts](src/main.ts) bootstraps Vue, Pinia, Pinia Colada, router, Fluent bundles, and global CSS.
- [src/router/index.ts](src/router/index.ts) owns route definitions and the `localStorage.accessToken` auth guard. Public unauthenticated route names belong in `publicRoutes`.
- [src/pages](src/pages) contains route-level feature pages; page-specific subcomponents usually live beside the page.
- [src/components](src/components) contains reusable UI primitives and shared components. Prefer existing primitives such as `SButton`, `SIconButton`, `TextInput`, `Avatar`, `Layout`, sheets, and segment controls before adding new ones.
- [src/stores](src/stores) contains Pinia setup stores for user/auth and multi-step workflows.
- [src/backend](src/backend) contains the shared API configuration and generated OpenAPI client exports.
- [src/libs](src/libs) contains small pure helpers; colocate focused unit tests under `__tests__`.
- [src/locales](src/locales) contains Fluent `.ftl` files for `en` and `zh-cn`; keep message ids synchronized across locales.
- [e2e](e2e) contains Playwright specs.

## Coding Conventions

- Write Vue SFCs with `<script setup lang="ts">`, typed `defineProps`, `defineEmits`, and `defineModel` where appropriate.
- Use the `@/` alias for imports from `src`.
- Use route names for navigation, for example `router.push({ name: "groupDetail", params: { groupId } })`.
- Use Pinia setup-store style: `defineStore("name", () => { ... return { ... } })`.
- Use `useQuery` from `@pinia/colada` for server data where existing pages do, and invalidate relevant query keys after mutations.
- Use `useFluent()` and `$t("message-id")` for new user-facing strings. Existing ids are usually feature-prefixed, such as `home-profile`.
- Use `@phosphor-icons/vue` for icons and existing Tailwind token classes such as `base-text-primary`, `base-bg-secondary_alt`, and `util-color-brand-700` for styling.
- Preserve backend DTO shapes. Money values commonly arrive as strings and are converted with `Number.parseFloat` only at display/calculation boundaries.

## Backend Client Rules

- Do not manually edit files under [src/backend/openapi](src/backend/openapi); they are generated and lint-ignored.
- Import generated API classes and types from `@/backend` or `@/backend/openapi` following nearby code.
- Instantiate generated API clients with the shared config from [src/backend/config.ts](src/backend/config.ts).
- `VITE_SPLITZ_API_BASE_URL` is required by API config. `VITE_SPLITZ_ASSETS_BASE_URL` is required by [src/libs/asset-url.ts](src/libs/asset-url.ts).
- Auth tokens live in `localStorage` as `accessToken`, `refreshToken`, and `accessTokenExpiration`; the shared OpenAPI configuration refreshes expired access tokens and clears tokens on 401.

## Tests And Validation

- Prefer focused Vitest tests for pure helpers, stores, and component behavior; examples live under `src/**/__tests__`.
- Use Playwright for browser flows. Remember protected routes redirect to `login` unless `localStorage.accessToken` is set.
- Storybook browser tests are configured in [vitest.config.ts](vitest.config.ts); accessibility checks are configured in Storybook preview.
- The starter [e2e/vue.spec.ts](e2e/vue.spec.ts) may not represent the current app behavior; update or replace it when adding meaningful E2E coverage.

## Pitfalls

- The Vite dev server binds to `0.0.0.0`, but browser/client URLs should use `localhost` or the actual host.
- Modules that read required Vite env vars can throw during startup or tests if those vars are missing.
- Fluent message syntax is checked by Vite plugins for external `.ftl` files and SFC `<fluent>` blocks.
- Keep generated files, lockfiles, and unrelated user changes out of edits unless the task explicitly requires them.
