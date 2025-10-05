# Copilot Instructions for SplitzFrontend

## Repository Overview

**SplitzFrontend** is a Vue 3 + TypeScript single-page application for expense splitting and group payment management. The app uses Vite as the build tool and includes internationalization support (English and Chinese) via Fluent localization system.

**Tech Stack:**
- **Frontend Framework:** Vue 3.5 with Composition API (`<script setup>` syntax)
- **Build Tool:** Vite 7.x
- **Runtime:** Bun 1.2+ (for package management and running scripts)
- **TypeScript:** 5.9.x with strict type checking
- **Styling:** Tailwind CSS 4.x with custom color tokens
- **Testing:** Vitest 3.x (unit tests), Playwright 1.x (e2e tests), Storybook 9.x (component testing)
- **State Management:** Pinia 3.x with Pinia Colada for data fetching
- **Routing:** Vue Router 4.x
- **Internationalization:** Fluent (Project Fluent) with fluent-vue 3.x

**Repository Size:** ~465MB (including node_modules), ~100 Vue components, ~10,600 lines of source code

## Build & Development Commands

### Prerequisites
- **Bun 1.2+** must be installed. The repository uses Bun as the primary package manager and script runner.
- **Node.js** compatible runtime is available through Bun.

### Installation & Setup

**ALWAYS run `bun install` first before any other command** when starting work or after pulling changes:

```bash
bun install
```

This installs all dependencies and takes ~30-40 seconds. Blocked postinstalls are expected and can be ignored.

### Development Server

```bash
bun dev
```

- Starts Vite dev server on `http://localhost:5173`
- Supports hot module replacement (HMR)
- No build step required - immediate feedback

### Type Checking

**ALWAYS run type-check before building or committing code:**

```bash
bun type-check
```

- Uses `vue-tsc --build --force` to type-check Vue SFCs and TypeScript
- Takes ~5-10 seconds
- Must pass with no errors before building

### Building for Production

```bash
bun run build
```

- Runs `type-check` and `vite build` in parallel via `npm-run-all2`
- Takes ~10-15 seconds
- Output goes to `dist/` directory
- **Note:** Do NOT use `bun build` (without `run`) - it's a different Bun command

### Linting

```bash
bun lint
```

- Uses ESLint 9 with flat config (`eslint.config.js`)
- Auto-fixes issues with `--fix` flag (included in script)
- **Known Issues:**
  - `scripts/css-var-to-tailwind/index.ts` has 2 linting errors about `utf-8` vs `utf8` encoding - these are pre-existing and can be ignored
  - `vitest.shims.d.ts` has a parsing error about not being in tsconfig - this is expected and can be ignored
- Exit code 1 with these errors is expected - focus on new errors in your changes

### Testing

#### Unit Tests (Vitest)

```bash
bun test:unit
```

**CRITICAL NOTE:** Unit tests require Playwright browsers to be installed first for the Storybook test project:

```bash
npx playwright install chromium
```

- **Known Issue:** Playwright browser download may fail with "size mismatch" errors in some CI environments. If tests fail with "Executable doesn't exist" errors, browsers need to be installed.
- Tests use jsdom environment for component tests
- Storybook component tests run in Playwright browser mode
- Test files: `src/**/__tests__/*.spec.ts` and Storybook stories

#### End-to-End Tests (Playwright)

```bash
# First time setup
npx playwright install

# Run all e2e tests
bun test:e2e

# Run on specific browser
bun test:e2e --project=chromium

# Run specific test file
bun test:e2e e2e/vue.spec.ts
```

- Tests run in `e2e/` directory
- Playwright auto-starts dev server on port 5173 before tests
- In CI: builds project first and uses preview server
- Test configuration: `playwright.config.ts`

#### Storybook

```bash
# Run Storybook dev server
bun storybook

# Build Storybook
bun build-storybook
```

- Storybook runs on port 6006
- Stories located in `src/**/*.stories.ts`
- Configuration in `.storybook/` directory

### Formatting

```bash
bun format
```

- Uses Prettier with Tailwind CSS plugin and import sorter
- Formats `src/` directory only
- Config: `.prettierrc.json`

