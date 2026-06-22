# Email Confirmation and Password Recovery Plan

## Planning Mode Notes

This plan is based on `tasks/spec.md`, the current backend Identity setup in `SplitzBackend/src/Program.cs`, the custom authorized `AccountController`, the frontend router, the `user` Pinia store, login/register pages, locale loading, and the existing generated OpenAPI client methods.

No implementation files were changed while preparing this plan. The only expected outputs of this planning step are `tasks/plan.md` and `tasks/todo.md`.

## Current State

Backend:

- Identity minimal APIs are already mapped under `/account` and provide register, login, confirm email, resend confirmation email, forgot password, and reset password endpoints.
- `AddIdentityApiEndpoints<SplitzUser>()` currently requires unique emails and configures password rules, but does not require confirmed email before sign-in yet.
- The custom `AccountController` is `[Authorize]` by default and currently contains user profile, friend, and avatar endpoints. Any email capability endpoint must explicitly allow anonymous access.
- Storage options already use the Options pattern with validation, which is the closest local pattern for typed configuration.
- There is no backend test project at the moment.

Frontend:

- `router/index.ts` currently exposes only `login` and `register` as public routes.
- `stores/user.ts` already wraps Identity register/login calls, but does not wrap confirm email, resend confirmation, forgot password, reset password, or email capability checks.
- `LoginPage.vue` and `RegisterPage.vue` use literal English strings rather than Fluent messages.
- Locale files are loaded dynamically from `src/locales/{locale}/*.ftl`, so adding `auth.ftl` files is enough for new auth strings to load.
- Generated Identity methods already exist for confirm/resend/forgot/reset. A new backend email capability endpoint will require OpenAPI regeneration for a typed client method, or a deliberately small manual fetch wrapper if regeneration is deferred.

## Dependency Graph

```text
Email configuration shape
  -> Email availability calculation
  -> Backend Identity email sender registration
  -> Confirmation/reset link generation
  -> Capability endpoint response
  -> Frontend store capability action
  -> Registration, resend, forgot-password UI states

RequireConfirmedEmail backend setting
  -> Login failure behavior for unconfirmed accounts
  -> Login page error handling
  -> Resend confirmation path from login

Backend capability endpoint
  -> OpenAPI document
  -> Generated frontend client, if regenerated
  -> Store actions and UI disabled/enabled states

Frontend public routes
  -> Confirm email page
  -> Forgot password page
  -> Reset password page
  -> Route guard behavior for unauthenticated email flows

Fluent auth messages
  -> Converted login/register pages
  -> New confirm/forgot/reset pages
  -> Generic anti-enumeration success copy

Backend email sender
  -> Resend package and DI
  -> Non-secret appsettings shape
  -> Production validation
  -> Backend build/format validation

Frontend store actions
  -> Auth pages
  -> Frontend type-check/lint/build
  -> Optional Playwright coverage
```

## Contract Decisions To Confirm Before Implementation

1. `GET /account/email-capabilities` should be anonymous and return a small DTO such as `{ "emailEnabled": boolean, "passwordResetEnabled": boolean }`. In the first implementation both values can derive from the same configured availability, but keeping separate fields leaves room for future provider policy differences.
2. Registration should still succeed when email is unavailable, but because backend sign-in will require confirmed email, local development accounts created through registration may be unable to log in unless confirmation is completed manually or email is configured. The UI should make this explicit.
3. The frontend should prefer regenerated OpenAPI for the new capability endpoint. If regeneration is blocked, use a small typed fetch helper outside `src/backend/openapi/**/*` and document that regeneration remains due.
4. Identity confirm links provide `userId`, `code`, and optional `changedEmail`. Reset links should provide `email` and `resetCode`, matching the generated reset request shape.

## Vertical Task Slices

## Task 1: Backend Email Capability Baseline

**Description:** Add the backend configuration model and anonymous capability endpoint that reports whether transactional email is configured. This creates the shared contract the frontend needs before any UI enables or disables recovery flows.

**Acceptance criteria:**

- [ ] `EmailOptions` binds from `Email` configuration with defaults for provider, enabled flag, frontend base URL, confirm path, and reset path.
- [ ] Non-secret email configuration shape is present in `appsettings.json` with an empty API key.
- [ ] Production startup fails fast when `Email:Enabled=true` but required fields are missing.
- [ ] Development startup remains smooth when no Resend API key is configured.
- [ ] `GET /account/email-capabilities` is anonymous and returns email/password-reset availability without exposing secrets.
- [ ] Existing authorized `AccountController` behavior remains unchanged for profile/friend/avatar endpoints.

**Verification:**

- [ ] `dotnet restore`
- [ ] `dotnet build`
- [ ] `dotnet format SplitzBackend.sln --verify-no-changes`
- [ ] Manual OpenAPI check confirms the capability endpoint appears in the document.

