# Email Confirmation and Password Recovery Todo

Use this checklist with `tasks/plan.md`. Keep tasks vertical and update statuses as work lands.

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
- [ ] Smoke test configured Resend delivery if local credentials are available.

Note: Task 2 automated coverage verifies disabled-mode sender calls do not require a Resend client. Configured Resend delivery was not smoke-tested because no local credentials were provided.

## Task 3: Refresh Frontend API Contract

- [ ] Run updated backend locally with OpenAPI enabled.
- [ ] Regenerate `src/backend/openapi/**/*` from backend OpenAPI.
- [ ] Review generated diff separately from handwritten changes.
- [ ] Add store action for email capabilities.
- [ ] Add store action for confirm email.
- [ ] Add store action for resend confirmation email.
- [ ] Add store action for forgot password.
- [ ] Add store action for reset password.
- [ ] Run `bun run type-check`.
- [ ] Run `bun run lint`.
- [ ] Run `bun run build`.

## Task 4: Registration And Login Confirmation Flow

- [ ] Create synchronized `src/locales/en/auth.ftl` and `src/locales/zh-cn/auth.ftl`.
- [ ] Move login/register visible strings to Fluent messages.
- [ ] Show registration success copy based on email availability.
- [ ] Handle login failure with conservative resend-confirmation affordance.
- [ ] Submit resend confirmation through the store.
- [ ] Preserve existing 2FA toggle behavior.
- [ ] Run frontend type-check/lint/build.
- [ ] Browser smoke test register and login/resend states.

## Task 5: Confirm Email Callback Page

- [ ] Add public `confirmEmail` route at `/confirm-email`.
- [ ] Create `ConfirmEmailPage.vue`.
- [ ] Read `userId`, `code`, and optional `changedEmail` query parameters.
- [ ] Show invalid-link state when required parameters are missing.
- [ ] Call confirm email store action for valid links.
- [ ] Show success state with login navigation.
- [ ] Show expired/invalid state with resend path.
- [ ] Localize all visible strings.
- [ ] Run frontend type-check/lint/build.
- [ ] Browser smoke test success and error states.

## Task 6: Forgot Password Availability Flow

- [ ] Add forgot-password link to login page.
- [ ] Add public `forgotPassword` route at `/forgot-password`.
- [ ] Create `ForgotPasswordPage.vue`.
- [ ] Check email capabilities on page load.
- [ ] Disable form when password recovery email is unavailable.
- [ ] Submit forgot-password requests through the store when available.
- [ ] Show generic anti-enumeration success copy.
- [ ] Localize all visible strings.
- [ ] Run frontend type-check/lint/build.
- [ ] Browser smoke test disabled and submitted states.

## Task 7: Reset Password Callback Flow

- [ ] Add public `resetPassword` route at `/reset-password`.
- [ ] Create `ResetPasswordPage.vue`.
- [ ] Read `email` and `resetCode` query parameters.
- [ ] Show invalid-link state when required parameters are missing.
- [ ] Validate new password and confirmation before submit.
- [ ] Submit reset-password request through the store.
- [ ] Route to login with success feedback after reset.
- [ ] Show recoverable invalid/expired token error with forgot-password link.
- [ ] Localize all visible strings.
- [ ] Run frontend type-check/lint/build.
- [ ] Browser smoke test validation, invalid-link, and success states.

## Task 8: Focused Auth Email Test Coverage

- [ ] Add Playwright tests for forgot-password disabled state.
- [ ] Add Playwright tests for forgot-password generic success.
- [ ] Add Playwright tests for reset-password validation and success routing.
- [ ] Add Playwright tests for confirm-email success and invalid/error states.
- [ ] Mock backend responses; do not depend on Resend delivery.
- [ ] Run `bun run test:e2e`.
- [ ] Run frontend type-check/lint/build.

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
