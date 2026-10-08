<script setup lang="ts">
import { PhEnvelopeSimple, PhLockSimple, PhPaperPlaneTilt, PhShieldCheck } from "@phosphor-icons/vue";
import { useFluent } from "fluent-vue";
import { ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { toast } from "vue-sonner";

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

async function handleLogin() {
  if (loading.value || loginCooldown.isActive.value) {
    return;
  }

  loading.value = true;
  showResendConfirmation.value = false;
  try {
    await userStore.login({
      email: email.value,
      password: password.value,
      twoFactorCode: showTwoFactor.value ? twoFactorCode.value : undefined,
    });
    toast.success($t("auth-login-success"));
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
      toast.error($t("auth-login-failed"));
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
  try {
    await userStore.resendConfirmationEmail(email.value);
    // Keep the response generic so this flow cannot confirm whether an account exists.
    toast.success($t("auth-resend-confirmation-success"));
  } catch (error) {
    console.error(error);
    if (!resendCooldown.startFromError(error)) {
      toast.error($t("auth-resend-confirmation-failed"));
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
  <AuthShell :title="$t('auth-login-title')" :subtitle="$t('auth-login-subtitle')">
    <form class="flex flex-col gap-5" @submit.prevent="handleLogin">
      <TextInput
        id="email-address"
        v-model="email"
        name="email"
        required
        :label="$t('auth-email-label')"
        :placeholder="$t('auth-email-placeholder')"
      >
        <template #icon>
          <PhEnvelopeSimple />
        </template>
      </TextInput>

      <TextInput
        id="password"
        v-model="password"
        name="password"
        type="password"
        autocomplete="current-password"
        required
        :label="$t('auth-password-label')"
        :placeholder="$t('auth-password-placeholder')"
      >
        <template #icon>
          <PhLockSimple />
        </template>
      </TextInput>

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
      >
        <template #icon>
          <PhShieldCheck />
        </template>
      </TextInput>

      <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm font-medium">
        <button
          type="button"
          class="text-base-text-brand hover:text-base-text-brand_hover"
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

      <RateLimitCountdown
        :seconds="loginCooldown.remainingSeconds.value"
        message-key="auth-rate-limit-countdown"
        data-test="login-rate-limit"
      />

      <Notice v-if="showResendConfirmation" tone="info" :title="$t('auth-login-unconfirmed-title')">
        <template #icon>
          <PhPaperPlaneTilt />
        </template>
        <p>{{ $t("auth-login-resend-confirmation") }}</p>
        <RateLimitCountdown
          :seconds="resendCooldown.remainingSeconds.value"
          message-key="auth-rate-limit-countdown"
          class="mt-1"
          data-test="resend-rate-limit"
        />
        <SButton
          color="brand"
          variant="secondary"
          size="md"
          :disabled="resendCooldown.isActive.value"
          :loading="resendLoading"
          class="mt-2 self-start"
          data-test="resend-confirmation"
          @click="handleResendConfirmation"
        >
          {{ $t("auth-resend-confirmation-action") }}
        </SButton>
      </Notice>

      <SButton
        type="submit"
        color="brand"
        variant="primary"
        size="xxl"
        :disabled="loginCooldown.isActive.value"
        :loading="loading"
        class="w-full"
        data-test="login-submit"
      >
        {{ $t("auth-sign-in-action") }}
      </SButton>
    </form>

    <template #footer>
      <RouterLink :to="{ name: 'register' }" class="text-base-text-brand hover:text-base-text-brand_hover">
        {{ $t("auth-login-register-link") }}
      </RouterLink>
    </template>
  </AuthShell>
</template>