## Task 2: Backend Sends Frontend Email Links

**Description:** Integrate the official Resend SDK through Identity's `IEmailSender<SplitzUser>` so registration, resend confirmation, and forgot password use existing Identity endpoint behavior while email messages point to frontend routes.

**Acceptance criteria:**

- [ ] Resend package is referenced in `SplitzBackend.csproj`.
- [ ] Resend services are registered only through configuration/DI; no API key is committed.
- [ ] Identity is configured to require confirmed email before sign-in.
- [ ] Confirmation emails contain frontend `/confirm-email` links with the Identity query parameters needed by the generated confirm method.
- [ ] Password reset emails contain frontend `/reset-password` links with `email` and `resetCode` query parameters.
- [ ] When email is disabled or the API key is missing, confirmation sending is skipped and logged without failing registration.
- [ ] Logs do not include API keys, raw tokens, or full tokenized links.
- [ ] Forgot-password still uses the built-in endpoint; frontend disabled-state behavior is driven by the capability endpoint.

**Verification:**

- [ ] `dotnet restore`
- [ ] `dotnet build`
- [ ] `dotnet format SplitzBackend.sln --verify-no-changes`
- [ ] Manual registration in disabled mode succeeds and logs a skipped confirmation.
- [ ] Manual configured-mode smoke test confirms Resend receives confirmation/reset email requests, if credentials are available locally.

## Task 3: Refresh Frontend API Contract

**Description:** Regenerate the frontend OpenAPI client after the backend capability endpoint is available, then expose focused store actions for all email auth workflows.

**Acceptance criteria:**

- [ ] Backend OpenAPI is served locally from the updated backend.
- [ ] `src/backend/openapi/**/*` is regenerated, not manually edited.
- [ ] `useUserStore` exposes actions for email capabilities, confirm email, resend confirmation, forgot password, and reset password.
- [ ] Store actions keep generated API details out of page components.
- [ ] Generic success behavior is preserved for resend confirmation and forgot password.
- [ ] Token values are not logged from store actions or page handlers.

**Verification:**

- [ ] `bun run type-check`
- [ ] `bun run lint`
- [ ] `bun run build`
- [ ] Inspect generated diff to confirm only OpenAPI generator output changed under `src/backend/openapi/**/*`.

## Task 4: Registration And Login Confirmation Flow

**Description:** Update existing login and registration pages into an email-confirmation-aware flow: registration success explains the next step, login detects likely unconfirmed-email failures, and users can request a new confirmation email from the login path.

**Acceptance criteria:**

- [ ] Login and register user-facing strings are moved to `auth.ftl` in both English and Chinese.
- [ ] Register checks email capability after successful registration and shows either check-email guidance or unavailable-environment guidance.
- [ ] Login handles unconfirmed-email failures with a resend confirmation affordance.
- [ ] Resend confirmation from login uses a generic success message that does not reveal account existence.
- [ ] Existing 2FA toggle behavior is preserved.
- [ ] Routes continue to redirect protected pages for unauthenticated users.

**Verification:**

- [ ] `bun run type-check`
- [ ] `bun run lint`
- [ ] `bun run build`
- [ ] Browser smoke test for register success and login failure/resend states.

## Task 5: Confirm Email Callback Page

**Description:** Add the public `/confirm-email` route and page that consumes Identity query parameters, calls the generated confirm endpoint through the store, and presents success, invalid/expired, and resend/retry states.

**Acceptance criteria:**

- [ ] `confirmEmail` route is public and available at `/confirm-email`.
- [ ] Page reads `userId`, `code`, and optional `changedEmail` query parameters.
- [ ] Missing required query parameters produce a recoverable invalid-link state.
- [ ] Successful confirmation links the user back to login.
- [ ] Failed confirmation shows an expired/invalid state and a way to request a new confirmation email.
- [ ] All visible strings are localized in English and Chinese.

**Verification:**

- [ ] `bun run type-check`
- [ ] `bun run lint`
- [ ] `bun run build`
- [ ] Browser smoke test with mocked or manually supplied query parameters.

## Task 6: Forgot Password Availability Flow

**Description:** Add a public forgot-password page and login link that checks email capability before enabling the recovery form, then submits generic recovery requests through the store when available.

**Acceptance criteria:**

- [ ] Login page includes a forgot-password link.
- [ ] `forgotPassword` route is public and available at `/forgot-password`.
- [ ] Page checks backend email capabilities on load.
- [ ] If unavailable, the email input and submit action are disabled with clear localized copy.
- [ ] If available, submitting an email calls the forgot-password Identity endpoint through the store.
- [ ] Success copy is generic and does not reveal whether an account exists.
- [ ] Network/API errors are recoverable without leaking account existence.