## Project Structure

```
/
├── .storybook/          # Storybook configuration
│   ├── main.ts          # Storybook main config
│   ├── preview.ts       # Storybook preview config
│   └── vitest.setup.ts  # Vitest setup for Storybook tests
├── e2e/                 # Playwright e2e tests
│   ├── vue.spec.ts      # Sample e2e test
│   └── tsconfig.json    # TypeScript config for e2e tests
├── public/              # Static assets
├── scripts/             # Build/utility scripts
│   └── css-var-to-tailwind/  # CSS variable to Tailwind converter
├── src/
│   ├── assets/          # Images, CSS files (base.css, color.css)
│   ├── backend/         # API client code
│   │   ├── config.ts    # API configuration with auth handling
│   │   ├── index.ts     # Backend exports
│   │   └── openapi/     # OpenAPI generated code (DO NOT EDIT)
│   ├── components/      # Reusable Vue components
│   │   ├── Avatar/
│   │   ├── Category/
│   │   ├── Header/
│   │   ├── Keyboard/
│   │   ├── Layout/
│   │   ├── SButton/
│   │   ├── SSegmentControl/
│   │   ├── Sheet/
│   │   └── TextInput/
│   ├── libs/            # Utility libraries and helpers
│   │   └── __tests__/   # Library unit tests
│   ├── locales/         # Internationalization files
│   │   ├── en.ftl       # English translations (Fluent format)
│   │   └── zh-cn.ftl    # Chinese translations
│   ├── pages/           # Page components (routed views)
│   │   ├── HomePage/
│   │   └── NewExpensePage/
│   │       ├── EnterAmountPage/
│   │       ├── ReviewAndCompletePage/
│   │       ├── SelectPeoplePage/
│   │       └── SelectSplitMethodPage/
│   ├── router/          # Vue Router configuration
│   │   └── index.ts     # Route definitions
│   ├── stores/          # Pinia stores
│   │   └── transaction.ts  # Transaction state management
│   ├── types/           # TypeScript type definitions
│   ├── App.vue          # Root component (just RouterView)
│   └── main.ts          # Application entry point
├── dist/                # Production build output (gitignored)
├── node_modules/        # Dependencies (gitignored)
├── .editorconfig        # Editor configuration
├── .gitignore           # Git ignore rules
├── .prettierrc.json     # Prettier configuration
├── env.d.ts             # Vite client types
├── eslint.config.js     # ESLint flat config
├── index.html           # HTML entry point
├── package.json         # Package manifest and scripts
├── playwright.config.ts # Playwright test configuration
├── postcss.config.js    # PostCSS config (for Tailwind)
├── tailwind.config.js   # Tailwind configuration
├── tailwind.config.colors.js  # Tailwind custom colors
├── tsconfig.json        # TypeScript project references
├── tsconfig.app.json    # TypeScript config for app code
├── tsconfig.node.json   # TypeScript config for build scripts
├── tsconfig.vitest.json # TypeScript config for tests
├── vite.config.ts       # Vite configuration
├── vitest.config.ts     # Vitest configuration
└── vitest.shims.d.ts    # Vitest type shims
```

## Key Configuration Files

- **vite.config.ts**: Vite configuration with Fluent Vue plugins for i18n, Vue plugin, path alias `@/` → `./src`
- **vitest.config.ts**: Vitest config with 2 projects: jsdom for unit tests, Playwright browser for Storybook tests
- **playwright.config.ts**: E2e test config targeting `./e2e`, runs dev server on CI with preview mode
- **eslint.config.js**: Flat ESLint config with TypeScript strict checking, ignores `src/backend/**` (generated code)
- **tsconfig.*.json**: Multiple TypeScript configs for different contexts (app, node scripts, tests)
- **tailwind.config.js**: Custom Tailwind setup with color tokens from `tailwind.config.colors.js`

## Important Architectural Details

### Backend API Integration

