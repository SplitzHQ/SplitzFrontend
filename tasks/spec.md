# Email Confirmation and Password Recovery Spec

## Objective

Implement transactional email support across SplitzBackend and SplitzFrontend so users can confirm their email address after registration and recover forgotten passwords.

Success means:

- New registrations can receive a confirmation email when email sending is configured.
- Users must confirm their email before they can sign in.
- Users can request a password recovery email and reset their password through frontend pages.
- Email sending is optional by configuration:
  - If no Resend API key is configured, registration still succeeds and confirmation email sending is skipped.
  - If no Resend API key is configured, password reset is treated as unavailable and the frontend presents a disabled/unavailable recovery experience.
- Email links point to frontend routes, not raw backend Identity endpoints.
- Secrets such as the Resend API key are never committed.

Target users are normal Splitz account holders who register with email/password and need trustworthy account verification and recovery flows.

## Current Context

### Backend

SplitzBackend uses ASP.NET Core Identity minimal APIs:

- `AddIdentityApiEndpoints<SplitzUser>(...)` in `src/Program.cs`
- `app.MapGroup("/account").MapIdentityApi<SplitzUser>();`

The existing Identity endpoint set already includes:

- `POST /account/register`
- `GET /account/confirmEmail`
- `POST /account/resendConfirmationEmail`
- `POST /account/forgotPassword`
- `POST /account/resetPassword`

No database migration is expected for the core feature because ASP.NET Identity already stores `EmailConfirmed` and password reset token data in the existing Identity schema.

### Frontend

SplitzFrontend already has generated OpenAPI client methods for the relevant Identity endpoints in `src/backend/openapi/apis/SplitzBackendApi.ts`:

- `accountForgotPasswordPost`
- `accountResetPasswordPost`
- `accountResendConfirmationEmailPost`
- `mapIdentityApiAccountConfirmEmail`

Existing auth UI lives mainly in:

- `src/pages/LoginPage/LoginPage.vue`
- `src/pages/RegisterPage/RegisterPage.vue`
- `src/stores/user.ts`
- `src/router/index.ts`

Generated OpenAPI files under `src/backend/openapi/**/*` must not be edited manually.

## Tech Stack

### Backend

- ASP.NET Core / Identity minimal APIs
- C# with nullable reference types
- Entity Framework Core with SQLite
- Resend official .NET SDK for transactional email
- Options pattern and dependency injection for configuration

### Frontend

- Vue 3 Composition API
- TypeScript
- Vite
- Bun package manager/runtime
- Generated OpenAPI client
- Vue Router
- Fluent i18n files under `src/locales/en` and `src/locales/zh-cn`
- Existing `SButton`, raw auth form styling, and `vue-sonner` toast patterns

## Packages and Dependencies

### Backend Additions

Install the official Resend .NET SDK package in SplitzBackend.

Rationale:

- The official Resend documentation supports ASP.NET Core dependency injection through `AddResend`.
- The SDK exposes `IResend` and `EmailSendAsync`, reducing hand-written HTTP request code.
- The package cleanly supports API-token configuration through environment variables or app configuration.

Configuration should read the API key from configuration, with environment variables or user secrets preferred. Suggested key names:

- `Email:Provider = Resend`
- `Email:Enabled = true|false`
- `Email:ApiKey`
- `Email:FromEmail`
- `Email:FromName`
- `Email:FrontendBaseUrl`
- `Email:ConfirmEmailPath = /confirm-email`
- `Email:ResetPasswordPath = /reset-password`

Do not commit the actual Resend API key.

### Frontend Additions

No new frontend package is expected. Use existing Vue, Router, store, OpenAPI client, and component patterns.

## Design Patterns and Local Idioms

### Backend

Use the Options pattern for email configuration.

- Stable parts: configuration shape, sender identity, frontend base URL, enabled/disabled behavior.
- Varying parts: provider implementation, email templates, future localization.
- Local participants: new `EmailOptions`, new Identity email sender implementation, `Program.cs` service registration.

Use ASP.NET Core Identity's `IEmailSender<SplitzUser>` integration instead of replacing existing Identity endpoints.

- This keeps endpoint shapes stable and avoids duplicating token generation logic.
- Implement the methods Identity expects:
  - confirmation link email
  - password reset link email
  - password reset code email

Use a provider/service boundary around Resend.

- Recommended shape: `ResendIdentityEmailSender : IEmailSender<SplitzUser>` using `IResend`, `IOptions<EmailOptions>`, and `ILogger`.
- The sender should build frontend URLs from configured paths when Identity supplies backend links or reset codes.
- Log delivery attempts and disabled behavior without logging tokens or API keys.

Use explicit disabled behavior.

- Registration confirmation: when email is disabled or missing API key, skip sending and log an informational message.
- Password reset: when email is disabled or missing API key, return a clear disabled response through a small custom capability endpoint or a controlled frontend configuration path.

Open design note: ASP.NET Identity's built-in forgot-password endpoint may call `IEmailSender<SplitzUser>`. If the sender silently no-ops, the endpoint can appear successful. Because the requirement says password reset should be disabled, add a backend capability endpoint such as `GET /account/email-capabilities` returning whether email service is available. The frontend uses this to disable the forgot-password flow. Avoid changing generated Identity endpoint contracts unless necessary.

### Frontend

Use existing route/page/store patterns.