**Verification:**

- [ ] `bun run type-check`
- [ ] `bun run lint`
- [ ] `bun run build`
- [ ] Browser smoke test for disabled capability state and successful submitted state.

## Task 7: Reset Password Callback Flow

**Description:** Add a public reset-password page that consumes email reset link parameters, validates new password inputs, calls the reset endpoint, and returns users to login on success.

**Acceptance criteria:**

- [ ] `resetPassword` route is public and available at `/reset-password`.
- [ ] Page reads `email` and `resetCode` query parameters.
- [ ] Missing required query parameters produce a recoverable invalid-link state.
- [ ] New password and confirmation fields validate before submit.
- [ ] Successful reset routes to login with a clear localized success message.
- [ ] Invalid or expired reset token shows a localized error and links back to forgot password.
- [ ] Password reset tokens are never logged.

**Verification:**

- [ ] `bun run type-check`
- [ ] `bun run lint`
- [ ] `bun run build`
- [ ] Browser smoke test for validation, invalid-link state, and success state with mocked backend.

## Task 8: Focused Auth Email Test Coverage

**Description:** Add focused automated coverage for the highest-risk frontend auth email paths without depending on live Resend delivery.

**Acceptance criteria:**

- [ ] Playwright tests cover forgot-password disabled state from capability false.
- [ ] Playwright tests cover forgot-password generic success from mocked backend response.
- [ ] Playwright tests cover reset-password client validation and success routing.
- [ ] Playwright tests cover confirm-email success and invalid/error states.
- [ ] Tests mock backend responses and do not require a real Resend API key.
- [ ] Existing starter E2E behavior is not made more brittle.

**Verification:**

- [ ] `bun run test:e2e`
- [ ] `bun run type-check`
- [ ] `bun run lint`
- [ ] `bun run build`

## Task 9: End-to-End Validation And Documentation Pass

**Description:** Run the full required validation suite, verify generated files and secrets hygiene, and update any lightweight documentation needed for local configuration.

**Acceptance criteria:**

- [ ] Backend validation passes: restore, build, format check.
- [ ] Frontend validation passes: type-check, lint, build.
- [ ] Optional E2E tests pass if added.
- [ ] No Resend API key or secret appears in committed files.
- [ ] Generated OpenAPI files are changed only by regeneration.
- [ ] README or task notes document local email configuration keys and disabled-mode behavior if not already clear.

**Verification:**

- [ ] `git diff` review for implementation scope and secret hygiene.
- [ ] `dotnet restore`
- [ ] `dotnet build`
- [ ] `dotnet format SplitzBackend.sln --verify-no-changes`
- [ ] `bun run type-check`
- [ ] `bun run lint`
- [ ] `bun run build`
- [ ] `bun run test:e2e`, if E2E coverage is added.

## Suggested Implementation Order

1. Task 1 establishes the capability contract without needing Resend delivery.
2. Task 2 wires actual email sending and confirmed-email enforcement.
3. Task 3 refreshes the frontend API layer and store boundary.
4. Tasks 4 through 7 deliver user-visible flows vertically, one path at a time.
5. Task 8 adds focused automation after the routes and states exist.
6. Task 9 closes with validation, generated-file review, and documentation.

## Parallelization Opportunities

Safe after Task 3:

- Task 5, Task 6, and Task 7 can be implemented by separate sessions if route names, store action names, and shared auth Fluent ids are agreed first.
- Task 8 can be started once the page routes and selectors stabilize.

Must stay sequential:

- Task 1 before Task 3, because the capability endpoint changes the API contract.
- Task 2 before realistic manual email-link testing, because links are produced by the backend sender.
- OpenAPI regeneration before frontend code relies on a generated capability method.

Needs coordination:

- Shared `auth.ftl` message ids across Tasks 4 through 7.
- Store action names and return shapes used by all auth pages.
- How to represent capability failure versus email unavailable in UI state.

## Main Risks

- Identity's generated email links may include backend endpoint URLs and encoded tokens; the custom sender must carefully transform or rebuild frontend links without logging sensitive query values.
- Enabling confirmed-email requirement can block locally registered users when email is disabled. The UI and local development notes should make that behavior unsurprising.
- The new custom capability endpoint lives under the same `AccountController` that is `[Authorize]`; forgetting `[AllowAnonymous]` would make forgot-password availability unusable for signed-out users.
- Regenerated OpenAPI output can be large. Review generated diffs separately from hand-written frontend changes.
- Login error responses from Identity may not cleanly distinguish unconfirmed email from bad credentials. The UI should avoid revealing account existence and can offer resend confirmation conservatively when login fails for an entered email.
