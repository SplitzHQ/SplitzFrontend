<script setup lang="ts">
import { PhPaperPlaneTilt } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { computed, ref } from "vue";
import { useRouter, RouterLink } from "vue-router";

import { ResponseError, type ProblemDetails } from "@/backend/openapi";
import AuthShell from "@/components/AuthShell/AuthShell.vue";
import Notice from "@/components/Notice/Notice.vue";
import RateLimitCountdown from "@/components/RateLimitCountdown/RateLimitCountdown.vue";
import SButton from "@/components/SButton/SButton.vue";
import TextInput from "@/components/TextInput/TextInput.vue";
import { useRateLimitCooldown } from "@/libs/use-rate-limit-cooldown";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const userStore = useUserStore();
const { $t } = useFluent();

const email = ref("");
const password = ref("");
const twoFactorCode = ref("");
const showTwoFactor = ref(false);
const showResendConfirmation = ref(false);
const loading = ref(false);
const resendLoading = ref(false);
const loginCooldown = useRateLimitCooldown();
const resendCooldown = useRateLimitCooldown();
const loginFailed = ref(false);
/** The result of the last resend. Null means that the user has not sent the email again. */
const resendResult = ref<"sent" | "failed" | null>(null);

const RESEND_MESSAGE_KEYS = {
  failed: "auth-resend-confirmation-failed",
  sent: "auth-resend-confirmation-success",
};
const resendMessageKey = computed(() =>
  resendResult.value ? RESEND_MESSAGE_KEYS[resendResult.value] : "auth-login-resend-confirmation"
);

async function handleLogin() {
  if (loading.value || loginCooldown.isActive.value) {
    return;
  }

  loading.value = true;
  showResendConfirmation.value = false;
  loginFailed.value = false;
  resendResult.value = null;
  try {
    await userStore.login({
      email: email.value,
      password: password.value,
      twoFactorCode: showTwoFactor.value ? twoFactorCode.value : undefined,
    });
    await router.push("/");
  } catch (error) {
    console.error(error);
    if (loginCooldown.startFromError(error)) {
      return;
    }

    if (email.value.trim().length > 0 && (await isIdentityNotAllowedError(error))) {
      // user account is not confirmed, allow them to resend confirmation email
      showResendConfirmation.value = true;
    } else {
      loginFailed.value = true;
    }
  } finally {
    loading.value = false;
  }
}

async function handleResendConfirmation() {
  if (resendLoading.value || resendCooldown.isActive.value) {
    return;
  }

  resendLoading.value = true;
  resendResult.value = null;
  try {
    await userStore.resendConfirmationEmail(email.value);
    // Keep the response generic so this flow cannot confirm whether an account exists.
    resendResult.value = "sent";
  } catch (error) {
    console.error(error);
    if (!resendCooldown.startFromError(error)) {
      resendResult.value = "failed";
    }
  } finally {
    resendLoading.value = false;
  }
}

async function isIdentityNotAllowedError(error: unknown): Promise<boolean> {
  if (!(error instanceof ResponseError)) {
    return false;
  }

  try {
    const body = (await error.response.clone().json()) as ProblemDetails;
    return body.detail === "NotAllowed";
  } catch {
    return false;
  }
}
</script>

<template>
  <AuthShell :title="$t('auth-login-title')" @submit="handleLogin">
    <TextInput
      id="email-address"
      v-model="email"
      name="email"
      type="email"
      autocomplete="email"
      inputmode="email"
      required
      :label="$t('auth-email-label')"
      :placeholder="$t('auth-email-placeholder')"
    />

    <TextInput
      id="password"
      v-model="password"
      name="password"
      type="password"
      autocomplete="current-password"
      required
      :label="$t('auth-password-label')"
      placeholder=""
    />

    <TextInput
      v-if="showTwoFactor"
      id="2fa-code"
      v-model="twoFactorCode"
      name="2fa-code"
      type="text"
      autocomplete="one-time-code"
      inputmode="numeric"
      :label="$t('auth-two-factor-label')"
      :placeholder="$t('auth-two-factor-placeholder')"
    />

    <RateLimitCountdown
      class="px-3.25"
      :seconds="loginCooldown.remainingSeconds.value"
      message-key="auth-rate-limit-countdown"
      data-test="login-rate-limit"
    />

    <Notice v-if="loginFailed" tone="error" announce data-test="login-error">
      <p>{{ $t("auth-login-failed") }}</p>
    </Notice>

    <Notice v-if="showResendConfirmation" tone="info" :title="$t('auth-login-unconfirmed-title')" announce>
      <template #icon>
        <PhPaperPlaneTilt />
      </template>
      <div class="flex flex-col gap-2">
        <p>{{ $t(resendMessageKey) }}</p>
        <RateLimitCountdown
          :seconds="resendCooldown.remainingSeconds.value"
          message-key="auth-rate-limit-countdown"
          data-test="resend-rate-limit"
        />
      </div>
      <template #action>
        <SButton
          variant="outline"
          size="sm"
          :disabled="resendCooldown.isActive.value"
          :loading="resendLoading"
          data-test="resend-confirmation"
          @click="handleResendConfirmation"
        >
          {{ $t("auth-resend-confirmation-action") }}
        </SButton>
      </template>
    </Notice>

    <template #actions>
      <SButton
        type="submit"
        variant="primary"
        size="xl"
        :disabled="loginCooldown.isActive.value"
        :loading="loading"
        class="w-full"
        data-test="login-submit"
      >
        {{ $t("auth-sign-in-action") }}
      </SButton>

      <!-- An invisible box around each action makes the tap area 44px high. The gaps around the row hold the box. -->
      <div
        class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3.25 text-sm font-medium *:relative *:after:absolute *:after:top-1/2 *:after:left-0 *:after:h-11 *:after:w-full *:after:-translate-y-1/2"
      >
        <button
          type="button"
          class="text-base-text-tertiary hover:text-base-text-secondary"
          data-test="toggle-two-factor"
          @click="showTwoFactor = !showTwoFactor"
        >
          {{ showTwoFactor ? $t("auth-hide-two-factor") : $t("auth-show-two-factor") }}
        </button>
        <RouterLink
          :to="{ name: 'forgotPassword' }"
          class="text-base-text-brand hover:text-base-text-brand_hover"
          data-test="forgot-password-link"
        >
          {{ $t("auth-forgot-password-link") }}
        </RouterLink>
      </div>
    </template>

    <template #footer>
      <RouterLink :to="{ name: 'register' }" class="flex gap-1 text-base-text-brand hover:text-base-text-brand_hover">
        <span class="font-normal text-base-text-tertiary">{{ $t("auth-login-register-lead") }}</span>
        {{ $t("auth-login-register-link") }}
      </RouterLink>
    </template>
  </AuthShell>
</template>
