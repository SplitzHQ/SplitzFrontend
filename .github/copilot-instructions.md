# Copilot Instructions for SplitzFrontend

## Project Overview

SplitzFrontend is a Vue 3 web application built with Vite for managing expense splitting. The application uses TypeScript, Tailwind CSS v4, and Bun as its runtime/package manager. The codebase is approximately 465MB with ~100 source files and uses modern Vue 3 Composition API patterns.

**Key Technologies:**
- Runtime: Bun v1.2.23 (required - see installation below)
- Framework: Vue 3.5.22 with TypeScript 5.9.3
- Build Tool: Vite 7.1.9
- Styling: Tailwind CSS 4.1.14, PostCSS, SCSS
- State Management: Pinia 3.0.3 with @pinia/colada for data fetching
- i18n: fluent-vue with `.ftl` locale files (en, zh-cn)
- Testing: Vitest 3.2.4 (unit), Playwright 1.55.1 (e2e), Storybook 9.1.10
- Linting: ESLint 9.37.0 with strict TypeScript config

## Environment Setup

**ALWAYS install Bun before running any commands:**
```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bash_profile
bun --version  # Should show 1.2.23+
```

**Install dependencies (ALWAYS do this first):**
```bash
bun install
```

**For e2e/Storybook tests, install Playwright browsers:**
```bash
npx playwright install chromium
```
Note: Full `npx playwright install` may fail with download errors. Installing only chromium is sufficient.

## Build & Run Commands

### Development Server
```bash
bun dev
```
- Starts Vite dev server on http://localhost:5173 (may auto-increment if port busy)
- Hot-reload enabled, typically ready in ~350ms
- Use for testing UI changes in real-time

### Production Build
```bash
bun run build-only
```
- Vite build (without type checking)
- Build typically completes in 5-6 seconds
- Output: `dist/` directory
- **Recommended:** Use this for faster builds during development

Full build with type-checking:
```bash
bun build
```
- Runs type-check AND build-only in parallel (via npm-run-all2)
- **Warning:** Currently FAILS due to ~50 pre-existing type errors (see Known Issues)
- Use `bun run build-only` to skip type-check and successfully build

### Type Checking
```bash
bun run type-check
```
- Uses vue-tsc (not tsc) for Vue SFC type checking
- **Known Issue:** Currently has ~40 type errors in existing code (Calculator, Avatar, HeaderMobileSecondary components)
- These are pre-existing and should not block your work
- Add `--force` flag (already in package.json) to rebuild even with errors

### Linting
```bash
bun run lint
```
- ESLint with auto-fix enabled
- **Known Issues (pre-existing):**
  - ~15 errors in existing code (unicorn/no-array-sort, text-encoding-identifier-case, etc.)
  - `vitest.shims.d.ts` parsing error (can be ignored)
- Config: `eslint.config.js` - uses strict TypeScript rules, ignores `src/backend/**` (OpenAPI generated)

### Code Formatting
```bash
bun run format
```
- Prettier with Tailwind and import sorting plugins
- Config: `.prettierrc.json` - single quotes, no semicolons, 120 print width
- Formats all files in `src/`

### Preview Production Build
```bash
bun run preview
```
- Serves the built app from `dist/` on port 5173

## Testing

### Unit Tests
```bash
bun run test:unit
```
- Vitest with jsdom environment
- Tests in `src/**/__tests__/*.spec.ts`
- **Important:** Requires Playwright browsers installed for Storybook tests to pass
- Two test projects:
  1. Standard unit tests (jsdom)
  2. Storybook interaction tests (browser mode with Chromium)

### E2E Tests
```bash
# Must build first for CI-like testing
bun build
bun run test:e2e

# Or specific options:
bun test:e2e --project=chromium  # Only Chromium
bun test:e2e e2e/vue.spec.ts     # Specific file
bun test:e2e --debug             # Debug mode
```
- Tests in `e2e/*.spec.ts`
- Config: `playwright.config.ts`
- Uses dev server by default (vite dev), preview server on CI
- Base URL: http://localhost:5173

### Storybook
```bash
bun run storybook  # Dev mode on port 6006
bun run build-storybook  # Build static storybook
```
- Stories: `src/**/*.stories.ts`
- Config: `.storybook/main.ts`, `.storybook/preview.ts`
- Includes vitest integration via @storybook/addon-vitest

## Project Structure

### Root Configuration Files
- `vite.config.ts` - Vite config with Vue, Fluent Vue plugins (SFC & external FTL), alias `@` → `src/`
- `vitest.config.ts` - Two test projects (jsdom unit tests, browser Storybook tests)
- `playwright.config.ts` - E2E config, testDir: `./e2e`, timeout: 30s, headless on CI
- `eslint.config.js` - ESLint 9 flat config, strict TypeScript, ignores OpenAPI generated code
- `tailwind.config.js` - Tailwind v4 config with custom colors from `tailwind.config.colors.js`
- `postcss.config.js` - PostCSS with @tailwindcss/postcss plugin
- `tsconfig.json` - Composite project references (node, app, vitest)
- `package.json` - Scripts, bun as package manager, ~86 dependencies

