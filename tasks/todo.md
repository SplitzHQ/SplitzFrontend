# Email Confirmation and Password Recovery Todo

Use this checklist with `tasks/plan.md`. Keep tasks vertical and update statuses as work lands. You must add comments for the code you added.

## Task 1: Backend Email Capability Baseline

- [x] Add `EmailOptions` with defaults and validation rules.
- [x] Add non-secret `Email` configuration shape to backend appsettings.
- [x] Register options validation so production fails fast when enabled config is incomplete.
- [x] Add anonymous `GET /account/email-capabilities` endpoint.
- [x] Verify disabled local development reports unavailable without breaking startup.
- [x] Run `dotnet restore`.
- [x] Run `dotnet build`.
- [x] Run `dotnet format SplitzBackend.sln --verify-no-changes`.

Note: Task 1 changed-file format verification passes. Full-solution format verification currently reports pre-existing CRLF/LF normalization issues in unrelated backend files such as `src/Controllers/TransactionDraftController.cs` and `src/Models/Invoice.cs`.

## Task 2: Backend Sends Frontend Email Links

- [x] Add official Resend .NET SDK package reference.
- [x] Register Resend SDK and Identity email sender in DI.
- [x] Configure Identity to require confirmed email before sign-in.
- [x] Implement confirmation email sending with frontend `/confirm-email` links.
- [x] Implement password reset email sending with frontend `/reset-password` links.
- [x] Skip confirmation sending safely when email is unavailable.
- [x] Ensure logs omit API keys, raw tokens, and full tokenized links.
- [x] Validate backend restore/build/format.
- [x] Smoke test registration in disabled mode.
- [x] Smoke test configured Resend delivery if local credentials are available.

Note: Task 2 automated coverage verifies disabled-mode sender calls do not require a Resend client. Configured Resend delivery was not smoke-tested because no local credentials were provided.

## Task 3: Refresh Frontend API Contract

- [x] Run updated backend locally with OpenAPI enabled.
- [x] Regenerate `src/backend/openapi/**/*` from backend OpenAPI.
- [x] Review generated diff separately from handwritten changes.
- [x] Add store action for email capabilities.
- [x] Add store action for confirm email.
- [x] Add store action for resend confirmation email.
- [x] Add store action for forgot password.
- [x] Add store action for reset password.
- [x] Run `bun run type-check`.
- [x] Run `bun run lint`.
- [x] Run `bun run build`.

Note: Full `bun run test:unit --run` also passes after disabling the Vue DevTools Vite plugin during Vitest browser runs so Storybook a11y scans do not include the devtools overlay.

## Task 4: Registration And Login Confirmation Flow

- [x] Create synchronized `src/locales/en/auth.ftl` and `src/locales/zh-cn/auth.ftl`.
- [x] Move login/register visible strings to Fluent messages.
- [x] Show registration success copy based on email availability.
- [x] Handle login failure with conservative resend-confirmation affordance.
- [x] Submit resend confirmation through the store.
- [x] Preserve existing 2FA toggle behavior.
- [x] Run frontend type-check/lint/build.
- [x] Browser smoke test register and login/resend states.

Note: Task 4 unit coverage verifies the registration capability branches, login resend affordance, and 2FA toggle. Browser smoke confirmed the register page renders through Vite; backend-dependent capability and login API requests could not complete until the backend API is running.

## Task 5: Confirm Email Callback Page

- [x] Add public `confirmEmail` route at `/confirm-email`.
- [x] Create `ConfirmEmailPage.vue`.
- [x] Read `userId`, `code`, and optional `changedEmail` query parameters.
- [x] Show invalid-link state when required parameters are missing.
- [x] Call confirm email store action for valid links.
- [x] Show success state with login navigation.
- [x] Show expired/invalid state with resend path.
- [x] Localize all visible strings.
- [x] Run frontend type-check/lint/build.
- [x] Browser smoke test success and error states.

Note: Task 5 adds focused unit coverage for invalid, success, and failed confirmation states plus route public access. Browser smoke verified invalid-link and backend-error states; success remains covered by mocked unit tests because it requires a live valid confirmation token.

## Task 6: Forgot Password Availability Flow

- [x] Add forgot-password link to login page.
- [x] Add public `forgotPassword` route at `/forgot-password`.
- [x] Create `ForgotPasswordPage.vue`.
- [x] Check email capabilities on page load.
- [x] Disable form when password recovery email is unavailable.
- [x] Submit forgot-password requests through the store when available.
- [x] Show generic anti-enumeration success copy.
- [x] Localize all visible strings.
- [x] Run frontend type-check/lint/build.
- [x] Browser smoke test disabled and submitted states.

Note: Task 6 unit coverage verifies the disabled capability branch, generic submitted branch, recoverable request error, login link, and public route. Browser smoke confirmed the page renders, transitions from loading-disabled to available with the local backend, and shows the generic submitted state after posting a test email.

## Task 7: Reset Password Callback Flow

- [x] Add public `resetPassword` route at `/reset-password`.
- [x] Create `ResetPasswordPage.vue`.
- [x] Read `email` and `resetCode` query parameters.
- [x] Show invalid-link state when required parameters are missing.
- [x] Validate new password and confirmation before submit.
- [x] Submit reset-password request through the store.
- [x] Route to login with success feedback after reset.
- [x] Show recoverable invalid/expired token error with forgot-password link.
- [x] Localize all visible strings.
- [x] Run frontend type-check/lint/build.
- [x] Browser smoke test validation, invalid-link, and success states.

Note: Task 7 unit coverage verifies invalid links, password confirmation validation, successful reset routing, and expired-token recovery. Browser smoke verified invalid-link, validation, and backend invalid-token states; success remains covered by mocked unit tests because it requires a live valid reset token.

## Task 8: Focused Auth Email Test Coverage

- [x] Add Playwright tests for forgot-password disabled state.
- [x] Add Playwright tests for forgot-password generic success.
- [x] Add Playwright tests for reset-password validation and success routing.
- [x] Add Playwright tests for confirm-email success and invalid/error states.
- [x] Mock backend responses; do not depend on Resend delivery.
- [x] Run `bun run test:e2e`.
- [x] Run frontend type-check/lint/build.

Note: Task 8 replaces the starter E2E smoke test with mocked auth email coverage across Chromium, Firefox, and WebKit. Playwright browsers were installed locally with `bunx playwright install` after Firefox/WebKit binaries were missing.

## Task 9: End-to-End Validation And Documentation Pass

- [ ] Run backend `dotnet restore`.
- [ ] Run backend `dotnet build`.
- [ ] Run backend `dotnet format SplitzBackend.sln --verify-no-changes`.
- [ ] Run frontend `bun run type-check`.
- [ ] Run frontend `bun run lint`.
- [ ] Run frontend `bun run build`.
- [ ] Run `bun run test:e2e` if E2E tests were added.
- [ ] Review `git diff` for generated-file scope.
- [ ] Review `git diff` for secret hygiene.
- [ ] Update README or task notes with local email configuration and disabled-mode behavior if needed.