- Add public routes for confirm email, forgot password, and reset password.
- Add store actions that wrap generated client calls instead of calling the generated API directly from pages.
- Keep auth pages unauthenticated and include them in `publicRoutes`.

Use frontend callback pages for all email links.

- Confirmation email link lands at `/confirm-email?...`.
- Reset password link lands at `/reset-password?...`.

Parameter names can be the same as backend.

Use i18n for new user-facing strings.

- Add Fluent keys for English and Chinese.
- If any touched pages are not using i18n, update them to use i18n.

## Project Structure

### Backend Files

Expected files to modify or add:

```text
SplitzBackend/
  SplitzBackend.csproj                 -> add Resend package reference
  appsettings.json                     -> add non-secret Email config shape
  src/Program.cs                       -> configure Identity confirmed email and email services
  src/Services/EmailOptions.cs         -> typed email options
  src/Services/ResendIdentityEmailSender.cs
  src/Services/DisabledEmailSender.cs  -> optional separate no-op sender if cleaner
  src/Controllers/AccountController.cs -> optional auth capabilities endpoint
```

No migration is expected unless new persisted email audit data is added, which is out of scope.

### Frontend Files

Expected files to modify or add:

```text
SplitzFrontend/
  src/router/index.ts
  src/stores/user.ts
  src/pages/LoginPage/LoginPage.vue
  src/pages/RegisterPage/RegisterPage.vue
  src/pages/ForgotPasswordPage/ForgotPasswordPage.vue
  src/pages/ResetPasswordPage/ResetPasswordPage.vue
  src/pages/ConfirmEmailPage/ConfirmEmailPage.vue
  src/locales/en/auth.ftl
  src/locales/zh-cn/auth.ftl
  e2e/auth-email.spec.ts               -> optional focused E2E tests
```

Do not manually edit:

```text
SplitzFrontend/src/backend/openapi/**/*
```

If a new backend capability endpoint is added and frontend needs a generated typed client method, regenerate the OpenAPI client through the repository's established generation workflow instead of editing generated files by hand.

## Functional Requirements

### Registration and Confirmation

1. User registers from the existing frontend registration page.
2. Backend creates the account through existing Identity minimal API behavior.
3. If Resend is configured, backend sends a confirmation email.
4. If Resend is not configured, backend logs that confirmation was skipped and registration still succeeds.
5. Frontend registration success state tells the user to check email when email is enabled, or tells them registration completed but email confirmation is unavailable in this environment when disabled.
6. User clicks confirmation link and lands on frontend `/confirm-email`.
7. Frontend calls backend `GET /account/confirmEmail` through the generated client.
8. Frontend shows success, expired/invalid link, and retry/resend states.
9. Backend requires confirmed email before login.
10. Login page should handle unconfirmed-email failures by offering resend confirmation.

### Resend Confirmation Email

1. User can request a new confirmation email by entering their email address or from a login failure state.
2. If email is enabled, frontend calls `POST /account/resendConfirmationEmail`.
3. The user sees a generic success message that does not reveal whether the email belongs to an account.
4. If email is disabled, frontend explains that confirmation email sending is unavailable.

### Forgot Password

1. Login page includes a forgot-password link.
2. Forgot-password page checks whether email/password reset is available.
3. If unavailable, the form is disabled and the page explains recovery email is not configured.
4. If available, user submits email.
5. Frontend calls `POST /account/forgotPassword`.
6. User sees a generic success message that does not reveal whether the email belongs to an account.
7. Backend sends a Resend email containing a frontend reset link.

### Reset Password

1. User opens frontend `/reset-password` from email link.
2. Page reads `email` and `resetCode` query parameters.
3. User enters and confirms a new password.
4. Frontend calls `POST /account/resetPassword` with `email`, `resetCode`, and `newPassword`.
5. Success returns the user to login with a clear success message.
6. Invalid or expired token shows a recoverable error and a link back to forgot password.

## Non-Functional Requirements

- Never log Resend API keys, raw confirmation tokens, raw password reset tokens, or full email links containing tokens.
- Use generic user-facing messages for forgot password and resend confirmation to reduce account enumeration risk.
- Use configuration validation so production can fail fast when `Email:Enabled=true` but required fields are missing.
- Keep disabled local development behavior smooth.
- Keep generated OpenAPI files untouched unless regenerated.
- Use Bun for all frontend commands.
- Use `dotnet restore`, `dotnet build`, and `dotnet format SplitzBackend.sln --verify-no-changes` for backend validation.

## Testing Strategy

### Backend

Minimum validation:

```bash
dotnet restore
dotnet build
dotnet format SplitzBackend.sln --verify-no-changes
```

Recommended automated tests if a backend test project is introduced:

- Email options validation for enabled/missing fields.
- Disabled email sender skips confirmation without throwing.
- Password reset availability reports false when API key is missing.
- Resend sender maps confirmation and reset messages correctly without logging secrets.

Because the backend currently has no test project, adding tests may require creating one. That should be confirmed before implementation if time/scope matters.

### Frontend

Minimum validation:

```bash
bun run type-check
bun run lint
bun run build
```

Recommended tests:

- Unit tests for store actions if existing mocking patterns are adequate.
- E2E tests for:
  - forgot password disabled state
  - forgot password request success with mocked backend
  - reset password form validation and success
  - confirm email success/error states

If E2E tests are added, use Playwright patterns from the repository and avoid depending on actual Resend delivery.