### Source Code Structure (`src/`)
```
src/
├── main.ts              # App entry point: Vue app, Pinia, router, fluent-vue i18n setup
├── App.vue              # Root component
├── router/              # Vue Router configuration
├── pages/               # Page components
│   ├── HomePage/
│   └── NewExpensePage/  # Multi-step expense creation flow
│       ├── EnterAmountPage/
│       ├── SelectPeoplePage/
│       ├── SelectSplitMethodPage/
│       └── ReviewAndCompletePage/
├── components/          # Reusable components (Avatar, SButton, Sheet, Keyboard, etc.)
├── stores/              # Pinia stores (transaction, user, routing-history)
├── backend/             # OpenAPI generated client code (DO NOT EDIT)
│   ├── config.ts        # API configuration
│   └── openapi/         # Auto-generated from OpenAPI spec
├── libs/                # Utility libraries (categories.ts with subcategories)
├── locales/             # Fluent i18n files (en.ftl, zh-cn.ftl)
├── assets/              # CSS files (base.css, color.css)
└── types/               # TypeScript type definitions

e2e/                     # Playwright E2E tests
.storybook/              # Storybook configuration
scripts/                 # Build scripts (css-var-to-tailwind)
```

### Key Patterns
- **Components:** Single File Components (SFC) with `<script setup lang="ts">`, TypeScript, and optional `<fluent>` blocks
- **State:** Pinia stores with Composition API, @pinia/colada for data fetching
- **Routing:** Vue Router in `src/router/index.ts`
- **Styling:** Tailwind utility classes, custom theme in `tailwind.config.js`, CSS variables in `src/assets/color.css`
- **i18n:** Fluent Vue with SFC `<fluent>` blocks or external `.ftl` files in `src/locales/`
- **Types:** TypeScript strict mode, `vue-tsc` for type checking

### Do NOT Edit
- `src/backend/openapi/**` - Auto-generated OpenAPI client (ignored by ESLint)
- `bun.lockb` - Bun lockfile
- `dist/` - Build output (gitignored)

## Common Issues & Workarounds

### Type Errors (Pre-existing)
The codebase has ~50 type errors in:
- `src/components/Avatar/Avatar.vue` (2 errors: possibly undefined)
- `src/components/Header/Mobile/Secondary/HeaderMobileSecondary.vue` (2 errors: missing ariaLabel)
- `src/components/Keyboard/Calculator.ts` & `UseCalculator.ts` (~36 errors: possibly undefined)
- `src/components/Sheet/Sheet.vue` (2 errors: possibly undefined)
- `src/pages/NewExpensePage/` various components (~8 errors: missing ariaLabel, possibly undefined)
- `src/stores/transaction.ts` (4 errors: undefined index type)

**Workaround:** These errors exist in the main branch and cause `bun build` to FAIL. Use `bun run build-only` to build without type-checking. Your changes should not introduce NEW type errors.

### Lint Errors (Pre-existing)
~15 linting errors exist:
- `unicorn/no-array-sort` (prefer `toSorted()` over `sort()`)
- `unicorn/text-encoding-identifier-case` (prefer `utf8` over `utf-8`)
- TypeScript strict errors in `src/stores/transaction.ts`
- `vitest.shims.d.ts` not in tsconfig project (can ignore)

**Workaround:** Fix lint errors in files you modify, but don't worry about pre-existing errors in unmodified files.

### Playwright Installation
Running `npx playwright install` may fail with "size mismatch" download errors. **Workaround:** Install only chromium: `npx playwright install chromium`

### Port Conflicts
Dev server port 5173 may be occupied. Vite automatically tries another port (5174, etc.). Check console output for actual URL.

### Bun vs NPM/Node
This project uses Bun exclusively. Do NOT use `npm` or `yarn` commands - they may cause dependency conflicts. Always use `bun` commands.

## Validation Workflow

Before submitting changes, run this sequence:

```bash
# 1. Format code
bun run format

# 2. Lint and auto-fix
bun run lint

# 3. Type check (expect pre-existing errors, will fail with exit code 2)
bun run type-check

# 4. Build (use build-only to avoid type-check failure)
bun run build-only

# 5. Run unit tests (requires playwright installed)
bun run test:unit

# 6. Run e2e tests (requires build first)
bun run build-only
bun run test:e2e --project=chromium
```

**Time estimates:**
- Format: ~1s
- Lint: ~5-10s
- Type-check: ~10-15s (will fail with pre-existing errors)
- Build-only: ~5-6s
- Unit tests: ~10-20s (with Storybook browser tests)
- E2E tests: ~30-60s

**Note:** Skip type-check in CI/CD or use `bun run build-only` until type errors are fixed.

## Critical Rules

1. **ALWAYS use `bun` commands, never `npm` or `yarn`**
2. **ALWAYS run `bun install` after cloning or pulling changes**
3. **Install Playwright browsers before running tests:** `npx playwright install chromium`
4. **Use `bun run build-only` for builds** - `bun build` will fail due to pre-existing type errors
5. **Pre-existing errors are not your responsibility** - focus on not introducing new errors
6. **DO NOT edit `src/backend/**`** - it's OpenAPI generated code
7. **Use `.vue` SFC format** with `<script setup lang="ts">` for all Vue components
8. **Use Tailwind classes** for styling, avoid inline styles
9. **Use `@/` alias** for imports from `src/` directory (configured in vite.config.ts)
10. **Trust these instructions** - only search if information is incomplete or incorrect

## Additional Notes

- **IDE:** VSCode with Volar extension recommended (disable Vetur)
- **Node version:** 20.19.5 (but Bun is the primary runtime)
- **Git:** Standard git workflow, `.gitignore` excludes `dist/`, `node_modules/`, `*.tsbuildinfo`, test outputs
- **EditorConfig:** 2-space indentation, LF line endings, trim trailing whitespace
- **OpenAPI:** Backend API client in `src/backend/`, config in `src/backend/config.ts`

This project follows standard Vue 3 + Vite + TypeScript patterns. When in doubt, refer to official Vue 3, Vite, and Tailwind CSS documentation.
