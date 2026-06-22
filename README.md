# SplitzFrontend

SplitzFrontend is the Vue 3 frontend for SplitZ, an expense-splitting app for groups and friends. It is a Vite-powered SPA/PWA built with TypeScript, Pinia, Vue Router, Tailwind token classes, Fluent i18n, Storybook, Vitest, and Playwright.

## Requirements

- [Bun](https://bun.sh/) for package management and scripts.
- A SplitzBackend API server for real app data.
- Playwright browsers for E2E and Storybook browser tests.

## Setup

Install dependencies:

```bash
bun install
```

Create a local environment file if needed by your shell or deployment workflow. The app expects these Vite variables when the backend or asset helpers are imported:

```bash
VITE_SPLITZ_API_BASE_URL=http://localhost:5119
VITE_SPLITZ_ASSETS_BASE_URL=http://localhost:5119
```

Start the development server:

```bash
bun run dev
```

The Vite server listens on port `5173`. Open the app at `http://localhost:5173`.

## Scripts

| Command                       | Purpose                                              |
| ----------------------------- | ---------------------------------------------------- |
| `bun run dev`                 | Start the Vite development server.                   |
| `bun run build`               | Type-check with `vue-tsc`, then build with Vite.     |
| `bun run preview`             | Preview the production build locally.                |
| `bun run type-check`          | Run TypeScript/Vue type checking only.               |
| `bun run lint`                | Run oxlint and ESLint with autofix enabled.          |
| `bun run format`              | Format files with oxfmt.                             |
| `bun run format:check`        | Check formatting without writing changes.            |
| `bun run test:unit`           | Run Vitest unit tests and Storybook browser tests.   |
| `bun run test:e2e`            | Run Playwright E2E tests.                            |
| `bun run storybook`           | Start Storybook on port `6006`.                      |
| `bun run build-storybook`     | Build Storybook.                                     |
| `bun run css-var-to-tailwind` | Regenerate Tailwind color tokens from CSS variables. |

## Project Structure

```text
src/
	backend/      Shared OpenAPI configuration and generated API client exports
	components/   Reusable UI primitives and shared components
	libs/         Small helpers and colocated unit tests
	locales/      Fluent translation files for en and zh-cn
	pages/        Route-level application pages
	router/       Vue Router routes and auth guard
	stores/       Pinia setup stores
e2e/            Playwright tests
tasks/          Feature specs and implementation notes
```

For coding-agent guidance and local conventions, see [AGENTS.md](AGENTS.md).

## Backend API Client

The generated TypeScript client lives under [src/backend/openapi](src/backend/openapi). Do not edit generated files by hand. Regenerate the client from the backend OpenAPI document instead:

```bash
openapi-generator-cli generate -i http://localhost:5119/openapi/v1.json -g typescript-fetch -o ./src/backend/openapi
```

Replace the OpenAPI URL when generating against another backend environment.

Application code should import generated APIs and types from `@/backend` or `@/backend/openapi`, and instantiate clients with the shared config from [src/backend/config.ts](src/backend/config.ts).

## Development Notes

- Use route names for navigation rather than hardcoded paths where possible.
- Use `useFluent()` and Fluent message ids for new user-facing text.
- Keep `src/locales/en` and `src/locales/zh-cn` message ids synchronized.
- Prefer existing UI primitives such as `SButton`, `SIconButton`, `TextInput`, `Avatar`, and `Layout` before adding new primitives.
- Money values from the backend commonly arrive as strings; parse them only at display or calculation boundaries.

## Validation

Before opening a pull request, run the checks that match the change:

```bash
bun run type-check
bun run lint
bun run build
```

Run focused tests for changed behavior:

```bash
bun run test:unit
bun run test:e2e
```

Protected routes redirect to login unless `localStorage.accessToken` is set, so account-aware Playwright tests need an auth setup or mocked backend state.