- **Location:** `src/backend/`
- **DO NOT EDIT:** `src/backend/openapi/` is generated code
- **Authentication:** `src/backend/config.ts` handles JWT token refresh automatically
- **Dev Mode:** Auto-logs in as `alice@example.com` for development (see TODO on line 61)
- **API Base:** `http://localhost:5119` (development backend)

### Routing

- Defined in `src/router/index.ts`
- Uses Vue Router history mode
- Main routes:
  - `/` → HomePage
  - `/new-expense/enter-amount` → New expense flow (step 1)
  - `/new-expense/select-people` → Select participants (step 2)
  - `/new-expense/select-split-method` → Choose split method (step 3)
  - `/new-expense/review-and-complete` → Review and submit (step 4)

### Internationalization

- Uses Fluent (Project Fluent) format in `.ftl` files
- Two locales supported: `en` (English), `zh-cn` (Chinese)
- In components: Use `const { $t } = useFluent()` then `$t('Message_Key')`
- In templates: `{{ $t('Message_Key') }}`
- Fluent files: `src/locales/en.ftl` and `src/locales/zh-cn.ftl`

### Component Patterns

- **Composition API only** - Use `<script setup lang="ts">` syntax
- Components use Tailwind CSS classes directly, no scoped styles
- Reusable components in `src/components/`, page components in `src/pages/`
- Props and emits defined with TypeScript
- Stories available for key components (check `*.stories.ts` files)

### State Management

- Pinia stores in `src/stores/`
- Use Pinia Colada for API data fetching
- Example: `useTransactionStore()` manages expense transaction state

## Common Pitfalls & Workarounds

### 1. **Using `bun build` instead of `bun run build`**
   - **Wrong:** `bun build` (this is Bun's bundler command)
   - **Correct:** `bun run build` (this runs the npm script)

### 2. **Missing Playwright Browsers**
   - If unit tests fail with "Executable doesn't exist" error
   - Run: `npx playwright install chromium`
   - This is required for Storybook component tests

### 3. **Lint Errors Are Expected**
   - 2 encoding errors in `scripts/css-var-to-tailwind/index.ts` (pre-existing)
   - 1 parsing error in `vitest.shims.d.ts` (expected, file not in tsconfig)
   - Focus on NEW errors in your changes only

### 4. **Type Checking Must Pass Before Build**
   - Always run `bun type-check` before `bun run build`
   - Build script runs these in parallel but both must succeed

### 5. **Backend Code Generation**
   - Files in `src/backend/openapi/` are auto-generated
   - Do not manually edit - changes will be overwritten
   - ESLint ignores this directory (see `eslint.config.js`)

### 6. **Path Aliases**
   - Use `@/` for `src/` directory imports
   - Example: `import Component from '@/components/Avatar/Avatar.vue'`
   - Configured in both `vite.config.ts` and `tsconfig.app.json`

## Validation Checklist

Before committing changes:

1. **Install dependencies:** `bun install` (if package.json changed)
2. **Type check passes:** `bun type-check` (0 errors)
3. **Linting passes:** `bun lint` (ignore known errors listed above)
4. **Build succeeds:** `bun run build` (dist/ created)
5. **Unit tests pass:** `bun test:unit` (if component/logic changed)
6. **Manual testing:** `bun dev` and verify changes work in browser
7. **Format code:** `bun format` (for consistency)

## CI/CD Notes

**No CI pipelines found** in this repository yet. The project does not have `.github/workflows/` directory. When adding CI:

- Use `process.env.CI` checks already present in configs
- Playwright will use preview server in CI mode (see `playwright.config.ts` line 106)
- Install Playwright browsers in CI: `npx playwright install --with-deps`
- Consider caching `~/.bun/install/cache` and `node_modules/`

## Additional Resources

- **Vite docs:** https://vitejs.dev/config/
- **Vue 3 docs:** https://vuejs.org/guide/
- **Fluent syntax:** https://projectfluent.org/
- **Playwright:** https://playwright.dev/docs/intro
- **Storybook:** https://storybook.js.org/docs

---

**Trust these instructions.** Only search for additional information if these instructions are incomplete or incorrect. The build commands, file locations, and architectural patterns documented here are verified and tested.
